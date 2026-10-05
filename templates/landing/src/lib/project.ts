// Loads everything that makes one site different from another:
// project config (texts, links, images), theme (style) and layout (which sections, in what order).
import fs from 'node:fs';
import path from 'node:path';

export const PROJECT = process.env.PROJECT || 'molty';

function readJson<T>(file: string, hint: string): T {
  if (!fs.existsSync(file)) throw new Error(`[${hint}] файл не найден: ${file}`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch (e) {
    throw new Error(`[${hint}] ошибка в JSON (лишняя/пропущенная запятая или кавычка): ${file}\n${e}`);
  }
}

export type Link = { label: string; url: string };
export type Config = {
  name: string;
  /** Short name for tight places like the header. Defaults to name. */
  shortName?: string;
  ticker: string;
  tagline: string;
  description: string;
  url?: string;
  chain: string;
  ca: string;
  theme: string;
  layout: string;
  links: { x?: string; telegram?: string; pumpfun?: string; dexscreener?: string };
  assets: { logo: string; favicon?: string; hero: string; og?: string; heroVideo?: string };
  hero: { kicker?: string; text: string };
  about: { kicker?: string; title: string; text: string[]; image?: string };
  howToBuy: { title: string; text: string }[];
  tokenomics: { supply: string; items: { label: string; value: string }[] };
  /** note = handwritten line on the back of the photo (layout "contract", section deskPhotos) */
  gallery: { src: string; alt: string; note?: string }[];
  roadmap: { phase: string; title: string; items: string[] }[];
  disclaimer: string;
  marquee?: string[];
  game?: {
    enabled: boolean; kicker?: string; title: string; digs: number; cols?: number; rows?: number;
    odds: { gold: number; gem: number; rug: number }; rugPenalty: number;
    stickers: { idle: string; gold: string; gem: string; rug: string };
    lines: { idle: string; gold: string; gem: string; rug: string; end: string };
    share: string;
  };
  /** Runner mini-game "Chase" (section chaseGame). All texts and sprites come from here. */
  chase?: {
    enabled: boolean; nav?: string; kicker?: string; title: string;
    sprites: { run: string[]; jump: string; crash: string; rival?: string; pickup: string; obstacles: string[] };
    lines: { start: string; hint: string; over: string; retry: string; share: string; score: string; pickups: string; best: string };
    shareText: string;
  };
  /** Catch mini-game "Feed" (section feedGame): the hero moves left and right and catches falling food. */
  feed?: {
    enabled: boolean; nav?: string; kicker?: string; title: string;
    /** Length of one round in seconds. Default 40. */
    seconds?: number;
    /** Unit shown after the score, e.g. "kg". */
    unit?: string;
    sprites: {
      open: string; chew: string; hit: string;
      /** Good things to catch: each adds "points" to the score. */
      food: { src: string; points: number }[];
      /** Things to dodge: take away points and/or seconds. */
      bad: { src: string; points?: number; seconds?: number }[];
    };
    lines: { start: string; hint: string; over: string; retry: string; share: string; score: string; time: string; best: string };
    shareText: string;
  };
  /** Timing mini-game "Stop" (section stopGame): the hero rides by himself, one tap brakes, stop exactly at the door. */
  stop?: {
    enabled: boolean; nav?: string; kicker?: string; title: string;
    /** Unit for distances, e.g. "m". */
    unit?: string;
    sprites: { ride: string; brake: string; eat: string; miss: string; door: string };
    lines: {
      start: string; hint: string; retry: string; share: string; score: string; best: string; speed: string; door: string;
      good: string; perfect: string; overPast: string; overShort: string; overNoBrake: string;
    };
    shareText: string;
  };
  /** Wording and data of the "delivery" layout (sections app*). See projects/goosini/project.config.json for a full example. */
  app?: Record<string, any>;
  /** Wording and data of the "press" layout (sections press*). See projects/inkmaxx/project.config.json for a full example. */
  press?: Record<string, any>;
  /** Meme maker "Studio" (section pressStudio): base picture, two-ink print filter, captions, stickers, download and share. */
  studio?: {
    enabled: boolean; nav?: string; kicker?: string; title: string; lead?: string;
    /** Ready-made base pictures (square). */
    templates: { src: string; alt: string }[];
    /** Stickers with a transparent background. The first "freeStickers" are open to everyone, the rest are shown as holder-only. */
    stickers: { src: string; alt: string }[];
    freeStickers?: number;
    /** Small tag printed in the corner of every sheet unless the holder preview is on. */
    watermark?: string;
    /** Ink colors of the print filter. Default: theme primary, secondary and accent on the theme background. */
    inks?: { first?: string; second?: string; third?: string; paper?: string };
    labels: Record<string, string>;
    shareText: string;
  };
  /** Mascot that grows while the page is scrolled (section bossGrow). */
  boss?: { sprite: string; label: string; unit: string; from: number; to: number; note?: string; dismiss?: string };
  /** Wording of the "contract" layout (sections paper*). See projects/fch/project.config.json for a full example. */
  paper?: Record<string, any>;
  /** Intro screen (section boot): lines appear one by one, then a start button. */
  boot?: { lines: string[]; button: string };
  /** Small wording and icons that differ from project to project. Every field is optional. */
  ui?: Partial<UI>;
  /** Shrink and recompress big images when copying brand/ to the site (see scripts/sync-assets.mjs). */
  images?: { optimize?: boolean; maxSize?: Record<string, number> };
  effects?: { reveal?: boolean; parallax?: boolean; cursor?: boolean; cursorIcon?: string; sparks?: boolean };
};
export type UI = {
  icon: string;            // separator in the running band and bullet in the roadmap
  iconImage: string;       // image used instead of icon (path inside brand/)
  playLabel: string;       // hero button that scrolls to the game (arcade hero)
  howToBuyKicker: string;
  tokenomicsKicker: string;
  galleryKicker: string;
  galleryTitle: string;
  roadmapKicker: string;
};
export type Theme = {
  name: string;
  /** Optional look on top of colors and fonts. "arcade" = pixel borders, hard shadows, square corners. */
  flavor?: string;
  colors: Record<'bg' | 'surface' | 'text' | 'muted' | 'primary' | 'onPrimary' | 'secondary' | 'accent', string>;
  fonts: {
    heading: string; body: string; googleFonts: string;
    /** Handwriting font for notes in the "paper" flavor. Optional. */
    hand?: string;
    /** Wide display fonts need smaller headings: 0.5 = half size. Default 1. */
    headingScale?: number;
    /** Line height for headings. Default: as designed in the sections. */
    headingLeading?: number;
    /** Smallest size a scaled heading may shrink to. Default ".75rem". */
    headingMin?: string;
    /** Body text multiplier for small-looking fonts: 1.375 = 22px base. Default 1. */
    bodyScale?: number;
    /** Which font the $TICKER uses. "heading" keeps the $ sign consistent with the title. Default "body". */
    ticker?: 'heading' | 'body';
  };
  radius: { button: string; card: string };
};
export type Layout = { name: string; sections: string[] };

const projectDir = path.resolve(process.cwd(), '../../projects', PROJECT);

export const config = readJson<Config>(path.join(projectDir, 'project.config.json'), 'config');
export const theme = readJson<Theme>(path.resolve('src/themes', `${config.theme}.json`), `theme "${config.theme}"`);
export const layout = readJson<Layout>(path.resolve('src/layouts', `${config.layout}.json`), `layout "${config.layout}"`);

/** URL of a project image (paths in the config are relative to projects/<name>/brand/) */
export const asset = (p?: string) => (p ? `/project/${p.toLowerCase()}` : '');

/** Project wording with defaults (the defaults are what Molty shipped with) */
export const ui: UI = {
  icon: '⛏',
  iconImage: '',
  playLabel: 'Play',
  howToBuyKicker: `Get your $${config.ticker}`,
  tokenomicsKicker: 'Simple and fair',
  galleryKicker: 'Fresh from the mine',
  galleryTitle: 'Gallery',
  roadmapKicker: 'Shift plan',
  ...config.ui,
};

/** Main "buy" link: pump.fun once the token exists, otherwise the How to buy section */
export const buyUrl = config.links.pumpfun || '#how-to-buy';
