// Capture Yoast's <head> for every mirrored page.
//
// Posts already get this: the loader asks WPGraphQL for `seo.fullHead` and
// ArticleLayout injects it verbatim, so a blog post carries the same og:image,
// og:locale, article times and schema graph WordPress serves.
//
// Mirrored pages had no equivalent. `WpLayout` hand-built a title, description,
// canonical and four Open Graph tags — correct as far as it went, but missing
// og:image and its dimensions, og:locale, og:site_name, Twitter's data labels
// and the entire JSON-LD graph. That is a real gap on the pages that sell the
// product, and the fix is the same one posts already use: emit what WordPress
// emits.
//
// Reads the HTML the mirror already cached under `.wp-cache/pages/`, and fetches
// anything missing — which needs a logged-in session, because preprod serves a
// "Coming Soon" page to anonymous visitors.
//
//   npm run wp:seo
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, WP_ORIGIN } from './lib/config.mjs';
import { extractHead } from './lib/wp-head.mjs';

const CACHE = path.join(PROJECT, '.wp-cache', 'pages');
const DATA = path.join(PROJECT, 'src', 'data');
const OUT = path.join(DATA, 'wp-seo.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const out = s => process.stdout.write(s);

/** The session the mirror already uses. Anonymous requests get "Coming Soon". */
async function cookieHeader() {
  const jar = path.join(PROJECT, '.wp-cache', 'cookies.txt');
  if (!existsSync(jar)) return null;
  const seen = new Set();
  const pairs = [];
  for (const line of (await fs.readFile(jar, 'utf8')).split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const f = line.split('\t');
    if (f.length < 7 || seen.has(f[5])) continue;
    seen.add(f[5]);
    pairs.push(`${f[5]}=${f[6]}`);
  }
  return pairs.length ? pairs.join('; ') : null;
}

/** Page keys that render through WpLayout, and the route each one serves. */
const pages = JSON.parse(await fs.readFile(path.join(DATA, 'wp-pages.json'), 'utf8'));

/**
 * Only the hand-written routes matter.
 *
 * `wp-pages.json` also carries a key per mirrored post and archive. Posts render
 * through ArticleLayout with live Yoast data and would only be shadowed by a
 * stale capture; archives have no cached HTML to read. Both are skipped rather
 * than half-filled.
 */
const PAGES_DIR = path.join(PROJECT, 'src', 'pages');
const routes = [];
for (const f of await fs.readdir(PAGES_DIR)) {
  if (!f.endsWith('.astro') || f.startsWith('[')) continue;
  // Some routes are redirect stubs rendering `<Redirect to=... />`. They carry
  // no content of their own and emit a noindex head pointing at their target,
  // so capturing Yoast metadata for them would only be dead weight.
  const src = await fs.readFile(path.join(PAGES_DIR, f), 'utf8');
  if (/<Redirect/.test(src)) continue;
  if (f === '404.astro') continue;   // deliberately not indexable
  routes.push(f.replace(/\.astro$/, ''));
}

const cookie = await cookieHeader();
const seo = {};
let fromCache = 0, fetched = 0;
const missing = [];

for (const key of routes) {
  const slug = key === 'index' ? '' : key;
  let html = null;

  const cached = path.join(CACHE, `${key}.html`);
  if (existsSync(cached)) {
    html = await fs.readFile(cached, 'utf8');
    fromCache++;
  } else if (cookie) {
    const res = await fetch(`${WP_ORIGIN}/${slug}${slug ? '/' : ''}`, {
      headers: { 'User-Agent': UA, Cookie: cookie },
    });
    if (res.ok) {
      html = await res.text();
      await fs.mkdir(CACHE, { recursive: true });
      await fs.writeFile(cached, html, 'utf8');
      fetched++;
    }
  }

  const head = html && extractHead(html);
  if (!head) { missing.push(key); continue; }

  // Stored exactly as WordPress emitted it, still naming preprod. Repointing
  // here would bake whichever SITE_URL happened to be set when this ran into a
  // committed file — which is how the canonical on every marketing page came
  // out as spenza.com in a build made for the staging host. `WpLayout` calls
  // `rewriteHead` at render time instead, so the environment decides.
  seo[key] = head;
}

await fs.writeFile(OUT, JSON.stringify(seo, null, 2) + '\n', 'utf8');

const bytes = (await fs.stat(OUT)).size;
out(
  `${routes.length} WpLayout routes\n` +
  `  ${Object.keys(seo).length} with a Yoast head ` +
  `(${fromCache} from cache, ${fetched} fetched)\n` +
  `  ${missing.length} without\n` +
  `wrote src/data/wp-seo.json (${(bytes / 1024).toFixed(0)}KB)\n`
);

if (missing.length) {
  out(`\nNo Yoast block for: ${missing.slice(0, 12).join(', ')}` +
      `${missing.length > 12 ? ` … +${missing.length - 12}` : ''}\n` +
      `These keep the layout's hand-built tags, which is the old behaviour.\n`);
  if (!cookie) out(`\n.wp-cache/cookies.txt is absent — run \`npm run wp:check-session\`.\n`);
}
