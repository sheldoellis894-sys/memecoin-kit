// Pictures of the street around the house (layout "lights"): what the seven nights add, and tonight's event.
// Returned in layers so houseSvg can put them in the right place:
//   sky   — behind the house (bats, a far moon of lanterns)
//   front — in front of the house, darkened by the night like the house (cat, chai cart, people, rickshaw)
//   light — things that glow, never darkened (lamps, sparklers, fireworks, eyes, headlights)
//   over  — weather over everything (rain, fog, dust)
import { VIEW, GROUND, rng, R, OUT, f1, neighbourBox } from './lights-houses.js';

const INK = '#141026';
const glowDot = (x, y, r, col = '#FFD36B', o = 0.85) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" opacity="${o}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 2.6)}" fill="${col}" opacity="${(o * 0.22).toFixed(2)}"/>`;
const person = (x, y, s, col, arm = 0) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><circle cy="-46" r="8" fill="${INK}"/><path d="M-10 -36h20l4 30h-28z" fill="${col}" stroke="${INK}" stroke-width="2"/><path d="M-6 -6v14M6 -6v14" stroke="${INK}" stroke-width="4"/>${arm ? `<path d="M8 -32l12 ${-arm}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>` : ''}</g>`;

function burst(x, y, r, col) {
  let s = '';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s += `<path d="M${f1(x + Math.cos(a) * r * 0.25)} ${f1(y + Math.sin(a) * r * 0.25)}L${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r)}" stroke="${col}" stroke-width="2.5" stroke-linecap="round" opacity=".9"/><circle cx="${f1(x + Math.cos(a) * r)}" cy="${f1(y + Math.sin(a) * r)}" r="2.6" fill="#FFF3C4"/>`; }
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.3)}" fill="${col}" opacity=".12"/>`;
}

// where small things can stand on the pavement: left of the house, right of it, or in front when there is no room
const spots = (h) => ({ left: Math.max(28, h.x0 - 52), right: Math.min(VIEW - 28, h.x0 + h.w + 52) });

