/**
 * Merge previews: what a consolidated post would look like, before anything is
 * merged in WordPress.
 *
 * The content audit (workbook, 8 Sep 2026) proposes 88 donor posts merged into
 * 44 destinations. Each of those is an editorial decision someone has to sign
 * off, and a paragraph in a spreadsheet is not something a marketing team can
 * judge. These entries render the *proposed* merged article through the real
 * `ArticleLayout`, at `/preview/merged/<slug>/`, so the decision is made
 * against the actual page rather than a description of it.
 *
 * Nothing here touches production:
 *  - `/preview/` is already excluded from the sitemap (see astro.config.mjs).
 *  - `seo.fullHead` below carries `noindex, nofollow`.
 *  - The destination post keeps serving its current content until the merge is
 *    actually performed in WordPress.
 *
 * A preview is deliberately *not* the merge. The merge is three separate acts:
 * publish the merged body on the destination in WordPress, unpublish the
 * donors, and add the donor -> destination pairs to `site-redirects.mjs`. This
 * file only answers "should we?".
 */

export interface MergeDonor {
  /** Path on this site, exactly as it appears in the merge plan. */
  path: string;
  title: string;
  /** Search Console clicks over the audit's 16-month window. */
  clicks: number;
  /** What the workbook says this donor contributes to the merged article. */
  contributes: string;
}

export interface MergePreview {
  /** Destination slug — the surviving post. */
  slug: string;
  /** URL folder, which the merge does not change. */
  category: string;
  /** Workbook cluster name, for the review banner. */
  cluster: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
  publishedDate: string;
  updatedDate: string;
  authorSlug: 'isimplexity' | 'sivasai' | 'vinay';
  authorName: string;
  /** The destination as it stands today, for the before/after count. */
  destinationWords: number;
  donors: MergeDonor[];
  /** Merged body, authored as Gutenberg-shaped HTML. */
  content: string;
}

import launchMvnoUsGuide from './launch-mvno-us-guide.html?raw';

export const MERGE_PREVIEWS: Record<string, MergePreview> = {
  'launch-mvno-us-guide': {
    slug: 'launch-mvno-us-guide',
    category: 'mvno',
    cluster: 'US MVNO launch (H1 — MVNO & MVNE)',
    title: 'How to Launch MVNO US Operations: 2026 Playbook',
    excerpt:
      'Launch MVNO US operations in 2026: business models, real costs, FCC compliance, eSIM, 5G slicing, and the 10-step playbook — plus which niches are working and what to check before you go live.',
    seoTitle: 'How to Launch an MVNO in the US: Requirements, Costs and Operating Plan',
    seoDescription:
      'Launch MVNO US operations in 2026 with this step-by-step guide to models, costs, FCC compliance, eSIM, 5G, and choosing the right MVNE partner.',
    featuredImage: 'https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png',
    publishedDate: '2026-04-22T11:11:00+00:00',
    updatedDate: '2026-07-17T04:49:14+00:00',
    authorSlug: 'sivasai',
    authorName: 'SivaSai',
    destinationWords: 4039,
    donors: [
      {
        path: '/mvno/how-to-set-up-mvno/',
        title: 'MVNO 2026 Setup: How to Launch Step by Step',
        clicks: 31,
        contributes: 'Market landscape, traditional-vs-MVNE framing, FAQ material',
      },
      {
        path: '/mvno/launch-us-mvno-now/',
        title: 'MVNO US Launch: Why 2026 Is the Right Moment',
        clicks: 33,
        contributes: 'Niche opportunity table, 2026 launch checklist',
      },
      {
        path: '/mvno/us-mvno-introduction/',
        title: 'MVNOs in the US Market: Impact on Telecom',
        clicks: 18,
        contributes: 'How MVNOs compete, challenges, Consumer Cellular / Mint, partnerships',
      },
      {
        path: '/mvno/top-10-tips-launching-mvno-us-2025/',
        title: 'Top 10 Tips for Launching an MVNO in the US (2026)',
        clicks: 4,
        contributes: 'Unit economics, multi-carrier, first-1,000-customers, Butlr case',
      },
    ],
    content: launchMvnoUsGuide,
  },
};
