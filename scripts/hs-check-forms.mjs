// Check that the HubSpot forms this site submits to still accept what it sends.
//
//   npm run hs:check
//
// Nothing here creates or changes anything in HubSpot. The site submits to six
// *collected* forms — the records HubSpot's tracking plugin built by scraping
// the WordPress pages, which is why they are named `#gform_19` and not
// something a person chose. Reusing them is what keeps a new lead in the same
// place the previous 395 went.
//
// The catch, and the reason this script exists: a collected form's field list
// is an allowlist and it rejects by staying quiet. Send it a field it has not
// seen and the API answers `200 OK`, the contact is created, and the field is
// simply absent. There is no error to notice, at any point, ever. So the only
// way to know a form still accepts what we send is to compare the two lists,
// which is all this does.
//
// With a private app token (scope: `forms`) it compares field by field. Without
// one it still checks every guid resolves, which needs no auth and catches a
// deleted or mistyped form. See .env.example.
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';

const PORTAL = '25414858';
const RUNTIME = path.join(PROJECT, 'public', 'scripts', 'hubspot-forms.js');
const SUBMIT = `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${PORTAL}/`;
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

let failed = false;
const fail = msg => { failed = true; console.error(`  ✗ ${msg}`); };

/* ------------------------------------------------ what the runtime sends */

/**
 * Parsed out of `hubspot-forms.js` rather than restated here, so the two
 * cannot drift. Drift is the whole failure mode: a property renamed on one
 * side and not the other produces no error anywhere, just leads missing a
 * field that nobody notices until someone goes looking for it.
 */
async function runtimeForms() {
  // Normalised to LF first. The file is edited on Windows and git is set to
  // convert on checkout, so whether a line ends `\n` or `\r\n` depends on who
  // touched it last — and a parser that silently finds nothing would report
  // every form as fine.
  const source = (await fs.readFile(RUNTIME, 'utf8')).replace(/\r\n/g, '\n');
  const forms = new Map();

  // Numeric keys are Gravity Forms ids; a quoted key is a hand-built form that
  // has no id of its own (see `specKey` in the runtime). Both are checked —
  // a named form drifts from its HubSpot form exactly as silently.
  for (const block of source.matchAll(/\n {4}'?([\w-]+)'?: \{\n([\s\S]*?)\n {4}\},/g)) {
    const [, id, body] = block;
    const guid = body.match(/guid: '([^']*)'/)?.[1] ?? '';
    const fieldBlock = body.match(/fields: \{([\s\S]*?)\},/)?.[1] ?? '';

    const properties = new Set();
    for (const [, prop] of fieldBlock.matchAll(/:\s*'([a-z_0-9:]+)'/g)) {
      // The two name markers stand for the HubSpot properties they produce.
      if (prop === 'name') { properties.add('firstname'); properties.add('lastname'); }
      else if (prop === 'name:first') properties.add('firstname');
      else properties.add(prop);
    }

    // A `summary` block folds several of a form's answers into one property.
    // It is a property the site sends, so the check has to know about it —
    // otherwise the one field carrying five answers is the one field never
    // verified.
    const summary = body.match(/summary: \{[\s\S]*?property: '([^']+)'/)?.[1];
    if (summary) properties.add(summary);

    const unsent = [...(body.match(/unsent: \[([^\]]*)\]/)?.[1] ?? '')
      .matchAll(/'([^']+)'/g)].map(m => m[1]);

    forms.set(id, { guid, properties, unsent });
  }

  return forms;
}

/* --------------------------------------------------- what HubSpot accepts */

