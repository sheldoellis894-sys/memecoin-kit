// The city map (section lightsCity): where every house stands and what a small house looks like.
// Pure functions without a page, shared by the section script and the tests.
//
// The city grows from its middle like the seeds of a sunflower: the visitor's own house stands in the middle, and the
// other houses stand around it on a spiral, so the city is round and has no rows. Sizes are in "lots": a house is a
// little less than one lot wide, and houses stand about a lot and a half apart. Ring roads go round the middle, a river
// runs through a large city, and every style of house has its own district between two avenues: the districts are there
// from the first day, with empty lots in them, so a new house always knows where it goes.
import { houseOf, NIGHTS, itemOf } from './lights-kit.js';

export const TILE = 0.98;        // the picture of a house, in lots
const STEP = 0.85;               // how far apart the spiral puts the houses (about 1.4 lots from one house to the next)
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const RING = 8.5;                // from one ring road to the next
const GAP = 0.66;                // half the width kept free of houses along a road or the river
const OUTSIDE = 16;              // a city smaller than this has the names of its districts around it, a larger one inside them
const LOTS = 2;                  // at least so many empty lots in every district
const TAU = Math.PI * 2;
const START = -Math.PI / 2;      // the first district starts at the top of the map

/**
 * Where every house of the city stands.
 * styles = for every house (in the order they came to the street; the visitor's own house is not in the list) the number
 *   of its style, 0…count-1. opts.count = how many styles there are; opts.wide = a city wider than tall (a wide screen),
 *   otherwise taller than wide (a phone); opts.free = how many empty lots to leave around the city.
 * Returns { spots, rings, avenues, river, districts, kx, ky, R }:
 *   spots     [{ x, y, i, d, a }] — i = the house (index in styles), or -1 for an empty lot; d = its district (style number,
 *             -1 when there is one style only); a = its turn on the spiral. The middle (0, 0) is left for the visitor.
 *   rings     radii of the ring roads (before the stretch: draw them as ellipses r·kx by r·ky)
 *   avenues   [{ a, r0, r1 }] — straight roads between two districts, from the middle outwards
 *   river     [[x, y] …] — the line of the river, or null in a small city
 *   districts [{ d, x, y, n, out }] — where the name of every district stands and how many houses it has; out = the name
 *             stands outside the city (a small city), otherwise in the middle of the district
 */
