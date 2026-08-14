// Is the WordPress session in .wp-cache/cookies.txt still good?
//
// The mirroring scripts authenticate with a browser session, and WordPress
// expires it after 48 hours unless the login used "Remember Me" (then 14 days).
// A stale cookie does not fail loudly — the scripts fetch login pages and mirror
// those — so check before any wp:* run.
//
// Two checks, because either alone misleads:
//
//   offline  The auth cookie embeds its own expiry (`user|expiry|token|hmac`),
//            so staleness is provable without a request.
//   online   A request the mirror actually makes. Deliberately NOT
//            /wp/v2/users/me: WordPress requires an X-WP-Nonce for cookie auth
//            on that endpoint and answers 401 even for a perfectly valid
//            session, which reads as "expired" when nothing is wrong.
//
// Prints cookie names, ages and status only — session values are credentials.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PROJECT, WP_ORIGIN } from './lib/config.mjs';

const JAR = path.join(PROJECT, '.wp-cache', 'cookies.txt');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const fail = msg => { process.stdout.write(msg); process.exitCode = 1; };

const HOWTO =
  `\nRefresh it:\n` +
  `  1. Sign in to ${WP_ORIGIN}/wp-admin, ticking "Remember Me" (48h -> 14 days).\n` +
  `  2. Export that domain's cookies to .wp-cache/cookies.txt, or copy the two\n` +
  `     wordpress_* values from DevTools and run: npm run wp:make-cookie\n` +
  `  3. Re-run: npm run wp:check-session\n\n` +
  `Only the mirroring scripts need this — the headless blog loader is anonymous.\n`;

if (!existsSync(JAR)) {
  fail(`no cookie jar at .wp-cache/cookies.txt\n${HOWTO}`);
} else {
  const raw = await fs.readFile(JAR, 'utf8');
  const rows = raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('\t'))
    .filter(f => f.length >= 7);

  const seen = new Set();
  const pairs = rows.map(f => [f[5].trim(), f[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k));
  const header = pairs.map(([k, v]) => `${k}=${v}`).join('; ');

  const login = pairs.find(([k]) => k.startsWith('wordpress_logged_in_'));
  process.stdout.write(`jar: ${pairs.length} cookies\n`);

  if (!login) {
    fail(`no wordpress_logged_in_* cookie — the export missed the session.\n${HOWTO}`);
  } else {
    // ---- offline: the cookie states its own expiry ------------------------
    // Value is `username|expiry|token|hmac`, URL-encoded.
    const parts = decodeURIComponent(login[1]).split('|');
    const expiry = Number(parts[1]);
    const user = parts[0];
    let expired = false;

    if (Number.isFinite(expiry) && expiry > 0) {
      const hoursLeft = (expiry * 1000 - Date.now()) / 36e5;
      expired = hoursLeft <= 0;
      process.stdout.write(
        `user: ${user}\n` +
        `expiry: ${new Date(expiry * 1000).toISOString()} ` +
        `(${expired ? `EXPIRED ${Math.abs(hoursLeft).toFixed(0)}h ago` : `${hoursLeft.toFixed(0)}h left`})\n`
      );
      if (!expired && hoursLeft < 60) {
        process.stdout.write(
          `note: under ~48h of life means the login did not use "Remember Me".\n`
        );
      }
    }

    // ---- online: an endpoint the mirror genuinely uses --------------------
    const res = await fetch(`${WP_ORIGIN}/wp-json/wp/v2/posts?per_page=1&_fields=id`, {
      headers: { Cookie: header, 'User-Agent': UA },
    });

    if (res.ok) {
      process.stdout.write(`\nSESSION VALID — REST post list reachable as "${user}"\n`);
    } else if (expired) {
      fail(`\nSESSION EXPIRED — REST returned HTTP ${res.status}\n${HOWTO}`);
    } else {
      fail(
        `\nSESSION NOT ACCEPTED — REST returned HTTP ${res.status} though the cookie\n` +
        `has not expired. Possibly a WAF rule or a plugin restricting REST.\n${HOWTO}`
      );
    }
  }
}
