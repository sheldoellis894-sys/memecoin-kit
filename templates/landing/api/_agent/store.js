// Where small JSON files live, on any hosting. One interface: read(env, path) → text or null; write(env, path, text).
//
//   Vercel:          a Blob store is connected → BLOB_READ_WRITE_TOKEN is set (older stores), or BLOB_STORE_ID is set and
//                    the function signs in with Vercel's own OIDC token (new stores) → Vercel Blob (see journal.js).
//   Own server/VPS:  STORE=file and DATA_DIR=/path/to/folder → plain files on the disk of the server.
//
// STORE=blob or STORE=file picks the store by hand; without it the store is chosen from what is set.
// Files are written to a temporary name first and then renamed, so a crash never leaves half a file,
// and writes to one file wait for each other inside one server process.
// update() is the one way to change a file: on an own server the changes of one file wait for each other (one process);
// on Vercel, where several copies of a function may run at once, a change is written only if nobody wrote the file
// since it was read (Blob ETag), otherwise it is read and made again. So two posts at the same moment never undo each other.
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
  const blob = Boolean(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID);
  if (env.STORE === 'file' || env.STORE === 'blob') return env.STORE === 'blob' && !blob ? '' : env.STORE;
  if (blob) return 'blob';
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

/** Thrown by update() when the file kept changing under it: the caller answers "busy" and the visitor tries again. */
export class Busy extends Error { constructor() { super('the file kept changing'); this.code = 'busy'; } }

/**
 * Reads a file, lets change(text) work out the new text and writes it. change returns { text, result }:
 * text = the new file (null = nothing to write), result = what update() returns. change may run more than once
 * (when another copy of the function wrote the file in between), so it must not have side effects of its own.
 */
export function update(env, store, p, change, tries = 5) {
  return serial(p, async () => {
    for (let i = 0; i < tries; i++) {
      if (typeof store.readTagged !== 'function') {          // a plain store (own server, tests): the queue above is enough
        const out = await change(await store.read(env, p));
        if (out.text !== null && out.text !== undefined) await store.write(env, p, out.text);
        return out.result;
      }
      const { text, etag } = await store.readTagged(env, p);
      const out = await change(text);
      if (out.text === null || out.text === undefined) return out.result;
      try { await store.write(env, p, out.text, { ifMatch: etag || undefined, create: !etag }); return out.result; }
      catch (e) { if (e?.code !== 'conflict') throw e; }
    }
    throw new Busy();
  });
}
