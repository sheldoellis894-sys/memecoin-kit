// The agent loop: the model chooses which tool to call, the server runs it and reports every step.
// It ends when the model files the review (or after a fixed number of turns, when the review is forced).
import { buildFacts, factsForModel, shortMint } from './facts.js';
import { fetchTransactions, lookUpToken, cleanLabel } from './chain.js';

const API = 'https://api.anthropic.com/v1/messages';
const MAX_TURNS = 6;
const MAX_LOOKUPS = 4;

const TOOLS = [
  {
    name: 'read_trades',
    description: 'Reads the latest transactions of the wallet under inspection and returns trading facts: totals and a table of the tokens that matter most. Call this first. Takes no input.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'look_up_token',
    description: 'Looks up one token from the read_trades table on a public market data service: symbol, age in days, liquidity, market cap, 24h change, and how the current price compares with what this wallet paid. Use the short id from the table, for example "T2".',
    input_schema: { type: 'object', properties: { id: { type: 'string', description: 'Short id of the token from read_trades, e.g. T1' } }, required: ['id'] },
  },
  {
    name: 'file_review',
    description: 'Files the entry in the guide and ends the inspection. Call exactly once, after reading the trades.',
    input_schema: {
      type: 'object',
      properties: {
        stars: { type: 'integer', minimum: 0, maximum: 5, description: 'Rating from the star scale' },
        name: { type: 'string', description: 'The name the guide gives this establishment. Invented, in restaurant style, max 34 characters. No real names.' },
        cuisine: { type: 'string', description: 'What this kitchen specialises in, from the facts. Max 60 characters.' },
        average_check: { type: 'string', description: 'The average buy size in SOL, phrased as an average check. Max 40 characters.' },
        opening_hours: { type: 'string', description: 'When this kitchen is busiest, from busiest_hours_utc. Max 48 characters.' },
        dish_of_the_day: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'The single trade or position that defines the wallet, named like a dish. Max 48 characters.' },
            note: { type: 'string', description: 'One or two sentences with the real numbers. Max 150 characters.' },
          },
          required: ['title', 'note'],
        },
        paragraphs: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' }, description: 'Three short paragraphs: arrival and first impression, the main course (what the trading shows), the bill (the totals). Max 300 characters each.' },
        pull_quote: { type: 'string', description: 'The one line people will quote. Max 100 characters.' },
        verdict: { type: 'string', description: 'Closing line of the entry. Max 70 characters.' },
      },
      required: ['stars', 'name', 'cuisine', 'average_check', 'opening_hours', 'dish_of_the_day', 'paragraphs', 'pull_quote', 'verdict'],
    },
  },
];

