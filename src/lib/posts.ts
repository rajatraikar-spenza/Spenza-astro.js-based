/** Posts for the blog proper. Guest posts live only at /blog/guest-blogs/ and /guest-blogs/<slug>/. */
import { getCollection, type CollectionEntry } from 'astro:content';

export const GUEST_CATEGORY = 'guest-blogs';
export const isGuestPost = (p: CollectionEntry<'posts'>) => p.data.category === GUEST_CATEGORY;

/** Every post except the guest posts: the blog index, archives, tags, search, related cards. */
export async function blogPosts(): Promise<CollectionEntry<'posts'>[]> {
  return (await getCollection('posts')).filter(p => !isGuestPost(p));
}
