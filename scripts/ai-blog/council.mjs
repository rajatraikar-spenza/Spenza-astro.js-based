// The five-advisor council that gates every AI-written post.
//
// Adapted from the LLM Council method: five reviewers who think from deliberately
// different angles judge the draft independently, then each reads the other four
// anonymously and says what they missed or over-rated, then a chairman reconciles
// the lot into one verdict. Disagreement between advisors is the signal; a single
// reviewer's score is not.
//
// Pass = chairman score 91 or more with zero confirmed P0 (blocker) issues. The
// score uses the spenza-blog rubric: content 30, SEO 25, E-E-A-T 15, technical 15,
// AI-citation readiness 15.
export const PASS_SCORE = 91;

export const ADVISORS = [
  {
    id: 'contrarian',
    name: 'The Contrarian',
    lens: 'Assume the post has a fatal flaw and find it: the claim that will not survive a hostile expert, the number that is stale, the promise Spenza cannot keep, the section a reader skips, the reason this ranks nowhere.',
  },
  {
    id: 'first-principles',
    name: 'The First Principles Thinker',
    lens: 'Ignore the draft\'s framing. What question is the searcher actually trying to answer, and does this post answer THAT, in the order they need it? Flag a wrong angle, a buried answer, or a post that serves Spenza\'s story instead of the reader.',
  },
  {
    id: 'expansionist',
    name: 'The Expansionist',
    lens: 'Find the upside everyone missed: the stronger angle, the quotable line or table that AI assistants would cite, the adjacent question worth answering, the internal link or next step that turns a reader into a lead.',
  },
  {
    id: 'outsider',
    name: 'The Outsider',
    lens: 'You know nothing about telecom. Read it cold. Mark every undefined term, leap of logic, acronym and sentence you had to read twice. If a smart non-specialist is lost, say where.',
  },
  {
    id: 'executor',
    name: 'The Executor',
    lens: 'Can a reader act on this on Monday morning? Check that steps, numbers and examples are concrete and complete, that the tables are usable, that each H2 earns its place, and that the post is ready to publish as it stands.',
  },
];

const RUBRIC = `Score out of 100 using this rubric: content quality 30 (accuracy, depth, originality, answers the intent), SEO 25 (title, description, headings, keyword use, links, snippet-ready answers), E-E-A-T 15 (sourcing, dated stats, no invented claims, honest labelling of illustrative examples), technical elements 15 (structure, tables, FAQ, TL;DR, alt text, length), AI citation readiness 15 (self-contained answer passages, definitions, quotable facts).
P0 = a blocker that must never ship: an unsupported or invented statistic or product claim, a broken or invented link, a factual error, a wrong or buried answer, missing required structure, text that over-promises about Spenza, a roadmap or unconfirmed capability stated as live, a customer named without approval.
Prose that reads as machine-written (staged "not X, it's Y" contrasts, throat-clearing, forced triads, inflated language) lowers content quality and E-E-A-T; flag the worst quotes.`;

const issueSchema = {
  type: 'object', additionalProperties: false, required: ['severity', 'where', 'problem', 'fix'],
  properties: {
    severity: { type: 'string', enum: ['p0', 'high', 'medium', 'low'] },
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
  },
};

export const ADVISOR_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['score', 'issues', 'strengths'],
  properties: {
    score: { type: 'integer' },
    issues: { type: 'array', items: issueSchema },
    strengths: { type: 'array', items: { type: 'string' } },
  },
};

export const PEER_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['missed', 'overRated', 'blockers'],
  properties: {
    missed: { type: 'array', items: { type: 'string' } },
    overRated: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
};

