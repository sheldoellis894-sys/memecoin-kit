// Helpers for the "contract" layout (paper sheets on a desk).
import { layout } from './project';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Tiny markup for texts in the config:
 *   [[text]]  → blacked-out text that opens on hover or tap
 *   ~~text~~  → text crossed out with a red pen
 *   {{text}}  → handwritten note in red pen
 */
export function rich(text: string): string {
  return esc(text)
    .replace(/\[\[(.+?)\]\]/g, '<span class="pp-redact" tabindex="0" role="button" aria-label="Blacked out. Activate to read.">$1</span>')
    .replace(/~~(.+?)~~/g, '<span class="pp-strike" data-pen>$1</span>')
    .replace(/\{\{(.+?)\}\}/g, '<span class="pp-pen" data-pen>$1</span>');
}

/** Sections that are printed as numbered sheets, in layout order. */
const SHEETS = ['paperCover', 'paperClauses', 'feedGame', 'paperDuties', 'paperPayroll', 'paperOrders', 'paperSign'];
const order = layout.sections.filter((s) => SHEETS.includes(s));
export const pageOf = (section: string) => ({ page: order.indexOf(section) + 1, pages: order.length });
