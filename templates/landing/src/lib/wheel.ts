// Helpers of the "wheel" layout: the site is a zodiac wheel, the tool is a horoscope written by an agent on a schedule.
import { config } from './project';

export const wheel: Record<string, any> = config.wheel || {};
export const issueCfg: Record<string, any> = (config as any).issue || {};

export type Sign = { id: string; name: string; from: [number, number]; to: [number, number]; glyph: string };
/** The twelve signs: dates as [month, day], glyphs as SVG path data for a 24×24 box (drawn with a round stroke). */
export const SIGNS: Sign[] = [
  { id: 'aries', name: 'Aries', from: [3, 21], to: [4, 19], glyph: 'M12 21V9M12 9c0-4-2-6-4.5-6S3 5 3 7.5M12 9c0-4 2-6 4.5-6S21 5 21 7.5' },
  { id: 'taurus', name: 'Taurus', from: [4, 20], to: [5, 20], glyph: 'M4 3c1.500 4.500 4.500 6 8 6s6.500-1.500 8-6M12 21a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z' },
  { id: 'gemini', name: 'Gemini', from: [5, 21], to: [6, 20], glyph: 'M4 4c5 2.500 11 2.500 16 0M4 20c5-2.500 11-2.500 16 0M9 5.600v12.800M15 5.600v12.800' },
  { id: 'cancer', name: 'Cancer', from: [6, 21], to: [7, 22], glyph: 'M4 9.500C6 5 15 3.500 20.500 7M20 14.500C18 19 9 20.500 3.500 17M7 12.500a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM17 17.500a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z' },
  { id: 'leo', name: 'Leo', from: [7, 23], to: [8, 22], glyph: 'M7 17a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM9.800 13c.400-3-1.800-4-1.800-7a5 5 0 0 1 10 0c0 5-4 8-4 12c0 2.500 2.500 3.500 5 1.500' },
  { id: 'virgo', name: 'Virgo', from: [8, 23], to: [9, 22], glyph: 'M3 5c1.500 0 2.500 1 2.500 3v11M5.500 8c0-4 5-4 5 0v11M10.500 8c0-4 5-4 5 0v8c0 3 2 5 5 5M15.500 12c3-3 6.500-1 5.500 3s-5 6-8 6.500' },
  { id: 'libra', name: 'Libra', from: [9, 23], to: [10, 22], glyph: 'M3 20h18M3 15h5.200a5.500 5.500 0 1 1 7.600 0H21' },
  { id: 'scorpio', name: 'Scorpio', from: [10, 23], to: [11, 21], glyph: 'M3 5c1.500 0 2.500 1 2.500 3v11M5.500 8c0-4 5-4 5 0v11M10.500 8c0-4 5-4 5 0v8.500c0 2 1 2.500 3 2.500h2.500M18.500 16.500L21 19l-2.500 2.500' },
  { id: 'sagittarius', name: 'Sagittarius', from: [11, 22], to: [12, 21], glyph: 'M4 20L20 4M11.500 4H20v8.500M6.500 11l6.500 6.500' },
  { id: 'capricorn', name: 'Capricorn', from: [12, 22], to: [1, 19], glyph: 'M3 5c2 0 3.500 2 3.500 6v8M6.500 11c0-4 1.500-6 3.500-6s3.500 2 3.500 6v5.500a3.200 3.200 0 1 0 3.200-3.200c-2 0-3.200 2-3.200 5c0 1.500-1 2.500-2.500 2.700' },
  { id: 'aquarius', name: 'Aquarius', from: [1, 20], to: [2, 18], glyph: 'M3 10l3-3l3 3l3-3l3 3l3-3l3 3M3 17l3-3l3 3l3-3l3 3l3-3l3 3' },
  { id: 'pisces', name: 'Pisces', from: [2, 19], to: [3, 20], glyph: 'M5 3c4.500 5 4.500 13 0 18M19 3c-4.500 5-4.500 13 0 18M4 12h16' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dates = (s: Sign) => `${MONTHS[s.from[0] - 1]} ${s.from[1]} – ${MONTHS[s.to[0] - 1]} ${s.to[1]}`;
/** What the page scripts need about the signs. Optional pictures come from config.wheel.signImages = { aries: "path", … }. */
export const signData = SIGNS.map((s) => ({ id: s.id, name: s.name, from: s.from, to: s.to, dates: dates(s), glyph: s.glyph }));