const clip = (s, max) => {
  const t = String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

export function cleanReview(r) {
  const p = Array.isArray(r?.paragraphs) ? r.paragraphs : [];
  return {
    stars: Math.max(0, Math.min(5, Math.round(Number(r?.stars) || 0))),
    name: clip(r?.name, 40) || 'The Unnamed Table',
    cuisine: clip(r?.cuisine, 70),
    average_check: clip(r?.average_check, 48),
    opening_hours: clip(r?.opening_hours, 56),
    dish_of_the_day: { title: clip(r?.dish_of_the_day?.title, 56), note: clip(r?.dish_of_the_day?.note, 180) },
    paragraphs: [0, 1, 2].map((i) => clip(p[i], 360)).filter(Boolean),
    pull_quote: clip(r?.pull_quote, 120),
    verdict: clip(r?.verdict, 84),
  };
}

/** Which required parts of the entry are missing or empty. */
export function missingParts(r) {
  const has = (v) => typeof v === 'string' && v.trim().length > 0;
  const m = [];
  for (const k of ['name', 'cuisine', 'average_check', 'opening_hours', 'pull_quote', 'verdict']) if (!has(r?.[k])) m.push(k);
  if (!has(r?.dish_of_the_day?.title) || !has(r?.dish_of_the_day?.note)) m.push('dish_of_the_day');
  if (!Array.isArray(r?.paragraphs) || r.paragraphs.filter(has).length < 3) m.push('paragraphs');
  return m;
}

/**
 * Last resort: when the model still leaves parts of the entry empty, they are written from the facts
 * in plain sentences, so the card is never half empty and never says more than the numbers do.
 */
export function completeReview(review, facts, label = (m) => shortMint(m)) {
  const r = { ...review, dish_of_the_day: { ...review.dish_of_the_day }, paragraphs: [...(review.paragraphs || [])] };
  const sol = (n) => `${n > 0 ? '+' : ''}${n} SOL`;
  if (!r.cuisine) r.cuisine = `${facts.swaps} swaps in ${facts.tokens_traded} tokens`;
  if (!r.average_check) r.average_check = facts.avg_buy_sol ? `${facts.avg_buy_sol} SOL a plate` : 'Nothing bought in this window';
  if (!r.opening_hours) r.opening_hours = facts.busiest_hours_utc ? `Busiest ${facts.busiest_hours_utc} UTC` : 'No regular hours';
  if (!r.dish_of_the_day.title || !r.dish_of_the_day.note) {
    if (facts.worst) r.dish_of_the_day = { title: `${label(facts.worst.mint)}, sent back`, note: `Closed at ${sol(facts.worst.pnl_sol)} inside the transactions that were read.` };
    else if (facts.bags_still_held) r.dish_of_the_day = { title: 'The bag on the stove', note: `${facts.bags_still_held} bought for ${facts.bags_cost_sol} SOL in total and not sold yet.` };
    else r.dish_of_the_day = { title: 'The house special', note: `${facts.swaps} swaps in ${facts.tokens_traded} tokens. Nothing stands out.` };
  }
  const plain = [
    `The inspector read ${facts.transactions_read} transactions and found ${facts.swaps} swaps in ${facts.tokens_traded} tokens.`,
    facts.positions_judged
      ? `${facts.positions_judged} positions could be judged. ${facts.wins} sold above cost, ${facts.losses} below.`
      : 'Nothing was both bought and sold inside the transactions that were read. The bill could not be added up.',
    `Realized: ${sol(facts.realized_pnl_sol)}. Bags still on the stove: ${facts.bags_still_held}.`,
  ];
  for (let i = 0; i < 3; i++) if (!r.paragraphs[i]) r.paragraphs[i] = plain[i];
  if (!r.pull_quote) r.pull_quote = 'The books were read. The numbers speak.';
  if (!r.verdict) r.verdict = `${r.stars} of 5. By the book.`;
  return r;
}

/** Numbers printed on the card come from code, never from the model. */
export function publicFacts(facts) {
  const { tokens, worst, best, fastest_flip_mint, ...rest } = facts;
  return rest;
}

async function callModel(env, system, messages, force) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.LLM_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.LLM_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 2200,
      system,
      tools: TOOLS,
      tool_choice: force ? { type: 'tool', name: 'file_review' } : { type: 'auto' },
      messages,
    }),
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) throw Object.assign(new Error(`model HTTP ${res.status}`), { code: res.status === 429 || res.status === 529 ? 'busy' : 'model' });
  return res.json();
}

/**
 * Runs one inspection. emit(event) is called for every step:
 *   { type: 'step', text } — what the server did; { type: 'note', text } — the agent's own short remark;
 *   { type: 'facts', facts } — numbers for the card; { type: 'review', review } — the entry.
 */
