// Push media that WordPress has and the bucket does not, then rewrite the
// manifest from the bucket.
//
// `wp:blog-media-sync` diffs against `public/` — right on a workstation that
// carries the media, wrong in CI, where a fresh clone has none and the diff
// would re-download all 2.2GB on every run. The bucket is the source of truth
// now, so this diffs against that instead: list the keys, ask WordPress what
// the posts reference, and move only the difference.
//
// Also fetches each new image's WebP Express twin. Without it a new post's
// images work but lose their `<picture>` source, and the loss is silent.
//
// Requires the AWS CLI and credentials.  npm run wp:media-sync-s3
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PROJECT, WP_ORIGIN, WEBP_PATH } from './lib/config.mjs';
import { wpQuery, wpPaginate } from './lib/wp-graphql.mjs';

const execFileAsync = promisify(execFile);

/**
 * The AWS CLI is Python, and on Windows it writes using the console codepage —
 * which cannot encode the non-breaking hyphen in some mirrored filenames, so
 * listing the bucket dies with a charmap error partway through 11,000 keys.
 *
 * `PYTHONUTF8` is what fixes it, not `PYTHONIOENCODING`: v2 ships a frozen
 * interpreter that ignores the latter. Harmless on Linux, where CI runs and the
 * default is already UTF-8. AWS_PAGER is cleared so the CLI never tries to open
 * a pager on a non-interactive stdout.
 */
const AWS_ENV = { ...process.env, PYTHONUTF8: '1', AWS_PAGER: '' };
const run = (cmd, args, opts = {}) => execFileAsync(cmd, args, { ...opts, env: AWS_ENV });

const BUCKET = process.env.MEDIA_BUCKET || 'spenza-media';
const BATCH = 10;
const CONCURRENCY = 8;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const UPLOAD_RE = /\/wp-content\/uploads\/[A-Za-z0-9._\/@-]+?\.(?:png|jpe?g|gif|webp|svg|avif|pdf|mp4|webm)/gi;

const out = s => process.stdout.write(s);

/** Every key under a prefix. The CLI paginates on its own. */
async function listKeys(prefix) {
  const { stdout } = await run('aws', [
    's3api', 'list-objects-v2',
    '--bucket', BUCKET,
    '--prefix', prefix,
    '--query', 'Contents[].Key',
    '--output', 'json',
  ], { maxBuffer: 256 * 1024 * 1024 });
  return JSON.parse(stdout || 'null') ?? [];
}

