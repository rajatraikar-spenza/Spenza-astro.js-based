// Mirror the WordPress CSS/asset graph for preprod.spenza.com into public/wp-assets.
import fs from 'node:fs/promises';
import path from 'node:path';

import { WP_ORIGIN, WP_HOST } from './lib/config.mjs';

const ORIGIN = WP_ORIGIN;
const PROJECT = path.resolve(import.meta.dirname, '..');
const OUT_ROOT = path.join(PROJECT, 'public', 'wp-assets');
const CACHE = path.join(PROJECT, '.wp-cache');

const SLUGS = [
  '', 'about-us', 'ai-phone-number',
  'amazon-delivery-service-partner-dsp-mobile-service', 'blog',
  'business-roaming-packs', 'careers', 'connected-devices', 'contact-us',
  'controlhub', 'esim-compatibility-checker', 'esim-phones',
  'exceptional-24-7-support-for-your-business-needs', 'faq',
  'finance-and-hr-teams', 'iot-solutions', 'mobility-policy', 'mvne',
  'mvno-calculator', 'network-operator-terms-of-service', 'privacy-policy',
  'sitemap', 'sub-processors', 'support', 'telecomhub', 'terms-of-service',
  'travel-esim', 'unlimited-data-plans-pricing', 'uxhub',
  // Not linked from the site's own navigation, but the blog links all five —
  // without them those posts point at 404s.
  'demo', 'device-vendors-demo', 'enterprises-demo', 'mno',
  'telecom-savings-calculator',
];

// Admin-only / tracking assets that must not ship to the static site.
const EXCLUDE = [
  'admin-bar', 'dashicons', 'wordfence', 'gravatar-enhanced', 'zip-ai',
  'noticons', 'adminbar', 'litespeed', 'coming-soon', 'jetpack',
  'wp-includes/css/admin-bar', 'notes/admin-bar', 'customize-',
];

const cookieHeader = await (async () => {
  const raw = await fs.readFile(path.join(CACHE, 'cookies.txt'), 'utf8');
  // curl writes HttpOnly cookies as "#HttpOnly_<domain>" lines; keep those.
  const seen = new Set();
  return raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('\t'))
    .filter(p => p.length >= 7)
    .map(p => [p[5].trim(), p[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k))
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
})();

const fetched = new Map();      // url -> local public path (or null if skipped)
const failures = [];

const isExcluded = u => EXCLUDE.some(x => u.includes(x));

/** Map a remote URL to a path under public/wp-assets. */
function localPathFor(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/^\/+/, '');
  if (u.hostname !== WP_HOST) {
    p = path.posix.join('_cdn', u.hostname, p);
  }
  // Elementor/Astra append ?ver=; keep filename stable, ignore query.
  return p;
}

async function download(url, { text = false } = {}) {
  const res = await fetch(url, {
    headers: {
      Cookie: url.startsWith(ORIGIN) ? cookieHeader : '',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      Referer: ORIGIN + '/',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return text ? await res.text() : Buffer.from(await res.arrayBuffer());
}

/** Fetch an asset (and, for CSS, everything it references) into public/wp-assets. */
async function mirrorAsset(url, depth = 0) {
  const clean = url.split('#')[0];
  if (fetched.has(clean)) return fetched.get(clean);
  if (isExcluded(clean) || depth > 3) { fetched.set(clean, null); return null; }

  const rel = localPathFor(clean);
  const dest = path.join(OUT_ROOT, rel);
  const publicUrl = '/wp-assets/' + rel.split(path.sep).join('/');
  fetched.set(clean, publicUrl);

  const isCss = /\.css($|\?)/.test(clean);
  try {
    if (isCss) {
      let css = await download(clean, { text: true });
      css = await rewriteCss(css, clean, depth);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, css, 'utf8');
    } else {
      const buf = await download(clean);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, buf);
    }
  } catch (err) {
    failures.push(`${clean} -> ${err.message}`);
    fetched.set(clean, null);
    return null;
  }
  return publicUrl;
}

/** Rewrite url(...) and @import inside CSS, mirroring each referenced asset. */
async function rewriteCss(css, baseUrl, depth) {
  const refs = new Set();
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const importRe = /@import\s+(?:url\()?\s*(['"])([^'"]+)\1/g;
  let m;
  while ((m = urlRe.exec(css))) refs.add(m[2]);
  while ((m = importRe.exec(css))) refs.add(m[2]);

  const map = new Map();
  for (const ref of refs) {
    const r = ref.trim();
    if (!r || r.startsWith('data:') || r.startsWith('#')) continue;
    let abs;
    try { abs = new URL(r, baseUrl).href; } catch { continue; }
    if (!/^https?:/.test(abs)) continue;
    const local = await mirrorAsset(abs, depth + 1);
    if (local) map.set(ref, local);
  }
  for (const [from, to] of map) {
    css = css.split(from).join(to);
  }
  return css;
}

// ---- Pass 1: collect the stylesheet list for every page -------------------
const pageCss = {};
for (const slug of SLUGS) {
  const url = `${ORIGIN}/${slug}`;
  let html;
  try {
    html = await download(url, { text: true });
  } catch (err) {
    failures.push(`PAGE ${url} -> ${err.message}`);
    continue;
  }
  await fs.writeFile(path.join(CACHE, 'pages', (slug || 'index') + '.html'), html, 'utf8');

  const links = [...html.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/g)].map(t => t[0]);
  const hrefs = links
    .map(t => (t.match(/href=['"]([^'"]+)['"]/) || [])[1])
    .filter(Boolean)
    .map(h => h.replace(/&#0?38;/g, '&'))
    .map(h => (h.startsWith('//') ? 'https:' + h : h))
    .filter(h => /^https?:/.test(h))
    .filter(h => !isExcluded(h));

  pageCss[slug || 'index'] = hrefs;
  process.stdout.write(`page ${slug || 'index'}: ${hrefs.length} css\n`);
}

// ---- Pass 2: mirror every unique stylesheet + its dependency graph --------
const allCss = [...new Set(Object.values(pageCss).flat())];
process.stdout.write(`\nmirroring ${allCss.length} unique stylesheets...\n`);
let done = 0;
for (const href of allCss) {
  await mirrorAsset(href);
  if (++done % 10 === 0) process.stdout.write(`  ${done}/${allCss.length}\n`);
}

// ---- Emit a manifest the Astro layout can consume ------------------------
const manifest = {};
for (const [page, hrefs] of Object.entries(pageCss)) {
  manifest[page] = hrefs.map(h => fetched.get(h.split('#')[0])).filter(Boolean);
}
// Merge rather than overwrite: wp-mirror-posts and wp-mirror-archives add their
// own keys (post-*, archive-*, __post__) to this file, and there are far more of
// those than there are pages — re-running this script must not drop them.
const stylesFile = path.join(PROJECT, 'src', 'data', 'wp-styles.json');
let existingStyles = {};
try {
  existingStyles = JSON.parse(await fs.readFile(stylesFile, 'utf8'));
} catch { /* first run */ }

await fs.writeFile(stylesFile, JSON.stringify({ ...existingStyles, ...manifest }, null, 2), 'utf8');

process.stdout.write(`\nassets written: ${[...fetched.values()].filter(Boolean).length}\n`);
if (failures.length) {
  process.stdout.write(`failures (${failures.length}):\n` + failures.slice(0, 40).join('\n') + '\n');
}
