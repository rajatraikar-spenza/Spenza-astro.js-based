// House writing quality: stops AI-sounding prose before it reaches a reader.
//
// Built on two MIT-licensed projects (see assets/writing-rules/README.md):
// stop-slop (phrase and structure lists, five-dimension score) and humanizer
// (the catalogue of structural tells). Three layers, cheapest first:
//
//  1. A deterministic lint: em dashes, throat-clearing, emphasis crutches, meta-commentary,
//     the offending adverbs, "not X, it's Y" contrasts. No model, no cost, so the writer
//     gets exact quotes to fix.
//  2. A five-dimension score (directness, rhythm, trust, authenticity, density; 1-10 each).
//  3. A rewrite pass that may change wording and nothing else. Its output is rejected
//     unless every link, number, heading, table, card and FAQ survives: an edit that
//     "improves" the style by dropping a statistic is worse than the slop.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { linksIn } from './checks.mjs';
import { DRAFT_SCHEMA } from './prompts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RULES_DIR = path.join(HERE, 'assets', 'writing-rules');
export const CORE_RULES = fs.readFileSync(path.join(RULES_DIR, 'core.md'), 'utf8');
const STOP_SLOP_STRUCTURES = fs.readFileSync(path.join(RULES_DIR, 'stop-slop', 'structures.md'), 'utf8');
const STOP_SLOP_EXAMPLES = fs.readFileSync(path.join(RULES_DIR, 'stop-slop', 'examples.md'), 'utf8');

/** Below this total (of 50) the draft is rewritten. stop-slop's own floor is 35; Spenza's is stricter. */
export const STYLE_PASS = 40;

const RULES = [
  ['em dash', /—|\s–\s/g],
  ['throat-clearing', /\bhere['’]s (?:the thing|what|why|this|that|how)\b|\bthe (?:uncomfortable )?truth is\b|\bit turns out\b|\blet me be clear\b|\bthe real \w+ is\b|\bi['’]m going to be honest\b|\bcan we talk about\b/gi],
  ['emphasis crutch', /\bmake no mistake\b|\blet that sink in\b|\bfull stop\b|\bthis matters because\b|\bhere['’]s why that matters\b/gi],
  ['filler phrase', /\bat its core\b|\bin today['’]s\b|\bit(?:['’]s| is) worth noting\b|\bat the end of the day\b|\bwhen it comes to\b|\bin a world where\b|\bthe reality is\b/gi],
  ['meta-commentary', /\bin this (?:guide|section|article|post)\b|\bas we['’]ll see\b|\blet me walk you through\b|\bthe rest of this (?:essay|post|article|guide)\b|\bwe['’]ll (?:explore|dive)\b/gi],
  ['business jargon', /\bgame[- ]changer\b|\bdeep dive\b|\blean into\b|\bcircle back\b|\bmoving forward\b|\bunpack\b|\bnavigate (?:the )?(?:challenges?|landscape|complexit\w+)\b/gi],
  ['adverb', /\b(?:really|just|literally|genuinely|honestly|simply|actually|deeply|truly|fundamentally|inherently|inevitably|interestingly|importantly|crucially)\b/gi],
  ['"not X, it\'s Y" contrast', /\b(?:isn['’]t|is not|aren['’]t|are not|wasn['’]t|doesn['’]t|don['’]t)\b[^.?!\n|]{1,60}[.;,]\s*(?:it['’]s|it is|they['’]re|they are|but|instead)\b|\bnot (?:just|only|merely) [^.?!\n|]{2,60}\bbut (?:also )?|\bnot because [^.?!\n|]{2,80}[.,]\s*(?:but )?because\b/gi],
  ['vague declarative', /\bthe (?:implications|stakes|consequences|reasons) are (?:significant|high|real|structural)\b/gi],
];

/** Prose the lint reads: no link targets, no code, no table rows (cells are data, not sentences). */
function proseOf(draft) {
  const strip = s => s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/```[\s\S]*?```/g, ' ')
    .split('\n').filter(l => !/^\s*\|/.test(l)).join('\n');
  return [
    ['body', strip(draft.body)],
    ['TL;DR', [draft.tldr.summary, ...draft.tldr.cards.map(c => c.text)].join('\n')],
    ['FAQ', draft.faq.map(f => strip(f.answer)).join('\n')],
  ];
}

/** @returns {string[]} one readable line per distinct problem, with the offending text quoted */
export function slopProblems(draft, { limit = 12 } = {}) {
  const out = [];
  for (const [where, text] of proseOf(draft)) {
    for (const [rule, re] of RULES) {
      re.lastIndex = 0;
      for (const h of [...text.matchAll(re)].slice(0, 3)) {
        const i = h.index ?? 0;
        const ctx = text.slice(Math.max(0, i - 25), i + h[0].length + 25).replace(/\s+/g, ' ').trim();
        out.push(`Style (${rule}) in ${where}: "…${ctx}…"`);
      }
    }
  }
  return out.slice(0, limit);
}

export const STYLE_SCORE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['directness', 'rhythm', 'trust', 'authenticity', 'density', 'tells'],
  properties: {
    directness: { type: 'integer' }, rhythm: { type: 'integer' }, trust: { type: 'integer' },
    authenticity: { type: 'integer' }, density: { type: 'integer' },
    tells: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['quote', 'pattern', 'fix'], properties: { quote: { type: 'string' }, pattern: { type: 'string' }, fix: { type: 'string' } } },
    },
  },
};

