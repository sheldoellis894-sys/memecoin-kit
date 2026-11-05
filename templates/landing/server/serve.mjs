// A small web server for running a site of this template on any machine with Node 20+ (the client's VPS, not Vercel).
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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// .env: simple KEY=value lines; values already set in the environment win
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* no .env file */ }

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const DIST = path.join(root, 'dist');
const MAX_BODY = 64 * 1024;
// sent with every file: the browser must not guess file types, and other sites learn only the domain the visitor came from
const SAFE = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' };
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
  if (!handler) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"error":"not_found"}'); return; }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX_BODY) { res.writeHead(413); res.end(); return; } chunks.push(c); }
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
  catch (e) { console.error(`[api/${name}]`, e); res.writeHead(500, { 'content-type': 'application/json' }); res.end('{"error":"server"}'); return; }
  const out = { ...SAFE }; response.headers.forEach((v, k) => { out[k] = v; });
  res.writeHead(response.status, out);
  res.end(Buffer.from(await response.arrayBuffer()));
}

function serveFile(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); res.end(); return; }
  if (p.includes('\0')) { res.writeHead(400); res.end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST + path.sep)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] }); res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found'); return;
  }
  const ext = path.extname(file).toLowerCase();
  // files with a hash in the name never change; pages and project pictures may
  const cache = p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-cache' : 'public, max-age=3600';
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': cache, ...SAFE });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); }).pipe(res);
}

const server = http.createServer((req, res) => {
  const m = req.url.match(/^\/api\/([^/?#]+)/);
  if (m) { runFunction(req, res, m[1]).catch((e) => { console.error(e); if (!res.headersSent) res.writeHead(500); res.end(); }); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return; }
  try { serveFile(req, res); } catch (e) { console.error(e); if (!res.headersSent) res.writeHead(500); res.end(); }
});
// a visitor that sends its request very slowly does not hold a connection for minutes
server.headersTimeout = 20000;
server.requestTimeout = 30000;
server.listen(PORT, HOST, () => console.log(`site ${process.env.PROJECT || ''} on http://${HOST}:${PORT}`));
