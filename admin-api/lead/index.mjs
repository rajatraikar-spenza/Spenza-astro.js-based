// Lead endpoint for spenza.com: replaces the WordPress/Gravity Forms replay.
//
// The static site sends each lead to HubSpot from the browser (public/scripts/hubspot-forms.js).
// It then posts the same form body here, and this function does what Gravity Forms used to:
//
//   1. validates it against the form's own rules (allowlisted form id, required fields, email shape)
//   2. archives it as JSON in a private S3 bucket (the entry archive)
//   3. emails the sales alert, and the client reply where the form has one (Amazon SES, DKIM-signed)
//   4. sends the lead_created event to OpenAI's Conversions API
//
// Suspected spam (see spam.mjs) is quarantined, never dropped: steps 1-2 as normal, a tagged
// alert in step 3, and no client reply or conversion event.
//
// An AWS Lambda behind a Function URL; Node 22; the AWS SDK v3 ships in the runtime, nothing to bundle.
//
// Environment:
//   ALERT_TO            comma list, the internal alert recipients
//   ALERT_FROM          "Spenza Website <website@spenza.com>"  (a domain SES has DKIM for)
//   REPLY_FROM          "Spenza <sales@spenza.com>"            (client replies)
//   ARCHIVE_BUCKET      private bucket for the entry archive
//   RATE_TABLE          DynamoDB table (pk string, ttl number) for the per-IP throttle
//   SEND_CLIENT_REPLY   "1" to email the visitor (leave off while WordPress still does)
//   SEND_OAI            "1" to send the conversion event (needs OAI_CAPI_KEY)
//   OAI_CAPI_KEY, OAI_PIXEL_ID, OAI_VALIDATE_ONLY
//   ALLOWED_ORIGINS     comma list, default the spenza.com origins
//   SPAM_ALERT_TO       comma list for suspected-spam alerts; unset sends them to the usual recipients
//   SPAM_FILTER         "0" turns the quarantine off
//   SPAM_REQUIRE_TIMER  "1" also quarantines a lead that arrives without the page's fill-time stamp
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { FORMS, labelFor } from './forms.mjs';
import { spamReasons } from './spam.mjs';

const REPLIES = JSON.parse(readFileSync(new URL('./replies.json', import.meta.url), 'utf8'));

// The SDK clients are loaded on first use, from the Lambda runtime's own copy of the AWS SDK v3.
// Tests replace `deps` wholesale, so nothing here needs the SDK installed locally.
let clients;
async function sdk() {
  if (clients) return clients;
  const [ses, s3, ddb] = await Promise.all([import('@aws-sdk/client-sesv2'), import('@aws-sdk/client-s3'), import('@aws-sdk/client-dynamodb')]);
  clients = { ses, s3, ddb, sesC: new ses.SESv2Client({}), s3C: new s3.S3Client({}), ddbC: new ddb.DynamoDBClient({}) };
  return clients;
}

export const deps = {
  async sendEmail(params) { const c = await sdk(); return c.sesC.send(new c.ses.SendEmailCommand(params)); },
  async putObject(params) { const c = await sdk(); return c.s3C.send(new c.s3.PutObjectCommand(params)); },
  async bump(params) { const c = await sdk(); return c.ddbC.send(new c.ddb.UpdateItemCommand(params)); },
  fetch: (...a) => fetch(...a),
  now: () => Date.now(),
};

const RATE_PER_MINUTE = 8;
const MAX_KEYS = 60;
const MAX_VALUE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_KEY = /^input_\d+([._]\d+)?$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const OBREF_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HUBSPOT_PORTAL = '25414858';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const list = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

const origins = env => list(env.ALLOWED_ORIGINS || 'https://spenza.com,https://www.spenza.com,https://preview.spenza.com');

function respond(status, body, origin, env) {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store', vary: 'Origin' };
  if (origin && origins(env).includes(origin)) headers['access-control-allow-origin'] = origin;
  return { statusCode: status, headers, body: JSON.stringify(body) };
}

