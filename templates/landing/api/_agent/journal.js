// Where the issues are kept: one small JSON file in Vercel Blob, rewritten once a day.
// The token BLOB_READ_WRITE_TOKEN is added to the Vercel project when a Blob store is connected to it.
// The store is expected to be private (Vercel: Storage → Blob → Access "Private"). A public store must say so:
// BLOB_ACCESS=public in the Vercel project. The kind of store is never guessed: a wrong guess would read "no file yet"
// and the next write would erase the archive. Private is the default, so a store set up without the variable never
// puts the files (moderation log, bans) at an address anyone can open.
import { get, put, BlobPreconditionFailedError } from '@vercel/blob';

const KEEP = 90;                       // issues kept in the file
const accessOf = (env) => (String(env.BLOB_ACCESS || '').trim().toLowerCase() === 'public' ? 'public' : 'private');
const empty = () => ({ count: 0, issues: [] });

export const blobStore = {
  /** Text of the file, or null when it does not exist yet. */
  async read(env, path) {
    return (await this.readTagged(env, path)).text;
  },
  /** { text, etag } of the file, read from the storage itself (not from a cache); text null when there is no file yet. */
  async readTagged(env, path) {
    const res = await get(path, { access: accessOf(env), token: env.BLOB_READ_WRITE_TOKEN, useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return { text: null, etag: '' };
    return { text: await new Response(res.stream).text(), etag: res.blob?.etag || res.headers?.get?.('etag') || '' };
  },
  /**
   * opts.ifMatch: write only if the file still has this ETag. opts.create: write only if there is no file yet (two first
   * writes at the same moment: the second one is told). Either way a lost race is an error with code 'conflict'.
   */
  async write(env, path, body, opts = {}) {
    const create = Boolean(opts.create) && !opts.ifMatch;
    try {
      await put(path, body, { access: accessOf(env), token: env.BLOB_READ_WRITE_TOKEN, addRandomSuffix: false, allowOverwrite: !create,
        contentType: 'application/json; charset=utf-8', cacheControlMaxAge: 60, ...(opts.ifMatch ? { ifMatch: opts.ifMatch } : {}) });
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError) throw Object.assign(new Error('changed since read'), { code: 'conflict' });
      // a first write that failed because the file is there now: somebody else wrote it first, read it and try again
      if (create && (await this.readTagged(env, path).then((x) => x.text !== null, () => false))) throw Object.assign(new Error('created meanwhile'), { code: 'conflict' });
      throw e;
    }
  },
};

export const journalPath = (project) => `${project}/journal.json`;

/** Returns { count, issues, fresh }: fresh = the file does not exist yet. */
export async function readJournal(env, store = blobStore) {
  let raw;
  try { raw = await store.read(env, journalPath(env.PROJECT)); } catch { throw Object.assign(new Error('storage read failed'), { code: 'storage' }); }
  if (!raw) return { ...empty(), fresh: true };
  try {
    const j = JSON.parse(raw);
    const issues = Array.isArray(j?.issues) ? j.issues.filter((i) => i && typeof i.date === 'string' && Array.isArray(i.signs)) : [];
    return { count: Math.max(Number(j?.count) || 0, issues.length), issues, fresh: false };
  } catch { throw Object.assign(new Error('storage file is damaged'), { code: 'storage' }); }
}

async function write(env, store, data) {
  try { await store.write(env, journalPath(env.PROJECT), JSON.stringify({ ...data, updated: new Date().toISOString() })); }
  catch { throw Object.assign(new Error('storage write failed'), { code: 'storage' }); }
}

/** First run: an empty file is written before the model is called, so a storage problem costs nothing. */
export const openJournal = (env, store = blobStore) => write(env, store, empty());

/** Puts the issue first (replacing an issue of the same date) and saves the file. */
export async function saveIssue(env, journal, issue, store = blobStore) {
  const issues = [issue, ...journal.issues.filter((i) => i.date !== issue.date)].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, KEEP);
  const next = { count: Math.max(journal.count, issue.no), issues };
  await write(env, store, next);
  return next;
}
