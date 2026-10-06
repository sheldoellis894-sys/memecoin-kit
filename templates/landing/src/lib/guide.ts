// Helpers of the "guide" layout: the site is a restaurant guide, every section is a page of it.
import { config } from './project';

export const guide: Record<string, any> = config.guide || {};
export const pages: { id: string; label: string; icon?: string; nav?: boolean }[] = guide.pages || [];
export const total = pages.length || 1;
/** Page number (1-based) of the section with this id. */
export const pageNo = (id: string) => Math.max(1, pages.findIndex((p) => p.id === id) + 1);
export const pad = (n: number) => String(n).padStart(2, '0');
