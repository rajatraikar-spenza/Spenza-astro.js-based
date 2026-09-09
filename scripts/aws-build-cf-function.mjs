// Generate the CloudFront viewer-request function and its redirect table.
//
// S3's REST endpoint has no notion of a directory index, so a request for
// `/about-us/` reaches the origin as the key `about-us/` and 404s. Every page
// this build emits is `<path>/index.html`, so without this function the site is
// entirely unreachable apart from the root. That is the function's real job;
// the redirects ride along because they need the same hook.
//
// Two sources, because there are two kinds of legacy URL and they were being
// treated as one:
//
//   1. `src/data/wp-redirects.json` — WordPress' own 301s for renamed slugs.
//   2. `src/data/wp-posts.json`     — the `/blog/<slug>/` alias every post
//      carries, because WordPress served posts at `/blog/<slug>/` before the
//      category-prefixed permalink. `blog/[slug].astro` used to answer these
//      with an HTML meta refresh, which is an HTTP 200 carrying `noindex` —
//      and 114 of them still rank, holding ~10% of the site's search clicks.
//
// ---- Why the table is split ------------------------------------------------
//
// A CloudFront Function is capped at 10KB of source, and the table alone was
// already 6.9KB of that. Adding 256 aliases needs ~8KB more, so embedding them
// is not possible at any encoding — 353 keys is roughly 14KB of irreducible
// string data. The table therefore moves to a CloudFront KeyValueStore.
//
// But not all of it. 320 of the 353 keys start with `blog/`, and the remaining
// 33 fit in 2.1KB. Keeping those 33 embedded means a normal article request —
// `/mvno/mvno/`, which is ~90% of traffic — resolves with no KVS lookup at all,
// and only the legacy `/blog/` paths pay for one. Splitting on that prefix is
// what keeps the hot path free rather than putting every page view through a
// data-plane call.
//
// Writes two files, neither committed:
//   scripts/.cf-site-function.js  the function source, for create/update-function
//   scripts/.cf-redirects.json    the `blog/*` table, for the KeyValueStore
//
// Run by scripts/aws-site-host.sh.
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';

const read = f =>
  JSON.parse(readFileSync(path.join(PROJECT, 'src', 'data', f), 'utf8'));

const redirects = read('wp-redirects.json');
/** slug -> { route, category, key }; the mirror index, and the route index. */
const posts = read('wp-posts.json');

/**
 * Keyed on the path with both slashes stripped, so `/x`, `/x/` and `x` all
 * resolve to one entry — the same normalisation `[...wpRedirect].astro` uses,
 * and it roughly halves the table.
 */
const bare = p => p.replace(/^\/+|\/+$/g, '');

/**
 * Pages the build actually emits.
 *
 * Astro gives a named route priority over the `[...wpRedirect]` rest parameter,
 * so a redirect whose source is also a real page never fires — the page wins.
 * A CloudFront viewer-request function runs before the origin is consulted and
 * would inverse that, quietly replacing five live pages with redirects,
 * `/bookings-checkout-discovery-call-book/` and `/finance-and-hr/` among them.
 * Reproducing Astro's precedence means dropping those rules here.
 */
const DIST = path.join(PROJECT, 'dist');
if (!existsSync(path.join(DIST, 'index.html'))) {
  process.stderr.write(
    'dist/ has no index.html — build first. The redirect table is filtered\n' +
    'against the emitted pages, and without them it would shadow real routes.\n'
  );
  process.exit(1);
}
/**
 * A real page, as opposed to one of the redirect stand-ins.
 *
 * `[...wpRedirect].astro` and `blog/[slug].astro` each emit a meta-refresh page
 * per old URL unless HOST_REDIRECTS is set, so a build made without it contains
 * an `index.html` for every redirect source. Testing existence alone then marks
 * all of them as pages and drops the entire table — the function shipped with
 * zero rules and nothing said so.
 *
 * Reading the file distinguishes them: a stand-in carries the refresh meta and
 * nothing else does.
 */
const isPage = key => {
  const file = path.join(DIST, key, 'index.html');
  if (!existsSync(file)) return false;
  return !/<meta http-equiv="refresh"/i.test(readFileSync(file, 'utf8'));
};

/**
 * Every path that answers with a 301, from both sources.
 *
 * WordPress' recorded redirects are added last so an explicit rule wins over a
 * generated alias. They cannot currently collide — no slug in `wp-posts.json`
 * also appears as a `/blog/<slug>/` key in `wp-redirects.json` — but a rename
 * recorded later would, and the recorded target is the correct one.
 */
const all = new Map();
for (const [slug, entry] of Object.entries(posts)) {
  all.set(`blog/${slug}`, entry.route);
}
for (const [from, to] of Object.entries(redirects)) {
  all.set(bare(from), to);
}

const embedded = {};   // non-blog, small enough to live in the function
const store = {};      // blog/*, bound for the KeyValueStore
let selfReferential = 0, shadowing = 0;

for (const [key, to] of all) {
  if (!key) continue;
  // Compared bare, not literally. The table records `/blog` -> `/blog/`, which
  // is a real WordPress redirect but collapses to a rule pointing at its own
  // key once slashes are stripped — and the function would then 301 `/blog/`
  // to `/blog/` forever. The trailing-slash branch below already handles that
  // case correctly, so dropping the entry loses nothing.
  if (key === bare(to)) { selfReferential++; continue; }
  if (isPage(key)) { shadowing++; continue; }
  if (key.startsWith('blog/')) store[key] = to;
  else embedded[key] = to;
}

