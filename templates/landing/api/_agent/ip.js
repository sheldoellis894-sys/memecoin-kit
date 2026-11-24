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
/**
 * A wider block for the limits of new houses: one IPv6 /48 (what one home, office or tunnel usually gets) counts as one
 * network, so a block of many /64s cannot fill the street. An IPv4 address stays itself.
 */
export function netKey(ip) {
  const k = ipKey(ip);
  if (!k.endsWith('::/64')) return k;
  return `${k.slice(0, -5).split(':').slice(0, 3).join(':')}::/48`;
}
/**
 * A post from another site's page is turned away: the browser sends Origin with every POST, and it must be this site.
 * A request with no Origin (a script, an old browser) is let through; the limits still count it.
 */
export function foreignOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  try { return new URL(origin).host !== new URL(request.url).host; } catch { return true; }
}
/** A post that is not JSON (a plain form from another page) is turned away. */
export const notJson = (request) => !/^application\/json\b/i.test(request.headers.get('content-type') || '');
