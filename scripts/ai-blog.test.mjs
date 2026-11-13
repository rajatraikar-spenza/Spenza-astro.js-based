// The AI pipeline end to end, with a scripted fake model and a fake image generator.
// Verifies orchestration and gates, not model quality: the revise loop, the
// 91-and-no-P0 pass rule, dead-link removal, image QA retries, and that what is
// written builds through the same renderer the site uses.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { runPipeline, reportMarkdown } from './ai-blog/run.mjs';
import { slugify, validateInputs } from './ai-blog/assemble.mjs';
import { structureProblems, verifyLinks, linksIn } from './ai-blog/checks.mjs';
import { rank, fileChunks, brainContext, isSensitive, parseFrontMatter } from './ai-blog/brain.mjs';
import { slopProblems, preservesFacts, mergeRewrite, styleTotal } from './ai-blog/style.mjs';
import { offenders } from './check-brain-private.mjs';
import { runCouncil, ADVISORS } from './ai-blog/council.mjs';

const para = n => Array.from({ length: n }, (_, i) => `Operators compare connectivity bundles by margin per device, and the comparison only holds when usage is measured over ninety days rather than forecast ${i}.`).join(' ');
const table = '| Tier | Data | Margin |\n|---|---|---|\n| Light | 100 MB | High |\n| Heavy | 10 GB | Negative |';
const section = (i, extra = '') => `## Section number ${i} heading\n\n${para(14)}\n\n${extra}`;
const BODY = [para(10), para(10), section(1, table), section(2), section(3, table), section(4), section(5), section(6)].join('\n\n');

const draftBase = () => ({
  description: 'How operators price connectivity bundles so heavy users never erase the margin on a connected device, with tiers and billing steps.',
  tags: ['IoT'], focusKeyword: 'connectivity bundle', heroAlt: 'Orange line art of a device, a SIM and an invoice.',
  bodyImage: { alt: 'Paper-cut device, plan and invoice joined by ribbons.', caption: 'One bundle ties the device to its plan.', afterSection: 2 },
  tldr: {
    summary: 'Price the data, protect the margin, automate the bill.',
    cards: ['chart-line', 'coins', 'circle-check', 'clipboard-check', 'gears'].map((icon, i) => ({ icon, title: `Card ${i + 1} title`, text: 'One short sentence about this point.' })),
  },
  faq: Array.from({ length: 5 }, (_, i) => ({ question: `Question ${i + 1}?`, answer: 'A short self-contained answer. See [pricing](https://spenza.com/contact-us/).' })),
  body: `${BODY}\n\nRead [the source](https://dead.example/report) and [our contact page](https://spenza.com/contact-us/).`,
  imagePlan: { heroObjects: ['a SIM card', 'a phone', 'an invoice'], heroTitleLines: ['PRICING CONNECTIVITY', 'BUNDLES'], bodyScene: 'a device, a plan and an invoice on a hill', bodyLabels: ['Device', 'Plan'] },
});

const goodAdvisor = { score: 93, issues: [], strengths: ['clear'] };
const peer = { missed: [], overRated: [], blockers: [] };

/** A model scripted by label; `chairman` and `factcheck` receive the call number. */
// The draft as the gate leaves it: the dead link is already unlinked, so a rewrite must start from this.
const cleanBase = () => { const d = draftBase(); d.body = d.body.replace('[the source](https://dead.example/report)', 'the source'); return d; };
const goodStyle = { directness: 9, rhythm: 9, trust: 9, authenticity: 9, density: 9, tells: [] };
const badStyle = { directness: 5, rhythm: 6, trust: 6, authenticity: 5, density: 6, tells: [{ quote: 'a staged line', pattern: 'staging', fix: 'state it' }] };

