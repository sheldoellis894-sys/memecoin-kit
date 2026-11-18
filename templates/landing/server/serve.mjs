// A small web server for running a site of this template on any machine with Node 22+ (the client's VPS, not Vercel).
// Run ONE process of it per site: the limits and the queue of writes to the data files live in this process.
// It serves the built pages from dist/ and runs the functions from api/ (the same files Vercel runs), so nothing
// in the site has to change when it moves. Put nginx or Caddy in front of it for HTTPS.
//
//   node server/serve.mjs                 PORT (default 3000), HOST (default 127.0.0.1), and everything from .env
//
// Settings are read from the environment and from a .env file next to package.json (KEY=value per line):
//   PROJECT=ullu, STORE=file, DATA_DIR=/var/lib/ullu, STREET_SALT=…, STREET_BLOCK=…, TRUST_PROXY (see visitor() below)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// .env: simple KEY=value lines; values already set in the environment win
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* no .env file */ }
// a relative DATA_DIR is the folder next to package.json, wherever the server is started from
if (process.env.DATA_DIR && !path.isAbsolute(process.env.DATA_DIR)) process.env.DATA_DIR = path.resolve(root, process.env.DATA_DIR);
// the street ties every house to its owner with STREET_SALT: houses posted without it would be lost the day it is set
if (fs.existsSync(path.join(root, 'api', 'street.js')) && String(process.env.STREET_SALT || '').trim().length < 16) {
  console.error('STREET_SALT is missing or shorter than 16 characters: put a long random string into .env (for example the output of openssl rand -hex 32). Set it once and never change it');
  process.exit(1);
}
// the moderator page: no password = the page is off; a weak password = the server does not start (same rule as api/admin.js)
if (fs.existsSync(path.join(root, 'api', 'admin.js')) && process.env.ADMIN_PASSWORD) {
  const p = String(process.env.ADMIN_PASSWORD);
  if (p.length < 16 || new Set(p).size < 8) {
    console.error('ADMIN_PASSWORD is too weak: use 16 characters or more, at least 8 different ones (for example the output of openssl rand -base64 24). Or leave it empty to keep /admin off');
    process.exit(1);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const DIST = path.join(root, 'dist');
const MAX_BODY = 64 * 1024;
// sent with every answer: the browser must not guess file types, other sites learn only the domain the visitor came from,
// and the pages may not use the camera, the microphone, the location or payments
const SAFE = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' };
// behind HTTPS (nginx says so in X-Forwarded-Proto) the browser is told to use HTTPS only from now on
const HSTS = { 'strict-transport-security': 'max-age=31536000' };
const tls = (req) => String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
// a plain page for a failure, without any detail of it
const OOPS = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Something went wrong</title><body style="font:16px/1.5 system-ui,sans-serif;display:grid;place-content:center;min-height:90vh;text-align:center;margin:0;background:#111;color:#eee"><h1 style="margin:0 0 8px">Something went wrong</h1><p style="margin:0">Please try again in a minute</p>';
// the moderator page never opens inside another site's frame
const NO_FRAME = { 'x-frame-options': 'DENY', 'content-security-policy': "frame-ancestors 'none'" };
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

// functions: api/<name>.js with a default export { fetch(request) }; files and folders starting with "_" are helpers
const functions = new Map();
async function fn(name) {
  if (!/^[a-z0-9-]+$/i.test(name)) return null;
  if (functions.has(name)) return functions.get(name);
  const file = path.join(root, 'api', `${name}.js`);
  if (!fs.existsSync(file)) return null;
  const mod = await import(pathToFileURL(file).href);
  const handler = mod.default?.fetch || (typeof mod.default === 'function' ? mod.default : null);
  functions.set(name, handler);
  return handler;
}

// TRUST_PROXY=1: always believe X-Forwarded-For; TRUST_PROXY=0: never; unset: only from a local or private address
const PRIVATE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|f[cd][0-9a-f]{2}:|fe80:)/i;
function visitor(req) {
  const peer = String(req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  const trust = process.env.TRUST_PROXY === '1' || (process.env.TRUST_PROXY !== '0' && PRIVATE.test(peer));
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',').map((x) => x.trim()).filter(Boolean);
  // nginx from the guide writes only the visitor's address; a proxy that adds to the list puts the visitor last
  return (trust && fwd.length ? fwd[fwd.length - 1] : peer) || 'unknown';
}

async function runFunction(req, res, name) {
  const handler = await fn(name);
  if (!handler) { res.writeHead(404, { 'content-type': 'application/json', ...SAFE }); res.end('{"error":"not_found"}'); return; }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX_BODY) { res.writeHead(413, { 'content-type': 'application/json', connection: 'close', ...SAFE }); res.end('{"error":"big"}'); return; } chunks.push(c); }
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  // the visitor's address. X-Forwarded-For is taken only from a proxy on this machine or in the private network
  // (nginx in front, Docker); from anyone else it could be made up, so the connection address is used instead.
  headers.set('x-forwarded-for', visitor(req));
  // the Host header comes from the visitor: only a plain host name or address goes into the address the function sees
  const host = /^[a-z0-9.-]+(:\d{1,5})?$|^\[[0-9a-f:.]+\](:\d{1,5})?$/i.test(req.headers.host || '') ? req.headers.host : 'localhost';
  const url = `http://${host}${req.url}`;
  const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
  let response;
  try { response = await handler(request); }
  catch (e) { console.error(`[api/${name}]`, e); res.writeHead(500, { 'content-type': 'application/json', ...SAFE }); res.end('{"error":"server"}'); return; }
  const out = { ...SAFE, ...(tls(req) ? HSTS : {}) }; response.headers.forEach((v, k) => { out[k] = v; });
  res.writeHead(response.status, out);
  res.end(Buffer.from(await response.arrayBuffer()));
}

