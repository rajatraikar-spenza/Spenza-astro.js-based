// Tests for the lead endpoint (admin-api/lead): validation, routing of the client reply,
// the archive, the alert, the conversion event, and that nothing outside the allowlist gets in.
import test from 'node:test';
import assert from 'node:assert/strict';
import { handler, deps, parseBody, validate, replyFor, alertEmail } from '../admin-api/lead/index.mjs';
import { looksRandom, resetTorCache } from '../admin-api/lead/spam.mjs';

const TOR_IP = '185.220.101.20';
const TOR_LIST = [TOR_IP, ...Array.from({ length: 150 }, (_, i) => `198.51.100.${i}`)].join('\n');

const env = {
  ALERT_TO: 'sales@spenza.com,siva.sai@spenza.com,vinay@spenza.com', ALERT_FROM: 'Spenza Website <website@spenza.com>',
  REPLY_FROM: 'Spenza <sales@spenza.com>', ARCHIVE_BUCKET: 'archive', RATE_TABLE: 'rate',
  SEND_CLIENT_REPLY: '1', SEND_OAI: '1', OAI_CAPI_KEY: 'k', ALLOWED_ORIGINS: 'https://spenza.com',
};
const UUID = '123e4567-e89b-42d3-a456-426614174000';

function harness(over = {}) {
  const calls = { mail: [], put: [], oai: [], tor: 0 };
  resetTorCache();
  deps.now = () => Date.UTC(2026, 10, 17, 9, 30);
  deps.sendEmail = async p => { if (over.mailFails) throw new Error('ses down'); calls.mail.push(p); };
  deps.putObject = async p => { if (over.putFails) throw new Error('s3 down'); calls.put.push(p); };
  deps.bump = async () => ({ Attributes: { hits: { N: String(over.hits ?? 1) } } });
  deps.fetch = async (url, init) => {
    if (url.includes('torproject.org')) {
      calls.tor++;
      if (over.torFails) throw new Error('timeout');
      return { ok: true, status: 200, text: async () => over.torList ?? TOR_LIST };
    }
    calls.oai.push({ url, body: JSON.parse(init.body), auth: init.headers.authorization }); return { ok: true, text: async () => '' };
  };
  return calls;
}
const post = (body, { origin = 'https://spenza.com', method = 'POST', ip = '203.0.113.9' } = {}) => ({
  body: new URLSearchParams(body).toString(), headers: { origin, 'user-agent': 'UA' }, requestContext: { http: { method, sourceIp: ip } },
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

// ---- spam quarantine: a suspected lead is held back from replies and ads, never dropped ----

const popup = { gform_submit: '15', input_2: 'a@b.co', input_5: '9280985505', spenza_oai_event_id: UUID };
const agentForm = { gform_submit: '22', input_1: 'eTeOqVRPHSXWgEMrtR', input_2: 'a@b.co', input_3: 'nEPnjZEASAnjHrvdeETVN', input_6: 'CVPnFpMbZEuDwaOO', spenza_oai_event_id: UUID };

/** What must hold for every quarantined lead: accepted, archived, alerted, but silent to outsiders. */
async function assertQuarantined(c, res, reasons) {
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).ok, true);
  assert.ok(!res.body.includes('spam'), 'the sender must not learn it was flagged');
  assert.equal(c.put.length, 1);
  assert.deepEqual(JSON.parse(c.put[0].Body).spam, { quarantined: true, reasons });
  assert.equal(c.mail.length, 1, 'the alert only, no client reply');
  assert.match(c.mail[0].Content.Simple.Subject.Data, /^\[Suspected spam\] New submission from /);
  assert.match(c.mail[0].Content.Simple.Body.Text.Data, /^Suspected spam: /);
  assert.equal(c.oai.length, 0);
}

test('Tor lead: archived and alerted to the usual recipients, no reply, no conversion', async () => {
  const c = harness();
  const res = await handler(post(popup, { ip: TOR_IP }), null, env);
  await assertQuarantined(c, res, ['tor']);
  assert.deepEqual(c.mail[0].Destination.ToAddresses, env.ALERT_TO.split(','));
});

test('random text from an ordinary IP is quarantined too', async () => {
  const c = harness();
  await assertQuarantined(c, await handler(post(agentForm), null, env), ['random_text']);
});

test('an ordinary lead is untouched: untagged alert, reply and conversion both sent', async () => {
  const c = harness();
  await handler(post(popup), null, env);
  assert.equal(c.mail.length, 2);
  assert.ok(c.mail.every(m => !/spam/i.test(m.Content.Simple.Subject.Data + m.Content.Simple.Body.Html.Data)));
  assert.equal(c.oai.length, 1);
  assert.deepEqual(JSON.parse(c.put[0].Body).spam, { quarantined: false, reasons: [] });
});

test('Tor list down, or not a real list: the lead goes through as normal', async () => {
  for (const over of [{ torFails: true }, { torList: TOR_IP }, { torList: '<html>Just a moment...</html>' }]) {
    const c = harness(over);
    assert.equal((await handler(post(popup, { ip: TOR_IP }), null, env)).statusCode, 200);
    assert.equal(c.mail.length, 2);
    assert.equal(c.oai.length, 1);
  }
});

