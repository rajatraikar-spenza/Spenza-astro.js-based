// GitHub OAuth proxy for the Decap CMS at spenza.com/admin.
//
// Decap's GitHub backend needs a server that swaps the OAuth `code` for a token
// (the client secret cannot live in a static site). This is that server, as an
// AWS Lambda behind a Function URL. Node 22, no dependencies.
//
//   GET /auth      send the browser to GitHub (with a CSRF state cookie)
//   GET /callback  exchange the code, CHECK THE PERSON CAN PUSH TO THE REPO,
//                  and only then hand the token to the admin origin
//
// What the access check buys: GitHub OAuth proves who someone is, not that they
// belong here. Anyone with a GitHub account can complete the OAuth dance, and a
// proxy that forwards whatever token it gets lets a stranger into the editor UI
// (their token would fail on every write, but the page would open). Here a
// stranger is turned away before a token exists in their browser.
//
// Environment:
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET  the GitHub OAuth App
//   GITHUB_REPO       owner/name that grants access, e.g. rajatraikar-spenza/Spenza-astro.js-based
//   ADMIN_ORIGIN      https://spenza.com   (where the token is delivered; nothing else is trusted)
//   STATE_SECRET      random string; signs the CSRF cookie
//   OAUTH_SCOPE       default "repo" (what Decap's GitHub backend requires)
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE = 'spenza_oauth_state';

const html = (status, body, headers = {}) => ({
  statusCode: status,
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', ...headers },
  body: `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Spenza admin</title>` +
    `<body style="font-family:system-ui,sans-serif;max-width:560px;margin:3rem auto;padding:0 1rem;color:#1b1c1a">${body}</body>`,
});

const redirect = (location, cookies = []) => ({
  statusCode: 302,
  headers: { location, 'cache-control': 'no-store' },
  cookies,
  body: '',
});

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

const cookieOf = (event, name) => {
  const raw = [...(event.cookies ?? []), event.headers?.cookie ?? ''].join(';');
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(raw);
  return m ? m[1] : '';
};

export function config(env) {
  const need = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_REPO', 'ADMIN_ORIGIN', 'STATE_SECRET'];
  const missing = need.filter(k => !env[k]);
  return { missing, scope: env.OAUTH_SCOPE || 'repo' };
}

export async function handler(event, env = process.env, fetchImpl = fetch) {
  const cfg = config(env);
  if (cfg.missing.length) {
    console.error('oauth proxy misconfigured, missing:', cfg.missing.join(','));
    return html(500, '<h1>Sign-in is not configured</h1><p>Ask the site team to finish the setup.</p>');
  }
  const path = event.rawPath ?? event.path ?? '/';
  const host = event.requestContext?.domainName ?? event.headers?.host;
  const callbackUrl = `https://${host}/callback`;
  const adminOrigin = env.ADMIN_ORIGIN.replace(/\/$/, '');

  if (path === '/auth') {
    const nonce = randomBytes(16).toString('hex');
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: cfg.scope,
      state: nonce,
      allow_signup: 'false',
    });
    return redirect(`https://github.com/login/oauth/authorize?${params}`, [
      `${COOKIE}=${nonce}.${sign(nonce, env.STATE_SECRET)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    ]);
  }

  if (path === '/callback') {
    const qs = event.queryStringParameters ?? {};
    if (qs.error) return html(400, `<h1>Sign-in cancelled</h1><p>${esc(qs.error_description || qs.error)}</p>`);

    // CSRF: the state in the URL must be the one this browser was given, and signed by us.
    const [nonce, mac] = cookieOf(event, COOKIE).split('.');
    if (!nonce || !mac || !safeEqual(mac, sign(nonce, env.STATE_SECRET)) || !safeEqual(nonce, qs.state ?? '')) {
      return html(400, '<h1>Sign-in expired</h1><p>Go back to <a href="' + esc(adminOrigin) + '/admin/">the admin</a> and try again.</p>');
    }
    if (!qs.code) return html(400, '<h1>Sign-in failed</h1><p>GitHub did not return a code.</p>');

    let token;
    try {
      const r = await fetchImpl('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: qs.code, redirect_uri: callbackUrl }),
      });
      const data = await r.json();
      token = data.access_token;
      if (!token) return html(400, `<h1>Sign-in failed</h1><p>${esc(data.error_description || data.error || 'No token returned')}</p>`);
    } catch (err) {
      console.error('token exchange failed', err);
      return html(502, '<h1>Could not reach GitHub</h1><p>Try again in a minute.</p>');
    }

    // Access check: must be able to push to the repo this admin edits.
    const gh = path => fetchImpl(`https://api.github.com${path}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'spenza-admin-oauth' },
    });
    let user; let repo;
    try {
      const [u, r] = await Promise.all([gh('/user'), gh(`/repos/${env.GITHUB_REPO}`)]);
      user = u.ok ? await u.json() : {};
      repo = r.ok ? await r.json() : null;
    } catch (err) {
      console.error('access check failed', err);
      return html(502, '<h1>Could not verify access</h1><p>Try again in a minute.</p>');
    }
    if (!repo?.permissions?.push) {
      console.warn(`denied: ${user.login ?? 'unknown'} has no push access to ${env.GITHUB_REPO}`);
      return html(403,
        `<h1>No access</h1><p>${esc(user.login ?? 'This GitHub account')} is not a collaborator on the Spenza site repository, so the content editor is closed to it.</p>` +
        '<p>Ask the site team to add you, then try again.</p>');
    }

    const frag = new URLSearchParams({ token, login: user.login ?? '', name: user.name ?? user.login ?? '' });
    return redirect(`${adminOrigin}/admin/auth-complete/#${frag}`, [`${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`]);
  }

  return html(404, '<h1>Not found</h1>');
}
