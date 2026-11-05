// Drawing kit and rules of the "lights" layout (projects/ullu): the owl brings fortune to the brightest house.
// Plain JavaScript without Node: the page scripts, the server function api/street.js and the tests all import this file.
//
// What is in here:
//   - a unique Indian house built from a seed (shape, colours, windows, roof) and the slots where decorations go;
//   - the decorations, drawn as SVG by code (no pictures needed);
//   - the rules of the nights: light up once a day, the owl leaves a gift, a missed night drops the house to level 1,
//     seven nights in a row and the owl lands on the roof;
//   - the house code: a short string that holds a whole house (used by the street and to move a house to another device).

import { VIEW, rng, f1, houseOf, houseParts, windowGlass, FAMILIES, FAMILY_IDS, familyFor, WISHES, WISH_IDS, moonPhase, moonSvg } from './lights-houses.js';
import { pickEvent, holidayOf, EVENTS, EVENT_IDS, SCENE_IDS } from './lights-nights.js';
import { streetScene } from './lights-scenes.js';
export { pickEvent, holidayOf, EVENTS, EVENT_IDS, SCENE_IDS };
export { VIEW, rng, houseOf, FAMILIES, FAMILY_IDS, familyFor, WISHES, WISH_IDS, moonPhase };
export const NIGHTS = 7;           // nights in a row before the owl lands

