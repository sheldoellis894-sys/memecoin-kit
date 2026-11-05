// Vercel Function behind the street of houses (section lightsStreet of the layout "lights").
// GET  → { live, houses, star, count } — the houses visitors put on the street, brightest first; star = house of the night.
// POST { id, name, code, nights, gifts, best, landings, streak } → { ok, house } — puts the visitor's house on the street,
//      or updates it (one house per visitor id). The id is a random string kept in the visitor's browser.
// POST { id, remove: true } → { ok, removed } — takes the visitor's own house off the street (only the browser that
//      put it there has the id).
//
// What is kept: one JSON file `${PROJECT}/street.json`. Works on Vercel and on any server with Node (see api/_agent/store.js):
//   BLOB_READ_WRITE_TOKEN — on Vercel: added when a Blob store is connected to the project
//                           (new stores add BLOB_STORE_ID instead; the Blob package then signs in with Vercel OIDC)
//   STORE=file, DATA_DIR  — on an own server: the folder for the file (the client's hosting)
//   STREET_SALT           — optional: any long random string; visitor ids are stored only as hashes with it
//   STREET_BLOCK          — optional: words that may not be in a name, comma separated
//
// Honest limits: there is no login, so the nights are what the browser says they are. The server checks that the
// numbers agree with each other, draws the house from its code itself and computes its light itself, so a visitor
// can lie about how many nights they kept, but cannot post a house that the site would not have drawn.
// It answers only for projects listed in STREETS (env PROJECT).
import { createHash } from 'node:crypto';
import { storeFor, storeKind, serial } from './_agent/store.js';
import { decodeHouse, encodeHouse, houseOfP, lightOf, cleanName, NIGHTS } from '../src/lib/lights-kit.js';

export const STREETS = { ullu: { keep: 120 } };
const SHOW = 60;                         // houses sent to the page
const PER_IP = 6;                        // posts a day from one address (kept in memory: a soft limit)
const PER_MINUTE = 40;                   // posts a minute for the whole street
const MAX_BODY = 9000;                   // bytes in a post
const STAR_HOURS = 36;                   // the house of the night is chosen among houses lit in the last hours
const DARK_HOURS = 48;                   // a house not lit for this long is shown dark on the street

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
});
const pathOf = (project) => `${project}/street.json`;
const int = (v, max = 100000) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);

const memory = { ip: new Map(), minute: { at: 0, n: 0 } };
export const resetLimits = () => { memory.ip.clear(); memory.minute = { at: 0, n: 0 }; };

/** The address the limits count by. An IPv6 visitor usually has a whole /64 block of addresses, so it counts as one. */
export function ipKey(ip) {
  const s = String(ip || '').trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/%.*$/, '');
  if (!s.includes(':')) return s || 'unknown';
  const v4 = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (v4) return v4[1];
  const [a, b] = s.split('::');
  const head = a ? a.split(':') : [], tail = b ? b.split(':') : [];
  const full = s.includes('::') ? [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill('0'), ...tail] : head;
  return `${full.slice(0, 4).map((x) => x.replace(/^0+(?=.)/, '') || '0').join(':')}::/64`;
}

function limited(ip, now) {
  const day = Math.floor(now / 86400000);
  const m = Math.floor(now / 60000);
  if (memory.minute.at !== m) memory.minute = { at: m, n: 0 };
  if (memory.minute.n >= PER_MINUTE) return true;
  const key = `${day}:${ip}`;
  const n = memory.ip.get(key) || 0;
  if (n >= PER_IP) return true;
  if (memory.ip.size > 5000) memory.ip.clear();
  memory.ip.set(key, n + 1); memory.minute.n += 1;
  return false;
}

// Vercel Blob in public mode is read through its CDN, which may give the file as it was up to a minute ago. Then two posts
// in a row would undo each other. So the last file this instance wrote is kept in memory, and the newer of the two is used.
const written = new WeakMap();   // store → { path, updated, j }

async function readStreet(env, store) {
  const path = pathOf(env.PROJECT);
  const raw = await store.read(env, path);
  let j = raw ? JSON.parse(raw) : null;
  const mine = storeKind(env) === 'blob' ? written.get(store) : null;
  if (mine && mine.path === path && (!j || String(j.updated || '') < mine.updated)) j = mine.j;
  if (!j) return { houses: [] };
  return { houses: Array.isArray(j?.houses) ? j.houses.filter((h) => h && typeof h.key === 'string' && typeof h.code === 'string') : [] };
}

/** How bright a house is shown now: a house not lit for two days shows at level 1. */
const isDark = (h, now) => now - Date.parse(h.updated) > DARK_HOURS * 3600000;
const lightNow = (h, now) => (isDark(h, now) ? h.lightDark : h.light);

/** Words from STREET_BLOCK found in a text (a name or a sign), compared without case. */
const blockList = (env) => String(env.STREET_BLOCK || '').split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
const blocked = (text, block) => { const t = String(text || '').toLowerCase(); return block.some((w) => t.includes(w)); };

/** What a page may see of a house: never the key. dark = not lit for two days, so it shows as it is now: at level 1. */
function publicOf(h, now) {
  const dark = isDark(h, now);
  return { name: h.name, code: h.code, family: h.family || 'mumbai', wish: h.wish || '', no: h.no, nights: h.nights, gifts: h.gifts, best: h.best, landings: h.landings,
    streak: dark ? 0 : h.streak, light: dark ? h.lightDark : h.light, dark, updated: h.updated };
}

function starOf(houses, now) {
  const fresh = houses.filter((h) => now - Date.parse(h.updated) <= STAR_HOURS * 3600000);
  return fresh.sort((a, b) => b.light - a.light || b.streak - a.streak || (a.updated < b.updated ? 1 : -1))[0] || null;
}

