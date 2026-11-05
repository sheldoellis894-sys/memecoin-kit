// Where small JSON files live, on any hosting. One interface: read(env, path) → text or null; write(env, path, text).
//
//   Vercel:          a Blob store is connected → BLOB_READ_WRITE_TOKEN is set → Vercel Blob (see journal.js).
//   Own server/VPS:  STORE=file and DATA_DIR=/path/to/folder → plain files on the disk of the server.
//
// STORE=blob or STORE=file picks the store by hand; without it the store is chosen from what is set.
// Files are written to a temporary name first and then renamed, so a crash never leaves half a file,
// and writes to one file wait for each other inside one server process.
import fs from 'node:fs/promises';
import path from 'node:path';

const queues = new Map();
/** Runs fn after the previous job for the same key has finished (read-change-write without losing updates). */
export function serial(key, fn) {
  const prev = queues.get(key) || Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  const tail = next.then(() => {}, () => {});   // the queue goes on after a failed job; the caller still gets the error
  queues.set(key, tail);
  tail.then(() => { if (queues.get(key) === tail) queues.delete(key); });
  return next;
}

const safePath = (dir, p) => {
  const full = path.resolve(dir, p);
  if (!full.startsWith(path.resolve(dir) + path.sep)) throw new Error('path outside DATA_DIR');
  return full;
};

export const fileStore = {
  async read(env, p) {
    try { return await fs.readFile(safePath(env.DATA_DIR || 'data', p), 'utf8'); }
    catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  },
  async write(env, p, body) {
    const full = safePath(env.DATA_DIR || 'data', p);
    await fs.mkdir(path.dirname(full), { recursive: true });
    const tmp = `${full}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, body, 'utf8');
    await fs.rename(tmp, full);
  },
};

/** Which kind of store this deployment has: 'blob', 'file' or '' (none, the feature is off). */
export function storeKind(env) {
  if (env.STORE === 'file' || env.STORE === 'blob') return env.STORE === 'blob' && !env.BLOB_READ_WRITE_TOKEN ? '' : env.STORE;
  if (env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (env.DATA_DIR) return 'file';
  return '';
}

/** The store object for this deployment. The Blob package is loaded only when Blob is used. */
export async function storeFor(env) {
  const kind = storeKind(env);
  if (kind === 'file') return fileStore;
  if (kind === 'blob') return (await import('./journal.js')).blobStore;
  return null;
}
