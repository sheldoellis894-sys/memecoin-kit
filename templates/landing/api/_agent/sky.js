// The real sky for a date: where the Sun, the Moon and the planets stand in the zodiac, which of them are retrograde,
// and the phase of the Moon. Low-precision formulas, good to a fraction of a degree for the years 1800–2050:
//   planets — Keplerian elements with linear rates (JPL "Approximate Positions of the Planets", Standish);
//   the Moon — the main periodic terms of its longitude (Meeus, simplified).
// From that sky a chart is drawn for every sign by whole-sign transits: which planets are in the sign,
// opposite it, square, trine or sextile to it, and whether the ruler of the sign is retrograde.
// Nothing here is random: the same date always gives the same sky and the same chart.

const RAD = Math.PI / 180;
const norm = (d) => ((d % 360) + 360) % 360;
const sin = (d) => Math.sin(d * RAD), cos = (d) => Math.cos(d * RAD);

export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const signName = (id) => cap(id);

// a (au), e, I, L, long. of perihelion, long. of node (degrees) at J2000 and their change per century
const ELEMENTS = {
  Mercury: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  Venus: [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  Earth: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
  Mars: [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  Jupiter: [[5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  Saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  Uranus: [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  Neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  Pluto: [[39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684], [-0.00031596, 0.0000517, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
};

/** Heliocentric position in the ecliptic of J2000, in au. */
function helio(name, T) {
  const [e0, rate] = ELEMENTS[name];
  const [a, e, I, L, peri, node] = e0.map((v, i) => v + rate[i] * T);
  const w = peri - node, M = norm(L - peri);
  let E = M + (e / RAD) * sin(M);
  for (let i = 0; i < 8; i++) E += (M - (E - (e / RAD) * sin(E))) / (1 - e * cos(E));
  const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
  return [
    (cos(w) * cos(node) - sin(w) * sin(node) * cos(I)) * xp + (-sin(w) * cos(node) - cos(w) * sin(node) * cos(I)) * yp,
    (cos(w) * sin(node) + sin(w) * cos(node) * cos(I)) * xp + (-sin(w) * sin(node) + cos(w) * cos(node) * cos(I)) * yp,
  ];
}

/** Geocentric ecliptic longitudes of date, in degrees, for a moment given in milliseconds. */
export function longitudes(ms) {
  const d = ms / 86400000 - 10957.5;          // days since J2000.0 (2000-01-01 12:00 TT; the minute of difference with UTC does not matter here)
  const T = d / 36525;
  const precession = 1.396971 * T;            // from the ecliptic of J2000 to the ecliptic of date
  const earth = helio('Earth', T);
  const out = { 'the Sun': norm(Math.atan2(-earth[1], -earth[0]) / RAD + precession) };
  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
    const p = helio(name, T);
    out[name] = norm(Math.atan2(p[1] - earth[1], p[0] - earth[0]) / RAD + precession);
  }
  const Lm = 218.316 + 13.176396 * d, Mm = 134.963 + 13.064993 * d, F = 93.272 + 13.22935 * d, D = 297.85 + 12.190749 * d, Ms = 357.529 + 0.98560028 * d;
  out['the Moon'] = norm(Lm + 6.289 * sin(Mm) + 1.274 * sin(2 * D - Mm) + 0.658 * sin(2 * D) + 0.214 * sin(2 * Mm) - 0.186 * sin(Ms) - 0.114 * sin(2 * F)
    + 0.059 * sin(2 * D - 2 * Mm) + 0.057 * sin(2 * D - Ms - Mm) + 0.053 * sin(2 * D + Mm) + 0.046 * sin(2 * D - Ms) - 0.041 * sin(Ms - Mm) - 0.035 * sin(D) - 0.03 * sin(Ms + Mm));
  return out;
}

export const BODIES = ['the Sun', 'the Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const PHASES = ['New Moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'Full Moon', 'waning gibbous', 'last quarter', 'waning crescent'];

/** The sky of a moment: every body with its sign, degree inside the sign and whether it is retrograde; the Moon with its phase. */
export function skyAt(ms) {
  const now = longitudes(ms), before = longitudes(ms - 43200000), after = longitudes(ms + 43200000);
  const bodies = BODIES.map((name) => {
    const lon = now[name]; const move = ((after[name] - before[name] + 540) % 360) - 180;
    return { name, sign: SIGNS[Math.floor(lon / 30)], degree: Math.floor(lon % 30), lon: Math.round(lon * 100) / 100, retrograde: name !== 'the Sun' && name !== 'the Moon' && move < 0 };
  });
  const elong = norm(now['the Moon'] - now['the Sun']);
  // new, quarters and full are named within 7 degrees of the exact moment (about half a day); the rest by the quarter they are in
  const exact = [0, 90, 180, 270].findIndex((a) => Math.min(Math.abs(elong - a), 360 - Math.abs(elong - a)) <= 7);
  const phase = exact >= 0 ? PHASES[exact * 2] : PHASES[Math.floor(elong / 90) * 2 + 1];
  return { bodies, moon: { sign: bodies[1].sign, phase, lit_pct: Math.round(((1 - cos(elong)) / 2) * 100) }, retrograde: bodies.filter((b) => b.retrograde).map((b) => b.name) };
}

// ---------- the chart: whole-sign transits ----------
const RULER = { aries: 'Mars', taurus: 'Venus', gemini: 'Mercury', cancer: 'the Moon', leo: 'the Sun', virgo: 'Mercury', libra: 'Venus', scorpio: 'Pluto', sagittarius: 'Jupiter', capricorn: 'Saturn', aquarius: 'Uranus', pisces: 'Neptune' };
const KIND = { 'the Sun': 'sun', 'the Moon': 'moon', Mercury: 'mercury', Venus: 'benefic', Jupiter: 'benefic', Mars: 'malefic', Saturn: 'malefic', Uranus: 'outer', Neptune: 'outer', Pluto: 'outer' };
// how much a body adds to or takes from the day of a sign, by its kind and by the aspect it makes to the sign
const WEIGHT = {
  conjunction: { benefic: 1.3, malefic: -1.4, sun: 1.2, moon: 1.0, mercury: 0.4, outer: -0.4 },
  opposition: { benefic: -0.3, malefic: -1.2, sun: -0.6, moon: -0.8, mercury: -0.5, outer: -0.3 },
  square: { benefic: -0.2, malefic: -1.0, sun: -0.5, moon: -0.7, mercury: -0.5, outer: -0.3 },
  trine: { benefic: 1.0, malefic: 0.2, sun: 0.6, moon: 0.7, mercury: 0.5, outer: 0.3 },
  sextile: { benefic: 0.6, malefic: 0, sun: 0.4, moon: 0.4, mercury: 0.3, outer: 0.2 },
};
// the slow outer planets are retrograde for almost half of every year: that is weather, not news
const SLOW = new Set(['Uranus', 'Neptune', 'Pluto']);
const ASPECT = { 0: 'conjunction', 6: 'opposition', 3: 'square', 9: 'square', 4: 'trine', 8: 'trine', 2: 'sextile', 10: 'sextile' };
const WORDS = { conjunction: 'in your sign', opposition: 'opposite your sign', square: 'square to your sign', trine: 'in trine to your sign', sextile: 'in sextile to your sign' };
const up = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const where = (b) => `${up(b.name)} is ${b.retrograde ? 'retrograde ' : ''}in ${signName(b.sign)}`;

/**
 * The chart of the day. For every sign: a score out of 10, the planet to blame and the real reason in one phrase.
 * mood = the colour of the market from -1 to 1 (market.js): the sky sets the shape of the day, the market shifts it up or down.
 */
export function drawChart(sky, mood = 0) {
  const blamed = new Map();
  const signs = SIGNS.map((id, i) => {
    let sum = 0; const hits = [];
    for (const b of sky.bodies) {
      const aspect = ASPECT[(SIGNS.indexOf(b.sign) - i + 12) % 12]; if (!aspect) continue;
      let v = WEIGHT[aspect][KIND[b.name]];
      if (b.retrograde && !SLOW.has(b.name)) v = v > 0 ? v * 0.5 : v * 1.3;   // a retrograde planet helps less and hurts more
      if (b.name === 'the Moon') v *= 0.55 + 0.45 * (1 - Math.abs(b.degree + 0.5 - 15) / 15);   // the Moon is strongest in the middle of a sign, so the chart moves every day
      sum += v; hits.push({ b, aspect, v });
    }
    const ruler = sky.bodies.find((b) => b.name === RULER[id]);
    const rulerBack = ruler.retrograde && !SLOW.has(ruler.name);
    if (ruler.retrograde) sum -= rulerBack ? 0.9 : 0.2;
    // who is to blame: the retrograde ruler first, then whoever takes the most away; on a day with nothing against the sign, whoever gives the most
    const worst = hits.filter((h) => h.v < 0).sort((a, b) => a.v - b.v)[0];
    const best = [...hits].sort((a, b) => b.v - a.v)[0];
    let planet, why;
    if (rulerBack && (!worst || worst.v > -1.3)) { planet = ruler.name; why = `${up(ruler.name)}, the ruler of ${signName(id)}, is retrograde in ${signName(ruler.sign)}`; }
    else if (worst) { planet = worst.b.name; why = `${where(worst.b)}, ${WORDS[worst.aspect]}`; }
    else if (best) { planet = best.b.name; why = `${where(best.b)}, ${WORDS[best.aspect]}`; }
    else { planet = ruler.name; why = `${up(ruler.name)}, the ruler of ${signName(id)}, is in ${signName(ruler.sign)} and looks the other way`; }
    blamed.set(planet, (blamed.get(planet) || 0) + 1);
    return { id, score: Math.max(1, Math.min(10, Math.round(5.6 + sum * 1.05 + mood * 2))), planet, why };
  });
  // the planet of the day: a retrograde inner planet makes the headline; then a New or Full Moon;
  // then the planet the Moon meets, squares or opposes most exactly today; otherwise whoever is blamed by most signs
  const retro = ['Mercury', 'Venus', 'Mars'].find((n) => sky.retrograde.includes(n));
  const moonDay = sky.moon.phase === 'New Moon' || sky.moon.phase === 'Full Moon';
  const moon = sky.bodies.find((b) => b.name === 'the Moon');
  const hard = sky.bodies.filter((b) => b.name !== 'the Moon' && b.name !== 'the Sun').map((b) => {
    const d = Math.abs(((b.lon - moon.lon + 540) % 360) - 180);                    // 0 = together, 180 = opposite
    const [orb, word] = [[d, 'meets'], [Math.abs(d - 90), 'is square to'], [Math.abs(d - 180), 'is opposite']].sort((x, y) => x[0] - y[0])[0];
    return { b, orb, word };
  }).sort((x, y) => x.orb - y.orb)[0];
  const most = [...blamed].sort((a, b) => b[1] - a[1])[0][0];
  let planet, reason;
  if (retro) { planet = retro; reason = where(sky.bodies.find((b) => b.name === retro)); }
  else if (moonDay) { planet = 'the Moon'; reason = `${sky.moon.phase} in ${signName(sky.moon.sign)}`; }
  else if (hard && hard.orb <= 10) { planet = hard.b.name; reason = `The Moon in ${signName(moon.sign)} ${hard.word} ${hard.b.name} in ${signName(hard.b.sign)}`; }
  else { planet = most; reason = `${where(sky.bodies.find((b) => b.name === most))} and is blamed by ${blamed.get(most)} of the twelve signs`; }
  return { planet, reason, signs };
}

/** The sky in a few plain lines for the page and for the model. */
export function skyLines(sky) {
  return sky.bodies.map((b) => (b.name === 'the Moon'
    ? `The Moon in ${signName(b.sign)}, ${sky.moon.phase}, ${sky.moon.lit_pct}% lit`
    : `${up(b.name)} in ${signName(b.sign)}${b.retrograde ? ', retrograde' : ''}`));
}
