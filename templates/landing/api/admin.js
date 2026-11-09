// Vercel Function or own-server function behind the moderator page /admin (section lightsStreet of the layout "lights").
// One password for the moderator: env ADMIN_PASSWORD, at least 16 characters. Without it the page and this function are off.
// The password goes in every request as "Authorization: Bearer <password>"; nothing else is needed (no accounts, no cookies).
//
// GET              → { street, houses, bans, log, stats } — every house on the street with its number, name, signs and nights,
//                    also the houses the word filter hides; the bans; the last moderation actions; the visit and click
//                    numbers by day (api/stats.js). A project without a street gets only the numbers (street: false)
// POST { action: 'remove', sn }  → takes house #sn off the street (the visitor may put a house there again)
// POST { action: 'ban', sn }     → takes it off and bans its browser: that visitor cannot put a house on the street again
// POST { action: 'unban', sn }   → lifts the ban that was given with house #sn and puts that house back on the street with
//                                  its number (unless its owner has another house there now, or another visitor's lit house
//                                  has the same picture). An undo for a ban given by mistake
//
// Wrong passwords: 5 a minute from one address, then the address waits (kept in memory: a soft limit, as on the street).
// Every action goes into the log with the time and the moderator's address.
import { createHash, timingSafeEqual } from 'node:crypto';
import { storeFor, storeKind, serial } from './_agent/store.js';
import { STREETS, ipKey, readStreet, writeStreet, pathOf, isDark, blockList, rude, json } from './street.js';
import { decodeHouse } from '../src/lib/lights-kit.js';
import { readStats, EVENTS } from './stats.js';

const TRIES = 5;                         // wrong passwords a minute from one address
const fails = new Map();                 // address → { at: minute, n }
export const resetAdminLimits = () => fails.clear();

const sha = (t) => createHash('sha256').update(String(t)).digest();
function passOk(env, request) {
  const want = String(env.ADMIN_PASSWORD || '');
  const got = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return timingSafeEqual(sha(want), sha(got)) && got.length > 0;
}
function tooMany(ip, now) {
  const m = Math.floor(now / 60000); const f = fails.get(ip);
  return Boolean(f && f.at === m && f.n >= TRIES);
}
function failed(ip, now) {
  const m = Math.floor(now / 60000); const f = fails.get(ip);
  if (fails.size > 5000) fails.clear();
  fails.set(ip, f && f.at === m ? { at: m, n: f.n + 1 } : { at: m, n: 1 });
}

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
  if (!env.PROJECT || String(env.ADMIN_PASSWORD || '').length < 16) return json({ error: 'not_found' }, 404, noindex);
  if (!storeKind(env)) return json({ error: 'off' }, 503, noindex);
  const now = (deps.now || Date.now)();
  const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
  if (tooMany(ip, now)) return json({ error: 'wait' }, 429, { ...noindex, 'retry-after': '60' });
  if (!passOk(env, request)) { failed(ip, now); return json({ error: 'password' }, 401, noindex); }
  const store = deps.store || (await storeFor(env));
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
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { ...noindex, allow: 'GET, POST' });
  if (!conf) return json({ error: 'no_street' }, 404, noindex);

  let b; try { b = JSON.parse(await request.text()); } catch { return json({ error: 'bad' }, 400, noindex); }
  const action = b && b.action, sn = b && b.sn;
  if (!['remove', 'ban', 'unban'].includes(action) || !Number.isInteger(sn) || sn < 1) return json({ error: 'bad' }, 400, noindex);
  try {
    return await serial(pathOf(env.PROJECT), async () => {
      const st = await readStreet(env, store);
      const at = new Date(now).toISOString();
      if (action === 'unban') {
        const ban = st.bans.find((x) => x.sn === sn);
        if (!ban) return json({ error: 'no_ban' }, 404, noindex);
        st.bans = st.bans.filter((x) => x !== ban);
        // the house comes back as it was when it was banned (bans given before this kept no house)
        const h = ban.house;
        const free = h && typeof h === 'object' && h.key === ban.key && !st.houses.some((x) => x.key === h.key
          || (x.seed === h.seed && (x.family || 'mumbai') === (h.family || 'mumbai') && !isDark(x, now)));
        if (free) st.houses = [h, ...st.houses].sort((a, b2) => (a.updated < b2.updated ? 1 : -1)).slice(0, conf.keep);
        st.log.push({ at, action, sn, name: ban.name, ip });
        await writeStreet(env, store, st, at);
        return json({ ok: true, restored: Boolean(free) && st.houses.includes(h) }, 200, noindex);
      } else {
        const h = st.houses.find((x) => x.sn === sn);
        if (!h) return json({ error: 'no_house' }, 404, noindex);
        st.houses = st.houses.filter((x) => x !== h);
        if (action === 'ban' && !st.bans.some((x) => x.key === h.key)) st.bans.push({ key: h.key, sn, name: h.name, at, house: h });
        st.log.push({ at, action, sn, name: h.name, ip });
      }
      await writeStreet(env, store, st, at);
      return json({ ok: true }, 200, noindex);
    });
  } catch { return json({ error: 'storage' }, 503, noindex); }
}

export default { fetch: (request) => handle(request) };
