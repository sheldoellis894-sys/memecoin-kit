// Vercel Function behind the "Inspection" tool (section guideInspect).
// POST { address } → a stream of JSON lines: steps of the agent, the trading facts, the review.
// GET → { live } so the page can tell whether the kitchen is open.
//
// It answers only for projects that have a persona (env PROJECT, the same variable that picks the site).
// Keys live in the environment of the Vercel project and never reach the browser:
//   LLM_API_KEY      — key of the language model API (required)
//   HELIUS_API_KEY   — key of the Solana data provider (required unless SOLANA_RPC_URL is set)
//   SOLANA_RPC_URL   — optional: any Solana RPC address, used instead of the parsed history
//   LLM_MODEL        — optional: model id
//   AGENT_PER_IP     — optional: inspections per visitor a day (default 5)
//   AGENT_DAILY_CAP  — optional: inspections a day for the whole site (default 300)
// The two limits are counted in api/_agent/limits.js: shared by every copy of the function when the project has a Redis
// (KV_REST_API_URL + KV_REST_API_TOKEN), else per copy. The real wall is the spending limit set at the model provider.
import { personas } from './_agent/persona.js';
import { inspect } from './_agent/agent.js';
import { ipKey } from './_agent/ip.js';
import { count } from './_agent/limits.js';

const BUILD = 4;                 // raised with every change of the agent, so a deployment can be told apart from outside
const DAY = 86400000;

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
});
const isAddress = (s) => typeof s === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);

/** '' when the inspection may run, 'limit' for this visitor today, 'full' for the whole site today. */
async function allow(ip, env, deps) {
  const now = (deps.now || Date.now)(), perIp = Number(env.AGENT_PER_IP) || 5, cap = Number(env.AGENT_DAILY_CAP) || 300;
  const day = Math.floor(now / DAY);
  if ((await count(env, `inspect:${day}:${ip}`, 90000, deps)) > perIp) return 'limit';
  if ((await count(env, `inspect-all:${day}`, 90000, deps)) > cap) return 'full';
  return '';
}

export async function handle(request, env = process.env, deps = {}) {
  const persona = personas[env.PROJECT];
  if (!persona) return json({ error: 'not_found' }, 404);
  const live = Boolean(env.LLM_API_KEY && (env.HELIUS_API_KEY || env.SOLANA_RPC_URL));

  if (request.method === 'GET') return json({ live, build: BUILD });
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'GET, POST' });

  // Same-site requests only: the keys behind this function are paid for by the project. A browser sends Origin with every
  // POST, so a request without it (a script) is turned away too.
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  let same = false;
  try { same = Boolean(origin) && new URL(origin).host === host; } catch { same = false; }
  if (!same) return json({ error: 'origin' }, 403);

  if (!live) return json({ error: 'closed' }, 503);

  let body;
  try {
    const text = await request.text();
    if (text.length > 400) return json({ error: 'address' }, 400);
    body = JSON.parse(text);
  } catch { return json({ error: 'address' }, 400); }
  const wallet = body?.address;
  if (!isAddress(wallet)) return json({ error: 'address' }, 400);

  const ip = ipKey((request.headers.get('x-forwarded-for') || '').split(',')[0]);
  const blocked = await allow(ip, env, deps);
  if (blocked) return json({ error: blocked }, 429);

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let open = true;
      const emit = (event) => { if (open) { try { controller.enqueue(enc.encode(`${JSON.stringify(event)}\n`)); } catch { open = false; } } };
      const timer = setTimeout(() => { emit({ type: 'error', code: 'slow' }); open = false; try { controller.close(); } catch {} }, 75000);
      try {
        await inspect({ wallet, persona, env, emit });
        emit({ type: 'done' });
      } catch (e) {
        // Nothing about the wallet or the keys goes to the logs or to the visitor: only a short code.
        emit({ type: 'error', code: ['busy', 'closed', 'chain', 'model'].includes(e?.code) ? e.code : 'failed' });
      } finally {
        clearTimeout(timer);
        if (open) { open = false; try { controller.close(); } catch {} }
      }
    },
  });
  return new Response(stream, {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store, no-transform', 'x-accel-buffering': 'no' },
  });
}

export default { fetch: (request) => handle(request) };
