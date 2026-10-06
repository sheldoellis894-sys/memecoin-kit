// Checks the agent function without keys: Helius, DexScreener and the model API are replaced by scripted answers.
// Run inside templates/landing:  node tests/agent.test.mjs
import assert from 'node:assert/strict';
import { install, goodScript, WALLET } from './mock.mjs';
const { handle } = await import(new URL('../api/inspect.js', import.meta.url));
const ENV = { PROJECT: 'chefrekt', LLM_API_KEY: 'k', HELIUS_API_KEY: 'h', AGENT_PER_IP: '50' };
const post = (address, env = ENV, headers = {}) => handle(new Request('https://thechefrekt.vercel.app/api/inspect', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://thechefrekt.vercel.app', host: 'thechefrekt.vercel.app', 'x-forwarded-for': '1.2.3.4', ...headers }, body: JSON.stringify({ address }) }), env);
const lines = async (res) => (await res.text()).trim().split('\n').map((l) => JSON.parse(l));

// 1. Happy path
let calls = install({ modelScript: goodScript });
let res = await post(WALLET); assert.equal(res.status, 200);
let ev = await lines(res);
console.log(ev.map((e) => e.type + (e.text ? ': ' + e.text : e.code ? ': ' + e.code : '')).join('\n'));
assert.equal(ev.at(-1).type, 'done');
const review = ev.find((e) => e.type === 'review').review; const facts = ev.find((e) => e.type === 'facts').facts;
assert.equal(review.stars, 1); assert.equal(review.paragraphs.length, 3);
assert.equal(facts.swaps, 9); assert.equal(facts.tokens_traded, 4); assert.equal(facts.realized_pnl_sol, -1.85); assert.equal(facts.bags_still_held, 1); assert.equal(facts.bags_cost_sol, 3.5);
assert.equal(facts.wins, 1); assert.equal(facts.losses, 2); assert.ok(!('tokens' in facts));
assert.equal(calls.helius, 1); assert.equal(calls.dex, 2); assert.equal(calls.model, 3);
// the model never sees mints or raw labels
const sent = JSON.stringify(calls.bodies);
assert.ok(!sent.includes('AAAA1111')); assert.ok(!sent.includes('<all>')); assert.ok(sent.includes('IGNOREall RU'));
assert.ok(sent.includes('price_vs_wallet_buy_pct'));
console.log('1 ok: happy path', JSON.stringify(facts));

// 2. Model answers in prose, then never files: review is forced on the last turn
calls = install({ modelScript: (i, body) => body.tool_choice.type === 'tool'
  ? { content: [{ type: 'tool_use', id: 'f', name: 'file_review', input: { stars: 9, name: 'X'.repeat(90), paragraphs: ['a', 'b'], dish_of_the_day: {} } }] }
  : { content: [{ type: 'text', text: 'I would rather chat.' }] } });
ev = await lines(await post(WALLET));
const forced = ev.find((e) => e.type === 'review').review;
assert.equal(forced.stars, 5); assert.ok(forced.name.length <= 40); assert.equal(calls.model, 6);
console.log('2 ok: forced review, clamped');

// 3. Empty wallet: no model call
calls = install({ modelScript: goodScript, empty: true });
ev = await lines(await post(WALLET));
assert.equal(calls.model, 0); assert.equal(ev.find((e) => e.type === 'review').review.name, 'The Empty Room');
console.log('3 ok: empty wallet');

// 4. Parsed history refused → plain RPC fallback
calls = install({ modelScript: goodScript, heliusStatus: 403 });
ev = await lines(await post(WALLET));
const f4 = ev.find((e) => e.type === 'facts').facts;
assert.equal(f4.swaps, 2); assert.equal(f4.realized_pnl_sol, -0.7);
console.log('4 ok: rpc fallback', f4.swaps, f4.realized_pnl_sol);

// 5. Model down → error code, no leak
calls = install({ modelScript: () => ({ status: 529 }) });
ev = await lines(await post(WALLET));
assert.deepEqual(ev.at(-1), { type: 'error', code: 'busy' });
console.log('5 ok: model busy');

// 6. Guards
install({ modelScript: goodScript });
assert.equal((await post('not-an-address')).status, 400);
assert.equal((await post('0OIl' + 'a'.repeat(40))).status, 400);
assert.equal((await post(WALLET, { ...ENV, PROJECT: 'tenkeys' })).status, 404);
assert.equal((await post(WALLET, { PROJECT: 'chefrekt' })).status, 503);
assert.equal((await post(WALLET, ENV, { origin: 'https://evil.example' })).status, 403);
const g = await handle(new Request('https://x/api/inspect'), ENV); assert.deepEqual(await g.json(), { live: true });
const g2 = await handle(new Request('https://x/api/inspect'), { PROJECT: 'chefrekt' }); assert.deepEqual(await g2.json(), { live: false });
const lim = { ...ENV, AGENT_PER_IP: '2' };
const h = { 'x-forwarded-for': '9.9.9.9' };
assert.equal((await post(WALLET, lim, h)).status, 200); assert.equal((await post(WALLET, lim, h)).status, 200); assert.equal((await post(WALLET, lim, h)).status, 429);
console.log('6 ok: guards and limits');
