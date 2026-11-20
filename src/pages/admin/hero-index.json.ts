/**
 * `/admin/hero-index.json`: slug -> hero thumbnail, for the editor's grid view.
 *
 * Decap draws a card image only from a top-level image field, and the hero sits inside an
 * object (and, for imported posts, is a plain path), so the grid shows titles and no pictures.
 * `public/admin/grid-heroes.js` reads this file and puts the hero on each card. The URLs are
 * the ones the live site serves, so imported and new posts resolve the same way.
 *
 * Imported posts carry WordPress' size list; the smallest candidate of 300px or more is used so
 * the grid does not pull 130 full-size PNGs. The full URL is the fallback if that size is absent.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function thumb(srcSet: string | undefined): string | null {
  if (!srcSet) return null;
  const sizes = srcSet
    .split(',')
    .map(c => c.trim().split(/\s+/))
    .map(([url, w]) => ({ url, w: parseInt(w, 10) }))
    .filter(c => c.url && c.w >= 300)
    .sort((a, b) => a.w - b.w);
  return sizes[0]?.url ?? null;
}

export const GET: APIRoute = async () => {
  const index: Record<string, { url: string; thumb?: string }> = {};
  for (const post of await getCollection('posts')) {
    const img = post.data.featuredImage;
    if (!img?.url) continue;
    const small = thumb(img.srcSet);
    index[post.data.slug] = small && small !== img.url ? { url: img.url, thumb: small } : { url: img.url };
  }
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
