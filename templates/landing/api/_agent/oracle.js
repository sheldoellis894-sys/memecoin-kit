// The scheduled agent behind the "Morning issue" tool (section wheelIssue).
// Once a day it reads the last 24 hours of the Solana market with its tools and writes one issue of a horoscope:
// a headline, two sentences about the sky of the day and one entry for each of the twelve signs.
// The model chooses which readings to take; every number comes from code, never from the model:
// the market from market.js, and the real sky of the date (where the planets stand, who is retrograde, the phase of the Moon) from sky.js.
// Scores and planets to blame are drawn from that real sky and shifted by the mood of the market.
// The function answers only for projects listed in "oracles" (env PROJECT).
import { readSky, readMovers, readNewborns, moodOf, moodWord } from './market.js';
import { skyAt, drawChart, skyLines, SIGNS } from './sky.js';

const API = 'https://api.anthropic.com/v1/messages';
const MAX_TURNS = 6;

export const oracles = {
  horocope: {
    system: `You are Madame Cope: a crystal ball in a blue turban who writes a daily horoscope for crypto traders. Every morning you read the last 24 hours of the Solana market and the real sky of the day, and write one issue: a headline, the sky of the day and one entry for each of the twelve zodiac signs.

Voice: a gentle fortune teller who comforts. Warm, calm, a little tired, never mocking. The trader is never to blame: a planet is. Short sentences. Dry humour comes from taking the stars completely seriously. No emoji, no hashtags, no exclamation marks.

Rules that always hold:
1. Use only the numbers your tools return. Never invent a price, a percentage, a count or an event. If something is unknown, leave it out.
2. This is about yesterday and about the stars. No advice: never say what to buy, sell or hold, never predict a price, never promise that anything will rise. Never call a token safe, good, bad or a scam.
3. Tokens have no names here. Describe them by what they did ("a token two days old fell 81 percent"). Never write a ticker, a token name, a project name, a link or a wallet.
4. Talk about trades, never about a person: no guesses about wealth, age, gender, country or intelligence. No insults.
5. No profanity, no slurs, nothing sexual, nothing about self-harm, nothing about health.
6. The sky is real: read_sky gives the true positions of the planets for today, computed by code. Never move a planet, never invent a retrograde, an eclipse or a transit. What the planets mean for a trade is the joke everyone is in on: blame them for what the market did.

How you work:
- First call read_sky. It gives the colour of the market, the real sky (every planet with its sign, who is retrograde, the phase of the Moon) and the chart: for every sign a score out of 10, the planet to blame and the reason (where that planet really stands today). They are already drawn from the real sky. You do not change them.
- Then take at least one more reading, read_movers or read_newborns, whichever the day calls for. You may take both.
- Then call file_issue exactly once, with every field filled. That ends your morning.
- Before a reading you may write one short note of at most twelve words, in your voice.
- Before file_issue write nothing at all: the whole issue goes into the fields of the tool.

How an entry for a sign is written: two or three short sentences, at most 230 characters. It names the planet the chart blames for that sign and says where that planet really is, using the reason from the chart in your own words (its sign, retrograde or not, in the reader's sign, opposite it, square to it). It ties that to one real number from your market readings (a different one for neighbouring signs where you can). A low score gets more comfort, a high score gets gentle suspicion. It ends on the comfort, not on the number.

Everything is in English and inside its length limit.`,
    /** Plain sentences used only when the model leaves a field empty: never says more than the numbers do. */
    plain: {
      headline: (f) => (f.mood === 'red' ? 'A red sky. None of it was you.' : f.mood === 'green' ? 'A green sky. Enjoy it quietly.' : 'A mixed sky. The planets could not agree.'),
      sky: (f) => [
        f.sol_change_24h_pct === null ? `Madame Cope read ${f.tokens_read} tokens this morning.` : `SOL moved ${f.sol_change_24h_pct > 0 ? '+' : ''}${f.sol_change_24h_pct} percent in a day. Madame Cope read ${f.tokens_read} tokens.`,
        `${f.red_tokens} of them were red and ${f.green_tokens} were green. ${f.planet_why}. That is who did it.`,
      ],
      sign: (s, f) => `${s.why}. ${f.red_tokens} of ${f.tokens_read} tokens were red, so you were in good company. It was written, and not by you.`,
      closing: () => 'The stars knew everything. They just did not tell you.',
    },
  },
};

