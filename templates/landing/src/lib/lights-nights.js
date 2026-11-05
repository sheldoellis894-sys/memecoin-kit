// What happens on the street each night (layout "lights"): the seven-night story and the random night events.
// Rules only: the words of every event live in the project config (house.events, house.story), so an event without
// words in the config never happens. Plain JavaScript, used by lights-kit.js.
//
// An event is picked once per lit night from the house seed and the date, so reloading the page never changes it.
// when(ctx): may it happen tonight. w: weight. bonus: items added. double: the owl's gift comes twice.
// loan: the item is borrowed for a night and comes back on the next lit night. scene: a picture on the street tonight.
import { rng } from './lights-houses.js';

/** Fixed dates (local calendar). A holiday event wins over everything else on its night. */
export const HOLIDAYS = [
  { id: 'diwali', dates: ['2026-11-08', '2027-10-29', '2028-10-17'] },
  { id: 'holi', dates: ['2027-03-22', '2028-03-11'] },
  { id: 'lunar', dates: ['2027-02-05', '2027-02-06', '2028-01-25', '2028-01-26'] },
  { id: 'newyear', md: ['12-31', '01-01'] },
];
export function holidayOf(dayKey) {
  const md = dayKey.slice(5);
  for (const hd of HOLIDAYS) if ((hd.dates || []).includes(dayKey) || (hd.md || []).includes(md)) return hd.id;
  return '';
}

export const EVENTS = [
  // holidays
  { id: 'diwali', w: 1000, when: (c) => c.holiday === 'diwali', bonus: 2, scene: 'fireworks' },
  { id: 'holi', w: 1000, when: (c) => c.holiday === 'holi', bonus: { marigold: 1, rangoli: 1 }, scene: 'colors' },
  { id: 'lunar', w: 1000, when: (c) => c.holiday === 'lunar', bonus: { lantern: 2 }, scene: 'fireworks' },
  { id: 'newyear', w: 1000, when: (c) => c.holiday === 'newyear', bonus: { string: 1 }, scene: 'fireworks' },
  // the real sky and the real clock
  { id: 'fullmoon', w: 60, when: (c) => Math.abs(c.moon - 0.5) < 0.035, double: true },
  { id: 'newmoon', w: 60, when: (c) => c.moon < 0.035 || c.moon > 0.965, bonus: { diya: 1 } },
  { id: 'latenight', w: 14, when: (c) => c.hour >= 0 && c.hour < 5, bonus: { feather: 1 } },
  { id: 'early', w: 4, when: (c) => c.hour >= 16 && c.hour < 19 },
  { id: 'weekend', w: 5, when: (c) => c.weekday === 5 || c.weekday === 6, scene: 'fireworks' },
  { id: 'neighbour', w: 6, when: (c) => c.neighbour },
  // the street
  { id: 'powercut', w: 4, scene: 'powercut' },
  { id: 'rain', w: 3, when: (c) => c.family !== 'jaisalmer', scene: 'rain' },
  { id: 'monsoon', w: 6, when: (c) => c.family !== 'jaisalmer' && c.month >= 6 && c.month <= 9, scene: 'rain' },
  { id: 'fog', w: 4, when: (c) => c.month >= 11 || c.month <= 2, scene: 'fog' },
  { id: 'wedding', w: 3, bonus: { marigold: 1 }, scene: 'wedding' },
  { id: 'kite', w: 2, scene: 'kite' },
  { id: 'skylanterns', w: 3, bonus: { lantern: 1 }, scene: 'skylanterns' },
  { id: 'shootingstar', w: 2, bonus: { feather: 1 }, scene: 'shootingstar' },
  { id: 'rickshaw', w: 3, scene: 'rickshaw' },
  { id: 'monkey', w: 3, when: (c) => c.freeLoan, loan: true, scene: 'monkey' },
  { id: 'goat', w: 2, scene: 'goat' },
  { id: 'cricket', w: 3, scene: 'tv' },
  { id: 'market', w: 3, when: (c) => c.family !== 'goa', scene: 'market' },
  { id: 'bats', w: 2, scene: 'bats' },
  { id: 'jealous', w: 3, when: (c) => c.streak >= 3 },
  { id: 'counting', w: 2, when: (c) => c.count >= 3 },
  { id: 'owllate', w: 2 },
  { id: 'selfie', w: 1, when: (c) => c.streak >= 2 },
  { id: 'wronghouse', w: 2, when: (c) => c.streak <= 2 },
  { id: 'chaiflood', w: 2, when: (c) => c.streak >= 3 },
  { id: 'tourists', w: 3, when: (c) => ['haveli', 'jaisalmer', 'goa'].includes(c.family) },
  { id: 'society', w: 4, when: (c) => c.family === 'mumbai' },
  { id: 'carrom', w: 3 },
  { id: 'scooters', w: 3, when: (c) => ['mumbai', 'kolkata'].includes(c.family) },
  { id: 'tram', w: 4, when: (c) => c.family === 'kolkata' },
  { id: 'adda', w: 4, when: (c) => c.family === 'kolkata' },
  { id: 'fishermen', w: 4, when: (c) => c.family === 'goa' },
  { id: 'sandstorm', w: 4, when: (c) => c.family === 'jaisalmer', scene: 'dust' },
  { id: 'camel', w: 3, when: (c) => ['haveli', 'jaisalmer'].includes(c.family), scene: 'camel' },
  { id: 'quiet', w: 1 },
];
export const EVENT_IDS = EVENTS.map((e) => e.id);
export const SCENE_IDS = ['fireworks', 'colors', 'powercut', 'rain', 'fog', 'wedding', 'kite', 'skylanterns', 'shootingstar', 'rickshaw', 'monkey', 'goat', 'tv', 'market', 'bats', 'dust', 'camel'];

const hash = (str) => { let x = 2166136261; for (const ch of str) x = Math.imul(x ^ ch.charCodeAt(0), 16777619); return x >>> 0; };

/**
 * Tonight's event for a house. ctx: { day, hour, weekday, month, moon, family, streak, count, neighbour, freeLoan,
 * allowed (event ids that have words in the config) }. Returns an EVENTS entry or null.
 */
export function pickEvent(seed, ctx) {
  const ok = EVENTS.filter((e) => (!ctx.allowed || ctx.allowed.includes(e.id)) && (!e.when || e.when(ctx)));
  if (!ok.length) return null;
  const r = rng((seed ^ hash(ctx.day)) >>> 0);
  const total = ok.reduce((s, e) => s + e.w, 0);
  let x = r() * total;
  for (const e of ok) { x -= e.w; if (x < 0) return e; }
  return ok[ok.length - 1];
}
