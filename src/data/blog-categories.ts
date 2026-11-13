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

import CMS_CATEGORIES from '../content/cms-meta/categories.json';

/**
 * slug -> display name, for breadcrumbs and category pills. Categories managed
 * in the admin (Settings > Categories) are added on top of the WordPress seven,
 * and win where they name the same slug.
 */
const LABELS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(CATEGORY_SLUGS).map(([name, slug]) => [slug, name])),
  ...Object.fromEntries(CMS_CATEGORIES.categories.map(c => [c.slug, c.label])),
};

/** Intro text set for a category in the admin, if any. */
export const categoryIntro = (slug: string): string =>
  CMS_CATEGORIES.categories.find(c => c.slug === slug)?.intro ?? '';

/**
 * The display name for a category slug. Falls back to title-casing the slug so
 * a category added in WordPress renders sensibly before anyone maps it here.
 */
export function categoryLabel(slug: string): string {
  return LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
