// Vercel Function behind the "Morning issue" tool (section wheelIssue): the reading side.
// GET → { live, build, hour, issues } — the latest issues of the horoscope, newest first.
// Visitors send nothing here. The issues are written by api/issue-run.js on a schedule.
//
// It answers only for projects that have an oracle in api/_agent/oracle.js (env PROJECT).
//   LLM_API_KEY            — key of the language model API (needed by the writing side)
//   BLOB_READ_WRITE_TOKEN  — added by Vercel when a Blob store is connected to the project
import { oracles } from './_agent/oracle.js';
import { readJournal } from './_agent/journal.js';

export const BUILD = 5;            // raised with every change of the agent, so a deployment can be told apart from outside
export const HOUR = (env) => { const h = Number(env.ISSUE_HOUR_UTC); return Number.isInteger(h) && h >= 0 && h < 24 ? h : 6; };
const SHOW = 35;                   // issues sent to the page

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
});

export async function handle(request, env = process.env, deps = {}) {
  if (!oracles[env.PROJECT]) return json({ error: 'not_found' }, 404);
  if (request.method !== 'GET') return json({ error: 'method' }, 405, { allow: 'GET' });
  const live = Boolean(env.LLM_API_KEY && env.BLOB_READ_WRITE_TOKEN);
  const base = { live, build: BUILD, hour: HOUR(env) };
  if (!env.BLOB_READ_WRITE_TOKEN) return json({ ...base, issues: [] });
  try {
    const journal = await readJournal(env, deps.store);
    // The file changes once a day: the answer may be cached for a few minutes at the edge.
    return json({ ...base, count: journal.count, issues: journal.issues.slice(0, SHOW) }, 200, { 'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600' });
  } catch {
    return json({ ...base, issues: [], error: 'storage' }, 200);
  }
}

export default { fetch: (request) => handle(request) };
