// Visits and clicks of the site, counted by day, for the moderator page /admin (any layout, any project).
// No cookies, no visitor ids, no addresses are kept: the page counts what happened in it (src/components/Track.astro)
// and sends only numbers, now and then; the server adds them to the numbers of the day.
//
// POST { e: { visit: 1, visitor: 1, play: 2, … } } → 204. Only the names in EVENTS count, each up to its limit.
//   visit    a page opened                       visitor  the first page of the day in this browser
//   play     the game started (lights tonight)    picture  the picture tool used
//   share    "Share on X" (or another network)    save     a card or a picture saved
//   buy      a click to the buy page              ca       the contract address copied
//   city     the city map opened (once a page)
//
// Kept: one JSON file `${PROJECT}/stats.json` in the same store as the street (api/_agent/store.js), days in UTC,
// the last 400 days. Honest limits: these are counts a browser reports, so they are approximate. Known bots (by the
// browser name) are not counted, one address may report 400 times an hour, and one report adds little, so numbers
// cannot be pushed far. Two reports at the same moment never undo each other (api/_agent/store.js update()).
import { storeFor, storeKind, update } from './_agent/store.js';
import { ipKey, foreignOrigin, notJson } from './_agent/ip.js';
import { count } from './_agent/limits.js';

export const EVENTS = ['visit', 'visitor', 'play', 'picture', 'share', 'save', 'buy', 'ca', 'city'];
const MAX = { visit: 1, visitor: 1 };    // per report; the rest up to 30
const PER_HOUR = 400;                    // reports an hour from one address (mobile networks put many phones behind one
                                         // address, so it is not small). Counted in api/_agent/limits.js
const KEEP_DAYS = 400;
const MAX_BODY = 1000;
const BOT = /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python|node-fetch|go-http|java\//i;

const pathOf = (project) => `${project}/stats.json`;
const none = (status = 204, extra = {}) => new Response(null, { status, headers: { 'cache-control': 'no-store', ...extra } });
const day = (now) => new Date(now).toISOString().slice(0, 10);

export { resetMemory as resetStatsLimits } from './_agent/limits.js';
const limited = async (env, ip, now, deps) => (await count(env, `stats:${Math.floor(now / 3600000)}:${ip}`, 3700, deps)) > PER_HOUR;

/** The numbers sent by the page, cleaned: only known names, whole numbers within the limits. Null when there is nothing. */
export function cleanReport(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  const out = {}; let any = false;
  for (const k of EVENTS) {
    const v = e[k];
    if (v === undefined) continue;
    if (!Number.isInteger(v) || v < 0) return null;
    const n = Math.min(v, MAX[k] ?? 30);
    if (n) { out[k] = n; any = true; }
  }
  return any ? out : null;
}

/** The stats file as text → { days: { 'YYYY-MM-DD': { visit, visitor, … } }, rev, updated }. Throws on a damaged file. */
function parseStats(t) {
  const j = t ? JSON.parse(t) : null;
  const days = j && j.days && typeof j.days === 'object' && !Array.isArray(j.days) ? j.days : {};
  return { days, rev: Number.isInteger(j?.rev) ? j.rev : 0, updated: j?.updated || null };
}

/**
 * The stats file for the moderator page. opts.strict: a file that cannot be read or is damaged is an error;
 * without it the page simply shows no numbers.
 */
export async function readStats(env, store, opts = {}) {
  try { return parseStats(await store.read(env, pathOf(env.PROJECT))); }
  catch (e) { if (opts.strict) throw e; return parseStats(null); }
}

// a report must never start the numbers again from an empty file: a damaged file is left for the owner to look at
function addReport(env, store, report, now) {
  return update(env, store, pathOf(env.PROJECT), async (text) => {
    const st = parseStats(text);
    const d = day(now);
    const row = st.days[d] || {};
    for (const [k, v] of Object.entries(report)) row[k] = (row[k] || 0) + v;
    st.days[d] = row;
    const keys = Object.keys(st.days).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete st.days[k];
    return { text: JSON.stringify({ days: st.days, rev: st.rev + 1, updated: new Date(now).toISOString() }), result: null };
  });
}

export async function handle(request, env = process.env, deps = {}) {
  if (request.method !== 'POST') return none(405, { allow: 'POST' });
  if (!env.PROJECT || !storeKind(env)) return none();               // no storage: the site works, nothing is counted
  if (BOT.test(request.headers.get('user-agent') || '')) return none();
  // only this site's page reports, and only as JSON (a form or a beacon from another site does not count)
  if (foreignOrigin(request)) return none(403);
  if (notJson(request)) return none(415);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return none(413);
  let report;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return none(413);
    report = cleanReport(JSON.parse(text)?.e);
  } catch { return none(400); }
  if (!report) return none(400);
  const now = (deps.now || Date.now)();
  const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
  if (await limited(env, ip, now, deps)) return none(429);
  try { await addReport(env, deps.store || (await storeFor(env)), report, now); }
  catch { return none(503); }
  return none();
}

export default { fetch: (request) => handle(request) };