function fakeLlm({ chairman, factcheck = () => ({ unsupported: [] }), factcheckStyle = () => ({ unsupported: [] }), qa = () => ({ pass: true, issues: [] }), draft = draftBase, style = () => goodStyle, rewrite = d => d }) {
  const calls = {};
  const log = [];
  return {
    usage: { input: 0, output: 0, calls: 0 },
    log,
    async ask({ label }) {
      calls[label] = (calls[label] ?? 0) + 1;
      log.push(label);
      if (label === 'research') return '## Verified facts\n| Claim | Figure |\n';
      if (label === 'draft' || label === 'revise') return draft(calls[label], label);
      if (label === 'factcheck') return factcheck(calls[label]);
      if (label === 'factcheck:style') return factcheckStyle(calls[label]);
      if (label === 'style-score') return style(calls[label]);
      if (label === 'style-rewrite') return rewrite(cleanBase(), calls[label]);
      if (label.startsWith('advisor:')) return goodAdvisor;
      if (label.startsWith('peer:')) return peer;
      if (label === 'chairman') return chairman(calls[label]);
      if (label.startsWith('image-qa:')) return qa(label, (calls[label]));
      throw new Error(`unscripted call ${label}`);
    },
  };
}

const png = (w, h) => sharp({ create: { width: w, height: h, channels: 3, background: '#ff8e64' } }).png().toBuffer();
const fakeGen = async () => png(1536, 1024);
const fakeCompose = async () => png(1280, 720);
const okFetch = async url => ({ status: String(url).includes('dead.example') ? 404 : 200 });

function tmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-blog-'));
  fs.mkdirSync(path.join(root, 'src', 'content', 'cms-blog'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  return root;
}
const inputs = { title: 'Pricing Connectivity Bundles: A Margin Guide', brief: 'Explain how to price connectivity bundles so heavy users do not erase device margin.', author: 'isimplexity', category: 'iot', focusKeyword: '', mustCover: '', links: '', images: 'generate' };
const run = (llm, extra = {}, root = tmpRoot()) => runPipeline({ inputs, llm, gen: fakeGen, compose: fakeCompose, root, fetchImpl: okFetch, now: new Date('2026-11-13T10:00:00Z'), log: () => {}, ...extra }).then(r => ({ ...r, root }));

test('passes in round 2 after the council asks for a revision; writes an entry that builds', async () => {
  const llm = fakeLlm({
    chairman: n => n === 1
      ? { score: 84, p0: [], mustFix: ['Tighten the intro'], verdict: 'revise', summary: 'Close.' }
      : { score: 94, p0: [], mustFix: [], verdict: 'pass', summary: 'Ready.' },
  });
  const r = await run(llm);
  assert.equal(r.passed, true);
  assert.equal(r.report.score, 94);
  assert.equal(r.report.rounds.length, 2);
  assert.equal(llm.log.filter(l => l === 'revise').length, 1);
  assert.equal(llm.log.filter(l => l.startsWith('advisor:')).length, 10); // 5 advisors x 2 rounds
  assert.equal(llm.log.filter(l => l === 'chairman').length, 2);
  assert.equal(r.report.builds, true);
  assert.deepEqual(r.files.sort(), ['public/cms-media/pricing-connectivity-bundles-a-margin-guide/body.webp', 'public/cms-media/pricing-connectivity-bundles-a-margin-guide/hero.webp', 'src/content/cms-blog/pricing-connectivity-bundles-a-margin-guide.mdx'].sort());
  const mdx = fs.readFileSync(path.join(r.root, r.files.find(f => f.endsWith('.mdx'))), 'utf8');
  assert.match(mdx, /generated: true/);
  assert.match(mdx, /score: 94/);
  assert.ok(!mdx.includes('dead.example'), 'the dead link was unlinked');
  assert.match(mdx, /\[our contact page\]\(https:\/\/spenza\.com\/contact-us\/\)/);
  assert.match(reportMarkdown(r, { title: inputs.title }), /Passed the five-advisor council: 94\/100/);
});

test('a P0 or an unsupported claim blocks a pass even with a high score', async () => {
  const llm = fakeLlm({
    chairman: () => ({ score: 95, p0: ['Invented statistic'], mustFix: ['Remove it'], verdict: 'revise', summary: 'Blocked.' }),
  });
  const r = await run(llm);
  assert.equal(r.passed, false);
  assert.equal(r.report.rounds.length, 3); // three rounds, then it stops
  assert.equal(llm.log.filter(l => l === 'revise').length, 2);

  const llm2 = fakeLlm({
    chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'Fine.' }),
    factcheck: n => (n < 2 ? { unsupported: [{ claim: '40% of devices', where: 'section 1', why: 'not in the notes' }] } : { unsupported: [] }),
  });
  const r2 = await run(llm2);
  assert.equal(r2.passed, true);
  assert.equal(r2.report.rounds.length, 2);
  assert.equal(r2.report.rounds[0].passed, false);
});

