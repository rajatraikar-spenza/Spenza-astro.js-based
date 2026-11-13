#!/usr/bin/env node
// Fail if internal "brain" notes were committed to this repository.
//
// The site's repository is public, and the AI pipeline's knowledge base is the company's
// internal library. The notes live in a private repository (or behind a private endpoint)
// and are loaded at run time; nothing but docs/spenza-brain/README.md and its .gitignore
// may be tracked here. Run in CI on every pull request (cms-validate.yml).
import { execFileSync } from 'node:child_process';

const ALLOWED = new Set(['docs/spenza-brain/README.md', 'docs/spenza-brain/.gitignore']);

export function offenders(tracked) {
  return tracked.filter(f => (f.startsWith('docs/spenza-brain/') || f.startsWith('docs/spenza-brain-private/') || f.startsWith('.brain-private/')) && !ALLOWED.has(f));
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const bad = offenders(tracked);
  for (const f of bad) console.log(`::error file=${f}::Internal knowledge must not be committed: this repository is public.`);
  console.log(bad.length ? `\n${bad.length} internal file(s) tracked. Remove them (git rm --cached) and keep the notes in the private brain repository.` : 'ok: no internal knowledge tracked.');
  process.exit(bad.length ? 1 : 0);
}