export const styleTotal = s => ['directness', 'rhythm', 'trust', 'authenticity', 'density'].reduce((n, k) => n + (s[k] ?? 0), 0);

const proseJson = d => JSON.stringify({ body: d.body, tldr: d.tldr, faq: d.faq });

export async function scoreStyle({ llm, draft }) {
  const s = await llm.ask({
    label: 'style-score', schema: STYLE_SCORE_SCHEMA, effort: 'medium',
    system: `You score prose for AI tells, using the stop-slop method. Rate 1 to 10 on each dimension:
- directness: statements or announcements?
- rhythm: varied or metronomic?
- trust: respects the reader's intelligence, or hand-holds and softens?
- authenticity: sounds like a person who knows the subject?
- density: anything cuttable?
Judge only the writing, never the facts. List the strongest tells with the exact quote.

Patterns to look for:
${STOP_SLOP_STRUCTURES}`,
    user: proseJson(draft),
  });
  return { ...s, total: styleTotal(s) };
}

/** The parts of a draft a style rewrite may change. Everything else is taken from the original. */
export function mergeRewrite(before, rewritten) {
  return {
    ...before,
    body: rewritten.body ?? before.body,
    tldr: {
      summary: rewritten.tldr?.summary ?? before.tldr.summary,
      cards: before.tldr.cards.map((c, i) => ({ icon: c.icon, title: rewritten.tldr?.cards?.[i]?.title ?? c.title, text: rewritten.tldr?.cards?.[i]?.text ?? c.text })),
    },
    faq: before.faq.map((f, i) => ({ question: f.question, answer: rewritten.faq?.[i]?.answer ?? f.answer })),
    bodyImage: { ...before.bodyImage, caption: rewritten.bodyImage?.caption ?? before.bodyImage.caption },
  };
}

const numbersIn = s => new Set((s.match(/\d[\d,.]*\d|\d/g) ?? []).map(n => n.replace(/[,.]+$/, '')));
const headingsOf = d => (d.body.match(/^#{2,3} .*$/gm) ?? []).map(h => h.replace(/^#+ /, '').trim().toLowerCase());
const tableCount = d => (d.body.match(/^\|[\s:|-]+\|\s*$/gm) ?? []).length;

/** What a rewrite is not allowed to lose or add. Returns the violations (empty means safe). */
export function preservesFacts(before, after) {
  const bad = [];
  const urls = d => new Set(linksIn(d).map(l => l.url));
  const uBefore = urls(before);
  const uAfter = urls(after);
  for (const u of uBefore) if (!uAfter.has(u)) bad.push(`link dropped: ${u}`);
  for (const u of uAfter) if (!uBefore.has(u)) bad.push(`link added: ${u}`);
  const textOf = d => [d.body, d.tldr.summary, ...d.tldr.cards.map(c => c.text), ...d.faq.map(f => f.answer)].join('\n');
  const nAfter = numbersIn(textOf(after));
  for (const n of numbersIn(textOf(before))) if (!nAfter.has(n)) bad.push(`number lost: ${n}`);
  if (headingsOf(before).length !== headingsOf(after).length) bad.push('the number of headings changed');
  if (tableCount(before) !== tableCount(after)) bad.push('a table was removed or added');
  if (after.faq.length !== before.faq.length || after.tldr.cards.length !== before.tldr.cards.length) bad.push('the number of cards or FAQ items changed');
  const wb = before.body.split(/\s+/).length;
  const wa = after.body.split(/\s+/).length;
  if (wa < wb * 0.7) bad.push(`the body shrank from ${wb} to ${wa} words`);
  return bad;
}

export function rewriteStyle({ llm, draft, problems, tells }) {
  const fixes = [
    ...problems,
    ...tells.map(t => `Style tell (${t.pattern}): "${t.quote}" -> ${t.fix}`),
  ];
  return llm.ask({
    label: 'style-rewrite', schema: DRAFT_SCHEMA, maxTokens: 24000, effort: 'high',
    system: `You are a line editor. ${CORE_RULES}

Before and after, to show the standard:
${STOP_SLOP_EXAMPLES}

Return the same JSON shape. Only body, tldr, faq answers and the body-image caption are read from your reply; return the rest unchanged.`,
    user: `Fix these specific problems and any others of the same kind you find. Keep every heading, table, link, number, and the number of cards and FAQ items.\n\n${fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nDraft (JSON):\n${JSON.stringify(draft)}`,
  });
}
