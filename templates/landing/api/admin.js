// Vercel Function or own-server function behind the moderator page /admin (section lightsStreet of the layout "lights").
// One password for the moderator: env ADMIN_PASSWORD, at least 16 characters and 8 different ones. Without it the page and this function are off.
// Signing in: POST { action: 'login' } with "Authorization: Bearer <password>" → { token, until }. The page keeps only the
// token (in this browser tab) and sends it as "Authorization: Bearer <token>". A token lives 12 hours. It is signed with a
// key made from the password, so a new ADMIN_PASSWORD ends every token at once; POST { action: 'logout-all' } ends every
// token given so far (a number kept in ${PROJECT}/admin.json). No cookies, so another site cannot make the browser act here.
// The password itself still works in the header (for scripts), with the same limits on wrong tries.
//
// GET              → { street, houses, bans, log, stats } — every house on the street with its number, name, signs and nights,
//                    also the houses the word filter hides; the bans; the last moderation actions; the visit and click
//                    numbers by day (api/stats.js). A project without a street gets only the numbers (street: false)
// POST { action: 'remove', sn }  → takes house #sn off the street (the visitor may put a house there again)
// POST { action: 'ban', sn }     → takes it off and bans its browser: that visitor cannot put a house on the street again
// POST { action: 'remove', from, to } → takes every house numbered from..to off the street (after a flood of new houses:
//                                  they come one after another, so their numbers make one run). Not a ban: a flood comes
//                                  from fresh browsers anyway, and a ban list that long would only make the street file big
// POST { action: 'unban', sn }   → lifts the ban that was given with house #sn and puts that house back on the street with
//                                  its number (unless its owner has another house there now, or another visitor's lit house
//                                  has the same picture). An undo for a ban given by mistake
//
// Wrong passwords: after 5 from one address the address waits a minute, and every next wrong one doubles the wait (up to an
// hour). Counted per address only (api/_agent/limits.js): wrong tries from other addresses never lock the moderator out,
// and a valid token is never held back. Every action goes into the log with the time and the moderator's address.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { storeFor, storeKind, update } from './_agent/store.js';
import { STREETS, ipKey, readStreet, changeStreet, isDark, blockList, rude, json } from './street.js';
import { count, peek, put, drop } from './_agent/limits.js';
import { decodeHouse } from '../src/lib/lights-kit.js';
import { readStats, EVENTS } from './stats.js';

const TRIES = 5;                         // wrong passwords from one address before it waits
const WAIT = 60;                         // the first wait, seconds; doubles with every next wrong password
const WAIT_MAX = 3600;
const FAILS_KEPT = 86400;                // wrong passwords are remembered for a day (and forgotten after a right one)
const TOKEN_HOURS = 12;
const MAX_BODY = 4000;
export { resetMemory as resetAdminLimits } from './_agent/limits.js';

const sha = (t) => createHash('sha256').update(String(t)).digest();
const bearer = (request) => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
const passOk = (env, got) => got.length > 0 && timingSafeEqual(sha(String(env.ADMIN_PASSWORD || '')), sha(got));

// ---- tokens: "adm1.<until, base 36>.<generation>.<signature>"
const keyOf = (env) => createHash('sha256').update(`admin-token|${env.PROJECT}|${env.ADMIN_PASSWORD}`).digest();
const signOf = (env, body) => createHmac('sha256', keyOf(env)).update(body).digest('base64url');
const tokenOf = (env, until, gen) => { const body = `adm1.${until.toString(36)}.${gen}`; return `${body}.${signOf(env, body)}`; };
/** The generation of a well-signed, unexpired token, or -1. */
function tokenGen(env, t, now) {
  const m = /^(adm1\.([0-9a-z]{1,12})\.(\d{1,9}))\.([A-Za-z0-9_-]{43})$/.exec(t);
  if (!m) return -1;
  const want = Buffer.from(signOf(env, m[1])), got = Buffer.from(m[4]);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return -1;
  return parseInt(m[2], 36) > now ? Number(m[3]) : -1;
}
const genPath = (env) => `${env.PROJECT}/admin.json`;
async function generation(env, store) {
  try { const t = await store.read(env, genPath(env)); const g = t ? JSON.parse(t).generation : 0; return Number.isInteger(g) && g >= 0 ? g : 0; }
  catch (e) { throw Object.assign(e instanceof Error ? e : new Error('storage'), { code: 'storage' }); }
}

