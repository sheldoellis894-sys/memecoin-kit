// Checks the street of houses (api/street.js) and the rules of the nights (src/lib/lights-kit.js) without any keys:
// storage lives in memory. Run inside templates/landing:  node tests/street.test.mjs
import assert from 'node:assert/strict';
console.info = () => {}; console.warn = () => {};   // the [admin] lines of the server log
const { handle, resetLimits } = await import(new URL('../api/street.js', import.meta.url));
const K = await import(new URL('../src/lib/lights-kit.js', import.meta.url));

const memoryStore = () => {
  const state = { text: null, path: '', writes: 0, fail: false };
  return {
    state,
    async read(env, path) { if (state.fail) throw new Error('down'); state.path = path; return state.text; },
    async write(env, path, body) { if (state.fail) throw new Error('down'); state.path = path; state.text = body; state.writes += 1; },
  };
};
// the browser check for new houses is off here (STREET_PROOF_BITS 0); section 13 checks it
const ENV = { PROJECT: 'ullu', BLOB_READ_WRITE_TOKEN: 'b', STREET_SALT: 'salt', STREET_BLOCK: 'rug', STREET_PROOF_BITS: '0' };
let clock = Date.parse('2026-11-05T20:00:00Z');
const now = () => clock;
const req = (method, body, ip = '1.1.1.1') => new Request('https://ullu.vercel.app/api/street', {
  method, headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: body ? JSON.stringify(body) : undefined,
});
const call = async (method, body, deps, env = ENV, ip) => { const res = await handle(req(method, body, ip), env, { now, ...deps }); return { status: res.status, out: await res.json() }; };

// ---- 1. the rules of the nights
let p = K.freshProgress(4242);
assert.deepEqual(p.inv, { diya: 2, string: 1 });
let s = K.statusOf(p, '2026-11-01');
assert.ok(s.first && s.due && !s.missed && s.level === 1);
const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];
let landedAt = 0, seq = 0;
const rand = () => ((seq = (seq * 9301 + 49297) % 233280) / 233280);
for (const [i, d] of days.entries()) {
  const r = K.lightTonight(p, d, rand);
  assert.ok(r.gift, `night ${i + 1} gives a gift`);
  p = r.p; if (r.landedNow) landedAt = i + 1;
  assert.equal(K.lightTonight(p, d, rand).gift, '', 'the same night cannot be lit twice');
}
assert.equal(landedAt, 7); assert.equal(p.streak, 7); assert.equal(p.landings, 1); assert.equal(p.gifts, 7); assert.equal(p.best, 7);
s = K.statusOf(p, '2026-11-07'); assert.ok(s.landed && s.litTonight && s.level === 7);
s = K.statusOf(p, '2026-11-08'); assert.ok(s.due && !s.landed && !s.missed && s.night === 8);
s = K.statusOf(p, '2026-11-09'); assert.ok(s.missed && s.level === 1 && s.streak === 0, 'a missed night: the house goes dark to level 1');
let r = K.lightTonight(p, '2026-11-09', rand); assert.equal(r.p.streak, 1); assert.equal(r.p.best, 7); assert.equal(r.p.nights, 8);
console.log('1 ok: seven nights, the owl lands, a missed night starts again');

