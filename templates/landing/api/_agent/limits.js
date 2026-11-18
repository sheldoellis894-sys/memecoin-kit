// Counters for the limits of the functions (houses a day, wrong admin passwords, inspections a day, used challenges).
//
// Where they live:
//   Redis   when the project has one: KV_REST_API_URL + KV_REST_API_TOKEN (Vercel "Upstash for Redis" adds them) or
//           UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Then every copy of a Vercel Function sees the same numbers.
//   memory  otherwise. On an own server (one Node process, server/serve.mjs) that is the same thing: all requests go
//           through one process. On Vercel without Redis each copy of the function counts on its own (a soft limit).
//
// When Redis does not answer in time, the counter falls back to memory for that call: a limit never turns off.
// Keys are prefixed with the project, so one Redis can serve several sites.

const mem = new Map();            // key → { v, until }
const MEM_KEYS = 50000;
export const resetMemory = () => mem.clear();

function memGet(key, now) {
  const x = mem.get(key);
  if (!x) return null;
  if (x.until && x.until <= now) { mem.delete(key); return null; }
  return x;
}
function memRoom(now) {
  if (mem.size < MEM_KEYS) return;
  for (const [k, x] of mem) if (x.until && x.until <= now) mem.delete(k);
  if (mem.size >= MEM_KEYS) mem.clear();   // thousands of fresh keys at once: start again rather than grow without end
}

const redisOf = (env) => {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '';
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
  return /^https:\/\//.test(url) && token ? { url: url.replace(/\/+$/, ''), token } : null;
};
/** Where the counters of this deployment live: 'redis' or 'memory'. */
export const limitsKind = (env) => (redisOf(env) ? 'redis' : 'memory');

async function redis(env, commands, deps) {
  const r = redisOf(env);
  if (!r) return null;
  try {
    const res = await (deps.fetch || fetch)(`${r.url}/pipeline`, {
      method: 'POST', headers: { authorization: `Bearer ${r.token}`, 'content-type': 'application/json' },
      body: JSON.stringify(commands), signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const out = await res.json();
    if (!Array.isArray(out) || out.some((x) => x && x.error)) return null;
    return out.map((x) => x?.result);
  } catch { return null; }
}

const full = (env, key) => `lim:${env.PROJECT || 'site'}:${key}`;

/**
 * Adds one to a counter that lives for `seconds` from its first hit and returns the new value.
 * Used as: if (await count(env, 'new:' + ip, 86400) > 20) → too many.
 */
export async function count(env, key, seconds, deps = {}) {
  const k = full(env, key);
  const out = await redis(env, [['INCR', k], ['EXPIRE', k, String(seconds), 'NX']], deps);
  if (out && Number.isInteger(Number(out[0]))) return Number(out[0]);
  const now = (deps.now || Date.now)();
  const x = memGet(k, now);
  if (x) { x.v += 1; return x.v; }
  memRoom(now);
  mem.set(k, { v: 1, until: now + seconds * 1000 });
  return 1;
}

/** The current value of a counter (0 when there is none). */
export async function peek(env, key, deps = {}) {
  const k = full(env, key);
  const out = await redis(env, [['GET', k]], deps);
  if (out) return Number(out[0]) || 0;
  const x = memGet(k, (deps.now || Date.now)());
  return x ? x.v : 0;
}

/** Sets a value for `seconds` (a number, e.g. the time a wait ends). */
export async function put(env, key, value, seconds, deps = {}) {
  const k = full(env, key);
  const out = await redis(env, [['SET', k, String(value), 'EX', String(seconds)]], deps);
  if (out) return;
  const now = (deps.now || Date.now)();
  memRoom(now);
  mem.set(k, { v: Number(value) || 0, until: now + seconds * 1000 });
}

/** Removes a counter (after a right password the wrong ones are forgotten). */
export async function drop(env, key, deps = {}) {
  const k = full(env, key);
  await redis(env, [['DEL', k]], deps);
  mem.delete(k);
}

/** True the first time a key is taken in `seconds`, false after that (one answer to a challenge = one house). */
export async function once(env, key, seconds, deps = {}) {
  const k = full(env, key);
  const out = await redis(env, [['SET', k, '1', 'EX', String(seconds), 'NX']], deps);
  if (out) return out[0] === 'OK';
  const now = (deps.now || Date.now)();
  if (memGet(k, now)) return false;
  memRoom(now);
  mem.set(k, { v: 1, until: now + seconds * 1000 });
  return true;
}
