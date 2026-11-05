/**
 * How /sitemap/ groups and labels the URLs that /sitemap.xml lists.
 *
 * The list itself is never written here: `scripts/lib/sitemap-page-integration.mjs`
 * reads the finished `dist/sitemap.xml` and files each URL under one of these
 * groups, so a page added to (or removed from) the XML sitemap appears on the
 * HTML one on the same build. This file only says what to call things.
 *
 * Anything the XML lists that is not named here still appears: a top-level page
 * falls into "More pages" under its own title, and a post under a category not
 * named here falls into a group made from the category slug.
 */

/** Top-level pages, in the order they are listed within their group. */
export const PAGE_GROUPS = [
  {
    id: 'platform',
    title: 'Platform and solutions',
    blurb: 'The MVNE platform, the three hubs and the solution pages.',
    pages: [
      ['/mvne/', 'MVNE platform'],
      ['/uxhub/', 'UX Hub'],
      ['/telecomhub/', 'Telecom Hub'],
      ['/controlhub/', 'Control Hub'],
      ['/iot-solutions/', 'IoT solutions'],
      ['/connected-devices/', 'Connected devices'],
      ['/voice-observability-solution/', 'Voice observability'],
      ['/ai-phone-number/', 'AI phone numbers'],
      ['/local-numbers/', 'Local numbers'],
      ['/amazon-delivery-service-partner-dsp-mobile-service/', 'Mobile service for Amazon DSPs'],
    ],
  },
  {
    id: 'plans',
    title: 'Plans and pricing',
    blurb: 'Data plans, roaming packs and travel eSIMs.',
    pages: [
      ['/unlimited-data-plans-pricing/', 'Unlimited data plans and pricing'],
      ['/business-roaming-packs/', 'Business roaming packs'],
      ['/travel-esim/', 'Travel eSIM'],
    ],
  },
  {
    id: 'tools',
    title: 'Tools and learning',
    blurb: 'Calculators, checkers and the launch academy.',
    pages: [
      ['/mvno-calculator/', 'MVNO calculator'],
      ['/esim-compatibility-checker/', 'eSIM compatibility checker'],
      ['/esim-phones/', 'eSIM phones'],
      ['/mvno-launch-academy/', 'MVNO launch academy'],
      ['/faq/', 'FAQ'],
      ['/ai-info.md', 'About Spenza for AI assistants (Markdown)'],
    ],
  },
  {
    id: 'company',
    title: 'Company and support',
    blurb: 'Who we are, how to reach us and where to get help.',
    pages: [
      ['/', 'Home'],
      ['/about-us/', 'About Spenza'],
      ['/careers/', 'Careers'],
      ['/contact-us/', 'Contact us'],
      ['/support/', 'Support'],
      ['/exceptional-24-7-support-for-your-business-needs/', '24/7 support for business'],
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    blurb: 'Terms, privacy and data processing.',
    pages: [
      ['/privacy-policy/', 'Privacy policy'],
      ['/terms-of-service/', 'Terms of service'],
      ['/sub-processors/', 'Sub-processors'],
      ['/network-operator-terms-of-service/', 'Network operator terms of service'],
    ],
  },
];

/**
 * Blog categories, in reading order. The first path segment of a post is its
 * category slug; `title` is what the section is called here, not the label the
 * blog index uses.
 */
export const BLOG_GROUPS = [
  { slug: 'mvno', title: 'MVNO and MVNE', blurb: 'Launching, running and growing a mobile virtual network.' },
  { slug: 'esim', title: 'eSIM and provisioning', blurb: 'eSIM standards, remote provisioning and enterprise eSIM.' },
  { slug: 'iot', title: 'IoT connectivity', blurb: 'IoT SIMs, platforms, standards and costs.' },
  { slug: 'telecom', title: 'Telecom', blurb: 'Telecom basics, resellers, MSPs, voice and consumer carriers.' },
  { slug: 'tem', title: 'Telecom expense management', blurb: 'TEM, invoice audits and telecom spend.' },
  { slug: 'byod', title: 'BYOD and enterprise mobility', blurb: 'BYOD policy and mobile device programs.' },
  { slug: 'spenza-product', title: 'Spenza platform guides and case studies', blurb: 'Product guides and customer stories.' },
];

/** Archive pages worth a link. Paginated copies (`/page/2/`) are counted, not listed. */
export const ARCHIVE_TITLES = {
  '/blog/': 'All articles',
  '/category/mvno/': 'MVNO archive',
  '/category/esim/': 'eSIM archive',
  '/category/iot/': 'IoT archive',
  '/category/telecom/': 'Telecom archive',
  '/category/tem/': 'TEM archive',
  '/category/byod/': 'BYOD archive',
  '/category/spenza-product/': 'Spenza platform archive',
};

/** Page names for URLs the XML lists that no group above names. */
export const AUTHOR_LABEL = slug => slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