/** Parse the urlencoded body into the first value of each key; non-input keys are dropped except the spenza_* ones. */
export function parseBody(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
  const params = new URLSearchParams(raw);
  const out = { fields: {}, meta: {}, form: null, trap: { hp: '' } };
  let keys = 0;
  for (const [k, v] of params) {
    if (++keys > 400) break;
    if (k === 'gform_submit') out.form = String(v).trim();
    else if (k === 'ak_hp_textarea') out.trap.hp = String(v).slice(0, 200);
    else if (FIELD_KEY.test(k)) {
      if (!(k in out.fields)) out.fields[k] = String(v).slice(0, MAX_VALUE);
    } else if (/^spenza_[a-z_]+$/.test(k)) out.meta[k] = String(v).slice(0, 1024);
  }
  return out;
}

export function validate(formId, fields) {
  const spec = FORMS[formId];
  if (!spec) return { error: 'unknown_form' };
  if (Object.keys(fields).length === 0 || Object.keys(fields).length > MAX_KEYS) return { error: 'no_fields' };
  const problems = [];
  for (const k of spec.required) if (!String(fields[k] ?? '').trim()) problems.push(`${k} is required`);
  for (const k of spec.email) {
    const v = String(fields[k] ?? '').trim();
    if (v && !EMAIL_RE.test(v)) problems.push(`${k} is not an email address`);
  }
  return problems.length ? { error: 'validation_failed', validation: problems } : {};
}

async function throttled(ip, env) {
  if (!env.RATE_TABLE || !ip) return false;
  const minute = Math.floor(deps.now() / 60000);
  try {
    const r = await deps.bump({
      TableName: env.RATE_TABLE,
      Key: { pk: { S: `${ip}#${minute}` } },
      UpdateExpression: 'ADD hits :one SET expires = :ttl',
      ExpressionAttributeValues: { ':one': { N: '1' }, ':ttl': { N: String(minute * 60 + 600) } },
      ReturnValues: 'UPDATED_NEW',
    });
    return Number(r.Attributes?.hits?.N ?? 0) > RATE_PER_MINUTE;
  } catch (err) {
    console.error('[lead] rate table unavailable, letting the request through:', err.name);
    return false; // fail open: losing a lead is worse than one extra attempt
  }
}

/** The lead's email, from whichever field the form marks as the address. */
const emailOf = (formId, fields) => {
  const k = FORMS[formId].email[0];
  return String(fields[k] ?? '').trim();
};

function sourceUrl(meta) {
  try {
    const u = new URL(meta.spenza_source_url || '');
    if (u.hostname === 'spenza.com' || u.hostname.endsWith('.spenza.com')) return u.toString();
  } catch { /* fall through */ }
  return 'https://spenza.com/';
}

const SPAM_REASONS = {
  tor: 'sent through Tor', random_text: 'random text in the answers',
  honeypot: 'a hidden field no visitor can see was filled in', too_fast: 'submitted faster than a person could read the form',
  no_timer: 'sent without the page timer a real visit carries',
};