// ---- 2. placing decorations
p = K.freshProgress(4242); const h = K.houseOf(4242);
const sill = h.slots.find((x) => x.kind === 'sill').id, line = h.slots.find((x) => x.kind === 'line').id;
assert.equal(K.placeItem(p, line, 'diya'), null, 'a diya does not go on a line');
p = K.placeItem(p, sill, 'diya'); assert.equal(p.placed[sill], 'diya');
p = K.placeItem(p, line, 'string'); assert.ok(K.placeItem(p, h.slots.find((x) => x.kind === 'door').id, 'string'), 'the open fairy lights never run out');
assert.equal(K.placeItem({ ...p, inv: { ...p.inv, 'string-heart': 1 } }, h.slots.find((x) => x.kind === 'door').id, 'string-heart') && K.placeItem(K.placeItem({ ...p, inv: { ...p.inv, 'string-heart': 1 } }, h.slots.find((x) => x.kind === 'door').id, 'string-heart'), line, 'string-heart'), null, 'only one rare heart string is owned');
assert.equal(K.placeItem(p, h.slots.filter((x) => x.kind === 'sill')[1].id, 'jhoomar'), null, 'holder items need the preview');
p = K.placeItem(p, sill, ''); assert.equal(p.placed[sill], undefined);
const code = K.encodeHouse(4242, { [line]: 'string' });
assert.deepEqual(K.decodeHouse(code), { seed: 4242, family: 'mumbai', wish: '', placed: { [line]: 'string' }, free: [], paint: '' });
assert.equal(K.decodeHouse('not a code'), null); assert.equal(K.decodeHouse(K.encodeHouse(4242, { nope: 'diya' })), null);
assert.equal(K.readProgress('{broken').v, 1, 'a broken value gives a new house');
// every style family builds, keeps its slots inside the picture and travels in a code
for (const f of K.FAMILY_IDS) for (let seed = 1; seed < 400; seed += 37) {
  const hh = K.houseOf(seed, f);
  assert.equal(hh.family, f); assert.ok(hh.windows.length >= 1, f); assert.ok(hh.perch.y >= 190, `${f} ${seed}: room for the owl`);
  assert.ok(hh.slots.every((x) => (x.x ?? x.x1) >= 0 && (x.x ?? x.x2) <= K.VIEW && x.y > 150 && x.y < K.VIEW), `${f} ${seed}: slots in view`);
  assert.equal(new Set(hh.slots.map((x) => x.id)).size, hh.slots.length, `${f}: unique slot ids`);
  const pl = K.autoDecorate(seed, 8, false, f);
  assert.deepEqual(K.decodeHouse(K.encodeHouse(seed, pl, f)), { seed, family: f, wish: '', placed: pl, free: [], paint: '' });
  assert.ok(K.houseSvg(hh, pl, { level: 7 }).endsWith('</svg>'));
}
assert.equal(K.decodeHouse(K.encodeHouse(4242, {}, 'castle')), null, 'unknown style');
assert.notDeepEqual(K.houseOf(4242, 'jaisalmer').windows.length, 0);
assert.deepEqual(K.FAMILY_IDS, ['mumbai', 'haveli', 'jaisalmer', 'kolkata', 'goa', 'varanasi', 'delhi', 'chennai', 'kerala'], 'only Indian streets');
// the four new streets come after the first five, so the houses already built on the first five do not change
for (const f of ['varanasi', 'delhi', 'chennai', 'kerala']) for (let sd = 1; sd < 400; sd += 7) { const hh = K.houseOf(sd, f); assert.ok(hh.slots.length >= 4 && hh.top > 40, f); assert.ok(K.houseSvg(hh, K.autoDecorate(sd, 10, false, f), { level: 7 }).length > 1000, f); }
assert.ok(K.FAMILY_IDS.includes(K.familyFor(99))); assert.equal(K.decodeHouse(K.encodeHouse(5, {}, 'panel')), null, 'old styles are gone');
let p2 = K.freshProgress(5, 'kolkata'); assert.equal(K.readProgress(JSON.stringify(p2)).family, 'kolkata'); assert.equal(K.readProgress(JSON.stringify({ ...p2, family: 'castle' })).family, 'mumbai');
// the wish paints the house but never moves its windows or slots
for (const w of K.WISH_IDS) {
  const a = K.houseOf(4242, 'mumbai'), b = K.houseOf(4242, 'mumbai', { wish: w });
  assert.deepEqual(a.slots, b.slots, w); assert.deepEqual(a.windows, b.windows, w);
  const code2 = K.encodeHouse(4242, {}, 'mumbai', w); assert.equal(K.decodeHouse(code2).wish, w);
}
assert.equal(K.decodeHouse(K.encodeHouse(4242, {}, 'mumbai', 'money')), null, 'unknown wish');
let goldLamps = 0, plainLamps = 0; let sq = 1; const rr = () => ((sq = (sq * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < 6000; i++) { if (K.ITEMS[K.giftFor(rr, false, 'gold')].cat === 'lamps') goldLamps++; if (K.ITEMS[K.giftFor(rr, false, '')].cat === 'lamps') plainLamps++; }
assert.ok(goldLamps > plainLamps * 1.3, `gold wish brings more lamps (${goldLamps} vs ${plainLamps})`);
// rarity: the common ones are open from the start, so the owl brings rare / epic / legendary about 22 / 7 / 1,
// no legendary before night five, no holder items without the holder preview
const rc = {}; for (let i = 0; i < 20000; i++) { const it = K.ITEMS[K.giftFor(rr, false, '', 7)]; rc[it.rarity] = (rc[it.rarity] || 0) + 1; assert.ok(!it.holder); }
assert.ok(!rc.common && rc.rare > 13500 && rc.rare < 16000 && rc.epic > 3900 && rc.epic < 5400 && rc.legendary > 450 && rc.legendary < 900, JSON.stringify(rc));
// every common decoration is open to a new house and never runs out; rare ones still come only from the owl
{ const fp = K.freshProgress(11, 'goa'); const fr = K.freeItems(fp);
  for (const i of K.OPEN_ITEMS) { assert.equal(fr[i], K.OPEN_STOCK, i); assert.ok(fp.seen[i], i); }
  assert.ok(K.OPEN_ITEMS.length >= 40, `open commons (${K.OPEN_ITEMS.length})`); assert.equal(fr['diya-brass'], 0);
  assert.ok(K.readProgress(JSON.stringify({ ...fp, seen: {} })).seen.diya, 'an old house gets the open ones too'); }
for (let i = 0; i < 3000; i++) assert.notEqual(K.ITEMS[K.giftFor(rr, false, '', 3)].rarity, 'legendary');
assert.ok(K.ITEM_IDS.length >= 110, `about 120 decorations (${K.ITEM_IDS.length})`);
for (const id of K.ITEM_IDS) assert.ok(K.itemSvg(id, 60, { ticker: 'ULLU' }).length > 200, id);
// invites
const inv = K.encodeInvite({ seed: 99, family: 'kolkata', wish: 'love', name: 'Meera' });
assert.deepEqual(K.decodeInvite(inv), { seed: 99, family: 'kolkata', wish: 'love', name: 'Meera' });
assert.equal(K.decodeInvite('x'.repeat(300)), null); assert.equal(K.decodeInvite(K.encodeInvite({ seed: 99, family: 'castle' })), null);
assert.equal(K.decodeInvite(K.encodeInvite({ seed: 99, family: 'kolkata', name: 'go to x.com' })).name, '', 'links are not names');
// what the first visit stores, repaired when broken
const pv = K.readProgress(JSON.stringify({ ...K.freshProgress(7, 'jaisalmer', { wish: 'fame', name: 'Bob', city: 'Tallinn<b>', country: 'EE', setup: true, neighbour: { seed: 99, family: 'kolkata', wish: 'love', name: 'Meera' } }) }));
assert.equal(pv.wish, 'fame'); assert.equal(pv.city, 'Tallinnb'); assert.equal(pv.country, 'EE'); assert.equal(pv.neighbour.name, 'Meera'); assert.equal(pv.setup, true);
assert.equal(K.readProgress(JSON.stringify({ ...K.freshProgress(7), neighbour: { seed: 7, family: 'kolkata' } })).neighbour, null, 'not your own neighbour');
assert.ok(K.moonPhase(new Date('2026-10-26T04:12:00Z')) > 0.45 && K.moonPhase(new Date('2026-10-26T04:12:00Z')) < 0.55, 'full moon 26.10.2026');
const fr = K.houseSvg(K.houseOf(1, 'jaisalmer'), {}, { level: 3, friend: K.houseOf(2, 'haveli') }); assert.ok(fr.includes('scale('), 'friend house next door');
console.log('2 ok: decorations, codes, five Indian streets, wishes, invites');

// ---- 2b. nights and events
const ALL = K.EVENT_IDS;
const ctxOf = (day, extra = {}) => ({ hour: 21, weekday: new Date(`${day}T12:00:00`).getDay(), moon: K.moonPhase(new Date(`${day}T21:00:00`)), allowed: ALL, ...extra });
assert.equal(K.holidayOf('2026-11-08'), 'diwali'); assert.equal(K.holidayOf('2027-03-22'), 'holi'); assert.equal(K.holidayOf('2027-02-06'), 'lunar'); assert.equal(K.holidayOf('2030-12-31'), 'newyear'); assert.equal(K.holidayOf('2026-11-07'), '');
let pe = K.freshProgress(31, 'mumbai');
const once = K.lightTonight(pe, '2026-11-01', () => 0.5, false, ctxOf('2026-11-01'));
const again = K.lightTonight(pe, '2026-11-01', () => 0.5, false, ctxOf('2026-11-01'));
assert.equal(once.event, again.event, 'the same house gets the same event on the same night');
assert.equal(once.p.log.at(-1).event, once.event); assert.equal(K.tonightOf(once.p, '2026-11-01').event, once.event); assert.equal(K.tonightOf(once.p, '2026-11-02'), null);
const dw = K.lightTonight(pe, '2026-11-08', Math.random, false, ctxOf('2026-11-08'));
assert.equal(dw.event, 'diwali'); assert.equal(Object.values(dw.bonus).reduce((a, b) => a + b, 0), 2, 'diwali: two extra gifts');
assert.equal(K.lightTonight(pe, '2026-11-01', Math.random, false, ctxOf('2026-11-01', { allowed: [] })).event, '', 'no words in the config, no event');
assert.equal(K.lightTonight(pe, '2026-11-01', Math.random, false, null).event, '', 'no context, no event');
const late = K.lightTonight(pe, '2026-11-02', Math.random, false, ctxOf('2026-11-02', { hour: 3, allowed: ['latenight'] }));
assert.equal(late.event, 'latenight'); assert.equal(late.bonus.feather, 1);
const fm = K.lightTonight(pe, '2026-10-26', () => 0.01, false, ctxOf('2026-10-26', { allowed: ['fullmoon'] }));
assert.equal(fm.event, 'fullmoon'); assert.equal(fm.bonus[fm.gift], 1, 'full moon: the gift comes twice');
// the monkey borrows a free bulb and brings it back on the next lit night
pe = { ...K.freshProgress(31, 'mumbai'), inv: { diya: 2, string: 1, bulb: 1 } };
const mk = K.lightTonight(pe, '2026-11-03', () => 0.99, false, ctxOf('2026-11-03', { allowed: ['monkey'] }));
// (the bulb is an open decoration now: the monkey borrows one for the story, the house keeps all of its open ones)
assert.equal(mk.event, 'monkey'); assert.equal(mk.loan, 'bulb'); assert.equal(mk.p.inv.bulb, 1); assert.equal(K.freeItems(mk.p).bulb, K.OPEN_STOCK); assert.deepEqual(mk.p.loan, { item: 'bulb' });
const rt = K.lightTonight(mk.p, '2026-11-05', () => 0.99, false, ctxOf('2026-11-05', { allowed: ['quiet'] }));
assert.equal(rt.returned, 'bulb'); assert.equal(rt.p.loan, null); assert.equal(K.readProgress(JSON.stringify(mk.p)).loan.item, 'bulb');
const noLoan = K.lightTonight({ ...K.freshProgress(31, 'mumbai'), inv: { diya: 1 } }, '2026-11-03', () => 0.99, false, ctxOf('2026-11-03', { allowed: ['monkey', 'quiet'] }));
assert.equal(noLoan.p.inv.diya, 1, 'the monkey takes nothing a house owns');
// family events stay on their streets, and every event with a picture draws
assert.equal(K.lightTonight(K.freshProgress(31, 'kolkata'), '2026-11-03', Math.random, false, ctxOf('2026-11-03', { allowed: ['camel', 'quiet'] })).event, 'quiet', 'no camels in Kolkata');
for (const sc of K.SCENE_IDS) for (const lv of [1, 4, 7]) assert.ok(K.houseSvg(K.houseOf(5, 'kolkata'), {}, { level: lv, scene: sc }).endsWith('</svg>'), sc);
// night N brings N gifts, then three a night; everything received goes to the album
let pn = K.freshProgress(77, 'kolkata'); const counts = [];
for (let d = 1; d <= 9; d++) { const r = K.lightTonight(pn, `2026-12-${String(d).padStart(2, '0')}`, Math.random); counts.push(r.gifts.length); pn = r.p; }
assert.deepEqual(counts, [1, 2, 3, 4, 5, 6, 7, 3, 3]);
{ const open = new Set(K.OPEN_ITEMS); const fresh = K.freshProgress(77, 'kolkata').seen;
  assert.equal(Object.entries(pn.seen).reduce((a, [i, n]) => a + n - (fresh[i] || 0), 0), 34, 'album counts every gift');
  assert.ok(Object.keys(pn.seen).filter((i) => !open.has(i)).every((i) => K.ITEMS[i].rarity !== 'common'), 'gifts are rare and up'); }
console.log('2b ok: seven-night story, events, holidays, the monkey, gifts and rarity');

// ---- 2c. put anywhere, paint, custom signs, the code carries them
let pf = { ...K.freshProgress(9, 'goa'), inv: { 'neon-heart': 1, 'sign-custom': 1, 'paint-gold': 1, diya: 1, 'curtains-pink': 1 } };
pf = K.placeFree(pf, 'neon-heart', 120, 300); assert.equal(pf.free.length, 1);
assert.equal(K.placeFree(pf, 'neon-heart', 10, 10), null, 'only one heart owned');
assert.equal(K.placeFree(pf, 'curtains-pink', 10, 10), null, 'window items go into windows only');
pf = K.placeFree(pf, 'sign-custom', 300, 200, false, { t: 'gm frens! www.x.com' }); assert.equal(pf.free[1].t, 'HOOT', 'links are not allowed on signs');
pf = K.updateFree(pf, pf.free[1].n, { t: 'gm frens <3', s: 9, x: -50 }); assert.equal(pf.free[1].t, 'GM FRENS 3'); assert.equal(pf.free[1].s, 4); assert.equal(pf.free[1].x, 0);
pf = K.applyPaint(pf, 'paint-gold'); assert.equal(pf.paint, 'paint-gold'); assert.equal(K.houseOfP(pf).wall, K.ITEMS['paint-gold'].color);
assert.equal(K.freeItems(pf)['paint-gold'], 0); assert.equal(K.applyPaint(pf, 'paint-neon'), null, 'no neon paint owned');
const fcode = K.encodeHouse(pf.seed, {}, pf.family, '', { free: pf.free, paint: pf.paint });
const back2 = K.decodeHouse(fcode); assert.equal(back2.free.length, 2); assert.equal(back2.free[1].t, 'GM FRENS 3'); assert.equal(back2.paint, 'paint-gold');
assert.equal(K.decodeHouse(K.encodeHouse(9, {}, 'goa', '', { free: [{ i: 'jhoomar', x: 1, y: 1 }] }), { holderOk: false }), null, 'no golden items from codes without holder');
assert.equal(K.decodeHouse(K.encodeHouse(9, {}, 'goa', '', { free: [{ i: 'nope', x: 1, y: 1 }] })), null);
assert.ok(K.lightOf(K.houseOfP(pf), {}, 3, pf.free) > K.lightOf(K.houseOfP(pf), {}, 3, []));
const winSlot = K.houseOf(9, 'goa').slots.find((x) => x.kind === 'win');
assert.ok(K.placeItem(pf, winSlot.id, 'curtains-pink'));
pf = K.removeFree(pf, pf.free[0].n); assert.equal(pf.free.length, 1); assert.equal(K.freeItems(pf)['neon-heart'], 1);
assert.equal(K.readProgress(JSON.stringify({ ...pf, free: [...pf.free, { i: 'nope' }], paint: 'diya' })).free.length, 1);
assert.ok(K.houseSvg(K.houseOfP(pf), {}, { level: 5, free: pf.free, ctx: { ticker: 'ULLU' } }).includes('GM FRENS 3'));
// every decoration put anywhere keeps its own number, even when stored data has two with the same one
{
  const twins = K.cleanFree([{ n: 2, i: 'neon-heart', x: 10, y: 10 }, { n: 2, i: 'neon-heart', x: 20, y: 20 }, { i: 'neon-heart', x: 30, y: 30 }]);
  assert.equal(new Set(twins.map((f) => f.n)).size, 3, JSON.stringify(twins));
  assert.equal(twins[0].n, 2);
}
// lighting twice on one night changes nothing and still answers in the same shape
{
  const lit = K.lightTonight(K.freshProgress(99), '2026-11-02', () => 0.5).p;
  const again = K.lightTonight(lit, '2026-11-02', () => 0.5);
  assert.equal(again.gift, ''); assert.deepEqual(again.gifts, []); assert.equal(again.p, lit);
}
// keys from outside that are not items: "constructor" and friends do not pass for decorations
{
  const h = K.houseOf(777);
  const sl = h.slots.find((x) => x.kind === 'hang').id;
  assert.equal(K.decodeHouse(K.encodeHouse(777, { [sl]: 'constructor' })), null);
  assert.equal(K.ITEMS.constructor, undefined); assert.equal(K.ITEMS.toString, undefined);
  const bad = K.readProgress(JSON.stringify({ v: 1, seed: 5, inv: { constructor: 3, diya: 1 }, seen: { __proto__: 1 }, placed: { [sl]: 'toString' } }));
  assert.deepEqual(bad.inv, { diya: 1 }); assert.deepEqual(bad.placed, {});
}
// the diary read back from storage keeps only what the site knows
{
  const raw = { v: 1, seed: 6, log: [{ date: '2026-11-01', gift: 'gone-item', gifts: ['diya', 'gone', 'string'], night: 2, event: 'snow', bonus: { diya: 1, gone: 2 }, loan: 'x', time: '21:05' }, { date: 'yesterday' }, 'junk', null] };
  const log = K.readProgress(JSON.stringify(raw)).log;
  assert.deepEqual(log, [{ date: '2026-11-01', gift: '', night: 2, gifts: ['diya', 'string'], bonus: { diya: 1 }, time: '21:05' }]);
  assert.equal(K.readProgress(JSON.stringify({ v: 1, seed: 2 ** 33 })).seed !== 2 ** 33, true, 'a seed out of range gives a new house');
}
// the last lit night is "tomorrow" here (a flight west): the run stays, the owl does not come twice
{
  const q = { ...K.freshProgress(77), last: '2026-11-05', streak: 4, nights: 4, best: 4, gifts: 4 };
  const st = K.statusOf(q, '2026-11-04');
  assert.ok(st.litTonight && !st.due && !st.missed && st.streak === 4);
  assert.equal(K.lightTonight(q, '2026-11-04', () => 0.5).p, q);
  assert.equal(K.lightTonight(q, '2026-11-06', () => 0.5).p.streak, 5);
}
// values with their own toString/valueOf (possible in JSON) never reach String() or a lookup: nothing throws
{
  const T = JSON.parse('{"toString":1}'), V = JSON.parse('{"valueOf":1,"toString":1}');
  const crafted = Buffer.from(JSON.stringify({ v: 1, s: 99, f: 'goa', p: { door: T }, c: T, q: [['sign-custom', V, 2, V, V, T], [T, 1, 2]] })).toString('base64').replace(/=+$/, '');
  assert.equal(K.decodeHouse(crafted.replace(/\+/g, '-').replace(/\//g, '_')), null);
  const ok2 = Buffer.from(JSON.stringify({ v: 1, s: 99, f: 'goa', p: {}, q: [['sign-custom', V, '120', V, V, T]] })).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  assert.deepEqual(K.decodeHouse(ok2).free, [{ n: 1, i: 'sign-custom', x: 300, y: 120, s: 1, r: 0, t: 'HOOT' }]);
  for (const f of [K.cleanName, K.cleanSign, K.cleanPlace]) assert.equal(f(T), '');
  const q = K.readProgress(JSON.stringify({ v: 1, seed: 7, name: T, city: T, country: T, paint: T, loan: { item: T }, placed: { door: T }, free: [{ i: T }], log: [{ date: T }, { date: '2026-11-01', gift: T }] }));
  assert.equal(q.name, ''); assert.equal(q.country, ''); assert.deepEqual(q.placed, {}); assert.deepEqual(q.free, []); assert.equal(q.log.length, 1);
  assert.equal(K.decodeInvite(Buffer.from(JSON.stringify({ v: 1, s: 5, f: 'goa', n: T })).toString('base64').replace(/=+$/, '')).name, '');
}
console.log('2c ok: put anywhere, signs, paint, numbers of free items, outside keys, diary, clock, crafted values');

// ---- 3. the street: post, read, update, rules
resetLimits();
let store = memoryStore();
let res = await call('GET', null, { store });
assert.equal(res.status, 200); assert.deepEqual(res.out.houses, []); assert.equal(res.out.live, true);
const placed = K.autoDecorate(777, 6);
const good = { id: 'abcdefghijklmnop1234', name: 'Raju', code: K.encodeHouse(777, placed), nights: 9, gifts: 9, best: 7, landings: 1, streak: 2 };
res = await call('POST', good, { store });
assert.equal(res.status, 200); assert.ok(res.out.ok); assert.equal(store.state.path, 'ullu/street.json');
assert.equal(res.out.house.light, K.lightOf(K.houseOf(777), placed, 2), 'the server computes the light itself');
const saved = JSON.parse(store.state.text);
assert.ok(!store.state.text.includes(good.id), 'the visitor id is not stored');
assert.equal(saved.houses.length, 1);
res = await call('GET', null, { store });
assert.equal(res.out.count, 1); assert.equal(res.out.houses[0].name, 'Raju'); assert.ok(!('key' in res.out.houses[0])); assert.ok(!('seed' in res.out.houses[0]));
assert.equal(res.out.star.name, 'Raju');
// the same visitor updates the house, not a second one
res = await call('POST', { ...good, name: 'Raju 2', streak: 3, nights: 10, gifts: 10 }, { store });
assert.ok(res.out.ok); assert.equal(JSON.parse(store.state.text).houses.length, 1); assert.equal(JSON.parse(store.state.text).houses[0].name, 'Raju 2');
// codes are public: another visitor posting a copy of a house that is still lit is refused, the real one stays
res = await call('POST', { ...good, id: 'zzzzzzzzzzzzzzzz9999', name: 'Copy' }, { store }, ENV, '2.2.2.2');
assert.equal(res.status, 409); assert.equal(res.out.error, 'taken');
assert.equal(JSON.parse(store.state.text).houses.length, 1); assert.equal(JSON.parse(store.state.text).houses[0].name, 'Raju 2');
// the server writes the code again itself: extra fields in a posted code are not kept
{
  const raw = JSON.parse(Buffer.from(good.code.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  const padded = Buffer.from(JSON.stringify({ ...raw, junk: 'x'.repeat(200) })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  res = await call('POST', { ...good, name: 'Raju 3', code: padded }, { store });
  assert.ok(res.out.ok); assert.ok(!store.state.text.includes('junk'));
  assert.equal(JSON.parse(store.state.text).houses[0].code, K.encodeHouse(777, placed));
}
// a different house
res = await call('POST', { ...good, id: 'qqqqqqqqqqqqqqqq0000', name: 'Meera', code: K.encodeHouse(888, K.autoDecorate(888, 9)), streak: 7, best: 7 }, { store }, ENV, '3.3.3.3');
assert.ok(res.out.ok); assert.equal(JSON.parse(store.state.text).houses.length, 2);
// the same seed in another style is another house
res = await call('POST', { ...good, id: 'ffffffffffffffff1111', name: 'Desert', code: K.encodeHouse(777, K.autoDecorate(777, 6, false, 'jaisalmer'), 'jaisalmer') }, { store }, ENV, '4.4.4.4');
assert.ok(res.out.ok); assert.equal(res.out.house.family, 'jaisalmer'); assert.equal(JSON.parse(store.state.text).houses.length, 3);
// taking the own house off the street: only by the id that put it there
{ const before = JSON.parse(store.state.text).houses.length;
  let rm = await call('POST', { id: 'zzzzzzzzzzzzzzzz9999', remove: true }, { store }, ENV, '7.7.7.1');
  assert.ok(rm.out.ok && rm.out.removed === false); assert.equal(JSON.parse(store.state.text).houses.length, before, 'another id removes nothing');
  rm = await call('POST', { id: good.id, remove: true }, { store }, ENV, '7.7.7.2');
  assert.ok(rm.out.ok && rm.out.removed === true); assert.equal(JSON.parse(store.state.text).houses.length, before - 1, 'own house is gone');
  assert.ok(!JSON.parse(store.state.text).houses.some((x) => x.name === 'Raju'));
  assert.equal((await call('POST', { id: 'bad', remove: true }, { store }, ENV, '7.7.7.3')).status, 400); }
console.log('3 ok: post, read, update, one house per visitor');

// ---- 4. what is refused
const bad = async (body, error, status = 400) => { const x = await call('POST', body, { store }, ENV, '9.9.9.' + Math.floor(Math.random() * 200)); assert.equal(x.status, status, JSON.stringify(x.out)); assert.equal(x.out.error, error); };
await bad({ ...good, name: 'a' }, 'name');
await bad({ ...good, name: 'buy at x.com' }, 'name');
await bad({ ...good, name: 'no rug here' }, 'words');
// swearing, slurs, links, promo and mocked holy names (src/lib/lights-filter.js); holy names alone and look-alikes are fine
for (const n of ['f u c k', 'sh1t house', 'Chutiya', 'blyat', 'ULLU Official', 'DM me', 'Allah pig', 'Krishna dog', 'Jesus sucks']) await bad({ ...good, name: n }, 'words');
for (const [i, n] of ['Krishna', 'Mohammed', 'Class Act', 'Push It', 'Peacock'].entries()) {
  const ok = await call('POST', { ...good, id: `goodname${i}`.padEnd(16, 'x'), name: n, code: K.encodeHouse(6000 + i, {}) }, { store }, ENV, `7.7.7.${i}`);
  assert.ok(ok.out.ok, `${n}: ${JSON.stringify(ok.out)}`);
}
assert.equal(K.decodeInvite(K.encodeInvite({ seed: 99, family: 'kolkata', name: 'Chutiya' })).name, '', 'a rude friend name is not shown');
await bad({ ...good, name: '<script>' }, 'name');
await bad({ ...good, code: 'broken' }, 'code');
await bad({ ...good, code: K.encodeHouse(777, { [K.houseOf(777).slots.find((x) => x.kind === 'hang').id]: 'jhoomar' }) }, 'code');
await bad({ ...good, streak: 8, best: 7 }, 'numbers');
await bad({ ...good, gifts: 99 }, 'numbers');
await bad({ ...good, landings: 5 }, 'numbers');
await bad({ ...good, best: 5, landings: 1, streak: 2 }, 'numbers');
await bad({ ...good, nights: 0, gifts: 0, best: 0, streak: 0, landings: 0 }, 'dark');
await bad({ ...good, id: 'short' }, 'bad');
await bad({ ...good, nights: -1 }, 'bad');
await bad({ ...good, name: JSON.parse('{"toString":1}') }, 'name');
await bad({ ...good, code: JSON.parse('{"toString":1}') }, 'code');
// the words on an own sign follow the same rule as names
{
  const slot = (seed) => K.encodeHouse(seed, {}, 'mumbai', '', { free: [{ n: 1, i: 'sign-custom', x: 300, y: 200, s: 1, r: 0, t: 'NO RUG HERE' }] });
  await bad({ ...good, id: 'signsignsignsign0001', code: slot(4242) }, 'sign');
  const ok = await call('POST', { ...good, id: 'signsignsignsign0002', name: 'Sign', code: K.encodeHouse(4243, {}, 'mumbai', '', { free: [{ n: 1, i: 'sign-custom', x: 300, y: 200, s: 1, r: 0, t: 'GM FRENS' }] }) }, { store }, ENV, '8.8.1.1');
  assert.ok(ok.out.ok, JSON.stringify(ok.out));
  for (const [i, t] of ['FUCK', 'BUY $BONK', 'PUMP DOT FUN'].entries()) await bad({ ...good, id: `signsignsignsign01${i}`, code: K.encodeHouse(4300 + i, {}, 'mumbai', '', { free: [{ n: 1, i: 'sign-custom', x: 300, y: 200, s: 1, r: 0, t }] }) }, 'sign');
  const own = await call('POST', { ...good, id: 'signsignsignsign0003', name: 'Own', code: K.encodeHouse(4244, {}, 'mumbai', '', { free: [{ n: 1, i: 'sign-custom', x: 300, y: 200, s: 1, r: 0, t: '$ULLU' }] }) }, { store }, ENV, '8.8.1.2');
  assert.ok(own.out.ok, 'own ticker is fine: ' + JSON.stringify(own.out));
}
// a house with a rude name that got on the street before (older rules) is not shown, and never becomes the house of the night
{
  const j = JSON.parse(store.state.text);
  j.houses.push({ ...j.houses[0], key: 'rude'.padEnd(32, '0'), seed: 5556, name: 'Chutiya', light: 100 });
  store.state.text = JSON.stringify(j);
  const g = await call('GET', null, { store });
  assert.ok(g.out.houses.length > 0 && !g.out.houses.some((x) => x.name === 'Chutiya')); assert.notEqual(g.out.star?.name, 'Chutiya');
}
// a post that is too big is refused, also without a content-length header
assert.equal((await handle(new Request('https://x/api/street', { method: 'POST', body: JSON.stringify({ ...good, pad: 'x'.repeat(10000) }) }), ENV, { store, now })).status, 413);
assert.equal((await handle(new Request('https://x/api/street', { method: 'POST', body: '{nope' }), ENV, { store, now })).status, 400);
assert.equal((await handle(new Request('https://x/api/street', { method: 'DELETE' }), ENV, { store, now })).status, 405);
assert.equal((await handle(new Request('https://x/api/street'), { ...ENV, PROJECT: 'molty' }, { store, now })).status, 404);
// a house the site can no longer draw (an old style) is left out of the street, the rest still shows
{
  const j = JSON.parse(store.state.text);
  const oldStyle = Buffer.from(JSON.stringify({ v: 1, s: 5555, f: 'panel', p: {} })).toString('base64').replace(/=+$/, '');
  j.houses.push({ ...j.houses[0], key: 'old'.padEnd(32, '0'), seed: 5555, family: 'panel', name: 'Old', code: oldStyle, light: 100 });
  store.state.text = JSON.stringify(j);
  const g = await call('GET', null, { store });
  assert.ok(g.out.houses.length > 0 && !g.out.houses.some((x) => x.name === 'Old')); assert.notEqual(g.out.star?.name, 'Old');
}
console.log('4 ok: names, signs, codes, numbers, sizes, old houses, methods');

// ---- 5. limits, storage problems, no store
resetLimits();
// twenty new houses a day from one address; the owners behind it can still update theirs, up to forty posts in all
for (let i = 0; i < 20; i++) assert.ok((await call('POST', { ...good, id: `limit${String(i).padStart(2, '0')}aaaaaaaaaaaa`, code: K.encodeHouse(1000 + i, {}) }, { store }, ENV, '5.5.5.5')).out.ok, `new house ${i + 1} of 20 a day from one address`);
res = await call('POST', { ...good, id: 'limit9aaaaaaaaaaaaa', code: K.encodeHouse(2000, {}) }, { store }, ENV, '5.5.5.5');
assert.equal(res.status, 429); assert.equal(res.out.error, 'busy', 'the 21st new house from one address waits');
for (let i = 0; i < 19; i++) assert.ok((await call('POST', { ...good, id: `limit${String(i).padStart(2, '0')}aaaaaaaaaaaa`, code: K.encodeHouse(1000 + i, {}), name: `Upd ${i}` }, { store }, ENV, '5.5.5.5')).out.ok, `update ${i + 1}: post ${i + 22} of 40`);
res = await call('POST', { ...good, id: 'limit00aaaaaaaaaaaa', code: K.encodeHouse(1000, {}) }, { store }, ENV, '5.5.5.5');
assert.equal(res.status, 429); assert.equal(res.out.error, 'busy', 'the 41st post of the day from one address waits');
// sixty new houses a minute for the whole street; an owner lighting a house already there is never stopped by them
resetLimits();
for (let i = 0; i < 60; i++) assert.ok((await call('POST', { ...good, id: `flood${String(i).padStart(2, '0')}bbbbbbbbbbbb`, name: `Fl ${i}`, code: K.encodeHouse(3000 + i, {}) }, { store }, ENV, `7.7.${i}.1`)).out.ok, `new house ${i + 1} of 60 this minute`);
res = await call('POST', { ...good, id: 'flood99bbbbbbbbbbbb', name: 'Fl late', code: K.encodeHouse(3100, {}) }, { store }, ENV, '7.8.0.1');
assert.equal(res.status, 429); assert.equal(res.out.error, 'busy', 'the 61st new house this minute waits');
res = await call('POST', { ...good, id: 'limit00aaaaaaaaaaaa', code: K.encodeHouse(1000, {}), name: 'Owner' }, { store }, ENV, '7.9.0.1');
assert.ok(res.out.ok, 'an update goes through while new houses wait');
clock += 60000;
assert.ok((await call('POST', { ...good, id: 'flood99bbbbbbbbbbbb', name: 'Fl late', code: K.encodeHouse(3100, {}) }, { store }, ENV, '7.8.0.1')).out.ok, 'a minute later new houses come again');
clock -= 60000;
store.state.fail = true;
res = await call('GET', null, { store }); assert.equal(res.status, 200); assert.equal(res.out.error, 'storage');
res = await call('POST', { ...good, id: 'other1aaaaaaaaaaaaaa' }, { store }, ENV, '6.6.6.6'); assert.equal(res.status, 503); assert.equal(res.out.error, 'storage');
store.state.fail = false;
res = await call('GET', null, { store }, { PROJECT: 'ullu' }); assert.equal(res.out.live, false); assert.deepEqual(res.out.houses, []);
res = await call('POST', good, { store }, { PROJECT: 'ullu' }); assert.equal(res.status, 503); assert.equal(res.out.error, 'off');
// an IPv6 visitor counts by the /64 block, not by each address in it
resetLimits();
{
  const v6 = await Promise.all(Array.from({ length: 41 }, (_, i) => call('POST', { ...good, id: `vsixvsixvsixvsix${String(i).padStart(2, '0')}0`, name: `Six ${i}`, code: K.encodeHouse(7000 + i, {}) }, { store }, ENV, `2001:db8:aa:bb::${i + 1}`)));
  assert.deepEqual(v6.map((x) => x.status), [...Array(20).fill(200), ...Array(21).fill(429)]);
}
// Vercel: two copies of the function change the street at the same moment. A write goes through only when the file has
// not changed since it was read (ETag); otherwise the street is read again and the change made again. Nothing is lost
resetLimits();
{
  const tagged = (text = '{"houses":[],"bans":[],"log":[],"lastSn":0}') => {
    const state = { text, ver: 0, writes: 0, conflicts: 0 };
    return { state,
      async read() { return state.text; },
      async readTagged() { return { text: state.text, etag: state.text === null ? '' : `"v${state.ver}"` }; },
      async write(e, p, body, opts = {}) {
        if (opts.ifMatch && opts.ifMatch !== `"v${state.ver}"`) { state.conflicts += 1; throw Object.assign(new Error('changed'), { code: 'conflict' }); }
        state.text = body; state.ver += 1; state.writes += 1;
      } };
  };
  const race = tagged();
  // another copy of the function writes the street between our read and our write, twice
  let left = 2; const rt = race.readTagged.bind(race);
  race.readTagged = async (...a) => {
    const got = await rt(...a);
    if (left-- > 0) { const st = JSON.parse(race.state.text || '{"houses":[],"bans":[],"log":[]}'); st.houses.push({ key: `other${left}`, code: K.encodeHouse(7300 + left, {}), name: `Other ${left}`, seed: 7300 + left, family: 'mumbai', sn: 900 + left, updated: new Date(clock).toISOString(), light: 1, lightDark: 1, streak: 1 }); race.state.text = JSON.stringify(st); race.state.ver += 1; }
    return got;
  };
  const r = await call('POST', { ...good, id: 'racerracerracer0000', name: 'Racer', code: K.encodeHouse(7200, {}) }, { store: race }, ENV, '10.3.0.1');
  assert.ok(r.out.ok, JSON.stringify(r.out));
  assert.equal(race.state.conflicts, 2, 'two writes were turned away');
  assert.deepEqual(JSON.parse(race.state.text).houses.map((x) => x.name).sort(), ['Other 0', 'Other 1', 'Racer'], 'every house is kept');
  // a file that keeps changing all the time: the post gives up with "busy" instead of writing over it
  const storm = tagged(); storm.readTagged = async () => { storm.state.ver += 1; return { text: storm.state.text, etag: `"v${storm.state.ver - 1}"` }; };
  const busy = await call('POST', { ...good, id: 'stormstormstorm0000', name: 'Storm', code: K.encodeHouse(7201, {}) }, { store: storm }, ENV, '10.3.0.2');
  assert.equal(busy.status, 503); assert.equal(busy.out.error, 'busy'); assert.equal(storm.state.writes, 0);
  // fifty posts at once on two "copies": every house arrives, numbers are never given twice
  const many = tagged(null);
  const all = await Promise.all(Array.from({ length: 50 }, (_, i) => call('POST', { ...good, id: `manymanymany${String(i).padStart(4, '0')}`, name: `Many ${i}`, code: K.encodeHouse(7400 + i, {}) }, { store: many }, ENV, `10.4.${i}.1`)));
  assert.ok(all.every((x) => x.out.ok), JSON.stringify(all.find((x) => !x.out.ok)?.out));
  const sns = JSON.parse(many.state.text).houses.map((x) => x.sn);
  assert.equal(sns.length, 50); assert.equal(new Set(sns).size, 50);
}
console.log('5 ok: limits, IPv6 blocks, storage down, no store, two writers at once');

// ---- 6. a house not lit for two days is dark on the street; the star is a fresh house
clock += 3 * 86400000;
res = await call('GET', null, { store });
assert.ok(res.out.houses.every((x) => x.dark && x.streak === 0)); assert.equal(res.out.star, null);
// once the house has gone dark, the same house moved to another phone may take its place
res = await call('POST', { ...good, id: 'zzzzzzzzzzzzzzzz9999', name: 'Moved' }, { store }, ENV, '2.2.2.3');
assert.ok(res.out.ok, JSON.stringify(res.out));
assert.equal(JSON.parse(store.state.text).houses.filter((x) => x.seed === 777 && x.family === 'mumbai').length, 1);
console.log('6 ok: dark houses, house of the night, a moved house takes a dark one');

// ---- 7. the same street on an own server: files on disk instead of Vercel Blob, parallel posts are not lost
const os = await import('node:os'); const fsp = await import('node:fs/promises'); const pth = await import('node:path');
const dir = await fsp.mkdtemp(pth.join(os.tmpdir(), 'street-'));
const FENV = { PROJECT: 'ullu', STORE: 'file', DATA_DIR: dir, STREET_PROOF_BITS: '0', STREET_SALT: 'file-street-salt-0123' };
resetLimits(); clock = Date.parse('2026-11-05T20:00:00Z');
res = await call('GET', null, {}, FENV); assert.equal(res.out.live, true); assert.deepEqual(res.out.houses, []);
// without STREET_SALT the street is read but nothing is written (houses tied to no salt would be lost once it is set),
// and no challenge is signed: there is no stand-in salt (audit 23.11.2026, finding 4). The answer says why
for (const salt of [undefined, '', '   ']) {
  const NENV = { ...FENV, STREET_SALT: salt, STREET_PROOF_BITS: '8' };
  res = await call('POST', { ...good, id: 'nosaltaaaaaaaaaaaaa', name: 'No salt', code: K.encodeHouse(2999, {}, 'haveli') }, {}, NENV, '7.7.6.1');
  assert.equal(res.status, 503); assert.equal(res.out.error, 'off'); assert.equal(res.out.reason, 'no_salt');
  res = await call('GET', null, {}, NENV); assert.equal(res.status, 200); assert.equal(res.out.live, true, 'the street is still read');
  const c = await handle(new Request('https://x/api/street?challenge=1'), NENV, { now });
  assert.equal(c.status, 503, 'no challenge without a salt'); const cj = await c.json();
  assert.equal(cj.reason, 'no_salt'); assert.ok(!('challenge' in cj), 'nothing signed');
}
await assert.rejects(fsp.readFile(pth.join(dir, 'ullu', 'street.json'), 'utf8'), 'no file written without a salt');
// a challenge signed with the old stand-in salt 'street' is not taken by a street that has a salt
{
  const { createHmac } = await import('node:crypto');
  const body = `v1.${clock}.0123456789abcdef.0`;
  const forged = `${body}.${createHmac('sha256', 'proof:street').update(`ullu.${body}`).digest('base64url').slice(0, 22)}`;
  res = await call('POST', { ...good, id: 'forgedaaaaaaaaaaaaa', name: 'Forged', code: K.encodeHouse(2998, {}, 'haveli'), proof: { challenge: forged, nonce: 'a1' } }, {}, { ...FENV, STREET_PROOF_BITS: '1' }, '7.7.6.2');
  assert.equal(res.status, 403); assert.equal(res.out.error, 'proof');
}
const posts = await Promise.all(Array.from({ length: 5 }, (_, i) => call('POST', { ...good, id: `para${i}aaaaaaaaaaaaaa`, name: `Para ${i}`, code: K.encodeHouse(3000 + i, {}, 'haveli') }, {}, FENV, `7.7.7.${i}`)));
assert.ok(posts.every((x) => x.out.ok), JSON.stringify(posts.map((x) => x.out)));
const onDisk = JSON.parse(await fsp.readFile(pth.join(dir, 'ullu', 'street.json'), 'utf8'));
assert.equal(onDisk.houses.length, 5, 'no post lost when they arrive together');
// with a salt set, a house keeps the same key as before the change (houses already on the street stay their owners')
{
  const { createHash } = await import('node:crypto');
  const was = (id) => createHash('sha256').update(`${FENV.STREET_SALT || 'street'}:ullu:${id}`).digest('hex').slice(0, 32);
  assert.deepEqual(onDisk.houses.map((x) => x.key).sort(), Array.from({ length: 5 }, (_, i) => was(`para${i}aaaaaaaaaaaaaa`)).sort());
}
res = await call('GET', null, {}, FENV); assert.equal(res.out.count, 5); assert.ok(res.out.houses.every((x) => x.family === 'haveli'));
res = await call('GET', null, {}, { PROJECT: 'ullu', STORE: 'blob' }); assert.equal(res.out.live, false, 'blob asked for but no token: the street is off, not broken');
await fsp.rm(dir, { recursive: true, force: true });
console.log('7 ok: file store on an own server');

// ---- 8. where the visitor is: country and city from the headers of Vercel, Cloudflare or nginx
const geo = (await import(new URL('../api/geo.js', import.meta.url))).handle;
const ask = async (headers, env = { PROJECT: 'ullu' }) => (await geo(new Request('https://x/api/geo', { headers }), env)).json();
assert.deepEqual(await ask({ 'x-vercel-ip-country': 'EE', 'x-vercel-ip-city': 'Tallinn' }), { country: 'EE', city: 'Tallinn' });
assert.deepEqual(await ask({ 'x-vercel-ip-country': 'BR', 'x-vercel-ip-city': 'S%C3%A3o%20Paulo' }), { country: 'BR', city: 'São Paulo' });
assert.deepEqual(await ask({ 'cf-ipcountry': 'IN', 'cf-ipcity': 'Mumbai' }), { country: 'IN', city: 'Mumbai' });
assert.deepEqual(await ask({ 'x-geo-country': 'cn', 'x-geo-city': 'Shanghai' }), { country: 'CN', city: 'Shanghai' });
assert.deepEqual(await ask({ 'x-my-cc': 'TH' }, { PROJECT: 'ullu', GEO_COUNTRY_HEADER: 'x-my-cc' }), { country: 'TH', city: '' });
assert.deepEqual(await ask({ 'cf-ipcountry': 'XX' }), { country: '', city: '' });
assert.deepEqual(await ask({ 'x-vercel-ip-city': '<img src=x onerror=1>' }), { country: '', city: 'img srcx onerror' });
assert.deepEqual(await ask({}), { country: '', city: '' });
assert.equal((await geo(new Request('https://x/api/geo'), { PROJECT: 'molty' })).status, 404);
console.log('8 ok: country and city from any host');

// ---- 9. street numbers and the moderator (api/admin.js)
{
  resetLimits();
  const { handle: admin, resetAdminLimits } = await import(new URL('../api/admin.js', import.meta.url));
  const store = memoryStore();
  const AENV = { ...ENV, ADMIN_PASSWORD: 'a-long-moderator-password-123' };
  const areq = (method, body, pass, ip = '5.5.5.5') => new Request('https://x/api/admin', { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${pass}`, 'x-forwarded-for': ip }, body: body ? JSON.stringify(body) : undefined });
  const acall = async (method, body, pass = AENV.ADMIN_PASSWORD, env = AENV, ip) => { const r = await admin(areq(method, body, pass, ip), env, { now, store }); return { status: r.status, out: await r.json() }; };
  const house = (id, seed, name, ip) => call('POST', { id: id.padEnd(16, 'x'), name, code: K.encodeHouse(seed, {}), nights: 3, gifts: 3, best: 3, landings: 0, streak: 3 }, { store }, AENV, ip);
  // numbers: 1, 2, 3 in the order the houses come; an update keeps the number
  const h1 = await house('admina', 9101, 'First', '6.6.6.1'), h2 = await house('adminb', 9102, 'Second', '6.6.6.2'), h3 = await house('adminc', 9103, 'Third', '6.6.6.3');
  assert.deepEqual([h1.out.house.sn, h2.out.house.sn, h3.out.house.sn], [1, 2, 3]);
  assert.equal((await house('admina', 9101, 'First again', '6.6.6.1')).out.house.sn, 1, 'an update keeps the number');
  const pub = await call('GET', null, { store }, AENV);
  assert.deepEqual(pub.out.houses.map((x) => x.sn).sort(), [1, 2, 3]); assert.ok(!JSON.stringify(pub.out).includes('"key"'));
  // houses from before the numbers get them, oldest first
  { const j = JSON.parse(store.state.text); const old = { ...j.houses[0], key: 'old'.padEnd(32, '0'), seed: 9199, name: 'Old one', updated: '2026-11-01T00:00:00.000Z' }; delete old.sn; delete j.lastSn; j.houses.push(old); store.state.text = JSON.stringify(j);
    const g = await acall('GET'); assert.equal(g.out.houses.find((x) => x.name === 'Old one').sn, 4); }
  // the admin is off without a long password, and wrong passwords are counted
  assert.equal((await acall('GET', null, 'x', { ...ENV })).status, 404);
  assert.equal((await acall('GET', null, 'short', { ...ENV, ADMIN_PASSWORD: 'short' })).status, 404);
  resetAdminLimits();
  for (let i = 0; i < 5; i++) assert.equal((await acall('GET', null, 'wrong', AENV, '7.7.7.7')).status, 401);
  assert.equal((await acall('GET', null, AENV.ADMIN_PASSWORD, AENV, '7.7.7.7')).status, 429, 'the sixth try in a minute waits, even with the right password');
  assert.equal((await acall('GET')).status, 200, 'another address is not blocked');
  // the list: number, name, signs, no keys
  const list = await acall('GET');
  assert.ok(list.out.houses.length === 4 && !JSON.stringify(list.out).includes('"key"'));
  // remove: off the street, the visitor may come back
  assert.equal((await acall('POST', { action: 'remove', sn: 2 })).out.ok, true);
  assert.ok(!(await call('GET', null, { store }, AENV)).out.houses.some((x) => x.sn === 2));
  const back = await house('adminb', 9102, 'Second back', '6.6.6.2'); assert.ok(back.out.ok); assert.equal(back.out.house.sn, 5, 'a removed house comes back with a new number');
  // ban: off the street and that browser cannot post again; unban lets it back
  assert.equal((await acall('POST', { action: 'ban', sn: 3 })).out.ok, true);
  const tryAgain = await house('adminc', 9103, 'Third again', '6.6.6.3'); assert.equal(tryAgain.status, 403); assert.equal(tryAgain.out.error, 'banned');
  const l2 = await acall('GET'); assert.deepEqual(l2.out.bans.map((b) => b.sn), [3]); assert.deepEqual(l2.out.log.map((e) => e.action), ['ban', 'remove']); assert.ok(!JSON.stringify(l2.out).includes('"key"'), 'a ban shows no key or kept house');
  // unban undoes the ban: the house is back on the street with its number, and its owner can update it
  const unb = await acall('POST', { action: 'unban', sn: 3 }); assert.equal(unb.out.ok, true); assert.equal(unb.out.restored, true);
  { const pub = (await call('GET', null, { store }, AENV)).out.houses.find((x) => x.sn === 3); assert.ok(pub, 'the unbanned house is back'); assert.ok(!('key' in pub)); }
  const freed = await house('adminc', 9103, 'Third free', '6.6.6.3'); assert.ok(freed.out.ok); assert.equal(freed.out.house.sn, 3, 'and keeps its number');
  // the owner put up another house while banned? not possible; but if a lit copy took the picture, the house does not come back
  assert.equal((await acall('POST', { action: 'ban', sn: 3 })).out.ok, true);
  { const j = JSON.parse(store.state.text); j.houses.push({ ...j.bans[0].house, key: 'copy'.padEnd(32, '0'), sn: 90, name: 'Copy' }); store.state.text = JSON.stringify(j); }
  const unb2 = await acall('POST', { action: 'unban', sn: 3 }); assert.equal(unb2.out.restored, false);
  assert.equal((await call('GET', null, { store }, AENV)).out.houses.filter((x) => x.sn === 3).length, 0);
  { const j = JSON.parse(store.state.text); j.houses = j.houses.filter((x) => x.sn !== 90); store.state.text = JSON.stringify(j); }
  // an old ban that kept no house is just lifted
  { const j = JSON.parse(store.state.text); j.bans.push({ key: 'old'.padEnd(32, '0'), sn: 91, name: 'Old', at: j.updated }); store.state.text = JSON.stringify(j); }
  const unb3 = await acall('POST', { action: 'unban', sn: 91 }); assert.equal(unb3.out.ok, true); assert.equal(unb3.out.restored, false);
  // bad requests
  assert.equal((await acall('POST', { action: 'nuke', sn: 1 })).status, 400);
  assert.equal((await acall('POST', { action: 'remove', sn: '1' })).status, 400);
  assert.equal((await acall('POST', { action: 'remove', sn: 999 })).status, 404);
  assert.equal((await admin(new Request('https://x/api/admin', { method: 'GET' }), { ...AENV, PROJECT: 'molty' }, { now, store })).status, 401, 'a project without a street still has the admin (numbers only), behind the password');
  // a house hidden by the word filter is shown to the moderator, marked
  { const j = JSON.parse(store.state.text); j.houses.push({ ...j.houses[0], key: 'rude2'.padEnd(32, '0'), seed: 9300, sn: 77, name: 'Chutiya' }); store.state.text = JSON.stringify(j);
    const g = await acall('GET'); assert.equal(g.out.houses.find((x) => x.sn === 77).hidden, 'words'); }
  console.log('9 ok: street numbers, moderator list, remove, ban and unban, wrong passwords');
}
// ---- 10. visit and click numbers (api/stats.js) and their place in the moderator page
{
  const { handle: stats, resetStatsLimits, cleanReport } = await import(new URL('../api/stats.js', import.meta.url));
  const { handle: admin, resetAdminLimits } = await import(new URL('../api/admin.js', import.meta.url));
  resetStatsLimits(); resetAdminLimits();
  const files = new Map(); let writes = 0;
  const store = { async read(env, p) { return files.get(p) ?? null; }, async write(env, p, b) { files.set(p, b); writes += 1; } };
  const AENV = { ...ENV, ADMIN_PASSWORD: 'a-long-moderator-password-123' };
  const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
  const sreq = (body, ip = '8.8.8.8', ua = UA, method = 'POST') => new Request('https://x/api/stats', { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, 'user-agent': ua }, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined });
  const send = async (body, ip, ua, env = AENV, method) => (await stats(sreq(body, ip, ua, method), env, { now, store })).status;
  // a report adds to the numbers of the day; visit and visitor count at most once per report, the rest up to 30
  assert.equal(await send({ e: { visit: 1, visitor: 1, play: 2, share: 1, buy: 1 } }), 204);
  assert.equal(await send({ e: { visit: 5, visitor: 3, play: 100, save: 1, ca: 1, unknown: 7 } }), 204);
  const day0 = JSON.parse(files.get('ullu/stats.json')).days['2026-11-05'];
  assert.deepEqual(day0, { visit: 2, visitor: 2, play: 32, share: 1, buy: 1, save: 1, ca: 1 });
  // nothing is stored about the visitor: no address, no browser, no id
  assert.ok(!files.get('ullu/stats.json').includes('8.8.8.8') && !files.get('ullu/stats.json').includes('iPhone'));
  // bad reports, bots, a wrong method, nothing to count
  assert.equal(await send({ e: { play: -1 } }), 400); assert.equal(await send({ e: { play: 1.5 } }), 400);
  assert.equal(await send({ e: {} }), 400); assert.equal(await send('not json'), 400); assert.equal(await send({ e: [1] }), 400);
  assert.equal(await send('x'.repeat(2000)), 413);
  assert.equal(await send({ e: { visit: 1 } }, '8.8.8.8', 'Mozilla/5.0 (compatible; Googlebot/2.1)'), 204);
  assert.equal(await send({ e: { visit: 1 } }, '8.8.8.8', 'TelegramBot (like TwitterBot)'), 204);
  assert.equal(await send({ e: { visit: 1 } }, '8.8.8.8', 'Mozilla/5.0 HeadlessChrome/120'), 204);
  assert.equal(JSON.parse(files.get('ullu/stats.json')).days['2026-11-05'].visit, 2, 'bots are not counted');
  assert.equal(await send(null, '8.8.8.8', UA, AENV, 'GET'), 405);
  assert.deepEqual(cleanReport({ visit: 0, play: 0 }), null);
  // no storage: the site goes on, nothing is counted
  assert.equal(await send({ e: { visit: 1 } }, '9.9.9.1', UA, { PROJECT: 'ullu' }), 204);
  // 400 reports an hour from one address, then it waits; another address goes on
  const w0 = writes; let lastStatus = 0;
  for (let i = 0; i < 405; i++) lastStatus = await send({ e: { play: 1 } }, '4.4.4.4');
  assert.equal(lastStatus, 429); assert.equal(writes - w0, 400);
  assert.equal(await send({ e: { play: 1 } }, '4.4.4.5'), 204);
  // a new day starts a new row; the oldest days go after 400
  clock += 86400000; assert.equal(await send({ e: { visit: 1, visitor: 1 } }, '4.4.4.6'), 204); clock -= 86400000;
  // reports at the same moment are not lost (one server process)
  const before = JSON.parse(files.get('ullu/stats.json')).days['2026-11-05'].share;
  await Promise.all(Array.from({ length: 40 }, (_, i) => send({ e: { share: 1 } }, `3.3.${i}.1`)));
  assert.equal(JSON.parse(files.get('ullu/stats.json')).days['2026-11-05'].share, before + 40);
  { const j = JSON.parse(files.get('ullu/stats.json')); for (let i = 0; i < 420; i++) j.days[`2025-01-${String(i).padStart(3, '0')}`] = { visit: 1 }; files.set('ullu/stats.json', JSON.stringify(j));
    await send({ e: { visit: 1 } }, '4.4.4.7'); assert.equal(Object.keys(JSON.parse(files.get('ullu/stats.json')).days).length, 400); }
  // a store that cannot be read this time (a network error, a file the server may not read, a damaged file) keeps the
  // numbers it has: the report is refused, it never starts the numbers again from an empty file
  {
    const keep = files.get('ullu/stats.json'); const w0 = writes;
    const sick = { read: async () => { throw new Error('read failed'); }, write: store.write };
    assert.equal((await stats(sreq({ e: { visit: 1 } }, '4.4.4.8'), AENV, { now, store: sick })).status, 503);
    files.set('ullu/stats.json', '{"days": {"2026-11-05": {"visit": 3'); const torn = files.get('ullu/stats.json');
    assert.equal(await send({ e: { visit: 1 } }, '4.4.4.9'), 503);
    assert.equal(files.get('ullu/stats.json'), torn, 'a damaged file is left for the owner to look at');
    assert.equal(writes, w0, 'nothing is written over the numbers');
    files.set('ullu/stats.json', keep);
  }
  // the moderator page gets the numbers, newest day first, with the street
  const areq = (method, body, env = AENV) => admin(new Request('https://x/api/admin', { method, headers: { authorization: `Bearer ${AENV.ADMIN_PASSWORD}`, 'x-forwarded-for': '5.5.5.9', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), env, { now, store });
  const g = await (await areq('GET')).json();
  assert.equal(g.street, true); assert.equal(g.stats.days[0].day, '2026-11-06'); assert.equal(g.stats.days[1].day, '2026-11-05');
  assert.deepEqual(g.stats.events, ['visit', 'visitor', 'play', 'picture', 'share', 'save', 'buy', 'ca', 'city']);
  // a project without a street: the admin shows only the numbers, street actions are refused
  const files2 = new Map([['molty/stats.json', JSON.stringify({ days: { '2026-11-05': { visit: 3 } }, rev: 1 })]]);
  const store2 = { async read(env, p) { return files2.get(p) ?? null; }, async write(env, p, b) { files2.set(p, b); } };
  const MENV = { PROJECT: 'molty', STORE: 'file', DATA_DIR: '/tmp/none', ADMIN_PASSWORD: AENV.ADMIN_PASSWORD };
  const m = await admin(new Request('https://x/api/admin', { headers: { authorization: `Bearer ${AENV.ADMIN_PASSWORD}` } }), MENV, { now, store: store2 });
  const mo = await m.json(); assert.equal(m.status, 200); assert.equal(mo.street, false); assert.deepEqual(mo.stats.days, [{ day: '2026-11-05', visit: 3 }]);
  const mp = await admin(new Request('https://x/api/admin', { method: 'POST', headers: { authorization: `Bearer ${AENV.ADMIN_PASSWORD}` }, body: JSON.stringify({ action: 'remove', sn: 1 }) }), MENV, { now, store: store2 });
  assert.equal(mp.status, 404);
  console.log('10 ok: visit and click numbers by day, limits, bots, no personal data, in the moderator page');
}

// ---- 11. the city map: every house in a short row, full houses on request, two thousand houses
{
  resetLimits();
  const st = memoryStore();
  const get = async (query) => { const r = await handle(new Request(`https://ullu.vercel.app/api/street${query}`, { headers: { 'x-forwarded-for': '9.9.9.9' } }), ENV, { now, store: st }); return { status: r.status, out: await r.json(), cache: r.headers.get('cache-control') }; };
  let m = await get('?map=1');
  assert.equal(m.status, 200); assert.deepEqual(m.out.houses, []); assert.equal(m.out.star, 0); assert.equal(m.out.count, 0);
  const mk = (i, more = {}) => ({ id: `mapvisitor${String(i).padStart(10, '0')}`, name: `Map ${i}`, code: K.encodeHouse(5000 + i, K.autoDecorate(5000 + i, 5, false, K.FAMILY_IDS[i % K.FAMILY_IDS.length]), K.FAMILY_IDS[i % K.FAMILY_IDS.length], i % 2 ? 'gold' : ''), nights: 8, gifts: 8, best: 7, landings: 1, streak: 1 + (i % 7), ...more });
  for (let i = 1; i <= 5; i++) { const r = await call('POST', mk(i), { store: st }, ENV, `10.0.${i}.1`); assert.ok(r.out.ok, JSON.stringify(r.out)); clock += 1000; }
  m = await get('?map=1');
  assert.equal(m.out.count, 5); assert.equal(m.out.houses.length, 5); assert.ok(m.cache.includes('s-maxage=30'));
  assert.deepEqual(m.out.houses.map((x) => x[0]), [1, 2, 3, 4, 5], 'oldest number first');
  { const [sn, name, seed, fam, wish, paint, light, streak, age] = m.out.houses[2];
    assert.equal(sn, 3); assert.equal(name, 'Map 3'); assert.equal(seed, 5003); assert.equal(K.FAMILY_IDS[fam], K.FAMILY_IDS[3 % K.FAMILY_IDS.length]); assert.equal(K.WISH_IDS[wish], 'gold');
    assert.equal(paint, ''); assert.equal(streak, 4); assert.equal(age, 0);
    assert.equal(light, K.lightOf(K.houseOf(5003, K.FAMILY_IDS[fam], { wish: 'gold' }), K.autoDecorate(5003, 5, false, K.FAMILY_IDS[fam]), 4), 'the light on the map is the light on the street'); }
  assert.equal(m.out.houses[1][4], -1, 'no wish');
  assert.ok(!JSON.stringify(m.out).includes('mapvisitor'), 'no visitor ids on the map'); assert.ok(m.out.houses.every((x) => x.length === 9));
  // the star of the map is the house of the night of the street
  { const s = await call('GET', null, { store: st }); assert.equal(m.out.star, s.out.star.sn); }
  // full houses on request: only the numbers asked for, never more than forty, rubbish is ignored
  let c = await get('?sn=2,4,4,999,abc,-1,2.5');
  assert.deepEqual(c.out.houses.map((x) => x.sn).sort(), [2, 4]); assert.ok(c.out.houses.every((x) => typeof x.code === 'string' && K.decodeHouse(x.code) && !('key' in x)));
  assert.deepEqual((await get('?sn=')).out.houses, []);
  c = await get(`?sn=${Array.from({ length: 60 }, (_, i) => (i < 55 ? 900 + i : i - 54)).join(',')}`);
  assert.deepEqual(c.out.houses, [], 'only the first forty numbers of a request are looked at');
  // a change shows on the map at once (the list of houses a page may see follows the file)
  let r = await call('POST', mk(2, { name: 'Map two', streak: 7 }), { store: st }, ENV, '10.0.2.1'); assert.ok(r.out.ok);
  m = await get('?map=1'); assert.equal(m.out.houses[1][1], 'Map two'); assert.equal(m.out.houses[1][7], 7);
  r = await call('POST', { id: mk(5).id, remove: true }, { store: st }, ENV, '10.0.5.1'); assert.ok(r.out.removed);
  m = await get('?map=1'); assert.deepEqual(m.out.houses.map((x) => x[0]), [1, 2, 3, 4]);
  // a word the street does not allow hides the house from the map and from the full houses too
  { const j = JSON.parse(st.state.text); j.houses.find((x) => x.sn === 3).name = 'rug pull'; st.state.text = JSON.stringify(j); }
  m = await get('?map=1'); assert.deepEqual(m.out.houses.map((x) => x[0]), [1, 2, 4]); assert.equal(m.out.count, 3);
  assert.deepEqual((await get('?sn=3')).out.houses, []);
  // dark after two days: streak 0, the dark light, the hours grow
  clock += 50 * 3600000;
  m = await get('?map=1'); assert.ok(m.out.houses.every((x) => x[7] === 0 && x[8] >= 50)); assert.equal(m.out.star, 0);
  // two thousand houses stay on the street; the 2001st pushes out the one lit longest ago
  resetLimits();
  const big = memoryStore();
  const t0 = Date.parse('2026-11-01T00:00:00Z');
  big.state.text = JSON.stringify({ lastSn: 2000, bans: [], log: [], updated: new Date(t0).toISOString(), houses: Array.from({ length: 2000 }, (_, i) => {
    const seed = 100000 + i, fam = K.FAMILY_IDS[i % K.FAMILY_IDS.length], placed2 = K.autoDecorate(seed, 4, false, fam), hh = K.houseOf(seed, fam);
    return { key: `k${i}`, seed, family: fam, wish: '', name: `Home ${'abcdefghij'[Math.floor(i / 100) % 10]}${'klmnopqrst'[Math.floor(i / 10) % 10]}${'uvwxyzabcd'[i % 10]}${i >= 1000 ? ' b' : ''}`, code: K.encodeHouse(seed, placed2, fam), no: hh.no, nights: 3, gifts: 3, best: 3, landings: 0, streak: 2, sn: i + 1,
      light: K.lightOf(hh, placed2, 2), lightDark: K.lightOf(hh, placed2, 1), updated: new Date(t0 + i * 1000).toISOString() };
  }) });
  clock = t0 + 3000 * 1000;
  const getBig = async (query) => { const r2 = await handle(new Request(`https://ullu.vercel.app/api/street${query}`), ENV, { now, store: big }); return r2.json(); };
  let all = await getBig('?map=1'); assert.equal(all.houses.length, 2000); assert.equal(all.count, 2000);
  const t1 = performance.now(); await getBig('?map=1'); await getBig(''); await getBig('?sn=5,6,7');
  assert.ok(performance.now() - t1 < 400, 'the second look at the same file does not read every code again');
  assert.equal((await getBig('')).houses.length, 60, 'the street row still shows sixty');
  // every house is lit: a new one does not push any of them off, it waits; the owners still update theirs
  const w0 = big.state.writes;
  r = await call('POST', mk(77), { store: big }, ENV, '10.1.1.1'); assert.equal(r.status, 503); assert.equal(r.out.error, 'full');
  assert.equal(big.state.writes, w0, 'a full street is not written');
  r = await call('POST', { ...mk(78), id: 'k5notavisitorid', name: 'x' }, { store: big }, ENV, '10.1.1.2'); assert.equal(r.out.error, 'bad');
  // houses 1 and 2 went dark: the next new house takes the place of the one that went dark longest ago, the lit ones stay
  { const j = JSON.parse(big.state.text); j.houses[0].updated = new Date(t0 - 4 * 86400000).toISOString(); j.houses[1].updated = new Date(t0 - 3 * 86400000).toISOString(); big.state.text = JSON.stringify(j); }
  r = await call('POST', mk(77), { store: big }, ENV, '10.1.1.1'); assert.ok(r.out.ok, JSON.stringify(r.out)); assert.equal(r.out.house.sn, 2001);
  all = await getBig('?map=1'); assert.equal(all.houses.length, 2000); assert.equal(all.houses[0][0], 2, 'house 1 was dark longest and left'); assert.equal(all.houses[1999][0], 2001);
  r = await call('POST', mk(81), { store: big }, ENV, '10.1.1.3'); assert.ok(r.out.ok, JSON.stringify(r.out)); assert.equal(r.out.house.sn, 2002);
  all = await getBig('?map=1'); assert.equal(all.houses.length, 2000); assert.equal(all.houses[0][0], 3, 'then house 2');
  r = await call('POST', mk(82), { store: big }, ENV, '10.1.1.4'); assert.equal(r.out.error, 'full', 'no dark house left');
  console.log('11 ok: the city map, full houses on request, word filter, dark houses, two thousand houses, a full street');
}

// ---- 12. where the houses of the city stand (src/lib/lights-city.js)
{
  const C = await import(new URL('../src/lib/lights-city.js', import.meta.url));
  let seedC = 7; const rndC = () => ((seedC = (seedC * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const [n, wide] of [[0, true], [1, false], [6, true], [45, false], [300, true], [2000, true], [2000, false]]) {
    const styles = Array.from({ length: n }, () => { const v = rndC(); return v < 0.3 ? 0 : v < 0.5 ? 1 : v < 0.6 ? 2 : v < 0.7 ? 3 : v < 0.85 ? 4 : v < 0.9 ? 5 : v < 0.95 ? 6 : v < 0.98 ? 7 : 8; });
    const p2 = C.cityPlan(styles, { count: 9, wide });
    const hs = p2.spots.filter((q) => q.i >= 0);
    assert.equal(hs.length, n, `${n}: every house has a place`); assert.equal(new Set(hs.map((q) => q.i)).size, n, 'no house twice');
    assert.ok(p2.spots.length - n >= 18, 'empty lots around the city');
    // nobody stands on the visitor's place in the middle, and no two houses overlap
    assert.ok(p2.spots.every((q) => Math.hypot(q.x, q.y) > 1.3));
    let min = 9; for (let i = 0; i < p2.spots.length; i++) for (let j = i + 1; j < Math.min(p2.spots.length, i + 300); j++) min = Math.min(min, Math.hypot(p2.spots[i].x - p2.spots[j].x, p2.spots[i].y - p2.spots[j].y));
    assert.ok(min > 1.38, `${n}: houses stand apart (${min})`);
    // from the first day the city has a district for every style, with empty lots in it and an avenue on its side,
    // and every house stands in the district of its style
    assert.equal(p2.districts.length, 9); assert.equal(p2.avenues.length, 9); assert.ok(hs.every((q) => q.d === styles[q.i]));
    for (let d = 0; d < 9; d++) assert.ok(p2.spots.filter((q) => q.i < 0 && q.d === d).length >= 2, `${n}: empty lots in district ${d}`);
    assert.deepEqual(p2.districts.map((q) => q.n), Array.from({ length: 9 }, (_, d) => styles.filter((s) => s === d).length));
    // the names stand around a small city and inside a large one, never two in one place
    assert.equal(p2.districts[0].out, n < 300); assert.ok(p2.districts.every((q) => q.out === p2.districts[0].out));
    for (const q of p2.districts) { const far2 = Math.hypot(q.x / p2.kx, q.y / p2.ky); assert.ok(q.out ? far2 > p2.R + 1 : far2 < p2.R); }
    // a river and ring roads only in a city large enough for them
    assert.equal(Boolean(p2.river), n >= 300); assert.equal(p2.rings.length > 0, n >= 300);
    // in a district the houses stand in the order they came: the first ones nearest to the middle
    for (let d = 0; d < 9; d++) { const mine = hs.filter((q) => q.d === d).map((q) => q.i); assert.deepEqual(mine, [...mine].sort((a, b) => a - b)); }
    // a point on a house finds it; a point far outside finds nothing
    const find2 = C.cityFinder(p2.spots);
    if (p2.spots.length) { assert.equal(find2(p2.spots[5].x + 0.3, p2.spots[5].y - 0.2), 5); assert.equal(find2(p2.R * 3, p2.R * 3), -1); }
    // the same houses give the same city
    assert.deepEqual(C.cityPlan(styles, { count: 9, wide }).spots.slice(0, 50), p2.spots.slice(0, 50));
  }
  // the small house of the map has the walls and the windows of the real one
  const m = C.miniHouse(7123, 'haveli', 'gold', '', 4), real = K.houseOf(7123, 'haveli', { wish: 'gold' });
  assert.equal(m.no, real.no); assert.equal(m.wall, real.wall); assert.equal(m.windows.length, real.windows.length);
  assert.equal(m.windows.filter((w) => w[4]).length, Math.max(1, Math.round((real.windows.length * 4) / K.NIGHTS)));
  assert.equal(C.miniHouse(7123, 'haveli', 'gold', '', 0).windows.filter((w) => w[4]).length, 0, 'a dark house has no lit windows');
  console.log('12 ok: the plan of the city, districts from the first house, roads, finding a house, the small house');
}
// ---- 13. against a flood of new houses: the browser check (src/lib/street-proof.js) and removing a run of numbers
{
  const P = await import(new URL('../src/lib/street-proof.js', import.meta.url));
  const { createHash } = await import('node:crypto');
  // the browser's sha256 is the same as node's, for texts of every length around the block edges
  for (let n = 0; n < 150; n++) { const t = Array.from({ length: n }, (_, i) => String.fromCharCode(33 + ((i * 7 + n) % 90))).join(''); assert.equal(P.sha256Hex(t), createHash('sha256').update(t).digest('hex'), `sha256 of ${n} characters`); }
  resetLimits(); clock = Date.parse('2026-11-16T12:00:00Z');
  const PENV = { ...ENV, STREET_PROOF_BITS: '8' };
  let reads = 0; const st = memoryStore(); const rd = st.read; st.read = async (...a) => { reads += 1; return rd(...a); };
  const challenge = async (env = PENV) => (await handle(new Request('https://ullu.vercel.app/api/street?challenge=1'), env, { now, store: st })).json();
  const c0 = await challenge(); assert.equal(c0.bits, 8); assert.match(c0.challenge, /^v1\.\d{13}\.[0-9a-f]{16}\.8\.[A-Za-z0-9_-]{22}$/);
  assert.equal((await challenge(ENV)).challenge, '', 'bits 0: no check'); assert.equal((await challenge({ ...ENV, STREET_PROOF_BITS: undefined })).bits, 16, 'sixteen bits when nothing is set');
  assert.equal((await challenge({ ...ENV, STREET_PROOF_BITS: '99' })).bits, 16, 'a wrong setting falls back to sixteen');
  assert.equal((await challenge({ ...ENV, STREET_PROOF_BITS: '' })).bits, 16, 'an empty line in .env is not 0');
  assert.equal((await challenge({ ...ENV, STREET_PROOF_BITS: ' 12 ' })).bits, 12);
  const hp = (i, more = {}) => ({ id: `proofvisitor${String(i).padStart(8, '0')}`, name: `Proof ${i}`, code: K.encodeHouse(8800 + i, {}), nights: 3, gifts: 3, best: 3, landings: 0, streak: 3, ...more });
  const solved = async (i, env = PENV) => { const c = await challenge(env); return { challenge: c.challenge, nonce: await P.solveProof(c.challenge, hp(i).id, c.bits) }; };
  // a new house without the answer is turned away and nothing is written; the page then asks for a challenge
  let r = await call('POST', hp(1), { store: st }, PENV, '8.8.1.1'); assert.equal(r.status, 403); assert.equal(r.out.error, 'proof'); assert.equal(st.state.writes, 0);
  const pr1 = await solved(1);
  assert.ok(P.proofOk(pr1.challenge, hp(1).id, pr1.nonce, 8));
  r = await call('POST', hp(1, { proof: pr1 }), { store: st }, PENV, '8.8.1.1'); assert.ok(r.out.ok, JSON.stringify(r.out)); assert.equal(r.out.house.sn, 1);
  // the owner updates the house without any check
  r = await call('POST', hp(1, { name: 'Proof one', nights: 4, gifts: 4, best: 4, streak: 4 }), { store: st }, PENV, '8.8.1.1'); assert.ok(r.out.ok); assert.equal(r.out.house.sn, 1);
  // an answer is for one browser id and one house
  r = await call('POST', hp(2, { proof: pr1 }), { store: st }, PENV, '8.8.1.2'); assert.equal(r.out.error, 'proof', 'not for another id');
  { const j = JSON.parse(st.state.text); j.houses = []; st.state.text = JSON.stringify(j); }
  r = await call('POST', hp(1, { proof: pr1 }), { store: st }, PENV, '8.8.1.1'); assert.equal(r.out.error, 'proof', 'not twice');
  // wrong answers are turned away before the street is read
  const pr2 = await solved(2);
  const [v, t, rand, bits, sig] = pr2.challenge.split('.');
  const bad = [
    null, 'x', {}, { challenge: pr2.challenge }, { challenge: pr2.challenge, nonce: 5 }, { challenge: pr2.challenge, nonce: 'NOPE' }, { challenge: pr2.challenge, nonce: 'a'.repeat(13) },
    { challenge: pr2.challenge + 'x', nonce: pr2.nonce }, { challenge: 'v'.repeat(121), nonce: pr2.nonce },
    { challenge: [v, t, rand, bits, sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A')].join('.'), nonce: pr2.nonce },
    { challenge: [v, t, rand.replace(/^./, (ch) => (ch === '0' ? '1' : '0')), bits, sig].join('.'), nonce: pr2.nonce },
    { challenge: [v, String(Number(t) + 1), rand, bits, sig].join('.'), nonce: pr2.nonce },
    { challenge: [v, t, rand, '30', sig].join('.'), nonce: pr2.nonce },
  ];
  // a nonce that does not give the zero bits
  { let n = 0; while (P.proofOk(pr2.challenge, hp(2).id, n.toString(36), 8)) n += 1; bad.push({ challenge: pr2.challenge, nonce: n.toString(36) }); }
  const r0 = reads;
  for (const proof of bad) { const x = await call('POST', hp(2, { proof }), { store: st }, PENV, '8.8.1.2'); assert.equal(x.status, 403, JSON.stringify(proof)); assert.equal(x.out.error, 'proof'); }
  assert.equal(reads, r0, 'no wrong answer reads the street');
  // a challenge signed with another salt, an easier one, a stale one
  const other = await solved(2, { ...PENV, STREET_SALT: 'other' });
  assert.equal((await call('POST', hp(2, { proof: other }), { store: st }, PENV, '8.8.1.2')).out.error, 'proof', 'another street');
  const easy = await solved(2, { ...PENV, STREET_PROOF_BITS: '4' });
  assert.equal((await call('POST', hp(2, { proof: easy }), { store: st }, PENV, '8.8.1.2')).out.error, 'proof', 'easier than the street asks now');
  const old = await solved(2); clock += 11 * 60000;
  assert.equal((await call('POST', hp(2, { proof: old }), { store: st }, PENV, '8.8.1.2')).out.error, 'proof', 'older than ten minutes');
  r = await call('POST', hp(2, { proof: await solved(2) }), { store: st }, PENV, '8.8.1.2'); assert.ok(r.out.ok, 'a fresh one is fine');
  // the real difficulty: one house, solved the way a browser does it
  { const t0 = performance.now(); const real = await solved(3, { ...ENV, STREET_PROOF_BITS: undefined }); const ms = performance.now() - t0;
    r = await call('POST', hp(3, { proof: real }), { store: st }, { ...ENV, STREET_PROOF_BITS: undefined }, '8.8.1.3'); assert.ok(r.out.ok, JSON.stringify(r.out));
    console.log(`   sixteen bits found in ${Math.round(ms)} ms here`); }
  // the moderator takes a run of numbers off the street at once (a flood comes as one run); one line in the log
  const { handle: admin } = await import(new URL('../api/admin.js', import.meta.url));
  const AENV = { ...ENV, ADMIN_PASSWORD: 'a-long-moderator-password-123' };
  const acall = async (body) => { const x = await admin(new Request('https://x/api/admin', { method: 'POST', headers: { authorization: `Bearer ${AENV.ADMIN_PASSWORD}`, 'x-forwarded-for': '5.5.5.9' }, body: JSON.stringify(body) }), AENV, { now, store: st }); return { status: x.status, out: await x.json() }; };
  resetLimits();
  for (let i = 10; i < 20; i++) assert.ok((await call('POST', hp(i), { store: st }, ENV, `8.8.2.${i}`)).out.ok);
  const sns = () => JSON.parse(st.state.text).houses.map((x) => x.sn).sort((a2, b2) => a2 - b2);
  const before = sns(); assert.equal(before.length, 12);
  for (const body of [{ action: 'remove', from: 5, to: 4 }, { action: 'remove', from: 0, to: 4 }, { action: 'remove', from: 1, to: 200000 }, { action: 'ban', from: 5, to: 9 },
    { action: 'unban', from: 5, to: 9 }, { action: 'remove', from: '5', to: 9 }, { action: 'remove', from: 5 }])
    assert.equal((await acall(body)).status, 400, JSON.stringify(body));
  assert.equal((await acall({ action: 'remove', from: 500, to: 600 })).status, 404, 'no houses with these numbers');
  const lo = before[4], hi = before[9];
  r = await acall({ action: 'remove', from: lo, to: hi }); assert.ok(r.out.ok); assert.equal(r.out.removed, 6);
  assert.deepEqual(sns(), before.filter((n) => n < lo || n > hi));
  const log = JSON.parse(st.state.text).log.at(-1); assert.deepEqual([log.action, log.sn, log.to, log.name], ['remove', lo, hi, '6 houses']);
  assert.equal(JSON.parse(st.state.text).bans.length, 0, 'a run is removed, not banned');
  // a weak moderator password keeps the page off: 16 characters of one or two letters are not enough
  const { resetAdminLimits } = await import(new URL('../api/admin.js', import.meta.url));
  const aget = async (pass, ip, env = AENV, at = now) => (await admin(new Request('https://x/api/admin', { headers: { authorization: `Bearer ${pass}`, 'x-forwarded-for': ip } }), env, { now: at, store: st })).status;
  resetAdminLimits();
  for (const weak of ['aaaaaaaaaaaaaaaa', 'abababababababababab', 'abcdefgabcdefgabcdefg']) assert.equal(await aget(weak, '5.6.0.1', { ...ENV, ADMIN_PASSWORD: weak }), 404, weak);
  assert.equal(await aget('abcdefghabcdefgh', '5.6.0.1', { ...ENV, ADMIN_PASSWORD: 'abcdefghabcdefgh' }), 200, 'eight different characters');
  // wrong passwords from thousands of addresses do not wipe the count of the first one
  resetAdminLimits();
  for (let i = 0; i < 5; i++) assert.equal(await aget('wrong-password-xyz', '5.6.1.1'), 401);
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.1.1'), 429, 'sixth try waits');
  for (let i = 0; i < 5010; i++) await aget('wrong-password-xyz', `2001:db8:aaaa:${i.toString(16)}::1`);
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.1.1'), 429, 'still waits after 5010 other addresses');
  assert.equal(await aget('wrong-password-xyz', '5.6.9.9'), 401, 'wrong tries from other addresses never lock a new address');
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.9.8'), 200, 'the moderator from another address comes in at once');
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.1.1', AENV, () => clock + 60000), 200, 'after a minute the address comes in');
  // the wait grows: after a right password it starts again; 5 wrong → 1 minute, the 6th → 2 minutes, the 7th → 4
  resetAdminLimits();
  for (let i = 0; i < 5; i++) assert.equal(await aget('wrong-password-xyz', '5.6.2.1'), 401);
  assert.equal(await aget('wrong-password-xyz', '5.6.2.1', AENV, () => clock + 61000), 401, 'the sixth wrong one after the wait');
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.2.1', AENV, () => clock + 61000 + 90000), 429, 'now the wait is two minutes');
  assert.equal(await aget(AENV.ADMIN_PASSWORD, '5.6.2.1', AENV, () => clock + 61000 + 121000), 200, 'and it ends');
  // signing in: the page keeps a token, never the password
  const post = async (body, auth, env = AENV, extra = {}) => { const x = await admin(new Request('https://x/api/admin', { method: 'POST', headers: { authorization: `Bearer ${auth}`, 'x-forwarded-for': '5.6.3.1', ...extra }, body: JSON.stringify(body) }), env, { now, store: st }); return { status: x.status, out: await x.json() }; };
  const login = await post({ action: 'login' }, AENV.ADMIN_PASSWORD);
  assert.equal(login.status, 200); assert.match(login.out.token, /^adm1\./); assert.ok(!login.out.token.includes(AENV.ADMIN_PASSWORD));
  const tok = login.out.token;
  assert.equal(await aget(tok, '5.6.3.1'), 200, 'the token opens the page');
  assert.equal(await aget(tok, '5.6.3.1', { ...AENV, ADMIN_PASSWORD: 'a-new-moderator-password-456' }), 401, 'a new password ends the old tokens');
  assert.equal(await aget(tok, '5.6.3.1', AENV, () => clock + 13 * 3600000), 401, 'a token ends after 12 hours');
  assert.equal(await aget(tok.slice(0, -2) + (tok.endsWith('AA') ? 'BB' : 'AA'), '5.6.3.1'), 401, 'a changed token is refused');
  assert.equal(await aget(`adm1.zzzzzzzz.0.${'A'.repeat(43)}`, '5.6.3.1'), 401, 'a made-up token is refused');
  // a token is never held back by wrong passwords from the same address
  resetAdminLimits();
  for (let i = 0; i < 6; i++) await aget('wrong-password-xyz', '5.6.3.1');
  assert.equal(await aget(tok, '5.6.3.1'), 200, 'the signed-in moderator keeps working');
  // log out everywhere: every token given so far ends; a new sign-in works
  assert.equal((await post({ action: 'logout-all' }, tok)).status, 200);
  assert.equal(await aget(tok, '5.6.3.2'), 401, 'the old token is over');
  const again = await post({ action: 'login' }, AENV.ADMIN_PASSWORD, AENV, { 'x-forwarded-for': '5.6.3.3' });
  assert.equal(again.status, 200); assert.equal(await aget(again.out.token, '5.6.3.3'), 200);
  // another site's page cannot act here; a big or broken body is refused
  assert.equal((await post({ action: 'remove', sn: 1 }, again.out.token, AENV, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post({ action: 'remove', sn: 1, pad: 'x'.repeat(5000) }, again.out.token)).status, 413);
  for (const body of [[], 'x', null, { action: 'login2' }]) assert.equal((await post(body, again.out.token)).status, body === null ? 400 : 400, JSON.stringify(body));
  resetAdminLimits();
  console.log('13 ok: the browser check for new houses, wrong and used answers, removing a run of numbers, admin password limits');
}
// ---- 14. hostile names: the street keeps only plain Latin names, so look-alikes and tricks never reach a page
{
  const hostile = ['', ' ', 'a', 'x'.repeat(19), 'x'.repeat(5000), 'Raju 😀', 'Ra\u200Bju', 'Ra\u200Dju', '\u202EujaR', 'R\u0430ju' /* Cyrillic a */, 'Rɑju',
    'Ｒａｊｕ', 'Raju\u0000', '<b>Raju</b>', 'Raju"><svg>', 'Ra\u0301ju', 'Raju.com', 'www.raju', 't.me Raju', '@raju'];
  for (const n of hostile) assert.equal(K.cleanName(n), '', JSON.stringify(n));
  assert.equal(K.cleanName('  Raju   Kumar '), 'Raju Kumar', 'spaces are tidied'); assert.equal(K.cleanName('Raju\n'), 'Raju'); assert.equal(K.cleanName(' Raju'), 'Raju');
  const st = memoryStore(); resetLimits();
  for (const [i, name] of hostile.entries()) {
    const r = await call('POST', { ...good, id: `hostilehostile${String(i).padStart(4, '0')}`, name, code: K.encodeHouse(8800 + i, {}) }, { store: st }, ENV, `9.8.${i}.1`);
    assert.equal(r.status, 400, JSON.stringify(name)); assert.ok(['name', 'bad'].includes(r.out.error), JSON.stringify(r.out));
  }
  assert.equal(st.state.writes, 0, 'nothing was written');
  // a name that is not a string at all
  for (const name of [123, null, ['Raju'], { toString: () => 'Raju' }]) assert.equal((await call('POST', { ...good, id: 'objnameobjname0000', name }, { store: st }, ENV, '9.8.99.1')).status, 400);
}
console.log('14 ok: hostile names: emoji, invisible and right-to-left characters, look-alike letters, tags, links');
// ---- 15. the review of 24.11: another site's page, a flood from one network, harder checks under a flood, copies of
// a dark house, the admin sign-in, and safe writes of the street file
{
  const { handle: admin, resetAdminLimits } = await import(new URL('../api/admin.js', import.meta.url));
  const { handle: stats } = await import(new URL('../api/stats.js', import.meta.url));
  const { netKey, ipKey } = await import(new URL('../api/_agent/ip.js', import.meta.url));
  const { fileStore } = await import(new URL('../api/_agent/store.js', import.meta.url));
  resetLimits(); resetAdminLimits();
  const st = memoryStore();
  const body = (i, more = {}) => ({ id: `reviewvisitor${String(i).padStart(7, '0')}`, name: `Rev ${i}`, code: K.encodeHouse(91000 + i, {}), nights: 3, gifts: 3, best: 3, landings: 0, streak: 3, ...more });
  const raw = async (b, headers, env = ENV) => { const r = await handle(new Request('https://ullu.vercel.app/api/street', { method: 'POST', headers, body: JSON.stringify(b) }), env, { now, store: st }); return { status: r.status, out: await r.json() }; };
  // another site's page cannot post a house, a plain-text post is not taken; this site's own page can
  assert.equal((await raw(body(1), { 'content-type': 'application/json', origin: 'https://evil.example', 'x-forwarded-for': '6.1.1.1' })).status, 403);
  assert.equal((await raw(body(1), { 'content-type': 'text/plain', 'x-forwarded-for': '6.1.1.1' })).status, 415);
  assert.equal(st.state.writes, 0, 'nothing written for them');
  assert.ok((await raw(body(1), { 'content-type': 'application/json', origin: 'https://ullu.vercel.app', 'x-forwarded-for': '6.1.1.1' })).out.ok);
  // the counter of visits takes reports only from this site's page, as JSON
  const sreport = (headers) => stats(new Request('https://ullu.vercel.app/api/stats', { method: 'POST', headers: { 'user-agent': 'Mozilla/5.0 (iPhone) Safari', 'x-forwarded-for': '6.2.2.2', ...headers }, body: JSON.stringify({ e: { visit: 1 } }) }), ENV, { now, store: memoryStore() });
  assert.equal((await sreport({ 'content-type': 'application/json', origin: 'https://evil.example' })).status, 403);
  assert.equal((await sreport({ 'content-type': 'text/plain' })).status, 415);
  assert.equal((await sreport({ 'content-type': 'application/json', origin: 'https://ullu.vercel.app' })).status, 204);
  // IPv6: a /64 is one address, a /48 is one network
  assert.equal(ipKey('2001:db8:abcd:12:1::5'), '2001:db8:abcd:12::/64'); assert.equal(netKey('2001:db8:abcd:12:1::5'), '2001:db8:abcd::/48');
  assert.equal(netKey('2001:db8:abcd:ff00::9'), netKey('2001:db8:abcd:12::1')); assert.equal(netKey('5.6.7.8'), '5.6.7.8');
  // a flood of new houses from many /64 blocks of one /48 stops at 200 a day (40 a minute, so the street limit never hits)
  {
    resetLimits(); const fl = memoryStore(); let ok = 0, last = null;
    for (let i = 0; i < 205; i++) {
      if (i % 40 === 0) clock += 61000;
      const r = await handle(new Request('https://ullu.vercel.app/api/street', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `2001:db8:77:${(i + 1).toString(16)}::1` }, body: JSON.stringify(body(1000 + i)) }), ENV, { now, store: fl });
      last = { status: r.status, out: await r.json() }; if (last.out.ok) ok += 1;
    }
    assert.equal(ok, 200, 'two hundred from one network'); assert.equal(last.status, 429); assert.equal(last.out.error, 'busy');
    // another network is not held back by it
    const other = await handle(new Request('https://ullu.vercel.app/api/street', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '2001:db8:78:1::1' }, body: JSON.stringify(body(1300)) }), ENV, { now, store: fl });
    assert.equal(other.status, 200);
  }
  // under a flood the browser check gets harder: +2 bits after 20 new houses in a minute, +4 after 40
  {
    resetLimits(); clock += 120000; const fl = memoryStore(); const B = { ...ENV, STREET_PROOF_BITS: '6' };
    const bitsNow = async (ip = '6.9.9.9') => (await (await handle(new Request('https://ullu.vercel.app/api/street?challenge=1', { headers: { 'x-forwarded-for': ip } }), B, { now, store: fl })).json()).bits;
    assert.equal(await bitsNow(), 6);
    const P2 = await import(new URL('../src/lib/street-proof.js', import.meta.url));
    const add = async (i) => { const b = body(2000 + i); const c = await (await handle(new Request('https://ullu.vercel.app/api/street?challenge=1', { headers: { 'x-forwarded-for': `6.8.${i}.1` } }), B, { now, store: fl })).json();
      const r = await handle(new Request('https://ullu.vercel.app/api/street', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': `6.8.${i}.1` }, body: JSON.stringify({ ...b, proof: { challenge: c.challenge, nonce: await P2.solveProof(c.challenge, b.id, c.bits) } }) }), B, { now, store: fl });
      assert.equal(r.status, 200, `house ${i}`); };
    for (let i = 0; i < 20; i++) await add(i);
    assert.equal(await bitsNow(), 8, 'twenty new houses this minute: two bits more');
    for (let i = 20; i < 40; i++) await add(i);
    assert.equal(await bitsNow(), 10, 'forty: four bits more');
    clock += 125000; assert.equal(await bitsNow(), 6, 'quiet again two minutes later');
    // an easier answer than asked is still good: a phone that got its challenge just before the flood is not turned away
    // one address cannot collect challenges without end
    resetLimits(); let last = 0; for (let i = 0; i < 61; i++) last = (await handle(new Request('https://ullu.vercel.app/api/street?challenge=1', { headers: { 'x-forwarded-for': '6.7.7.7' } }), B, { now, store: fl })).status;
    assert.equal(last, 429, 'sixty challenges an hour from one address');
  }
  // a copy of a house that went dark does not push the owner off: it comes in as a new house, and the owner can still
  // light the original again
  {
    resetLimits(); const cp = memoryStore();
    const owner = { ...body(3000), code: K.encodeHouse(424242, {}, 'haveli') };
    const r1 = await call('POST', owner, { store: cp }, ENV, '6.3.3.3'); assert.ok(r1.out.ok); const ownSn = r1.out.house.sn;
    // while it is lit, a copy is turned away
    const copy = { ...owner, id: 'copycatcopycat000001', name: 'Copy' };
    assert.equal((await call('POST', copy, { store: cp }, ENV, '6.4.4.4')).status, 409);
    clock += 49 * 3600000;   // the owner's house goes dark
    const r2 = await call('POST', copy, { store: cp }, ENV, '6.4.4.4'); assert.ok(r2.out.ok, JSON.stringify(r2.out)); assert.notEqual(r2.out.house.sn, ownSn, 'the copy is a new house');
    const j = JSON.parse(cp.state.text); assert.ok(j.houses.some((h) => h.sn === ownSn), 'the owner is still on the street');
    const r3 = await call('POST', { ...owner, nights: 4, gifts: 4, best: 4, streak: 1 }, { store: cp }, ENV, '6.3.3.3');
    assert.ok(r3.out.ok, JSON.stringify(r3.out)); assert.equal(r3.out.house.sn, ownSn, 'the owner lights it again and keeps the number');
  }
  // the admin: requests without a password do not lock the moderator out, and a token cannot make itself a new one
  {
    resetAdminLimits(); const as = memoryStore();
    const AENV = { ...ENV, ADMIN_PASSWORD: 'a-long-moderator-password-123' };
    const areq = (pass, body, ip = '6.5.5.5') => admin(new Request('https://ullu.vercel.app/api/admin', { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', authorization: `Bearer ${pass}`, 'x-forwarded-for': ip }, body: body ? JSON.stringify(body) : undefined }), AENV, { now, store: as });
    for (let i = 0; i < 12; i++) assert.equal((await areq('')).status, 401);
    const login = await areq(AENV.ADMIN_PASSWORD, { action: 'login' }); assert.equal(login.status, 200, 'empty requests did not lock the password out');
    const token = (await login.json()).token;
    assert.equal((await areq(token)).status, 200, 'the token works');
    assert.equal((await areq(token, { action: 'login' })).status, 401, 'a token does not renew itself');
    resetAdminLimits();
  }
  // the street file on disk: an empty file is damaged, not "no street", and a write goes through a synced temporary file
  {
    const fs = await import('node:fs/promises'); const os = await import('node:os'); const path = await import('node:path');
    const d = await fs.mkdtemp(path.join(os.tmpdir(), 'ullu-review-'));
    const FE = { PROJECT: 'ullu', DATA_DIR: d };
    assert.equal(await fileStore.read(FE, 'ullu/street.json'), null, 'no file: no street yet');
    await fileStore.write(FE, 'ullu/street.json', '{"houses":[]}');
    assert.equal(await fileStore.read(FE, 'ullu/street.json'), '{"houses":[]}');
    await fs.writeFile(path.join(d, 'ullu/street.json'), '');
    await assert.rejects(() => fileStore.read(FE, 'ullu/street.json'), (e) => e.code === 'damaged');
    const fe = await call('POST', body(4000), {}, { ...ENV, BLOB_READ_WRITE_TOKEN: undefined, STORE: 'file', DATA_DIR: d }, '6.6.6.6');
    assert.equal(fe.status, 503, 'a post does not start the street again over a damaged file');
    assert.equal(await fs.readFile(path.join(d, 'ullu/street.json'), 'utf8'), '', 'the damaged file is left for the owner');
    assert.deepEqual((await fs.readdir(path.join(d, 'ullu'))).filter((f) => f.endsWith('.tmp')), [], 'no temporary files left');
    await fs.rm(d, { recursive: true, force: true });
  }
  resetLimits();
  console.log('15 ok: other sites and plain-text posts, a flood from one network, harder checks under a flood, copies of a dark house, admin sign-in, safe file writes');
}
console.log('street: all ok');
