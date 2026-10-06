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
//   AGENT_DAILY_CAP  — optional: inspections a day for the whole site, per running instance (default 300)
import { personas } from './_agent/persona.js';
import { inspect } from './_agent/agent.js';

const DAY = 86400000;
const seen = new Map();          // ip → [timestamps]. Lives as long as the instance does: a brake, not a wall.
let total = { day: 0, n: 0 };

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
});
const isAddress = (s) => typeof s === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);

function allow(ip, env) {
  const now = Date.now(), perIp = Number(env.AGENT_PER_IP) || 5, cap = Number(env.AGENT_DAILY_CAP) || 300;
  const day = Math.floor(now / DAY);
  if (total.day !== day) total = { day, n: 0 };
  if (total.n >= cap) return 'full';
  const list = (seen.get(ip) || []).filter((t) => now - t < DAY);
  if (list.length >= perIp) { seen.set(ip, list); return 'limit'; }
  list.push(now); seen.set(ip, list); total.n++;
  if (seen.size > 5000) for (const [k, v] of seen) if (!v.some((t) => now - t < DAY)) seen.delete(k);
  return '';
}

export async function handle(request, env = process.env) {
  const persona = personas[env.PROJECT];
  if (!persona) return json({ error: 'not_found' }, 404);
  const live = Boolean(env.LLM_API_KEY && (env.HELIUS_API_KEY || env.SOLANA_RPC_URL));

  if (request.method === 'GET') return json({ live });
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'GET, POST' });

  // Same-site requests only: the keys behind this function are paid for by the project.
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host) { try { if (new URL(origin).host !== host) return json({ error: 'origin' }, 403); } catch { return json({ error: 'origin' }, 403); } }

  if (!live) return json({ error: 'closed' }, 503);

  let body;
  try {
    const text = await request.text();
    if (text.length > 400) return json({ error: 'address' }, 400);
    body = JSON.parse(text);
  } catch { return json({ error: 'address' }, 400); }
  const wallet = body?.address;
  if (!isAddress(wallet)) return json({ error: 'address' }, 400);

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const blocked = allow(ip, env);
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
