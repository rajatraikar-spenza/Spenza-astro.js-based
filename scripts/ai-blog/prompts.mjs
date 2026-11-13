// Every prompt the pipeline sends, in one place, so the writing standards and the
// quality bar are reviewable (and changeable) without reading control flow.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const IMAGE_STYLE_GUIDE = fs.readFileSync(path.join(HERE, 'assets', 'image-style-guide.md'), 'utf8');
/** stop-slop + humanizer, distilled (see assets/writing-rules/README.md). Also drives the post-draft style pass. */
const WRITING_RULES = fs.readFileSync(path.join(HERE, 'assets', 'writing-rules', 'core.md'), 'utf8');

export const CATEGORY_LABELS = {
  telecom: 'Telecom', iot: 'IoT', esim: 'eSIM', mvno: 'MVNO', byod: 'BYOD', tem: 'TEM', 'spenza-product': 'Spenza Platform',
};

/** Icons known to exist in the site's Font Awesome 6.5.1 stylesheet; cards use these. */
export const ICONS = [
  'chart-line', 'coins', 'circle-check', 'clipboard-check', 'gears', 'shield-halved', 'globe', 'sim-card', 'wifi', 'tower-cell',
  'file-invoice-dollar', 'money-bill-trend-up', 'scale-balanced', 'lock', 'key', 'bolt', 'clock', 'users', 'building', 'cloud',
  'server', 'plug', 'mobile-screen', 'signal', 'route', 'lightbulb', 'magnifying-glass-chart', 'handshake', 'rocket', 'puzzle-piece',
];

export const WRITING_STANDARDS = `
Spenza is a connectivity management and telecom platform (MVNO enablement, eSIM, IoT connectivity, telecom expense management).
Voice and standards for every post:
- Answer-first. The intro states the answer in the first two sentences. No filler openers, no "In this guide", no table of contents.
- Plain, specific, confident, US spelling. No em dashes anywhere. No hype, no rhetorical-question openers.
- 1,500 to 2,200 words. 6 to 8 H2 sections (sentence case), H3 only when needed. Short paragraphs.
- 2 to 3 tables with a header row, short cells, no markdown inside cells. A table gets its caption from the heading above it.
- Every statistic carries its source and year in the sentence. Only tier 1 to 3 sources (government, standards bodies, regulators,
  major analysts, peer-reviewed or primary company reports). If it was not in the research notes with a URL, do not state it.
- Any worked example is labelled "illustrative". Never invent customer results, quotes, logos or case studies.
- Spenza product statements only where the research notes cite a spenza.com or docs.spenza.com page. If unsure, leave it out.
- Internal links only to URLs listed in the research notes as verified live. At most 3 to 5 internal links, descriptive anchor text.
- The title is the only H1: the body starts with a paragraph, never a heading.

Claim boundaries for statements about Spenza:
- Describe only what Spenza does today. Never present a roadmap item, proposal, pilot or something said in a meeting as a live capability.
- Keep distinctions exact: physical SIM vs eSIM, billing cancellation vs carrier deactivation, authentication vs authorization, demo or staging vs production, planned vs deployed integration.
- Never generalize one carrier, plan, region or customer outcome to all offerings. No prices, SLAs, coverage, security guarantees or customer endorsements unless a public Spenza page states them.
- Internal knowledge-base excerpts are context for terminology and positioning. A product claim taken from them may appear only if the excerpt marks it documented or approved, or a public Spenza page confirms it. Never name a customer.

Writing style. An automatic lint and a style editor run after drafting and send back anything that sounds machine-written, so write it right the first time:
${WRITING_RULES}
`.trim();

export const researchSystem = `You are a research editor for the Spenza blog. You find current, citable facts and check Spenza's own product claims.
${WRITING_STANDARDS}
Use web search for facts and web fetch ONLY for spenza.com and docs.spenza.com pages. Report only what you actually found.`;

export const researchUser = ({ title, brief, category, focusKeyword, mustCover, links, existing, brain }) => `
Prepare research notes for a new Spenza blog post.

Working title: ${title}
Category: ${CATEGORY_LABELS[category] ?? category}
Focus keyword: ${focusKeyword || '(choose the best one and state it)'}
Brief from the marketing team:
${brief}
${mustCover ? `\nMust cover:\n${mustCover}` : ''}
${links ? `\nThe team wants these pages or sources linked or consulted:\n${links}` : ''}
${existing?.length ? `\nSpenza already has posts on nearby topics (avoid duplicating them; link to the best 1-3 if relevant):\n${existing.map(e => `- ${e.title} https://spenza.com${e.uri}`).join('\n')}` : ''}
${brain ? `\nSpenza's internal knowledge base (trusted for product facts; still cite the public page when one exists):\n${brain}` : ''}