export async function inspect({ wallet, persona, env, emit }) {
  const short = shortMint(wallet);
  let facts = null, view = null, ids = null, lookups = 0, rewrites = 0;
  const labels = new Map();

  const loadTrades = async () => {
    if (facts) return view;
    emit({ type: 'step', text: `Table for one. Opening the books of ${short}.` });
    const { txs } = await fetchTransactions(wallet, env);
    facts = buildFacts(txs);
    ({ view, ids } = factsForModel(facts));
    emit({ type: 'step', text: `Read ${facts.transactions_read} transactions. Found ${facts.swaps} swaps in ${facts.tokens_traded} tokens.` });
    emit({ type: 'facts', facts: publicFacts(facts) });
    return view;
  };

  const tool = async (name, input) => {
    if (name === 'read_trades') return loadTrades();
    if (name === 'look_up_token') {
      if (!facts) return { error: 'Call read_trades first.' };
      if (lookups >= MAX_LOOKUPS) return { error: 'No more lookups. File the review.' };
      const mint = [...ids].find(([, id]) => id === String(input?.id || '').toUpperCase())?.[0];
      if (!mint) return { error: 'Unknown id. Use an id from the read_trades table.' };
      lookups++;
      let info;
      try { info = await lookUpToken(mint); } catch { info = { found: false, note: 'The market data service did not answer.' }; }
      const t = facts.tokens.find((x) => x.mint === mint);
      if (info.found) {
        labels.set(mint, info.symbol);
        if (info.price_sol && t?.avg_buy_price_sol) info.price_vs_wallet_buy_pct = Math.round((info.price_sol / t.avg_buy_price_sol - 1) * 100);
        delete info.price_sol;
        emit({ type: 'step', text: `Looked into the pantry: ${info.symbol}. ${info.age_days ?? '?'} days old, liquidity $${info.liquidity_usd.toLocaleString('en-US')}.` });
      } else {
        emit({ type: 'step', text: `Looked into the pantry: ${shortMint(mint)}. The shelf is empty.` });
      }
      return info;
    }
    return { error: 'Unknown tool.' };
  };

  // A wallet with nothing to review does not need the model at all.
  await loadTrades();
  if (!facts.swaps) {
    emit({ type: 'step', text: 'Nothing on the menu. Filing a short entry.' });
    emit({ type: 'review', review: cleanReview(persona.emptyReview) });
    return;
  }

  const messages = [{ role: 'user', content: `Inspect the Solana wallet ${wallet} and file one entry in the guide.` }];
  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const force = turn === MAX_TURNS - 1 || rewrites > 0;   // a rewrite must come back as the tool call, nothing else
    const out = await callModel(env, persona.system, messages, force);
    const blocks = Array.isArray(out.content) ? out.content : [];
    const calls = blocks.filter((b) => b.type === 'tool_use');
    if (!force) for (const b of blocks) if (b.type === 'text' && b.text?.trim()) emit({ type: 'note', text: clip(b.text, 140) });

    const filed = calls.find((c) => c.name === 'file_review');
    if (filed) {
      const gaps = missingParts(filed.input);
      // An unfinished entry (the model ran out of room or skipped fields) goes back once for a rewrite.
      if (gaps.length && rewrites < 1 && turn < MAX_TURNS - 1) {
        rewrites++;
        emit({ type: 'step', text: 'The entry came back unfinished. The inspector writes it again.' });
        const results = [];
        for (const c of calls) {
          if (c === filed) results.push({ type: 'tool_result', tool_use_id: c.id, is_error: true, content: `Not filed: the entry is incomplete. Missing or empty: ${gaps.join(', ')}. Call file_review again with every field filled. Write no text before the tool call.` });
          else results.push({ type: 'tool_result', tool_use_id: c.id, content: JSON.stringify(await tool(c.name, c.input)) });
        }
        messages.push({ role: 'assistant', content: blocks });
        messages.push({ role: 'user', content: results });
        continue;
      }
      const review = cleanReview(filed.input);
      emit({ type: 'step', text: 'Entry written. Stars counted.' });
      emit({ type: 'review', review: gaps.length ? cleanReview(completeReview(review, facts, (m) => labels.get(m) || shortMint(m))) : review });
      return;
    }
    if (!calls.length) {
      // The model answered in prose. Ask once more for the tool call.
      messages.push({ role: 'assistant', content: blocks.length ? blocks : [{ type: 'text', text: '…' }] });
      messages.push({ role: 'user', content: 'File the entry now with the file_review tool.' });
      continue;
    }
    const results = [];
    for (const c of calls) {
      const result = await tool(c.name, c.input);
      results.push({ type: 'tool_result', tool_use_id: c.id, content: JSON.stringify(result), ...(result?.error ? { is_error: true } : {}) });
    }
    messages.push({ role: 'assistant', content: blocks });
    messages.push({ role: 'user', content: results });
  }
  throw Object.assign(new Error('no review'), { code: 'model' });
}

export { cleanLabel };
