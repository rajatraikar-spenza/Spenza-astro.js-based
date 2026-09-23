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
  ogTitle?: string;
  ogDescription?: string;
  featuredImage: string;
  featuredImageAlt?: string;
  /** Preserve the existing published image candidates when reusing media. */
  featuredImageMarkup?: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  publishedDate: string;
  updatedDate: string;
  authorSlug: 'isimplexity' | 'sivasai' | 'vinay';
  authorName: string;
  authorBio?: string;
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
import mvnoDefinition from './mvno.html?raw';
import launchMvnoUsGuide from './launch-mvno-us-guide.html?raw';
import whiteLabelMvnoLaunchGuide from './white-label-mvno-launch-guide-2025.html?raw';

export const MERGE_PREVIEWS: Record<string, MergePreview> = {
  mvno: {
    "slug": "mvno",
    "category": "mvno",
    "cluster": "M02: MVNO definitions",
    "title": "What Is an MVNO? Business Models and How to Launch",
    "excerpt": "An MVNO brings mobile service to customers through a host network. This guide explains the operating models, costs, responsibilities and checks that shape a launch.",
    "seoTitle": "What Is an MVNO? Business Models and How to Launch",
    "seoDescription": "Learn what an MVNO is, how its business models work, which costs and duties remain yours, and what to verify before launching a branded mobile service.",
    "ogTitle": "What Is an MVNO? Business Models and How to Launch",
    "ogDescription": "Understand MVNO roles, compare operating models, assess costs and use a published enterprise launch to plan your next step.",
    "featuredImage": "https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png",
    "featuredImageMarkup": "<picture><source srcset=\"https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-300x169.png.webp 300w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-1024x576.png.webp 1024w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-768x432.png.webp 768w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png.webp 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" type=\"image/webp\"><img width=\"1280\" height=\"720\" src=\"https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png\" class=\"attachment-full size-full wp-image-18843 webpexpress-processed\" alt=\"What Is an MVNO Types, Benefits, and Key Insights\" srcset=\"https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-300x169.png 300w, https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-1024x576.png 1024w, https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights-768x432.png 768w, https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" fetchpriority=\"high\" decoding=\"async\"></picture>",
    "featuredImageAlt": "What is an MVNO? Types, benefits and the mobile service model",
    "featuredImageWidth": 1280,
    "featuredImageHeight": 720,
    "publishedDate": "2026-06-11T10:40:10+00:00",
    "updatedDate": "2026-09-23T08:05:31.352522+00:00",
    "authorSlug": "sivasai",
    "authorName": "SivaSai",
    "authorBio": "Founder’s Office | Engineer → Marketer | Scaled Organic to 500K+ Impressions | SEO & AI Search | Email Campaigns & Funnels | AI-driven B2B SaaS Growth",
    "destinationWords": 3595,
    "donors": [
      {
        "path": "/mvno/what-are-mvnos/",
        "title": "Define MVNO: What Is a Mobile Virtual Network Operator?",
        "clicks": 47,
        "contributes": "Definition, service mechanism, carrier examples and plan-specific trade-offs"
      },
      {
        "path": "/telecom/what-is-mvno/",
        "title": "What Is MVNO? Mobile Virtual Network Operator Guide",
        "clicks": 16,
        "contributes": "Radio versus core ownership, product fit, operating economics and pilot risks"
      }
    ],
    "content": mvnoDefinition,
    "templateBlocks": {
      "tldrHeading": "TL;DR / At-a-Glance Summary",
      "tldrDescription": "An MVNO sells branded mobile service using a host operator's radio network. Its operating model determines which systems and customer tasks it runs or sources. For device makers, MSPs and software platforms, choose the model around the product requirement, then verify network access, costs and responsibilities. The published RocketPhone case demonstrates an enterprise launch connecting cellular voice to an existing application. It provides implementation scope, not a universal launch timeline or subscriber benchmark.",
      "twoCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"tower-broadcast\"}",
          "title": "Separate the roles",
          "text": "The host supplies radio access. Enablers and aggregators can supply optional systems and commercial arrangements."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"layer-group\"}",
          "title": "Choose required control",
          "text": "Compare reseller, light and full models against the decisions your product needs to own."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"coins\"}",
          "title": "Price the whole operation",
          "text": "Include fixed costs, usage, active lines, acquisition and minimum commitments."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"clipboard-check\"}",
          "title": "Prove launch readiness",
          "text": "Accept activation, billing, support and export evidence before expanding."
        }
      ],
      "oneCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"circle-check\"}",
          "title": "Start with the customer workflow",
          "text": "RocketPhone shows how a specific application requirement can shape the mobile service and partner scope."
        }
      ]
    }
  },
  'launch-mvno-us-guide': {
    "slug": "launch-mvno-us-guide",
    "category": "mvno",
    "cluster": "M16: US MVNO launch",
    "title": "How to Launch an MVNO in the US: Requirements, Costs and Operating Plan",
    "excerpt": "Plan a US MVNO launch around your service, operating responsibilities and evidence. Compare models, scope costs and requirements, and define the tests your pilot must pass.",
    "seoTitle": "How to Launch an MVNO in the US: Costs and Checklist",
    "seoDescription": "Learn how to launch an MVNO in the US: choose an operating model, scope regulatory duties, build a cost plan, and test readiness before going live.",
    "ogTitle": "How to Launch an MVNO in the US: Costs and Checklist",
    "ogDescription": "A practical US MVNO launch plan for OEMs, MSPs and software platforms: operating models, requirements, cost inputs and pilot evidence.",
    "featuredImage": "https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png",
    "featuredImageMarkup": "<picture><source srcset=\"https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/Blog-Thumbnails-300x169.png.webp 300w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/Blog-Thumbnails-1024x576.png.webp 1024w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/Blog-Thumbnails-768x432.png.webp 768w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/Blog-Thumbnails.png.webp 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" type=\"image/webp\"><img width=\"1280\" height=\"720\" src=\"https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png\" class=\"attachment-full size-full wp-image-16942 webpexpress-processed\" alt=\"How to Launch an MVNO in the US: 2026 Playbook &amp; Cost\" srcset=\"https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails-300x169.png 300w, https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails-1024x576.png 1024w, https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails-768x432.png 768w, https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" fetchpriority=\"high\" decoding=\"async\"></picture>",
    "featuredImageAlt": "How to launch an MVNO in the US, with a SIM, phone and US map",
    "featuredImageWidth": 1280,
    "featuredImageHeight": 720,
    "publishedDate": "2026-04-22T11:11:00+00:00",
    "updatedDate": "2026-09-22T12:22:16.186074+00:00",
    "authorSlug": "sivasai",
    "authorName": "SivaSai",
    "authorBio": "Founder’s Office | Engineer → Marketer | Scaled Organic to 500K+ Impressions | SEO & AI Search | Email Campaigns & Funnels | AI-driven B2B SaaS Growth",
    "destinationWords": 3441,
    "donors": [
      {
        "path": "/mvno/how-to-set-up-mvno/",
        "title": "MVNO 2026 Setup: How to Launch Step by Step",
        "clicks": 31,
        "contributes": "Network and platform setup, billing hierarchies and operating responsibilities"
      },
      {
        "path": "/mvno/launch-us-mvno-now/",
        "title": "MVNO US Launch: Why 2026 Is the Right Moment",
        "clicks": 33,
        "contributes": "Customer needs, service differentiation and launch checklist"
      },
      {
        "path": "/mvno/us-mvno-introduction/",
        "title": "MVNOs in the US Market: Impact on Telecom",
        "clicks": 18,
        "contributes": "MVNO definition, audience fit, partnership constraints and distribution"
      },
      {
        "path": "/mvno/top-10-tips-launching-mvno-us-2025/",
        "title": "Top 10 Tips for Launching an MVNO in the US (2026)",
        "clicks": 4,
        "contributes": "Unit economics, device eligibility, support and pilot preparation"
      }
    ],
    "content": launchMvnoUsGuide,
    "templateBlocks": {
      "tldrHeading": "TL;DR / At-a-Glance Summary",
      "tldrDescription": "To launch a mobile virtual network operator (MVNO) in the US, define the service, arrange network access and assign operating responsibilities. Build a budget from quoted terms, identify applicable obligations with specialists, and test the full customer journey before expanding. For device makers, managed service providers and software platforms, the right model fits an existing product and audience. A credible launch date follows contracts, integrations and accepted pilot results; a configured portal alone does not establish readiness.",
      "twoCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"clipboard-list\"}",
          "title": "Define the service",
          "text": "Name the customers, devices, markets, features and support promise before choosing a package."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"layer-group\"}",
          "title": "Assign responsibilities",
          "text": "Document what your team, network supplier and enabling partner must each deliver."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"coins\"}",
          "title": "Validate the economics",
          "text": "Price setup, recurring work, usage and cash commitments against the same service scope."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"circle-check\"}",
          "title": "Prove the pilot",
          "text": "Test activation, applicable voice and porting, billing, cancellation and support exceptions."
        }
      ],
      "oneCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"clipboard-check\"}",
          "title": "Launch against evidence",
          "text": "Approve the service when named owners accept the results, rather than relying on a generic deadline."
        }
      ]
    }
  },
  'white-label-mvno-launch-guide-2025': {
    "slug": "white-label-mvno-launch-guide-2025",
    "category": "mvno",
    "cluster": "M07: White-label MVNO launch",
    "title": "White Label MVNO Launch Guide: Scope, Costs and Ownership",
    "excerpt": "A practical guide for OEMs, MSPs and software platforms evaluating branded mobile service, including ownership, cost inputs, provider selection and launch tests.",
    "seoTitle": "White Label MVNO: Scope, Costs and Launch Requirements",
    "seoDescription": "Learn what a white label MVNO includes, who owns billing and support, how to evaluate costs, and what to test before launching branded mobile service.",
    "ogTitle": "White Label MVNO: Plan Your Branded Mobile Launch",
    "ogDescription": "Decide what your team will own, compare provider responsibilities, build a launch budget, and test the service before selling it.",
    "featuredImage": "https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png",
    "featuredImageMarkup": "<picture><source srcset=\"https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-300x169.png.webp 300w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-1024x576.png.webp 1024w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-768x432.png.webp 768w, https://media.spenza.com/wp-assets/wp-content/webp-express/webp-images/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png.webp 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" type=\"image/webp\"><img width=\"1280\" height=\"720\" src=\"https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png\" class=\"attachment-full size-full wp-image-17019 webpexpress-processed\" alt=\"White Label MVNO Launch Guide 2026: Build Your Mobile Brand\" srcset=\"https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-300x169.png 300w, https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-1024x576.png 1024w, https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand-768x432.png 768w, https://media.spenza.com/wp-content/uploads/2026/04/White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png 1280w\" sizes=\"(max-width: 1280px) 100vw, 1280px\" fetchpriority=\"high\" decoding=\"async\"></picture>",
    "featuredImageAlt": "White label MVNO launch guide for branded mobile services",
    "featuredImageWidth": 1280,
    "featuredImageHeight": 720,
    "publishedDate": "2026-04-24T06:48:54+00:00",
    "updatedDate": "2026-09-22T11:25:11.336Z",
    "authorSlug": "sivasai",
    "authorName": "SivaSai",
    "authorBio": "Founder’s Office | Engineer → Marketer | Scaled Organic to 500K+ Impressions | SEO & AI Search | Email Campaigns & Funnels | AI-driven B2B SaaS Growth",
    "destinationWords": 2470,
    "donors": [
      {
        "path": "/mvno/mvno-in-a-box-for-brands/",
        "title": "MVNO in a Box: Launch Your Own Mobile Brand Fast",
        "clicks": 45,
        "contributes": "Package components, operating responsibilities and integration checks"
      },
      {
        "path": "/mvno/how-to-launch-mvno-non-telco-brand-2025/",
        "title": "How to Start a MVNO as a Non-Telco Brand in 2026",
        "clicks": 19,
        "contributes": "Device bundles, customer value and existing sales channels"
      },
      {
        "path": "/mvno/white-label-mvno/",
        "title": "White Label MVNO: A Practical Launch Guide",
        "clicks": 22,
        "contributes": "Pilot sequence, support ownership, cost categories and migration questions"
      }
    ],
    "content": whiteLabelMvnoLaunchGuide,
    "templateBlocks": {
      "tldrHeading": "TL;DR / At-a-Glance Summary",
      "tldrDescription": "A white label mobile virtual network operator (MVNO) lets you offer branded mobile service through contracted network and platform capabilities. Your agreement determines who operates billing, provisioning and support, and who holds the subscriber relationship. For device makers, managed service providers and software platforms, the decision starts with the product you already sell. Compare responsibilities, model the actual charging rules and test the complete customer journey. A configured account is one milestone; a usable service with correct billing is the launch objective.",
      "twoCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"tower-cell\"}",
          "title": "Define the offer",
          "text": "Name the customer need, services, devices and markets before choosing a package."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"layer-group\"}",
          "title": "Assign ownership",
          "text": "Put contracts, billing, support and data access into a written responsibility schedule."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"money-bill-trend-up\"}",
          "title": "Check the charging rules",
          "text": "Confirm billable line states, minimum commitments, activation fees and excluded operating costs."
        },
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"circle-check\"}",
          "title": "Test the whole journey",
          "text": "Verify completed provisioning, usable service, correct charges, failure recovery and support."
        }
      ],
      "oneCol": [
        {
          "icon": "{\"family\":\"classic\",\"style\":\"solid\",\"id\":\"clipboard-check\"}",
          "title": "Launch against evidence",
          "text": "Approve the pilot against agreed criteria. Do not substitute a generic deadline for readiness."
        }
      ]
    }
  },
};
