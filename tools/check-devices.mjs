// Проверка сайта на всех устройствах одной командой.
//
//   node tools/check-devices.mjs <адрес сайта или папка dist> [--out <папка>] [--only phone,tablet,desktop]
//
// Примеры:
//   node tools/check-devices.mjs templates/landing/dist --out /tmp/check_tenkeys
//   node tools/check-devices.mjs http://127.0.0.1:4321 --out /tmp/check
//
// Что делает на каждом профиле (телефоны, телефоны на боку, планшеты, ноутбуки, большие экраны):
//   - открывает страницу, проматывает до конца и обратно (чтобы сработали ленивые картинки и появления)
//   - ищет горизонтальную прокрутку страницы
//   - ищет блоки, которые вылезают за край экрана, и текст, который вылезает из своего блока
//   - собирает ошибки консоли, ошибки скриптов, битые картинки и запросы с ошибкой
//   - на сенсорных профилях считает слишком мелкие кнопки и ссылки (меньше 32 px)
//   - снимает первый экран и всю страницу
// В конце собирает report.html и contact-sheet.png: первые экраны всех профилей на одном листе и список замечаний.
// Код выхода 1, если есть ошибки (прокрутка вбок, вылезающий текст, ошибки консоли, битые картинки).
//
// Нужен playwright (npm i -g playwright или npx playwright install chromium). Настоящий Safari здесь не проверяется:
// профили iPhone и iPad открываются в Chromium с размерами и касаниями iPhone. Финальная проверка iPhone — на телефоне.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let pw;
for (const p of ['playwright', '/opt/npm-tools/node_modules/playwright']) {
  try { pw = require(p); break; } catch {}
}
if (!pw) { console.error('Нет playwright: npm i -g playwright && npx playwright install chromium'); process.exit(2); }

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--out' && args[args.indexOf(a) - 1] !== '--only');
const outDir = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'device-check');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
if (!target) { console.error('Укажите адрес сайта или папку dist'); process.exit(2); }

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';
const ATAB = 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const touch = (ua, dpr) => ({ userAgent: ua, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
const PROFILES = [
  { id: 'iphone-se', group: 'phone', name: 'iPhone SE', viewport: { width: 375, height: 667 }, ...touch(IOS, 2) },
  { id: 'iphone-15', group: 'phone', name: 'iPhone 15', viewport: { width: 393, height: 852 }, ...touch(IOS, 3) },
  { id: 'iphone-15-land', group: 'phone', name: 'iPhone 15 на боку', viewport: { width: 852, height: 393 }, ...touch(IOS, 3) },
  { id: 'android-small', group: 'phone', name: 'Android 360', viewport: { width: 360, height: 780 }, ...touch(ANDROID, 3) },
  { id: 'android', group: 'phone', name: 'Android Pixel', viewport: { width: 412, height: 915 }, ...touch(ANDROID, 2.6) },
  { id: 'android-land', group: 'phone', name: 'Android на боку', viewport: { width: 915, height: 412 }, ...touch(ANDROID, 2.6) },
  { id: 'ipad', group: 'tablet', name: 'iPad', viewport: { width: 820, height: 1180 }, ...touch(IPAD, 2) },
  { id: 'ipad-land', group: 'tablet', name: 'iPad на боку', viewport: { width: 1180, height: 820 }, ...touch(IPAD, 2) },
  { id: 'android-tab', group: 'tablet', name: 'Android-планшет', viewport: { width: 800, height: 1280 }, ...touch(ATAB, 2) },
  { id: 'laptop-1024', group: 'desktop', name: 'Ноутбук 1024', viewport: { width: 1024, height: 768 } },
  { id: 'windows-1366', group: 'desktop', name: 'Windows 1366', viewport: { width: 1366, height: 768 } },
  { id: 'mac-1440', group: 'desktop', name: 'Mac 1440', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  { id: 'windows-1920', group: 'desktop', name: 'Windows 1920', viewport: { width: 1920, height: 1080 } },
].filter((p) => !only || only.includes(p.group) || only.includes(p.id));

// Папку dist отдаём своим маленьким сервером
let server;
let url = target;
if (!/^https?:\/\//.test(target)) {
  const root = path.resolve(target);
  if (!fs.existsSync(path.join(root, 'index.html'))) { console.error(`В ${root} нет index.html`); process.exit(2); }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain' };
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(root, p);
    if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/`;
}

fs.mkdirSync(outDir, { recursive: true });
let browser;
try { browser = await pw.chromium.launch(); } catch { browser = await pw.chromium.launch({ channel: 'chrome' }); }

// Что ищем на странице (выполняется в браузере)
function inspect() {
  const vw = document.documentElement.clientWidth;
  const res = { pageWidth: document.scrollingElement.scrollWidth, vw, offscreen: [], textOverflow: [], brokenImages: [], smallTargets: 0, smallExamples: [] };
  const name = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = [...el.classList].slice(0, 2).join('.');
    if (cls) s += '.' + cls;
    const t = (el.innerText || el.alt || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return t ? `${s} «${t}»` : s;
  };
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.clipPath !== 'none') return true;
      if (cs.position === 'fixed') return false;
    }
    return false;
  };
  const visible = (el, cs) => cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if ((r.right > vw + 1 || r.left < -1) && cs.position !== 'fixed' && !clipped(el) && res.offscreen.length < 15) {
      res.offscreen.push(`${name(el)}: ${Math.round(r.left)}..${Math.round(r.right)} при ширине ${vw}`);
    }
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && cs.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && cs.display !== 'inline' && res.textOverflow.length < 15) {
      res.textOverflow.push(`${name(el)}: текст ${el.scrollWidth} px в блоке ${el.clientWidth} px`);
    }
    if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0 && el.getAttribute('src')) res.brokenImages.push(el.getAttribute('src'));
    if ((el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && (r.width < 32 || r.height < 32) && r.width * r.height > 0) {
      res.smallTargets += 1;
      if (res.smallExamples.length < 5) res.smallExamples.push(`${name(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  return res;
}

const results = [];
for (const prof of PROFILES) {
  const { id, name, group, ...opts } = prof;
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const log = { console: [], pageErrors: [], failed: [] };
  page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message || e).slice(0, 200)));
  page.on('response', (r) => { if (r.status() >= 400) log.failed.push(`${r.status()} ${r.url().slice(0, 140)}`); });
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  } catch (e) {
    results.push({ id, name, group, fatal: `страница не открылась: ${e.message.slice(0, 160)}` });
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `${id}_first.png`) });
  // промотать страницу экранами, чтобы сработали появления и ленивые картинки
  const h = await page.evaluate(() => document.scrollingElement.scrollHeight);
  const step = opts.viewport.height * 0.8;
  for (let y = 0; y < h; y += step) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  const found = await page.evaluate(inspect);
  try {
    await page.screenshot({ path: path.join(outDir, `${id}_full.png`), fullPage: true, timeout: 30000 });
  } catch {}
  results.push({ id, name, group, ...found, ...log, height: h });
  await ctx.close();
}
await browser.close();
if (server) server.close();

