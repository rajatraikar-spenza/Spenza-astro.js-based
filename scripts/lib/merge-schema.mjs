/**
 * Structured-data delta for a merged article.
 *
 * Yoast already emits Article, WebPage, ImageObject, BreadcrumbList, WebSite,
 * Organization and Person on every post. Re-declaring any of those gives the
 * page two competing graphs, so this adds only what Yoast does not know about
 * and links into Yoast's nodes by their existing `@id` rather than restating
 * them:
 *
 *   FAQPage  every merged cluster carries exactly six authored Q&As
 *   HowTo    only where the body genuinely contains gapless numbered steps
 *
 * Question and answer text is read out of the published body, never retyped,
 * so the visible markup and the schema cannot disagree - which is the thing
 * validators and answer engines actually penalise.
 *
 * Measured on the twelve MVNO clusters at validator.schema.org: 0 errors,
 * 0 warnings, with Yoast's Article still reported clean alongside.
 *
 * Google retired FAQ and HowTo *rich results* in 2023, so expect no visual
 * change in Google. The value is Bing and AI answer engines, which still lift
 * question-answer pairs out of FAQPage - the two numbers the merge plan tracks
 * as `bingCitations` and `googleAiImpressions`.
 */

const stripTags = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull each FAQ pair out of the authored `<details>` blocks.
 *
 * Matched on `<details>` rather than on an exact summary/paragraph adjacency:
 * two clusters (M07, M16) shape their FAQ markup differently, and an adjacency
 * regex silently found zero pairs for them while reporting success.
 */
export function extractFaqs(html) {
  const out = [];
  for (const m of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)) {
    const inner = m[1];
    const summary = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/);
    if (!summary) continue;
    const question = stripTags(summary[1]);
    const answer = stripTags(inner.slice(summary.index + summary[0].length));
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

/** Ordered steps, only when the author numbered them 1..n with no gaps. */
export function extractSteps(html) {
  const found = [];
  for (const m of html.matchAll(/<h3\b[^>]*>\s*(\d+)\.\s*([\s\S]*?)<\/h3>([\s\S]*?)(?=<h[23]\b|$)/g)) {
    const name = stripTags(m[2]);
    const text = stripTags(m[3]).split(/(?<=[.?!])\s+/)[0] || '';
    if (name && text) found.push({ position: Number(m[1]), name, text });
  }
  found.sort((a, b) => a.position - b.position);
  const gapless = found.length >= 3 && found.every((s, i) => s.position === i + 1);
  return gapless ? found : [];
}

/**
 * @returns {{ json: string|null, summary: { faq: number, howto: number, bytes: number } }}
 */
export function buildMergeSchema({ siteUrl, slug, category, title, description, html }) {
  const url = `${siteUrl.replace(/\/+$/, '')}/${category}/${slug}/`;
  const graph = [];

  const faqs = extractFaqs(html);
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      name: `FAQs: ${title}`,
      inLanguage: 'en-US',
      // Points at Yoast's WebPage node instead of declaring a second one.
      isPartOf: { '@id': url },
      mainEntity: faqs.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
    });
  }

  const steps = extractSteps(html);
  if (steps.length) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: title,
      description,
      inLanguage: 'en-US',
      isPartOf: { '@id': url },
      step: steps.map((s) => ({
        '@type': 'HowToStep',
        position: s.position,
        name: s.name,
        text: s.text,
        url: `${url}#step-${s.position}`,
      })),
    });
  }

  if (!graph.length) return { json: null, summary: { faq: 0, howto: 0, bytes: 0 } };

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  return { json, summary: { faq: faqs.length, howto: steps.length, bytes: json.length } };
}

/**
 * Structural gate. Everything here has been seen to pass schema.org's
 * validator; anything failing it must not reach WordPress.
 */
export function assertSchemaSound(json, slug) {
  const problems = [];
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return [`${slug}: JSON-LD does not parse (${e.message})`];
  }
  if (parsed['@context'] !== 'https://schema.org') problems.push(`${slug}: wrong @context`);

  for (const node of parsed['@graph'] || []) {
    if (node['@type'] === 'FAQPage') {
      if (!node.isPartOf?.['@id']) problems.push(`${slug}: FAQPage has no isPartOf`);
      if (!Array.isArray(node.mainEntity) || !node.mainEntity.length) {
        problems.push(`${slug}: FAQPage has no questions`);
      }
      for (const q of node.mainEntity || []) {
        if (q['@type'] !== 'Question') problems.push(`${slug}: bad Question type`);
        if (!q.name || q.name.length < 5) problems.push(`${slug}: empty or truncated question`);
        const text = q.acceptedAnswer?.text;
        if (q.acceptedAnswer?.['@type'] !== 'Answer') problems.push(`${slug}: bad Answer node`);
        if (!text || text.length < 20) problems.push(`${slug}: empty or truncated answer`);
        if (/[<>]/.test(`${q.name}${text || ''}`)) problems.push(`${slug}: raw angle bracket in Q&A text`);
      }
    }
    if (node['@type'] === 'HowTo') {
      if (!Array.isArray(node.step) || node.step.length < 3) problems.push(`${slug}: HowTo has too few steps`);
      (node.step || []).forEach((s, i) => {
        if (s.position !== i + 1) problems.push(`${slug}: HowTo steps are not 1..n`);
        if (!s.name || !s.text) problems.push(`${slug}: empty HowTo step`);
      });
    }
  }
  return problems;
}
