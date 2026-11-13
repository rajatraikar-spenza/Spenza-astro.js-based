// The Spenza "brain": what the company knows that the public web does not.
//
// Sources (both optional), merged into one block of context for the research and
// drafting steps:
//
//  1. A directory of markdown (SPENZA_BRAIN_DIR, default docs/spenza-brain). In CI it is a
//     checkout of a PRIVATE repository: this site's repository is public, so the notes
//     themselves must never be committed to it. Files are chunked by heading and ranked
//     by keyword overlap with the brief.
//  2. An HTTP endpoint (SPENZA_BRAIN_URL, SPENZA_BRAIN_TOKEN): POST {query, topK} answering
//     {results:[{title, text, url?, status?}]}.
//
// Claim status. The company knowledge library marks every claim as documented current
// behaviour, meeting-reported, agreed, proposed, an open question or historical, and says
// nothing counts as approved without a named owner. So:
//   - chunks that are proposed, historical, restricted, superseded or only meeting-reported
//     are never given to the writer;
//   - everything else is labelled with its status, and unlabelled material is treated as a
//     DRAFT: usable for terminology and positioning, not as proof of a product claim.
//
// Sensitive material is dropped, not redacted: this text goes to an external model and the
// post built from it is public. Anything that looks like contact details, a credential, or
// is marked confidential never leaves this file.
import fs from 'node:fs';
import path from 'node:path';

const MAX_CHARS = 7000;
/** Statuses that must never reach a public post as fact. */
export const EXCLUDED_STATUSES = new Set(['proposed', 'historical', 'restricted', 'superseded', 'meeting-reported', 'open-question']);

const SENSITIVE = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/,                                 // email address
  /(?:\+?\d[\s().-]{0,2}){10,}/,                               // phone-number-like run
  /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|eyJ[A-Za-z0-9_-]{20,})/, // keys and tokens
  /\b(?:confidential|restricted|internal only|do not share|under nda|password|api key|client secret|private key)\b/i,
];

export const isSensitive = text => SENSITIVE.some(re => re.test(text));

const tokens = s => new Set(String(s).toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);

/** `---\nstatus: draft\nas_of: 2026-10-23\n---` at the top of a file. */
export function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return { meta, body: m[2] };
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.mdx?$/.test(e.name) && e.name.toLowerCase() !== 'readme.md') yield p;
  }
}

export function fileChunks(dir) {
  const out = [];
  for (const file of walk(dir)) {
    const { meta, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'));
    const status = (meta.status || 'draft').toLowerCase();
    for (const p of body.split(/^(?=#{1,3} )/m)) {
      if (p.trim().length > 60) out.push({ source: path.relative(dir, file), status, asOf: meta.as_of, text: p.trim() });
    }
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

const label = c => `[${c.source}${c.url ? ` ${c.url}` : ''} | ${c.status === 'approved' || c.status === 'documented' ? c.status : `${c.status}, unverified`}${c.asOf ? ` | as of ${c.asOf}` : ''}]`;

export async function brainContext({ query, dir, env = process.env, fetchImpl = fetch, log = () => {} }) {
  const candidates = rank(fileChunks(dir), query, 12);

  if (env.SPENZA_BRAIN_URL) {
    try {
      const r = await fetchImpl(env.SPENZA_BRAIN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(env.SPENZA_BRAIN_TOKEN ? { authorization: `Bearer ${env.SPENZA_BRAIN_TOKEN}` } : {}) },
        body: JSON.stringify({ query, topK: 6 }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      for (const x of (await r.json()).results ?? []) {
        candidates.push({ source: x.title ?? 'brain', url: x.url, status: (x.status || 'draft').toLowerCase(), text: String(x.text ?? '') });
      }
    } catch (err) {
      log(`brain: endpoint unavailable (${err.message}); continuing without it`);
    }
  }

  let byStatus = 0;
  let sensitive = 0;
  const kept = candidates.filter(c => {
    if (EXCLUDED_STATUSES.has(c.status)) { byStatus += 1; return false; }
    if (isSensitive(c.text)) { sensitive += 1; return false; }
    return true;
  }).slice(0, 8);

  if (byStatus || sensitive) log(`brain: withheld ${byStatus} chunk(s) by claim status and ${sensitive} as sensitive`);
  if (!kept.length) {
    log('brain: no usable internal knowledge for this brief; using public research only');
    return '';
  }
  log(`brain: ${kept.length} excerpt(s) from ${new Set(kept.map(k => k.source)).size} source(s)`);
  return kept.map(c => `${label(c)}\n${c.text}`).join('\n\n---\n\n').slice(0, MAX_CHARS);
}