// pages, styles and scripts go compressed (brotli or gzip) when the browser takes it; kept in memory once made
const PACK = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.xml']);
const packed = new Map();   // `${file}|${mtime}|${enc}` → Buffer
function encodingOf(req) {
  const a = String(req.headers['accept-encoding'] || '');
  return /\bbr\b/.test(a) ? 'br' : /\bgzip\b/.test(a) ? 'gzip' : '';
}
function packedBody(file, stat, enc) {
  const key = `${file}|${stat.mtimeMs}|${enc}`;
  let buf = packed.get(key);
  if (!buf) {
    const raw = fs.readFileSync(file);
    buf = enc === 'br' ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }) : zlib.gzipSync(raw, { level: 9 });
    if (packed.size > 500) packed.clear();
    packed.set(key, buf);
  }
  return buf;
}

function serveFile(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400, SAFE); res.end(); return; }
  if (p.includes('\0')) { res.writeHead(400, SAFE); res.end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST + path.sep)) { res.writeHead(403, SAFE); res.end(); return; }
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'], 'cache-control': 'no-cache', 'x-robots-tag': 'noindex', ...SAFE, ...(tls(req) ? HSTS : {}) });
    res.end(req.method === 'HEAD' ? undefined : fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found'); return;
  }
  const ext = path.extname(file).toLowerCase();
  // files with a hash in the name never change; pages and project pictures may
  const cache = p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-cache' : 'public, max-age=3600';
  const admin = path.relative(DIST, file).split(path.sep)[0].replace(/\.html$/, '') === 'admin';
  const head = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': cache, ...SAFE, ...(tls(req) ? HSTS : {}),
    ...(admin ? { ...NO_FRAME, 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' } : {}) };
  const stat = fs.statSync(file);
  const enc = PACK.has(ext) && stat.size > 1024 ? encodingOf(req) : '';
  if (PACK.has(ext)) head.vary = 'Accept-Encoding';
  if (enc) {
    const body = packedBody(file, stat, enc);
    res.writeHead(200, { ...head, 'content-encoding': enc, 'content-length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }
  res.writeHead(200, { ...head, 'content-length': stat.size });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).on('error', () => { if (!res.headersSent) res.writeHead(500, SAFE); res.end(); }).pipe(res);
}

const server = http.createServer((req, res) => {
  const m = req.url.match(/^\/api\/([^/?#]+)/);
  if (m) { runFunction(req, res, m[1]).catch((e) => { console.error(e); if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json', ...SAFE }); res.end('{"error":"server"}'); }); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { allow: 'GET, HEAD', ...SAFE }); res.end(); return; }
  try { serveFile(req, res); } catch (e) { console.error(e); if (!res.headersSent) res.writeHead(500, { 'content-type': TYPES['.html'], ...SAFE }); res.end(OOPS); }
});
// a visitor that sends its request very slowly does not hold a connection for minutes
server.headersTimeout = 20000;
server.requestTimeout = 30000;
server.listen(PORT, HOST, () => console.log(`site ${process.env.PROJECT || ''} on http://${HOST}:${PORT}`));
