// Snapshot the ACF blocks the Elementor single-post template renders.
//
// STOPGAP. These four fields (tldr_heading, tldr_description, and the 2_col /
// 1_col repeaters) are not exposed over WPGraphQL, so the headless loader
// cannot see them. They *are* readable over the authenticated REST API, so this
// pulls them once into src/data/wp-acf-blocks.json and the loader merges them in.
//
// Why this is temporary: it is a point-in-time copy behind an admin session, so
// a post published later has no entry until someone re-runs it — exactly the
// staleness the headless move exists to remove. Once
// wordpress/mu-plugins/spenza-graphql-acf.php is installed the loader gets these
// from GraphQL directly and this file and script should be deleted.
//
// Needs a live session: npm run wp:check-session
import fs from 'node:fs/promises';
import path from 'node:path';
import { cookieHeader, ORIGIN, PROJECT } from './lib/wp-mirror.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const OUT = path.join(PROJECT, 'src', 'data', 'wp-acf-blocks.json');

/**
 * Privileged REST reads need a nonce as well as the cookie; without it
 * WordPress answers 401 even for a valid admin session. Admin pages embed one.
 */
async function restNonce() {
  const res = await fetch(`${ORIGIN}/wp-admin/`, { headers: { Cookie: cookieHeader, 'User-Agent': UA } });
  if (!res.ok) throw new Error(`cannot load /wp-admin/ (HTTP ${res.status}) — run npm run wp:check-session`);
  const html = await res.text();
  const m = html.match(/wpApiSettings\s*=\s*\{[^}]*"nonce":"([a-f0-9]+)"/);
  if (!m) throw new Error('no REST nonce found on the admin page — session may be stale');
  return m[1];
}

const nonce = await restNonce();
const headers = { Cookie: cookieHeader, 'User-Agent': UA, 'X-WP-Nonce': nonce };

/** Keep only the sub-fields the front end renders. */
const rows = value => Array.isArray(value)
  ? value
      .filter(r => r && typeof r === 'object')
      .map(r => ({
        icon: typeof r.icon === 'string' ? r.icon : '',
        title: typeof r.title === 'string' ? r.title : '',
        text: typeof r.text === 'string' ? r.text : '',
      }))
  : [];

const out = {};
let page = 1, total = 0, withBlocks = 0;

for (;;) {
  const url = `${ORIGIN}/wp-json/wp/v2/posts?per_page=50&page=${page}` +
    `&context=edit&status=publish&_fields=slug,acf`;
  const res = await fetch(url, { headers });
  if (res.status === 400) break; // past the last page
  if (!res.ok) throw new Error(`posts page ${page}: HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);

  const batch = await res.json();
  if (!batch.length) break;

  for (const p of batch) {
    total++;
    const acf = p.acf || {};
    const entry = {
      tldrHeading: typeof acf.tldr_heading === 'string' ? acf.tldr_heading : '',
      tldrDescription: typeof acf.tldr_description === 'string' ? acf.tldr_description : '',
      twoCol: rows(acf['2_col']),
      oneCol: rows(acf['1_col']),
    };
    const has = entry.tldrDescription || entry.twoCol.length || entry.oneCol.length;
    if (has) withBlocks++;
    out[p.slug] = entry;
  }

  process.stdout.write(`  page ${page}: ${total} posts\r`);
  if (batch.length < 50) break;
  page++;
}

await fs.writeFile(OUT, JSON.stringify(out, null, 2), 'utf8');

process.stdout.write(
  `\nsnapshotted ${total} posts, ${withBlocks} carrying ACF blocks\n` +
  `wrote src/data/wp-acf-blocks.json (${((await fs.stat(OUT)).size / 1024).toFixed(0)}KB)\n\n` +
  `Temporary: delete this file and the script once the mu-plugin exposes\n` +
  `postExtras over GraphQL.\n`
);
