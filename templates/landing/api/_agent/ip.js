// The visitor's address as the limits count it (api/street.js, api/admin.js, api/stats.js). Kept only in memory.
/** The address the limits count by. An IPv6 visitor usually has a whole /64 block of addresses, so it counts as one. */
export function ipKey(ip) {
  const s = String(ip || '').trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/%.*$/, '');
  if (!s.includes(':')) return s || 'unknown';
  const v4 = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (v4) return v4[1];
  const [a, b] = s.split('::');
  const head = a ? a.split(':') : [], tail = b ? b.split(':') : [];
  const full = s.includes('::') ? [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill('0'), ...tail] : head;
  return `${full.slice(0, 4).map((x) => x.replace(/^0+(?=.)/, '') || '0').join(':')}::/64`;
}
