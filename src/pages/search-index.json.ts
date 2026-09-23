/**
 * `/search-index.json` — what the blog search at /search/ searches.
 *
 * WordPress answered `/?s=` itself; a static site has nothing to ask, so the
 * search runs in the browser over this file. It is fetched only when someone
 * searches, never on page load.
 *
 * Each entry is the card itself (`CardData`, which the search page renders with
 * the same `renderCard` the blog index uses) plus `text`: the full excerpt and
 * the post's section headings, capped. Headings are what make a search find what an
 * article *covers* rather than only what its card says, at a fraction of the
 * weight of the bodies — 259 full posts would be several megabytes.
 *
 * Newest first, which is also the order ties are shown in.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { cardData, decodeEntities } from '../lib/post-card';

/** Search text kept per post, in characters: the excerpt, then the outline. */
const TEXT_MAX = 450;

const text = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\[&hellip;\]|&hellip;/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime()
  );

  const index = posts.map(post => {
    const headings = [...post.data.content.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)]
      .map(([, h]) => text(h))
      .filter(Boolean)
      .join(' · ');
    // The blog card shows no author, so the index does not carry one.
    const { author: _author, ...card } = cardData(post);
    return { ...card, text: `${text(post.data.excerpt)} ${headings}`.slice(0, TEXT_MAX).trim() };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
