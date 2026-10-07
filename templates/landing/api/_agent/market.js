// Reads one day of the Solana market from public services that need no key, and turns it into plain numbers.
// Two sources give the same shape of "pool" (one traded token):
//   1) GeckoTerminal: trending pools and the newest pools;
//   2) DexScreener: the price of SOL, and a second way to get traded tokens if the first source is silent.
// Names and symbols of tokens are never read: the agent gets short ids and numbers only,
// so nothing written by strangers on a public chain can reach the model or the page.

const SOL = 'So11111111111111111111111111111111111111112';
const GT = 'https://api.geckoterminal.com/api/v2';
const DS = 'https://api.dexscreener.com';

async function getJson(url, ms = 9000) {
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
  return res.json();
}
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const round = (n, d = 1) => (n === null || n === undefined ? null : Math.round(n * 10 ** d) / 10 ** d);
const median = (list) => { if (!list.length) return null; const s = [...list].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// ---------- pools ----------
function fromGecko(item, now) {
  const a = item?.attributes || {};
  const tx = a.transactions?.h24 || {};
  const created = a.pool_created_at ? Date.parse(a.pool_created_at) : NaN;
  return {
    key: item?.relationships?.base_token?.data?.id || item?.id || '',
    age_h: Number.isFinite(created) ? Math.max(0, (now - created) / 3600000) : null,
    change_24h: num(a.price_change_percentage?.h24),
    change_6h: num(a.price_change_percentage?.h6),
    change_1h: num(a.price_change_percentage?.h1),
    volume_24h: num(a.volume_usd?.h24) || 0,
    liquidity: num(a.reserve_in_usd) || 0,
    fdv: num(a.fdv_usd) || num(a.market_cap_usd) || 0,
    buys: num(tx.buys) || 0,
    sells: num(tx.sells) || 0,
  };
}
function fromDex(p, now) {
  return {
    key: p?.baseToken?.address || '',
    age_h: p?.pairCreatedAt ? Math.max(0, (now - p.pairCreatedAt) / 3600000) : null,
    change_24h: num(p?.priceChange?.h24),
    change_6h: num(p?.priceChange?.h6),
    change_1h: num(p?.priceChange?.h1),
    volume_24h: num(p?.volume?.h24) || 0,
    liquidity: num(p?.liquidity?.usd) || 0,
    fdv: num(p?.fdv) || num(p?.marketCap) || 0,
    buys: num(p?.txns?.h24?.buys) || 0,
    sells: num(p?.txns?.h24?.sells) || 0,
  };
}
/** One pool per token (the most liquid one), tokens with no trading or no price change dropped. */
function tidy(pools, minLiquidity) {
  const best = new Map();
  for (const p of pools) {
    if (!p.key || p.key.endsWith(SOL) || p.change_24h === null || p.volume_24h <= 0 || p.liquidity < minLiquidity) continue;
    const seen = best.get(p.key);
    if (!seen || p.liquidity > seen.liquidity) best.set(p.key, p);
  }
  return [...best.values()];
}

async function trendingPools(now) {
  try {
    const pages = await Promise.all([1, 2].map((n) => getJson(`${GT}/networks/solana/trending_pools?page=${n}`).catch((e) => (n === 1 ? Promise.reject(e) : { data: [] }))));
    const pools = tidy(pages.flatMap((p) => (Array.isArray(p?.data) ? p.data : [])).map((i) => fromGecko(i, now)), 5000);
    if (pools.length >= 6) return { pools, source: 'trending pools' };
  } catch { /* fall through to the second source */ }
  const boosts = await getJson(`${DS}/token-boosts/top/v1`);
  const mints = [...new Set((Array.isArray(boosts) ? boosts : []).filter((b) => b?.chainId === 'solana' && b.tokenAddress).map((b) => b.tokenAddress))].slice(0, 30);
  if (!mints.length) throw Object.assign(new Error('no market data'), { code: 'market' });
  const pairs = await getJson(`${DS}/tokens/v1/solana/${mints.join(',')}`);
  const pools = tidy((Array.isArray(pairs) ? pairs : pairs?.pairs || []).filter((p) => p?.chainId === 'solana').map((p) => fromDex(p, now)), 5000);
  if (pools.length < 4) throw Object.assign(new Error('no market data'), { code: 'market' });
  return { pools, source: 'promoted tokens' };
}

async function solPrice() {
  const data = await getJson(`${DS}/latest/dex/tokens/${SOL}`);
  const stable = new Set(['USDC', 'USDT']);
  const pairs = (data?.pairs || []).filter((p) => p?.chainId === 'solana' && p.baseToken?.address === SOL && stable.has(p.quoteToken?.symbol));
  if (!pairs.length) return null;
  pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  const p = pairs[0];
  return { price: num(p.priceUsd), change_24h: num(p.priceChange?.h24), change_6h: num(p.priceChange?.h6) };
}

// ---------- the three readings the agent can ask for ----------
/** The sky: SOL and the overall colour of the day. Also keeps the pools for readMovers. */
export async function readSky(state, now = Date.now()) {
  if (state.sky) return state.sky;
  const [sol, trend] = await Promise.all([solPrice().catch(() => null), trendingPools(now)]);
  state.pools = trend.pools;
  const changes = trend.pools.map((p) => p.change_24h);
  const green = changes.filter((c) => c > 0).length;
  const buys = trend.pools.reduce((s, p) => s + p.buys, 0), sells = trend.pools.reduce((s, p) => s + p.sells, 0);
  state.sky = {
    sol_price_usd: sol?.price ? round(sol.price, 2) : null,
    sol_change_24h_pct: sol?.change_24h !== null && sol?.change_24h !== undefined ? round(sol.change_24h) : null,
    sol_change_6h_pct: sol?.change_6h !== null && sol?.change_6h !== undefined ? round(sol.change_6h) : null,
    tokens_read: trend.pools.length,
    tokens_from: trend.source,
    green_tokens: green,
    red_tokens: trend.pools.length - green,
    median_change_24h_pct: round(median(changes)),
    volume_24h_usd: Math.round(trend.pools.reduce((s, p) => s + p.volume_24h, 0)),
    buy_orders: buys,
    sell_orders: sells,
    buy_share_pct: buys + sells ? Math.round((buys / (buys + sells)) * 100) : null,
  };
  return state.sky;
}

const age = (h) => (h === null ? null : h < 48 ? `${Math.max(1, Math.round(h))} hours` : `${Math.round(h / 24)} days`);
/** The movers: the biggest winners, the biggest losers and the busiest tokens of the day, under short ids. */
export async function readMovers(state, now = Date.now()) {
  if (state.movers) return state.movers;
  if (!state.pools) await readSky(state, now);
  const pools = state.pools;
  const row = (p, kind) => ({ kind, change_24h_pct: round(p.change_24h), change_1h_pct: round(p.change_1h), age: age(p.age_h), volume_24h_usd: Math.round(p.volume_24h), liquidity_usd: Math.round(p.liquidity), value_usd: Math.round(p.fdv), buy_orders: p.buys, sell_orders: p.sells });
  const used = new Set(); const out = [];
  const take = (list, kind, n) => { for (const p of list) { if (out.filter((r) => r.kind === kind).length >= n) break; if (used.has(p.key)) continue; used.add(p.key); out.push(row(p, kind)); } };
  take([...pools].filter((p) => p.change_24h > 0).sort((a, b) => b.change_24h - a.change_24h), 'winner', 4);
  take([...pools].filter((p) => p.change_24h < 0).sort((a, b) => a.change_24h - b.change_24h), 'loser', 4);
  take([...pools].sort((a, b) => b.volume_24h - a.volume_24h), 'busiest', 2);
  state.movers = { tokens: out.map((r, i) => ({ id: `T${i + 1}`, ...r })), note: 'Tokens have no names here. Refer to them by what they did, never by a name or ticker.' };
  return state.movers;
}

/** The newborns: the newest pools on the chain right now. */
export async function readNewborns(state, now = Date.now()) {
  if (state.newborns) return state.newborns;
  let pools = [];
  try {
    const page = await getJson(`${GT}/networks/solana/new_pools?page=1`);
    pools = (Array.isArray(page?.data) ? page.data : []).map((i) => fromGecko(i, now)).filter((p) => p.key && p.age_h !== null);
  } catch { pools = []; }
  if (!pools.length) { state.newborns = { found: false, note: 'The nursery did not answer today.' }; return state.newborns; }
  const mins = pools.map((p) => p.age_h * 60);
  const moved = pools.map((p) => p.change_1h ?? p.change_24h).filter((c) => c !== null);
  state.newborns = {
    found: true,
    newest_tokens_read: pools.length,
    youngest_minutes: Math.max(1, Math.round(Math.min(...mins))),
    oldest_minutes: Math.round(Math.max(...mins)),
    born_in_last_hour: mins.filter((m) => m <= 60).length,
    already_red: moved.filter((c) => c < 0).length,
    already_down_by_half: moved.filter((c) => c <= -50).length,
    worst_change_pct: moved.length ? round(Math.min(...moved)) : null,
    best_change_pct: moved.length ? round(Math.max(...moved)) : null,
  };
  return state.newborns;
}

// ---------- numbers decided by code ----------
/** Mood of the day from -1 (deep red) to 1 (deep green). */
export function moodOf(sky) {
  const sol = sky.sol_change_24h_pct ?? 0;
  const share = sky.tokens_read ? sky.green_tokens / sky.tokens_read : 0.5;
  const m = Math.max(-1, Math.min(1, sol / 8)) * 0.5 + (share - 0.5) * 2 * 0.5;
  return Math.max(-1, Math.min(1, m));
}
export const moodWord = (m) => (m <= -0.25 ? 'red' : m >= 0.25 ? 'green' : 'mixed');

// Small seeded generator: the same date always gives the same chart.
function seeded(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
export const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'the Moon'];
/**
 * The chart of the day: a score out of 10 and a planet to blame for every sign, and one planet for the whole day.
 * Drawn by code from the date and the mood of the market, so the model never invents a number.
 */
export function drawChart(date, mood) {
  const rnd = seeded(`chart ${date}`);
  const base = 5.5 + mood * 2.5;
  const signs = SIGNS.map((id) => ({
    id,
    score: Math.max(1, Math.min(10, Math.round(base + (rnd() * 2 - 1) * 3.2))),
    planet: PLANETS[Math.floor(rnd() * PLANETS.length)],
  }));
  // Mercury takes the blame twice as often as anyone else: tradition.
  const pool = ['Mercury', ...PLANETS];
  return { planet: pool[Math.floor(rnd() * pool.length)], signs };
}