function cat(h) {
  const x = Math.max(26, h.doorBox.x - 44), y = GROUND + 22;
  return {
    front: `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-10" rx="13" ry="11" fill="#2B2440"/><circle cx="0" cy="-26" r="9" fill="#2B2440"/><path d="M-8 -31l2 -10 5 6zM8 -31l-2 -10 -5 6z" fill="#2B2440"/><path d="M12 -6q14 -2 10 -18" stroke="#2B2440" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
    light: `<circle cx="${x - 3.5}" cy="${y - 27}" r="2" fill="#FFE066"/><circle cx="${x + 3.5}" cy="${y - 27}" r="2" fill="#FFE066"/>`,
  };
}
function chaiCart(h) {
  const { right, left } = spots(h);
  const x = right + 34 < VIEW ? right : left;
  const y = GROUND + 34;
  return {
    front: `<g transform="translate(${x} ${y})"><circle cx="-18" cy="0" r="9" fill="#3A2E2A" ${OUT}/><circle cx="18" cy="0" r="9" fill="#3A2E2A" ${OUT}/>` + R(-30, -34, 60, 28, '#B5651D', OUT) + R(-34, -38, 68, 6, '#7A4E2D', OUT) +
      `<path d="M-30 -38v-30M30 -38v-30" stroke="${INK}" stroke-width="3"/>` + R(-36, -74, 72, 8, '#E0218A', OUT) +
      `<path d="M4 -38v-10h14v10" fill="#B0B6C2" stroke="${INK}" stroke-width="2"/><path d="M8 -52q-4 -8 2 -14M14 -52q-4 -8 2 -14" stroke="#E8E8F0" stroke-width="2" fill="none" opacity=".7"/></g>`,
    light: glowDot(x - 12, y - 58, 4.5),
  };
}
function neighbourLights(h, level) {
  const b = neighbourBox(h, 1, level);
  if (b.w < 40) return { light: '' };
  const x1 = b.x1 + 4, x2 = Math.min(VIEW, b.x2), y = b.top + 4;
  let s = `<path d="M${x1} ${y}Q${f1((x1 + x2) / 2)} ${y + 18} ${x2} ${y}" stroke="${INK}" stroke-width="1.8" fill="none"/>`;
  const cols = ['#FF7AC8', '#7AF0FF', '#FFE47A', '#B6FF7A'];
  for (let i = 0; i <= 8; i++) { const t = i / 8, u = 1 - t, bx = u * u * x1 + 2 * u * t * ((x1 + x2) / 2) + t * t * x2, by = u * u * y + 2 * u * t * (y + 18) + t * t * y; s += glowDot(bx, by + 4, 3, cols[i % 4], 0.9); }
  return { light: s };
}
function sparklerKid(h, side = 'left') {
  const { left, right } = spots(h);
  const x = side === 'left' ? left : right, y = GROUND + 44;
  return { front: person(x, y, 0.6, '#5EC8F2', 18), light: glowDot(x + 14, y - 40, 3, '#FFF3B0', 1) + `<path d="M${x + 14} ${y - 46}l-3 -7M${x + 19} ${y - 41}l7 -3M${x + 9} ${y - 37}l-7 3M${x + 17} ${y - 35}l5 6" stroke="#FFF3B0" stroke-width="1.6"/>` };
}
function faces(h, level) {
  let s = '';
  for (const side of [0, 1]) for (const wd of neighbourBox(h, side, level).wins) if (wd.on) s += `<circle cx="${wd.x + 12}" cy="${wd.y + 20}" r="5" fill="${INK}" opacity=".75"/><path d="M${wd.x + 4} ${wd.y + 32}q8 -10 16 0z" fill="${INK}" opacity=".75"/>`;
  return { front: s };
}
function confetti(h) {
  const r = rng(h.seed ^ 0xc0f3), cols = ['#FF7AC8', '#7AF0FF', '#FFE47A', '#B6FF7A', '#FF9F1C'];
  let s = '';
  for (let i = 0; i < 46; i++) s += `<rect x="${f1(r() * VIEW)}" y="${f1(r() * 330)}" width="5" height="9" fill="${cols[i % 5]}" transform="rotate(${Math.round(r() * 180)} ${f1(r() * VIEW)} ${f1(r() * 330)})" opacity=".85"/>`;
  return { light: s };
}
const fireworks = (h, big) => {
  const r = rng(h.seed ^ (big ? 0xf1e : 0xf2e)), cols = ['#FF7AC8', '#7AF0FF', '#FFE47A', '#B6FF7A'];
  let s = '';
  const n = big ? 4 : 2;
  for (let i = 0; i < n; i++) { const x = big ? 70 + r() * 460 : (i ? 520 : 70) + r() * 20, y = big ? 50 + r() * 110 : 60 + r() * 40; s += burst(x, y, big ? 30 + r() * 22 : 14 + r() * 6, cols[i % 4]); }
  return { light: s };
};

// ---------------------------------------------------------------- tonight's event
const EVENT_SCENES = {
  fireworks: (h) => fireworks(h, true),
  rain: () => { let s = ''; const r = rng(77); for (let i = 0; i < 90; i++) { const x = r() * (VIEW + 80) - 40, y = r() * VIEW; s += `<path d="M${f1(x)} ${f1(y)}l-6 18" stroke="#9EC9FF" stroke-width="1.6" opacity=".55"/>`; } return { over: s + `<rect x="-400" y="${GROUND}" width="1400" height="60" fill="#5E7FC2" opacity=".18"/>` }; },
  fog: () => ({ over: `<defs><linearGradient id="ulfog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D2F0" stop-opacity="0"/><stop offset=".6" stop-color="#C9D2F0" stop-opacity=".28"/><stop offset="1" stop-color="#C9D2F0" stop-opacity=".5"/></linearGradient></defs><rect x="-400" y="180" width="1400" height="440" fill="url(#ulfog)"/>` }),
  dust: () => ({ over: `<rect x="-400" y="-400" width="1400" height="1400" fill="#D99A4E" opacity=".22"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M-20 ${300 + i * 50}q160 -30 320 0t320 0" stroke="#E8B67A" stroke-width="6" fill="none" opacity=".25"/>`).join('') }),
  powercut: () => ({}),   // handled by the house: the neighbours go dark
  wedding: (h) => {
    const cols = ['#E0218A', '#FF9F1C', '#FFC94A', '#2EC4B6', '#8F5CFF'];
    let front = '', light = '';
    for (let i = 0; i < 6; i++) { const x = 40 + i * 98, y = GROUND + 50; front += person(x, y, 0.7, cols[i % 5], i % 2 ? 20 : 0); if (i % 2) light += glowDot(x + 14, y - 46, 4.5, '#FFE47A', 1); }
    front += `<g transform="translate(${40 + 2 * 98} ${GROUND + 50}) scale(.7)"><path d="M14 -30a10 10 0 1 1 0.1 0" fill="#D4AF37" stroke="${INK}" stroke-width="2"/></g>`;
    return { front, light };
  },
  kite: (h) => { const x = h.x0 + h.w * 0.72, y = h.top - 26; return { front: `<path d="M${x} ${y - 26}l18 22-18 24-18-24z" fill="#FF3FA4" ${OUT}/><path d="M${x} ${y - 26}v46M${x - 18} ${y - 4}h36" stroke="${INK}" stroke-width="1.5"/><path d="M${x} ${y + 20}q10 16 -4 28t6 26" stroke="#FFC94A" stroke-width="2.5" fill="none"/>` }; },
  skylanterns: () => { const r = rng(5); let s = ''; for (let i = 0; i < 9; i++) { const x = 40 + r() * 520, y = 40 + r() * 150; s += `<rect x="${f1(x - 5)}" y="${f1(y - 7)}" width="10" height="13" rx="4" fill="#FFB52E"/>` + glowDot(x, y, 4, '#FFD36B', 0.7); } return { light: s }; },
  shootingstar: () => ({ light: `<path d="M120 40L250 110" stroke="#FFF3C4" stroke-width="2.5" opacity=".75" stroke-linecap="round"/>` + glowDot(250, 110, 4, '#FFFFFF', 1) }),
  rickshaw: (h) => {
    const { right, left } = spots(h); const x = right + 40 < VIEW ? right - 6 : left + 6, y = GROUND + 40;
    return {
      front: `<g transform="translate(${x} ${y})"><circle cx="-24" cy="0" r="9" fill="#222" ${OUT}/><circle cx="22" cy="0" r="9" fill="#222" ${OUT}/><path d="M-36 -6v-34q0 -16 22 -16h26q20 0 24 20l6 30z" fill="#2E8B57" ${OUT}/><path d="M-30 -40q0 -10 16 -10h22v28h-38z" fill="#FFD23F" ${OUT}/></g>`,
      light: glowDot(x + 38, y - 16, 4, '#FFFFFF', 1) + `<path d="M${x + 40} ${y - 16}l60 -6v18z" fill="#FFF3C4" opacity=".18"/>`,
    };
  },
  monkey: (h) => { const x = h.x0 + 26, y = h.top - 4; return { front: `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-12" rx="10" ry="13" fill="#6B4A2E"/><circle cx="0" cy="-30" r="9" fill="#6B4A2E"/><circle cx="0" cy="-28" r="5" fill="#C9A27A"/><path d="M8 -4q22 4 14 26" stroke="#6B4A2E" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-8 -14l-12 -8" stroke="#6B4A2E" stroke-width="4" stroke-linecap="round"/></g>`, light: glowDot(x - 22, y - 24, 5, '#FFE47A', 1) }; },
  goat: (h) => { const { left } = spots(h); const x = left, y = GROUND + 40; return { front: `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-16" rx="18" ry="11" fill="#E8E2D6" ${OUT}/><path d="M14 -22l10 -12 6 4-4 12z" fill="#E8E2D6" ${OUT}/><path d="M22 -34l-4 -8M26 -32l2 -8" stroke="${INK}" stroke-width="2"/><path d="M-12 -6v10M-4 -6v10M6 -6v10M12 -6v10" stroke="${INK}" stroke-width="3"/></g>` }; },
  tv: (h) => { let light = ''; for (const side of [0, 1]) neighbourBox(h, side, 7).wins.filter((_, i) => i % 3 === 1).forEach((wd) => { light += R(wd.x, wd.y, wd.w, wd.h, '#6FC3FF', 'rx="3" opacity=".75"'); }); return { light }; },
  market: (h) => {
    const { left } = spots(h); const x = left, y = GROUND + 40;
    let light = ''; for (let i = 0; i < 4; i++) light += glowDot(x - 30 + i * 20, y - 66, 3, '#FFE47A', 1);
    return { front: `<g transform="translate(${x} ${y})"><path d="M-36 -2v-62M36 -2v-62" stroke="${INK}" stroke-width="3"/><path d="M-42 -64h84l-8 14h-68z" fill="#FFFFFF" ${OUT}/><path d="M-30 -64l-4 14M-12 -64l-3 14M6 -64l-2 14M24 -64l-1 14" stroke="#E0218A" stroke-width="7"/>` + R(-34, -26, 68, 22, '#7A4E2D', OUT) + `<circle cx="-18" cy="-30" r="6" fill="#FF9F1C" ${OUT}/><circle cx="-4" cy="-30" r="6" fill="#9BE564" ${OUT}/><circle cx="10" cy="-30" r="6" fill="#FF5D73" ${OUT}/></g>`, light };
  },
  bats: () => { const r = rng(13); let s = ''; for (let i = 0; i < 5; i++) { const x = 60 + r() * 480, y = 70 + r() * 100; s += `<path d="M${f1(x)} ${f1(y)}q-8 -8 -16 -2q6 0 8 6q4 -4 8 -4q4 0 8 4q2 -6 8 -6q-8 -6 -16 2z" fill="#0B0820"/>`; } return { sky: s }; },
  colors: (h) => { const r = rng(h.seed ^ 0x401); const cols = ['#FF3FA4', '#2EC4B6', '#FFE47A', '#8F5CFF', '#FF7A00']; let s = ''; for (let i = 0; i < 9; i++) s += `<circle cx="${f1(h.x0 + r() * h.w)}" cy="${f1(h.top + 30 + r() * (GROUND - h.top - 60))}" r="${f1(14 + r() * 22)}" fill="${cols[i % 5]}" opacity=".45"/>`; return { front: s }; },
  camel: (h) => { const { right } = spots(h); const x = Math.min(right, VIEW - 50), y = GROUND + 40; return { front: `<g transform="translate(${x} ${y})"><path d="M-30 -4v-24q0 -14 12 -18q8 -12 16 0q6 -10 14 -2q4 6 6 14l10 -20q4 -6 10 -4l2 10-6 4-8 24v16" fill="#C9A26B" stroke="${INK}" stroke-width="2.5"/><path d="M-26 -4v8M-14 -4v8M14 -4v8M24 -4v8" stroke="${INK}" stroke-width="3"/></g>` }; },
};

/**
 * The street around the house. level: nights in a row shown (0…7); event: tonight's scene id ('' for none).
 * Story: night 2 a cat moves in, night 3 a chai cart, night 4 the neighbours hang lights, night 5 far fireworks and a kid
 * with a sparkler, night 6 faces in every window, night 7 the street celebrates.
 */
export function streetScene(h, level, event = '') {
  const out = { sky: '', front: '', light: '', over: '' };
  const add = (part) => { if (!part) return; for (const k of Object.keys(out)) if (part[k]) out[k] += part[k]; };
  if (level >= 2) add(cat(h));
  if (level >= 3) add(chaiCart(h));
  if (level >= 4) add(neighbourLights(h, level));
  if (level >= 5) { add(fireworks(h, false)); add(sparklerKid(h, h.doorBox.x - 44 > 80 ? 'right' : 'left')); }
  if (level >= 6) add(faces(h, level));
  if (level >= 7) { add(fireworks(h, true)); add(confetti(h)); }
  if (event && EVENT_SCENES[event]) add(EVENT_SCENES[event](h));
  return out;
}