async function hubspotForms() {
  const byGuid = new Map();
  let after;

  do {
    // `captured` as well as the default `hubspot`, because six of the seven
    // forms this site submits to are collected ones. Without it the listing
    // comes back holding only the portal's hand-built forms and every guid
    // here reads as "no such form" — a check that fails loudest exactly when
    // it is given the credentials meant to make it work.
    // Repeated rather than comma-joined: the endpoint deserialises each
    // `formTypes` value on its own and rejects "hubspot,captured" as one.
    const query = new URLSearchParams({ limit: '100', ...(after ? { after } : {}) });
    query.append('formTypes', 'hubspot');
    query.append('formTypes', 'captured');
    const res = await fetch(`https://api.hubapi.com/marketing/v3/forms/?${query}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) throw new Error(`forms list → ${res.status}\n${await res.text()}`);

    const page = await res.json();
    for (const form of page.results) {
      // A collected form is returned without `fieldGroups` — its field list is
      // HubSpot's private inference and is not exposed anywhere in the API, on
      // this endpoint or on the single-form one. So it cannot be compared, and
      // saying so is the honest result; the alternative is reading an absent
      // list as an empty one and reporting every field as dropped.
      byGuid.set(form.id, {
        name: form.name,
        type: form.formType,
        fields: form.fieldGroups
          ? new Set(form.fieldGroups.flatMap(g => g.fields.map(f => f.name)))
          : null,
      });
    }
    after = page.paging?.next?.after;
  } while (after);

  return byGuid;
}

/**
 * Does this guid resolve? An empty `fields` array cannot create a contact —
 * nothing has an email — so this is a read in everything but HTTP verb. A
 * missing form is a 404; anything else means the form is there.
 */
async function guidResolves(guid) {
  const res = await fetch(SUBMIT + guid, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: [] }),
  });
  return res.status !== 404;
}

/* ------------------------------------------------------------------- main */

const runtime = await runtimeForms();
if (!runtime.size) {
  console.error('Could not parse any forms out of public/scripts/hubspot-forms.js.');
  process.exit(1);
}

const hubspot = TOKEN ? await hubspotForms() : null;
if (!hubspot) {
  console.log('No HUBSPOT_PRIVATE_APP_TOKEN — checking that the guids resolve only.');
  console.log('Set one (scope: forms) to compare field lists too.\n');
}

for (const [id, form] of runtime) {
  const sends = [...form.properties].sort();
  console.log(`${/^\d+$/.test(id) ? `gform_${id}` : id}  ${form.guid}`);

  if (!form.guid) {
    fail('no guid configured — this form cannot submit anywhere');
    continue;
  }

  const known = hubspot?.get(form.guid);

  if (!hubspot) {
    if (await guidResolves(form.guid)) console.log(`  ✓ resolves — sends ${sends.join(', ')}`);
    else fail('guid does not resolve: no such form in this portal');
  } else if (!known) {
    fail(`guid is not a form in this portal`);
  } else if (!known.fields) {
    // Collected: exists, but publishes no field list to compare against.
    console.log(`  ${known.name} [${known.type}] — HubSpot publishes no field list for a collected form`);
    if (await guidResolves(form.guid)) console.log(`  ✓ resolves — sends ${sends.join(', ')}`);
    else fail('guid does not resolve: no such form in this portal');
  } else {
    const missing = sends.filter(p => !known.fields.has(p));
    console.log(`  ${known.name} [${known.type}] accepts ${[...known.fields].sort().join(', ')}`);

    if (missing.length) {
      fail(`silently dropped: ${missing.join(', ')} — sent, accepted with 200, never stored`);
    } else {
      console.log(`  ✓ every field sent is on the allowlist`);
    }
  }

  // Not a failure — a deliberate, recorded loss. Worth restating on every run
  // so it stays a decision rather than becoming a thing nobody remembers.
  if (form.unsent.length) {
    console.log(`  · asked on the page, deliberately not sent: ${form.unsent.join(', ')}`);
  }
}

console.log(
  failed
    ? '\nSomething would be lost. Fix the field map, or move the form to a HubSpot form.'
    : '\nAll forms accept everything the site sends them.'
);
process.exit(failed ? 1 : 0);
