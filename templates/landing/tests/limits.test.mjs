// Checks the shared counters (api/_agent/limits.js): memory, and Redis over its REST address (a fake Redis here).
// Run inside templates/landing:  node tests/limits.test.mjs
import assert from 'node:assert/strict';
import { count, peek, put, drop, once, limitsKind, resetMemory } from '../api/_agent/limits.js';

let clock = 1_800_000_000_000; const now = () => clock;
const MEM = { PROJECT: 'ullu' };

// ---- memory
assert.equal(limitsKind(MEM), 'memory');
assert.deepEqual([await count(MEM, 'a', 60, { now }), await count(MEM, 'a', 60, { now }), await count(MEM, 'a', 60, { now })], [1, 2, 3]);
assert.equal(await peek(MEM, 'a', { now }), 3);
clock += 61000; assert.equal(await peek(MEM, 'a', { now }), 0, 'a counter ends after its time'); assert.equal(await count(MEM, 'a', 60, { now }), 1);
assert.equal(await once(MEM, 'c1', 60, { now }), true); assert.equal(await once(MEM, 'c1', 60, { now }), false);
await put(MEM, 'w', 12345, 60, { now }); assert.equal(await peek(MEM, 'w', { now }), 12345); await drop(MEM, 'w'); assert.equal(await peek(MEM, 'w', { now }), 0);
assert.equal(await count({ PROJECT: 'other' }, 'a', 60, { now }), 1, 'projects do not share counters');
console.log('1 ok: memory counters, time, once, put and drop');

// ---- Redis: a fake one that speaks the REST pipeline
const R = { PROJECT: 'ullu', KV_REST_API_URL: 'https://fake-redis.example', KV_REST_API_TOKEN: 'tok' };
assert.equal(limitsKind(R), 'redis'); assert.equal(limitsKind({ KV_REST_API_URL: 'http://plain', KV_REST_API_TOKEN: 't' }), 'memory', 'only https');
const db = new Map(); let calls = 0, down = false, seen = [];
const fakeFetch = async (url, init) => {
  calls += 1;
  if (down) throw new Error('no route');
  assert.equal(url, 'https://fake-redis.example/pipeline'); assert.equal(init.headers.authorization, 'Bearer tok');
  const out = JSON.parse(init.body).map(([cmd, k, ...a]) => {
    seen.push(k);
    if (cmd === 'INCR') { const v = (Number(db.get(k)) || 0) + 1; db.set(k, String(v)); return { result: v }; }
    if (cmd === 'EXPIRE') return { result: 1 };
    if (cmd === 'GET') return { result: db.has(k) ? db.get(k) : null };
    if (cmd === 'DEL') { db.delete(k); return { result: 1 }; }
    if (cmd === 'SET') { if (a.includes('NX') && db.has(k)) return { result: null }; db.set(k, a[0]); return { result: 'OK' }; }
    return { error: 'unknown' };
  });
  return new Response(JSON.stringify(out), { status: 200 });
};
const d = { now, fetch: fakeFetch };
resetMemory();
assert.equal(await count(R, 'x', 60, d), 1); assert.equal(await count(R, 'x', 60, d), 2);
assert.equal(db.get('lim:ullu:x'), '2', 'the number lives in Redis'); assert.ok(seen.every((k) => k.startsWith('lim:ullu:')));
assert.equal(await peek(R, 'x', d), 2);
assert.equal(await once(R, 'p', 60, d), true); assert.equal(await once(R, 'p', 60, d), false);
await put(R, 'last', 99, 60, d); assert.equal(await peek(R, 'last', d), 99); await drop(R, 'last', d); assert.equal(await peek(R, 'last', d), 0);
// another copy of the function sees the same number (no memory involved)
resetMemory(); assert.equal(await count(R, 'x', 60, d), 3, 'shared across copies');
// Redis down: the limit falls back to memory, it never turns off
down = true; const before = calls;
assert.equal(await count(R, 'y', 60, d), 1); assert.equal(await count(R, 'y', 60, d), 2); assert.ok(calls > before);
assert.equal(await once(R, 'q', 60, d), true); assert.equal(await once(R, 'q', 60, d), false);
// a Redis that answers with an error or garbage: the same
down = false;
const bad = { now, fetch: async () => new Response('nope', { status: 500 }) };
assert.equal(await count(R, 'z', 60, bad), 1); assert.equal(await count(R, 'z', 60, bad), 2);
const weird = { now, fetch: async () => new Response(JSON.stringify([{ error: 'WRONGTYPE' }]), { status: 200 }) };
assert.equal(await count(R, 'zz', 60, weird), 1);
console.log('2 ok: Redis shared counters, fallback to memory when Redis is down or wrong');
console.log('limits: all ok');
