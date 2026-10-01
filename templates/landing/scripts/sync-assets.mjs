// Copies the selected project's brand folder into public/project/
// so the site can serve its images. Project = env PROJECT (default: molty).
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

fs.rmSync(dest, { recursive: true, force: true });
if (fs.existsSync(brandDir)) {
  fs.cpSync(brandDir, dest, {
    recursive: true,
    filter: (p) => !p.split(path.sep).includes('docs'),
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

// Warn about images referenced in the config but missing on disk
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const refs = new Set();
const walk = (v, key = '') => {
  if (typeof v === 'string' && /\.(png|jpe?g|webp|gif|svg)$/i.test(v)) refs.add(v);
  else if (Array.isArray(v)) v.forEach((x) => walk(x));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
};
walk(config);
const missing = [...refs].filter((r) => !fs.existsSync(path.join(dest, r.toLowerCase())));

console.log(`✔ Проект: ${project} — картинки скопированы в public/project/`);
if (missing.length) {
  console.warn(`⚠ Не найдены файлы (проверь имена в brand/ и в конфиге):`);
  missing.forEach((m) => console.warn(`   - ${m}`));
}
