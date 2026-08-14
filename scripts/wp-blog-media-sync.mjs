// Download blog media the repo does not have.
//
// The mirror captured media for the posts that existed when it last ran. Posts
// published since arrive through the headless loader with their images pointing
// at /wp-content/uploads/..., which resolves to nothing locally — so a new
// post's featured image 404s.
//
// STOPGAP. The real fix is serving blog media from its own host (MEDIA_ORIGIN),
// at which point the repo stops carrying any of it and this script goes away.
// Until then this keeps new posts renderable.
//
// Uploads are publicly readable, so no session is needed.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, WP_ORIGIN } from './lib/config.mjs';
import { wpQuery, wpPaginate } from './lib/wp-graphql.mjs';

const PUB = path.join(PROJECT, 'public');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** Site-relative upload paths referenced anywhere in a post. */
const UPLOAD_RE = /\/wp-content\/uploads\/[A-Za-z0-9._\/@-]+?\.(?:png|jpe?g|gif|webp|svg|avif|pdf|mp4|webm)/gi;

const BATCH = 10;

process.stdout.write('reading posts from WordPress…\n');

const index = await wpPaginate(
  cursor => `{posts(first:100${cursor ? `,after:"${cursor}"` : ''},` +
    `where:{status:PUBLISH}){pageInfo{hasNextPage endCursor} nodes{slug}}}`,
  d => d.posts,
  { pageSize: 100 }
);

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
  process.stdout.write(`  scanned ${Math.min(i + BATCH, index.length)}/${index.length} posts, ${refs.size} refs\r`);
}

const missing = [...refs].filter(rel => !existsSync(path.join(PUB, rel)));
process.stdout.write(
  `\n\n${refs.size} media references, ${missing.length} missing locally\n`
);

if (!missing.length) {
  process.stdout.write('nothing to download\n');
} else {
  let ok = 0;
  const failed = [];
  const CONCURRENCY = 8;

  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    await Promise.all(missing.slice(i, i + CONCURRENCY).map(async rel => {
      const dest = path.join(PUB, rel);
      try {
        const res = await fetch(WP_ORIGIN + encodeURI(rel), { headers: { 'User-Agent': UA } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
        ok++;
      } catch (e) {
        failed.push(`${rel} -> ${e.message}`);
      }
    }));
    process.stdout.write(`  downloaded ${ok}/${missing.length}\r`);
  }

  process.stdout.write(`\ndownloaded ${ok}, failed ${failed.length}\n`);
  if (failed.length) {
    process.stdout.write(failed.slice(0, 10).join('\n') + '\n');
  }
}