test('the Tor list is fetched once and reused; a failed refresh keeps the last good copy', async () => {
  const c = harness();
  await handler(post(popup, { ip: TOR_IP }), null, env);
  await handler(post(popup, { ip: TOR_IP }), null, env);
  assert.equal(c.tor, 1);
  const later = deps.now() + 2 * 60 * 60 * 1000;
  deps.now = () => later;
  deps.fetch = async () => { throw new Error('down'); };
  await handler(post(popup, { ip: TOR_IP }), null, env);
  assert.match(c.mail.at(-1).Content.Simple.Subject.Data, /Suspected spam/);
});

test('SPAM_ALERT_TO reroutes only suspected alerts; SPAM_FILTER=0 turns the quarantine off', async () => {
  let c = harness();
  const routed = { ...env, SPAM_ALERT_TO: 'review@spenza.com' };
  await handler(post(popup, { ip: TOR_IP }), null, routed);
  await handler(post({ gform_submit: '19', input_3: 'a@b.co' }), null, routed);
  assert.deepEqual(c.mail[0].Destination.ToAddresses, ['review@spenza.com']);
  assert.deepEqual(c.mail[1].Destination.ToAddresses, env.ALERT_TO.split(','));
  c = harness();
  await handler(post(popup, { ip: TOR_IP }), null, { ...env, SPAM_FILTER: '0' });
  assert.equal(c.mail.length, 2);
  assert.equal(c.tor, 0);
});

test('a quarantined lead that could be neither alerted nor archived still reports the failure', async () => {
  harness({ mailFails: true, putFails: true });
  assert.equal((await handler(post(popup, { ip: TOR_IP }), null, env)).statusCode, 502);
});

test('Guest Postings from Tor: no automatic thank-you', async () => {
  const c = harness();
  await handler(post({ gform_submit: '23', input_2: 'a@b.co', input_3: 'A topic' }, { ip: TOR_IP }), null, env);
  assert.equal(c.mail.length, 1);
});

test('random-text rule spares real names and companies, and one odd answer is never enough', async () => {
  for (const v of ['Jordan Rivers', 'Christopherson', 'CHRISTOPHERSON', 'examplestudio', 'TelecomExpenseManagement', 'AB Digital Marketing Team', 'McDonald', ''])
    assert.equal(looksRandom(v), false, v);
  const c = harness();
  await handler(post({ gform_submit: '20', input_1: 'McDonaldVanDerBerg', input_4: 'a@b.co', input_6: 'Acme', input_10: 'Others' }), null, env);
  assert.equal(c.mail.length, 2);
});

// ---- honeypot and fill time: catches a script that posts straight to the endpoint ----

test('parseBody reads the hidden trap field and nothing else from it', () => {
  assert.equal(parseBody({ body: new URLSearchParams({ gform_submit: '15', input_2: 'a@b.co', ak_hp_textarea: 'buy now' }).toString() }).trap.hp, 'buy now');
  assert.equal(parseBody({ body: new URLSearchParams({ gform_submit: '15', input_2: 'a@b.co' }).toString() }).trap.hp, '');
});

test('a filled honeypot is quarantined, even from an ordinary IP and with a human-looking timer', async () => {
  const c = harness();
  await assertQuarantined(c, await handler(post({ ...popup, ak_hp_textarea: 'http://spam.example', spenza_elapsed_ms: '9000' }), null, env), ['honeypot']);
});

test('a form submitted under three seconds after load is quarantined', async () => {
  const c = harness();
  await assertQuarantined(c, await handler(post({ ...popup, spenza_elapsed_ms: '1200' }), null, env), ['too_fast']);
});

test('signals add up: Tor, honeypot and speed are all reported', async () => {
  const c = harness();
  await assertQuarantined(c, await handler(post({ ...popup, ak_hp_textarea: 'x', spenza_elapsed_ms: '50' }, { ip: TOR_IP }), null, env), ['honeypot', 'too_fast', 'tor']);
});

test('a person who took a normal time is untouched, and an empty honeypot means nothing', async () => {
  const c = harness();
  await handler(post({ ...popup, ak_hp_textarea: '', spenza_elapsed_ms: '8000' }), null, env);
  assert.equal(c.mail.length, 2);
  assert.equal(c.oai.length, 1);
  assert.deepEqual(JSON.parse(c.put[0].Body).spam, { quarantined: false, reasons: [] });
});

test('no timer is fine by default (an old cached page), and quarantined once SPAM_REQUIRE_TIMER=1', async () => {
  let c = harness();
  await handler(post(popup), null, env);
  assert.equal(c.mail.length, 2);
  c = harness();
  await assertQuarantined(c, await handler(post(popup), null, { ...env, SPAM_REQUIRE_TIMER: '1' }), ['no_timer']);
  c = harness();
  await handler(post({ ...popup, spenza_elapsed_ms: '6000' }), null, { ...env, SPAM_REQUIRE_TIMER: '1' });
  assert.equal(c.mail.length, 2);
});

test('a garbled timer counts as no timer, never as a fast one', async () => {
  for (const bad of ['abc', '-5', '', '1e3', '12.5']) {
    const c = harness();
    await handler(post({ ...popup, spenza_elapsed_ms: bad }), null, env);
    assert.equal(c.mail.length, 2, bad);
  }
});

test('SPAM_FILTER=0 switches the honeypot and timer off with the rest', async () => {
  const c = harness();
  await handler(post({ ...popup, ak_hp_textarea: 'x', spenza_elapsed_ms: '10' }), null, { ...env, SPAM_FILTER: '0' });
  assert.equal(c.mail.length, 2);
});
