// Builds src/styles/decor-truck.css: the Indian truck-art layer of the "lights" layout.
//   node scripts/build-decor-truck.mjs        (from templates/landing; rewrites src/styles/decor-truck.css)
// Every rule is scoped to html.decor-truck (theme.json "decor": "truck"), so other themes stay exactly as they are.
import fs from 'node:fs';
const OUT = process.argv[2] || new URL('../src/styles/decor-truck.css', import.meta.url);
const K = '#120A2A', R = '#E8343B', Y = '#FFD21F', G = '#16A34A', B = '#2453D6', P = '#FF4FA3', O = '#FF8A1F', W = '#FFF8E1', L = '#E5A82E';   // L: the number medallions, in the buttons' mustard
const url = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
const r = (n) => Math.round(n * 100) / 100;
const ring = (cx, cy, n, rad, f) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return f(r(cx + Math.cos(a) * rad), r(cy + Math.sin(a) * rad), (a * 180) / Math.PI, i); }).join('');

// marigold: two rings of petals and a yellow heart
const marigold = (cx, cy, s = 1) => ring(cx, cy, 12, 9 * s, (x, y) => `<circle cx="${x}" cy="${y}" r="${4.2 * s}" fill="${O}" stroke="${K}" stroke-width="${s}"/>`)
  + ring(cx, cy, 8, 5 * s, (x, y) => `<circle cx="${x}" cy="${y}" r="${3.4 * s}" fill="#FFB21F" stroke="${K}" stroke-width="${0.7 * s}"/>`)
  + `<circle cx="${cx}" cy="${cy}" r="${3.4 * s}" fill="${Y}" stroke="${K}" stroke-width="${s}"/>`;
const leaf = (cx, cy, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="3.2" transform="rotate(${rot} ${cx} ${cy})" fill="${G}" stroke="${K}" stroke-width="1.1"/>`;
const bell = (x, y) => `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y - 5}" stroke="${Y}" stroke-width="1.6" stroke-dasharray="2 1.4"/>
  <path d="M${x - 5.5} ${y + 6} Q${x - 5.5} ${y - 5} ${x} ${y - 5} Q${x + 5.5} ${y - 5} ${x + 5.5} ${y + 6} Z" fill="${Y}" stroke="${K}" stroke-width="1.3"/>
  <circle cx="${x}" cy="${y + 7.5}" r="1.9" fill="${O}" stroke="${K}" stroke-width="1"/>`;

// 1. bunting (jhalar) that hangs under the top bar
const flags = [R, Y, G, B].map((c, i) => { const x = i * 30; return `<path d="M${x + 1} 3 L${x + 29} 3 L${x + 15} 23 Z" fill="${c}" stroke="${K}" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="${x + 9}" cy="7.5" r="1.5" fill="${W}"/><circle cx="${x + 21}" cy="7.5" r="1.5" fill="${W}"/><circle cx="${x + 15}" cy="14" r="1.5" fill="${W}"/>
  <circle cx="${x + 15}" cy="25.5" r="2.6" fill="${i % 2 ? P : O}" stroke="${K}" stroke-width="1"/>`; }).join('');
const bunting = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="30" viewBox="0 0 120 30">${flags}<line x1="0" y1="2.5" x2="120" y2="2.5" stroke="${K}" stroke-width="2.5"/></svg>`;

// 2. painted band with marigolds, white dots and bells: the line between sections
const dots = (y) => Array.from({ length: 12 }, (_, i) => `<circle cx="${4 + i * 8}" cy="${y}" r="1.4" fill="${W}"/>`).join('');
const band = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="60" viewBox="0 0 96 60">
  ${bell(24, 44)}${bell(72, 44)}
  <rect x="0" y="4" width="96" height="28" fill="${K}"/><rect x="0" y="7" width="96" height="22" fill="${R}"/>
  ${dots(10.5)}${dots(25.5)}
  ${leaf(35, 18, -18)}${leaf(61, 18, 18)}${marigold(48, 18, 0.78)}
  <circle cx="0" cy="18" r="5" fill="${P}" stroke="${K}" stroke-width="1.2"/><circle cx="96" cy="18" r="5" fill="${P}" stroke="${K}" stroke-width="1.2"/>
  <circle cx="0" cy="18" r="1.8" fill="${W}"/><circle cx="96" cy="18" r="1.8" fill="${W}"/></svg>`;

// 3. one marigold (bullets, card corners)
const flower = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${marigold(16, 16, 1)}</svg>`;

