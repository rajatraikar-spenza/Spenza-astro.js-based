// Tests for the lead endpoint (admin-api/lead): validation, routing of the client reply,
// the archive, the alert, the conversion event, and that nothing outside the allowlist gets in.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handler, deps, parseBody, validate, replyFor, alertEmail } from '../admin-api/lead/index.mjs';

const env = {
  ALERT_TO: 'sales@spenza.com,siva.sai@spenza.com,vinay@spenza.com', ALERT_FROM: 'Spenza Website <website@spenza.com>',
  REPLY_FROM: 'Spenza <sales@spenza.com>', ARCHIVE_BUCKET: 'archive', RATE_TABLE: 'rate',
  SEND_CLIENT_REPLY: '1', SEND_OAI: '1', OAI_CAPI_KEY: 'k', ALLOWED_ORIGINS: 'https://spenza.com',
};
const UUID = '123e4567-e89b-42d3-a456-426614174000';

function harness(over = {}) {
  const calls = { mail: [], put: [], oai: [] };
  deps.now = () => Date.UTC(2026, 10, 17, 9, 30);
  deps.sendEmail = async p => { if (over.mailFails) throw new Error('ses down'); calls.mail.push(p); };
  deps.putObject = async p => { if (over.putFails) throw new Error('s3 down'); calls.put.push(p); };
  deps.bump = async () => ({ Attributes: { hits: { N: String(over.hits ?? 1) } } });
  deps.fetch = async (url, init) => { calls.oai.push({ url, body: JSON.parse(init.body), auth: init.headers.authorization }); return { ok: true, text: async () => '' }; };
  return calls;
}
const post = (body, { origin = 'https://spenza.com', method = 'POST' } = {}) => ({
  body: new URLSearchParams(body).toString(), headers: { origin, 'user-agent': 'UA' }, requestContext: { http: { method, sourceIp: '203.0.113.9' } },
});

test('form 20: alert to all three recipients, reply chosen by the dropdown, archived', async () => {
  const c = harness();
  const res = await handler(post({ gform_submit: '20', input_1: 'Alex Doe', input_4: 'alex@acme.io', input_6: 'Acme', input_10: 'Managing IoT solutions',
    spenza_source_url: 'https://spenza.com/contact-us/', spenza_oai_event_id: UUID }), null, env);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'https://spenza.com');
  const alert = c.mail.find(m => m.FromEmailAddress.includes('website@'));
  assert.deepEqual(alert.Destination.ToAddresses, ['sales@spenza.com', 'siva.sai@spenza.com', 'vinay@spenza.com']);
  assert.equal(alert.ReplyToAddresses[0], 'alex@acme.io');
  assert.match(alert.Content.Simple.Subject.Data, /New submission from Contact Us — alex@acme.io/);
  assert.match(alert.Content.Simple.Body.Html.Data, /Solution of interest/);
  const reply = c.mail.find(m => m.Destination.ToAddresses[0] === 'alex@acme.io');
  assert.match(reply.Content.Simple.Body.Html.Data, /managing IoT connectivity/);
  assert.equal(reply.FromEmailAddress, 'Spenza <sales@spenza.com>');
  assert.equal(c.put.length, 1);
  assert.match(c.put[0].Key, /^leads\/2026\/11\/17\/form-20-/);
  assert.equal(JSON.parse(c.put[0].Body).fields.input_4.value, 'alex@acme.io');
});

test('every form-20 option maps to its own reply, unknown falls back to Others', () => {
  const opts = ['Launching an MVNO', 'Telecom expense management for enterprises', 'Managing IoT solutions', 'MVNE', 'Connectivity options for Voice/Data/SMS', 'Others'];
  const bodies = new Set(opts.map(o => replyFor('20', { input_10: o }).html));
  assert.equal(bodies.size, 6);
  assert.equal(replyFor('20', { input_10: 'nonsense' }).html, replyFor('20', { input_10: 'Others' }).html);
});

test('forms with no client reply (19, 5) only alert', async () => {
  const c = harness();
  const res = await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, env);
  assert.equal(res.statusCode, 200);
  assert.equal(c.mail.length, 1);
});

test('client reply is off while WordPress still sends it', async () => {
  const c = harness();
  await handler(post({ gform_submit: '15', input_2: 'a@b.co' }), null, { ...env, SEND_CLIENT_REPLY: '0' });
  assert.equal(c.mail.length, 1);
});

