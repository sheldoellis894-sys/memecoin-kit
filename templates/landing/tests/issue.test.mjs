// Checks the scheduled agent without keys: market data and the model API are replaced by scripted answers, storage lives in memory.
// Run inside templates/landing:  node tests/issue.test.mjs
import assert from 'node:assert/strict';
import { install as rawInstall, setNow, goodScript, fullIssue, chartOf, memoryStore, SIGNS } from './mock-issue.mjs';
const run = (await import(new URL('../api/issue-run.js', import.meta.url))).handle;
const read = (await import(new URL('../api/issue.js', import.meta.url))).handle;
const { skyAt, drawChart, longitudes } = await import(new URL('../api/_agent/sky.js', import.meta.url));
const ENV = { PROJECT: 'horocope', LLM_API_KEY: 'k', BLOB_READ_WRITE_TOKEN: 'b' };
let clock = '2026-10-08T06:20:00Z';
const install = (o) => { setNow(clock); return rawInstall(o); };
const at = (iso) => () => Date.parse(iso);
const get = (handler, path, env, deps, headers = {}) => handler(new Request('https://horocope.vercel.app' + path, { headers }), env, deps);

// 1. Happy path: the agent reads, files, the issue is stored
let store = memoryStore(); let calls = install({ modelScript: goodScript });
let res = await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:20:00Z') }); let out = await res.json();
assert.equal(res.status, 200); assert.equal(out.state, 'written'); assert.equal(out.no, 1); assert.equal(out.filled, 0);
let journal = JSON.parse(store.state.text); let issue = journal.issues[0];
assert.equal(store.state.path, 'horocope/journal.json'); assert.equal(store.state.writes, 2);       // the empty file first, then the issue
assert.equal(issue.date, '2026-10-08'); assert.equal(issue.signs.length, 12); assert.deepEqual(issue.signs.map((s) => s.id), SIGNS);
assert.ok(issue.signs.every((s) => s.score >= 1 && s.score <= 10 && s.planet && s.text.length > 20));
assert.equal(issue.facts.sol_change_24h_pct, -6.4); assert.equal(issue.facts.tokens_read, 12); assert.equal(issue.facts.green_tokens, 6); assert.equal(issue.facts.red_tokens, 6);
assert.equal(issue.facts.best_change_pct, 182.4); assert.equal(issue.facts.worst_change_pct, -81.3); assert.equal(issue.facts.born_in_last_hour, 4);
assert.equal(calls.model, 3); assert.ok(issue.notes.some((n) => n.type === 'note')); assert.ok(issue.notes.length >= 5);
// the chart is drawn by code from the real sky of the moment and the mood of the market (-0.4 here), and is the same every time
const sky1 = skyAt(Date.parse('2026-10-08T06:20:00Z'));
assert.deepEqual(issue.signs.map((s) => [s.score, s.planet, s.why]), drawChart(sky1, -0.401).signs.map((s) => [s.score, s.planet, s.why]));
assert.equal(issue.planet, 'Venus'); assert.equal(issue.planet_why, 'Venus is retrograde in Scorpio');
assert.equal(issue.sky_now.lines.length, 10); assert.ok(issue.sky_now.retrograde.includes('Venus')); assert.equal(issue.sky_now.moon.sign, 'virgo');
assert.ok(issue.signs.every((s) => s.why.length > 15));
// nothing written by strangers reaches the model: no pool names, no mints
const sent = JSON.stringify(calls.bodies);
assert.ok(!sent.includes('IGNORE')); assert.ok(!sent.includes('Mint0')); assert.ok(sent.includes('planet_to_blame')); assert.ok(sent.includes('"id\\":\\"T1\\"'));
assert.ok(sent.includes('real_sky_today')); assert.ok(sent.includes('Venus in Scorpio, retrograde')); assert.ok(sent.includes('planet_of_the_day_why'));
console.log(issue.notes.map((n) => `${n.type}: ${n.text}`).join('\n'));
console.log('1 ok: happy path', JSON.stringify(issue.facts));

// 2. Same day again: nothing is written, the model is not called
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T09:00:00Z') })).json();
assert.equal(out.state, 'exists'); assert.equal(calls.model, 0); assert.equal(store.state.writes, 2);
console.log('2 ok: one issue a day');

