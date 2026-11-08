// Checks the street of houses (api/street.js) and the rules of the nights (src/lib/lights-kit.js) without any keys:
// storage lives in memory. Run inside templates/landing:  node tests/street.test.mjs
import assert from 'node:assert/strict';
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
const ENV = { PROJECT: 'ullu', BLOB_READ_WRITE_TOKEN: 'b', STREET_SALT: 'salt', STREET_BLOCK: 'rug' };
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
for (let i = 0; i < 6; i++) assert.ok((await call('POST', { ...good, id: `limit${i}aaaaaaaaaaaaa`, code: K.encodeHouse(1000 + i, {}) }, { store }, ENV, '5.5.5.5')).out.ok);
res = await call('POST', { ...good, id: 'limit9aaaaaaaaaaaaa', code: K.encodeHouse(2000, {}) }, { store }, ENV, '5.5.5.5');
assert.equal(res.status, 429); assert.equal(res.out.error, 'busy');
store.state.fail = true;
res = await call('GET', null, { store }); assert.equal(res.status, 200); assert.equal(res.out.error, 'storage');
res = await call('POST', { ...good, id: 'other1aaaaaaaaaaaaaa' }, { store }, ENV, '6.6.6.6'); assert.equal(res.status, 503); assert.equal(res.out.error, 'storage');
store.state.fail = false;
res = await call('GET', null, { store }, { PROJECT: 'ullu' }); assert.equal(res.out.live, false); assert.deepEqual(res.out.houses, []);
res = await call('POST', good, { store }, { PROJECT: 'ullu' }); assert.equal(res.status, 503); assert.equal(res.out.error, 'off');
// an IPv6 visitor counts by the /64 block, not by each address in it
resetLimits();
{
  const v6 = await Promise.all(Array.from({ length: 7 }, (_, i) => call('POST', { ...good, id: `vsixvsixvsixvsix${i}00`, name: `Six ${i}`, code: K.encodeHouse(7000 + i, {}) }, { store }, ENV, `2001:db8:aa:bb::${i + 1}`)));
  assert.deepEqual(v6.map((x) => x.status), [200, 200, 200, 200, 200, 200, 429]);
}
// Blob in public mode reads through a CDN that may give the old file: posts one after another are not lost
resetLimits();
{
  const cdn = memoryStore(); let stale = null;
  cdn.read = async () => stale;                       // always the file as it was before (the CDN copy)
  const w = cdn.write; cdn.write = async (e, p, body) => { await w(e, p, body); };
  for (let i = 0; i < 3; i++) assert.ok((await call('POST', { ...good, id: `cdncdncdncdncdn${i}000`, name: `Cdn ${i}`, code: K.encodeHouse(7100 + i, {}) }, { store: cdn }, ENV, `10.2.${i}.1`)).out.ok);
  assert.equal(JSON.parse(cdn.state.text).houses.length, 3, 'all three posts kept');
  stale = cdn.state.text;
  assert.equal((await call('GET', null, { store: cdn })).out.count, 3);
}
console.log('5 ok: limits, IPv6 blocks, storage down, no store, stale CDN reads');

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
const FENV = { PROJECT: 'ullu', STORE: 'file', DATA_DIR: dir };
resetLimits(); clock = Date.parse('2026-11-05T20:00:00Z');
res = await call('GET', null, {}, FENV); assert.equal(res.out.live, true); assert.deepEqual(res.out.houses, []);
const posts = await Promise.all(Array.from({ length: 5 }, (_, i) => call('POST', { ...good, id: `para${i}aaaaaaaaaaaaaa`, name: `Para ${i}`, code: K.encodeHouse(3000 + i, {}, 'haveli') }, {}, FENV, `7.7.7.${i}`)));
assert.ok(posts.every((x) => x.out.ok), JSON.stringify(posts.map((x) => x.out)));
const onDisk = JSON.parse(await fsp.readFile(pth.join(dir, 'ullu', 'street.json'), 'utf8'));
assert.equal(onDisk.houses.length, 5, 'no post lost when they arrive together');
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
  const l2 = await acall('GET'); assert.deepEqual(l2.out.bans.map((b) => b.sn), [3]); assert.deepEqual(l2.out.log.map((e) => e.action), ['ban', 'remove']);
  assert.equal((await acall('POST', { action: 'unban', sn: 3 })).out.ok, true);
  const freed = await house('adminc', 9103, 'Third free', '6.6.6.3'); assert.ok(freed.out.ok); assert.equal(freed.out.house.sn, 6);
  // bad requests
  assert.equal((await acall('POST', { action: 'nuke', sn: 1 })).status, 400);
  assert.equal((await acall('POST', { action: 'remove', sn: '1' })).status, 400);
  assert.equal((await acall('POST', { action: 'remove', sn: 999 })).status, 404);
  assert.equal((await admin(new Request('https://x/api/admin', { method: 'GET' }), { ...AENV, PROJECT: 'molty' }, { now, store })).status, 404);
  // a house hidden by the word filter is shown to the moderator, marked
  { const j = JSON.parse(store.state.text); j.houses.push({ ...j.houses[0], key: 'rude2'.padEnd(32, '0'), seed: 9300, sn: 77, name: 'Chutiya' }); store.state.text = JSON.stringify(j);
    const g = await acall('GET'); assert.equal(g.out.houses.find((x) => x.sn === 77).hidden, 'words'); }
  console.log('9 ok: street numbers, moderator list, remove, ban and unban, wrong passwords');
}
console.log('street: all ok');
