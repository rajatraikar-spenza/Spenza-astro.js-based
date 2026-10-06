/**
 * Copy for the three hub pages that is read by more than one place.
 *
 * The sections unique to one page are plain markup in
 * `components/hub/<hub>/`. What lives here is what a shared component renders
 * with different words per page — the video section, the FAQ and the demo
 * form — and the FAQ is also read by the page for its FAQPage schema, so the
 * questions shown and the questions declared cannot disagree.
 *
 * Words are the "<hub>-redesign.html" designs'. `title` fields are HTML: the
 * orange serif phrase is an `<em class="s">`.
 */

export type HubKey = 'uxhub' | 'telecomhub' | 'controlhub';

export interface Hub {
  video: {
    /** Follows the Spenza wordmark, which HubVideo draws in front of it. */
    eyebrow: string;
    title: string;
    lede: string;
    /** Product name as the poster sets it: plain, then the orange serif half. */
    name: [string, string];
    tagline: string;
    /** The poster diagram: four inputs, the hub chip, three outputs. */
    diagram: { inputs: string[]; chip: [string, string]; outputs: string[] };
  };
  faq: { intro: string; items: [question: string, answer: string][] };
  cta: { title: string; lede: string };
}

export const HUBS: Record<HubKey, Hub> = {
  uxhub: {
    video: {
      eyebrow: 'UX HUB',
      title: 'Branded Experiences That <em class="s">Drive Revenue</em>',
      lede:
        'See how Spenza brings your branded subscriber portal, self-service plan management, in-portal upsells, and support together so you can increase ARPU, reduce churn, and lower support costs.',
      name: ['UX', 'Hub'],
      tagline: 'Your brand. Self-service. More revenue.',
      diagram: {
        inputs: ['Your brand', 'Plans', 'Operators', 'Support'],
        chip: ['UXHUB', 'your portal'],
        outputs: ['Custom workflows', 'Integrated buying experience', 'Branded Apps'],
      },
    },
    faq: {
      intro: 'Explore the UXHub for onboarding support, product walkthroughs, and common FAQs.',
      items: [
        [
          'What is UXHub by Spenza?',
          'Modern customer portal for MVNOs replacing outdated billing interfaces with branded experiences. Reduces support costs, boosts engagement, drives revenue through upsells. Full customization, zero white-label restrictions, no coding required.',
        ],
        [
          'How Is UXHub different from standard connectivity solutions?',
          'Most prioritize network infrastructure; we prioritize customer experience. Manage subscriber portals, analytics, and engagement while you control pricing, features, and branding. Seamless integration with existing billing systems.',
        ],
        [
          'How easy is It to use?',
          'Zero coding. Subscribers get intuitive portals to view plans, track usage, and upgrade in minutes. Operations teams use simple dashboards to configure plans, manage operators, and monitor analytics.',
        ],
        [
          'How do I get started with UXHub?',
          'Simply book a demo and explore UXHub through a guided walkthrough tailored to your connectivity use case.',
        ],
      ],
    },
    cta: {
      title: 'Ready to <em class="s">Launch a Customer Portal</em> That Actually Drives Revenue?',
      lede: 'See UXHub in 15 minutes with a personalized walkthrough of your use case, pricing, and deployment timeline.',
    },
  },
  telecomhub: {
    video: {
      eyebrow: 'TELECOM HUB',
      title: 'Your Telecom Operations, <em class="s">Unified</em>',
      lede:
        'See how Spenza brings operator access, connectivity management, billing, and reseller operations together so you can launch mobile services faster and scale without building the telecom stack yourself.',
      name: ['Telecom', 'Hub'],
      tagline: 'One API. 180+ carriers. Launch in days.',
      diagram: {
        inputs: ['Operator A', 'Operator B', 'Operator C', 'BYON'],
        chip: ['TELECOMHUB', 'one API'],
        outputs: ['eSIM', 'Billing', 'Routing'],
      },
    },
    faq: {
      intro: 'Explore the TelecomHub for onboarding support, product walkthroughs, and common FAQs.',
      items: [
        [
          'What is TelecomHub by Spenza?',
          'Multi-operator connectivity platform for MSPs and resellers. Manage 180+ global carriers through one API. Automate billing and provisioning. Launch competitive mobile services in days, not months.',
        ],
        [
          'How does TelecomHub differ from traditional MVNO platforms?',
          'Traditional MVNOs lock you into one carrier and require 6-12 months of setup. TelecomHub gives instant access to 180+ carriers, automatic failover, and API control. Switch anytime.',
        ],
        [
          'How easy is it to get started?',
          'Go live in under 7 days. We handle integrations and billing setup. Your team needs basic REST API knowledge. Most MSPs integrate in 2-3 engineering hours.',
        ],
        [
          'What ROI can I expect from TelecomHub?',
          '$500+ annual revenue per subscriber through tiered pricing, 50% churn reduction, and $100K+ operational savings by eliminating manual carrier management. Payback in 12-18 months.',
        ],
      ],
    },
    cta: {
      title: 'Launch Global Mobile Services. Without Becoming a <em class="s">Telecom Company</em>',
      lede: 'Go live in 7 days and see deployment timeline, carrier availability and ROI projections in one demo.',
    },
  },
  controlhub: {
    video: {
      eyebrow: 'CONTROL HUB',
      title: 'Your Plans. Your Prices. <em class="s">Your Control.</em>',
      lede:
        'See how Spenza turns operator wholesale plans into your own products: custom plans for every device, parent-child billing for every reseller, access control for every customer base, and real-time plan optimization.',
      name: ['Control', 'Hub'],
      tagline: 'Custom plans. Every reseller. Real-time optimization.',
      diagram: {
        inputs: ['Operator A', 'Operator B', 'Operator C', 'BYON'],
        chip: ['CONTROLHUB', 'your plans'],
        outputs: ['Plans', 'Billing', 'Resellers'],
      },
    },
    faq: {
      intro: 'Explore the ControlHub for onboarding support, product walkthroughs, and common FAQs.',
      items: [
        [
          'What is ControlHub by Spenza?',
          'ControlHub is the plan and billing control layer of the Spenza platform. It turns operator wholesale plans from TelecomHub into products you own: custom plans for every device type, parent-child billing across your reseller network, control over who can buy each plan, and real-time plan optimization.',
        ],
        [
          'What kinds of plans can I build?',
          'Prepaid, postpaid, and pay-as-you-go plans with limits, with the data, voice, and SMS allowances each device needs. Build plans for wearables, smartphones, telematics units, cameras, or any other connected device, and set your own prices on top of wholesale cost.',
        ],
        [
          'How does parent-child billing work?',
          'Each level of your network, from MSP to distributor, sub-distributor, and enterprise or retail customer, gets its own plans, prices, and prepaid or postpaid terms. Spenza rates usage, bills every level, and tracks markups, commissions, and payouts from one place.',
        ],
        [
          'How does real-time plan optimization work?',
          'ControlHub maps each customer plan to the operator plan and pool that fits it, and can move a line to a larger plan when it uses up its allowance, for example from 1 GB to 2 GB, so the device stays connected instead of running into overage.',
        ],
        [
          'How does ControlHub work with the other hubs?',
          'TelecomHub supplies operator access and wholesale plans. ControlHub turns them into your products and bills them. UXHub sells them to your customers under your brand, and AgentHub adds AI agents that can build plans, reconcile invoices, and handle compliance tasks.',
        ],
      ],
    },
    cta: {
      title: 'Take Control of <em class="s">Every Plan You Sell</em>',
      lede: 'See ControlHub in 15 minutes: custom plans, parent-child billing, and plan optimization, walked through for your devices and reseller network.',
    },
  },
};

/** The FAQPage schema for a hub, from the same list the FAQ section shows. */
export function faqSchema(hub: HubKey) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HUBS[hub].faq.items.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  };
}
