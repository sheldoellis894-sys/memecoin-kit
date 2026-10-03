// Copies the selected project's brand folder into public/project/
// so the site can serve its images. Project = env PROJECT (default: molty).
//
// Not copied: the docs/ folder and source files named *_raw.* (pictures with a background, before cleanup).
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
    filter: (p) => !p.split(path.sep).includes('docs') && !isRaw(p),
  });
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
