#!/usr/bin/env node
// AI blog pipeline: brief in, reviewed draft (files + report) out.
//
//   research  ->  draft  ->  [ structure + links + fact-check + five-advisor council ] x up to 3  ->  images  ->  files
//
// Run by .github/workflows/ai-blog.yml, which then opens the result as a Draft in
// the editorial workflow. Inputs arrive as environment variables (never spliced
// into a shell command). `runPipeline` takes its collaborators as arguments so the
// tests drive the whole thing with a fake model and no network.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLlm } from './llm.mjs';
import { WEB_SEARCH, WEB_FETCH_SPENZA } from './llm.mjs';
import {
  researchSystem, researchUser, draftSystem, draftUser, reviseUser, DRAFT_SCHEMA,
  FACTCHECK_SCHEMA, factcheckSystem, factcheckUser,
} from './prompts.mjs';
import { runCouncil, PASS_SCORE } from './council.mjs';
import { structureProblems, verifyLinks, wordCount } from './checks.mjs';
import { brainContext } from './brain.mjs';
import { makeImages, openaiImageGen } from './images.mjs';
import { slugify, validateInputs, entryMeta, writeEntry, proveBuilds } from './assemble.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MAX_ROUNDS = 3;

export async function runPipeline({
  inputs, llm, gen, root = ROOT, siteUrl = 'https://spenza.com', now = new Date(), runUrl = '',
  fetchImpl = fetch, findExisting = async () => [], compose, log = m => console.log(`[ai-blog] ${m}`),
}) {
  const bad = validateInputs(inputs);
  if (bad.length) throw new Error(`Cannot start: ${bad.join('; ')}`);

  const slug = slugify(inputs.title);
  if (fs.existsSync(path.join(root, 'src', 'content', 'cms-blog', `${slug}.mdx`))) throw new Error(`An admin post with the slug "${slug}" already exists. Change the title or edit that post.`);
  const existing = await findExisting(inputs.title);
  if (existing.some(e => e.slug === slug)) throw new Error(`A published post already uses the slug "${slug}". Change the title.`);

  const report = { slug, rounds: [], notes: [], startedAt: now.toISOString() };

  // 1. Internal knowledge + research
  const brain = await brainContext({ query: `${inputs.title} ${inputs.brief}`, dir: path.join(root, 'docs', 'spenza-brain'), fetchImpl, log });
  report.brain = Boolean(brain);
  log('researching');
  const notes = await llm.ask({
    label: 'research', system: researchSystem, tools: [WEB_SEARCH, WEB_FETCH_SPENZA], maxTokens: 16000,
    user: researchUser({ ...inputs, focusKeyword: inputs.focusKeyword, mustCover: inputs.mustCover, existing, brain }),
  });

  // 2. First draft
  log('drafting');
  let draft = await llm.ask({
    label: 'draft', system: draftSystem, schema: DRAFT_SCHEMA, maxTokens: 24000,
    user: draftUser({ ...inputs, notes, brain }),
  });

  // 3. Gate loop
  let verdict;
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    log(`quality gate: round ${round}`);
    const structure = structureProblems(draft, { category: inputs.category, author: inputs.author, slug });
    const linked = await verifyLinks(draft, { fetchImpl, siteUrl });
    draft = linked.draft;
    const fact = await llm.ask({ label: 'factcheck', system: factcheckSystem, schema: FACTCHECK_SCHEMA, effort: 'medium', user: factcheckUser({ draft, notes }) });
    const council = await runCouncil({ llm, draft: { ...draft, title: inputs.title }, notes, brief: inputs.brief, log });

    const mustFix = [
      ...structure.map(s => `Structure: ${s}`),
      ...fact.unsupported.map(u => `Unsupported claim in ${u.where}: "${u.claim}" (${u.why}). Support it from the research notes or remove it.`),
      ...council.chairman.mustFix,
    ];
    const passed = structure.length === 0 && fact.unsupported.length === 0 && council.passed;
    verdict = { round, passed, score: council.chairman.score, p0: council.chairman.p0, summary: council.chairman.summary, structure, unsupported: fact.unsupported, deadLinks: linked.dead, advisors: council.advisors.map(a => ({ name: a.name, score: a.review.score })) };
    report.rounds.push(verdict);
    report.council = council;
    log(`round ${round}: score ${council.chairman.score}, ${council.chairman.p0.length} P0, ${structure.length} structure, ${fact.unsupported.length} unsupported -> ${passed ? 'PASS' : 'revise'}`);
    if (passed || round === MAX_ROUNDS) break;

    draft = await llm.ask({ label: 'revise', system: draftSystem, schema: DRAFT_SCHEMA, maxTokens: 24000, user: reviseUser({ draft, mustFix, notes }) });
  }
  report.passed = verdict.passed;
  report.score = verdict.score;

  // 4. Images
  let images = null;
  let imagePaths = null;
  if (inputs.images === 'generate' && gen) {
    try {
      images = await makeImages({ llm, plan: draft.imagePlan, gen, compose, log });
      imagePaths = { hero: `/cms-media/${slug}/hero.webp`, body: `/cms-media/${slug}/body.webp` };
      report.notes.push(...images.notes);
    } catch (err) {
      report.notes.push(`Images were not produced: ${err.message}. Upload a hero (and body) image in the editor.`);
      log(`images failed: ${err.message}`);
    }
  } else {
    report.notes.push(inputs.images === 'skip' ? 'Images skipped at your request: upload a hero (and body) image in the editor.' : 'No image provider configured: upload a hero (and body) image in the editor.');
  }

  // 5. Files + proof they build
  const ai = {
    generated: true,
    score: verdict.score,
    verdict: verdict.passed ? `Passed the council at ${verdict.score}/100.` : `Did NOT pass the council (${verdict.score}/100, need ${PASS_SCORE}). ${verdict.summary}`,
    runUrl: runUrl || undefined,
  };
  const meta = entryMeta({ inputs, draft, slug, now, imagePaths: imagePaths ?? undefined, ai });
  if (!images) { meta.bodyImage.image = ''; }
  const out = writeEntry({ root, slug, meta, body: draft.body, images });
  if (images) {
    const built = await proveBuilds({ root, file: out.file, siteUrl });
    if (built.errors.length) throw new Error(`The generated entry does not build: ${built.errors.join('; ')}`);
    report.builds = true;
  } else {
    report.builds = false; // no hero yet: the editor adds one; the PR check explains
  }
  report.words = wordCount(draft);
  report.files = out.written;
  report.usage = llm.usage;
  return { slug, report, files: out.written, passed: report.passed };
}

