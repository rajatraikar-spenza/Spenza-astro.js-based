// Watch WordPress and update the site when content changes.
//
// This is the publish-to-live loop, driven by a poll instead of a webhook. The
// change-detection is the same either way: the index query returns every
// published post's slug and `modified`, and any difference from the last check
// means the site is stale.
//
// It exists so the loop can be demonstrated — and used day to day — without a
// public URL for WordPress to call. Once the site is hosted, the deploy hook
// replaces the polling and nothing else changes.
//
// Two ways to apply a change, picked automatically:
//
//   dev server running   POST /_wp-refresh, which re-runs the loader inside the
//                        live server (see lib/wp-refresh-integration.mjs). A few
//                        seconds, and the open browser tab shows it.
//   otherwise            `npm run build`, refreshing dist/ for `astro preview`.
//
// The distinction matters: a build writes dist/ and does nothing for a running
// dev server, and running both at once makes two processes fight over
// .astro/data-store.json — which on Windows surfaces as an EPERM rename.
//
// Usage:
//   npm run wp:watch                 # poll every 60s
//   INTERVAL=15 npm run wp:watch     # poll faster, for a live demo
//   npm run wp:watch -- --once       # check once and exit
//   npm run wp:watch -- --build      # always build, even if dev is running
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { wpPaginate } from './lib/wp-graphql.mjs';
import { PROJECT, WP_ORIGIN } from './lib/config.mjs';
import { REFRESH_PATH } from './lib/wp-refresh-integration.mjs';

const INTERVAL = Math.max(5, Number(process.env.INTERVAL) || 60) * 1000;
const ONCE = process.argv.includes('--once');
const FORCE_BUILD = process.argv.includes('--build');

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

/**
 * The running dev server's URL, or null.
 *
 * `astro dev` records its port in .astro/dev.json, but the file outlives a
 * crashed server, so the URL is probed before it is trusted.
 */
async function devServer() {
  if (FORCE_BUILD) return null;
  let url;
  try {
    const raw = await fs.readFile(path.join(PROJECT, '.astro', 'dev.json'), 'utf8');
    url = JSON.parse(raw).url;
  } catch {
    return null;
  }
  if (!url) return null;

  try {
    // HEAD is enough to prove someone is listening; the endpoint answers 405.
    await fetch(new URL(REFRESH_PATH, url), { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    return url;
  } catch {
    return null;
  }
}

/** Re-run the loader inside the live dev server. */
async function refreshDev(url) {
  const started = Date.now();
  const res = await fetch(new URL(REFRESH_PATH, url), {
    method: 'POST',
    // The loader refetches every changed post, so allow for a slow WordPress.
    signal: AbortSignal.timeout(180_000),
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (!res.ok) throw new Error(`${res.status} after ${secs}s`);
  log(`dev server updated in ${secs}s — reload the page to see it`);
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

{
  const dev = await devServer();
  log(dev
    ? `dev server at ${dev} — changes go straight into it, no build`
    : 'no dev server — changes trigger a full build into dist/');
}

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

    // Re-checked every time, not cached at startup: the dev server can be
    // started or stopped while this keeps running.
    const dev = await devServer();
    log(dev ? 'refreshing dev server…' : 'rebuilding…');

    // Adopt the new state first, so a failure does not make the same change
    // fire again on every tick.
    previous = current;

    if (!dev) {
      await runBuild();
    } else {
      try {
        await refreshDev(dev);
      } catch (e) {
        log(`REFRESH FAILED (${e.message}) — will retry on next change`);
      }
    }
  }
}