// ---- wrong passwords: per address only
async function waiting(env, ip, now, deps) {
  const n = await peek(env, `adm-fail:${ip}`, deps);
  if (n < TRIES) return 0;
  const last = await peek(env, `adm-last:${ip}`, deps);
  const wait = Math.min(WAIT_MAX, WAIT * 2 ** (n - TRIES)) * 1000;
  return Math.max(0, last + wait - now);
}
async function failed(env, ip, now, deps) {
  await count(env, `adm-fail:${ip}`, FAILS_KEPT, deps);
  await put(env, `adm-last:${ip}`, now, FAILS_KEPT, deps);
}
const forgiven = async (env, ip, deps) => { await drop(env, `adm-fail:${ip}`, deps); await drop(env, `adm-last:${ip}`, deps); };
/** A password the page opens with: 16 characters or more and not one or two letters repeated. */
const strong = (p) => p.length >= 16 && new Set(p).size >= 8;

/** What the moderator sees of a house: everything but the key. */
function adminOf(h, now, conf, block, bans) {
  const got = decodeHouse(h.code, { holderOk: false });
  return {
    sn: h.sn, name: h.name, code: h.code, family: h.family || 'mumbai', no: h.no, nights: h.nights, gifts: h.gifts, best: h.best, streak: h.streak,
    light: h.light, updated: h.updated, dark: isDark(h, now),
    signs: got ? got.free.filter((f) => f.t).map((f) => f.t) : [],
    hidden: !got ? 'code' : rude(h.name, got, conf, block) ? 'words' : '',
    banned: bans.some((b) => b.key === h.key),
  };
}

