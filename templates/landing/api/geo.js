// Vercel Function or own-server function behind the first-visit questions of the "lights" layout:
// GET → { country, city } — where the visitor is, roughly, from their connection. Nothing is stored.
// The page uses it once, on the first visit, to write the city under the house and on the cards.
//
// Where the answer comes from (the first one that is there):
//   Vercel:      x-vercel-ip-country, x-vercel-ip-city (set by Vercel on every deployment)
//   Cloudflare:  cf-ipcountry (and cf-ipcity when "Add visitor location headers" is on)
//   nginx:       x-geo-country, x-geo-city (set by nginx with the GeoIP2 module, see projects/ullu/launch/hosting.md)
//   own names:   GEO_COUNTRY_HEADER, GEO_CITY_HEADER — header names in the environment
// When none is there the answer is empty and the city is simply not shown.
// It answers only for projects listed in GEO (env PROJECT).
import { cleanPlace } from '../src/lib/lights-kit.js';

export const GEO = { ullu: true };

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store' },
});

function header(request, names) {
  for (const n of names) {
    if (!n) continue;
    const v = request.headers.get(n);
    if (v) { try { return decodeURIComponent(v.replace(/\+/g, ' ')); } catch { return v; } }
  }
  return '';
}

export async function handle(request, env = process.env) {
  if (!GEO[env.PROJECT]) return json({ error: 'not_found' }, 404);
  if (request.method !== 'GET') return json({ error: 'method' }, 405);
  let country = header(request, [env.GEO_COUNTRY_HEADER, 'x-vercel-ip-country', 'cf-ipcountry', 'x-geo-country']).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || country === 'XX' || country === 'T1') country = '';   // XX = unknown, T1 = Tor (Cloudflare)
  const city = cleanPlace(header(request, [env.GEO_CITY_HEADER, 'x-vercel-ip-city', 'cf-ipcity', 'x-geo-city']));
  return json({ country, city });
}

export default { fetch: (request) => handle(request) };