export async function handle(request, env = process.env, deps = {}) {
  const conf = STREETS[env.PROJECT];
  if (!conf) return json({ error: 'not_found' }, 404);
  const now = (deps.now || Date.now)();
  const live = Boolean(storeKind(env));
  const store = live ? deps.store || (await storeFor(env)) : null;

  if (request.method === 'GET') {
    if (!live) return json({ live, houses: [], star: null, count: 0 });
    try {
      // a house whose code the site cannot draw any more (an old style, a removed item) is left out
      const houses = (await readStreet(env, store)).houses.filter((h) => decodeHouse(h.code, { holderOk: false }));
      const sorted = [...houses].sort((a, b) => lightNow(b, now) - lightNow(a, now) || (a.updated < b.updated ? 1 : -1));
      const star = starOf(houses, now);
      return json({ live, count: houses.length, star: star ? publicOf(star, now) : null, houses: sorted.slice(0, SHOW).map((h) => publicOf(h, now)) }, 200,
        { 'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' });
    } catch {
      return json({ live, houses: [], star: null, count: 0, error: 'storage' });
    }
  }

  if (request.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'GET, POST' });
  if (!live) return json({ ok: false, error: 'off' }, 503);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return json({ ok: false, error: 'big' }, 413);
  let b;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ ok: false, error: 'big' }, 413);
    b = JSON.parse(text);
  } catch { return json({ ok: false, error: 'bad' }, 400); }
  if (!b || typeof b !== 'object') return json({ ok: false, error: 'bad' }, 400);

  // who: a random id from the browser, kept only as a hash
  if (typeof b.id !== 'string' || !/^[a-z0-9]{16,32}$/.test(b.id)) return json({ ok: false, error: 'bad' }, 400);
  const key = createHash('sha256').update(`${env.STREET_SALT || 'street'}:${env.PROJECT}:${b.id}`).digest('hex').slice(0, 32);
  // taking the own house off the street
  if (b.remove === true) {
    const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
    if (limited(ip, now)) return json({ ok: false, error: 'busy' }, 429);
    try {
      return await serial(pathOf(env.PROJECT), async () => {
        const { houses } = await readStreet(env, store);
        const next = houses.filter((x) => x.key !== key);
        if (next.length === houses.length) return json({ ok: true, removed: false });
        const file = { houses: next, updated: new Date(now).toISOString() };
        await store.write(env, pathOf(env.PROJECT), JSON.stringify(file));
        written.set(store, { path: pathOf(env.PROJECT), updated: file.updated, j: file });
        return json({ ok: true, removed: true });
      });
    } catch { return json({ ok: false, error: 'storage' }, 503); }
  }
  // the name on the door
  const name = cleanName(b.name);
  const block = blockList(env);
  if (!name || blocked(name, block)) return json({ ok: false, error: 'name' }, 400);
  // the house: drawn from its code by the server; golden holder decorations are not taken (there is no wallet check)
  const got = decodeHouse(b.code, { holderOk: false });
  if (!got) return json({ ok: false, error: 'code' }, 400);
  // the numbers have to agree with each other
  const nights = int(b.nights), gifts = int(b.gifts), best = int(b.best), landings = int(b.landings), streak = int(b.streak);
  if ([nights, gifts, best, landings, streak].some((v) => v === null)) return json({ ok: false, error: 'bad' }, 400);
  if (nights < 1) return json({ ok: false, error: 'dark' }, 400);
  if (streak > best || best > nights || gifts > nights || landings > Math.floor(nights / NIGHTS) || (best < NIGHTS && landings > 0) || streak < 1)
    return json({ ok: false, error: 'numbers' }, 400);
  // the words on own signs follow the same rule as names
  if (got.free.some((f) => f.t && blocked(f.t, block))) return json({ ok: false, error: 'sign' }, 400);

  const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
  if (limited(ip, now)) return json({ ok: false, error: 'busy' }, 429);

  const h = houseOfP(got);
  const level = Math.min(NIGHTS, streak);
  // the code is written again by the server, so the street keeps only what the site draws
  const code = encodeHouse(got.seed, got.placed, got.family, got.wish, { free: got.free, paint: got.paint });
  const entry = { key, seed: got.seed, family: got.family, wish: got.wish, name, code, no: h.no, nights, gifts, best, landings, streak,
    light: lightOf(h, got.placed, level, got.free), lightDark: lightOf(h, got.placed, 1, got.free), updated: new Date(now).toISOString() };

  try {
    return await serial(pathOf(env.PROJECT), async () => {
    const { houses } = await readStreet(env, store);
    // one house per visitor. Codes are public, so a copy must not push the real house off the street: a house (seed and
    // style) that another visitor keeps lit is not taken. Once it has gone dark (two days), a moved house may take its place.
    const same = (x) => x.key !== key && x.seed === entry.seed && (x.family || 'mumbai') === entry.family;
    if (houses.some((x) => same(x) && !isDark(x, now))) return json({ ok: false, error: 'taken' }, 409);
    const others = houses.filter((x) => x.key !== key && !same(x));
    const next = [entry, ...others].sort((a, b2) => (a.updated < b2.updated ? 1 : -1)).slice(0, conf.keep);
    const file = { houses: next, updated: entry.updated };
    await store.write(env, pathOf(env.PROJECT), JSON.stringify(file));
    written.set(store, { path: pathOf(env.PROJECT), updated: entry.updated, j: file });
    return json({ ok: true, house: publicOf(entry, now) });
    });
  } catch {
    return json({ ok: false, error: 'storage' }, 503);
  }
}

export default { fetch: (request) => handle(request) };