export function alertEmail(formId, fields, meta, entryKey, when, spam = []) {
  const spec = FORMS[formId];
  const rows = Object.entries(fields).filter(([, v]) => String(v).trim() !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(labelFor(formId, k))}</td>` +
      `<td style="padding:6px 0;color:#111827;vertical-align:top">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('');
  const email = emailOf(formId, fields);
  const page = sourceUrl(meta);
  const hs = `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL}/objects/0-1/views/all/list?query=${encodeURIComponent(email)}`;
  const warning = spam.length
    ? `Suspected spam: ${spam.map(r => SPAM_REASONS[r] ?? r).join(', ')}. No automatic reply was sent and the lead service reported no ad conversion. ` +
      'Check it before contacting this address: it may belong to someone who never visited the site.'
    : '';
  const html = `<div style="font:14px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#111827;max-width:620px">` +
    (warning ? `<p style="margin:0 0 16px;padding:10px 12px;background:#fef3c7;border:1px solid #f59e0b">${esc(warning)}</p>` : '') +
    `<p style="margin:0 0 16px">New lead from <strong>${esc(spec.title)}</strong>.</p>` +
    `<table cellpadding="0" cellspacing="0" border="0" style="font-size:14px">${rows}</table>` +
    `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;font:12px/1.7 sans-serif;color:#6b7280">` +
    `<tr><td style="padding:2px 14px 2px 0">Page</td><td><a href="${esc(page)}" style="color:#1d4ed8">${esc(page)}</a></td></tr>` +
    `<tr><td style="padding:2px 14px 2px 0">Submitted</td><td style="color:#111827">${esc(new Date(when).toUTCString())}</td></tr>` +
    `<tr><td style="padding:2px 14px 2px 0">Look up</td><td><a href="${esc(hs)}" style="color:#1d4ed8">Find in HubSpot</a></td></tr>` +
    `<tr><td style="padding:2px 14px 2px 0">Archive</td><td>${esc(entryKey)}</td></tr></table></div>`;
  const text = (warning ? `${warning}\n\n` : '') + `New lead from ${spec.title}\n\n` + Object.entries(fields).filter(([, v]) => String(v).trim())
    .map(([k, v]) => `${labelFor(formId, k)}: ${v}`).join('\n') + `\n\nPage: ${page}\nSubmitted: ${new Date(when).toUTCString()}\nHubSpot: ${hs}\nArchive: ${entryKey}\n`;
  return { subject: `${spam.length ? '[Suspected spam] ' : ''}New submission from ${spec.title} — ${email}`, html, text, replyTo: email };
}

export function replyFor(formId, fields) {
  const r = REPLIES[formId];
  if (!r) return null;
  if (r.variants) return r.variants[fields[r.by]] || r.variants[r.default];
  return r;
}

const htmlToText = h => h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();

async function sendMail(env, { from, to, replyTo, subject, html, text }) {
  const dest = list(Array.isArray(to) ? to.join(',') : to);
  return deps.sendEmail({
    FromEmailAddress: from,
    Destination: { ToAddresses: dest },
    ReplyToAddresses: replyTo ? [replyTo] : undefined,
    Content: { Simple: { Subject: { Data: subject, Charset: 'UTF-8' }, Body: { Html: { Data: html, Charset: 'UTF-8' }, Text: { Data: text ?? htmlToText(html), Charset: 'UTF-8' } } } },
  });
}

