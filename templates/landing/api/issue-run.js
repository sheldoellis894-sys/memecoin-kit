// Vercel Function behind the "Morning issue" tool: the writing side.
// Called once a day by the Vercel Cron Job from vercel.json (GET). It runs the agent and stores the new issue.
//
// One issue per UTC day: when today's issue is already in the journal, nothing is written and the model is not called,
// so opening this address by hand costs nothing. Before the scheduled hour it answers "early".
//   CRON_SECRET     — optional. When set, Vercel sends it with every scheduled call and the function refuses calls without it.
//                     With the secret (?key=…) the function also runs before the hour, and ?force=1 rewrites today's issue.
//   ISSUE_HOUR_UTC  — optional. The hour of the schedule in vercel.json (default 6).
import { oracles, writeIssue } from './_agent/oracle.js';
import { readJournal, saveIssue, openJournal } from './_agent/journal.js';
import { BUILD, HOUR } from './issue.js';

const tries = { day: '', n: 0 };   // failed attempts today, per running instance: a brake, not a wall
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function handle(request, env = process.env, deps = {}) {
  const oracle = oracles[env.PROJECT];
  if (!oracle) return json({ error: 'not_found' }, 404);
  if (request.method !== 'GET') return json({ error: 'method' }, 405);

  const url = new URL(request.url);
  const secret = env.CRON_SECRET || '';
  const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('key') || '';
  const trusted = Boolean(secret) && given === secret;
  if (secret && !trusted) return json({ error: 'forbidden' }, 401);
  if (!env.LLM_API_KEY || !env.BLOB_READ_WRITE_TOKEN) return json({ ok: false, error: 'closed', build: BUILD }, 503);

  const now = deps.now ? deps.now() : Date.now();
  const date = new Date(now).toISOString().slice(0, 10);
  if (!trusted && new Date(now).getUTCHours() < HOUR(env)) return json({ ok: true, state: 'early', date, hour: HOUR(env), build: BUILD });

  let journal;
  try { journal = await readJournal(env, deps.store); } catch { return json({ ok: false, error: 'storage', build: BUILD }, 502); }
  const force = trusted && url.searchParams.get('force') === '1';
  const today = journal.issues.find((i) => i.date === date);
  if (today && !force) return json({ ok: true, state: 'exists', date, no: today.no, headline: today.headline, build: BUILD });

  if (tries.day !== date) { tries.day = date; tries.n = 0; }
  if (tries.n >= 3 && !trusted) return json({ ok: false, error: 'tired', build: BUILD }, 429);

  try {
    if (journal.fresh) await openJournal(env, deps.store);
    const issue = await writeIssue({ oracle, env, date, no: today ? today.no : journal.count + 1, build: BUILD, now });
    await saveIssue(env, journal, issue, deps.store);
    return json({ ok: true, state: 'written', date, no: issue.no, headline: issue.headline, filled: issue.filled, notes: issue.notes, build: BUILD });
  } catch (e) {
    tries.n++;
    // Nothing about the keys goes to the answer: only a short code.
    const code = ['busy', 'model', 'market', 'storage'].includes(e?.code) ? e.code : 'failed';
    return json({ ok: false, error: code, build: BUILD }, code === 'busy' ? 503 : 502);
  }
}

export default { fetch: (request) => handle(request) };
