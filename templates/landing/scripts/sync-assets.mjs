// Copies the selected project's brand folder into public/project/
// so the site can serve its images. Project = env PROJECT (default: molty).
//
// Not copied: the docs/ and figma/ folders, *.fig files and source files named *_raw.* (pictures with a background, before cleanup).
// Optional: "images": { "optimize": true } in project.config.json shrinks and recompresses big pictures
// on the way (originals in brand/ are never touched). Size limits per folder: "images.maxSize".
import fs from 'node:fs';
import path from 'node:path';

const project = process.env.PROJECT || 'molty';
const projectDir = path.resolve('../../projects', project);
const brandDir = path.join(projectDir, 'brand');
const configFile = path.join(projectDir, 'project.config.json');
const dest = path.resolve('public/project');

if (!fs.existsSync(configFile)) {
  console.error(`\n✖ Не найден ${configFile}\n  Проверь имя проекта: PROJECT=${project}\n`);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const isRaw = (p) => /_raw\.[a-z0-9]+$/i.test(p);
fs.rmSync(dest, { recursive: true, force: true });
if (fs.existsSync(brandDir)) {
  fs.cpSync(brandDir, dest, {
    recursive: true,
    // not copied: docs, pictures before cleanup and Figma sources (the brand kit, not the site)
    filter: (p) => { const parts = p.split(path.sep); return !parts.includes('docs') && !parts.includes('figma') && !isRaw(p) && !/\.fig$/i.test(p); },
  });
}

// Fonts kept on the site itself: the theme lists them in "fonts.local" (files in src/fonts/); they go to public/project/fonts/
{
  let theme = {};
  try { theme = JSON.parse(fs.readFileSync(path.resolve('src/themes', `${config.theme || 'mine'}.json`), 'utf8')); } catch { /* the build reports it */ }
  const local = Array.isArray(theme.fonts?.local) ? theme.fonts.local : [];
  for (const f of local) {
    const file = String(f?.file || '');
    if (!/^[a-z0-9-]+\.woff2$/.test(file)) continue;
    const src = path.resolve('src/fonts', file);
    if (!fs.existsSync(src)) { console.error(`\n✖ Нет файла шрифта src/fonts/${file} (тема ${config.theme})\n`); process.exit(1); }
    fs.mkdirSync(path.join(dest, 'fonts'), { recursive: true });
    fs.copyFileSync(src, path.join(dest, 'fonts', file));
  }
}

// Normalize every copied file/folder name to lowercase: the dev server is case-sensitive,
// so "molty_banner.JPG" would not match "molty_banner.jpg" in the config.
const lowerAll = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    let full = path.join(dir, name);
    const lower = name.toLowerCase();
    if (lower !== name) {
      const tmp = path.join(dir, `__tmp_${Date.now()}_${lower}`);
      fs.renameSync(full, tmp); // two-step rename: Windows ignores case-only renames
      full = path.join(dir, lower);
      fs.renameSync(tmp, full);
    }
    if (fs.statSync(full).isDirectory()) lowerAll(full);
  }
};
if (fs.existsSync(dest)) lowerAll(dest);

// Optional image optimization (only the copies in public/project/ are changed)
const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? listFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const mb = (n) => (n / 1048576).toFixed(1);

if (config.images?.optimize && fs.existsSync(dest)) {
  let sharp;
  try { sharp = (await import('sharp')).default; } catch {
    console.warn('⚠ Сжатие картинок пропущено: не найден пакет sharp. Выполни npm install.');
  }
  if (sharp) {
    const limits = { default: 1600, ...config.images.maxSize };
    let before = 0, after = 0, changed = 0;
    for (const file of listFiles(dest)) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
      const folder = path.relative(dest, file).split(path.sep)[0];
      const max = limits[folder] ?? limits.default;
      const input = fs.readFileSync(file);
      before += input.length;
      const meta = await sharp(input).metadata();
      let img = sharp(input).rotate();
      const tooBig = Math.max(meta.width || 0, meta.height || 0) > max;
      if (tooBig) img = img.resize({ width: max, height: max, fit: 'inside' });
      if (ext === '.png') img = img.png({ compressionLevel: 9 });
      else if (ext === '.webp') img = img.webp({ quality: 82 });
      else img = img.jpeg({ quality: 82, mozjpeg: true });
      const output = await img.toBuffer();
      // Keep the copy as is when recompression does not help
      if (tooBig || output.length < input.length * 0.9) { fs.writeFileSync(file, output); after += output.length; changed++; }
      else after += input.length;
    }
    console.log(`✔ Картинки сжаты: ${changed} шт., ${mb(before)} МБ → ${mb(after)} МБ`);
    // "images": { "webp": true }: a WebP copy next to every picture of the site (src/lib/project.ts asset() serves it);
    // the originals stay for the link preview and the tab icon. Brand-kit folders are not touched
    if (config.images.webp) {
      let n = 0, wb = 0;
      for (const file of listFiles(dest)) {
        const rel = path.relative(dest, file).split(path.sep).join('/');
        if (!/\.(png|jpe?g)$/i.test(rel) || /^(exports|figma|references|video|fonts)\//.test(rel)) continue;
        const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
        const buf = await sharp(fs.readFileSync(file)).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer();
        fs.writeFileSync(out, buf); n++; wb += buf.length;
      }
      // a 640 px copy of the bigger pictures, for small screens (src/lib/project.ts srcsetOf()); sizes go to .astro/
      const sizes = {};
      for (const file of listFiles(dest)) {
        const rel = path.relative(dest, file).split(path.sep).join('/');
        if (!rel.endsWith('.webp') || rel.endsWith('.w640.webp') || /^(exports|figma|references|video|fonts)\//.test(rel)) continue;
        const meta = await sharp(fs.readFileSync(file)).metadata();
        sizes[rel] = meta.width;
        if ((meta.width || 0) > 760) {
          const small = await sharp(fs.readFileSync(file)).resize({ width: 640 }).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer();
          fs.writeFileSync(file.replace(/\.webp$/, '.w640.webp'), small); wb += small.length;
        }
      }
      fs.mkdirSync(path.resolve('.astro'), { recursive: true });
      fs.writeFileSync(path.resolve('.astro/webp-sizes.json'), JSON.stringify(sizes));
      console.log(`✔ WebP: ${n} шт., ${mb(wb)} МБ`);
      // a small copy of the tab icon (the original logo is often a big picture)
      const icon = String(config.assets?.favicon || config.assets?.logo || '').toLowerCase();
      if (/\.(png|jpe?g)$/.test(icon) && fs.existsSync(path.join(dest, icon))) {
        await sharp(fs.readFileSync(path.join(dest, icon))).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(path.join(dest, icon.replace(/\.(png|jpe?g)$/, '.icon.png')));
      }
    }
  }
}

// Warn about images referenced in the config but missing on disk
const refs = new Set();
const walk = (v) => {
  if (typeof v === 'string' && /\.(png|jpe?g|webp|gif|svg)$/i.test(v)) refs.add(v);
  else if (Array.isArray(v)) v.forEach((x) => walk(x));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x));
};
walk(config);
const missing = [...refs].filter((r) => !fs.existsSync(path.join(dest, r.toLowerCase())));

console.log(`✔ Проект: ${project} — картинки скопированы в public/project/`);
if (missing.length) {
  console.warn(`⚠ Не найдены файлы (проверь имена в brand/ и в конфиге):`);
  missing.forEach((m) => console.warn(`   - ${m}`));
}