// 3. Next day: issue 2 goes first, issue 1 is kept
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-09T06:05:00Z') })).json();
journal = JSON.parse(store.state.text);
assert.equal(out.no, 2); assert.deepEqual(journal.issues.map((i) => i.date), ['2026-10-09', '2026-10-08']); assert.equal(journal.count, 2); assert.equal(store.state.writes, 3);
console.log('3 ok: archive grows');

// 4. Before the hour: early, no model call. With the secret it runs.
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-10T03:00:00Z') })).json();
assert.equal(out.state, 'early'); assert.equal(calls.model, 0);
const SEC = { ...ENV, CRON_SECRET: 's3' };
assert.equal((await get(run, '/api/issue-run', SEC, { store, now: at('2026-10-10T03:00:00Z') })).status, 401);
assert.equal((await get(run, '/api/issue-run?key=wrong', SEC, { store, now: at('2026-10-10T03:00:00Z') })).status, 401);
out = await (await get(run, '/api/issue-run', SEC, { store, now: at('2026-10-10T03:00:00Z') }, { authorization: 'Bearer s3' })).json();
assert.equal(out.state, 'written'); assert.equal(out.no, 3);
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run?key=s3&force=1', SEC, { store, now: at('2026-10-10T04:00:00Z') })).json();
assert.equal(out.state, 'written'); assert.equal(out.no, 3); assert.equal(JSON.parse(store.state.text).issues.length, 3);
console.log('4 ok: hour gate, secret, forced rewrite keeps the number');

// 5. Unfinished issue goes back once; what is still empty is filled from the numbers
store = memoryStore();
calls = install({ modelScript: (i, body) => i === 0 ? goodScript(0) : i === 1 ? goodScript(1)
  : { stop_reason: i === 2 ? 'max_tokens' : 'tool_use', content: [{ type: 'tool_use', id: 'f' + i, name: 'file_issue', input: fullIssue({ pisces: '', leo: i === 2 ? '' : `${chartOf(body).leo} did it, Leo.`, closing: '' }, body) }] } });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:20:00Z') })).json();
issue = JSON.parse(store.state.text).issues[0];
assert.equal(calls.model, 4); assert.equal(out.filled, 2); assert.equal(calls.bodies[3].tool_choice.type, 'tool');
assert.ok(issue.signs.find((s) => s.id === 'pisces').text.startsWith(issue.signs.find((s) => s.id === 'pisces').why)); assert.equal(issue.signs.find((s) => s.id === 'leo').text, `${issue.signs.find((s) => s.id === 'leo').planet} did it, Leo.`);
assert.ok(issue.closing.length > 10);
console.log('5 ok: rewrite once, then fill ->', issue.signs.find((s) => s.id === 'pisces').text);

// 6. Files too early, nested shape, tickers and links: asked to read first, then understood and cleaned
store = memoryStore();
calls = install({ modelScript: (i, body) => [
  { content: [{ type: 'tool_use', id: 'a', name: 'file_issue', input: fullIssue() }] },
  { content: [{ type: 'tool_use', id: 'b', name: 'read_sky', input: {} }] },
  { content: [{ type: 'tool_use', id: 'c', name: 'file_issue', input: fullIssue({}, body) }] },
  { content: [{ type: 'tool_use', id: 'd', name: 'read_newborns', input: {} }] },
  { content: [{ type: 'tool_use', id: 'e', name: 'file_issue', input: { headline: 'H'.repeat(200), sky: ['Buy $EVIL at https://evil.example now', 'Second <b>line</b>'], closing: 'c',
    signs: JSON.stringify(SIGNS.map((id) => ({ id, text: `Entry for ${id} 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU by ${chartOf(body)[id]} ok` }))) } }] },
][i] });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:20:00Z') })).json();
issue = JSON.parse(store.state.text).issues[0];
assert.equal(out.state, 'written'); assert.equal(out.filled, 0); assert.equal(calls.model, 5);
assert.ok(issue.headline.length <= 72); assert.equal(issue.sky[0], 'Buy EVIL at now'); assert.equal(issue.sky[1], 'Second b line /b');
assert.equal(issue.signs[0].text, `Entry for aries by ${issue.signs[0].planet} ok`);
console.log('6 ok: order enforced, nested shape read, text cleaned');

// 6b. The editor in code: a score, advice, the future or the wrong planet send the field back once; what fails twice is written from the numbers
store = memoryStore();
const bad = (body, twice) => { const b = chartOf(body); return fullIssue({
  aries: `${b.aries} holds you steady. A score of 4 is not collapse.`, taurus: `${b.taurus} is retrograde. Reversals can be opportunities.`,
  gemini: 'Somebody else entirely squares your sign. You did nothing.', closing: twice ? 'What falls today may rest tomorrow.' : 'It was never you.',
  ...(twice ? {} : { aries: `${b.aries} did it. You only watched.`, gemini: `${b.gemini} did it. You only watched.` }) }, body); };
