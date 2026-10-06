// Turns raw wallet transactions into plain trading facts. Pure functions, no network.
// A "trade" here is one transaction where the wallet's balance of exactly one token changed
// against SOL (or a stablecoin). Everything else (transfers, airdrops, token-to-token) is skipped.

export const WSOL = 'So11111111111111111111111111111111111111112';
export const STABLES = new Set([
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
]);

const round = (n, d = 3) => { const k = 10 ** d; return Math.round(n * k) / k; };
export const shortMint = (m) => `${m.slice(0, 4)}…${m.slice(-4)}`;

/** tx = { sig, ts (seconds), sol (SOL delta of the wallet), tokens: [{ mint, delta }] } */
export function classify(tx) {
  let sol = tx.sol || 0, usd = 0;
  const others = [];
  for (const t of tx.tokens || []) {
    if (!t || !t.mint || !Number.isFinite(t.delta) || t.delta === 0) continue;
    if (t.mint === WSOL) sol += t.delta;
    else if (STABLES.has(t.mint)) usd += t.delta;
    else others.push(t);
  }
  if (others.length !== 1) return null;
  const t = others[0];
  const inUsd = Math.abs(usd) > 0.01;
  const quote = inUsd ? usd : sol;
  if (t.delta > 0 && quote < -0.0005) return { side: 'buy', mint: t.mint, amount: t.delta, quote: -quote, unit: inUsd ? 'usd' : 'sol', ts: tx.ts };
  if (t.delta < 0 && quote > 0.0005) return { side: 'sell', mint: t.mint, amount: -t.delta, quote, unit: inUsd ? 'usd' : 'sol', ts: tx.ts };
  return null;
}