export function cityPlan(styles, opts = {}) {
  const n = styles.length, count = Math.max(1, opts.count || 9);
  const kx = opts.wide === false ? 1 : 1.28, ky = opts.wide === false ? 1.18 : 1;
  const freeWant = Math.max(0, opts.free ?? Math.max(18, Math.round(n * 0.06)));
  // the districts: a slice of the city for every style, as wide as its share of the houses; a style without houses yet
  // keeps a narrow slice, so a young city is cut into equal districts
  const per = Array(count).fill(0);
  for (const s of styles) if (s >= 0 && s < count) per[s] += 1;
  const split = count > 1;
  const slices = [];
  if (split) {
    const pad = Math.max(3, n * 0.035), total = per.reduce((a, c) => a + c + pad, 0);
    let a = 0;
    per.forEach((c, s) => { const w = ((c + pad) / total) * TAU; slices.push({ d: s, a0: a, a1: a + w }); a += w; });
  }
  const queues = new Map();
  styles.forEach((s, i) => { const d = split ? s : -1; if (!queues.has(d)) queues.set(d, []); queues.get(d).push(i); });
  // how far the city will reach, to decide on the roads before the houses are placed (roads take about a sixth of the lots)
  const reach = STEP * Math.sqrt(n * 1.2 + 10);
  const rings = []; for (let r = RING; r < reach - 2; r += RING) rings.push(r);
  const riverOn = reach >= 7;
  const amp = 0.16 * reach * ky, len = 0.36 * reach * kx, slope = (0.18 * ky) / kx, off = Math.max(2.5, 0.16 * reach) * ky;
  const riverY = (x) => amp * Math.sin(x / len) + slope * x + off;
  const sliceOf = (rel) => { for (const sl of slices) if (rel < sl.a1) return sl; return slices[slices.length - 1]; };

  const spots = [];
  let left = n, free = 0, R = 2, holes = 0;
  const holesMax = Math.round(n * 0.05) + 6;
  const lots = new Map(slices.map((sl) => [sl.d, 0]));
  let lack = slices.length;       // districts that have not got their empty lots yet
  const lot = (d) => { if (!lots.has(d)) return; lots.set(d, lots.get(d) + 1); if (lots.get(d) === LOTS) lack -= 1; };
  for (let k = 0; k < n * 8 + 900 && (left > 0 || free < freeWant || lack > 0); k++) {
    const r = STEP * Math.sqrt(k + 2.5), a = (k * GOLDEN) % TAU;
    if (rings.some((q) => Math.abs(r - q) < GAP)) continue;
    const rel = (((a - START) % TAU) + TAU) % TAU;
    if (split && r > 2.6 && slices.some((sl) => { const d = Math.abs(rel - sl.a0); return Math.min(d, TAU - d) * r < GAP * 0.9; })) continue;
    const x = r * Math.cos(a) * kx, y = r * Math.sin(a) * ky;
    if (riverOn && Math.abs(y - riverY(x)) < GAP + 0.14) continue;
    const d = split ? sliceOf(rel).d : -1;
    const q = queues.get(d);
    if (q && q.length) { spots.push({ x, y, i: q.shift(), d, a }); left -= 1; R = Math.max(R, r); continue; }
    // an empty lot: a few inside the city (a district that is full while others still grow), then a ring of them around it
    if (left > 0) { if (holes < holesMax) { holes += 1; lot(d); spots.push({ x, y, i: -1, d, a }); } continue; }
    if (free < freeWant || (lots.get(d) ?? LOTS) < LOTS) { free += 1; lot(d); spots.push({ x, y, i: -1, d, a }); R = Math.max(R, r); }
  }
  const avenues = split ? slices.map((sl) => ({ a: sl.a0 + START, r0: 2.6, r1: R + 0.6 })) : [];
  let river = null;
  if (riverOn) { river = []; const x1 = (R + 2.5) * kx; for (let x = -x1; x <= x1 + 0.01; x += Math.max(0.5, x1 / 60)) river.push([x, riverY(x)]); }
  const districts = [];
  if (split) for (const sl of slices) {
    // the name stands in the middle of the slice: two thirds of the way out, or around a city too small to hold names
    const out = R < OUTSIDE, mid = (sl.a0 + sl.a1) / 2 + START, rr = out ? R + 1.1 : R * 0.64;
    districts.push({ d: sl.d, x: rr * Math.cos(mid) * kx, y: rr * Math.sin(mid) * ky, n: per[sl.d], out });
  }
  return { spots, rings: rings.filter((q) => q < R + 0.5), avenues, river, districts, kx, ky, R };
}

/** Finds the spot under a point of the city: returns find(x, y) → index in "points" or -1. points = [{ x, y }]. */
export function cityFinder(points, half = 0.5) {
  const cell = 1.6, grid = new Map();
  const key = (cx, cy) => cx * 100003 + cy;
  points.forEach((p, k) => { const c = key(Math.floor(p.x / cell), Math.floor(p.y / cell)); if (!grid.has(c)) grid.set(c, []); grid.get(c).push(k); });
  return (x, y) => {
    let best = -1, bd = Infinity;
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const k of grid.get(key(cx + dx, cy + dy)) || []) {
      const p = points[k], ax = Math.abs(x - p.x), ay = Math.abs(y - p.y);
      if (ax <= half && ay <= half + 0.08 && ax + ay < bd) { bd = ax + ay; best = k; }
    }
    return best;
  };
}

/**
 * A small house for the map, worked out from the same seed and style as the full picture: the walls, the roof, the door
 * and the windows where the real house has them, in a 0…1 box. level = nights in a row (0 = dark): as many windows glow
 * as on the real house.
 */
export function miniHouse(seed, family, wish = '', paint = '', level = 1) {
  const paintColor = paint ? itemOf(paint)?.color || '' : '';
  const h = houseOf(seed, family, { wish, paint: paintColor });
  const V = 600, lv = Math.max(0, Math.min(NIGHTS, level));
  const litCount = lv === 0 ? 0 : Math.max(1, Math.round((h.windows.length * lv) / NIGHTS));
  const lit = new Set(h.lightOrder.slice(0, litCount));
  const base = h.doorBox.y + h.doorBox.h;
  return {
    no: h.no, wall: h.wall, roof: h.roofCol, trim: h.trim, door: h.door,
    body: [h.x0 / V, h.top / V, h.w / V, (base - h.top) / V],
    cap: [(h.x0 - 8) / V, h.roofY / V, (h.w + 16) / V, (h.top - h.roofY) / V],
    doorBox: [h.doorBox.x / V, h.doorBox.y / V, h.doorBox.w / V, h.doorBox.h / V],
    windows: h.windows.map((w) => [(w.x - w.w / 2) / V, w.y / V, w.w / V, w.h / V, lit.has(w.id) ? 1 : 0]),
    ground: base / V,
  };
}