test('a draft that never passes is still written, clearly marked, so a human can finish it', async () => {
  const llm = fakeLlm({ chairman: () => ({ score: 80, p0: [], mustFix: ['More depth'], verdict: 'revise', summary: 'Thin.' }) });
  const r = await run(llm);
  assert.equal(r.passed, false);
  const mdx = fs.readFileSync(path.join(r.root, r.files.find(f => f.endsWith('.mdx'))), 'utf8');
  assert.match(mdx, /Did NOT pass: council 80\/100, need 91/);
  assert.match(reportMarkdown(r, { title: inputs.title }), /Did not pass\./);
});

test('image QA failures regenerate with the objections, then succeed', async () => {
  let prompts = [];
  const gen = async ({ prompt }) => { prompts.push(prompt); return png(1536, 1024); };
  const llm = fakeLlm({
    chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' }),
    qa: (label, n) => (label === 'image-qa:body' && n === 1 ? { pass: false, issues: ['label "Devce" is misspelled'] } : { pass: true, issues: [] }),
  });
  const r = await run(llm, { gen });
  assert.equal(r.report.builds, true);
  const bodyPrompts = prompts.filter(p => p.includes('chunky, softly rounded'));
  assert.equal(bodyPrompts.length, 2);
  assert.match(bodyPrompts[1], /rejected for: label "Devce" is misspelled/);
  assert.ok(r.report.notes.some(n => /body attempt 1 rejected/.test(n)));
});

