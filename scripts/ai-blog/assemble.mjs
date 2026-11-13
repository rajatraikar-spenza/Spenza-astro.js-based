// Turn a finished draft (and images) into the files the site builds from, then
// prove they build by running them through the same renderer the site uses.
import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import { loadEntry, AUTHORS, CATEGORIES } from '../lib/cms-post.mjs';

export function slugify(title) {
  const s = String(title).toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length <= 60) return s;
  // cut on a word boundary
  const cut = s.slice(0, 60);
  return cut.slice(0, Math.max(cut.lastIndexOf('-'), 30)).replace(/-+$/, '');
}

export function validateInputs(i) {
  const errs = [];
  if (!i.title?.trim()) errs.push('title is required');
  if (i.title && i.title.length > 140) errs.push('title is longer than 140 characters');
  if (!i.brief?.trim() || i.brief.trim().length < 20) errs.push('the description needs at least a sentence or two');
  if (!CATEGORIES.includes(i.category)) errs.push(`category must be one of ${CATEGORIES.join(', ')}`);
  if (!AUTHORS[i.author]) errs.push(`author must be one of ${Object.keys(AUTHORS).join(', ')}`);
  return errs;
}

export function entryMeta({ inputs, draft, slug, now, imagePaths, ai }) {
  return {
    title: inputs.title.trim(),
    slug,
    category: inputs.category,
    author: inputs.author,
    description: draft.description,
    publishedDate: now.toISOString(),
    focusKeyword: draft.focusKeyword || inputs.focusKeyword || undefined,
    tags: draft.tags,
    hero: { image: imagePaths?.hero ?? '', alt: draft.heroAlt },
    bodyImage: { image: imagePaths?.body ?? '', alt: draft.bodyImage.alt, caption: draft.bodyImage.caption, afterSection: draft.bodyImage.afterSection },
    tldr: draft.tldr,
    faq: draft.faq,
    ai,
  };
}

export const entryText = (meta, body) => `---\n${stringify(meta, { lineWidth: 0 })}---\n\n${body.trim()}\n`;

/** Write the entry and its images under the repo; returns the files written. */
export function writeEntry({ root, slug, meta, body, images }) {
  const postsDir = path.join(root, 'src', 'content', 'cms-blog');
  const mediaDir = path.join(root, 'public', 'cms-media', slug);
  const written = [];
  if (images) {
    fs.mkdirSync(mediaDir, { recursive: true });
    for (const [name, buf] of [['hero.webp', images.hero], ['body.webp', images.body]]) {
      fs.writeFileSync(path.join(mediaDir, name), buf);
      written.push(path.join('public', 'cms-media', slug, name));
    }
  }
  fs.mkdirSync(postsDir, { recursive: true });
  const file = path.join(postsDir, `${slug}.mdx`);
  fs.writeFileSync(file, entryText(meta, body));
  written.push(path.join('src', 'content', 'cms-blog', `${slug}.mdx`));
  return { file, written };
}

/** Run the written entry through the site's own loader. */
export async function proveBuilds({ root, file, siteUrl }) {
  return loadEntry(file, { siteUrl, publicDir: path.join(root, 'public'), now: new Date('2999-01-01') });
}