/**
 * A redirect whose target is itself a redirect source costs an extra round trip
 * and loses ranking signal at each hop, and a cycle is an infinite loop in the
 * browser. Both are easy to introduce during the 44 planned merges — donor A
 * redirects to B, B is later merged into C — so they fail the build rather than
 * ship. Targets are compared bare for the same reason keys are normalised.
 */
const chains = [];
for (const [key, to] of [...Object.entries(embedded), ...Object.entries(store)]) {
  const target = bare(to);
  if (target && (target in embedded || target in store)) chains.push(`${key} -> ${to}`);
}
if (chains.length) {
  process.stderr.write(
    `${chains.length} redirect target${chains.length === 1 ? ' is' : 's are'} ` +
    `themselves redirect sources:\n` +
    chains.slice(0, 10).map(c => `  ${c}\n`).join('') +
    (chains.length > 10 ? `  ... and ${chains.length - 10} more\n` : '') +
    'Point each at its final destination instead.\n'
  );
  process.exit(1);
}

const fn = `// Generated by scripts/aws-build-cf-function.mjs — do not edit.
import cf from 'cloudfront';

// The \`blog/*\` table. Opened once per function instance, not per request.
var kvs = cf.kvs();

// Everything else: 301s whose source is not under /blog/. Small enough to embed,
// which keeps an ordinary page request free of any data-plane lookup.
var R = ${JSON.stringify(embedded)};

async function handler(event) {
  var req = event.request;
  var uri = req.uri;

  // Matched on the bare path so a request with or without a trailing slash
  // finds the same entry.
  var key = uri.replace(/^\\/+|\\/+$/g, '');

  if (R[key]) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: R[key] } }
    };
  }

  // Legacy /blog/<slug>/ aliases. Gated on the prefix so /mvno/mvno/ and every
  // other real article never reaches the store.
  //
  // Pagination is excluded by name rather than by testing for a single path
  // segment: one recorded alias is \`blog/telecom/iot-connectivity-strategies-2025\`,
  // which a segment test would silently drop.
  if (key.length > 5 &&
      key.lastIndexOf('blog/', 0) === 0 &&
      key.lastIndexOf('blog/page/', 0) !== 0) {
    try {
      var to = await kvs.get(key);
      if (to) {
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: { location: { value: to } }
        };
      }
    } catch (e) {
      // Not in the store, or the store is unreachable. Fall through and let the
      // origin answer rather than failing the request.
    }
  }

  // Anything carrying a file extension is a real object; leave it alone.
  var last = uri.substring(uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') !== -1) return req;

  // The site is built with trailingSlash: 'always'. Send the slashless form to
  // the canonical URL rather than serving the same page at two addresses.
  if (uri.charAt(uri.length - 1) !== '/') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: uri + '/' } }
    };
  }

  // /about-us/ -> /about-us/index.html, which is the key S3 actually holds.
  req.uri = uri + 'index.html';
  return req;
}
`;

const fnOut = path.join(PROJECT, 'scripts', '.cf-site-function.js');
const kvOut = path.join(PROJECT, 'scripts', '.cf-redirects.json');
await fs.writeFile(fnOut, fn, 'utf8');
await fs.writeFile(kvOut, JSON.stringify(store, null, 0), 'utf8');

/**
 * The same table again, batched into `--puts` payloads for
 * `aws cloudfront-keyvaluestore update-keys`.
 *
 * Written here rather than sliced in the shell because the payload is an array
 * of objects and quoting that through bash is where this kind of script breaks.
 * Each call needs the store's current ETag, which changes on every write, so
 * the shell re-reads it between batches — batching is not an optimisation, it
 * is the API's shape.
 */
const BATCH = 50;
const entries = Object.entries(store).map(([Key, Value]) => ({ Key, Value }));
const batchDir = path.join(PROJECT, 'scripts', '.cf-kvs-batches');
await fs.rm(batchDir, { recursive: true, force: true });
await fs.mkdir(batchDir, { recursive: true });
const batches = [];
for (let i = 0; i < entries.length; i += BATCH) {
  const file = path.join(batchDir, `${String(i / BATCH).padStart(3, '0')}.json`);
  await fs.writeFile(file, JSON.stringify(entries.slice(i, i + BATCH)), 'utf8');
  batches.push(file);
}

const bytes = Buffer.byteLength(fn, 'utf8');
const LIMIT = 10 * 1024;
process.stdout.write(
  `${Object.keys(embedded).length} embedded rules, ` +
  `${Object.keys(store).length} in the key-value store` +
  (selfReferential ? ` (${selfReferential} self-referential, skipped)` : '') +
  (shadowing ? ` (${shadowing} shadowing a real page, skipped)` : '') + '\n' +
  `${(bytes / 1024).toFixed(1)}KB of ${LIMIT / 1024}KB CloudFront Function limit\n` +
  `wrote ${path.relative(PROJECT, fnOut)}\n` +
  `wrote ${path.relative(PROJECT, kvOut)} ` +
  `(${(Buffer.byteLength(JSON.stringify(store)) / 1024).toFixed(1)}KB)\n` +
  `wrote ${batches.length} upload batch${batches.length === 1 ? '' : 'es'} to ` +
  `${path.relative(PROJECT, batchDir)}/\n`
);

if (bytes > LIMIT) {
  process.stdout.write(
    '\nStill too large. The embedded table has outgrown the function; move the\n' +
    'non-blog rules into the key-value store as well and gate them on a prefix\n' +
    'list, or drop the gate and look every path up.\n'
  );
  process.exit(1);
}