async function sendOai(env, { formId, fields, meta, ip, agent, when }) {
  const eventId = UUID_RE.test(meta.spenza_oai_event_id || '') ? meta.spenza_oai_event_id : '';
  if (!eventId) return 'skipped:no_event_id';
  const user = {};
  if (OBREF_RE.test(meta.spenza_oai_obref || '')) user.obref = meta.spenza_oai_obref;
  const email = emailOf(formId, fields).toLowerCase();
  if (EMAIL_RE.test(email)) user.emails_sha256 = [createHash('sha256').update(email).digest('hex')];
  if (ip) user.ip_address = ip;
  if (agent) user.user_agent = agent.slice(0, 512);
  const event = { id: eventId, type: 'lead_created', timestamp_ms: when, source_url: sourceUrl(meta), action_source: 'web', data: { type: 'customer_action' } };
  if (/^[\x21-\x7e]{1,512}$/.test(meta.spenza_oai_oppref || '')) event.oppref = meta.spenza_oai_oppref;
  if (Object.keys(user).length) event.user = user;
  const res = await deps.fetch(`https://bzr.openai.com/v1/events?pid=${encodeURIComponent(env.OAI_PIXEL_ID || 'U7MFXrymQuC42hGkZ8iLv7')}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OAI_CAPI_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ validate_only: env.OAI_VALIDATE_ONLY === '1', integration_source: 'spenza-lambda', events: [event] }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`OpenAI rejected the event (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return 'sent';
}

export async function handler(event, _ctx, envOrCallback) {
  // Lambda's Node runtime passes a callback as the third argument; only a plain object is a test's environment.
  const env = envOrCallback && typeof envOrCallback === 'object' ? envOrCallback : process.env;
  const origin = event.headers?.origin || '';
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return { ...respond(204, {}, origin, env), body: '' };
  if (method !== 'POST') return respond(405, { ok: false, error: 'method_not_allowed' }, origin, env);
  if (!origin || !origins(env).includes(origin)) return respond(403, { ok: false, error: 'origin_not_allowed' }, origin, env);

  const ip = event.requestContext?.http?.sourceIp || '';
  if (await throttled(ip, env)) return respond(429, { ok: false, error: 'rate_limited' }, origin, env);

  const { form, fields, meta, trap } = parseBody(event);
  const check = validate(form, fields);
  if (check.error) return respond(check.error === 'unknown_form' || check.error === 'no_fields' ? 400 : 422, { ok: false, ...check }, origin, env);

  const when = deps.now();
  const d = new Date(when);
  const id = `${when}-${randomUUID().slice(0, 8)}`;
  const entryKey = `leads/${d.toISOString().slice(0, 10).replace(/-/g, '/')}/form-${form}-${id}.json`;
  const agent = event.headers?.['user-agent'] || '';
  const spam = await spamReasons({ formId: form, fields, ip, trap, meta }, env, deps);
  const quarantined = spam.length > 0;
  const result = { archive: 'skipped', alert: 'skipped', reply: 'skipped', oai: 'skipped', ...(quarantined && { spam: spam.join('+') }) };

  const record = {
    id, form: Number(form), formTitle: FORMS[form].title, receivedAt: d.toISOString(),
    fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, { label: labelFor(form, k), value: v }])),
    sourceUrl: sourceUrl(meta), pageTitle: meta.spenza_page_title || '', ip, userAgent: agent.slice(0, 512),
    spam: { quarantined, reasons: spam },
  };

  const jobs = [];
  if (env.ARCHIVE_BUCKET) {
    jobs.push(deps.putObject({
      Bucket: env.ARCHIVE_BUCKET, Key: entryKey, Body: JSON.stringify(record, null, 1), ContentType: 'application/json', ServerSideEncryption: 'AES256',
    }).then(() => { result.archive = 'ok'; }).catch(err => { result.archive = 'failed'; console.error('[lead] archive failed', err.name, err.message); }));
  }
  const alert = alertEmail(form, fields, meta, entryKey, when, spam);
  const alertTo = (quarantined && list(env.SPAM_ALERT_TO).length ? env.SPAM_ALERT_TO : null) ?? FORMS[form].alertTo ?? env.ALERT_TO;
  jobs.push(sendMail(env, { from: env.ALERT_FROM, to: alertTo, ...alert })
    .then(() => { result.alert = 'ok'; }).catch(err => { result.alert = 'failed'; console.error('[lead] alert failed', err.name, err.message); }));

  const reply = !quarantined && (env.SEND_CLIENT_REPLY === '1' || FORMS[form].alwaysReply) ? replyFor(form, fields) : null;
  const to = emailOf(form, fields);
  if (reply && EMAIL_RE.test(to)) {
    jobs.push(sendMail(env, { from: env.REPLY_FROM, to, replyTo: 'sales@spenza.com', subject: reply.subject, html: reply.html })
      .then(() => { result.reply = 'ok'; }).catch(err => { result.reply = 'failed'; console.error('[lead] reply failed', err.name, err.message); }));
  }
  if (!quarantined && env.SEND_OAI === '1' && env.OAI_CAPI_KEY) {
    jobs.push(sendOai(env, { formId: form, fields, meta, ip, agent, when })
      .then(r => { result.oai = r; }).catch(err => { result.oai = 'failed'; console.error('[lead] oai failed', err.message); }));
  }
  await Promise.all(jobs);

  console.log('[lead]', JSON.stringify({ id, form, ...result }));
  // The alert is the thing sales cannot do without; the archive is the safety copy. If neither
  // got out, say so, so the browser logs it. HubSpot already has the contact either way.
  if (result.alert !== 'ok' && result.archive !== 'ok') return respond(502, { ok: false, error: 'delivery_failed' }, origin, env);
  return respond(200, { ok: true, id }, origin, env);
}