// Итог
const problems = (r) => {
  if (r.fatal) return [r.fatal];
  const p = [];
  if (r.pageWidth > r.vw + 1) p.push(`страница шире экрана: ${r.pageWidth} px при ${r.vw} px (прокрутка вбок)`);
  for (const x of r.offscreen) p.push(`за краем экрана: ${x}`);
  for (const x of r.textOverflow) p.push(`текст вылезает: ${x}`);
  for (const x of r.brokenImages) p.push(`битая картинка: ${x}`);
  for (const x of r.pageErrors) p.push(`ошибка скрипта: ${x}`);
  for (const x of r.console) p.push(`ошибка в консоли: ${x}`);
  for (const x of r.failed) p.push(`запрос с ошибкой: ${x}`);
  return p;
};
const notes = (r) => (r.smallTargets ? [`мелких кнопок и ссылок (меньше 32 px): ${r.smallTargets}, например ${r.smallExamples.join('; ')}`] : []);
let errors = 0;
for (const r of results) {
  const p = problems(r);
  errors += p.length;
  console.log(`\n== ${r.name} (${r.vw || ''} px)  ${p.length ? 'замечаний: ' + p.length : 'чисто'}`);
  for (const x of p) console.log('  - ' + x);
  for (const x of r.fatal ? [] : notes(r)) console.log('  · ' + x);
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const html = `<!doctype html><meta charset="utf-8"><title>Проверка устройств</title>
<style>body{font:14px system-ui;margin:20px;background:#f4f4f4;color:#111}h1{font-size:20px}.grid{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
.c{background:#fff;padding:8px;border-radius:8px;box-shadow:0 1px 3px #0002;max-width:420px}.c img{display:block;max-width:400px;max-height:420px;border:1px solid #ddd}
.ok{color:#18794e}.bad{color:#c4302b}ul{margin:6px 0 0 18px;padding:0}li{margin:2px 0}</style>
<h1>Проверка устройств: ${esc(url)} — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</h1>
<div class="grid">${results.map((r) => {
  const p = problems(r);
  return `<div class="c"><b>${esc(r.name)}</b> <span class="${p.length ? 'bad' : 'ok'}">${p.length ? 'замечаний: ' + p.length : 'чисто'}</span>
${r.fatal ? '' : `<img src="${r.id}_first.png">`}
<ul>${p.slice(0, 8).map((x) => `<li class="bad">${esc(x)}</li>`).join('')}${(r.fatal ? [] : notes(r)).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
}).join('')}</div>`;
fs.writeFileSync(path.join(outDir, 'report.html'), html);
const b2 = await pw.chromium.launch().catch(() => pw.chromium.launch({ channel: 'chrome' }));
const pg = await b2.newPage({ viewport: { width: 1800, height: 1000 } });
await pg.goto('file://' + path.join(outDir, 'report.html'));
await pg.waitForTimeout(300);
await pg.screenshot({ path: path.join(outDir, 'contact-sheet.png'), fullPage: true });
await b2.close();
console.log(`\nОтчёт: ${path.join(outDir, 'report.html')}\nЛист снимков: ${path.join(outDir, 'contact-sheet.png')}`);
console.log(errors ? `\nИтого замечаний: ${errors}` : '\nЗамечаний нет');
process.exit(errors ? 1 : 0);
