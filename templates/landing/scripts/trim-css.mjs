// After the build: takes out of the page stylesheet the rules of the other page layouts of this template, which the built
// site never uses. global.css holds the styles of every layout (vault, paper, app, press, wheel…), so a site built with one
// layout ships the rest as dead weight; on a phone the browser still has to read all of it before it draws the page.
//
// The rule is careful: a selector is dropped only when it names a class whose whole family is absent from the built site.
// The family of ".vk-card" is "vk-": if no page and no script of dist/ contains "vk-" at all, nothing can ever put such a
// class on the page, not even a script that glues class names together. Families that appear anywhere stay whole.
// Keyframes, fonts and the rest of the at-rules are left as they are. Run: node scripts/trim-css.mjs [dist]
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } };
if (!fs.existsSync(dist)) { console.log('trim-css: no dist folder, nothing to do'); process.exit(0); }
walk(dist);
const text = files.filter((f) => /\.(html|js|mjs)$/.test(f)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

const familyOf = (cls) => { const i = cls.indexOf('-', 1); return i > 0 ? cls.slice(0, i + 1) : null; };
const seen = new Map();
const unusedClass = (cls) => {
  const fam = familyOf(cls);
  if (!fam) return false;                 // a class without a family (".hidden") is never dropped
  if (!seen.has(fam)) seen.set(fam, !text.includes(fam));
  return seen.get(fam);
};
const deadSelector = (sel) => { for (const m of sel.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) if (unusedClass(m[1])) return true; return false; };

// split a selector list on top-level commas (not the ones inside :is(), :not(), [attr="a,b"])
function splitList(s) {
  const out = []; let depth = 0, q = '', start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '(' || c === '[') depth++; else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

// the end of the block that starts at s[i] === '{'
function blockEnd(s, i) {
  let depth = 0, q = '';
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); i = e < 0 ? s.length : e + 1; }
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return s.length - 1;
}

let dropped = 0;
function trim(s) {
  let out = '', i = 0;
  while (i < s.length) {
    // comments and whitespace pass through
    if (s.startsWith('/*', i)) { const e = s.indexOf('*/', i + 2); const end = e < 0 ? s.length : e + 2; out += s.slice(i, end); i = end; continue; }
    const open = s.indexOf('{', i), semi = s.indexOf(';', i);
    if (open < 0) { out += s.slice(i); break; }
    if (semi >= 0 && semi < open && s.slice(i, semi).trim().startsWith('@')) { out += s.slice(i, semi + 1); i = semi + 1; continue; }   // @import, @charset
    const head = s.slice(i, open), end = blockEnd(s, open), body = s.slice(open + 1, end);
    const h = head.trim();
    if (h.startsWith('@')) {
      if (/^@(media|supports|layer|container|scope)\b/.test(h)) { const inner = trim(body); if (inner.trim()) out += `${head}{${inner}}`; }
      else out += s.slice(i, end + 1);          // @keyframes, @font-face, @property…: as they are
    } else {
      const keep = splitList(head).filter((sel) => !deadSelector(sel));
      if (keep.length) out += `${keep.join(',')}{${body}}`; else dropped++;
    }
    i = end + 1;
  }
  return out;
}

let before = 0, after = 0;
for (const f of files.filter((f) => f.endsWith('.css'))) {
  const src = fs.readFileSync(f, 'utf8');
  const res = trim(src);
  before += src.length; after += res.length;
  if (res.length !== src.length) fs.writeFileSync(f, res);
}
console.log(`trim-css: ${dropped} rules of unused layouts taken out, ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB`);
