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

/**
 * ACF's icon value, in the shape WordPress stores it. `iconClass()` in
 * `lib/acf-blocks.ts` parses both this and WPGraphQL's pre-rendered form.
 */
const faIcon = (id: string, label: string) =>
  `{"family" : "classic", "style" : "solid", "id" : "${id}", "label" : "${label}"}`;

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
  /**
   * The TL;DR block, which lives in ACF fields on the post rather than in the
   * body — the Elementor template renders it above the article.
   *
   * It has to be merged like everything else. Three of the five posts in this
   * cluster carried their own four-card TL;DR, largely restating each other;
   * the other two had the heading and no cards. Leaving this empty would have
   * shown the team a page missing the first thing a reader sees.
   */
  templateBlocks: AcfBlocks;
}

import type { AcfBlocks } from '../../lib/acf-blocks.ts';
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

    /**
     * Four cards plus a closing one, the shape the template expects.
     *
     * Each merges a theme the donors repeated between them: the MVNE shortcut
     * (winner + tips), model choice (winner + "launch strategy"), eSIM/5G
     * (all three), and compliance — folded together with unit economics,
     * because the tips post paired them and the winner treated compliance
     * alone. The closing card takes the niche argument, which three of the
     * five made separately and none made as the headline point.
     *
     * Icons are reused from the donors' own cards: known-good FA 6.5 names,
     * and `faGlyphStyles` inlines each codepoint per post anyway.
     */
    templateBlocks: {
      tldrHeading: 'TL;DR / At-a-Glance Summary',
      tldrDescription:
        'Launching an MVNO in the US in 2026 is a weeks-long project on an MVNE and a multi-year one without. ' +
        'The decisions that matter are your model, your host network, eSIM from day one, and whether your ' +
        'unit economics survive contact with real compliance costs.',
      twoCol: [
        {
          icon: faIcon('gauge-simple-high', 'Gauge Simple High'),
          title: 'An MVNE Is the Fast, Low-Cost Path',
          text:
            'A modern MVNE platform turns a 12-to-18-month build into a launch measured in weeks, with first-year ' +
            'costs from roughly $10K instead of $5M. You license the network integrations, billing and compliance ' +
            'tooling rather than building a telecom stack.',
        },
        {
          icon: faIcon('circle-check', 'Circle Check'),
          title: 'Pick Your Model Before You Pick a Carrier',
          text:
            'Branded Reseller through Full MVNO sets your cost, control and timeline before any other decision. ' +
            'Most new entrants should start Light and upgrade; only deep SIM control or carrier-grade independence ' +
            'justifies a Full MVNO from day one.',
        },
        {
          icon: faIcon('sim-card', 'Sim Card'),
          title: 'eSIM-First Activation, 5G-Ready Plans',
          text:
            'The US is effectively eSIM-only on new devices, and QR activation cuts first-month churn against ' +
            'shipping physical SIMs. 5G standalone adds network slicing, so you can sell differentiated tiers ' +
            'rather than just cheaper data.',
        },
        {
          icon: faIcon('shield-halved', 'Shield Halved'),
          title: 'Compliance and Unit Economics Decide Survival',
          text:
            'FCC Form 499, USF contributions, CALEA, CPNI, Kari’s Law and state fees all apply, and an MVNE ' +
            'acting as carrier of record absorbs most of them. Model ARPU, wholesale cost, CAC and churn before ' +
            'launch — CAC exceeding lifetime value is the usual cause of death.',
        },
      ],
      oneCol: [
        {
          icon: faIcon('bullseye', 'Bullseye'),
          title: 'Win a Niche, Not a Price War',
          text:
            'Every durable US MVNO scoped a segment tightly enough to design plans, support and distribution ' +
            'around one kind of customer — IoT fleets, travellers, seniors, fintech or retail audiences. ' +
            'Competing as "the same thing, slightly cheaper" against a national carrier is the one strategy ' +
            'that reliably fails.',
        },
      ],
    },
  },
};
