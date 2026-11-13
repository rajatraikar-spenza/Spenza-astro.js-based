// Tests for the admin OAuth proxy: CSRF state, the repository access check, and
// that a token is never released to someone without push access.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../admin-api/oauth/index.mjs';

const env = {
  GITHUB_CLIENT_ID: 'cid', GITHUB_CLIENT_SECRET: 'sec', GITHUB_REPO: 'org/site',
  ADMIN_ORIGIN: 'https://spenza.com', STATE_SECRET: 'state-secret',
};
const ev = (path, extra = {}) => ({ rawPath: path, requestContext: { domainName: 'proxy.example.com' }, headers: {}, ...extra });

const json = (body, ok = true) => ({ ok, json: async () => body });
const ghFetch = ({ push, tokenBody = { access_token: 'gho_secret' } }) => async url => {
  if (url.includes('login/oauth/access_token')) return json(tokenBody);
  if (url.endsWith('/user')) return json({ login: 'alice', name: 'Alice' });
  if (url.includes('/repos/org/site')) return json({ permissions: { push } });
  throw new Error('unexpected ' + url);
};

async function startLogin() {
  const res = await handler(ev('/auth'), env, async () => { throw new Error('no network'); });
  const state = new URL(res.headers.location).searchParams.get('state');
  return { res, state, cookie: res.cookies[0].split(';')[0] };
}

test('/auth redirects to GitHub with scope, redirect_uri, state and a signed httpOnly cookie', async () => {
  const { res, state } = await startLogin();
  const u = new URL(res.headers.location);
  assert.equal(res.statusCode, 302);
  assert.equal(u.origin + u.pathname, 'https://github.com/login/oauth/authorize');
  assert.equal(u.searchParams.get('client_id'), 'cid');
  assert.equal(u.searchParams.get('redirect_uri'), 'https://proxy.example.com/callback');
  assert.equal(u.searchParams.get('scope'), 'repo');
  assert.ok(state.length >= 32);
  assert.match(res.cookies[0], /HttpOnly; Secure; SameSite=Lax/);
});

test('/callback with push access redirects to the admin origin with the session in the fragment', async () => {
  const { state, cookie } = await startLogin();
  const res = await handler(ev('/callback', { queryStringParameters: { code: 'c', state }, cookies: [cookie] }), env, ghFetch({ push: true }));
  assert.equal(res.statusCode, 302);
  const loc = new URL(res.headers.location);
  assert.equal(loc.origin, 'https://spenza.com');
  assert.equal(loc.pathname, '/admin/auth-complete/');
  assert.equal(new URLSearchParams(loc.hash.slice(1)).get('token'), 'gho_secret');
  assert.match(res.cookies[0], /Max-Age=0/);
});

test('/callback WITHOUT push access shows a denial and never releases the token', async () => {
  const { state, cookie } = await startLogin();
  const res = await handler(ev('/callback', { queryStringParameters: { code: 'c', state }, cookies: [cookie] }), env, ghFetch({ push: false }));
  assert.equal(res.statusCode, 403);
  assert.ok(!JSON.stringify(res).includes('gho_secret'));
  assert.match(res.body, /No access/);
  assert.match(res.body, /alice/);
});

test('/callback rejects a mismatched, missing or forged state (CSRF)', async () => {
  const { state, cookie } = await startLogin();
  const never = async () => { throw new Error('must not reach GitHub'); };
  const cases = [
    { queryStringParameters: { code: 'c', state: 'other' }, cookies: [cookie] },
    { queryStringParameters: { code: 'c', state }, cookies: [] },
    { queryStringParameters: { code: 'c', state }, cookies: [`spenza_oauth_state=${state}.deadbeef`] },
  ];
  for (const extra of cases) {
    const res = await handler(ev('/callback', extra), env, never);
    assert.equal(res.statusCode, 400);
  }
});

test('/callback surfaces a GitHub token-exchange failure without a token', async () => {
  const { state, cookie } = await startLogin();
  const res = await handler(ev('/callback', { queryStringParameters: { code: 'bad', state }, cookies: [cookie] }), env,
    ghFetch({ push: true, tokenBody: { error: 'bad_verification_code', error_description: 'The code passed is incorrect' } }));
  assert.equal(res.statusCode, 400);
  assert.match(res.body, /incorrect/);
});

test('missing configuration fails closed', async () => {
  const res = await handler(ev('/auth'), { ...env, STATE_SECRET: '' });
  assert.equal(res.statusCode, 500);
});

test('unknown paths are 404', async () => {
  assert.equal((await handler(ev('/nope'), env)).statusCode, 404);
});

test('on AWS the second argument is the Lambda context, and settings come from the environment', async () => {
  Object.assign(process.env, env);
  try {
    const res = await handler(ev('/auth'), { awsRequestId: 'abc', functionName: 'f' });
    assert.equal(res.statusCode, 302);
    assert.match(res.headers.location, /^https:\/\/github\.com\/login\/oauth\/authorize\?/);
  } finally {
    for (const k of Object.keys(env)) delete process.env[k];
  }
});
