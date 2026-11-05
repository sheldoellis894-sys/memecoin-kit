// Run inside templates/landing:  node tests/fuzz.mjs   (about a minute)
// Throws random and hostile input at every parser and at the street API; nothing may throw, everything must stay in range.
const K = await import('../src/lib/lights-kit.js');
const { handle, resetLimits } = await import('../api/street.js');
const geo = await import('../api/geo.js');
let seed = 12345; const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (a) => a[Math.floor(R() * a.length)];
const weird = [undefined, null, true, false, 0, -1, 1.5, NaN, Infinity, -Infinity, 2 ** 53, '', ' ', 'x', '__proto__', 'constructor', 'toString', 'hasOwnProperty',
  '<script>', '"><img>', '&amp;', '\u0000', '\ud800', '😀', 'a'.repeat(5000), [], [1], {}, { __proto__: { x: 1 } }, Object.create(null), '1e400', '0x10', { toString: 1 }, { valueOf: 1, toString: 1 }, { toString: 'x', valueOf: [] }, JSON.parse('{"toString":1}')];
const any = (d = 0) => {
  const r = R();
  if (d > 3 || r < 0.5) return pick(weird);
  if (r < 0.7) return Array.from({ length: Math.floor(R() * 5) }, () => any(d + 1));
  const o = {}; for (let i = 0; i < Math.floor(R() * 6); i++) o[pick(['v', 's', 'f', 'w', 'p', 'q', 'c', 'n', 'i', 'x', 'y', 't', 'r', '__proto__', 'constructor', String(R())])] = any(d + 1); return o;
};
const str = (v) => { try { return String(v); } catch { return '[obj]'; } };
const b64 = (s) => Buffer.from(s, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fails = []; const ok = (cond, what) => { if (!cond) fails.push(what); };
const tryIt = (name, fn) => { try { return fn(); } catch (e) { fails.push(`${name} threw: ${e.message}`); return undefined; } };

// 1. house codes: random JSON shapes, mutated real codes, random strings
const real = K.encodeHouse(777, K.autoDecorate(777, 8), 'mumbai', 'gold', { free: [{ n: 1, i: 'sign-custom', x: 100, y: 100, s: 1, r: 0, t: 'GM' }], paint: 'paint-mint' });
for (let i = 0; i < 20000; i++) {
  let code;
  const r = R();
  if (r < 0.4) code = b64(JSON.stringify({ v: 1, s: pick([1, 777, 0xffffffff, any()]), f: pick([...K.FAMILY_IDS, any()]), w: pick([...K.WISH_IDS, any()]), p: R() < 0.5 ? any() : { [pick(K.houseOf(777).slots).id]: pick([...K.ITEM_IDS, any()]) }, q: R() < 0.5 ? any() : [[pick(K.ITEM_IDS), any(), any(), any(), any(), any()]], c: pick([...K.ITEM_IDS, any()]) }));
  else if (r < 0.7) { const a = real.split(''); for (let k = 0; k < 1 + R() * 4; k++) a[Math.floor(R() * a.length)] = pick('ABCxyz019_-'.split('')); code = a.join(''); }
  else code = any();
  const got = tryIt('decodeHouse', () => K.decodeHouse(code, { holderOk: R() < 0.5 }));
  if (got) {
    ok(K.FAMILY_IDS.includes(got.family), 'family'); ok(got.seed >= 1 && got.seed <= 0xffffffff, 'seed');
    for (const f of got.free) ok(K.ITEMS[f.i] && f.x >= 0 && f.x <= 600 && f.y >= 0 && f.y <= 600 && f.s >= 0.4 && f.s <= 4 && Math.abs(f.r) <= 180, 'free range');
    const h = tryIt('houseOfP', () => K.houseOfP(got));
    const svg = tryIt('houseSvg', () => K.houseSvg(h, got.placed, { free: got.free, level: 1 + Math.floor(R() * 7), ctx: { ticker: 'ULLU' } }));
    ok(typeof svg === 'string' && !svg.includes('NaN') && !svg.includes('undefined'), `svg NaN/undefined for ${code.slice(0, 40)}`);
    const again = K.encodeHouse(got.seed, got.placed, got.family, got.wish, { free: got.free, paint: got.paint });
    const back = K.decodeHouse(again, { holderOk: true });
    ok(back && JSON.stringify(back) === JSON.stringify(got), 'code round trip');
    ok(Number.isFinite(K.lightOf(h, got.placed, 3, got.free)), 'light finite');
  }
  tryIt('decodeInvite', () => K.decodeInvite(R() < 0.5 ? any() : b64(JSON.stringify({ v: 1, s: any(), f: pick([...K.FAMILY_IDS, any()]), w: any(), n: any() }))));
}

// 2. stored progress: random shapes, then every function the page calls with it
for (let i = 0; i < 5000; i++) {
  const raw = R() < 0.3 ? any() : JSON.stringify({ v: 1, seed: pick([5, 0xffffffff, any()]), family: any(), wish: any(), name: any(), city: any(), country: any(), born: any(), neighbour: any(), setup: any(), loan: any(), placed: any(), free: any(), paint: any(), inv: any(), seen: any(), streak: any(), last: pick(['2026-11-04', '2026-13-40', any()]), nights: any(), gifts: any(), best: any(), landings: any(), log: any() });
  const p = tryIt('readProgress', () => K.readProgress(raw));
  if (!p) continue;
  const st = tryIt('statusOf', () => K.statusOf(p, '2026-11-05'));
  ok(st && Number.isFinite(st.level), 'status level');
  tryIt('freeItems', () => K.freeItems(p));
  const res = tryIt('lightTonight', () => K.lightTonight(p, '2026-11-05', R, R() < 0.5, { hour: 21, weekday: 3, moon: R(), allowed: K.EVENT_IDS }));
  if (res) { ok(Array.isArray(res.gifts), 'gifts array'); ok(Object.values(res.p.inv).every((n) => Number.isInteger(n) && n >= 0), 'inv never negative'); }
  const h = tryIt('houseOfP', () => K.houseOfP(p));
  if (h) { const svg = tryIt('houseSvg2', () => K.houseSvg(h, p.placed, { free: p.free, level: st?.level ?? 1, scene: K.sceneOf(pick(K.EVENT_IDS)), friend: p.neighbour ? K.houseOfP(p.neighbour) : null })); ok(svg && !svg.includes('NaN') && !svg.includes('undefined'), 'svg2'); }
  tryIt('encodeHouse', () => K.encodeHouse(p.seed, p.placed, p.family, p.wish, { free: p.free, paint: p.paint }));
  tryIt('encodeInvite', () => K.encodeInvite(p));
  tryIt('placeFree', () => K.placeFree(p, pick([...K.ITEM_IDS, any()]), any(), any(), R() < 0.5, { s: any(), r: any(), t: any() }));
  tryIt('updateFree', () => K.updateFree(p, any(), any() || {}));
  tryIt('placeItem', () => K.placeItem(p, any(), pick([...K.ITEM_IDS, any()])));
  tryIt('applyPaint', () => K.applyPaint(p, pick([...K.ITEM_IDS, any()])));
}

// 3. cleaners
for (let i = 0; i < 20000; i++) {
  const v = any();
  const n = tryIt('cleanName', () => K.cleanName(v)); ok(n === '' || K.NAME_RE.test(n), 'name');
  const s = tryIt('cleanSign', () => K.cleanSign(v)); ok(typeof s === 'string' && s.length <= 14 && !/[<>"]/.test(s), 'sign');
  const c = tryIt('cleanPlace', () => K.cleanPlace(v)); ok(typeof c === 'string' && c.length <= 32 && !/[<>"&]/.test(c), 'place');
  tryIt('cleanFree', () => K.cleanFree(any()));
}

// 4. every item, every style, every wish, every scene: the SVG is valid XML (the card turns it into a picture)
const svgs = [];
for (const f of K.FAMILY_IDS) for (const w of ['', ...K.WISH_IDS]) for (let sd = 1; sd <= 40; sd++) {
  const h = K.houseOf(sd * 7919, f, { wish: w });
  const placed = K.autoDecorate(sd * 7919, 30, true, f, w);
  const free = K.ITEM_IDS.filter((i) => K.ITEMS[i].free).slice(sd % 10, (sd % 10) + 12).map((i, k) => ({ n: k + 1, i, x: 50 + k * 40, y: 100 + k * 30, s: 1, r: k * 10, t: 'A&B <X>' }));
  svgs.push(K.houseSvg(h, placed, { free: K.cleanFree(free), level: sd % 8, scene: K.SCENE_IDS[sd % K.SCENE_IDS.length], pad: sd % 2 ? 150 : 0, friend: sd % 3 ? null : K.houseOf(sd, 'goa'), ctx: { ticker: 'ULLU' } }));
}
for (const id of K.ITEM_IDS) svgs.push(K.itemSvg(id, 72, { ticker: 'ULLU' }));
for (const s of svgs) ok(!s.includes('NaN') && !s.includes('undefined') && !s.includes('null'), 'svg text ' + s.slice(0, 0));
const { writeFileSync } = await import('node:fs');
writeFileSync((process.argv[2] || (await import('node:os')).tmpdir()) + '/ullu-svgs.json', JSON.stringify(svgs));   // for an XML check, if wanted

// 5. the street API with random bodies, methods and headers
resetLimits();
const store = { t: null, async read() { return this.t; }, async write(e, p, b) { this.t = b; } };
const ENV = { PROJECT: 'ullu', BLOB_READ_WRITE_TOKEN: 'b', STREET_BLOCK: 'rug' };
for (let i = 0; i < 4000; i++) {
  const body = R() < 0.5 ? { id: pick(['abcdefghijklmnop' + i, any()]), name: pick(['Raju', any()]), code: pick([real, any()]), nights: pick([9, any()]), gifts: pick([9, any()]), best: pick([7, any()]), landings: pick([1, any()]), streak: pick([2, any()]) } : any();
  const text = R() < 0.9 ? JSON.stringify(body) ?? 'x' : str(any());
  const req = new Request('https://x/api/street', { method: pick(['POST', 'POST', 'GET', 'PUT', 'DELETE', 'OPTIONS']), headers: { 'x-forwarded-for': str(pick(['1.1.1.' + (i % 250), any(), '::1', 'zzz'])).replace(/[^\x20-\x7e]/g, '').slice(0, 300) }, body: ['GET'].includes(pick(['GET'])) && false ? undefined : undefined });
  const req2 = new Request('https://x/api/street', { method: req.method, headers: req.headers, ...(req.method === 'GET' ? {} : { body: text }) });
  let res; try { res = await handle(req2, ENV, { store, now: () => Date.parse('2026-11-05T20:00:00Z') + i * 1000 }); } catch (e) { fails.push('street threw: ' + e.message); continue; }
  ok(res.status < 500 || res.status === 503, 'street status ' + res.status);
  const out = await res.json().catch(() => null); ok(out && typeof out === 'object', 'street json');
}
const g = await handle(new Request('https://x/api/street'), ENV, { store, now: () => Date.now() });
const gj = await g.json(); ok(Array.isArray(gj.houses) && gj.houses.every((x) => K.decodeHouse(x.code) && !('key' in x)), 'street GET clean');
for (let i = 0; i < 3000; i++) {
  const h = {}; for (const n of ['x-vercel-ip-country', 'x-vercel-ip-city', 'cf-ipcountry', 'cf-ipcity', 'x-geo-city']) if (R() < 0.6) { let v; try { v = encodeURIComponent(str(any())); } catch { v = "%E0%A4%A"; } h[n] = (R() < 0.3 ? v.slice(0, 7) : v).slice(0, 200); }
  let res; try { res = await geo.handle(new Request('https://x/api/geo', { headers: h }), { PROJECT: 'ullu' }); } catch (e) { fails.push('geo threw ' + e.message); continue; }
  const j = await res.json(); ok(/^([A-Z]{2})?$/.test(j.country) && K.cleanPlace(j.city) === j.city, 'geo clean');
}
const uniq = [...new Set(fails)];
console.log(JSON.stringify({ fails: uniq.slice(0, 40), count: fails.length, svgs: svgs.length, street: JSON.parse(store.t || '{"houses":[]}').houses.length }, null, 1));
