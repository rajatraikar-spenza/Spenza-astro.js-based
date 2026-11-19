/** Shared data helpers for the guest blog list and article pages. */
import { getCollection, type CollectionEntry } from 'astro:content';
import TAGS from '../content/cms-meta/tags.json';

export const GUEST = 'guest-blogs';

export const tagLabels: Record<string, string> = Object.fromEntries(TAGS.tags.map(t => [t.slug, t.label]));

export async function guestPosts(): Promise<CollectionEntry<'posts'>[]> {
  return (await getCollection('posts'))
    .filter(p => p.data.category === GUEST)
    .sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime());
}

export function topicsOf(posts: CollectionEntry<'posts'>[], max = 12): [string, number][] {
  const n = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) n.set(t, (n.get(t) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, max);
}

/** Visible words of a post body: styles, scripts and tags dropped. */
export function plainText(html: string): string {
  return (html || '')
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}