test('rejects: bad origin, unknown form, missing required, bad email, GET, rate limit', async () => {
  harness();
  assert.equal((await handler(post({ gform_submit: '19', input_3: 'a@b.co' }, { origin: 'https://evil.example' }), null, env)).statusCode, 403);
  assert.equal((await handler(post({ gform_submit: '99', input_1: 'x' }), null, env)).statusCode, 400);
  assert.equal((await handler(post({ gform_submit: '20', input_1: 'A', input_4: 'a@b.co' }), null, env)).statusCode, 422);
  const bad = await handler(post({ gform_submit: '19', input_3: 'not-an-email' }), null, env);
  assert.equal(bad.statusCode, 422);
  assert.equal((await handler(post({}, { method: 'GET' }), null, env)).statusCode, 405);
  harness({ hits: 9 });
  assert.equal((await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, env)).statusCode, 429);
});

test('only input_* and spenza_* keys survive parsing; values are capped', () => {
  const p = parseBody({ body: new URLSearchParams({ gform_submit: '19', input_3: 'a@b.co', 'input_1.3': 'x', evil: '1', is_submit_19: '1', spenza_page_title: 'T', input_9: 'x'.repeat(9000) }).toString() });
  assert.deepEqual(Object.keys(p.fields).sort(), ['input_1.3', 'input_3', 'input_9']);
  assert.equal(p.fields.input_9.length, 4000);
  assert.deepEqual(Object.keys(p.meta), ['spenza_page_title']);
});

test('HTML in a field is escaped in the alert', () => {
  const a = alertEmail('19', { input_3: '<img src=x onerror=alert(1)>@b.co' }, {}, 'k', 0);
  assert.ok(!a.html.includes('<img'));
});

test('conversion event: hashed email, shared event id, bearer key, deduped by id', async () => {
  const c = harness();
  await handler(post({ gform_submit: '19', input_3: 'Alex@Acme.io', spenza_oai_event_id: UUID, spenza_oai_oppref: 'abc123' }), null, env);
  const { url, body, auth } = c.oai[0];
  assert.match(url, /bzr\.openai\.com\/v1\/events\?pid=/);
  assert.equal(auth, 'Bearer k');
  assert.equal(body.events[0].id, UUID);
  assert.equal(body.events[0].type, 'lead_created');
  assert.equal(body.events[0].oppref, 'abc123');
  assert.match(body.events[0].user.emails_sha256[0], /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(body).includes('Alex@Acme.io') && !JSON.stringify(body).includes('alex@acme.io'));
});

test('no event id or no key: no conversion event', async () => {
  const c = harness();
  await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, env);
  await handler(post({ gform_submit: '19', input_3: 'a@b.co', spenza_oai_event_id: UUID }), null, { ...env, OAI_CAPI_KEY: '' });
  assert.equal(c.oai.length, 0);
});

test('a failed alert is survivable if the archive worked; both failing is a 502', async () => {
  harness({ mailFails: true });
  assert.equal((await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, env)).statusCode, 200);
  harness({ mailFails: true, putFails: true });
  assert.equal((await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, env)).statusCode, 502);
});

test('validate: form 5 accepts the dotted multi-input names', () => {
  const ok = validate('5', { 'input_1.3': 'A', 'input_8.6': 'B', input_2: 'a@b.co', input_3: 'C', input_4: 'D', input_6: '10' });
  assert.deepEqual(ok, {});
});

test('form 23 (Guest Postings): alert only to the two reviewers, thank-you sent even with SEND_CLIENT_REPLY off', async () => {
  const c = harness();
  const res = await handler(post({ gform_submit: '23', input_1: 'Sam Writer', input_2: 'sam@acme.io', input_3: 'Why eSIM changes IoT roaming',
    spenza_source_url: 'https://spenza.com/blog/guest-blogs/' }), null, { ...env, SEND_CLIENT_REPLY: '0' });
  assert.equal(res.statusCode, 200);
  const alert = c.mail.find(m => m.FromEmailAddress.includes('website@'));
  assert.deepEqual(alert.Destination.ToAddresses, ['siva.sai@spenza.com', 'om.satyam@spenza.com']);
  assert.match(alert.Content.Simple.Subject.Data, /New submission from Guest Postings — sam@acme.io/);
  assert.match(alert.Content.Simple.Body.Html.Data, /Topic they want to write about/);
  const reply = c.mail.find(m => m.Destination.ToAddresses[0] === 'sam@acme.io');
  assert.match(reply.Content.Simple.Subject.Data, /writing for Spenza/);
});

test('form 23 needs an email and a topic', () => {
  assert.deepEqual(validate('23', { input_2: 'a@b.co', input_3: 'x' }), {});
  assert.equal(validate('23', { input_2: 'a@b.co' }).error, 'validation_failed');
  assert.equal(validate('23', { input_3: 'topic' }).error, 'validation_failed');
  assert.equal(validate('23', { input_2: 'nope', input_3: 'topic' }).error, 'validation_failed');
});
