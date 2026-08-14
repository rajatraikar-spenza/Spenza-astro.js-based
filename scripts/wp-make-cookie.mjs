// Write .wp-cache/cookies.txt from two cookie values copied out of DevTools.
//
// The WordPress auth cookies are httpOnly, so `document.cookie` cannot see them
// and a browser extension is the usual way to export them. When that is not an
// option, copy the two values from DevTools and run this.
//
//   RUN THIS IN YOUR OWN TERMINAL, not through an assistant session — the
//   values are session credentials, equivalent to a password, and a command
//   line containing them would be recorded in the transcript.
//
//   WP_LOGGED_IN='...' WP_SEC='...' node scripts/wp-make-cookie.mjs
//
// Then verify with: npm run wp:check-session
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT, WP_ORIGIN, WP_HOST } from './lib/config.mjs';

const loggedIn = process.env.WP_LOGGED_IN?.trim();
const sec = process.env.WP_SEC?.trim();

/** WordPress suffixes its auth cookies with the MD5 of the site URL. */
const SUFFIX = process.env.WP_COOKIEHASH?.trim() || 'f21da62ec0c38d072be0935cfa934758';

if (!loggedIn) {
  process.stdout.write(
    `Set WP_LOGGED_IN (and ideally WP_SEC) first.\n\n` +
    `In Chrome, signed in to ${WP_ORIGIN}/wp-admin:\n` +
    `  DevTools -> Application -> Storage -> Cookies -> ${WP_ORIGIN}\n` +
    `  copy the Value of:\n` +
    `    wordpress_logged_in_${SUFFIX}   -> WP_LOGGED_IN\n` +
    `    wordpress_sec_${SUFFIX}         -> WP_SEC\n\n` +
    `Then, in your own terminal:\n` +
    `  WP_LOGGED_IN='...' WP_SEC='...' node scripts/wp-make-cookie.mjs\n`
  );
  process.exitCode = 1;
} else {
  // Netscape cookie jar: domain, includeSubdomains, path, secure, expiry, name, value.
  // Expiry 0 marks a session cookie, which is what WordPress issues.
  const row = (name, value) => [WP_HOST, 'FALSE', '/', 'TRUE', '0', name, value].join('\t');

  const lines = [
    '# Netscape HTTP Cookie File',
    `# Written by scripts/wp-make-cookie.mjs for ${WP_ORIGIN}`,
    row(`wordpress_logged_in_${SUFFIX}`, loggedIn),
  ];
  if (sec) lines.push(row(`wordpress_sec_${SUFFIX}`, sec));

  const dest = path.join(PROJECT, '.wp-cache', 'cookies.txt');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, lines.join('\n') + '\n', 'utf8');

  process.stdout.write(
    `wrote .wp-cache/cookies.txt with ${lines.length - 2} auth cookie(s)` +
    `${sec ? '' : ' (no WP_SEC — usually still fine, but include it if the check fails)'}\n` +
    `now run: npm run wp:check-session\n`
  );
}
