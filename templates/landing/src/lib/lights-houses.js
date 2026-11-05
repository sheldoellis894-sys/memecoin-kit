// House constructor of the "lights" layout: one seed and one style family give one house, the same on every device.
// A house is put together from modules: the building type of a region of the world, the floors and bays, the windows,
// the ground floor, the roof, balconies, wall finish, small things (water tanks, dishes, air conditioners, wires,
// washing on a line, wires) and the two neighbours. Five Indian streets, millions of combinations.
// Plain JavaScript: the page scripts, api/street.js and the tests all use it. No religious symbols anywhere.

export const VIEW = 600;             // houses are drawn in a 600×600 box
export const GROUND = 548;           // the street level
const SKY_TOP = 196;                 // the highest point of a house (room for the owl on the roof)

// ---------------------------------------------------------------- small helpers
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
const between = (r, [a, b]) => a + Math.floor(r() * (b - a + 1));
const chance = (r, p) => r() < p;
export const OUT = 'stroke="#141026" stroke-width="2.5" stroke-linejoin="round"';
export const f1 = (n) => Number(n).toFixed(1);
export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k));
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
}
export const R = (x, y, w, h, fill, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${extra}/>`;
const sagPath = (x1, x2, y, d) => `M${f1(x1)} ${f1(y)}Q${f1((x1 + x2) / 2)} ${f1(y + d)} ${f1(x2)} ${f1(y)}`;

// ---------------------------------------------------------------- the style families
// Five Indian streets. Ranges are [min, max]. shutter: the colour of window shutters (otherwise the accent colour).
const DOORS = ['#8C3B1F', '#1F5C45', '#2440D8', '#E0218A', '#5B2A86', '#B5651D', '#0F7173'];
export const FAMILIES = {
  mumbai: {
    label: 'Mumbai block', floors: [2, 4], bays: [2, 4], bayW: [84, 100], floorH: [80, 92],
    walls: ['#2EC4B6', '#FF7AA2', '#FFB703', '#9BE564', '#5EC8F2', '#F28F3B', '#F4E3C3', '#B892FF', '#E3E7EA', '#7BDFF2', '#FFD6A5', '#FF8C61'],
    roofs: ['parapet', 'rail', 'tin', 'terrace'], wins: ['square', 'arch', 'jali', 'grid'], grounds: ['shop', 'door', 'chai', 'shop'],
    finish: ['plain', 'peel', 'peel', 'tiles'], balcony: 0.7, balconyKind: 'grill',
    extras: { wires: 0.85, ac: 0.75, tank: 0.65, dish: 0.45, laundry: 0.55, plants: 0.5, antenna: 0.2 }, neighbours: 'flat',
  },
  haveli: {
    label: 'Jaipur haveli', floors: [2, 3], bays: [3, 4], bayW: [84, 98], floorH: [92, 104],
    walls: ['#F4A6B8', '#F7C59F', '#FFD27A', '#F2B5A0', '#E8A87C', '#F6E3B4', '#EFA48B'],
    roofs: ['chhatri', 'chhatri', 'parapet'], wins: ['arch', 'jali', 'bay', 'bay'], grounds: ['door', 'door', 'shop'],
    finish: ['plain', 'frame', 'frame'], balcony: 0.35, balconyKind: 'stone',
    extras: { plants: 0.45, tank: 0.25, laundry: 0.2, ac: 0.25, wires: 0.3 }, neighbours: 'flat',
  },
  jaisalmer: {
    label: 'Jaisalmer house', floors: [2, 3], bays: [2, 3], bayW: [88, 104], floorH: [90, 100],
    walls: ['#E9C77B', '#E3B865', '#D8A85A', '#F0D49A', '#CF9B54', '#F3D9A8'],
    roofs: ['terrace', 'parapet', 'terrace', 'chhatri'], wins: ['arch', 'mashra', 'mashra', 'jali'], grounds: ['door', 'shop', 'door'],
    finish: ['plain', 'stone', 'stone'], balcony: 0.3, balconyKind: 'stone',
    extras: { tank: 0.35, dish: 0.5, plants: 0.35, ac: 0.4, laundry: 0.3 }, neighbours: 'flat',
  },
  kolkata: {
    label: 'Kolkata house', floors: [2, 3], bays: [2, 3], bayW: [84, 98], floorH: [86, 96],
    walls: ['#E8B4A0', '#F2D7A6', '#C7D9C5', '#E0A27A', '#D9C2E0', '#F0C6B4', '#B5D3D9'],
    roofs: ['parapet', 'rail', 'parapet'], wins: ['shutter', 'tall', 'shutter'], grounds: ['arcade', 'shop', 'door'],
    finish: ['peel', 'plain', 'peel'], balcony: 0.7, balconyKind: 'iron', shutter: '#2E7D4F',
    extras: { wires: 0.8, ac: 0.5, plants: 0.6, laundry: 0.5, dish: 0.3 }, neighbours: 'flat',
  },
  goa: {
    label: 'Goa house', floors: [2, 2], bays: [3, 4], bayW: [88, 102], floorH: [90, 100],
    walls: ['#F2C14E', '#3E7CB1', '#C0392B', '#2E8B57', '#F78DA7', '#F4F1EA', '#8E6CC4'],
    roofs: ['hip', 'gable', 'hip'], wins: ['shutter', 'lattice', 'arch'], grounds: ['porch'],
    finish: ['plain', 'frame'], balcony: 0, balconyKind: 'none', roofCol: ['#B5452B', '#A0522D', '#8E3B2F'],
    extras: { plants: 0.7, dish: 0.25, laundry: 0.3, wires: 0.3 }, neighbours: 'gable',
  },
  varanasi: {
    label: 'Varanasi ghat house', floors: [3, 4], bays: [2, 3], bayW: [78, 92], floorH: [70, 80],
    walls: ['#F2A65A', '#E9C46A', '#F4A6B8', '#8ECAE6', '#FFB4A2', '#E07A5F', '#F6BD60'],
    roofs: ['terrace', 'chhatri', 'parapet'], wins: ['arch', 'jali', 'tall'], grounds: ['door', 'shop', 'chai'],
    finish: ['peel', 'peel', 'plain'], balcony: 0.5, balconyKind: 'stone',
    extras: { wires: 0.6, laundry: 0.6, plants: 0.4, tank: 0.4, antenna: 0.3 }, neighbours: 'flat',
  },
  delhi: {
    label: 'Old Delhi house', floors: [3, 4], bays: [2, 3], bayW: [80, 94], floorH: [74, 84],
    walls: ['#C97B63', '#E3B5A4', '#B5838D', '#E5989B', '#F2CC8F', '#D4A373', '#A3B18A'],
    roofs: ['parapet', 'rail', 'terrace'], wins: ['arch', 'jali', 'bay'], grounds: ['shop', 'shop', 'door'],
    finish: ['peel', 'frame'], balcony: 0.7, balconyKind: 'iron',
    extras: { wires: 0.98, ac: 0.7, dish: 0.5, tank: 0.5, laundry: 0.3, antenna: 0.3 }, neighbours: 'flat',
  },
  chennai: {
    label: 'Chennai house', floors: [2, 2], bays: [3, 4], bayW: [86, 100], floorH: [88, 98],
    walls: ['#5EC8F2', '#FF7AA2', '#9BE564', '#FFB703', '#B892FF', '#F28F3B', '#2EC4B6'],
    roofs: ['tin', 'parapet', 'rail'], wins: ['grid', 'square', 'shutter'], grounds: ['arcade', 'shop', 'door'],
    finish: ['plain', 'tiles'], balcony: 0.4, balconyKind: 'grill',
    extras: { wires: 0.7, ac: 0.6, tank: 0.6, dish: 0.5, plants: 0.5 }, neighbours: 'flat',
  },
  kerala: {
    label: 'Kerala house', floors: [2, 2], bays: [3, 4], bayW: [88, 102], floorH: [90, 100],
    walls: ['#F4F1EA', '#E8DCC4', '#C9E4CA', '#F7D9A8', '#B8D8D8', '#F2C14E'],
    roofs: ['hip', 'gable', 'hip'], wins: ['shutter', 'lattice', 'grid'], grounds: ['porch', 'door'],
    finish: ['plain', 'frame'], balcony: 0.4, balconyKind: 'iron', roofCol: ['#9C3D20', '#7A2E1A', '#B5452B'], shutter: '#5B3A1E',
    extras: { plants: 0.95, laundry: 0.2, wires: 0.3, dish: 0.2 }, neighbours: 'gable',
  },
};
export const FAMILY_IDS = Object.keys(FAMILIES);

/** The street of a new house: any of the five, picked by the seed. */
export function familyFor(seed) {
  return FAMILY_IDS[(seed >>> 3) % FAMILY_IDS.length];
}

// ---------------------------------------------------------------- what the visitor wants from the owl
// The wish from the first-visit questions colours the house (and, in lights-kit.js, the owl's gifts).
export const WISHES = {
  gold:  { walls: ['#FFC94A', '#F7B32B', '#FFD27A', '#E8A33D', '#FFE08A'], accent: '#C8102E' },
  luck:  { walls: ['#2EC4B6', '#5FAD56', '#9BE564', '#3FB68B', '#7BDFF2'], accent: '#FF9F1C' },
  love:  { walls: ['#FF7AA2', '#F4A6B8', '#FF5D73', '#E8C1C5', '#F78DA7'], accent: '#7A1F5C' },
  quiet: { walls: ['#A7C5EB', '#B892FF', '#9DD9D2', '#C3B1E1', '#8EA8C3'], accent: '#2440D8' },
  fame:  { walls: ['#FF3FA4', '#00D1FF', '#B6FF3B', '#FF7A00', '#8F5CFF'], accent: '#141026' },
};
export const WISH_IDS = Object.keys(WISHES);

// ---------------------------------------------------------------- building a house
/**
 * Everything about a house that follows from its seed and family.
 * Returns the plan used by houseParts() and the slots where decorations go.
 */
export function houseOf(seed, family = 'mumbai', opts = {}) {
  const fam = FAMILIES[family] ? family : 'mumbai';
  const F = FAMILIES[fam];
  const r = rng(seed ^ (FAMILY_IDS.indexOf(fam) * 0x9e3779b1));
  const wish = WISHES[opts.wish] ? opts.wish : '';
  const paint = /^#[0-9a-f]{6}$/i.test(opts.paint || '') ? opts.paint : '';
  const h = { seed: seed >>> 0, family: fam, wish, no: String((seed >>> 0) % 100000).padStart(5, '0') };

  h.floors = between(r, F.floors);
  h.bays = between(r, F.bays);
  h.bayW = between(r, F.bayW);
  h.w = h.bays * h.bayW;
  h.x0 = Math.round((VIEW - h.w) / 2);
  h.cx = VIEW / 2;
  h.roof = pick(r, F.roofs);
  const roofH = { parapet: 34, rail: 34, tin: 58, terrace: 32, chhatri: 34, gable: Math.round(h.w * 0.26), hip: Math.round(h.w * 0.2) }[h.roof];
  h.floorH = between(r, F.floorH);
  // the house must leave room for the owl above it
  if (GROUND - h.floors * h.floorH - roofH < SKY_TOP) h.floorH = Math.max(60, Math.floor((GROUND - SKY_TOP - roofH) / h.floors));
  h.top = GROUND - h.floors * h.floorH;
  h.roofH = roofH;

  // the wish paints the walls; a separate random line, so the wish changes colours only, never the shape
  const rw = rng(seed ^ 0x5bd1e995);
  const own = pick(r, F.walls);
  h.wall = wish ? pick(rw, WISHES[wish].walls) : own;
  if (paint) h.wall = paint;   // a can of paint from the owl wins over everything
  h.band = shade(h.wall, -0.2);
  h.trim = chance(r, 0.5) ? '#FFF6E5' : shade(h.wall, 0.42);
  h.door = pick(r, DOORS);
  h.accent = pick(r, ['#E0218A', '#2440D8', '#2E8B57', '#FF9F1C', '#C8102E', '#0F7173']);
  if (wish && rw() < 0.6) h.accent = WISHES[wish].accent;
  h.roofCol = pick(r, F.roofCol || ['#B5452B', '#8E3B2F', '#5B5F6B', '#A0522D', '#6A4C93']);
  h.shutter = F.shutter || '';
  h.finish = pick(r, F.finish);
  h.ground = pick(r, F.grounds);
  if (h.ground === 'arcade' && h.bays < 2) h.ground = 'shop';

  // windows: one kind per floor, sometimes a different kind on the top floor
  const winBase = pick(r, F.wins);
  const winTop = chance(r, 0.35) ? pick(r, F.wins) : winBase;
  h.windows = [];
  h.balconies = [];
  h.extras = {};
  for (const [k, p] of Object.entries(F.extras)) h.extras[k] = chance(r, p);

  // the ground floor: what takes which bay
  const mid = Math.floor(h.bays / 2);
  const bayX = (c) => h.x0 + h.bayW * c;
  const gTop = GROUND - h.floorH;
  if (h.ground === 'door' || h.ground === 'porch') {
    const dw = 70;
    const dh = Math.min(h.floorH - 10, 100);
    const dc = h.bays % 2 ? bayX(mid) + h.bayW / 2 : h.cx;
    h.doorBox = { x: Math.round(dc - dw / 2), y: GROUND - dh, w: dw, h: dh };
  } else if (h.ground === 'arcade') {
    h.doorBox = { x: h.x0 + 6, y: gTop + 12, w: h.w - 12, h: h.floorH - 12 };
  } else { // shop, chai
    const span = h.bays >= 3 ? 2 : 1;
    const c0 = h.bays >= 3 ? mid - (h.bays % 2 ? 0 : 1) : 0;
    const left = h.bays >= 3 ? bayX(c0) + 6 : h.x0 + 10;
    const width = h.bays >= 3 ? h.bayW * span - 12 : h.w - 20;
    h.doorBox = { x: left, y: gTop + 26, w: width, h: h.floorH - 26 };
  }
  const groundTaken = (c) => { const l = bayX(c), rr = l + h.bayW, d = h.doorBox; return rr > d.x + 4 && l < d.x + d.w - 4; };

  const winSize = (kind, f) => {
    const fh = h.floorH;
    if (kind === 'tall' || kind === 'shutter') return { w: Math.round(h.bayW * 0.42), h: Math.round(fh * 0.66) };
    if (kind === 'grid') return { w: Math.round(h.bayW * 0.62), h: Math.round(fh * 0.56) };
    if (kind === 'bay' || kind === 'mashra') return { w: Math.round(h.bayW * 0.56), h: Math.round(fh * 0.6) };
    return { w: Math.round(Math.min(h.bayW * 0.58, 64)), h: Math.round(fh * 0.66) };
  };
  for (let f = 0; f < h.floors; f++) {
    const fTop = GROUND - (f + 1) * h.floorH;
    const kind = f === h.floors - 1 && h.floors > 1 ? winTop : winBase;
    for (let c = 0; c < h.bays; c++) {
      if (f === 0 && (h.ground === 'arcade' || groundTaken(c))) continue;
      const s = winSize(kind, f);
      const x = bayX(c) + h.bayW / 2;
      const y = fTop + Math.round((h.floorH - s.h) * (f === 0 ? 0.32 : 0.42));
      h.windows.push({ id: `w${f}${c}`, f, c, kind, x, y, w: s.w, h: s.h });
    }
  }
  // the shop front glows like a window
  if (h.ground === 'shop' || h.ground === 'chai' || h.ground === 'arcade') {
    const d = h.doorBox;
    h.windows.push({ id: 'shop', f: 0, c: -1, kind: 'shopfront', x: d.x + d.w / 2, y: d.y + (h.ground === 'arcade' ? 18 : 22), w: d.w - (h.ground === 'arcade' ? 24 : 16), h: d.h - (h.ground === 'arcade' ? 18 : 22) });
  }
  // balconies on upper floors
  if (F.balcony > 0 && h.floors > 1) {
    for (let f = 1; f < h.floors; f++) {
      if (chance(r, F.balcony)) h.balconies.push({ f, kind: F.balconyKind });
    }
  }
  h.stars = Array.from({ length: 26 }, () => [Math.round(r() * VIEW), Math.round(r() * 190), (0.6 + r() * 1.6).toFixed(1)]);
  h.moon = [Math.round(70 + r() * 460), Math.round(52 + r() * 50)];
  h.lightOrder = h.windows.map((wd) => wd.id).sort(() => r() - 0.5);
  const tall = GROUND - h.top + h.roofH * 0.5;
  h.neighbours = [0, 1].map(() => ({ hgt: Math.max(110, Math.round(tall * (0.55 + r() * 0.45))), col: shade(pick(r, F.walls), -0.5), roof: F.neighbours, wins: Array.from({ length: 12 }, () => r()) }));

  // ---- the slots where decorations go
  const S = (h.slots = []);
  h.roofY = h.top - ({ parapet: 34, rail: 34, terrace: 32, chhatri: 34, tin: 0, gable: 0, hip: 0 }[h.roof]);
  S.push({ id: 'roof-line', kind: 'line', x1: h.x0 + 8, x2: h.x0 + h.w - 8, y: h.top + 6 });
  for (const b of h.balconies) S.push({ id: `b${b.f}-line`, kind: 'line', x1: h.x0 + 20, x2: h.x0 + h.w - 20, y: GROUND - b.f * h.floorH - 26 });
  const d = h.doorBox;
  S.push({ id: 'door', kind: 'door', x1: d.x - 4, x2: d.x + d.w + 4, y: Math.max(d.y - 10, GROUND - h.floorH + 8) });
  S.push({ id: 'step', kind: 'step', x: d.x + d.w / 2, y: GROUND + 26 });
  S.push({ id: 'side-l', kind: 'side', x: Math.max(h.x0 - 30, 22), y: GROUND });
  S.push({ id: 'side-r', kind: 'side', x: Math.min(h.x0 + h.w + 30, VIEW - 22), y: GROUND });
  for (const wd of h.windows) {
    if (wd.kind === 'shopfront') continue;
    const sillY = wd.y + wd.h + 4;
    S.push({ id: `${wd.id}-sill`, kind: 'sill', x: wd.x, y: sillY });
    S.push({ id: `${wd.id}-win`, kind: 'win', x: wd.x, y: wd.kind === 'bay' ? wd.y + 10 : wd.y, w: wd.w, h: wd.kind === 'bay' ? wd.h - 10 : wd.h });
    if (wd.f > 0) S.push({ id: `${wd.id}-hang`, kind: 'hang', x: wd.x, y: wd.y - 16 });
  }
  // places on the roof, and the owl's perch
  const sloped = ['tin', 'gable', 'hip'].includes(h.roof);
  if (sloped) {
    S.push({ id: 'roof-a', kind: 'roof', x: h.x0 + 18, y: h.top - 2 });
    S.push({ id: 'roof-b', kind: 'roof', x: h.x0 + h.w - 18, y: h.top - 2 });
    const peak = h.top - h.roofH;
    h.perch = { x: h.cx, y: h.roof === 'hip' ? peak + 6 : peak + 18 };
  } else {
    const tankLeft = h.extras.tank && (h.seed & 1);
    S.push({ id: 'roof-a', kind: 'roof', x: h.x0 + 42, y: h.roofY });
    if (!h.extras.tank || tankLeft) S.push({ id: 'roof-b', kind: 'roof', x: h.x0 + h.w - 42, y: h.roofY });
    h.perch = { x: h.roof === 'chhatri' ? h.cx : h.cx + (h.extras.tank && !tankLeft ? -30 : 0), y: h.roofY + 4 };
  }
  return h;
}

// ---------------------------------------------------------------- windows
/** The glass of a window (dark at night, warm when lit) with its bars. Drawn twice: dark in the body, lit after the night falls. */
export function windowGlass(h, wd, fill, lit = false) {
  const { x, y, w, h: hh } = wd, l = x - w / 2;
  const bar = (d) => `<path d="${d}" stroke="#141026" stroke-width="2" opacity="${lit ? 0.45 : 0.6}" fill="none"/>`;
  switch (wd.kind) {
    case 'arch': return `<path d="M${l} ${y + hh}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + hh}z" fill="${fill}" ${OUT}/>` + bar(`M${x} ${y + 8}V${y + hh}M${l} ${y + hh * 0.58}h${w}`);
    case 'jali': {
      let s = R(l, y, w, hh, fill, `rx="4" ${OUT}`);
      for (let i = 1; i < 4; i++) s += bar(`M${f1(l + (w * i) / 4)} ${y}V${y + hh}`);
      for (let i = 1; i < 5; i++) s += bar(`M${l} ${f1(y + (hh * i) / 5)}h${w}`);
      return s;
    }
    case 'lattice': {
      let s = R(l, y, w, hh, fill, `${OUT}`);
      for (let i = 1; i < 3; i++) s += bar(`M${f1(l + (w * i) / 3)} ${y}V${y + hh}M${l} ${f1(y + (hh * i) / 3)}h${w}`);
      return s + `<rect x="${f1(l + w * 0.3)}" y="${f1(y + hh * 0.3)}" width="${f1(w * 0.4)}" height="${f1(hh * 0.4)}" fill="none" stroke="#141026" stroke-width="2" opacity=".5"/>`;
    }
    case 'grid': return R(l, y, w, hh, fill, `${OUT}`) + bar(`M${f1(l + w / 3)} ${y}V${y + hh}M${f1(l + (2 * w) / 3)} ${y}V${y + hh}M${l} ${f1(y + hh * 0.3)}h${f1(w / 3)}`);
    case 'tall': return R(l, y, w, hh, fill, `rx="3" ${OUT}`) + bar(`M${x} ${y}V${y + hh}M${l} ${f1(y + hh * 0.36)}h${w}M${l} ${f1(y + hh * 0.68)}h${w}`);
    case 'shutter': return R(l, y, w, hh, fill, `${OUT}`) + bar(`M${x} ${y}V${y + hh}M${l} ${f1(y + hh * 0.5)}h${w}`);
    case 'bay': return R(l, y + 10, w, hh - 10, fill, `${OUT}`) + bar(`M${f1(l + w / 3)} ${y + 10}V${y + hh}M${f1(l + (2 * w) / 3)} ${y + 10}V${y + hh}`);
    case 'mashra': {
      let s = R(l, y, w, hh, fill, `${OUT}`);
      for (let i = 1; i < 6; i++) s += bar(`M${f1(l + (w * i) / 6)} ${y}V${y + hh}`);
      for (let i = 1; i < 7; i++) s += bar(`M${l} ${f1(y + (hh * i) / 7)}h${w}`);
      return s;
    }
    case 'shopfront': {
      let s = R(l, y, w, hh, fill, `${OUT}`);
      if (lit) for (let i = 0; i < 3; i++) s += R(l + 8 + i * (w - 16) / 3, y + hh * 0.35, (w - 16) / 3 - 8, 7, '#C47A2C', 'opacity=".55"');
      return s;
    }
    default: return R(l, y, w, hh, fill, `rx="4" ${OUT}`) + bar(`M${x} ${y + 6}V${y + hh}M${l} ${f1(y + hh * 0.55)}h${w}`);
  }
}

function windowFrame(h, wd) {
  const { x, y, w, h: hh } = wd, l = x - w / 2;
  switch (wd.kind) {
    case 'arch': case 'jali': case 'square': case 'grid': case 'lattice':
      return R(l - 6, y + hh, w + 12, 7, h.trim, `rx="2" ${OUT}`);
    case 'tall': return R(l - 5, y - 8, w + 10, 8, h.trim, OUT) + R(l - 6, y + hh, w + 12, 6, h.trim, OUT);
    case 'shutter': {
      const sc = h.shutter || h.accent;
      const louv = (sx) => { let s = R(sx, y, w * 0.42, hh, sc, OUT); for (let i = 1; i < 6; i++) s += `<path d="M${f1(sx + 3)} ${f1(y + (hh * i) / 6)}h${f1(w * 0.42 - 6)}" stroke="#141026" stroke-width="1.4" opacity=".45"/>`; return s; };
      return louv(l - w * 0.44) + louv(l + w + 2) + R(l - 4, y + hh, w + 8, 6, h.trim, OUT);
    }
    case 'bay': // jharokha: a little balcony box with a curved canopy
      return `<path d="M${l - 10} ${y + 12}q${(w + 20) / 2} -30 ${w + 20} 0z" fill="${h.trim}" ${OUT}/><circle cx="${x}" cy="${y - 8}" r="4" fill="#FFC94A" ${OUT}/>` +
        R(l - 8, y + hh, w + 16, 12, h.trim, OUT) + `<path d="M${l - 4} ${y + hh + 12}l${(w + 8) / 2} 14l${(w + 8) / 2} -14z" fill="${h.band}" ${OUT}/>` +
        `<path d="M${l - 6} ${y + 12}V${y + hh}M${l + w + 6} ${y + 12}V${y + hh}" stroke="${h.trim}" stroke-width="5"/>`;
    case 'mashra': return R(l - 7, y - 7, w + 14, hh + 14, '#8B5A2B', OUT) + R(l - 9, y + hh + 6, w + 18, 7, h.trim, OUT);
    default: return '';
  }
}

// ---------------------------------------------------------------- parts of the house
/** A friend's house next door (the invite link): drawn smaller on the left, standing on the same street. */
function friendSvg(h, f, level, dark = false) {
  const s = Math.min(0.62, (h.x0 + 40) / f.w);
  const tx = h.x0 - 16 - (f.x0 + f.w) * s, ty = GROUND * (1 - s);
  const litCount = dark ? 0 : Math.max(1, Math.round((f.windows.length * Math.max(1, level)) / 7));
  const lit = new Set(f.lightOrder.slice(0, litCount));
  let body = roofBack(f) + R(f.x0, f.top, f.w, GROUND - f.top, f.wall, OUT) + finishSvg(f);
  for (let k = 1; k < f.floors; k++) body += R(f.x0 - 6, GROUND - k * f.floorH - 5, f.w + 12, 10, f.band, OUT);
  for (const wd of f.windows) if (wd.kind !== 'shopfront') body += windowFrame(f, wd);
  for (const wd of f.windows) body += windowGlass(f, wd, lit.has(wd.id) ? '#FFD36B' : '#1B2048', lit.has(wd.id));
  body += groundSvg(f) + balconySvg(f) + roofFront(f);
  return `<g transform="translate(${f1(tx)} ${f1(ty)}) scale(${s.toFixed(3)})">${body}</g>`;
}

/** Where the neighbour's walls and windows are (also used by the street scenes). on: the window is lit tonight. */
export function neighbourBox(h, side, level, dark = false) {
  const n = h.neighbours[side];
  const x1 = side === 0 ? -60 : h.x0 + h.w + 14, x2 = side === 0 ? h.x0 - 14 : VIEW + 60;
  const top = GROUND - n.hgt, wins = [];
  let i = 0;
  for (let y = top + 22; y < GROUND - 50; y += 62) for (let x = x1 + 14; x < x2 - 30; x += 46) wins.push({ x, y, w: 24, h: 32, on: !dark && n.wins[i++ % n.wins.length] < 0.12 + level * 0.07 });
  return { n, x1, x2, w: x2 - x1, top, wins };
}

function neighbourSvg(h, side, level, dark = false) {
  const { n, x1, x2, w, top, wins } = neighbourBox(h, side, level, dark);
  if (w < 30) return '';
  let s = R(x1, top, w, n.hgt, n.col, 'stroke="#0B0820" stroke-width="2"');
  if (n.roof === 'gable') s += `<path d="M${x1 - 4} ${top}L${f1(x1 + w / 2)} ${top - 50}L${x2 + 4} ${top}z" fill="${shade(n.col, -0.3)}" stroke="#0B0820" stroke-width="2"/>`;
  else s += R(x1 - 3, top - 8, w + 6, 8, shade(n.col, 0.1), 'stroke="#0B0820" stroke-width="2"');
  // windows: more of them light up as the nights go on (the street joins in)
  for (const wd of wins) s += R(wd.x, wd.y, wd.w, wd.h, wd.on ? '#FFC96B' : '#151938', `rx="3" stroke="#0B0820" stroke-width="1.5"${wd.on ? ' opacity=".9"' : ''}`);
  return s;
}

function finishSvg(h) {
  const { x0, w, top } = h, hh = GROUND - top, r = rng(h.seed ^ 0x51ed);
  let s = '';
  if (h.finish === 'peel') for (let i = 0; i < 7; i++) { const px = x0 + 10 + r() * (w - 50), py = top + 10 + r() * (hh - 60); s += `<path d="M${f1(px)} ${f1(py)}q${f1(10 + r() * 14)} -${f1(6 + r() * 6)} ${f1(26 + r() * 16)} 2q-6 ${f1(10 + r() * 10)} -${f1(20 + r() * 10)} 8z" fill="${shade(h.wall, r() < 0.5 ? 0.25 : -0.14)}" opacity=".9"/>`; }
  if (h.finish === 'stone') for (let i = 0; i < 14; i++) { const px = r() < 0.5 ? x0 + 2 : x0 + w - 22, py = top + 6 + r() * (hh - 30); s += R(px, py, 20, 12, shade(h.wall, -0.1), 'rx="2" opacity=".9"'); }
  if (h.finish === 'tiles') s += R(x0, GROUND - 26, w, 26, shade(h.accent, 0.35), 'opacity=".9"') + Array.from({ length: Math.floor(w / 13) }, (_, i) => `<path d="M${x0 + i * 13} ${GROUND - 26}v26" stroke="#141026" stroke-width="1" opacity=".3"/>`).join('');
  if (h.finish === 'frame') s += R(x0 + 6, top + 6, w - 12, GROUND - top - 12, 'none', `stroke="${h.trim}" stroke-width="5" opacity=".9"`);
  return s;
}

function roofBack(h) {
  const { x0, w, top, cx } = h; let s = '';
  if (h.extras.tank && !['gable', 'hip'].includes(h.roof)) { const tx = h.seed & 1 ? x0 + 22 : x0 + w - 72; s += R(tx, top - 82, 50, 50, '#26262E', `rx="8" ${OUT}`) + `<path d="M${tx} ${top - 68}h50M${tx} ${top - 52}h50" stroke="#3E3E4A" stroke-width="3"/>` + R(tx + 8, top - 34, 6, 30, '#26262E') + R(tx + 36, top - 34, 6, 30, '#26262E'); }
  if (h.extras.antenna) { const ax = x0 + w * 0.3; s += `<path d="M${ax} ${h.roofY}V${h.roofY - 56}M${ax - 18} ${h.roofY - 50}h36M${ax - 13} ${h.roofY - 40}h26M${ax - 8} ${h.roofY - 30}h16" stroke="#2B2B36" stroke-width="2.5" fill="none"/>`; }
  if (h.extras.dish) { const dx = x0 + w * 0.62, dy = (['gable', 'hip'].includes(h.roof) ? top + 14 : h.roofY - 4); s += `<path d="M${dx} ${dy}v-12" stroke="#2B2B36" stroke-width="3"/><ellipse cx="${dx}" cy="${dy - 20}" rx="14" ry="11" fill="#E8E8EE" ${OUT} transform="rotate(-25 ${dx} ${dy - 20})"/>`; }
  if (h.roof === 'chhatri') for (const px of [x0 + 34, x0 + w - 34]) s += R(px - 22, top - 34 - 46, 6, 46, h.trim, OUT) + R(px + 16, top - 34 - 46, 6, 46, h.trim, OUT) + `<path d="M${px - 30} ${top - 80}q30 -46 60 0z" fill="${h.trim}" ${OUT}/><circle cx="${px}" cy="${top - 104}" r="4" fill="#FFC94A" ${OUT}/>` + R(px - 30, top - 82, 60, 6, h.band, OUT);
  return s;
}

function roofFront(h) {
  const { x0, w, top, cx } = h; let s = '';
  switch (h.roof) {
    case 'parapet': case 'chhatri': {
      s += R(x0 - 10, top - 22, w + 20, 22, h.trim, OUT);
      const n = Math.round(w / 34);
      for (let i = 0; i <= n; i++) s += R(x0 - 10 + ((w + 8) * i) / n, top - 34, 12, 12, h.trim, OUT);
      break;
    }
    case 'terrace': {
      s += R(x0 - 8, top - 32, w + 16, 32, h.trim, OUT);
      const n = Math.max(3, Math.round(w / 46));
      for (let i = 0; i < n; i++) { const ax = x0 + 6 + (i + 0.5) * ((w - 12) / n); s += `<path d="M${f1(ax - 9)} ${top - 6}v-12a9 9 0 0 1 18 0v12z" fill="${h.band}"/>`; }
      break;
    }
    case 'rail': {
      s += R(x0 - 6, top - 6, w + 12, 8, h.trim, OUT);
      for (let i = 0; i <= 12; i++) s += R(x0 - 4 + ((w + 6) * i) / 12, top - 30, 4, 26, h.trim);
      s += R(x0 - 6, top - 34, w + 12, 6, h.trim, OUT);
      break;
    }
    case 'tin': {
      s += `<path d="M${x0 - 18} ${top + 2}L${cx} ${top - 58}L${x0 + w + 18} ${top + 2}z" fill="#8E9BB0" ${OUT}/>`;
      for (let i = 1; i < 8; i++) s += `<path d="M${cx} ${top - 58}L${f1(x0 - 18 + ((w + 36) * i) / 8)} ${top + 2}" stroke="#6D7890" stroke-width="2"/>`;
      break;
    }
    case 'hip': s += `<path d="M${x0 - 18} ${top + 2}L${x0 + w * 0.22} ${top - h.roofH}H${x0 + w * 0.78}L${x0 + w + 18} ${top + 2}z" fill="${h.roofCol}" ${OUT}/>` + Array.from({ length: 4 }, (_, i) => `<path d="M${x0 - 10} ${f1(top - h.roofH * (i + 1) / 5)}h${w + 20}" stroke="#141026" stroke-width="1.3" opacity=".3"/>`).join(''); break;
    case 'gable': {
      const peak = top - h.roofH;
      s += `<path d="M${x0 - 20} ${top + 2}L${cx} ${peak}L${x0 + w + 20} ${top + 2}z" fill="${h.roofCol}" ${OUT}/>`;
      for (let i = 1; i < 5; i++) { const t = i / 5; s += `<path d="M${f1(cx - (w / 2 + 20) * t)} ${f1(peak + (top + 2 - peak) * t)}h${f1((w + 40) * t)}" stroke="#141026" stroke-width="1.3" opacity=".35"/>`; }
      s += `<circle cx="${cx}" cy="${f1(peak + h.roofH * 0.55)}" r="10" fill="${h.trim}" ${OUT}/>`;
      break;
    }
    default: break;
  }
  return s;
}

function groundSvg(h) {
  const d = h.doorBox, { cx } = h; let s = '';
  const gTop = GROUND - h.floorH;
  switch (h.ground) {
    case 'door':
      s += R(d.x - 6, d.y - 6, d.w + 12, d.h + 6, h.trim, `rx="6" ${OUT}`) + `<path d="M${d.x} ${GROUND}V${d.y + 26}a${d.w / 2} 26 0 0 1 ${d.w} 0V${GROUND}z" fill="${h.door}" ${OUT}/><path d="M${d.x + d.w / 2} ${d.y + 4}V${GROUND}" stroke="#141026" stroke-width="2.5"/>` +
        `<circle cx="${d.x + d.w / 2 - 9}" cy="${GROUND - 46}" r="3.5" fill="#FFC94A"/><circle cx="${d.x + d.w / 2 + 9}" cy="${GROUND - 46}" r="3.5" fill="#FFC94A"/>`;
      break;
    case 'porch':
      s += `<path d="M${d.x - 30} ${d.y - 6}L${d.x + d.w / 2} ${d.y - 30}L${d.x + d.w + 30} ${d.y - 6}z" fill="${h.roofCol}" ${OUT}/>` + R(d.x - 26, d.y - 6, 7, d.h + 6, '#FFFFFF', OUT) + R(d.x + d.w + 19, d.y - 6, 7, d.h + 6, '#FFFFFF', OUT) +
        R(d.x + 8, d.y + 6, d.w - 16, d.h - 6, h.door, OUT) + R(d.x + 18, d.y + 16, d.w - 36, 22, '#1B2048', OUT) + `<circle cx="${d.x + d.w - 18}" cy="${GROUND - 44}" r="3.5" fill="#FFC94A"/>` +
        R(d.x - 34, GROUND - 4, d.w + 68, 6, '#BDB6A8', OUT);
      break;
    case 'arcade': {
      const n = h.bays;
      s += R(h.x0, gTop, h.w, 12, h.band, OUT);
      for (let i = 0; i < n; i++) { const ax = h.x0 + i * h.bayW; s += `<path d="M${ax + 6} ${GROUND}V${gTop + 40}a${(h.bayW - 12) / 2} ${(h.bayW - 12) / 2} 0 0 1 ${h.bayW - 12} 0V${GROUND}" fill="none" stroke="${h.trim}" stroke-width="7"/>`; }
      break;
    }
    case 'chai': case 'shop': default: {
      s += R(d.x - 6, gTop + 6, d.w + 12, 18, shade(h.accent, 0.1), OUT); // blank sign board
      // a half-open rolling shutter above the glowing shop
      s += R(d.x, d.y, d.w, 18, '#9AA0B5', OUT) + Array.from({ length: 3 }, (_, i) => `<path d="M${d.x} ${d.y + 5 + i * 5}h${d.w}" stroke="#141026" stroke-width="1" opacity=".4"/>`).join('');
      if (h.ground === 'chai') s += R(d.x + 6, GROUND - 26, d.w - 12, 26, '#7A4E2D', OUT) + `<path d="M${d.x + d.w * 0.7} ${GROUND - 26}v-12h16v12" fill="#B0B6C2" stroke="#141026" stroke-width="2"/><path d="M${d.x + d.w * 0.7 + 16} ${GROUND - 34}q8 0 8 6" stroke="#141026" stroke-width="2" fill="none"/>`;
      break;
    }
  }
  return s;
}

function balconySvg(h) {
  let s = '';
  for (const b of h.balconies) {
    const by = GROUND - b.f * h.floorH;
    {
      const bx = h.x0 + 14, bw = h.w - 28;
      s += R(bx, by - 4, bw, 10, h.band, OUT);
      if (b.kind === 'grill' || b.kind === 'iron') { for (let i = 0; i <= 14; i++) s += R(bx + 4 + ((bw - 10) * i) / 14, by - 28, 3, 24, '#141026', 'opacity=".8"'); s += R(bx, by - 32, bw, 5, '#141026', 'rx="2"'); }
      if (b.kind === 'grill') for (let i = 0; i < 6; i++) s += `<circle cx="${f1(bx + 14 + ((bw - 28) * i) / 5)}" cy="${by - 16}" r="5" fill="none" stroke="#141026" stroke-width="1.5" opacity=".7"/>`;
      if (b.kind === 'stone') s += R(bx, by - 26, bw, 22, h.trim, OUT) + Array.from({ length: Math.floor(bw / 22) }, (_, i) => `<circle cx="${bx + 11 + i * 22}" cy="${by - 15}" r="6" fill="${h.band}"/>`).join('');
    }
  }
  return s;
}

function extrasFront(h) {
  const { x0, w, top } = h, r = rng(h.seed ^ 0xe3a1); let s = '';
  const upper = h.windows.filter((wd) => wd.f > 0 && wd.kind !== 'shopfront');
  if (h.extras.ac) for (const wd of upper.filter(() => r() < 0.45).slice(0, 3)) { const ax = wd.x + wd.w / 2 + 8, ay = wd.y + wd.h * 0.5; if (ax + 30 < x0 + w) s += R(ax, ay, 30, 20, '#E6E8EC', `rx="2" ${OUT}`) + `<circle cx="${ax + 15}" cy="${ay + 10}" r="6" fill="none" stroke="#141026" stroke-width="1.5"/>`; }
  if (h.extras.plants) { const flat = !['gable', 'hip', 'tin'].includes(h.roof); const py = flat ? h.roofY : GROUND; const px = flat ? x0 + w * 0.5 + 40 : x0 - 4; s += R(px - 9, py - 16, 18, 16, '#C2552B', OUT) + `<path d="M${px} ${py - 16}c-12 -10 -14 -22 -4 -28M${px} ${py - 16}c10 -12 16 -18 6 -30M${px} ${py - 16}v-24" stroke="#2E8B57" stroke-width="4" fill="none" stroke-linecap="round"/>`; }
  if (h.extras.laundry && h.floors > 1) { const ly = GROUND - (h.floors - 1) * h.floorH - 12, lx1 = x0 + 10, lx2 = x0 + w * 0.48; s += `<path d="${sagPath(lx1, lx2, ly, 10)}" stroke="#141026" stroke-width="1.5" fill="none"/>`; for (let i = 0; i < 4; i++) { const t = (i + 0.7) / 5, cx2 = lx1 + (lx2 - lx1) * t, cy2 = ly + 10 * 4 * t * (1 - t) / 2; s += R(cx2 - 7, cy2, 14, 16 + (i % 2) * 6, pick(r, ['#FF7AA2', '#5EC8F2', '#FFC94A', '#FFFFFF', '#9BE564']), 'stroke="#141026" stroke-width="1.3"'); } }
  if (h.extras.wires) { const wy = top + 20 + r() * 30; for (let i = 0; i < 3; i++) s += `<path d="M-10 ${f1(wy + i * 9)}Q${f1(VIEW * (0.3 + r() * 0.4))} ${f1(wy + 26 + i * 12 + r() * 14)} ${VIEW + 10} ${f1(wy + i * 6 + r() * 16)}" stroke="#141026" stroke-width="2" fill="none" opacity=".85"/>`; s += `<path d="M${x0 + w * 0.8} ${f1(wy + 18)}c-10 4 6 10 -4 14s10 6 0 10" stroke="#141026" stroke-width="2" fill="none"/>`; }
  return s;
}

/**
 * SVG strings of the building, split into layers so the night and the decorations can be laid between them.
 * back: neighbours and things behind the house; body: walls, windows, doors; front: balconies, roof and small things.
 * friend: another house (houseOf) to stand on the left instead of the dark neighbour. dark: a power cut, the neighbours go out.
 */
export function houseParts(h, level = 1, friend = null, dark = false) {
  const { x0, w, top } = h;
  let back = (friend ? friendSvg(h, friend, level, dark) : neighbourSvg(h, 0, level, dark)) + neighbourSvg(h, 1, level, dark);
  back += `<rect x="-400" y="${GROUND}" width="1400" height="600" fill="#2A2350"/><rect x="-400" y="${GROUND}" width="1400" height="6" fill="#3A3270"/>`;
  back += roofBack(h);
  let body = R(x0, top, w, GROUND - top, h.wall, OUT) + finishSvg(h);
  for (let f = 1; f < h.floors; f++) body += R(x0 - 6, GROUND - f * h.floorH - 5, w + 12, 10, h.band, OUT);
  for (const wd of h.windows) if (wd.kind !== 'shopfront') body += windowFrame(h, wd);
  for (const wd of h.windows) body += windowGlass(h, wd, wd.kind === 'shopfront' ? '#151A3E' : '#1B2048');
  body += groundSvg(h);
  const front = balconySvg(h) + roofFront(h) + extrasFront(h) + R(-400, GROUND, 1400, 0.1, 'none');
  return { back, body, front };
}

// ---------------------------------------------------------------- the real moon
/** Phase of the moon on a date: 0 = new, 0.5 = full, growing until full. */
export function moonPhase(date = new Date()) {
  const days = (date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  return (((days / 29.530588853) % 1) + 1) % 1;
}
/** SVG of the moon with its real phase. */
export function moonSvg(cx, cy, r, phase) {
  const k = Math.cos(2 * Math.PI * phase), rx = f1(Math.abs(k) * r);
  const base = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2A2F5A" opacity=".55"/>`;
  if (Math.abs(phase - 0.5) < 0.03) return base + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF3C4"/>`;
  if (phase < 0.03 || phase > 0.97) return base;
  const waxing = phase < 0.5, crescent = k > 0;
  const outer = waxing ? 1 : 0, term = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  return base + `<path d="M${cx} ${cy - r}A${r} ${r} 0 0 ${outer} ${cx} ${cy + r}A${rx} ${r} 0 0 ${term} ${cx} ${cy - r}z" fill="#FFF3C4"/>`;
}
