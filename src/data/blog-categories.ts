/**
 * WordPress serves posts at /<category-slug>/<post-slug>/, not /blog/<slug>.
 * These slugs were verified against the live site — changing them breaks
 * every inbound link and internal cross-link in the blog content.
 */
export const CATEGORY_SLUGS: Record<string, string> = {
  Telecom: 'telecom',
  MVNO: 'mvno',
  eSIM: 'esim',
  'Spenza Platform': 'spenza-product',
  TEM: 'tem',
  IoT: 'iot',
  BYOD: 'byod',
};

/** Fallback keeps an unmapped category from silently dropping its posts. */
export function categorySlug(category: string | undefined): string {
  if (!category) return 'telecom';
  return (
    CATEGORY_SLUGS[category] ??
    category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );
}

/** The canonical WordPress URL for a post. */
export function postUrl(category: string | undefined, slug: string): string {
  return `/${categorySlug(category)}/${slug}/`;
}
