// Helpers of the "lights" layout: the site is a night street; the owl brings fortune to the brightest house.
// Drawing and rules live in lights-kit.js (shared with the page scripts and api/street.js).
import { config, asset, theme } from './project';

/** The colours of the night inside the house pictures, from the theme ("lights": { "houseSky": [top, middle, bottom], "houseVeil": "#..." }). */
const tl: Record<string, any> = (theme as any).lights || {};
export const nightCtx = { sky: Array.isArray(tl.houseSky) ? tl.houseSky : null, veil: typeof tl.houseVeil === 'string' ? tl.houseVeil : null };

export const lights: Record<string, any> = (config as any).lights || {};
export const houseCfg: Record<string, any> = (config as any).house || {};
export const pictureCfg: Record<string, any> = (config as any).picture || {};
export const streetCfg: Record<string, any> = (config as any).street || {};

/** Owl pictures (transparent PNG): fly = in the sky, landed = on the roof with sunglasses and the sack. Empty = the drawn placeholder. */
export const owlImages = {
  fly: asset(houseCfg.owl?.fly),
  landed: asset(houseCfg.owl?.landed),
  sleep: asset(houseCfg.owl?.sleep),   // the owl that naps somewhere on the page every day ("Find the owl")
};

/** Names and notes of the decorations: the English words of the catalogue (lights-items.js), changed by config.house.items = { id: { name, note } }. */
import { ITEMS } from './lights-items.js';
export const itemNames: Record<string, { name: string; note: string }> = Object.fromEntries(
  Object.values(ITEMS as Record<string, any>).map((it) => [it.id, { name: it.name, note: it.note, ...(houseCfg.items?.[it.id] || {}) }]),
);
