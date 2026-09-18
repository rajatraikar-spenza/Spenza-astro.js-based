/**
 * The home page FAQ. One list, read by the section that shows it and by
 * `pages/index.astro` for the FAQPage schema, so the two cannot disagree.
 *
 * Questions and the first answer are the Figma file's; it draws the other five
 * collapsed, so their answers are the HTML design's.
 */
export const HOME_FAQ: [question: string, answer: string][] = [
  [
    'What is an MVNE, and what does Spenza actually do?',
    'An MVNE is the technical and commercial stack a company runs an MVNO or a connectivity business on, without owning network infrastructure. Spenza is that stack in four parts: operator sourcing and eSIM routing (TelecomHub), cost intelligence across every line and invoice (ControlHub), branded plans, checkout, billing and support (UXHub), and phone numbers, SMS and voice for AI agents (AgentHub). One data model, one API, one invoice.',
  ],
  [
    'Who runs on Spenza?',
    'Device makers and IoT fleets, consumer brands selling a subscription alongside hardware, MSPs and resellers running an MVNO, travel eSIM brands, AI product teams that need a real phone line, and enterprises replacing phone stipends with managed lines. Angel Watch, Butlr, MSP-A, and Daito are on the platform today.',
  ],
  [
    'How does Spenza handle IoT fleets at scale?',
    'Over API. SIM and eSIM provisioning in bulk, usage monitoring per line, threshold alerts, over-the-air operator switching with no physical SIM swap, and fleet-wide operations. LTE-M, NB-IoT, Cat-1, and LTE run across every aggregated operator.',
  ],
  [
    'Can we keep our existing carrier agreements?',
    'Yes. Use the operators Spenza has aggregated, bring your own contracts, or combine the two. Every line shows up in the same dashboard, API, and invoice.',
  ],
  [
    'Can we give an AI agent a real phone number?',
    'Yes, through AgentHub. Provision a local or toll-free number in 40+ countries, attach it to an agent, and handle SMS, voice, and realtime audio streaming over the same API and the same billing rails as the rest of your connectivity.',
  ],
  [
    'How fast can we launch, and how is it priced?',
    'Teams reach live service roughly 88% faster than building the carrier stack themselves, with two to three engineering hours of integration. Pricing is per line, with volume tiers for large fleets. The calculator gives an estimate; a demo gives a projection for your fleet.',
  ],
];
