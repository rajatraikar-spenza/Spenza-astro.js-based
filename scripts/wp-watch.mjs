// Watch WordPress and rebuild when content changes.
//
// This is the publish-to-live loop, driven by a poll instead of a webhook. The
// change-detection is the same either way: the index query returns every
// published post's slug and `modified`, and any difference from the last check
// means a rebuild is due.
//
// It exists so the loop can be demonstrated — and used day to day — without a
// public URL for WordPress to call. Once the site is hosted, the deploy hook
// replaces the polling and nothing else changes.
//
// Usage:
//   npm run wp:watch                 # poll every 60s, rebuild on change
//   INTERVAL=15 npm run wp:watch     # poll faster, for a live demo
//   npm run wp:watch -- --once       # check once and exit
import { spawn } from 'node:child_process';
import { wpPaginate } from './lib/wp-graphql.mjs';
import { PROJECT, WP_ORIGIN } from './lib/config.mjs';

const INTERVAL = Math.max(5, Number(process.env.INTERVAL) || 60) * 1000;
const ONCE = process.argv.includes('--once');

const stamp = () => new Date().toTimeString().slice(0, 8);
const log = msg => process.stdout.write(`[${stamp()}] ${msg}\n`);

/** slug -> modified, for every published post. Three requests, a couple of seconds. */
async function snapshot() {
  const nodes = await wpPaginate(
    cursor => `{posts(first:100${cursor ? `,after:"${cursor}"` : ''},` +
      `where:{status:PUBLISH}){pageInfo{hasNextPage endCursor} nodes{slug modified}}}`,
    d => d.posts,
    { pageSize: 100 }
  );
  return new Map(nodes.map(n => [n.slug, n.modified]));
}

/** What changed between two snapshots, in words worth printing. */
function diff(before, after) {
  const added = [...after.keys()].filter(s => !before.has(s));
  const removed = [...before.keys()].filter(s => !after.has(s));
  const edited = [...after.entries()]
    .filter(([s, m]) => before.has(s) && before.get(s) !== m)
    .map(([s]) => s);
  return { added, removed, edited, any: added.length + removed.length + edited.length > 0 };
}

function runBuild() {
  return new Promise(resolve => {
    const started = Date.now();
    // npm on Windows is a shim, so it needs a shell.
    const child = spawn('npm', ['run', 'build'], {
      cwd: PROJECT,
      shell: true,
      stdio: 'ignore',
    });
    child.on('exit', code => {
      const secs = ((Date.now() - started) / 1000).toFixed(0);
      if (code === 0) log(`build finished in ${secs}s — site is up to date`);
      // A failed build must not kill the watcher: the usual cause is a transient
      // fetch error, and the next poll should retry rather than leave it dead.
      else log(`BUILD FAILED (exit ${code}) after ${secs}s — will retry on next change`);
      resolve(code === 0);
    });
  });
}

log(`watching ${WP_ORIGIN} every ${INTERVAL / 1000}s — Ctrl+C to stop`);

let previous = await snapshot();
log(`baseline: ${previous.size} published posts`);

if (ONCE) {
  log('--once given, exiting without watching');
} else {
  for (;;) {
    await new Promise(r => setTimeout(r, INTERVAL));

    let current;
    try {
      current = await snapshot();
    } catch (e) {
      // Network blips should not stop the watch.
      log(`check failed (${e.message.slice(0, 80)}) — retrying next tick`);
      continue;
    }

    const d = diff(previous, current);
    if (!d.any) continue;

    const parts = [];
    if (d.added.length) parts.push(`${d.added.length} new (${d.added.join(', ')})`);
    if (d.edited.length) parts.push(`${d.edited.length} edited (${d.edited.slice(0, 3).join(', ')})`);
    if (d.removed.length) parts.push(`${d.removed.length} removed (${d.removed.join(', ')})`);
    log(`change detected: ${parts.join('; ')}`);
    log('rebuilding…');

    // Adopt the new state before building, so a build failure does not make the
    // same change fire again on every tick.
    previous = current;
    await runBuild();
  }
}