export function buildFacts(txs) {
  const trades = [];
  for (const tx of txs) { const c = classify(tx); if (c) trades.push(c); }
  trades.sort((a, b) => a.ts - b.ts);

  const byMint = new Map();
  for (const tr of trades) {
    let p = byMint.get(tr.mint);
    if (!p) byMint.set(tr.mint, p = { mint: tr.mint, buys: 0, sells: 0, solIn: 0, solOut: 0, usdIn: 0, usdOut: 0, bought: 0, sold: 0, firstBuy: 0, firstSell: 0, lastSell: 0, lastTs: 0 });
    if (tr.side === 'buy') {
      p.buys++; p.bought += tr.amount; if (!p.firstBuy) p.firstBuy = tr.ts;
      if (tr.unit === 'sol') p.solIn += tr.quote; else p.usdIn += tr.quote;
    } else {
      p.sells++; p.sold += tr.amount; if (!p.firstSell) p.firstSell = tr.ts; p.lastSell = tr.ts;
      if (tr.unit === 'sol') p.solOut += tr.quote; else p.usdOut += tr.quote;
    }
    p.lastTs = tr.ts;
  }

  const tokens = [...byMint.values()].map((p) => {
    const soldShare = p.bought > 0 ? Math.min(1, p.sold / p.bought) : (p.sold > 0 ? 1 : 0);
    let status = 'holding';
    if (p.buys === 0) status = 'sold_only';            // bought before the window we can see
    else if (soldShare >= 0.9) status = 'closed';
    else if (soldShare >= 0.1) status = 'partial';
    const pnl = p.buys > 0 && p.sells > 0 ? p.solOut - p.solIn * soldShare : null;
    const flip = p.firstBuy && p.firstSell && p.firstSell >= p.firstBuy ? p.firstSell - p.firstBuy : null;
    return {
      mint: p.mint, buys: p.buys, sells: p.sells,
      sol_in: round(p.solIn), sol_out: round(p.solOut),
      usd_in: round(p.usdIn, 2), usd_out: round(p.usdOut, 2),
      pnl_sol: pnl === null ? null : round(pnl),
      status, flip_seconds: flip,
      avg_buy_price_sol: p.bought > 0 && p.solIn > 0 ? p.solIn / p.bought : null,
      remaining: Math.max(0, p.bought - p.sold),
      last_ts: p.lastTs,
    };
  });

  const judged = tokens.filter((t) => t.pnl_sol !== null && t.status !== 'holding');
  const wins = judged.filter((t) => t.pnl_sol > 0.0005);
  const losses = judged.filter((t) => t.pnl_sol < -0.0005);
  const realized = judged.reduce((s, t) => s + t.pnl_sol, 0);
  const buys = trades.filter((t) => t.side === 'buy');
  const solBuys = buys.filter((t) => t.unit === 'sol').map((t) => t.quote).sort((a, b) => a - b);
  const bags = tokens.filter((t) => t.status === 'holding' && t.sol_in > 0);
  const flips = tokens.filter((t) => t.flip_seconds !== null).sort((a, b) => a.flip_seconds - b.flip_seconds);
  const byPnl = [...judged].sort((a, b) => a.pnl_sol - b.pnl_sol);

  // Busiest three-hour window, UTC
  const hours = new Array(24).fill(0);
  for (const t of trades) hours[new Date(t.ts * 1000).getUTCHours()]++;
  let bestStart = 0, best = -1;
  for (let h = 0; h < 24; h++) { const n = hours[h] + hours[(h + 1) % 24] + hours[(h + 2) % 24]; if (n > best) { best = n; bestStart = h; } }
  const night = trades.filter((t) => { const h = new Date(t.ts * 1000).getUTCHours(); return h < 6; }).length;

  const first = trades[0]?.ts || 0, last = trades[trades.length - 1]?.ts || 0;
  const pad = (n) => String(n).padStart(2, '0');

  return {
    transactions_read: txs.length,
    swaps: trades.length,
    buys: buys.length,
    sells: trades.length - buys.length,
    tokens_traded: tokens.length,
    period_days: first ? Math.max(1, Math.round((last - first) / 86400)) : 0,
    volume_sol: round(trades.filter((t) => t.unit === 'sol').reduce((s, t) => s + t.quote, 0), 2),
    avg_buy_sol: solBuys.length ? round(solBuys.reduce((s, v) => s + v, 0) / solBuys.length) : 0,
    median_buy_sol: solBuys.length ? round(solBuys[Math.floor(solBuys.length / 2)]) : 0,
    positions_judged: judged.length,
    wins: wins.length,
    losses: losses.length,
    win_rate_pct: judged.length ? Math.round((wins.length / judged.length) * 100) : null,
    realized_pnl_sol: round(realized, 2),
    bags_still_held: bags.length,
    bags_cost_sol: round(bags.reduce((s, t) => s + t.sol_in, 0), 2),
    rebought_three_times_or_more: tokens.filter((t) => t.buys >= 3).length,
    fastest_flip_seconds: flips.length ? flips[0].flip_seconds : null,
    fastest_flip_mint: flips.length ? flips[0].mint : null,
    worst: byPnl.length && byPnl[0].pnl_sol < 0 ? { mint: byPnl[0].mint, pnl_sol: byPnl[0].pnl_sol } : null,
    best: byPnl.length && byPnl[byPnl.length - 1].pnl_sol > 0 ? { mint: byPnl[byPnl.length - 1].mint, pnl_sol: byPnl[byPnl.length - 1].pnl_sol } : null,
    busiest_hours_utc: trades.length ? `${pad(bestStart)}:00–${pad((bestStart + 3) % 24)}:00` : null,
    night_share_pct: trades.length ? Math.round((night / trades.length) * 100) : null,
    tokens,
  };
}

/** What the model sees: totals plus the few tokens that carry the story. Mints are replaced by short ids. */
export function factsForModel(facts, limit = 8) {
  const score = (t) => Math.max(Math.abs(t.pnl_sol || 0), t.sol_in, t.sol_out);
  const top = [...facts.tokens].sort((a, b) => score(b) - score(a)).slice(0, limit);
  const idOf = new Map(top.map((t, i) => [t.mint, `T${i + 1}`]));
  const ref = (m) => (m ? idOf.get(m) || null : null);
  const { tokens, worst, best, fastest_flip_mint, ...totals } = facts;
  return {
    ids: idOf,
    view: {
      ...totals,
      fastest_flip_token: ref(fastest_flip_mint),
      worst_token: worst ? { id: ref(worst.mint), pnl_sol: worst.pnl_sol } : null,
      best_token: best ? { id: ref(best.mint), pnl_sol: best.pnl_sol } : null,
      tokens: top.map((t) => ({
        id: idOf.get(t.mint), buys: t.buys, sells: t.sells, sol_in: t.sol_in, sol_out: t.sol_out,
        pnl_sol: t.pnl_sol, status: t.status, flip_seconds: t.flip_seconds,
      })),
      note: 'Amounts are SOL. pnl_sol is realized profit or loss inside the transactions that were read. status "holding" = bought and not sold yet.',
    },
  };
}
