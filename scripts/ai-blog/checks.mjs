// Deterministic checks that need no model: structure, links, length.
import { validateEntry } from '../lib/cms-post.mjs';
import { ICONS } from './prompts.mjs';

const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function wordCount(draft) {
  return draft.body.replace(/[#>*|_`\-]/g, ' ').split(/\s+/).filter(Boolean).length;
}

/** Everything `validateEntry` enforces, plus the length and structure targets the standards set. */
export function structureProblems(draft, { category = 'telecom', author = 'isimplexity', slug = 'x', iconsAvailable } = {}) {
  const meta = {
    title: 't', slug, description: draft.description, category, author, publishedDate: '2026-01-01',
    hero: { image: '/h', alt: draft.heroAlt }, tldr: draft.tldr, faq: draft.faq, ai: { generated: true },
    bodyImage: { image: '/b', alt: draft.bodyImage.alt },
  };
  const { errors } = validateEntry(meta, draft.body, { fileExists: () => true });
  const problems = [...errors];
  const words = wordCount(draft);
  if (words < 1300 || words > 2600) problems.push(`body is ${words} words; the target is 1,500 to 2,200`);
  const h2 = (draft.body.match(/^## /gm) ?? []).length;
  if (h2 < 5 || h2 > 9) problems.push(`body has ${h2} H2 sections; the target is 6 to 8`);
  const tables = (draft.body.match(/^\|.*\|\s*$/gm) ?? []).filter(l => /^\|[\s:|-]+\|$/.test(l)).length;
  if (tables < 2) problems.push(`body has ${tables} tables; the standard is 2 to 3`);
  if (draft.faq.length !== 5) problems.push(`FAQ has ${draft.faq.length} questions; it needs exactly 5`);
  const okIcons = iconsAvailable ?? new Set(ICONS);
  for (const c of draft.tldr.cards) if (!okIcons.has(c.icon)) problems.push(`icon "${c.icon}" is not in the site's Font Awesome set`);
  if (draft.tldr.cards.some(c => c.text.length > 170)) problems.push('a TL;DR card text is longer than 160 characters');
  if (!(draft.bodyImage.afterSection >= 1 && draft.bodyImage.afterSection <= h2 - 1)) problems.push('bodyImage.afterSection must point at a section before the last');
  const lines = draft.imagePlan.heroTitleLines;
  if (!lines.length || lines.length > 3 || lines.some(l => l.length > 26)) problems.push('imagePlan.heroTitleLines must be 1 to 3 lines of 26 characters or fewer');
  return problems;
}

/** Every markdown link in the draft (body, FAQ answers, card text). */
export function linksIn(draft) {
  const text = [draft.body, ...draft.faq.map(f => f.answer), draft.tldr.summary].join('\n');
  return [...text.matchAll(MD_LINK)].map(m => ({ text: m[1], url: m[2] }));
}

async function status(url, fetchImpl) {
  const opts = { redirect: 'follow', signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; SpenzaBlogCheck/1.0)' } };
  try {
    let r = await fetchImpl(url, { ...opts, method: 'HEAD' });
    if (r.status === 405 || r.status === 403 || r.status === 400) r = await fetchImpl(url, { ...opts, method: 'GET' });
    return r.status;
  } catch {
    return 0;
  }
}

/**
 * Check every link. A dead one is unlinked (text kept) rather than left to rot:
 * a broken link in a published post is worse than no link.
 * @returns {{draft, dead:{url:string,status:number}[]}}
 */
export async function verifyLinks(draft, { fetchImpl = fetch, siteUrl = 'https://spenza.com' } = {}) {
  const urls = [...new Set(linksIn(draft).map(l => l.url).filter(u => !u.startsWith('#') && !u.startsWith('mailto:')))];
  const dead = [];
  await Promise.all(urls.map(async u => {
    const abs = u.startsWith('/') ? siteUrl + u : u;
    const s = await status(abs, fetchImpl);
    if (s === 0 || s >= 400) dead.push({ url: u, status: s });
  }));
  if (!dead.length) return { draft, dead };
  const deadSet = new Set(dead.map(d => d.url));
  const unlink = s => s.replace(MD_LINK, (m, t, u) => (deadSet.has(u) ? t : m));
  return {
    dead,
    draft: {
      ...draft,
      body: unlink(draft.body),
      tldr: { ...draft.tldr, summary: unlink(draft.tldr.summary) },
      faq: draft.faq.map(f => ({ ...f, answer: unlink(f.answer) })),
    },
  };
}