// 4. scalloped medallion under a number
const medal = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  ${ring(32, 32, 14, 23, (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${L}" stroke="${K}" stroke-width="2.6"/>`)}
  <circle cx="32" cy="32" r="24" fill="${L}"/>
  <circle cx="32" cy="32" r="19.5" fill="none" stroke="${K}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0 4.6" opacity=".7"/></svg>`;

// 5. pointed Mughal arch: the mask and the painted frame (stretched to the box)
const ARCH = 'M0 125 L0 50 C0 31 20 20 36 12 C43 8.5 48 5 50 0 C52 5 57 8.5 64 12 C80 20 100 31 100 50 L100 125 Z';
const archMask = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" preserveAspectRatio="none"><path d="${ARCH}" fill="#000"/></svg>`;
const frame = (k) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" preserveAspectRatio="none"><g fill="none" stroke-linejoin="round" vector-effect="non-scaling-stroke">
  ${[[K, 32], [Y, 28], [K, 22], [R, 18], [K, 6]].map(([c, w]) => `<path d="${ARCH}" stroke="${c}" stroke-width="${w * k}" vector-effect="non-scaling-stroke"/>`).join('')}</g></svg>`;

// 6. crest over the top of the arch
const crest = `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="64" viewBox="0 0 110 64">
  ${leaf(30, 40, -30)}${leaf(80, 40, 30)}${leaf(20, 48, -8)}${leaf(90, 48, 8)}
  <circle cx="10" cy="54" r="3" fill="${W}" stroke="${K}"/><circle cx="100" cy="54" r="3" fill="${W}" stroke="${K}"/>
  <circle cx="34" cy="22" r="4" fill="${P}" stroke="${K}" stroke-width="1.2"/><circle cx="76" cy="22" r="4" fill="${P}" stroke="${K}" stroke-width="1.2"/>
  ${marigold(55, 34, 1.45)}</svg>`;

// 7. a big flower medallion behind the hero arch
const rosette = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  ${ring(200, 200, 28, 170, (x, y, a, i) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="11" transform="rotate(${r(a)} ${x} ${y})" fill="${i % 2 ? R : P}" stroke="${K}" stroke-width="3"/>`)}
  ${ring(200, 200, 40, 146, (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="${W}"/>`)}
  ${ring(200, 200, 20, 118, (x, y, a, i) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="12" transform="rotate(${r(a)} ${x} ${y})" fill="${i % 2 ? O : Y}" stroke="${K}" stroke-width="3"/>`)}
  ${ring(200, 200, 14, 80, (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="11" transform="rotate(${r(a)} ${x} ${y})" fill="${G}" stroke="${K}" stroke-width="3"/>`)}
  <circle cx="200" cy="200" r="52" fill="${B}" stroke="${K}" stroke-width="3"/>
  ${ring(200, 200, 18, 40, (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${W}"/>`)}
  <circle cx="200" cy="200" r="26" fill="${Y}" stroke="${K}" stroke-width="3"/></svg>`;

// 8. faint jaali lattice for the background
const jaali = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><g fill="none" stroke="${Y}" stroke-opacity=".07" stroke-width="1.4">
  <path d="M28 0 L56 28 L28 56 L0 28 Z"/><path d="M28 14 L42 28 L28 42 L14 28 Z"/></g>
  <g fill="${Y}" fill-opacity=".12"><circle cx="28" cy="0" r="2"/><circle cx="0" cy="28" r="2"/><circle cx="56" cy="28" r="2"/><circle cx="28" cy="56" r="2"/><circle cx="28" cy="28" r="2.4"/></g></svg>`;

const css = `/* =====================================================================
   Decor "truck": Indian truck-art painting over the "lights" layout (theme.json "decor": "truck").
   Generated by scripts/build-decor-truck.mjs, change it there and run it again. Every rule starts with html.decor-truck, other themes are not touched.
   Colours of the painting are fixed: red ${R}, yellow ${Y}, green ${G}, blue ${B}, pink ${P}, marigold ${O}.
   ===================================================================== */
html.decor-truck {
  --dt-red: ${R}; --dt-yellow: ${Y}; --dt-green: ${G}; --dt-blue: ${B}; --dt-pink: ${P}; --dt-dots: color-mix(in srgb, ${W} 82%, transparent);
  --dt-bunting: ${url(bunting)};
  --dt-band: ${url(band)};
  --dt-flower: ${url(flower)};
  --dt-medal: ${url(medal)};
  --dt-arch: ${url(archMask)};
  --dt-frame: ${url(frame(1))};
  --dt-frame-s: ${url(frame(0.62))};
  --dt-crest: ${url(crest)};
  --dt-rosette: ${url(rosette)};
  --dt-jaali: ${url(jaali)};
  scroll-padding-top: calc(var(--lt-bar-h) + 36px);
}

/* ---- Top bar: bunting hangs under it ---- */
html.decor-truck .lt-bar::after { content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 26px; background: var(--dt-bunting) 0 0 / 104px 26px repeat-x; pointer-events: none; }
html.decor-truck .lt-brand img { box-shadow: 0 0 0 2.5px var(--lt-ink), 0 0 0 5px var(--dt-red), 0 0 0 7px var(--lt-ink); }

/* ---- Painted band with bells between the sections ---- */
html.decor-truck .lt-sec { padding-top: calc(clamp(56px, 9vw, 112px) + 34px); }
html.decor-truck .lt-sec::before, html.decor-truck .lt-footer::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 60px; background: var(--dt-band) 0 0 / 96px 60px repeat-x; pointer-events: none; }
html.decor-truck .lt-street-strip { height: 60px; margin-top: 34px; opacity: 1; filter: none; background: var(--dt-band) 0 0 / 96px 60px repeat-x; }
html.decor-truck .lt-hero + .lt-sec::before { display: none; }
html.decor-truck .lt-hero + .lt-sec { padding-top: clamp(40px, 6vw, 80px); }

/* ---- Lettering: letters in the button colour with a black outline and a red painted shadow ---- */
html.decor-truck .lt-hero-title { color: var(--t-primary); letter-spacing: .02em;
  text-shadow: -3px -3px 0 var(--lt-ink), 3px -3px 0 var(--lt-ink), -3px 3px 0 var(--lt-ink), 3px 3px 0 var(--lt-ink), 0 -3px 0 var(--lt-ink), 0 3px 0 var(--lt-ink), -3px 0 0 var(--lt-ink), 3px 0 0 var(--lt-ink),
    6px 6px 0 var(--dt-red), 8px 8px 0 var(--dt-red), 10px 10px 0 var(--lt-ink), 0 0 50px color-mix(in srgb, var(--lt-glow) 45%, transparent); }
html.decor-truck .lt-hero-title::after { content: "उल्लू"; content: "उल्लू" / ""; display: inline-block; vertical-align: top; margin: .1em 0 0 .22em; padding: .14em .36em .02em; font-size: .3em; line-height: 1.25; letter-spacing: 0;
  color: var(--dt-yellow); background: var(--dt-red); border: 3px solid var(--lt-ink); border-radius: 10px; box-shadow: 4px 4px 0 var(--lt-ink); text-shadow: 2px 2px 0 var(--lt-ink); transform: rotate(-6deg); }
html.decor-truck .lt-hero-ticker { text-shadow: 2px 2px 0 var(--dt-red), 3px 3px 0 var(--lt-ink); }
html.decor-truck .lt-title { color: var(--lt-cream); text-shadow: 3px 3px 0 var(--dt-red), 5px 5px 0 var(--lt-ink); }
html.decor-truck :is(.lt-card, .lt-step, .lt-plan-card, .lt-setup, .lt-star-text) h3, html.decor-truck .lt-rules-title, html.decor-truck .lt-rules dt { text-shadow: 2px 2px 0 var(--dt-red); }

/* ---- Rubric: a painted ribbon with swallowtail ends ---- */
html.decor-truck .lt-kicker { width: fit-content; max-width: 100%; padding: .55em 1.5em .5em; color: var(--lt-cream); background-color: var(--dt-red);
  background-image: radial-gradient(circle, var(--dt-dots) 1.1px, transparent 1.6px), radial-gradient(circle, var(--dt-dots) 1.1px, transparent 1.6px);
  background-size: 8px 6px, 8px 6px; background-position: 0 0, 0 100%; background-repeat: repeat-x;
  clip-path: polygon(0 0, 100% 0, calc(100% - .75em) 50%, 100% 100%, 0 100%, .75em 50%); text-shadow: 1px 1px 0 var(--lt-ink); }
html.decor-truck :is(.lt-head.is-center, .lt-buy, .lt-gift-in, .lt-facade-top) .lt-kicker { margin-inline: auto; }

/* ---- Truck panels: black frame, a coloured stripe with white dots, a flower in the corners ---- */
html.decor-truck :is(.lt-card, .lt-step, .lt-plan-card, .lt-rules-strip, .lt-setup, .lt-star, .lt-rules div) {
  --s: var(--dt-red); position: relative; border: 3px solid var(--lt-ink); border-radius: 16px; padding: 28px 28px 26px;
  background: var(--lt-card) var(--dt-flower) right 13px top 13px / 17px no-repeat;
  box-shadow: inset 0 0 0 7px var(--s), inset 0 0 0 9.5px var(--lt-ink);
  outline: 2.4px dotted var(--dt-dots); outline-offset: -6.8px; }
html.decor-truck :is(.lt-card, .lt-step, .lt-plan-card, .lt-rules div):nth-child(3n + 2) { --s: var(--dt-blue); }
html.decor-truck :is(.lt-card, .lt-step, .lt-plan-card, .lt-rules div):nth-child(3n) { --s: var(--dt-green); }
html.decor-truck .lt-rules-strip { --s: var(--dt-blue); background-color: color-mix(in srgb, var(--t-surface) 70%, var(--t-bg)); }
html.decor-truck .lt-star { --s: var(--dt-green); }
html.decor-truck .lt-plan-card:first-child { box-shadow: inset 0 0 0 7px var(--s), inset 0 0 0 9.5px var(--lt-ink), 0 0 40px -12px color-mix(in srgb, var(--t-primary) 55%, transparent); }
html.decor-truck .lt-card-no { width: 58px; height: 58px; border: 0; border-radius: 0; background: var(--dt-medal) center / contain no-repeat; box-shadow: none; filter: drop-shadow(0 0 14px color-mix(in srgb, var(--t-primary) 45%, transparent)); }
html.decor-truck .lt-night-dot { width: 18px; height: 18px; border-radius: 0; background: var(--dt-flower) center / contain no-repeat; box-shadow: none; transform: translateY(3px); }
html.decor-truck .lt-plan-card li::marker { content: "✿ "; color: var(--dt-yellow); }

/* small boxes: a black frame and a row of dots inside */
html.decor-truck :is(.lt-stats div, .lt-more, .lt-box, .lt-story, .lt-ca) { border: 2.5px solid var(--lt-ink); border-radius: 12px; outline: 2px dotted color-mix(in srgb, var(--t-accent) 45%, transparent); outline-offset: -6px; }
html.decor-truck .lt-story { border-left: 6px solid var(--dt-red); }
html.decor-truck .lt-door-btn { border: 3px solid var(--lt-ink); border-radius: 14px; padding: 11px 11px 14px; box-shadow: inset 0 0 0 5px var(--s, var(--dt-red)), inset 0 0 0 7px var(--lt-ink); }
html.decor-truck .lt-door:nth-child(3n + 2) .lt-door-btn { --s: var(--dt-blue); }
html.decor-truck .lt-door:nth-child(3n) .lt-door-btn { --s: var(--dt-green); }
html.decor-truck .lt-door-btn:hover { border-color: var(--t-accent); }

/* ---- Hero: a pointed arch with a painted frame, a crest on top and a flower medallion behind ---- */
html.decor-truck .lt-hero-art { isolation: isolate; padding-top: 40px; }
html.decor-truck .lt-hero-art::before { content: ""; position: absolute; z-index: -1; left: 50%; top: -4%; width: 118%; aspect-ratio: 1; transform: translateX(-50%); background: var(--dt-rosette) center / contain no-repeat; opacity: .9; pointer-events: none; }
html.decor-truck.ul-motion .lt-hero-art::before { animation: dt-turn 140s linear infinite; }
@keyframes dt-turn { to { transform: translateX(-50%) rotate(1turn); } }
html.decor-truck .lt-hero-art::after { content: ""; position: absolute; left: 50%; top: 0; width: 150px; height: 88px; transform: translateX(-50%); background: var(--dt-crest) center / contain no-repeat; pointer-events: none; }
html.decor-truck .lt-arch { border: 0; border-radius: 0 0 18px 18px; box-shadow: none; -webkit-mask: var(--dt-arch) 0 0 / 100% 100% no-repeat; mask: var(--dt-arch) 0 0 / 100% 100% no-repeat; }
html.decor-truck .lt-arch::before { content: ""; position: absolute; inset: 0; z-index: 2; background: var(--dt-frame) 0 0 / 100% 100% no-repeat; pointer-events: none; }

/* gallery windows: the same arch, a thinner frame */
html.decor-truck .lt-window { position: relative; border: 0; border-radius: 0; background: transparent; box-shadow: none; overflow: visible; }
html.decor-truck .lt-window img, html.decor-truck .lt-window::after { -webkit-mask: var(--dt-arch) 0 0 / 100% 100% no-repeat; mask: var(--dt-arch) 0 0 / 100% 100% no-repeat; }
html.decor-truck .lt-window img { background: var(--lt-stage); }
html.decor-truck .lt-window::after { content: ""; position: absolute; inset: 0; background: var(--dt-frame-s) 0 0 / 100% 100% no-repeat; pointer-events: none; }
html.decor-truck .lt-window:hover { box-shadow: none; filter: drop-shadow(0 0 22px color-mix(in srgb, var(--t-primary) 55%, transparent)); }

/* ---- The house picture and the "Light a picture" canvas: a painted frame with white dots ---- */
html.decor-truck :is(.lt-stage-box, .lt-canvas) { border: 3px solid var(--t-accent); border-radius: 18px;
  box-shadow: 0 0 0 3px var(--lt-ink), 0 0 0 11px var(--dt-red), 0 0 0 14px var(--lt-ink), 0 30px 60px -30px rgb(0 0 0 / .8), 0 0 80px -10px color-mix(in srgb, var(--t-primary) 35%, transparent);
  outline: 3px dotted var(--dt-dots); outline-offset: 5.5px; }
html.decor-truck .lt-canvas:focus-visible { outline: 3px solid var(--t-accent); outline-offset: 18px; }

/* ---- Buttons: a row of painted dots inside ---- */
html.decor-truck .lt-btn { outline: 2px dotted color-mix(in srgb, var(--lt-ink) 50%, transparent); outline-offset: -7px; }
html.decor-truck .lt-btn-ghost { border-color: var(--t-secondary); outline-color: color-mix(in srgb, var(--t-secondary) 55%, transparent); }
html.decor-truck .lt-btn:focus-visible { outline: 3px solid var(--t-accent); outline-offset: 3px; }
html.decor-truck .lt-btn-small { outline-offset: -5px; }

/* ---- Background: a faint stone lattice (jaali) ---- */
html.decor-truck .lt-sec, html.decor-truck .lt-footer { background-image: var(--dt-jaali); background-size: 56px 56px; }

/* ---- Token board: a painted frame around the red board ---- */
html.decor-truck .lt-facade { border-radius: 18px; box-shadow: 0 0 0 3px var(--lt-ink), 0 0 0 12px var(--dt-blue), 0 0 0 15px var(--lt-ink), 0 40px 80px -40px rgb(0 0 0 / .8); outline: 3px dotted var(--dt-dots); outline-offset: 7.5px; }

/* ---- The last lamp: a turning flower medallion behind it ---- */
html.decor-truck .lt-big-diya { isolation: isolate; margin-top: 56px; margin-bottom: 40px; }
html.decor-truck .lt-big-diya::before { content: ""; position: absolute; z-index: -1; inset: -15%; border-radius: 50%; background: var(--dt-rosette) center / contain no-repeat; opacity: .85; pointer-events: none; }
html.decor-truck.ul-motion .lt-big-diya::before { animation: dt-spin 120s linear infinite; }
@keyframes dt-spin { to { transform: rotate(1turn); } }

/* ---- Footer: the band, and the sign every Indian lorry has on the back ---- */
html.decor-truck .lt-footer { position: relative; border-top: 0; padding-top: 96px; }
html.decor-truck .lt-footer-in::before { content: "LIGHT OK PLEASE"; content: "LIGHT OK PLEASE" / ""; justify-self: start; padding: .42em .9em .3em; font: 400 clamp(1.5rem, 5vw, 2.4rem)/1 var(--font-heading); letter-spacing: .05em;
  color: var(--dt-red); background: var(--dt-yellow); border: 3px solid var(--lt-ink); border-radius: 12px; box-shadow: inset 0 0 0 4px var(--dt-yellow), inset 0 0 0 6px var(--lt-ink), 5px 5px 0 var(--lt-ink);
  text-shadow: 2px 2px 0 var(--lt-ink); transform: rotate(-2deg); }

@media (max-width: 520px) {
  html.decor-truck .lt-bar::after { height: 20px; background-size: 80px 20px; }
  html.decor-truck :is(.lt-card, .lt-step, .lt-plan-card, .lt-rules-strip, .lt-setup, .lt-star, .lt-rules div) { padding: 24px 22px 22px; }
}
`;
fs.writeFileSync(OUT, css);
if (process.argv[3]) for (const [n, s] of Object.entries({ bunting, band, flower, medal, crest, rosette, frame: frame(1) })) fs.writeFileSync(`${process.argv[3]}/${n}.svg`, s);
console.log('ok', css.length);
