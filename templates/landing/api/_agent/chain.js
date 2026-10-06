// Reads public chain data for one wallet. Two ways to get the same thing:
//   1) Helius parsed history (one request per 100 transactions);
//   2) plain Solana RPC (one request per transaction) as a fallback, also used when only SOLANA_RPC_URL is set.
// Both are reduced to the same shape: { sig, ts, sol, tokens: [{ mint, delta }] } for the wallet being inspected.
// Token details come from the public DexScreener API.

const LAMPORTS = 1e9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, init = {}, ms = 12000) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
  if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
  return res.json();
}

// ---------- Helius parsed history ----------
function fromEnhanced(tx, wallet) {
  let sol = 0; const tokens = new Map();
  const add = (mint, d) => { if (mint && Number.isFinite(d) && d !== 0) tokens.set(mint, (tokens.get(mint) || 0) + d); };
  if (Array.isArray(tx.accountData) && tx.accountData.length) {
    for (const a of tx.accountData) {
      if (a.account === wallet) sol += (Number(a.nativeBalanceChange) || 0) / LAMPORTS;
      for (const c of a.tokenBalanceChanges || []) {
        if (c.userAccount !== wallet) continue;
        const raw = Number(c.rawTokenAmount?.tokenAmount), dec = Number(c.rawTokenAmount?.decimals) || 0;
        add(c.mint, raw / 10 ** dec);
      }
    }
  } else {
    for (const n of tx.nativeTransfers || []) {
      if (n.toUserAccount === wallet) sol += (Number(n.amount) || 0) / LAMPORTS;
      if (n.fromUserAccount === wallet) sol -= (Number(n.amount) || 0) / LAMPORTS;
    }
    for (const t of tx.tokenTransfers || []) {
      if (t.toUserAccount === wallet) add(t.mint, Number(t.tokenAmount));
      if (t.fromUserAccount === wallet) add(t.mint, -Number(t.tokenAmount));
    }
  }
  return { sig: tx.signature, ts: Number(tx.timestamp) || 0, sol, tokens: [...tokens].map(([mint, delta]) => ({ mint, delta })) };
}

async function viaHelius(wallet, key, pages) {
  const out = []; let before = '';
  for (let i = 0; i < pages; i++) {
    const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${key}&limit=100${before ? `&before=${before}` : ''}`;
    const page = await getJson(url);
    if (!Array.isArray(page) || !page.length) break;
    for (const tx of page) if (!tx.transactionError) out.push(fromEnhanced(tx, wallet));
    before = page[page.length - 1].signature;
    if (page.length < 100) break;
  }
  return out;
}

// ---------- Plain RPC ----------
async function rpc(url, method, params) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
  const data = await getJson(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
  if (data.error) { const e = new Error(data.error.message || 'RPC error'); e.status = 502; throw e; }
  return data.result;
}

function fromRpc(tx, sig, wallet) {
  const meta = tx?.meta; if (!meta || meta.err) return null;
  const keys = (tx.transaction?.message?.accountKeys || []).map((k) => (typeof k === 'string' ? k : k.pubkey));
  const i = keys.indexOf(wallet);
  const sol = i >= 0 ? ((meta.postBalances?.[i] || 0) - (meta.preBalances?.[i] || 0)) / LAMPORTS : 0;
  const bal = new Map();
  const read = (list, sign) => {
    for (const b of list || []) {
      if (b.owner !== wallet) continue;
      const amount = Number(b.uiTokenAmount?.amount) / 10 ** (Number(b.uiTokenAmount?.decimals) || 0);
      bal.set(b.mint, (bal.get(b.mint) || 0) + sign * amount);
    }
  };
  read(meta.postTokenBalances, 1); read(meta.preTokenBalances, -1);
  return { sig, ts: Number(tx.blockTime) || 0, sol, tokens: [...bal].filter(([, d]) => d !== 0).map(([mint, delta]) => ({ mint, delta })) };
}

async function viaRpc(wallet, url, limit) {
  const sigs = await rpc(url, 'getSignaturesForAddress', [wallet, { limit }]);
  const good = (sigs || []).filter((s) => !s.err).map((s) => s.signature);
  const out = [];
  for (let i = 0; i < good.length; i += 6) {
    const chunk = good.slice(i, i + 6);
    const got = await Promise.all(chunk.map((sig) => rpc(url, 'getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }])
      .then((tx) => fromRpc(tx, sig, wallet)).catch(() => null)));
    for (const g of got) if (g) out.push(g);
    if (i + 6 < good.length) await sleep(650);   // free RPC plans allow about ten requests a second
  }
  return out;
}

/** Latest transactions of the wallet, newest first. Returns { txs, source }. */
export async function fetchTransactions(wallet, env) {
  const key = env.HELIUS_API_KEY;
  if (key) {
    try {
      return { txs: await viaHelius(wallet, key, Number(env.AGENT_PAGES) || 2), source: 'parsed' };
    } catch (e) {
      // 401/403: the plan has no parsed history. 404/5xx: try the plain RPC before giving up.
      if (e.status === 429) throw Object.assign(new Error('rate'), { code: 'busy' });
    }
  }
  const url = env.SOLANA_RPC_URL || (key ? `https://mainnet.helius-rpc.com/?api-key=${key}` : '');
  if (!url) throw Object.assign(new Error('no data source'), { code: 'closed' });
  try {
    return { txs: await viaRpc(wallet, url, Number(env.AGENT_RPC_LIMIT) || 48), source: 'rpc' };
  } catch (e) {
    throw Object.assign(new Error('chain data failed'), { code: e.status === 429 ? 'busy' : 'chain' });
  }
}

// ---------- Token details ----------
/** Labels come from the chain and are written by anyone: keep a short plain subset before they reach the model or the page. */
export const cleanLabel = (s, max = 18) => String(s || '').replace(/[^A-Za-z0-9 ._$-]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function lookUpToken(mint) {
  const data = await getJson(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {}, 8000);
  const pairs = (data?.pairs || []).filter((p) => p.chainId === 'solana' && p.baseToken?.address === mint);
  if (!pairs.length) return { found: false, note: 'No trading pair found. The token may be gone.' };
  pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  const p = pairs[0];
  const inSol = p.quoteToken?.symbol === 'SOL' || p.quoteToken?.address === 'So11111111111111111111111111111111111111112';
  return {
    found: true,
    symbol: cleanLabel(p.baseToken?.symbol, 12) || 'UNNAMED',
    name: cleanLabel(p.baseToken?.name, 24),
    age_days: p.pairCreatedAt ? Math.max(0, Math.round((Date.now() - p.pairCreatedAt) / 86400000)) : null,
    liquidity_usd: Math.round(p.liquidity?.usd || 0),
    market_cap_usd: Math.round(p.marketCap || p.fdv || 0),
    volume_24h_usd: Math.round(p.volume?.h24 || 0),
    change_24h_pct: Number.isFinite(p.priceChange?.h24) ? p.priceChange.h24 : null,
    price_sol: inSol ? Number(p.priceNative) || null : null,
  };
}
