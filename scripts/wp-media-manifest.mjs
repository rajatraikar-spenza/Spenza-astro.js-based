// List every mirrored media file, so the build can check one exists without
// the bytes being present.
//
// WordPress names intermediate image sizes it did not always generate, and
// WebP Express only has a `.webp` twin for what it processed. `loop-item.ts`
// therefore checks each srcset candidate and each WebP source before emitting
// it — a guess there puts 404s in `srcset` and shows a reader a broken
// thumbnail. That check used `existsSync` against `public/`, which meant 2.2GB
// of media had to sit in the repository purely so the build could ask whether a
// filename existed.
//
// The media lives in S3 now. This records the filenames — around 800KB against
// 2.2GB — and `src/lib/media-manifest.ts` answers the same question from it.
//
// Re-run after anything that adds media:  npm run wp:media-manifest
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT, WEBP_PATH } from './lib/config.mjs';

const PUB = path.join(PROJECT, 'public');

/** The two trees served from the media host. */
const TREES = ['wp-content', WEBP_PATH.replace(/^\/|\/$/g, '')];

async function walk(dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const paths = [];
for (const tree of TREES) {
  for (const file of await walk(path.join(PUB, tree))) {
    // Site-absolute, forward slashes — the form the markup uses.
    paths.push('/' + path.relative(PUB, file).split(path.sep).join('/'));
  }
}

if (!paths.length) {
  process.stderr.write(
    'No media found under public/. The manifest would be empty, which would make\n' +
    'every srcset candidate look missing and strip them from the build.\n' +
    'Run `npm run wp:blog-media-sync` first, or restore the media trees.\n'
  );
  process.exit(1);
}

paths.sort();
const out = path.join(PROJECT, 'src', 'data', 'wp-media-manifest.json');
await fs.writeFile(out, JSON.stringify(paths) + '\n', 'utf8');

const bytes = (await fs.stat(out)).size;
process.stdout.write(
  `${paths.length.toLocaleString()} media files listed\n` +
  `wrote src/data/wp-media-manifest.json (${(bytes / 1024).toFixed(0)}KB)\n`
);