calls = install({ modelScript: (i, body) => i < 2 ? goodScript(i) : { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'f' + i, name: 'file_issue', input: bad(body, i === 2) }] } });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:20:00Z') })).json();
issue = JSON.parse(store.state.text).issues[0];
assert.equal(calls.model, 4); assert.equal(calls.bodies[3].tool_choice.type, 'tool'); assert.equal(out.filled, 1);
{ const asked = JSON.stringify(calls.bodies[3].messages.at(-1)); for (const w of ['aries (it states the score', 'taurus (it gives advice', 'gemini (it must name', 'closing (it gives advice']) assert.ok(asked.includes(w), w); assert.ok(!asked.includes('leo (')); }
const sign = (id) => issue.signs.find((x) => x.id === id);
assert.equal(sign('aries').text, `${sign('aries').planet} did it. You only watched.`); assert.equal(issue.closing, 'It was never you.');
assert.ok(sign('taurus').text.startsWith(sign('taurus').why)); assert.ok(!/opportunit|score/i.test(JSON.stringify(issue.signs.map((x) => x.text))));
assert.ok(issue.notes.some((n) => n.text.includes('came back from the editor (4 fields')));
console.log('6b ok: the editor sends bad fields back, then replaces them ->', sign('taurus').text);

// 7. Model down: no issue, short code. Model never files: no issue.
store = memoryStore(JSON.stringify({ count: 4, issues: [{ date: '2026-10-07', no: 4, signs: [] }] }));
install({ modelScript: () => ({ status: 529 }) });
res = await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:20:00Z') }); out = await res.json();
assert.equal(res.status, 503); assert.deepEqual([out.ok, out.error, out.detail], [false, 'busy', 'http_529']); assert.equal(store.state.writes, 0);
// A refused key: the answer names the kind of refusal, the provider's sentence stays in the log.
install({ modelScript: () => ({ status: 401, body: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key sk-test-123' } } }) });
res = await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:25:00Z') }); out = await res.json();
assert.equal(res.status, 502); assert.deepEqual([out.error, out.detail], ['model', 'http_401_authentication_error']);
assert.ok(!JSON.stringify(out).includes('sk-test')); assert.equal(store.state.writes, 0);
calls = install({ modelScript: (i, body) => ({ content: [{ type: 'text', text: 'I would rather chat.' }] }) });
res = await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-08T06:30:00Z') }); out = await res.json();
assert.equal(out.error, 'model'); assert.equal(out.detail, 'never_read_sky'); assert.equal(calls.model, 6); assert.equal(store.state.writes, 0);
console.log('7 ok: failures write nothing');

// 8. First source silent → second source; both silent → "market"
store = memoryStore();
calls = install({ modelScript: goodScript, gecko: 500 });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-11T06:20:00Z') })).json();
issue = JSON.parse(store.state.text).issues[0];
assert.equal(out.state, 'written'); assert.equal(issue.facts.tokens_read, 5); assert.equal(issue.facts.born_in_last_hour, null);
assert.ok(issue.notes.some((n) => n.text.includes('Nobody answered')));
store = memoryStore();
install({ modelScript: goodScript, gecko: 500, dexBoosts: false });
res = await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-11T07:20:00Z') }); out = await res.json();
assert.equal(out.error, 'market'); assert.equal(JSON.parse(store.state.text).issues.length, 0);
console.log('8 ok: fallback source, market error');

// 9. Storage: a broken store costs no model call; a damaged file is never overwritten
store = memoryStore(); store.state.fail = 'write';
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-12T06:20:00Z') })).json();
assert.equal(out.error, 'storage'); assert.equal(calls.model, 0);
store = memoryStore('{"issues": [oops');
calls = install({ modelScript: goodScript });
out = await (await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-12T06:40:00Z') })).json();
assert.equal(out.error, 'storage'); assert.equal(calls.model, 0); assert.equal(store.state.writes, 0);
console.log('9 ok: storage guards');

// 10. The reading side and the guards
store = memoryStore(); install({ modelScript: goodScript });
await get(run, '/api/issue-run', ENV, { store, now: at('2026-10-13T06:20:00Z') });
res = await get(read, '/api/issue', ENV, { store }); out = await res.json();
assert.equal(out.live, true); assert.equal(out.issues.length, 1); assert.equal(out.hour, 6); assert.ok(res.headers.get('cache-control').includes('s-maxage'));
assert.equal((await (await get(read, '/api/issue', { PROJECT: 'horocope' }, { store })).json()).live, false);
assert.equal((await get(read, '/api/issue', { ...ENV, PROJECT: 'chefrekt' }, { store })).status, 404);
assert.equal((await get(run, '/api/issue-run', { ...ENV, PROJECT: 'tenkeys' }, { store })).status, 404);
assert.equal((await get(run, '/api/issue-run', { PROJECT: 'horocope' }, { store })).status, 503);
assert.equal((await read(new Request('https://horocope.vercel.app/api/issue', { method: 'POST' }), ENV, { store })).status, 405);
// the old function still does not answer for this project
const inspect = (await import(new URL('../api/inspect.js', import.meta.url))).handle;
assert.equal((await inspect(new Request('https://horocope.vercel.app/api/inspect'), ENV)).status, 404);
console.log('10 ok: reading side and guards');

// 11. The real sky: known moments of the calendar
const lon = (iso) => longitudes(Date.parse(iso)); const body = (iso, name) => skyAt(Date.parse(iso)).bodies.find((b) => b.name === name);
assert.ok(Math.abs(lon('2000-01-01T12:00:00Z')['the Sun'] - 280.4) < 0.2);                          // the Sun at the J2000 epoch
assert.ok(Math.abs(lon('2026-03-20T14:46:00Z')['the Sun'] - 360) < 0.3 || lon('2026-03-20T14:46:00Z')['the Sun'] < 0.3);   // the March equinox of 2026
{ const l = lon('2024-04-08T18:20:00Z'); assert.ok(Math.abs(l['the Moon'] - l['the Sun']) < 1); assert.equal(body('2024-04-08T18:20:00Z', 'the Sun').sign, 'aries'); }   // the solar eclipse of 8 April 2024
assert.equal(skyAt(Date.parse('2026-10-10T15:50:00Z')).moon.phase, 'New Moon'); assert.equal(skyAt(Date.parse('2026-09-26T16:49:00Z')).moon.phase, 'Full Moon');
assert.equal(skyAt(Date.parse('2025-03-14T06:55:00Z')).moon.phase, 'Full Moon'); assert.equal(body('2025-03-14T06:55:00Z', 'the Moon').sign, 'virgo');             // the lunar eclipse of 14 March 2025
// retrogrades of 2026: Mercury 26 Feb–20 Mar, 29 Jun–23 Jul, 24 Oct–13 Nov; Venus 3 Oct–14 Nov
for (const [d, name, want] of [['2026-03-05', 'Mercury', true], ['2026-04-10', 'Mercury', false], ['2026-07-10', 'Mercury', true], ['2026-11-01', 'Mercury', true], ['2026-10-07', 'Mercury', false],
  ['2026-10-07', 'Venus', true], ['2026-09-20', 'Venus', false], ['2026-11-20', 'Venus', false], ['2026-10-07', 'Saturn', true]]) assert.equal(body(`${d}T06:00:00Z`, name).retrograde, want, `${name} ${d}`);
for (const [name, sign] of [['Jupiter', 'leo'], ['Saturn', 'aries'], ['Uranus', 'gemini'], ['Neptune', 'aries'], ['Pluto', 'aquarius'], ['Mars', 'leo'], ['the Sun', 'libra']]) assert.equal(body('2026-10-07T06:00:00Z', name).sign, sign, name);
// the chart: same sky and mood, same chart; a better market lifts every sign; scores stay inside 1…10
{ const sk = skyAt(Date.parse('2026-10-07T06:00:00Z')); const a = drawChart(sk, -0.8), b = drawChart(sk, 0.8);
  assert.deepEqual(drawChart(sk, 0.1), drawChart(sk, 0.1)); assert.ok(a.signs.every((x, i) => x.score <= b.signs[i].score && x.score >= 1 && b.signs[i].score <= 10));
  assert.equal(a.signs.find((x) => x.id === 'taurus').planet, 'Venus'); assert.ok(a.signs.find((x) => x.id === 'taurus').why.includes('ruler of Taurus, is retrograde in Scorpio')); }
console.log('11 ok: the real sky and the chart');
console.log('\nALL ISSUE TESTS PASSED');