export function reportMarkdown({ slug, report }, { title }) {
  const last = report.rounds.at(-1);
  const lines = [
    `## AI draft: ${title}`,
    '',
    report.passed
      ? `**Passed the five-advisor council: ${report.score}/100** (round ${last.round} of ${MAX_ROUNDS}).`
      : `**Did not pass the council.** Best score ${report.score}/100, ${PASS_SCORE} needed. Read the blockers below before publishing.`,
    '',
    `Words: ${report.words}. Slug: \`/${slug}/\`. Internal knowledge used: ${report.brain ? 'yes' : 'no'}.`,
    '',
    '### Council advisors (last round)',
    ...last.advisors.map(a => `- ${a.name}: ${a.score}`),
    '',
    `**Chairman:** ${last.summary}`,
  ];
  if (last.p0.length) lines.push('', '**Blockers (P0):**', ...last.p0.map(p => `- ${p}`));
  if (last.unsupported.length) lines.push('', '**Unsupported claims still in the draft:**', ...last.unsupported.map(u => `- ${u.claim} (${u.where})`));
  if (last.deadLinks.length) lines.push('', 'Links removed because they did not resolve:', ...last.deadLinks.map(d => `- ${d.url} (${d.status || 'unreachable'})`));
  if (report.notes.length) lines.push('', '### Notes', ...report.notes.map(n => `- ${n}`));
  lines.push(
    '', '### Next steps',
    '1. Open the **Editorial workflow** in `/admin` and edit this draft (text, images, cards, FAQ).',
    '2. Move it to **In review**, then **Ready**.',
    '3. **Publish** merges this pull request; the site deploys from the merge.',
  );
  return lines.join('\n');
}

// ---- CLI ---------------------------------------------------------------------

async function main() {
  const env = process.env;
  const inputs = {
    title: env.AI_TITLE ?? '', brief: env.AI_BRIEF ?? '', author: env.AI_AUTHOR ?? 'isimplexity', category: env.AI_CATEGORY ?? '',
    focusKeyword: env.AI_KEYWORD ?? '', mustCover: env.AI_MUST ?? '', links: env.AI_LINKS ?? '', images: env.AI_IMAGES ?? 'generate',
  };
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set. Add it as a repository secret.');
  const llm = createLlm();
  const gen = env.OPENAI_API_KEY ? openaiImageGen() : null;

  let findExisting = async () => [];
  try {
    const { wpQuery } = await import('../lib/wp-graphql.mjs');
    findExisting = async title => {
      const q = title.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3).slice(0, 6).join(' ');
      if (!q) return [];
      const d = await wpQuery(`{posts(first:5,where:{search:${JSON.stringify(q)},status:PUBLISH}){nodes{title slug uri}}}`);
      return d.posts?.nodes ?? [];
    };
  } catch { /* duplicate check is best effort */ }

  const runUrl = env.GITHUB_SERVER_URL && env.GITHUB_RUN_ID ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` : '';
  const result = await runPipeline({ inputs, llm, gen, runUrl, findExisting, siteUrl: env.SITE_URL || 'https://spenza.com' });
  const md = reportMarkdown(result, { title: inputs.title });
  fs.writeFileSync(path.join(ROOT, 'ai-blog-report.md'), md);
  fs.writeFileSync(path.join(ROOT, 'ai-blog-report.json'), JSON.stringify(result.report, null, 2));
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, md + '\n');
  if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `slug=${result.slug}\npassed=${result.passed}\nscore=${result.report.score}\n`);
  console.log(md);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(`::error::${err.message}`); process.exit(1); });
}
