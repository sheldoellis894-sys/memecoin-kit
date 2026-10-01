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
  ticker: string;
  tagline: string;
  description: string;
  url?: string;
  chain: string;
  ca: string;
  theme: string;
  layout: string;
  links: { x?: string; telegram?: string; pumpfun?: string; dexscreener?: string };
  assets: { logo: string; favicon?: string; hero: string; og?: string };
  hero: { kicker?: string; text: string };
  about: { title: string; text: string[]; image?: string };
  howToBuy: { title: string; text: string }[];
  tokenomics: { supply: string; items: { label: string; value: string }[] };
  gallery: { src: string; alt: string }[];
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
  effects?: { reveal?: boolean; parallax?: boolean; cursor?: boolean; sparks?: boolean };
};
export type Theme = {
  name: string;
  colors: Record<'bg' | 'surface' | 'text' | 'muted' | 'primary' | 'onPrimary' | 'secondary' | 'accent', string>;
  fonts: { heading: string; body: string; googleFonts: string };
  radius: { button: string; card: string };
};
export type Layout = { name: string; sections: string[] };

const projectDir = path.resolve(process.cwd(), '../../projects', PROJECT);

export const config = readJson<Config>(path.join(projectDir, 'project.config.json'), 'config');
export const theme = readJson<Theme>(path.resolve('src/themes', `${config.theme}.json`), `theme "${config.theme}"`);
export const layout = readJson<Layout>(path.resolve('src/layouts', `${config.layout}.json`), `layout "${config.layout}"`);

/** URL of a project image (paths in the config are relative to projects/<name>/brand/) */
export const asset = (p?: string) => (p ? `/project/${p.toLowerCase()}` : '');

/** Main "buy" link: pump.fun once the token exists, otherwise the How to buy section */
export const buyUrl = config.links.pumpfun || '#how-to-buy';