out(`listing s3://${BUCKET}…\n`);
const inBucket = new Set([
  ...(await listKeys('wp-content/')),
  ...(await listKeys(WEBP_PATH.replace(/^\//, ''))),
]);
out(`  ${inBucket.size.toLocaleString()} objects\n\n`);

// ---- what the posts actually reference ------------------------------------
//
// WordPress being unreachable is not a reason to fail a deploy. The bucket
// already holds every image the last successful run knew about, and the build
// can proceed from its cached content store, so an outage here costs new
// media - which the next good run picks up - rather than blocking an
// unrelated change from shipping.
//
// Only a connection-level failure is treated that way. A malformed response
// or a rejected query is a real fault and still throws.
function unreachable(err) {
  return /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|timed out|aborted/i
    .test(err?.message ?? '');
}

out('reading posts from WordPress\n');
let index;
try {
  index = await wpPaginate(
    cursor => `{posts(first:100${cursor ? `,after:"${cursor}"` : ''},` +
      `where:{status:PUBLISH}){pageInfo{hasNextPage endCursor} nodes{slug}}}`,
    d => d.posts,
    { pageSize: 100 }
  );
} catch (err) {
  if (!unreachable(err)) throw err;
  out(`\nWordPress is unreachable from here: ${err.message}\n` +
      `Skipping the media sync. The bucket keeps what it already has, and the\n` +
      `next run that can reach WordPress picks up anything new.\n`);
  process.exit(0);
}

const refs = new Set();
for (let i = 0; i < index.length; i += BATCH) {
  const names = index.slice(i, i + BATCH).map(p => JSON.stringify(p.slug)).join(',');
  const data = await wpQuery(
    `{posts(first:${BATCH},where:{nameIn:[${names}],status:PUBLISH}){nodes{` +
    `content featuredImage{node{sourceUrl}}}}}`
  );
  for (const node of data.posts?.nodes ?? []) {
    const blob = (node.content ?? '') + ' ' + (node.featuredImage?.node?.sourceUrl ?? '');
    for (const m of blob.replace(/\\\//g, '/').matchAll(UPLOAD_RE)) {
      refs.add(decodeURIComponent(m[0]).split('?')[0]);
    }
  }
  out(`  scanned ${Math.min(i + BATCH, index.length)}/${index.length} posts, ${refs.size} refs\r`);
}
out('\n\n');

// A key is the path without its leading slash.
const missing = [...refs].filter(rel => !inBucket.has(rel.slice(1)));
out(`${refs.size.toLocaleString()} references, ${missing.length} not in the bucket\n\n`);

// ---- move the difference ---------------------------------------------------
const TMP = path.join(PROJECT, '.wp-cache', 'media-sync');
let uploaded = 0, webpUploaded = 0;
const failed = [];

/** Fetch one URL and put it in the bucket under `key`. */
async function transfer(url, key, contentType) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return false;
  const local = path.join(TMP, key);
  await fs.mkdir(path.dirname(local), { recursive: true });
  await fs.writeFile(local, Buffer.from(await res.arrayBuffer()));
  const args = ['s3', 'cp', local, `s3://${BUCKET}/${key}`,
    '--cache-control', 'public, max-age=2592000', '--only-show-errors'];
  if (contentType) args.push('--content-type', contentType);
  await run('aws', args);
  inBucket.add(key);
  return true;
}

for (let i = 0; i < missing.length; i += CONCURRENCY) {
  await Promise.all(missing.slice(i, i + CONCURRENCY).map(async rel => {
    const key = rel.slice(1);
    try {
      if (!(await transfer(WP_ORIGIN + encodeURI(rel), key))) {
        failed.push(`${rel} (origin said no)`);
        return;
      }
      uploaded++;

      // The WebP twin, if WordPress made one. A miss is normal and not an
      // error — the page just serves the original without a <picture>.
      const variant = `${WEBP_PATH.slice(1)}webp-images/uploads/${key.replace('wp-content/uploads/', '')}.webp`;
      if (inBucket.has(variant)) return;
      const webpUrl = `${WP_ORIGIN}/wp-content/webp-express/webp-images/uploads/` +
        encodeURI(rel.replace('/wp-content/uploads/', '')) + '.webp';
      if (await transfer(webpUrl, variant, 'image/webp')) webpUploaded++;
    } catch (e) {
      failed.push(`${rel} (${e.message})`);
    }
  }));
  if (missing.length) out(`  uploaded ${uploaded}/${missing.length}\r`);
}
if (missing.length) out('\n');

await fs.rm(TMP, { recursive: true, force: true });

// ---- the manifest reflects the bucket --------------------------------------
const manifest = [...inBucket].map(k => '/' + k).sort();
const dest = path.join(PROJECT, 'src', 'data', 'wp-media-manifest.json');
const before = await fs.readFile(dest, 'utf8').catch(() => '');
const after = JSON.stringify(manifest) + '\n';
if (before !== after) await fs.writeFile(dest, after, 'utf8');

out(
  `\nuploaded ${uploaded} images` +
  (webpUploaded ? ` and ${webpUploaded} WebP variants` : '') + '\n' +
  `manifest: ${manifest.length.toLocaleString()} files` +
  (before === after ? ' (unchanged)' : ' (updated)') + '\n'
);

if (failed.length) {
  out(`\n${failed.length} could not be fetched:\n  ${failed.slice(0, 10).join('\n  ')}\n`);
  // Not fatal. A referenced file WordPress will not serve is a content problem,
  // and failing the deploy over it would block every unrelated change too.
}
