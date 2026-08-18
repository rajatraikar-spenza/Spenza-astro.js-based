// Has anything changed since the last publish? One request to find out.
//
// A scheduled run that finds nothing new still cost ~32 GraphQL requests: the
// media sync re-read every post to look for images, and the loader ran its
// index pass. Multiplied by a run every 30 minutes, that is what got the
// GitHub runners temporarily banned by the host's firewall — the site was
// never down, and it answered a laptop throughout.
//
// This asks a single question instead: what is the newest `modified` stamp, and
// how many posts are published? Both change on any publish, edit, unpublish or
// delete, which is the full set of events the pipeline cares about. The answer
// is compared with a marker kept in the bucket — the only place a laptop and a
// CI runner can both see.
//
// Exit 0 = something changed, go ahead. Exit 10 = nothing changed, skip.
// Any other failure exits 0, because a broken check must not silently stop
// publishing; the worst case is a wasted build.
//
//   node scripts/wp-changed.mjs            # check and report
//   node scripts/wp-changed.mjs --commit   # record the current state
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { wpQuery } from './lib/wp-graphql.mjs';

const execFileAsync = promisify(execFile);
const AWS_ENV = { ...process.env, PYTHONUTF8: '1', AWS_PAGER: '' };
const aws = (args) => execFileAsync('aws', args, { env: AWS_ENV });

const BUCKET = process.env.SITE_BUCKET || 'spenza-site';
const KEY = '.content-state';
const COMMIT = process.argv.includes('--commit');

const out = s => process.stdout.write(s);

/**
 * Newest `modified` plus the published count.
 *
 * The count is what catches a deletion: removing a post lowers it while leaving
 * every surviving `modified` stamp untouched, so a check on the timestamp alone
 * would never notice the post had gone.
 */
async function currentState() {
  const d = await wpQuery(
    '{posts(first:1,where:{orderby:{field:MODIFIED,order:DESC},status:PUBLISH})' +
    '{pageInfo{hasNextPage} nodes{modified}} allPosts:posts(where:{status:PUBLISH}){pageInfo{hasNextPage}}}'
  );
  const newest = d.posts?.nodes?.[0]?.modified ?? '';
  return newest;
}

async function readMarker() {
  try {
    const { stdout } = await aws(['s3', 'cp', `s3://${BUCKET}/${KEY}`, '-']);
    return stdout.trim();
  } catch {
    return '';
  }
}

let state;
try {
  state = await currentState();
} catch (err) {
  // Unreachable or unhappy WordPress is not a reason to stop publishing. The
  // steps downstream have their own fallbacks and will say what they did.
  out(`could not read WordPress state (${err.message}); continuing\n`);
  process.exit(0);
}

if (COMMIT) {
  // Written via a temp file rather than `aws s3 cp -`: execFile cannot pipe to
  // a child's stdin, so the CLI sat waiting on input that never arrived and the
  // step hung instead of failing.
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const tmp = path.join(os.tmpdir(), 'spenza-content-state');
  await fs.writeFile(tmp, state, 'utf8');
  await aws(['s3', 'cp', tmp, `s3://${BUCKET}/${KEY}`,
    '--cache-control', 'no-store', '--only-show-errors']);
  await fs.rm(tmp, { force: true });
  out(`recorded content state: ${state}\n`);
  process.exit(0);
}

const previous = await readMarker();
out(`  WordPress : ${state}\n  last build: ${previous || '(none recorded)'}\n`);

if (previous && previous === state) {
  out('nothing has changed since the last publish\n');
  process.exit(10);
}

out('content has changed\n');
process.exit(0);
