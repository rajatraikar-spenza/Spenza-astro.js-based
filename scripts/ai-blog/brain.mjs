// The Spenza "brain": what the company knows that the public web does not.
//
// Two sources, both optional, merged into one block of context for the research
// and drafting steps:
//
//  1. Files: markdown under docs/spenza-brain/ (committed notes, product sheets,
//     messaging, ICP). Chunked by heading and ranked by keyword overlap with the brief.
//  2. An HTTP endpoint (SPENZA_BRAIN_URL, SPENZA_BRAIN_TOKEN): POST {query, topK}
//     answering {results:[{title, text, url?}]}. This is the contract the pipeline
//     expects; point it at whatever fronts the knowledge base.
//
// With neither configured the pipeline runs on public research alone and says so.
import fs from 'node:fs';
import path from 'node:path';

const MAX_CHARS = 7000;

const tokens = s => new Set(String(s).toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.mdx?$/.test(e.name)) yield p;
  }
}

export function fileChunks(dir) {
  const out = [];
  for (const file of walk(dir)) {
    const parts = fs.readFileSync(file, 'utf8').split(/^(?=#{1,3} )/m);
    for (const p of parts) if (p.trim().length > 60) out.push({ source: path.relative(dir, file), text: p.trim() });
  }
  return out;
}

export function rank(chunks, query, topK = 6) {
  const q = tokens(query);
  return chunks
    .map(c => ({ c, score: [...tokens(c.text)].filter(t => q.has(t)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => x.c);
}

export async function brainContext({ query, dir, env = process.env, fetchImpl = fetch, log = () => {} }) {
  const sections = [];
  const hits = rank(fileChunks(dir), query);
  if (hits.length) sections.push(...hits.map(h => `[${h.source}]\n${h.text}`));

  if (env.SPENZA_BRAIN_URL) {
    try {
      const r = await fetchImpl(env.SPENZA_BRAIN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(env.SPENZA_BRAIN_TOKEN ? { authorization: `Bearer ${env.SPENZA_BRAIN_TOKEN}` } : {}) },
        body: JSON.stringify({ query, topK: 6 }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      for (const x of data.results ?? []) sections.push(`[${x.title ?? 'brain'}${x.url ? ` ${x.url}` : ''}]\n${x.text}`);
    } catch (err) {
      log(`brain: endpoint unavailable (${err.message}); continuing without it`);
    }
  }
  if (!sections.length) {
    log('brain: no internal knowledge found for this brief; using public research only');
    return '';
  }
  return sections.join('\n\n---\n\n').slice(0, MAX_CHARS);
}
