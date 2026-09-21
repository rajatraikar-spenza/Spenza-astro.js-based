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
import whiteLabelMvnoLaunchGuide from './white-label-mvno-launch-guide-2025.html?raw';

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
    featuredImage: '/blog-media/mvno-us-launch/launch-mvno-us-guide-featured.png',
    publishedDate: '2026-04-22T11:11:00+00:00',
    updatedDate: '2026-07-17T04:49:14+00:00',
    authorSlug: 'sivasai',
    authorName: 'SivaSai',
    destinationWords: 3444,
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

  'white-label-mvno-launch-guide-2025': {
    slug: 'white-label-mvno-launch-guide-2025',
    category: 'mvno',
    cluster: 'White-label MVNO launch (H1 — MVNO & MVNE)',
    title: 'White Label MVNO Launch Guide 2026: Build Your Mobile Brand',
    excerpt:
      'What a white label MVNO includes, where white label ends and private label begins, what it costs, the launch sequence, the US compliance you cannot skip, and how to choose the platform underneath it.',
    seoTitle: 'White Label MVNO Launch Guide 2026: Build Your Mobile Brand',
    seoDescription:
      'Launch a branded mobile service without owning infrastructure. White label vs private label, real costs and margins, the 10-step launch, US compliance and how to pick an MVNE.',
    featuredImage: 'https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png',
    publishedDate: '2026-08-06T09:00:00+00:00',
    updatedDate: '2026-08-06T09:00:00+00:00',
    authorSlug: 'sivasai',
    authorName: 'SivaSai',
    destinationWords: 2474,
    donors: [
      {
        path: '/mvno/mvno-in-a-box-for-brands/',
        title: 'MVNO in a Box: Launch Your Own Mobile Brand Fast',
        clicks: 45,
        contributes: 'What the package includes, brand use cases, traditional-vs-turnkey framing',
      },
      {
        path: '/mvno/how-to-launch-mvno-non-telco-brand-2025/',
        title: 'How to Start a MVNO as a Non-Telco Brand in 2026',
        clicks: 19,
        contributes: 'The non-telco thesis, brand-type table, smartwatch case study',
      },
      {
        path: '/mvno/white-label-mvno/',
        title: 'White Label MVNO: A Practical Launch Guide',
        clicks: 22,
        contributes: 'Launch challenges and their mitigations',
      },
    ],
    content: whiteLabelMvnoLaunchGuide,

    /**
     * Only two of the four posts carried TL;DR cards, and both led with what
     * the thing *is* before what it costs. These keep that order and take the
     * closing card from the non-telco donor, whose whole thesis — that you do
     * not need to be a telecom company — is the cluster's strongest single
     * point and was not the headline of any of the four.
     */
    templateBlocks: {
      tldrHeading: 'TL;DR / At-a-Glance Summary',
      tldrDescription:
        'A white label MVNO lets you sell a branded mobile service on someone else\u2019s network, with an MVNE ' +
        'running billing, provisioning and compliance underneath. Launches run 7 to 90 days depending on the ' +
        'model, and margins depend far more on wholesale terms and plan design than on the platform you pick.',
      twoCol: [
        {
          icon: faIcon('tower-cell', 'Tower Cell'),
          title: 'You Own the Brand, the MVNE Runs the Network',
          text:
            'You set the plans, the pricing and the customer relationship, and you keep the margin. Your MVNE ' +
            'partner owns the carrier agreements, the BSS/OSS and the provisioning. That is the whole trade, ' +
            'and it is why no telecom background is required.',
        },
        {
          icon: faIcon('layer-group', 'Layer Group'),
          title: 'White Label vs Private Label: Speed or Control',
          text:
            'White label launches in 7 to 30 days on a pre-built platform with moderate customisation. Private ' +
            'label takes 3 to 6 months and gives you your own billing, CRM and support. Most brands start ' +
            'white label and move up as volume justifies it.',
        },
        {
          icon: faIcon('money-bill-trend-up', 'Money Bill Trend Up'),
          title: 'What It Costs, and What You Keep',
          text:
            'Setup runs $10K\u2013$100K for a branded reseller, $100K\u2013$400K for a full white label build, and $2M+ ' +
            'for private label. Margins land between 15% and 40%, but only with properly negotiated wholesale ' +
            'rates and a platform whose pricing is flexible.',
        },
        {
          icon: faIcon('calendar-days', 'Calendar Days'),
          title: 'A 7-Day Launch Is Real, With Caveats',
          text:
            'Seven days applies to branded reseller and light white label models, and assumes niche, model, ' +
            'carrier and platform are settled before the clock starts. Full builds with custom billing run ' +
            'three to six weeks. Compliance is the step that slips, so start it first.',
        },
      ],
      oneCol: [
        {
          icon: faIcon('shop', 'Shop'),
          title: 'You Do Not Need to Be a Telco',
          text:
            'eSIM removed the SIM logistics, API-first platforms removed the integration work, and an MVNE can ' +
            'act as carrier of record for most compliance. Fintechs, retailers, wearable makers, MSPs and ' +
            'creator brands are launching on exactly this basis \u2014 because each already owns a distribution ' +
            'channel and a reason for the customer to come back.',
        },
      ],
    },
  },
};