test('images skipped or failing leaves a draft with no hero, and says so', async () => {
  const llm = fakeLlm({ chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' }) });
  const r = await run(llm, {}, tmpRoot());
  assert.equal(r.report.builds, true);

  const llm2 = fakeLlm({ chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' }) });
  const root = tmpRoot();
  const r2 = await runPipeline({ inputs: { ...inputs, images: 'skip' }, llm: llm2, gen: fakeGen, root, fetchImpl: okFetch, log: () => {} });
  assert.equal(r2.report.builds, false);
  assert.ok(r2.report.notes.some(n => /Upload a hero|upload a hero/i.test(n)));
  assert.deepEqual(r2.files, ['src/content/cms-blog/pricing-connectivity-bundles-a-margin-guide.mdx']);

  const llm3 = fakeLlm({ chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' }), qa: () => ({ pass: false, issues: ['brown tones'] }) });
  const r3 = await run(llm3);
  assert.equal(r3.report.builds, false);
  assert.ok(r3.report.notes.some(n => /failed the style check 3 times/.test(n)));
});

test('refuses to start on bad input, a taken slug or an existing WordPress slug', async () => {
  const llm = fakeLlm({ chairman: () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' }) });
  await assert.rejects(runPipeline({ inputs: { ...inputs, category: 'news' }, llm, root: tmpRoot() }), /category must be one of/);
  await assert.rejects(runPipeline({ inputs: { ...inputs, brief: 'x' }, llm, root: tmpRoot() }), /description needs/);
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, 'src/content/cms-blog/pricing-connectivity-bundles-a-margin-guide.mdx'), 'x');
  await assert.rejects(runPipeline({ inputs, llm, root }), /already exists/);
  await assert.rejects(runPipeline({ inputs, llm, root: tmpRoot(), findExisting: async () => [{ slug: 'pricing-connectivity-bundles-a-margin-guide' }] }), /published post already uses the slug/);
  assert.equal(llm.log.length, 0, 'no model call was spent');
});

test('slugify and input validation', () => {
  assert.equal(slugify('eSIM & IoT: What\'s New in 2026?'), 'esim-and-iot-what-s-new-in-2026');
  assert.ok(slugify('A '.repeat(80)).length <= 60);
  assert.deepEqual(validateInputs(inputs), []);
});

test('structureProblems enforces length, tables, cards, FAQ, icons and hero lines', () => {
  assert.deepEqual(structureProblems(draftBase(), { category: 'iot' }), []);
  const d = draftBase();
  d.body = 'short';
  d.faq = d.faq.slice(0, 3);
  d.tldr.cards[0].icon = 'not-a-real-icon';
  d.imagePlan.heroTitleLines = ['THIS LINE IS FAR TOO LONG TO FIT THE TEMPLATE'];
  const p = structureProblems(d, { category: 'iot' }).join('|');
  for (const re of [/words/, /H2 sections/, /tables/, /FAQ/, /icon "not-a-real-icon"/, /heroTitleLines/]) assert.match(p, re);
});

test('verifyLinks unlinks dead links and keeps live ones (relative links resolve against the site)', async () => {
  const d = draftBase();
  d.body += ' See [relative](/contact-us/) and [gone](https://dead.example/x) and [anchor](#faq).';
  const seen = [];
  const { draft, dead } = await verifyLinks(d, { fetchImpl: async u => { seen.push(u); return { status: String(u).includes('dead') ? 404 : 200 }; } });
  assert.deepEqual(dead.map(x => x.url).sort(), ['https://dead.example/report', 'https://dead.example/x']);
  assert.ok(seen.includes('https://spenza.com/contact-us/'));
  assert.ok(!seen.some(u => u.includes('#faq')));
  assert.ok(!linksIn(draft).some(l => l.url.includes('dead.example')));
  assert.match(draft.body, /gone and/);
});

test('brain: ranks file chunks by overlap, merges an endpoint, and degrades quietly', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-'));
  fs.writeFileSync(path.join(dir, 'product.md'), '# ControlHub\n\nControlHub manages eSIM connectivity profiles for enterprise fleets and billing in one console, with usage alerts.\n\n# Careers\n\nWe hire engineers in several cities across the world today and tomorrow too.');
  assert.equal(fileChunks(dir).length, 2);
  assert.match(rank(fileChunks(dir), 'esim fleet connectivity billing')[0].text, /ControlHub/);
  const logs = [];
  const ctx = await brainContext({
    query: 'esim fleet connectivity', dir, log: m => logs.push(m),
    env: { SPENZA_BRAIN_URL: 'https://brain.example/q', SPENZA_BRAIN_TOKEN: 't' },
    fetchImpl: async (u, o) => ({ ok: true, json: async () => ({ results: [{ title: 'Pricing sheet', text: 'Per-line pricing with volume tiers.' }] }), _o: o }),
  });
  assert.match(ctx, /ControlHub/);
  assert.match(ctx, /Per-line pricing/);
  const down = await brainContext({ query: 'zzz', dir, log: m => logs.push(m), env: { SPENZA_BRAIN_URL: 'https://brain.example/q' }, fetchImpl: async () => { throw new Error('boom'); } });
  assert.equal(down, '');
  assert.ok(logs.some(l => /endpoint unavailable/.test(l)));
});

test('council runs five distinct advisors, anonymises peers, and needs 91 with no P0', async () => {
  assert.equal(new Set(ADVISORS.map(a => a.id)).size, 5);
  const seenPeerPackets = [];
  const llm = {
    async ask({ label, user }) {
      if (label.startsWith('advisor:')) return goodAdvisor;
      if (label.startsWith('peer:')) { seenPeerPackets.push(user); return peer; }
      return { score: 91, p0: [], mustFix: [], verdict: 'pass', summary: 'ok' };
    },
  };
  const c = await runCouncil({ llm, draft: { title: 't', description: 'd', tldr: {}, body: 'b', faq: [] }, notes: 'n', brief: 'b', rng: () => 0.5 });
  assert.equal(c.advisors.length, 5);
  assert.equal(c.passed, true);
  for (const p of seenPeerPackets) {
    assert.match(p, /Reviewer D/);
    assert.ok(!/Contrarian|Outsider|Executor|Expansionist|First Principles/.test(p.split("Colleagues' reviews:")[1]), 'peer packets are anonymous');
  }
  const failing = await runCouncil({ llm: { ask: async ({ label }) => (label === 'chairman' ? { score: 90, p0: [], mustFix: ['x'], verdict: 'revise', summary: '' } : label.startsWith('peer') ? peer : goodAdvisor) }, draft: { title: 't', description: '', tldr: {}, body: '', faq: [] }, notes: '', brief: '' });
  assert.equal(failing.passed, false);
});

// ---- style stage -------------------------------------------------------------

const passingChairman = () => ({ score: 95, p0: [], mustFix: [], verdict: 'pass', summary: 'ok', agree: ['clear structure'], clash: ['length'], blindSpots: ['definition of margin'], firstFix: 'Define margin early.' });

test('style: a clean draft passes on the first look and no rewrite is spent', async () => {
  const llm = fakeLlm({ chairman: passingChairman });
  const r = await run(llm);
  assert.equal(r.report.style.ok, true);
  assert.equal(llm.log.filter(l => l === 'style-rewrite').length, 0);
  assert.match(reportMarkdown(r, { title: inputs.title }), /style check: 45\/50/);
  assert.match(reportMarkdown(r, { title: inputs.title }), /\*\*Where the council agrees\*\*\n- clear structure/);
  assert.match(reportMarkdown(r, { title: inputs.title }), /The one thing to fix first:\*\* Define margin early\./);
});

test('style: a low score triggers a rewrite, which is re-checked and kept when it is safe', async () => {
  const llm = fakeLlm({
    chairman: passingChairman,
    style: n => (n === 1 ? badStyle : goodStyle),
    rewrite: d => ({ ...d, body: d.body.replace('Operators compare', 'Operators weigh') }),
  });
  const r = await run(llm);
  assert.equal(llm.log.filter(l => l === 'style-rewrite').length, 1);
  assert.equal(llm.log.filter(l => l === 'factcheck:style').length, 1, 'the rewrite is fact-checked again');
  assert.equal(r.report.style.ok, true);
  assert.equal(r.passed, true);
  assert.match(fs.readFileSync(path.join(r.root, r.files.find(f => f.endsWith('.mdx'))), 'utf8'), /Operators weigh/);
});

test('style: a rewrite that loses a number is rejected and the original draft is kept', async () => {
  const llm = fakeLlm({
    chairman: passingChairman,
    style: () => badStyle,
    rewrite: d => ({ ...d, body: d.body.replaceAll('100 MB', 'small') }),
  });
  const r = await run(llm);
  assert.equal(r.report.style.ok, false);
  assert.equal(r.passed, false);
  assert.ok(r.report.notes.some(n => /rewrite was rejected because it changed facts: number lost: 100/.test(n)));
  const mdx = fs.readFileSync(path.join(r.root, r.files.find(f => f.endsWith('.mdx'))), 'utf8');
  assert.match(mdx, /\[our contact page\]/);
  assert.match(mdx, /Did NOT pass: style/);
});

test('style: a rewrite that introduces an unsupported claim is reverted after the re-check', async () => {
  const llm = fakeLlm({
    chairman: passingChairman,
    style: n => (n === 1 ? badStyle : goodStyle),
    rewrite: d => ({ ...d, body: d.body.replace('Operators compare', 'Operators compare, as 80 percent do,') }),
    factcheckStyle: () => ({ unsupported: [{ claim: '80 percent do', where: 'body', why: 'not in the notes' }] }),
  });
  const r = await run(llm);
  assert.equal(r.report.style.reverted, true);
  assert.equal(r.passed, false);
  assert.ok(!fs.readFileSync(path.join(r.root, r.files.find(f => f.endsWith('.mdx'))), 'utf8').includes('80 percent'));
});

test('slop lint quotes the exact problem, skips table cells and link targets, and passes clean prose', () => {
  const d = draftBase();
  d.body = 'Here\'s the thing: pricing is hard \u2014 really hard.\n\n| a | really just a cell |\n|---|---|\n| x | y |\n\nRead [the report](https://example.com/just-in-time) for more.';
  const p = slopProblems(d).join('\n');
  assert.match(p, /\(throat-clearing\)/);
  assert.match(p, /\(em dash\)/);
  assert.match(p, /\(adverb\)/);
  assert.ok(!/cell/.test(p), 'table cells are data, not prose');
  assert.ok(!/just-in-time/.test(p), 'link targets are not prose');
  assert.deepEqual(slopProblems(draftBase()), []);
});

test('preservesFacts and mergeRewrite: only wording may change', () => {
  const before = draftBase();
  const same = mergeRewrite(before, { body: before.body, tldr: before.tldr, faq: before.faq, bodyImage: before.bodyImage });
  assert.deepEqual(preservesFacts(before, same), []);
  const hostile = mergeRewrite(before, { body: before.body.replace('https://spenza.com/contact-us/', 'https://evil.example/') + ' 99 percent', tldr: { summary: 's', cards: [] }, faq: [], bodyImage: before.bodyImage });
  // title, icons, image plan, description and FAQ questions cannot be changed by a rewrite
  assert.equal(hostile.description, before.description);
  assert.deepEqual(hostile.imagePlan, before.imagePlan);
  assert.deepEqual(hostile.tldr.cards.map(c => c.icon), before.tldr.cards.map(c => c.icon));
  assert.match(preservesFacts(before, hostile).join('|'), /link added: https:\/\/evil\.example\//);
  const shrunk = { ...before, body: 'short body' };
  assert.match(preservesFacts(before, shrunk).join('|'), /shrank|headings|table/);
  assert.equal(styleTotal({ directness: 9, rhythm: 8, trust: 7, authenticity: 6, density: 5 }), 35);
});

// ---- brain: claim status, sensitivity, privacy -------------------------------

test('brain: front matter sets claim status; proposed, historical and meeting-reported never reach the writer', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-'));
  const body = t => `# ${t}\n\nControlHub manages eSIM connectivity profiles for enterprise fleets with usage alerts and billing in one console for operators.\n`;
  fs.writeFileSync(path.join(dir, 'live.md'), `---\nstatus: documented\nas_of: 2026-10-23\n---\n${body('Live')}`);
  fs.writeFileSync(path.join(dir, 'wiki.md'), body('Wiki draft'));
  fs.writeFileSync(path.join(dir, 'plan.md'), `---\nstatus: proposed\n---\n${body('Roadmap')}`);
  fs.writeFileSync(path.join(dir, 'old.md'), `---\nstatus: historical\n---\n${body('Old')}`);
  fs.writeFileSync(path.join(dir, 'talk.md'), `---\nstatus: meeting-reported\n---\n${body('Call')}`);
  assert.deepEqual(parseFrontMatter('---\nstatus: approved\nas_of: "2026-01-01"\n---\nx').meta, { status: 'approved', as_of: '2026-01-01' });
  const logs = [];
  const ctx = await brainContext({ query: 'controlhub esim fleet billing', dir, env: {}, log: m => logs.push(m) });
  assert.match(ctx, /\[live\.md \| documented \| as of 2026-10-23\]/);
  assert.match(ctx, /\[wiki\.md \| draft, unverified\]/);
  assert.ok(!/Roadmap|Old|Call/.test(ctx), 'excluded statuses are withheld');
  assert.ok(logs.some(l => /withheld 3 chunk\(s\) by claim status/.test(l)));
});

test('brain: sensitive chunks are dropped, from files and from the endpoint', async () => {
  assert.equal(isSensitive('Contact jane.doe@example.com for the deal'), true);
  assert.equal(isSensitive('Call +1 (415) 555-0134 today'), true);
  assert.equal(isSensitive('Use token ghp_abcdefghijklmnopqrstuvwx'), true);
  assert.equal(isSensitive('This section is CONFIDENTIAL'), true);
  assert.equal(isSensitive('ControlHub manages eSIM profiles for fleets.'), false);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-'));
  fs.writeFileSync(path.join(dir, 'deal.md'), '# Deal\n\nThe fleet billing deal terms are confidential and must not be shared outside the account team at all.\n');
  const logs = [];
  const ctx = await brainContext({
    query: 'fleet billing deal', dir, log: m => logs.push(m),
    env: { SPENZA_BRAIN_URL: 'https://brain.example/q' },
    fetchImpl: async () => ({ ok: true, json: async () => ({ results: [{ title: 'Sheet', text: 'Owner is bob@spenza.example for fleet billing questions and more detail here.' }, { title: 'Ok', status: 'documented', text: 'Fleet billing is invoiced per line each month from usage records in the platform.' }] }) }),
  });
  assert.ok(!/confidential|bob@/.test(ctx));
  assert.match(ctx, /Fleet billing is invoiced per line/);
  assert.ok(logs.some(l => /withheld 0 chunk\(s\) by claim status and 2 as sensitive/.test(l)));
});

test('the public repo guard flags tracked internal notes and allows the README', () => {
  assert.deepEqual(offenders(['docs/spenza-brain/README.md', 'docs/spenza-brain/.gitignore', 'src/a.mjs']), []);
  assert.deepEqual(offenders(['docs/spenza-brain/product.md', 'docs/spenza-brain/wiki/x.md', '.brain-private/a.md', 'docs/spenza-brain-private/b.md']).length, 4);
});