export const CHAIRMAN_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['score', 'p0', 'mustFix', 'verdict', 'summary', 'agree', 'clash', 'blindSpots', 'firstFix'],
  properties: {
    score: { type: 'integer' },
    agree: { type: 'array', items: { type: 'string' } },
    clash: { type: 'array', items: { type: 'string' } },
    blindSpots: { type: 'array', items: { type: 'string' } },
    firstFix: { type: 'string' },
    p0: { type: 'array', items: { type: 'string' } },
    mustFix: { type: 'array', items: { type: 'string' } },
    verdict: { type: 'string', enum: ['pass', 'revise'] },
    summary: { type: 'string' },
  },
};

const render = d => JSON.stringify({ title: d.title, description: d.description, tldr: d.tldr, body: d.body, faq: d.faq }, null, 1);

const shuffle = (arr, rng) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/**
 * Run one council session on a draft.
 * @returns {{advisors, peers, chairman, passed:boolean}}
 */
export async function runCouncil({ llm, draft, notes, brief, rng = Math.random, effort = 'high', log = () => {} }) {
  const context = `Brief: ${brief}\n\nResearch notes (the only admissible evidence):\n${notes}\n\nDraft:\n${render(draft)}`;

  // 1. Independent reviews, in parallel.
  log('council: five advisors reviewing independently');
  const advisors = await Promise.all(ADVISORS.map(async a => ({
    ...a,
    review: await llm.ask({
      label: `advisor:${a.id}`, schema: ADVISOR_SCHEMA, effort,
      system: `You are ${a.name}, one of five advisors reviewing a draft Spenza blog post before it is published. Your lens: ${a.lens}\n${RUBRIC}\nLean fully into your lens and do not try to be balanced: the chairman balances. Be specific and literal. Quote the exact text you object to. Do not pad: if nothing is wrong, say so and score accordingly.`,
      user: context,
    }),
  })));

  // 2. Anonymous peer review: each advisor reads the other four, labelled A-D in random order.
  log('council: anonymous peer review');
  const peers = await Promise.all(advisors.map(async me => {
    const others = shuffle(advisors.filter(o => o.id !== me.id), rng);
    const packet = others.map((o, i) => `Reviewer ${String.fromCharCode(65 + i)} (score ${o.review.score}):\n${JSON.stringify(o.review.issues)}`).join('\n\n');
    return {
      id: me.id,
      review: await llm.ask({
        label: `peer:${me.id}`, schema: PEER_SCHEMA, effort: 'medium',
        system: `You are ${me.name}. You reviewed a Spenza draft and now read four anonymous colleagues' reviews. State what they MISSED that matters, what they OVER-RATED or flagged wrongly, and which issues you consider true blockers (P0). Be brief.`,
        user: `${context}\n\nYour own score was ${me.review.score}.\n\nColleagues' reviews:\n${packet}`,
      }),
    };
  }));

  // 3. The chairman reconciles.
  log('council: chairman verdict');
  const chairman = await llm.ask({
    label: 'chairman', schema: CHAIRMAN_SCHEMA, effort: 'high',
    system: `You are the chairman of a five-advisor council reviewing a draft Spenza blog post. Reconcile the reviews and the peer comments into ONE verdict.
${RUBRIC}
Rules: score the draft yourself against the rubric, using the advisors as evidence, not as an average. Confirm a P0 only if it is real and falls under the P0 definition; drop a P0 an advisor raised wrongly. "mustFix" lists concrete, ordered edits (most important first) that would take the post to 91 or more; empty if it already passes. verdict is "pass" only if score >= ${PASS_SCORE} and p0 is empty.
Also report: agree (points several advisors reached independently, the high-confidence signals), clash (genuine disagreements, with both sides), blindSpots (things only the peer review surfaced), firstFix (the single most valuable change, one sentence).`,
    user: `${context}\n\nAdvisor reviews:\n${JSON.stringify(advisors.map(a => ({ advisor: a.name, ...a.review })), null, 1)}\n\nPeer comments:\n${JSON.stringify(peers.map(p => p.review), null, 1)}`,
  });

  const passed = chairman.score >= PASS_SCORE && chairman.p0.length === 0 && chairman.verdict === 'pass';
  return { advisors, peers, chairman, passed };
}
