/**
 * Post-build: writes dist/sitemap.xml and dist/robots.txt using VITE_SITE_URL.
 *
 * Static public routes are always included. Item/auction URLs are dynamic and
 * live in the backend, so they are only added when VITE_API_URL points at a
 * reachable, non-localhost API. Any API failure is logged and skipped — the
 * build never fails because of the sitemap.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { CATEGORIES, PRIVATE_ROUTES, PUBLIC_ROUTES, resolveSiteUrl } from '../site.config.js';

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
const SITE_URL = resolveSiteUrl(env.VITE_SITE_URL);
const API_URL = (env.VITE_API_URL || '').replace(/\/+$/, '');
const OUT_DIR = resolve(process.cwd(), 'dist');
const MAX_ITEMS = 5000;
const PAGE_SIZE = 100;

const xmlEscape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const isUsableApi = (url) => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch {
    return false;
  }
};

async function fetchItemUrls() {
  if (!isUsableApi(API_URL)) {
    console.log('[sitemap] VITE_API_URL not set to a public API — skipping dynamic item URLs.');
    return [];
  }
  const urls = [];
  try {
    for (let page = 1; urls.length < MAX_ITEMS; page += 1) {
      const res = await fetch(`${API_URL}/items?page=${page}&limit=${PAGE_SIZE}`, {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = body?.data?.items ?? [];
      for (const item of items) {
        if (item?.id == null) continue;
        urls.push({
          loc: `${SITE_URL}/items/${encodeURIComponent(item.id)}`,
          lastmod: item.updated_at || item.created_at,
          changefreq: 'hourly',
          priority: '0.6',
        });
      }
      const totalPages = body?.data?.pagination?.totalPages ?? 1;
      if (!items.length || page >= totalPages) break;
    }
    console.log(`[sitemap] Added ${urls.length} item URL(s) from the API.`);
  } catch (err) {
    console.warn(`[sitemap] Could not fetch items from ${API_URL} (${err.message}) — continuing with static routes only.`);
  }
  return urls;
}

const today = new Date().toISOString().slice(0, 10);
const staticUrls = [
  ...PUBLIC_ROUTES.map((path) => ({
    loc: `${SITE_URL}${path}`,
    lastmod: today,
    changefreq: path === '/' ? 'daily' : 'hourly',
    priority: path === '/' ? '1.0' : '0.9',
  })),
  ...CATEGORIES.map((c) => ({
    loc: `${SITE_URL}/browse?category=${encodeURIComponent(c)}`,
    lastmod: today,
    changefreq: 'hourly',
    priority: '0.8',
  })),
];

const entries = [...staticUrls, ...(await fetchItemUrls())];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((u) => {
    const lastmod = u.lastmod && !Number.isNaN(Date.parse(u.lastmod)) ? new Date(u.lastmod).toISOString().slice(0, 10) : null;
    return [
      '  <url>',
      `    <loc>${xmlEscape(u.loc)}</loc>`,
      lastmod && `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');
  })
  .join('\n')}
</urlset>
`;

// Private routes are not Disallowed: they carry noindex (meta + X-Robots-Tag),
// which crawlers can only see if they are allowed to fetch the page.
const robots = `# ThriftBid robots.txt (generated at build time)
# noindex (not Disallow): ${PRIVATE_ROUTES.join(' ')}
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(resolve(OUT_DIR, 'sitemap.xml'), sitemap);
await writeFile(resolve(OUT_DIR, 'robots.txt'), robots);
console.log(`[sitemap] Wrote ${entries.length} URL(s) to dist/sitemap.xml and dist/robots.txt for ${SITE_URL}`);