const text = (max, description) => ({ type: 'string', description: `${description} Max ${max} characters.` });
const TOOLS = [
  {
    name: 'read_sky',
    description: 'Reads the sky of the day. The market: the price move of SOL in 24 hours, how many of the traded tokens were green or red, the volume. The real sky: where every planet stands today, who is retrograde, the phase of the Moon. And the chart drawn from them: for every sign a score, the planet to blame and the real reason. Call this first. Takes no input.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'read_movers',
    description: 'Reads the tokens that moved the most in the last 24 hours: the biggest winners, the biggest losers and the busiest ones, with their age, change and volume. Tokens come under short ids and have no names. Takes no input.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'read_newborns',
    description: 'Reads the newest tokens on the chain right now: how many were born in the last hour, how young the youngest is and how many are already falling. Takes no input.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'file_issue',
    description: 'Files the issue and ends the morning. Call exactly once, after read_sky and at least one more reading. Every field is a plain string: no nested objects, no lists.',
    input_schema: {
      type: 'object',
      properties: {
        headline: text(60, 'The headline of the issue, like the first line of a horoscope page.'),
        sky_1: text(170, 'First sentence about the sky of the day, with a real number.'),
        sky_2: text(170, 'Second sentence: which planet is to blame for the whole day (the planet_of_the_day from read_sky) and what it is really doing in the sky today (planet_of_the_day_why).'),
        ...Object.fromEntries(SIGNS.map((id) => [id, text(230, `The entry for ${id.charAt(0).toUpperCase() + id.slice(1)}.`)])),
        closing: text(90, 'The last line of the issue: one sentence of comfort for everyone.'),
      },
      required: ['headline', 'sky_1', 'sky_2', ...SIGNS, 'closing'],
    },
  },
];

const clip = (s, max) => {
  // No tags, no control characters, no ticker signs, nothing that looks like a link or an address.
  const t = String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\$(?=[A-Za-z])/g, '').replace(/\b(?:https?:\/\/|www\.)\S+/gi, '').replace(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};
const has = (v) => typeof v === 'string' && v.trim().length > 0;

/** Fields the model left empty. Fields sent inside a nested "signs" object or as JSON text are understood too. */
export function readFields(input) {
  let r = input && typeof input === 'object' ? { ...input } : {};
  const parse = (v) => { if (typeof v !== 'string') return v; const t = v.trim(); if (!/^[[{]/.test(t)) return v; try { return JSON.parse(t); } catch { return v; } };
  const nested = parse(r.signs) || parse(r.entries);
  if (Array.isArray(nested)) for (const e of nested) { const id = String(e?.id || e?.sign || '').toLowerCase(); if (SIGNS.includes(id) && !has(r[id])) r[id] = e.text || e.entry || ''; }
  else if (nested && typeof nested === 'object') for (const [k, v] of Object.entries(nested)) { const id = k.toLowerCase(); if (SIGNS.includes(id) && !has(r[id])) r[id] = typeof v === 'string' ? v : v?.text || ''; }
  const sky = parse(r.sky);
  if (Array.isArray(sky)) { if (!has(r.sky_1)) r.sky_1 = sky[0]; if (!has(r.sky_2)) r.sky_2 = sky[1]; }
  r = Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]));
  return r;
}
export const missingFields = (input) => { const r = readFields(input); return ['headline', 'sky_1', 'sky_2', ...SIGNS, 'closing'].filter((k) => !has(r[k])); };