export const newSeed = () => (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;

// ---------------------------------------------------------------- decorations (lights-items.js)
import { ITEMS, ITEM_IDS, itemOf, START_ITEMS, RARITIES, RARITY_IDS, CATEGORIES, drawItem, drawFree, itemSvg, cleanSign, isLine, GLOW_DEF, sag } from './lights-items.js';
export { ITEMS, ITEM_IDS, itemOf, START_ITEMS, RARITIES, RARITY_IDS, CATEGORIES, drawItem, drawFree, itemSvg, cleanSign, isLine };
export const FREE_MAX = 80;          // decorations put anywhere on one house
const glow = (x, y, r, g) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#ul-glow)" opacity="${(0.55 + 0.45 * g).toFixed(2)}"/>`;
export const svgUrl = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

// ---------------------------------------------------------------- the house (built in lights-houses.js)
/** Brightness 0…100 of a house: what is placed on it (in slots and anywhere), plus the level of the nights. */
export function lightOf(h, placed, level, free = []) {
  let sum = 0;
  for (const [slot, item] of Object.entries(placed || {})) if (itemOf(item) && h.slots.some((s) => s.id === slot)) sum += itemOf(item).light;
  for (const f of free || []) if (itemOf(f.i)) sum += itemOf(f.i).light * Math.min(2, f.s || 1);
  const lit = Math.max(0, Math.min(level, NIGHTS)) / NIGHTS;
  return Math.max(0, Math.min(100, Math.round(Math.min(1, sum / 120) * 70 + lit * 30)));
}

/**
 * SVG of a whole house at night.
 * opts.level    — 0…7: nights in a row; more nights = more lit windows, a stronger glow, a livelier street.
 * opts.owl      — { href, x, y, size, flip } or null: a picture of the owl in the sky or on the roof.
 * opts.slotsFor — an item id: the empty slots that may take it are outlined.
 * opts.id       — a unique id prefix when several houses share one page.
 * opts.size     — width and height attribute.
 * opts.pad      — extra sky around the house (in drawing units, mostly above it): room for a caption on a card.
 * opts.friend   — a friend's house (houseOf) next door, from an invite link.
 * opts.moonPhase — 0…1; by default the real phase of today.
 * opts.scene    — tonight's event picture (see lights-scenes.js); the seven-night story is drawn from the level.
 * opts.free     — decorations put anywhere: [{ i, x, y, s, r, t }]. opts.ctx — { ticker } for the signs.
 */
export function houseSvg(h, placed = {}, opts = {}) {
  const level = Math.max(0, Math.min(NIGHTS, opts.level ?? 1));
  const g = 0.25 + 0.75 * (level / NIGHTS);
  const id = opts.id || 'ul';
  const fix = (str) => (id === 'ul' ? str : str.replaceAll('url(#ul-glow)', `url(#${id}-glow)`));
  const litCount = level === 0 ? 0 : Math.max(1, Math.round((h.windows.length * level) / NIGHTS));
  const lit = new Set(h.lightOrder.slice(0, litCount));
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
  const pad = Math.max(0, opts.pad || 0);
  const box = pad ? `${-pad / 2} ${-pad} ${VIEW + pad} ${VIEW + pad}` : `0 0 ${VIEW} ${VIEW}`;
  const B = -400, BW = VIEW + 800;   // full-bleed rectangles, so a padded view has no empty edges
  // the night: a dark veil over the street; the front parts (balconies, roofs) get the same veil through a filter,
  // so lit windows can sit between the walls and the balconies
  const night = 0.52 - 0.32 * (level / NIGHTS);
  // the colours of the night: ctx.sky = [top, middle, bottom] and ctx.veil (the dark over the street) from the theme; the default is the "diya" navy
  const ctx = opts.ctx || {};
  const hex6 = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
  const sky = Array.isArray(ctx.sky) && ctx.sky.length === 3 && ctx.sky.every(hex6) ? ctx.sky : ['#0B1030', '#1A2257', '#2C2A6B'];
  const veil = hex6(ctx.veil) ? ctx.veil : '#0A0F33';
  const vr = parseInt(veil.slice(1, 3), 16), vg = parseInt(veil.slice(3, 5), 16), vb = parseInt(veil.slice(5, 7), 16);
  const ch = (v) => ((v / 255) * night).toFixed(3);
  const scene = streetScene(h, level, opts.scene || '');
  const parts = houseParts(h, level, opts.friend || null, opts.scene === 'powercut');
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"${size} role="img">`;
  s += `<defs>${GLOW_DEF(id)}<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".7" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>`;
  s += `<radialGradient id="${id}-halo" gradientUnits="userSpaceOnUse" cx="${VIEW / 2}" cy="${Math.round(VIEW * 0.62)}" r="${Math.round(VIEW * 0.6)}"><stop offset="0" stop-color="#FFB52E" stop-opacity="${(0.06 + 0.34 * g).toFixed(2)}"/><stop offset="1" stop-color="#FFB52E" stop-opacity="0"/></radialGradient>`;
  s += `<filter id="${id}-night" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="${(1 - night).toFixed(3)}" intercept="${ch(vr)}"/><feFuncG type="linear" slope="${(1 - night).toFixed(3)}" intercept="${ch(vg)}"/><feFuncB type="linear" slope="${(1 - night).toFixed(3)}" intercept="${ch(vb)}"/></feComponentTransfer></filter></defs>`;
  s += `<rect x="${B}" y="${B}" width="${BW}" height="${BW}" fill="${sky[0]}"/><rect x="${B}" y="0" width="${BW}" height="${VIEW}" fill="url(#${id}-sky)"/>`;
  s += h.stars.map(([sx, sy, sr]) => `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#fff" opacity=".8"/>`).join('');
  s += moonSvg(h.moon[0], h.moon[1], 22, opts.moonPhase ?? moonPhase());
  s += `<rect x="${B}" y="${B}" width="${BW}" height="${BW}" fill="url(#${id}-halo)"/>`;
  s += scene.sky + parts.back + parts.body;
  s += `<rect x="${B}" y="${B}" width="${BW}" height="${BW}" fill="${veil}" opacity="${night.toFixed(2)}"/>`;
  for (const wd of h.windows) if (lit.has(wd.id)) s += fix(glow(wd.x, wd.y + wd.h / 2, f1(Math.max(wd.w, 40) * 0.95), g)) + windowGlass(h, wd, '#FFD36B', true);
  s += `<g filter="url(#${id}-night)">${parts.front}${scene.front}</g>`;
  for (const sl of h.slots) { const it = placed[sl.id]; if (it && itemOf(it)) s += fix(drawItem(it, sl, g, ctx)); }
  for (const f of opts.free || []) s += fix(drawFree(f, g, ctx));
  s += scene.light;
  if (opts.slotsFor && itemOf(opts.slotsFor)) {
    const kinds = itemOf(opts.slotsFor).kinds;
    for (const sl of h.slots) if (kinds.includes(sl.kind) && !placed[sl.id]) {
      if (sl.kind === 'line' || sl.kind === 'door') s += `<path d="${sag(sl.x1, sl.x2, sl.y, 14)}" stroke="#FFF" stroke-width="3" stroke-dasharray="8 7" fill="none" opacity=".9"/>`;
      else if (sl.kind === 'win') s += `<rect x="${sl.x - sl.w / 2 - 3}" y="${sl.y - 3}" width="${sl.w + 6}" height="${sl.h + 6}" rx="6" fill="none" stroke="#FFF" stroke-width="3" stroke-dasharray="6 5" opacity=".9"/>`;
      else s += `<circle cx="${sl.x}" cy="${sl.y - 12}" r="16" fill="none" stroke="#FFF" stroke-width="3" stroke-dasharray="6 5" opacity=".9"/>`;
    }
  }
  s += scene.over.replaceAll('ulfog', `${id}-fog`);
  if (opts.owl && opts.owl.href) {
    const o = opts.owl;
    const flip = o.flip ? ` transform="translate(${2 * o.x} 0) scale(-1 1)"` : '';
    s += `<image href="${o.href}" x="${o.x - o.size / 2}" y="${o.y - o.size}" width="${o.size}" height="${o.size}" preserveAspectRatio="xMidYMax meet"${flip}/>`;
  }
  return s + '</svg>';
}

/** Where the owl is after "streak" nights: far and small at first, near the roof on night 6, on the roof once landed. */
export function owlPlace(h, streak, landed) {
  if (landed) return { x: h.perch.x, y: h.perch.y + 14, size: 190, pose: 'landed', flip: false };
  const t = Math.max(0, Math.min(1, (Math.max(1, streak) - 1) / (NIGHTS - 2)));
  const fromRight = h.moon[0] < VIEW / 2;
  const start = { x: fromRight ? 520 : 80, y: 150, size: 72 };
  const end = { x: h.cx + (fromRight ? 150 : -150), y: h.perch.y - 46, size: 150 };
  return { x: Math.round(start.x + (end.x - start.x) * t), y: Math.round(start.y + (end.y - start.y) * t), size: Math.round(start.size + (end.size - start.size) * t), pose: 'fly', flip: fromRight };
}

/** A placeholder owl drawn by code, used while the project has no owl pictures. Returns a data: URL. */
export function owlPlaceholder(pose = 'fly') {
  const eyes = pose === 'landed'
    ? '<rect x="62" y="78" width="34" height="20" rx="8" fill="#141026"/><rect x="104" y="78" width="34" height="20" rx="8" fill="#141026"/><path d="M96 86h8" stroke="#141026" stroke-width="5"/>'
    : '<circle cx="80" cy="88" r="11" fill="#141026"/><circle cx="120" cy="88" r="11" fill="#141026"/><circle cx="84" cy="84" r="3.5" fill="#fff"/><circle cx="124" cy="84" r="3.5" fill="#fff"/>';
  const wings = pose === 'landed'
    ? '<ellipse cx="46" cy="140" rx="18" ry="40" fill="#F1E4C8" stroke="#141026" stroke-width="5"/><ellipse cx="154" cy="140" rx="18" ry="40" fill="#F1E4C8" stroke="#141026" stroke-width="5"/>'
    : '<path d="M52 122C14 104 2 66 8 44c24 18 44 40 52 70z" fill="#F1E4C8" stroke="#141026" stroke-width="5"/><path d="M148 122c38-18 50-56 44-78c-24 18-44 40-52 70z" fill="#F1E4C8" stroke="#141026" stroke-width="5"/>';
  const sack = pose === 'landed'
    ? '<path d="M152 192c-30 0-34-30-20-46l-6-12h40l-6 12c14 16 10 46-8 46z" fill="#C9A26B" stroke="#141026" stroke-width="5"/><circle cx="142" cy="132" r="6" fill="#FFC94A" stroke="#141026" stroke-width="3"/><path d="M154 126l6 8-6 8-6-8z" fill="#BFF4FF" stroke="#141026" stroke-width="3"/>'
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${wings}<ellipse cx="100" cy="132" rx="54" ry="60" fill="#FFFFFF" stroke="#141026" stroke-width="5"/><path d="M100 52c30 0 52 22 52 46c0 20-22 34-52 50c-30-16-52-30-52-50c0-24 22-46 52-46z" fill="#FFF8EC" stroke="#141026" stroke-width="5"/><path d="M50 60c10-30 90-30 100 0c-14 10-86 10-100 0z" fill="#FF9F1C" stroke="#141026" stroke-width="5"/><circle cx="100" cy="52" r="7" fill="#E0218A" stroke="#141026" stroke-width="3"/><path d="M106 46c10-18 14-28 10-38" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/>${eyes}<path d="M93 106l7 14 7-14z" fill="#FF9F1C" stroke="#141026" stroke-width="4" stroke-linejoin="round"/><circle cx="68" cy="114" r="4" fill="#141026"/>${sack}<path d="M84 190v8M116 190v8" stroke="#FF9F1C" stroke-width="7" stroke-linecap="round"/></svg>`;
  return svgUrl(svg);
}

// ---------------------------------------------------------------- the house code
const b64 = (str) => (typeof btoa === 'function' ? btoa(str) : Buffer.from(str, 'binary').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (str) => { const s = str.replace(/-/g, '+').replace(/_/g, '/'); return typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('binary'); };

/** Decorations put anywhere, checked: known items that may go anywhere, inside the picture, at most FREE_MAX. */
export function cleanFree(list, holderOk = true) {
  if (!Array.isArray(list)) return [];
  const out = [], used = new Set();
  for (const f of list.slice(0, FREE_MAX)) {
    const it = f && itemOf(f.i);
    if (!it || !it.free || (it.holder && !holderOk)) continue;
    // numbers only (a number, or text with a number): an object with its own valueOf must not be turned into one
    const num = (v, lo, hi, d) => { const x = typeof v === 'number' || typeof v === 'string' ? +v : NaN; return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d; };
    // n: the number of this decoration, unique in the house (the editor finds it by n)
    let n = Number.isInteger(f.n) && f.n > 0 && !used.has(f.n) ? f.n : 0;
    if (!n) { n = 1; while (used.has(n)) n += 1; }
    used.add(n);
    const e = { n, i: f.i, x: Math.round(num(f.x, 0, 600, 300)), y: Math.round(num(f.y, 0, 600, 300)), s: Math.round(num(f.s, 0.4, 2.5, 1) * 100) / 100, r: Math.round(num(f.r, -180, 180, 0)) };
    if (it.custom) e.t = cleanSign(f.t) || 'HOOT';
    out.push(e);
  }
  return out;
}

/** A short string that holds a whole house: seed, style, wish, what is in the slots, what is put anywhere and the wall paint. */
export function encodeHouse(seed, placed, family = 'mumbai', wish = '', more = {}) {
  const q = (more.free || []).map((f) => [f.i, f.x, f.y, Math.round((f.s || 1) * 100), f.r || 0, ...(f.t ? [f.t] : [])]);
  return b64(JSON.stringify({ v: 1, s: seed >>> 0, f: family, ...(wish ? { w: wish } : {}), p: placed || {}, ...(q.length ? { q } : {}), ...(more.paint ? { c: more.paint } : {}) }));
}

/** Reads a house code back. Returns { seed, family, wish, placed, free, paint } or null when anything in it is wrong. */
export function decodeHouse(code, { holderOk = true } = {}) {
  if (typeof code !== 'string' || code.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  let j; try { j = JSON.parse(unb64(code)); } catch { return null; }
  if (!j || j.v !== 1 || !Number.isInteger(j.s) || j.s <= 0 || j.s > 0xffffffff || typeof j.p !== 'object' || j.p === null || Array.isArray(j.p)) return null;
  const family = j.f === undefined ? 'mumbai' : j.f;
  if (!FAMILY_IDS.includes(family)) return null;
  const wish = j.w === undefined ? '' : j.w;
  if (wish && !WISH_IDS.includes(wish)) return null;
  const paint = j.c === undefined ? '' : j.c;
  if (paint && (!itemOf(paint) || itemOf(paint).type !== 'paint' || (itemOf(paint).holder && !holderOk))) return null;
  const h = houseOf(j.s, family, { wish }), placed = {};
  for (const [slot, item] of Object.entries(j.p)) {
    const sl = h.slots.find((x) => x.id === slot), it = itemOf(item);
    if (!sl || !it || !it.kinds.includes(sl.kind) || (it.holder && !holderOk)) return null;
    placed[slot] = item;
  }
  let free = [];
  if (j.q !== undefined) {
    if (!Array.isArray(j.q) || j.q.length > FREE_MAX) return null;
    const raw = j.q.map((a, k) => (Array.isArray(a) ? { n: k + 1, i: a[0], x: a[1], y: a[2], s: (typeof a[3] === 'number' && a[3] ? a[3] : 100) / 100, r: a[4] || 0, t: a[5] } : null));
    free = cleanFree(raw, holderOk);
    if (free.length !== raw.length) return null;
  }
  return { seed: j.s, family, wish, placed, free, paint };
}

/** The house of a progress (or of a decoded code): style, wish and wall paint. */
export const houseOfP = (q) => houseOf(q.seed, q.family, { wish: q.wish, paint: q.paint ? itemOf(q.paint)?.color : '' });

/** The invite link part: the friend's house (seed, style, wish) and the name on its door. */
export function encodeInvite(p) { return b64(JSON.stringify({ v: 1, s: p.seed >>> 0, f: p.family, ...(p.wish ? { w: p.wish } : {}), ...(p.name ? { n: p.name } : {}) })); }
/** Reads an invite back: { seed, family, wish, name } or null. */
export function decodeInvite(code) {
  if (typeof code !== 'string' || code.length > 200 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  let j; try { j = JSON.parse(unb64(code)); } catch { return null; }
  if (!j || j.v !== 1 || !Number.isInteger(j.s) || j.s <= 0 || j.s > 0xffffffff || !FAMILY_IDS.includes(j.f)) return null;
  if (j.w !== undefined && !WISH_IDS.includes(j.w)) return null;
  return { seed: j.s, family: j.f, wish: j.w || '', name: j.n ? cleanName(j.n) : '' };
}

// ---------------------------------------------------------------- the nights
/** Local calendar day "YYYY-MM-DD". */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNo = (key) => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
export const daysBetween = (a, b) => dayNo(b) - dayNo(a);

/**
 * A new house for a first visit. family: the style family (see familyFor).
 * more: what the first-visit questions gave — wish, name, city, country, born (local time of the first visit),
 * neighbour (an invite: { seed, family, wish, name }), setup (true once the questions are answered or skipped).
 */
export function freshProgress(seed = newSeed(), family = familyFor(seed), more = {}) {
  return { v: 1, seed, family: FAMILY_IDS.includes(family) ? family : 'mumbai', wish: '', name: '', city: '', country: '', born: '', neighbour: null, setup: false, loan: null, ...more, placed: {}, free: [], paint: '', inv: { ...START_ITEMS }, seen: { ...START_ITEMS }, streak: 0, last: '', nights: 0, gifts: 0, best: 0, landings: 0, log: [] };
}

/** Reads stored progress, repairing what it can; a broken value gives a new house. */
export function readProgress(raw) {
  let p; try { p = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { p = null; }
  if (!p || typeof p !== 'object' || p.v !== 1 || !Number.isInteger(p.seed) || p.seed <= 0 || p.seed > 0xffffffff) return freshProgress();
  const out = { ...freshProgress(p.seed), ...p };
  if (!FAMILY_IDS.includes(out.family)) out.family = 'mumbai';
  if (!WISH_IDS.includes(out.wish)) out.wish = '';
  out.name = cleanName(out.name);
  out.city = cleanPlace(out.city);
  out.country = typeof out.country === 'string' && /^[A-Z]{2}$/.test(out.country) ? out.country : '';
  out.born = typeof out.born === 'string' && out.born.length <= 32 ? out.born : '';
  out.setup = out.setup === true;
  const nb = out.neighbour;
  out.neighbour = nb && Number.isInteger(nb.seed) && nb.seed > 0 && FAMILY_IDS.includes(nb.family) && nb.seed !== out.seed
    ? { seed: nb.seed, family: nb.family, wish: WISH_IDS.includes(nb.wish) ? nb.wish : '', name: cleanName(nb.name) } : null;
  out.loan = out.loan && itemOf(out.loan.item) ? { item: out.loan.item } : null;
  const h = houseOf(out.seed, out.family, { wish: out.wish });
  out.free = cleanFree(out.free);
  out.paint = itemOf(out.paint)?.type === 'paint' ? out.paint : '';
  out.seen = Object.fromEntries(Object.entries(out.seen || {}).filter(([i, n]) => ITEMS[i] && Number.isInteger(n) && n > 0));
  for (const [i, n] of Object.entries(out.inv || {})) if (ITEMS[i] && !out.seen[i] && n > 0) out.seen[i] = n;
  out.placed = Object.fromEntries(Object.entries(out.placed || {}).filter(([s, i]) => itemOf(i) && h.slots.some((x) => x.id === s && itemOf(i).kinds.includes(x.kind))));
  out.inv = Object.fromEntries(Object.entries(out.inv || {}).filter(([i, n]) => ITEMS[i] && Number.isInteger(n) && n > 0));
  for (const k of ['streak', 'nights', 'gifts', 'best', 'landings']) out[k] = Number.isInteger(out[k]) && out[k] > 0 ? out[k] : 0;
  if (typeof out.last !== 'string' || (out.last && !/^\d{4}-\d{2}-\d{2}$/.test(out.last))) out.last = '';
  out.log = Array.isArray(out.log) ? out.log.filter((e) => e && typeof e === 'object' && typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date)).slice(-40).map(cleanLog) : [];
  return out;
}

/** One line of the diary, read back from storage: only known items and events, numbers and the time (an older version
 * of the site may have stored items that are gone now). */
const isItem = (i) => typeof i === 'string' && Boolean(ITEMS[i]);
function cleanLog(e) {
  const x = { date: e.date, gift: isItem(e.gift) ? e.gift : '', night: Number.isInteger(e.night) && e.night > 0 ? e.night : 1 };
  if (Array.isArray(e.gifts)) { const g = e.gifts.filter(isItem); if (g.length > 1) x.gifts = g; }
  if (typeof e.event === 'string' && EVENT_IDS.includes(e.event)) x.event = e.event;
  if (e.bonus && typeof e.bonus === 'object') {
    const b = Object.fromEntries(Object.entries(e.bonus).filter(([i, n]) => isItem(i) && Number.isInteger(n) && n > 0));
    if (Object.keys(b).length) x.bonus = b;
  }
  if (isItem(e.loan)) x.loan = e.loan;
  if (isItem(e.returned)) x.returned = e.returned;
  if (typeof e.time === 'string' && /^\d{2}:\d{2}$/.test(e.time)) x.time = e.time;
  return x;
}

/**
 * Where a house stands today, without changing it.
 * level: what the house shows now. due: tonight is not lit yet. missed: a night or more was skipped, so the house
 * has gone dark down to level 1. landed: the owl sits on the roof (a multiple of seven nights in a row, and lit tonight).
 * night: the number of tonight in the chain.
 */
export function statusOf(p, today = dayKey()) {
  const gap = p.last ? daysBetween(p.last, today) : Infinity;
  // gap < 0: the last lit night is "tomorrow" here (a flight west, a clock set back). That night counts as tonight,
  // so the run is not broken and the owl does not come twice.
  const litTonight = gap <= 0;
  const alive = gap <= 1;
  const streak = alive ? p.streak : 0;
  const missed = p.last !== '' && gap > 1;
  const level = missed ? 1 : Math.max(1, Math.min(NIGHTS, streak));
  return { gap, litTonight, due: !litTonight, missed, streak, level, landed: litTonight && streak >= NIGHTS, night: litTonight ? streak : streak + 1, first: p.nights === 0 };
}

/** Owned items that are not used yet (in a slot, put anywhere or painted on the walls). */
export function freeItems(p) {
  const used = {};
  for (const it of Object.values(p.placed)) used[it] = (used[it] || 0) + 1;
  for (const f of p.free || []) used[f.i] = (used[f.i] || 0) + 1;
  if (p.paint) used[p.paint] = (used[p.paint] || 0) + 1;
  return Object.fromEntries(ITEM_IDS.map((i) => [i, Math.max(0, (p.inv[i] || 0) - (used[i] || 0))]));
}

/** What each wish makes the owl bring more often (twice the chance): groups of decorations. */
export const WISH_GIFTS = { gold: ['lamps', 'signs'], luck: ['lanterns', 'stickers'], love: ['garlands', 'windows'], quiet: ['lamps', 'yard'], fame: ['neon', 'signs'] };
/**
 * Picks one gift: first the rarity (common 70, rare 22, epic 7, legendary 1; legendary only from night 5 on),
 * then a decoration of that rarity, twice as likely when it is in the groups of the wish. Holder items only with holder.
 */
export function giftFor(rand, holder = false, wish = '', night = 7) {
  const fav = WISH_GIFTS[wish] || [];
  const rar = Object.entries(RARITIES).filter(([r]) => r !== 'legendary' || night >= 5);
  let x = rand() * rar.reduce((t, [, w]) => t + w, 0), rarity = 'common';
  for (const [r, w] of rar) { x -= w; if (x < 0) { rarity = r; break; } }
  const pool = ITEM_IDS.filter((i) => ITEMS[i].rarity === rarity && (holder || !ITEMS[i].holder)).map((i) => [i, fav.includes(ITEMS[i].cat) ? 2 : 1]);
  if (!pool.length) return 'diya';
  let y = rand() * pool.reduce((t, [, w]) => t + w, 0);
  for (const [i, w] of pool) { y -= w; if (y < 0) return i; }
  return pool[0][0];
}
/** How many gifts the owl brings tonight: one on night one, two on night two … seven on night seven, then three. */
export const giftsTonight = (streak) => (streak <= NIGHTS ? Math.max(1, streak) : 3);

/**
 * Lights the lamps tonight. Returns { p, gift, landedNow, event, bonus, loan, returned } with a new progress object,
 * or { p } unchanged when tonight is already lit. A missed night starts the chain again from one.
 * ctx: { hour, weekday, moon, allowed } — the local hour and weekday, the moon phase and the event ids that have words
 * in the config. Without ctx there are no events (the tests of the plain rules).
 */
export function lightTonight(p0, today = dayKey(), rand = Math.random, holder = false, ctx = null) {
  const st = statusOf(p0, today);
  if (st.litTonight) return { p: p0, gift: '', gifts: [], landedNow: false, event: '', scene: '', bonus: {}, loan: '', returned: '' };
  const p = { ...p0, inv: { ...p0.inv }, placed: { ...p0.placed }, log: [...p0.log] };
  p.streak = st.gap === 1 ? p0.streak + 1 : 1;
  p.last = today; p.nights += 1; p.best = Math.max(p.best, p.streak);
  p.seen = { ...(p0.seen || {}) };
  const add = (id, n = 1) => { p.inv[id] = (p.inv[id] || 0) + n; p.seen[id] = (p.seen[id] || 0) + n; };
  const gifts = Array.from({ length: giftsTonight(p.streak) }, () => giftFor(rand, holder, p0.wish, p.streak));
  const gift = gifts[0];
  for (const g of gifts) add(g);
  p.gifts += 1;
  const landedNow = p.streak % NIGHTS === 0;
  if (landedNow) p.landings += 1;
  // a borrowed item comes back
  let returned = '';
  if (p0.loan && itemOf(p0.loan.item)) { returned = p0.loan.item; p.inv[returned] = (p.inv[returned] || 0) + 1; p.loan = null; }
  // tonight's event
  let event = null, bonus = {}, loan = '';
  if (ctx) {
    const free = freeItems({ ...p, inv: p.inv });
    const ectx = { ...ctx, day: today, month: Number(today.slice(5, 7)), holiday: holidayOf(today), family: p.family, streak: p.streak, count: Object.keys(p.placed).length + (p.free || []).length, neighbour: Boolean(p.neighbour), freeLoan: free.bulb > 0 || free.string > 0 };
    event = pickEvent(p.seed, ectx);
    if (event) {
      if (typeof event.bonus === 'number') for (let i = 0; i < event.bonus; i++) { const g = giftFor(rand, holder, p0.wish, p.streak); bonus[g] = (bonus[g] || 0) + 1; }
      else if (event.bonus) bonus = { ...event.bonus };
      if (event.double) bonus[gift] = (bonus[gift] || 0) + 1;
      for (const [id, n] of Object.entries(bonus)) add(id, n);
      if (event.loan) { loan = free.bulb > 0 ? 'bulb' : 'string'; p.inv[loan] -= 1; p.loan = { item: loan }; }
    }
  }
  p.log = [...p.log, { date: today, gift, ...(gifts.length > 1 ? { gifts } : {}), night: p.streak, ...(event ? { event: event.id } : {}), ...(Object.keys(bonus).length ? { bonus } : {}), ...(loan ? { loan } : {}), ...(returned ? { returned } : {}) }].slice(-40);
  return { p, gift, gifts, landedNow, event: event ? event.id : '', scene: event?.scene || '', bonus, loan, returned };
}

/** Tonight's log entry (event, gift, bonus), or null when tonight is not lit yet. */
export function tonightOf(p, today = dayKey()) {
  const e = p.log[p.log.length - 1];
  return e && e.date === today ? e : null;
}
/** The picture of an event, by id. */
export const sceneOf = (eventId) => (EVENTS.find((e) => e.id === eventId) || {}).scene || '';

/** Puts a free item into a slot, or takes the item out when item is ''. Returns a new progress, or null when not allowed. */
export function placeItem(p, slotId, item, holder = false) {
  const h = houseOfP(p), sl = h.slots.find((s) => s.id === slotId);
  if (!sl) return null;
  const placed = { ...p.placed };
  delete placed[slotId];
  if (!item) return { ...p, placed };
  const it = itemOf(item);
  if (!it || !it.kinds.includes(sl.kind) || (it.holder && !holder)) return null;
  if (freeItems({ ...p, placed })[item] <= 0) return null;
  placed[slotId] = item;
  return { ...p, placed };
}

/** Puts an item anywhere on the picture (x, y in the 600×600 drawing). Returns a new progress, or null when not allowed. */
export function placeFree(p, item, x, y, holder = false, more = {}) {
  const it = itemOf(item);
  if (!it || !it.free || (it.holder && !holder) || (p.free || []).length >= FREE_MAX || freeItems(p)[item] <= 0) return null;
  const n = (p.free || []).reduce((m, f) => Math.max(m, f.n || 0), 0) + 1;
  const [e] = cleanFree([{ n, i: item, x, y, s: more.s ?? 1, r: more.r ?? 0, t: more.t }]);
  return { ...p, free: [...(p.free || []), e] };
}
/** Moves, resizes, turns or rewrites one item put anywhere (by its number n); patch {} with x, y, s, r, t. */
export function updateFree(p, n, patch) {
  const free = (p.free || []).map((f) => (f.n === n ? cleanFree([{ ...f, ...patch }])[0] || f : f));
  return { ...p, free };
}
/** Takes an item put anywhere back to the box; front: true brings it to the front instead. */
export function removeFree(p, n) { return { ...p, free: (p.free || []).filter((f) => f.n !== n) }; }
export function frontFree(p, n) { const f = (p.free || []).find((x) => x.n === n); return f ? { ...p, free: [...p.free.filter((x) => x.n !== n), f] } : p; }
/** Paints the walls with a can (item id), or takes the paint off with ''. */
export function applyPaint(p, item, holder = false) {
  if (!item) return { ...p, paint: '' };
  const it = itemOf(item);
  if (!it || it.type !== 'paint' || (it.holder && !holder)) return null;
  if (p.paint !== item && freeItems({ ...p, paint: '' })[item] <= 0) return null;
  return { ...p, paint: item };
}

/** Decorates a house by itself (sample houses of the street before real ones arrive). The same seed gives the same house. */
export function autoDecorate(seed, count = 6, holder = false, family = 'mumbai', wish = '') {
  const h = houseOf(seed, family, { wish }), r = rng(seed ^ 0x9e3779b9), placed = {};
  const pool = ITEM_IDS.filter((i) => (holder || !ITEMS[i].holder) && ITEMS[i].light >= 2);
  const slots = [...h.slots].sort(() => r() - 0.5);
  for (const sl of slots) {
    if (Object.keys(placed).length >= count) break;
    const fit = pool.filter((i) => ITEMS[i].kinds.includes(sl.kind));
    if (fit.length) placed[sl.id] = fit[Math.floor(r() * fit.length)];
  }
  return placed;
}

/** Street rules shared by the page and the server: names on the doors and what a street entry may say. */
export const NAME_RE = /^[A-Za-z0-9 ._'-]{2,18}$/;
export function cleanName(name) {
  const n = (typeof name === 'string' ? name : '').trim().replace(/\s+/g, ' ');
  if (!NAME_RE.test(n)) return '';
  if (/(https?|www\.|\.(com|io|xyz|fun|sol|net|org|app)\b|t\.me|@)/i.test(n)) return '';
  return n;
}

/** A city or place name from the server, kept short and harmless: letters of any language, spaces, dots, dashes. */
export function cleanPlace(v) {
  const t = (typeof v === 'string' ? v : '').normalize('NFC').replace(/[^\p{L}\p{M} .'-]/gu, '').replace(/\s+/g, ' ').trim();
  return t.slice(0, 32).trim();
}