export async function handle(request, env = process.env, deps = {}) {
  const conf = STREETS[env.PROJECT];
  const noindex = { 'x-robots-tag': 'noindex, nofollow' };
  if (!env.PROJECT || !strong(String(env.ADMIN_PASSWORD || ''))) return json({ error: 'not_found' }, 404, noindex);
  if (!storeKind(env)) return json({ error: 'off' }, 503, noindex);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'method' }, 405, { ...noindex, allow: 'GET, POST' });
  // a request from another site's page is turned away (the browser sends Origin with every POST)
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null') {
    let same = false; try { same = new URL(origin).host === new URL(request.url).host; } catch { /* a broken Origin */ }
    if (!same) return json({ error: 'origin' }, 403, noindex);
  }
  const now = (deps.now || Date.now)();
  const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
  const store = deps.store || (await storeFor(env));
  const given = bearer(request);
  let gen;
  try { gen = given.startsWith('adm1.') ? tokenGen(env, given, now) : -1; } catch { gen = -1; }
  let signedIn = false;
  if (gen >= 0) {
    try { signedIn = gen === (await generation(env, store)); } catch { return json({ error: 'storage' }, 503, noindex); }
    if (!signedIn) return json({ error: 'password' }, 401, noindex);   // a token ended by "log out everywhere"
  } else {
    const wait = await waiting(env, ip, now, deps);
    if (wait > 0) return json({ error: 'wait', seconds: Math.ceil(wait / 1000) }, 429, { ...noindex, 'retry-after': String(Math.ceil(wait / 1000)) });
    if (!passOk(env, given)) {
      await failed(env, ip, now, deps);
      console.warn(`[admin] wrong password from ${ip}`);   // the server log; never the password
      return json({ error: 'password' }, 401, noindex);
    }
    await forgiven(env, ip, deps);
  }
  const block = blockList(env);

  if (request.method === 'GET') {
    try {
      const s = await readStats(env, store);
      const stats = { events: EVENTS, days: Object.keys(s.days).sort().reverse().slice(0, 120).map((d) => ({ day: d, ...s.days[d] })) };
      if (!conf) return json({ street: false, houses: [], bans: [], log: [], lastSn: 0, stats }, 200, noindex);
      const st = await readStreet(env, store);
      const houses = st.houses.map((h) => adminOf(h, now, conf, block, st.bans)).sort((a, b) => b.sn - a.sn);
      const bans = st.bans.map((b) => ({ sn: b.sn, name: b.name, at: b.at }));
      return json({ street: true, houses, bans, log: st.log.slice(-100).reverse(), lastSn: st.lastSn, stats }, 200, noindex);
    } catch { return json({ error: 'storage' }, 503, noindex); }
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return json({ error: 'big' }, 413, noindex);
  let b;
  try { const text = await request.text(); if (text.length > MAX_BODY) return json({ error: 'big' }, 413, noindex); b = JSON.parse(text); }
  catch { return json({ error: 'bad' }, 400, noindex); }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return json({ error: 'bad' }, 400, noindex);
  // signing in and out
  if (b.action === 'login') {
    console.info(`[admin] signed in from ${ip}`);
    try { const g = await generation(env, store); const until = now + TOKEN_HOURS * 3600000; return json({ ok: true, token: tokenOf(env, until, g), until: new Date(until).toISOString() }, 200, noindex); }
    catch { return json({ error: 'storage' }, 503, noindex); }
  }
  if (b.action === 'logout-all') {
    try {
      await update(env, store, genPath(env), async (raw) => {
        let g = 0; try { g = Number(JSON.parse(raw || '{}').generation) || 0; } catch { /* a damaged file starts again */ }
        return { text: JSON.stringify({ generation: g + 1, updated: new Date(now).toISOString() }), result: null };
      });
      console.info(`[admin] every sign-in ended from ${ip}`);
      return json({ ok: true }, 200, noindex);
    } catch { return json({ error: 'storage' }, 503, noindex); }
  }
  if (!conf) return json({ error: 'no_street' }, 404, noindex);
  const action = b.action, sn = b.sn;
  const one = Number.isInteger(sn) && sn >= 1;
  const run = action === 'remove' && b && b.sn === undefined && Number.isInteger(b.from) && Number.isInteger(b.to) && b.from >= 1 && b.to >= b.from && b.to - b.from < 100000;
  if (!['remove', 'ban', 'unban'].includes(action) || !(one || run)) return json({ error: 'bad' }, 400, noindex);
  const at = new Date(now).toISOString();
  const stop = (result) => ({ st: null, result });
  try {
    return await changeStreet(env, store, at, async (st) => {
      if (action === 'unban') {
        const ban = st.bans.find((x) => x.sn === sn);
        if (!ban) return stop(json({ error: 'no_ban' }, 404, noindex));
        st.bans = st.bans.filter((x) => x !== ban);
        // the house comes back as it was when it was banned (bans given before this kept no house)
        const h = ban.house;
        const free = h && typeof h === 'object' && h.key === ban.key && !st.houses.some((x) => x.key === h.key
          || (x.seed === h.seed && (x.family || 'mumbai') === (h.family || 'mumbai') && !isDark(x, now)));
        if (free) st.houses = [h, ...st.houses].sort((a, b2) => (a.updated < b2.updated ? 1 : -1)).slice(0, conf.keep);
        st.log.push({ at, action, sn, name: ban.name, ip });
        return { st, result: json({ ok: true, restored: Boolean(free) && st.houses.includes(h) }, 200, noindex) };
      } else if (run) {
        // a run of numbers: one line in the log for all of them
        const hs = st.houses.filter((x) => x.sn >= b.from && x.sn <= b.to);
        if (!hs.length) return stop(json({ error: 'no_house' }, 404, noindex));
        const gone = new Set(hs);
        st.houses = st.houses.filter((x) => !gone.has(x));
        st.log.push({ at, action, sn: b.from, to: b.to, name: `${hs.length} ${hs.length === 1 ? 'house' : 'houses'}`, ip });
        return { st, result: json({ ok: true, removed: hs.length }, 200, noindex) };
      }
      const h = st.houses.find((x) => x.sn === sn);
      if (!h) return stop(json({ error: 'no_house' }, 404, noindex));
      st.houses = st.houses.filter((x) => x !== h);
      if (action === 'ban' && !st.bans.some((x) => x.key === h.key)) st.bans.push({ key: h.key, sn, name: h.name, at, house: h });
      st.log.push({ at, action, sn, name: h.name, ip });
      return { st, result: json({ ok: true }, 200, noindex) };
    });
  } catch (e) { return json({ error: e?.code === 'busy' ? 'busy' : 'storage' }, 503, noindex); }
}

export default { fetch: (request) => handle(request) };