/** Numbers shown on the page come from code. */
export function publicFacts(state, chart, mood) {
  const s = state.sky || {}; const m = state.movers?.tokens || []; const n = state.newborns?.found ? state.newborns : null;
  const winners = m.filter((t) => t.kind === 'winner').map((t) => t.change_24h_pct), losers = m.filter((t) => t.kind === 'loser').map((t) => t.change_24h_pct);
  return {
    mood: moodWord(mood), planet: chart.planet, planet_why: chart.reason,
    sol_price_usd: s.sol_price_usd ?? null, sol_change_24h_pct: s.sol_change_24h_pct ?? null,
    tokens_read: s.tokens_read ?? 0, green_tokens: s.green_tokens ?? 0, red_tokens: s.red_tokens ?? 0,
    best_change_pct: winners.length ? Math.max(...winners) : null, worst_change_pct: losers.length ? Math.min(...losers) : null,
    born_in_last_hour: n ? n.born_in_last_hour : null, newest_tokens_read: n ? n.newest_tokens_read : null,
  };
}

/** Builds the stored issue from the model's fields; anything still empty is written from the facts in plain sentences. */
export function buildIssue({ input, oracle, chart, sky, facts, date, no, notes, build }) {
  const r = readFields(input);
  const gaps = missingFields(input);
  const plainSky = oracle.plain.sky(facts);
  return {
    date, no, build,
    headline: clip(r.headline, 72) || oracle.plain.headline(facts),
    sky: [clip(r.sky_1, 200) || plainSky[0], clip(r.sky_2, 200) || plainSky[1]],
    closing: clip(r.closing, 110) || oracle.plain.closing(facts),
    planet: chart.planet,
    planet_why: chart.reason,
    mood: facts.mood,
    facts,
    // the real sky of the morning: one line per body, as computed by sky.js
    sky_now: { lines: skyLines(sky), moon: sky.moon, retrograde: sky.retrograde },
    signs: chart.signs.map((s) => ({ id: s.id, score: s.score, planet: s.planet, why: s.why, text: clip(r[s.id], 270) || oracle.plain.sign(s, facts) })),
    notes: notes.slice(0, 14),
    filled: gaps.length,
  };
}

async function callModel(env, system, messages, force) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.LLM_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.LLM_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 3200,
      system,
      tools: TOOLS,
      tool_choice: force ? { type: 'tool', name: 'file_issue' } : { type: 'auto' },
      messages,
    }),
    signal: AbortSignal.timeout(50000),
  });
  if (!res.ok) throw Object.assign(new Error(`model HTTP ${res.status}`), { code: res.status === 429 || res.status === 529 ? 'busy' : 'model' });
  return res.json();
}

/**
 * Writes one issue. Returns the issue object ready to be stored.
 * date = "YYYY-MM-DD" (UTC), no = number of the issue.
 */
