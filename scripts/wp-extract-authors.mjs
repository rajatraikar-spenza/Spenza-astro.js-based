// Author name, bio and avatar, for the three people who write the blog.
//
// WPGraphQL answers `author.avatar` with null for anonymous requests, even
// though WordPress renders a gravatar into the HTML of every archive it serves
// — the field is gated, not absent. So the avatar is recovered from the
// mirrored markup, where WordPress already wrote it, and matched to the author
// records the API does return.
//
// Without this, `post-card.ts` renders the name with no picture (it only emits
// the image when there is a URL) and the post page shows whatever avatar the
// sample post happened to have.
//
//   npm run wp:authors
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';
import { wpQuery, wpPaginate } from './lib/wp-graphql.mjs';

const PARTIALS = path.join(PROJECT, 'src', 'partials');
const OUT = path.join(PROJECT, 'src', 'data', 'wp-authors.json');

const out = s => process.stdout.write(s);

/** `<img src="…gravatar…" alt="Picture of NAME">`, as Elementor's author box writes it. */
const AVATAR_RE =
  /<img\s+src="(https:\/\/secure\.gravatar\.com\/[^"]+)"\s+alt="Picture of ([^"]+)"/g;

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// ---- avatars, from what WordPress already rendered -------------------------
const byName = new Map();
for (const file of await walk(PARTIALS)) {
  const html = await fs.readFile(file, 'utf8');
  for (const [, url, name] of html.matchAll(AVATAR_RE)) {
    // Entities as WordPress wrote them; the value is used as an attribute.
    if (!byName.has(name)) byName.set(name, url.replace(/&#0?38;/g, '&'));
  }
}
out(`${byName.size} avatars found in the mirrored markup\n`);

// ---- the author records the API does return --------------------------------
const posts = await wpPaginate(
  cursor => `{posts(first:100${cursor ? `,after:"${cursor}"` : ''},where:{status:PUBLISH})` +
    `{pageInfo{hasNextPage endCursor} nodes{author{node{name slug description}}}}}`,
  d => d.posts,
  { pageSize: 100 }
);

const authors = {};
for (const p of posts) {
  const a = p.author?.node;
  if (!a?.slug || authors[a.slug]) continue;
  authors[a.slug] = {
    name: a.name ?? '',
    // Yoast and the author box both render this; it is the line under the name
    // on a post page, and it was empty on every post.
    description: a.description ?? '',
    avatar: byName.get(a.name) ?? '',
  };
}

await fs.writeFile(OUT, JSON.stringify(authors, null, 2) + '\n', 'utf8');

for (const [slug, a] of Object.entries(authors)) {
  out(`  ${slug.padEnd(14)} ${a.avatar ? 'avatar' : 'NO AVATAR'}  ` +
      `${a.description ? 'bio' : 'no bio'}  ${a.name}\n`);
}
out(`wrote src/data/wp-authors.json (${Object.keys(authors).length} authors)\n`);

const noAvatar = Object.entries(authors).filter(([, a]) => !a.avatar);
if (noAvatar.length) {
  out(`\n${noAvatar.length} author(s) have no avatar in the mirrored markup.\n` +
      `They will render as a name with no picture, which is what happens today.\n` +
      `Re-run the mirror so an archive page carrying them is captured.\n`);
}
