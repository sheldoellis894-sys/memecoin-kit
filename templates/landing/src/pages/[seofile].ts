// robots.txt and sitemap.xml, only for a project that asks for them: project.config.json "seo": { "sitemap": true }
// (and has "url"). Other projects get neither file. The moderator page is not listed anywhere (it is noindex itself).
import { config } from '../lib/project';

const seo = (config as any).seo || {};
const base = config.url ? new URL('/', config.url).href : '';

export function getStaticPaths() {
  return seo.sitemap && base ? [{ params: { seofile: 'robots.txt' } }, { params: { seofile: 'sitemap.xml' } }] : [];
}

export function GET({ params }: { params: { seofile: string } }) {
  if (params.seofile === 'robots.txt') {
    return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}</loc></url>\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