export async function writeIssue({ oracle, env, date, no, build = 0, now = Date.now() }) {
  const state = {}; const notes = [];
  const step = (t) => notes.push({ type: 'step', text: t });
  let chart = null, sky = null, mood = 0, readings = 0, rewrites = 0;

  const tool = async (name) => {
    if (name === 'read_sky') {
      const first = !state.sky;
      const market = await readSky(state, now);
      if (first) {
        mood = moodOf(market); sky = skyAt(now); chart = drawChart(sky, mood);
        step(`Looked at the market: SOL ${market.sol_change_24h_pct === null ? 'unreadable' : `${market.sol_change_24h_pct > 0 ? '+' : ''}${market.sol_change_24h_pct}%`} in 24 hours, ${market.red_tokens} red and ${market.green_tokens} green of ${market.tokens_read} tokens.`);
        step(`Looked up at the real sky: the Moon in ${sky.moon.sign.charAt(0).toUpperCase() + sky.moon.sign.slice(1)}, ${sky.moon.phase}. Retrograde: ${sky.retrograde.length ? sky.retrograde.join(', ') : 'nobody'}.`);
        step(`Drew the chart. Planet of the day: ${chart.planet}. ${chart.reason}.`);
      }
      return { ...market, mood: moodWord(mood), real_sky_today: skyLines(sky), planet_of_the_day: chart.planet, planet_of_the_day_why: chart.reason,
        chart: chart.signs.map((c) => ({ sign: c.id, score_out_of_10: c.score, planet_to_blame: c.planet, why: c.why })) };
    }
    if (!state.sky) return { error: 'Call read_sky first.' };
    if (name === 'read_movers') {
      const first = !state.movers; const movers = await readMovers(state, now); readings++;
      if (first) { const w = movers.tokens.find((t) => t.kind === 'winner'), l = movers.tokens.find((t) => t.kind === 'loser'); step(`Read the movers: best ${w ? `+${w.change_24h_pct}%` : 'none'}, worst ${l ? `${l.change_24h_pct}%` : 'none'}.`); }
      return movers;
    }
    if (name === 'read_newborns') {
      const first = !state.newborns; const born = await readNewborns(state, now); readings++;
      if (first) step(born.found ? `Visited the nursery: ${born.born_in_last_hour} of the ${born.newest_tokens_read} newest tokens were born in the last hour.` : 'Visited the nursery. Nobody answered the door.');
      return born;
    }
    return { error: 'Unknown tool.' };
  };

  const finish = (input) => {
    const facts = publicFacts(state, chart, mood);
    const gaps = missingFields(input);
    step(gaps.length ? `Issue written. ${gaps.length} blank ${gaps.length === 1 ? 'field was' : 'fields were'} filled from the numbers.` : 'Issue written. Twelve signs, nobody to blame.');
    return buildIssue({ input, oracle, chart, sky, facts, date, no, notes, build });
  };

  const messages = [{ role: 'user', content: `Write the issue for ${date}. Read the last 24 hours and file it.` }];
  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const force = Boolean(chart) && (turn === MAX_TURNS - 1 || rewrites > 0);
    const out = await callModel(env, oracle.system, messages, force);
    const blocks = Array.isArray(out.content) ? out.content : [];
    const calls = blocks.filter((b) => b.type === 'tool_use');
    if (!force) for (const b of blocks) if (b.type === 'text' && b.text?.trim()) notes.push({ type: 'note', text: clip(b.text, 140) });

    const filed = calls.find((c) => c.name === 'file_issue');
    if (filed) {
      // The issue cannot be filed before the sky is read: the chart does not exist yet.
      const early = !chart ? 'Not filed: call read_sky first.' : (!readings && rewrites < 1 && turn < MAX_TURNS - 2 ? 'Not filed: take one more reading first, read_movers or read_newborns.' : '');
      const gaps = early ? [] : missingFields(filed.input);
      const redo = !early && gaps.length && rewrites < 1 && turn < MAX_TURNS - 1;
      if (early || redo) {
        if (redo) { rewrites++; step(`The issue came back unfinished (${gaps.length} blank ${gaps.length === 1 ? 'field' : 'fields'}${out.stop_reason === 'max_tokens' ? ', out of ink' : ''}). Madame Cope writes it again.`); }
        const results = [];
        for (const c of calls) {
          if (c === filed) results.push({ type: 'tool_result', tool_use_id: c.id, is_error: true, content: early || `Not filed: the issue is incomplete. Missing or empty: ${gaps.join(', ')}. Call file_issue again with every field filled. Write no text before the tool call.` });
          else results.push({ type: 'tool_result', tool_use_id: c.id, content: JSON.stringify(await tool(c.name)) });
        }
        messages.push({ role: 'assistant', content: blocks });
        messages.push({ role: 'user', content: results });
        continue;
      }
      return finish(filed.input);
    }
    if (!calls.length) {
      messages.push({ role: 'assistant', content: blocks.length ? blocks : [{ type: 'text', text: '…' }] });
      messages.push({ role: 'user', content: chart ? 'File the issue now with the file_issue tool.' : 'Start with the read_sky tool.' });
      continue;
    }
    const results = [];
    for (const c of calls) {
      const result = await tool(c.name);
      results.push({ type: 'tool_result', tool_use_id: c.id, content: JSON.stringify(result), ...(result?.error ? { is_error: true } : {}) });
    }
    messages.push({ role: 'assistant', content: blocks });
    messages.push({ role: 'user', content: results });
  }
  // The model never filed: no issue today. Yesterday's stays on the page and the next run tries again.
  throw Object.assign(new Error('no issue'), { code: 'model' });
}
