// The browser check for a new house on the street (api/street.js). Before a house goes on the street for the first time,
// the browser asks the server for a challenge and looks for a number (the nonce) that makes
// sha256("challenge.id.nonce") start with a few zero bits. A phone finds it in about a second, once per house; a script
// that floods the street with thousands of new houses has to pay that second for every one of them. Updates of a house
// that is already on the street need no check. Nothing here talks to any outside service.
// The same file runs in the browser (LightsHouse) and in the tests; the server checks the answer with node:crypto.

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);
const W = new Uint32Array(64);

/** sha256 of a short ASCII text (the challenge, the id and the nonce are all ASCII), as eight 32-bit words. */
export function sha256Words(text) {
  const n = text.length;
  const blocks = ((n + 8) >> 6) + 1;
  const m = new Uint32Array(blocks * 16);
  for (let i = 0; i < n; i++) m[i >> 2] |= (text.charCodeAt(i) & 0xff) << (24 - (i & 3) * 8);
  m[n >> 2] |= 0x80 << (24 - (n & 3) * 8);
  m[blocks * 16 - 1] = n * 8;
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let o = 0; o < m.length; o += 16) {
    for (let t = 0; t < 16; t++) W[t] = m[o + t];
    for (let t = 16; t < 64; t++) {
      const a = W[t - 15], b = W[t - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0 >>> 0, h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0, h5 >>> 0, h6 >>> 0, h7 >>> 0];
}
export const sha256Hex = (text) => sha256Words(text).map((w) => w.toString(16).padStart(8, '0')).join('');

/** What is hashed: the challenge from the server, the visitor id of this browser and the nonce. */
export const proofText = (challenge, id, nonce) => `${challenge}.${id}.${nonce}`;
/** Zero bits at the start of a hash given as words (enough for any difficulty the street uses). */
export const zeroBitsOf = (w) => (w[0] ? Math.clz32(w[0]) : 32 + Math.clz32(w[1]));
export const proofOk = (challenge, id, nonce, bits) => zeroBitsOf(sha256Words(proofText(challenge, id, nonce))) >= bits;

// gives the page a moment between rounds so it stays smooth; a message channel is not slowed down in a background tab
// the way timers are
const pause = () => new Promise((resolve) => {
  if (typeof MessageChannel === 'undefined') return setTimeout(resolve, 0);
  const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); resolve(); }; ch.port2.postMessage(0);
});

/** Finds the nonce for a challenge: works in short rounds (about 12 ms each) and gives the page time in between. */
export async function solveProof(challenge, id, bits, { round = 12, now = () => Date.now() } = {}) {
  for (let n = 0; ;) {
    const end = now() + round;
    do {
      for (let i = 0; i < 64; i++, n++) { const nonce = n.toString(36); if (proofOk(challenge, id, nonce, bits)) return nonce; }
    } while (now() < end);
    await pause();
  }
}
