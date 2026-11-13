#!/usr/bin/env node
// Validate every admin-written post (src/content/cms-blog/*.mdx) the way the site
// build will, and report problems as GitHub annotations.
//
// Run on every pull request that touches an entry (.github/workflows/cms-validate.yml)
// so an editor sees "the hero image is missing" on the PR, in the editor's status
// checks, rather than finding out that the post simply never appeared on the site.
//   exit 1  an entry has errors (it would NOT publish)
//   exit 0  all entries valid (warnings are advice)
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { listEntries, loadEntry, parseEntry } from './lib/cms-post.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = process.env.CMS_POSTS_DIR ? path.resolve(process.env.CMS_POSTS_DIR) : path.join(ROOT, 'src', 'content', 'cms-blog');
const publicDir = process.env.CMS_PUBLIC_DIR ? path.resolve(process.env.CMS_PUBLIC_DIR) : path.join(ROOT, 'public');
const siteUrl = process.env.SITE_URL || 'https://spenza.com';

const files = listEntries(postsDir);
let failed = 0;
const slugs = new Map();

for (const file of files) {
  const rel = path.relative(ROOT, file);
  let result;
  try {
    // A far-future "now": a scheduled post must still be validated.
    result = await loadEntry(file, { siteUrl, publicDir, now: new Date('2999-01-01') });
  } catch (err) {
    result = { errors: [err.message], warnings: [] };
  }
  const { errors, warnings } = result;

  // Image weight is advice: the editor can upload a 3 MB photo, and every reader pays for it.
  try {
    const { meta } = parseEntry(fs.readFileSync(file, 'utf8'), rel);
    for (const img of [meta.hero?.image, meta.bodyImage?.image].filter(Boolean)) {
      const p = path.join(publicDir, img.replace(/^\//, ''));
      if (fs.existsSync(p) && fs.statSync(p).size > 400_000) warnings.push(`${img} is ${(fs.statSync(p).size / 1024) | 0} KB; compress it (WebP, under 200 KB is the house standard)`);
    }
    if (meta.slug) {
      if (slugs.has(meta.slug)) errors.push(`slug "${meta.slug}" is also used by ${slugs.get(meta.slug)}`);
      slugs.set(meta.slug, rel);
    }
  } catch { /* parse errors were already reported by loadEntry */ }

  for (const e of errors) console.log(`::error file=${rel}::${e}`);
  for (const w of warnings) console.log(`::warning file=${rel}::${w}`);
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${rel}${warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''}`);
  if (errors.length) failed += 1;
}

console.log(`\n${files.length} entr${files.length === 1 ? 'y' : 'ies'} checked, ${failed} with errors.`);
process.exit(failed ? 1 : 0);