Return markdown with exactly these sections:
## Search intent and angle
Who searches this, what they want, the angle that beats the current top results (name the gaps).
## Verified facts
A table: Claim | Figure | Year | Source name | Source URL | Tier (1-3). Only items you opened or saw in a search result snippet. Prefer the latest year available.
## Spenza facts
Product statements confirmed on a spenza.com or docs.spenza.com page: statement | page URL. Say "none found" if none.
## Verified internal links
Spenza pages that exist (you fetched them) and fit the post: title | URL.
## Outline suggestion
6 to 8 H2s.`;

export const DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['description', 'tags', 'focusKeyword', 'heroAlt', 'bodyImage', 'tldr', 'faq', 'body', 'imagePlan'],
  properties: {
    description: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    focusKeyword: { type: 'string' },
    heroAlt: { type: 'string' },
    bodyImage: {
      type: 'object', additionalProperties: false, required: ['alt', 'caption', 'afterSection'],
      properties: { alt: { type: 'string' }, caption: { type: 'string' }, afterSection: { type: 'integer' } },
    },
    tldr: {
      type: 'object', additionalProperties: false, required: ['summary', 'cards'],
      properties: {
        summary: { type: 'string' },
        cards: {
          type: 'array',
          items: { type: 'object', additionalProperties: false, required: ['icon', 'title', 'text'], properties: { icon: { type: 'string' }, title: { type: 'string' }, text: { type: 'string' } } },
        },
      },
    },
    faq: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['question', 'answer'], properties: { question: { type: 'string' }, answer: { type: 'string' } } },
    },
    body: { type: 'string' },
    imagePlan: {
      type: 'object', additionalProperties: false, required: ['heroObjects', 'heroTitleLines', 'bodyScene', 'bodyLabels'],
      properties: {
        heroObjects: { type: 'array', items: { type: 'string' } },
        heroTitleLines: { type: 'array', items: { type: 'string' } },
        bodyScene: { type: 'string' },
        bodyLabels: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const draftSystem = `You are the senior writer for the Spenza blog.
${WRITING_STANDARDS}

Output rules for the JSON you return:
- description: 110 to 165 characters, plain, specific; it is the search snippet.
- tldr.summary: two to four sentences answering the title. tldr.cards: EXACTLY 5. Cards 1-4 are key points (title 3-6 words, text one sentence of 160 characters or fewer).
  Card 5 is "how Spenza helps / keep it aligned", only claiming what the research notes confirm. icon: one of ${ICONS.join(', ')}.
- faq: EXACTLY 5 questions phrased like search queries; each answer 2 to 4 self-contained sentences (inline markdown links allowed).
- body: markdown. Intro paragraphs first (no heading), then 6-8 "## " sections. No "# " H1, no TL;DR section, no FAQ section, no contents block,
  no "Contact us" button text: those are added by the template. Do not include the body image: it is placed automatically after section bodyImage.afterSection (use 2 or 3).
- heroAlt / bodyImage.alt: one descriptive sentence of what the image SHOWS (objects), never the title or a slug. bodyImage.caption: one sentence tying the image to the text.
- imagePlan.heroObjects: 3 to 6 meaningful objects drawn from the article (tower, phone, invoice, server, key, storefront, SIM...). imagePlan.heroTitleLines: the title split into 1 to 3 lines of 26 characters or fewer (no trailing punctuation). imagePlan.bodyScene: one concept as 3-5 chunky objects joined by cream ribbons, left to right. imagePlan.bodyLabels: zero to three labels of at most two short words, each naming an object in the scene.`;

export const draftUser = ({ title, brief, category, focusKeyword, mustCover, notes, brain }) => `
Write the post.

Title (use as given unless it is clearly weak; you may tighten it in the body but not change the topic): ${title}
Category: ${CATEGORY_LABELS[category] ?? category}
Focus keyword: ${focusKeyword || '(use the one in the research notes)'}
Brief: ${brief}
${mustCover ? `Must cover:\n${mustCover}\n` : ''}
Research notes (your only source of facts, figures and links):
${notes}
${brain ? `\nSpenza knowledge base excerpts:\n${brain}` : ''}`;

export const reviseUser = ({ draft, mustFix, notes }) => `
Revise the draft below. Fix every item in MUST FIX, keep what works, keep the same JSON shape and the same standards.
Do not add facts that are not in the research notes. If a fix needs a fact you do not have, remove the claim.

MUST FIX:
${mustFix.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Research notes:
${notes}

Current draft (JSON):
${JSON.stringify(draft)}`;

export const FACTCHECK_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['unsupported'],
  properties: {
    unsupported: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['claim', 'where', 'why'], properties: { claim: { type: 'string' }, where: { type: 'string' }, why: { type: 'string' } } },
    },
  },
};

export const factcheckSystem = 'You are a strict fact-checker. You may use ONLY the research notes as evidence. Be literal.';
export const factcheckUser = ({ draft, notes }) => `
List every statistic, date, named source, ranking, comparison, regulatory statement and Spenza product claim in the draft that is NOT supported by the research notes
(not present, a different figure, a different year, or no source URL). Ignore general reasoning and clearly labelled illustrative examples.
Return an empty list if everything is supported.

Research notes:
${notes}

Draft:
${JSON.stringify({ description: draft.description, tldr: draft.tldr, faq: draft.faq, body: draft.body })}`;
