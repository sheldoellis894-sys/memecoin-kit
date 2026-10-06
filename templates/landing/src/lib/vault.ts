// Helpers of the "vault" layout: every section is one lock of the door.
import { config } from './project';

export const vault: Record<string, any> = config.vault || {};
export const locks: { id: string; label: string; nav?: boolean | string }[] = vault.locks || [];
export const total = locks.length || 10;
/** Number of the lock (1-based) that belongs to the section with this id. */
export const lockNo = (id: string) => Math.max(1, locks.findIndex((l) => l.id === id) + 1);
export const pad = (n: number) => String(n).padStart(2, '0');
