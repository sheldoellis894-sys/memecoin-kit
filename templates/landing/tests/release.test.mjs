// Checks a packed site folder (scripts/pack-site.mjs → release/<project>, or deploy/ in the client's repository):
//   node tests/release.test.mjs [folder]          default: release/ullu
// 1. .dockerignore keeps every .env copy out of the Docker image, only .env.example goes in
// 2. package-lock.json is there and matches package.json; the Dockerfile and the README install with npm ci
// 3. frame headers: every page may be framed only by the site itself, the moderator page by nobody
//    (server/serve.mjs of the folder is started for real; vercel.json of the template is checked too)
// Nothing is written into the folder: the server keeps its data in a temporary folder.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2] || path.join(here, '..', 'release', 'ullu'));
assert.ok(fs.existsSync(path.join(dir, 'server', 'serve.mjs')), `no packed site in ${dir}`);
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

// ---- 1. .dockerignore: the rules Docker uses (later lines win, ! takes a file back in)
{
  const rules = read('.dockerignore').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const glob = (p) => new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]') + '(/.*)?$');
  const ignored = (file) => {
    let out = false;
    for (const r of rules) { const neg = r.startsWith('!'); if (glob(neg ? r.slice(1) : r).test(file)) out = !neg; }
    return out;
  };
  for (const f of ['.env', '.env.local', '.env.bak', '.env.save', '.env.production', '.env.old.txt', 'data', 'data/ullu/street.json', 'node_modules/x/index.js', 'server.log'])
    assert.ok(ignored(f), `${f} must stay out of the Docker image`);
  for (const f of ['.env.example', 'package.json', 'package-lock.json', 'server/serve.mjs', 'api/street.js', 'dist/index.html'])
    assert.ok(!ignored(f), `${f} must go into the Docker image`);
  console.log('1 ok: .dockerignore keeps .env and its copies out, .env.example in');
}

// ---- 2. the lockfile and npm ci
{
  const pkg = JSON.parse(read('package.json'));
  const deps = Object.keys(pkg.dependencies || {});
  if (deps.length) {
    assert.ok(fs.existsSync(path.join(dir, 'package-lock.json')), 'package-lock.json is missing');
    const lock = JSON.parse(read('package-lock.json'));
    assert.ok(lock.lockfileVersion >= 2, 'lockfile v2 or newer');
    assert.equal(lock.name, pkg.name);
    assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies, 'lockfile written for this package.json');
    for (const d of deps) {
      const e = lock.packages[`node_modules/${d}`];
      assert.ok(e && e.version && e.resolved && e.integrity, `${d}: exact version with integrity in the lockfile`);
    }
    for (const [k, v] of Object.entries(lock.packages)) if (k) assert.ok(v.link || v.integrity, `${k}: integrity`);
  }
  const docker = read('Dockerfile');
  assert.match(docker, /^COPY package\.json package-lock\.json \.\/$/m, 'the Dockerfile copies the lockfile');
  assert.match(docker, /^RUN npm ci --omit=dev$/m, 'the Dockerfile installs with npm ci');
  assert.ok(!/npm install/.test(docker), 'no npm install in the Dockerfile');
  const readme = read('README.md');
  assert.ok(!/^sudo npm install\b/m.test(readme), 'the README installs with npm ci');
  assert.match(readme, /^sudo npm ci --omit=dev/m);
  console.log(`2 ok: package-lock.json pins ${Object.keys(JSON.parse(fs.existsSync(path.join(dir, 'package-lock.json')) ? read('package-lock.json') : '{"packages":{}}').packages).length - 1} packages, Dockerfile and README use npm ci`);
}

// ---- 3a. vercel.json of the template (the same rules Vercel matches: anchored, case-insensitive)
{
  const vj = path.join(here, '..', 'vercel.json');
  if (fs.existsSync(vj)) {
    const rules = JSON.parse(fs.readFileSync(vj, 'utf8')).headers || [];
    const headersOf = (url) => {
      const out = {};
      for (const r of rules) if (new RegExp(`^${r.source}$`, 'i').test(url)) for (const h of r.headers) (out[h.key.toLowerCase()] ||= []).push(h.value);
      return out;
    };
    for (const u of ['/', '/index.html', '/404.html', '/api/street', '/project/logo.png', '/admin/x', '/administrator']) {
      const h = headersOf(u);
      assert.deepEqual(h['content-security-policy'], ["frame-ancestors 'self'"], `vercel.json ${u}`);
      assert.deepEqual(h['x-frame-options'], ['SAMEORIGIN'], `vercel.json ${u}`);
    }
    for (const u of ['/admin', '/admin/', '/admin.html', '/admin/index.html']) {
      const h = headersOf(u);
      assert.deepEqual(h['content-security-policy'], ["frame-ancestors 'none'"], `vercel.json ${u}: only 'none', no second rule`);
      assert.deepEqual(h['x-frame-options'], ['DENY'], `vercel.json ${u}`);
    }
    console.log("3a ok: vercel.json frame-ancestors 'self' on pages, 'none' on /admin");
  }
}

// ---- 3b. the server of the folder, started for real
{
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'release-'));
  const port = 3900 + Math.floor(Math.random() * 90);
  const env = { ...process.env, PORT: String(port), HOST: '127.0.0.1', STORE: 'file', DATA_DIR: data, STREET_SALT: 'release-test-salt-0123456789', ADMIN_PASSWORD: 'Release-Test-Pass-0123456789!', PROJECT: process.env.PROJECT || 'ullu' };
  const child = spawn(process.execPath, [path.join(dir, 'server', 'serve.mjs')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; child.stdout.on('data', (d) => { log += d; }); child.stderr.on('data', (d) => { log += d; });
  try {
    const base = `http://127.0.0.1:${port}`;
    for (let i = 0; ; i++) {
      try { await fetch(base + '/'); break; } catch { if (i > 100 || child.exitCode !== null) throw new Error('server did not start: ' + log); await new Promise((r) => setTimeout(r, 100)); }
    }
    const pages = ['/', '/index.html', '/404.html', '/no-such-page', '/robots.txt', '/api/street'];
    for (const u of pages) {
      const r = await fetch(base + u); await r.arrayBuffer();
      assert.equal(r.headers.get('content-security-policy'), "frame-ancestors 'self'", `${u}: frame-ancestors`);
      assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN', `${u}: x-frame-options`);
      assert.equal(r.headers.get('x-content-type-options'), 'nosniff', `${u}: the other safe headers stay`);
    }
    const home = await (await fetch(base + '/')).text();
    assert.match(home, /<meta http-equiv="content-security-policy"/i, 'the page keeps its own CSP tag');
    for (const u of ['/admin', '/admin/', '/admin/index.html']) {
      const r = await fetch(base + u, { redirect: 'manual' }); await r.arrayBuffer();
      if (r.status >= 300 && r.status < 400) continue;
      assert.equal(r.status, 200, `${u}: ${r.status}`);
      assert.equal(r.headers.get('content-security-policy'), "frame-ancestors 'none'", `${u}: the moderator page is never framed`);
      assert.equal(r.headers.get('x-frame-options'), 'DENY', `${u}`);
    }
    console.log("3b ok: the server sends frame-ancestors 'self' on pages and API, 'none' on /admin");
  } finally {
    child.kill();
    fs.rmSync(data, { recursive: true, force: true });
  }
}
console.log('release: all ok');
