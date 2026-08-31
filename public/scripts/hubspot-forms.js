/**
 * Lead capture: posts the mirrored Gravity Forms straight to HubSpot.
 *
 * On WordPress these forms are Gravity Forms. They POST back to WordPress,
 * which stores an entry, mails sales@spenza.com, and lets the HubSpot plugin's
 * tracking script scrape the submission into a contact. None of that survives a
 * static export: `action` points at a page that no longer runs PHP and `target`
 * is a hidden iframe, so every one of these forms currently swallows the lead
 * without an error. A dead form looks exactly like a working one.
 *
 * So submit to HubSpot ourselves, with HubSpot's Forms Submission API — the
 * endpoint that exists for forms a site hosts itself. One `fetch`, no SDK, no
 * third-party bundle: `js-eu1.hs-scripts.com/25414858.js` is ~180KB of JS whose
 * only job here would be to guess at the same fields we already know by name.
 * Guessing is also how it gets them wrong — "collected forms" reads labels, and
 * these inputs are named `input_10`.
 *
 * The mapping below is therefore explicit, field by field.
 *
 * Region matters. The portal is on EU1 (the live site loads
 * `js-eu1.hs-scripts.com`), and the US endpoint answers 404 for an EU portal.
 *
 * ---------------------------------------------------------------------------
 * The guids are the ones WordPress' leads already go to
 *
 * Each `guid` below is an existing HubSpot *collected* form — the records the
 * tracking plugin created by scraping these very forms, which is why they are
 * named after CSS selectors (`#gform_19`) rather than anything a person chose.
 * Submitting to them keeps every lead in the same place the previous 395 went,
 * so the history stays in one piece.
 *
 * Two consequences worth knowing before changing anything here:
 *
 *   1. A collected form's field list is an **allowlist**, and silence is how
 *      it rejects. A field outside it comes back `200 OK` and never reaches
 *      the contact. Measured, not assumed: a submission to `#gform_20`
 *      carrying surname, mobile and a dropdown answer returned 200 and
 *      created a contact holding email, firstname and company — exactly its
 *      inferred list, nothing more. So a `200` here proves delivery of
 *      *nothing*, and the `fields` map below has to match each form's
 *      allowlist by hand. `npm run hs:check` is what re-checks that.
 *   2. That list is narrower than what these forms ask for, and cannot be
 *      widened: HubSpot owns it and only extends it when its tracking script
 *      observes a new input. Form 20 loses mobile, surname and the solution
 *      dropdown; form 5 loses company and headcount. Each is listed in an
 *      `unsent` array on its entry, with what it costs. The other four forms
 *      lose nothing — their allowlists already cover every field they have.
 *
 * Moving a form off this and onto a real HubSpot form is what buys those
 * fields back. Nothing else does.
 * ---------------------------------------------------------------------------
 */
(() => {
  'use strict';

  /** HubSpot portal, and the data centre it lives in. */
  const PORTAL_ID = '25414858';
  const REGION = 'eu1';

  /**
   * Where to replay the submission so Gravity Forms sends its notifications.
   *
   * Read off this script's own tag rather than hardcoded, because origins in
   * this repo are environment-driven and no script is allowed to name a host.
   * The layouts stamp it from `WP_FORMS_ORIGIN`; empty means "do not replay",
   * which is the behaviour this file had before and is still the default.
   *
   * Captured here, at the top of the IIFE, because `document.currentScript` is
   * only this element while the script is executing.
   */
  const WP_ORIGIN = (document.currentScript?.dataset.wpFormsOrigin || '')
    .replace(/\/+$/, '');

  const ENDPOINT = `https://api-${REGION}.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/`;

  /** Shown when the network fails, so a lead has somewhere else to go. */
  const FALLBACK_EMAIL = 'sales@spenza.com';

  /**
   * The confirmation Gravity Forms shows for most of these, copied from the
   * form settings on WordPress so the two sites say the same thing.
   */
  const THANKS = 'Thanks for contacting us! We will get in touch with you shortly.';

  /**
   * Every submittable form on the site, keyed by its Gravity Forms id — which
   * is what `id="gform_19"` and `name="input_3"` in the mirrored markup are.
   *
   * `fields` maps input name → HubSpot contact property. `required` lists the
   * inputs Gravity Forms marks required; `email` the ones it validates as
   * addresses. `success` is the confirmation, as HTML.
   */
  const FORMS = {
    // Book A Free Demo — the inline email bar on 14 marketing pages, every
    // blog post, and every day archive. By far the most-rendered form.
    19: {
      // Replayed through `spenza-lead-endpoint.php` — see the note on
      // 'ai-agent' below for why posting at a page URL is not enough.
      replay: 'ajax',
      guid: 'e7291c23-7818-44f4-8995-81fb89b2ccb7',
      fields: { input_3: 'email' },
      required: ['input_3'],
      email: ['input_3'],
      success: `<p>${THANKS}</p>`,
    },

    // Homepage Popup — the lead-capture modal behind every "book your demo
    // now" / "Get Started" button, plus the copy inside the post template.
    15: {
      // Replayed through `spenza-lead-endpoint.php` — see the note on
      // 'ai-agent' below for why posting at a page URL is not enough.
      replay: 'ajax',
      guid: '131ba392-3608-445b-967e-293c7fb308bd',
      fields: { input_2: 'email', input_5: 'phone' },
      required: ['input_2'],
      email: ['input_2'],
      success: `<p>${THANKS}</p>`,
    },

    // Download PDF Popup — one post gates a Google Drive PDF behind an email.
    // `input_4` is a hidden field holding that PDF's URL; it is the
    // confirmation's download link, not something HubSpot needs.
    16: {
      // Replayed through `spenza-lead-endpoint.php` — see the note on
      // 'ai-agent' below for why posting at a page URL is not enough.
      replay: 'ajax',
      guid: '67bf9e1f-b653-42ff-af58-bed00c791765',
      fields: { input_2: 'email' },
      required: ['input_2'],
      email: ['input_2'],
      success: form => `
        <p>Thanks for filling the form! Please click on the button below to download your PDF.</p>
        <p><a class="download_pdf" href="${escapeAttr(value(form, 'input_4'))}"
              target="_blank" rel="noopener">Download PDF</a></p>`,
    },

    // New Contact Form — contact-us and support.
    //
    // The collected form accepts email, firstname and company, and nothing
    // else. Verified, not assumed: a submission carrying surname, mobile and
    // the solution dropdown came back 200 and the contact was created with
    // those three fields only. A collected form's field list is an allowlist,
    // silence is how it rejects, and the list cannot be edited — HubSpot owns
    // it, and it only grows when the tracking script observes a new input.
    //
    // So they are not sent. Dropping them here rather than posting them into
    // the void is the same outcome with one difference: this file says so.
    20: {
      // Replayed through `spenza-lead-endpoint.php` — see the note on
      // 'ai-agent' below for why posting at a page URL is not enough.
      replay: 'ajax',
      guid: '5d8b9928-1875-4a8e-942d-76d41139916e',
      fields: {
        input_1: 'name:first',
        input_4: 'email',
        input_6: 'company',
      },
      /**
       * Asked for on the page, validated below, and with nowhere to go:
       *
       *   input_5   mobile number
       *   input_10  "Which solution are you interested in?"
       *   the surname half of input_1
       *
       * `input_10` is the expensive one. On WordPress it chooses which of six
       * replies the visitor gets, and it has never reached HubSpot at all — 66
       * submissions, no record of what any of them asked about. Recovering it
       * needs a form whose field list we control, which is a HubSpot form.
       */
      unsent: ['input_5', 'input_10'],
      required: ['input_1', 'input_4', 'input_6', 'input_10'],
      email: ['input_4'],
      success: `<p>${THANKS}</p>`,
    },

    // Download Now — the gated mobility-policy pack. Its confirmation is the
    // delivery mechanism: two files, linked straight from the thank-you.
    5: {
      /*
       * The form that took two fixes to get here, both of them silent.
       *
       * Its name and address fields are Gravity Forms' multi-input kind,
       * named with a dot — `input_1.3`, `input_7.4`, `input_7.6`,
       * `input_8.6`. The endpoint's first version matched only underscores
       * and dropped all four, three of them required, so every submission
       * failed. It now accepts both spellings.
       *
       * Then its phone field: alone among the seven it was set to Gravity
       * Forms' US format, and a number with a country code did not merely
       * fail validation, it crashed PHP — HTTP 500, no entry, no email, and
       * "critical error" as the only clue. It is now `international`, which
       * is what every other form on the site already used.
       */
      replay: 'ajax',
      guid: '32e3d5e9-f13b-4841-a28c-788b91eddf63',
      fields: {
        'input_1.3': 'firstname',
        'input_8.6': 'lastname',
        input_2: 'email',
        input_4: 'jobtitle',
        input_5: 'phone',
        'input_7.6': 'country',
      },
      /**
       * Same allowlist problem, confirmed the same way:
       *
       *   input_3  company name
       *   input_6  number of employees
       *
       * Both are required on the page and neither reaches HubSpot. Headcount
       * is the qualifying question on a gated download, so this is the second
       * form worth moving to a HubSpot form if the loss ever bites.
       */
      unsent: ['input_3', 'input_6'],
      required: ['input_1.3', 'input_8.6', 'input_2', 'input_3', 'input_4', 'input_6'],
      email: ['input_2'],
      success: `
        <h3 class="form_title">Thank You</h3>
        <p><a class="download_pdf" href="/wp-content/uploads/2021/08/Enterprise-Mobility-Policy-Questions-to-Ask.pdf"
              download="Enterprise-Mobility-Policy-Questions-to-Ask.pdf">Download mobility policy primer</a></p>
        <p><a class="download_pdf" href="/wp-content/uploads/2021/08/Mobility-Policy-Template.docx"
              download="mobility policy template.docx">Download mobility policy template</a></p>`,
    },

    // Request Integration Review — the /ai-phone-number/ landing page.
    //
    // Keyed by name rather than by a Gravity Forms id, because the page is
    // hand-built and its markup carries no `id="gform_22"` for `gravityId` to
    // read — `data-hs-form="ai-agent"` on the <form> selects this entry
    // instead. It replays to Gravity Forms 22, which exists for this page
    // alone, so every question below is a real field on both sides.
    'ai-agent': {
      // A real HubSpot form, and the only one on the site — every other entry
      // above points at a *collected* form, whose field list HubSpot owns and
      // will not widen. This one's fields are ours, so nothing is dropped and
      // `unsent` is empty: the first form here that loses nothing by design
      // rather than by luck.
      guid: '96db89c5-4b46-4d3c-abb8-ef67db1d2453',

      /**
       * Replayed through `spenza-lead-endpoint.php` on admin-ajax, not by
       * posting at a page URL like the six mirrored forms above.
       *
       * Those six post at a page, and that breaks whenever the host puts
       * WordPress behind its "Coming Soon" placeholder: the placeholder
       * answers 200 without ever reaching Gravity Forms, and the replay is
       * `no-cors`, so its response is opaque and the browser cannot tell that
       * 200 from a real submission. For as long as the placeholder is up,
       * every lead on those forms reaches HubSpot and its notification emails
       * are lost, silently, with nothing anywhere reporting it. That is not a
       * hypothetical — preprod sat behind that page for most of the day this
       * form was built.
       *
       * `admin-ajax.php` is not gated by it. Measured with the placeholder up:
       * a GET of the page returns "Coming Soon" while
       * `admin-ajax.php?action=heartbeat` returns JSON. The endpoint also
       * answers with CORS headers, so unlike the replay this path can say
       * whether the entry was actually written — see `notifyViaEndpoint`.
       *
       * The other six can move here the same way: set `replay: 'ajax'` on
       * them. The endpoint already allowlists all seven form ids.
       */
      replay: 'ajax',

      fields: {
        // The full name, both halves — a collected form would have taken the
        // forename and silently discarded the rest.
        input_1: 'name',
        input_2: 'email',
        input_3: 'company',
        input_4: 'phone',
      },
      /**
       * The five qualifying answers, into one contact property.
       *
       * They deserve five properties of their own, and creating a contact
       * property needs a CRM schema scope that the token which made this form
       * does not carry. `message` is standard, so they are stored and readable
       * on the contact today rather than waiting on that. Splitting them out
       * later means adding five entries to `fields` and five fields to the
       * HubSpot form; nothing else here changes.
       *
       * Gravity Forms holds the structured copy either way: on form 22 these
       * are five real fields, so they appear individually in the Entries
       * screen, in exports and in `{all_fields}`.
       */
      summary: {
        property: 'message',
        parts: [
          ['Current telephony provider', 'input_5'],
          ['Voice AI use case', 'input_6'],
          ['Expected monthly call volume', 'input_7'],
          ['Number of agents', 'input_8'],
          ['Required capabilities', 'input_9'],
        ],
      },
      unsent: [],
      required: ['input_1', 'input_2', 'input_3'],
      email: ['input_2'],
      // A heading and a line, not one long sentence floating in a card. The
      // class is this page's own: `.form_title` is wp-polish's, and it is one
      // of the two things the mirrored pill rule tests for.
      success:
        '<h3 class="hs-confirmation-title">Request received</h3>' +
        '<p>A Spenza telecom specialist will review your setup and be in touch shortly.</p>',
    },

    // Analysis Report Mail — the MVNO calculator's "send me the report" gate.
    // The page script waits on Gravity Forms' `gform_confirmation_loaded` to
    // start the download, so a success here has to announce itself; see
    // `announce()` below.
    21: {
      // Replayed through `spenza-lead-endpoint.php` — see the note on
      // 'ai-agent' below for why posting at a page URL is not enough.
      replay: 'ajax',
      guid: '96f58512-9d88-410f-9dce-4610a8761f8d',
      fields: { input_1: 'email', input_2: 'phone' },
      required: ['input_1', 'input_2'],
      email: ['input_1'],
      success: `<p>${THANKS}</p>`,
    },
  };

  /* ------------------------------------------------------------- helpers */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const value = (form, name) => {
    const el = form.elements[name];
    return el && typeof el.value === 'string' ? el.value.trim() : '';
  };

  const escapeAttr = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const cookie = name =>
    document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1];

  /**
   * Gravity Forms' id, read from the element rather than a `data-` attribute:
   * `id="gform_19"` is the one thing every one of these forms carries, in both
   * the double-quoted page markup and the single-quoted post template.
   */
  const gravityId = form => form.id.match(/^gform_(\d+)$/)?.[1];

  /**
   * Which entry of `FORMS` describes this form.
   *
   * Every mirrored form is its Gravity Forms id, because that is the one thing
   * the markup carries. A hand-built page names its entry explicitly instead:
   * `/ai-phone-number/` asks its own seven questions and replays them to form
   * 20 for the notifications, so its id and its field set do not belong to the
   * same form and cannot both be read off one number.
   */
  const specKey = form => form.dataset.hsForm || gravityId(form);

  /**
   * The two spam traps in the mirrored markup: Akismet's hidden textarea, which
   * every form carries, and Gravity Forms' own honeypot field on form 21. Both
   * are invisible, so anything typed into either was typed by a bot.
   */
  const trapped = form =>
    !!value(form, 'ak_hp_textarea') ||
    [...form.querySelectorAll('.gfield--type-honeypot input')].some(i => i.value.trim());

  /* ---------------------------------------------------------- field state */

  /** Each invalid input's message, which is not always its next sibling. */
  const notes = new WeakMap();

  /**
   * Error text under a field.
   *
   * Deliberately not Gravity Forms' own `.validation_message` — that class
   * only ever appears in markup WordPress renders after a failed submit, so
   * `wp:optimize-css` purges its styling out of every bundle. Anything this
   * script adds has to be styled by `wp-polish.css`, which Astro emits and
   * purgecss never sees.
   *
   * It goes under the field, except on the one-line `.eSim` pill — there the
   * field and the button are two halves of one control that the form centres
   * against each other, so anything inserted into the field's half makes that
   * half taller and slides the button down out of the pill. On those the note
   * is appended to the form, which wraps it onto a line of its own beneath the
   * whole control and leaves the pill's geometry alone.
   */
  function markInvalid(input, message) {
    clearInvalid(input);
    input.classList.add('hs-invalid');
    input.setAttribute('aria-invalid', 'true');

    const note = document.createElement('p');
    note.className = 'hs-field-error';
    note.textContent = message;

    const pill = input.closest('.eSim form[id^="gform_"]');
    if (pill) pill.append(note);
    else input.insertAdjacentElement('afterend', note);

    notes.set(input, note);
  }

  function clearInvalid(input) {
    input.classList.remove('hs-invalid');
    input.setAttribute('aria-invalid', 'false');
    notes.get(input)?.remove();
    notes.delete(input);
    input.parentElement?.querySelector(':scope > .hs-field-error')?.remove();
  }

  /**
   * What to call a field in its error message.
   *
   * Two ways a label can be attached, because the site now has both. Every
   * mirrored Gravity Form gives its inputs an id and a matching `label[for]`.
   * The hand-built form on `/ai-phone-number/` wraps each input in its label
   * instead — equally valid, and it needs no ids.
   *
   * The `?.` on the first lookup is not enough on its own: `input.id && …`
   * evaluates to the empty string when an input has no id, and `''?.textContent`
   * is `undefined` rather than a short-circuit, so the old `label?.textContent
   * .replace(…)` threw on the first idless input it met — taking validation,
   * and with it the whole submit, down with it.
   */
  function labelFor(input) {
    const id = input.id ? CSS.escape(input.id) : '';
    const explicit = id ? input.form?.querySelector(`label[for="${id}"]`) : null;
    const label = explicit ?? input.closest('label');

    // Strip Gravity Forms' "(Required)" / "*" suffix out of the label text.
    const text = label?.textContent?.replace(/\s*\(Required\)\s*\*?\s*$|\s*\*\s*$/, '').trim();
    return text || input.placeholder || 'This field';
  }

  /**
   * Checks every field the Gravity Form marks required, focuses the first
   * problem, and returns whether the form is submittable. Reports all of them
   * at once rather than one per attempt.
   */
  function validate(form, spec) {
    let first = null;

    // `unsent` fields are validated too. They are still required on the page,
    // the visitor still has to fill them in, and letting one through unchecked
    // because HubSpot happens not to want it would be a strange way to fail.
    const checked = [...Object.keys(spec.fields), ...(spec.unsent || [])];

    for (const name of checked) {
      // `form.elements[name]` answers with a RadioNodeList when a name is
      // shared; none of these forms share one, and a list has no `classList`.
      const input = form.elements[name];
      if (!(input instanceof HTMLElement) || typeof input.value !== 'string') continue;
      clearInvalid(input);

      const val = input.value.trim();
      if (spec.required.includes(name) && !val) {
        markInvalid(input, `${labelFor(input)} is required.`);
        first ??= input;
      } else if (val && spec.email.includes(name) && !EMAIL_RE.test(val)) {
        markInvalid(input, 'Please enter a valid email address.');
        first ??= input;
      }
    }

    first?.focus();
    return !first;
  }

  /* -------------------------------------------------------------- states */

  /**
   * The element Gravity Forms would have replaced: the whole form wrapper.
   *
   * A hand-built form is its own wrapper. On the mirrored pages the form's
   * parent is the Gravity Forms shell and nothing else, so replacing it is
   * right; on `/ai-phone-number/` the parent also holds the headline and the
   * call-to-action beside the form, and replacing it would take the whole
   * panel down to a one-line thank-you.
   */
  const wrapperOf = form =>
    form.closest('.gform_wrapper') ||
    (form.dataset.hsForm ? form : form.parentElement) ||
    form;

  function showConfirmation(form, spec) {
    const html = typeof spec.success === 'function' ? spec.success(form) : spec.success;
    const wrapper = wrapperOf(form);

    const box = document.createElement('div');
    box.className = 'hs-confirmation';
    box.setAttribute('role', 'status');
    box.innerHTML = html;

    // The hidden iframe the form used to target is a sibling of the wrapper,
    // not a child, so it would outlive the replace. Harmless, but pointless.
    const frame = wrapper.nextElementSibling;
    if (frame?.matches('iframe[id^="gform_ajax_frame"]')) frame.remove();

    wrapper.replaceChildren(box);
  }

  function showError(form) {
    let box = form.querySelector(':scope > .hs-form-error');
    if (!box) {
      box = document.createElement('p');
      box.className = 'hs-form-error';
      box.setAttribute('role', 'alert');
      form.prepend(box);
    }
    box.innerHTML =
      `Sorry, we could not send that. Please try again, or email us at ` +
      `<a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`;
  }

  /**
   * The submit button, and how to put it back.
   *
   * Gravity Forms' inline `onclick` sets `window.gf_submitting_<id> = true` and
   * refuses every later click while it is set. On WordPress the page navigates
   * before that matters; here it does not, so a failed attempt would leave the
   * button permanently inert — the user retries, nothing happens, and the lead
   * is lost to something that looks like a broken button.
   */
  function busy(form, id) {
    const button = form.querySelector('input[type="submit"], button[type="submit"]');
    if (!button) return () => { window[`gf_submitting_${id}`] = false; };

    const label = button.value || button.textContent;
    button.disabled = true;
    if ('value' in button && button.tagName === 'INPUT') button.value = 'Sending…';
    else button.textContent = 'Sending…';

    return () => {
      button.disabled = false;
      if (button.tagName === 'INPUT') button.value = label;
      else button.textContent = label;
      window[`gf_submitting_${id}`] = false;
    };
  }

  /**
   * Tell the page a submission went through, the way Gravity Forms does.
   *
   * The MVNO calculator hangs its CSV/XLSX/PDF download off
   * `gform_confirmation_loaded` for form 21 — that is the point where the lead
   * has been captured and the file is owed. Gravity Forms fires it through
   * jQuery, which nothing here ships, so fire it natively and put the form id
   * on `detail`; `page/mvno-calculator.js` reads it from there.
   */
  function announce(id) {
    document.dispatchEvent(new CustomEvent('gform_confirmation_loaded', {
      detail: { formId: id },
    }));
  }

  /* ------------------------------------------------------- gravity forms */

  /**
   * Replay the submission to WordPress, so Gravity Forms mails everyone.
   *
   * This is the half of the old behaviour that HubSpot never had. On WordPress
   * these forms POST to PHP, and Gravity Forms answers with notifications: an
   * "Admin Notification" telling the team a lead arrived, and a client reply
   * thanking the submitter, sent to the address in the form's own email field
   * and BCC'd to sales. Form 20 has six of those client replies and picks
   * between them on the solution dropdown; thirteen notifications exist across
   * the six forms in total. None of them is a HubSpot feature — a collected
   * form has no follow-up email to configure — so once the site stopped
   * posting to WordPress, every one of those emails stopped with it.
   *
   * So post the form again, unchanged. `FormData` takes the whole thing as the
   * page renders it, which is what keeps this faithful: `is_submit_<id>`,
   * `gform_submit`, the `state_<id>` token and the page-number fields are all
   * mirrored markup, and Gravity Forms needs every one of them to recognise
   * the request as a submission of that form.
   *
   * Fire-and-forget, for a reason that cannot be engineered away: WordPress
   * sends no CORS headers, so a cross-origin response is unreadable by design.
   * `no-cors` keeps the request a "simple" one — no preflight to be refused —
   * and the bytes on the wire are the bytes a real form post sends. What comes
   * back is opaque, so this can report that it *sent*, never that it *worked*.
   * The visitor's confirmation therefore stays tied to HubSpot's answer, which
   * is the one we can actually read.
   */
  const notified = new WeakSet();

  /**
   * The body every replay sends: the form exactly as the page renders it.
   *
   * Shared by both paths below, because what makes the replay faithful is that
   * it is the same bytes a real form post would carry — `is_submit_<id>`,
   * `gform_submit`, the `state_<id>` token and the page-number fields are all
   * part of the markup, and Gravity Forms needs them to recognise the request.
   */
  function replayBody(form) {
    const body = new URLSearchParams();

    for (const [key, val] of new FormData(form)) {
      // None of these forms has a file input, but `FormData` would hand us a
      // `File` if one were ever added, and stringifying it silently posts the
      // word "[object File]" as the answer to a question.
      if (typeof val === 'string') body.append(key, val);
    }

    // The page the lead actually came from. Gravity Forms files an entry
    // against the URL the POST lands on, which is the replay's rather than the
    // visitor's; `spenza-form-source-url.php` reads this back instead.
    body.set('spenza_source_url', location.href);
    body.set('spenza_page_title', document.title);

    // Akismet stamps this with the time its script ran and judges the
    // submission partly on how long the form was open. The mirror froze one
    // page's value into the markup, so every submission would carry the same
    // implausible constant — and a submission Akismet marks as spam is stored
    // as spam, which sends no notification at all.
    if (body.has('ak_js')) body.set('ak_js', String(Date.now()));

    return body;
  }

  /**
   * Hand the lead to `spenza-lead-endpoint.php` on admin-ajax.
   *
   * The page replay below cannot survive the host's "Coming Soon" page: that
   * placeholder answers 200 without ever reaching Gravity Forms, and a
   * `no-cors` response is opaque, so the browser cannot tell that 200 apart
   * from a real submission. Every lead in that window loses its notification
   * and nothing anywhere reports it.
   *
   * `admin-ajax.php` is not behind that gate, and the endpoint answers with
   * CORS headers — so unlike the replay, this one can say whether the entry
   * was actually written.
   */
  async function notifyViaEndpoint(form, id) {
    const url = `${WP_ORIGIN}/wp-admin/admin-ajax.php?action=spenza_lead`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        // `keepalive` so it survives the page navigating away — form 5's
        // confirmation is a download link and form 21 starts a file download.
        keepalive: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: replayBody(form),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.ok) {
        console.error(
          `[hubspot-forms] form ${id}: WordPress rejected the lead ` +
          `(${res.status} ${result?.error ?? 'unreadable response'}). ` +
          'The contact reached HubSpot; the notification emails did not.',
          result?.validation ?? ''
        );
      }
    } catch (err) {
      // A network failure, the endpoint not installed — or CORS, which is
      // indistinguishable from both: a blocked response and a dead host are
      // the same `TypeError: Failed to fetch`.
      //
      // Worth knowing when testing from `localhost`, because the endpoint
      // echoes CORS only for the spenza.com origins. The POST still arrives
      // and the entry is still written; only the *response* is blocked, so
      // this line appears for a lead that actually landed. From a real origin
      // it means what it says.
      //
      // Logged rather than shown either way: the lead is already in HubSpot
      // and only the mail is at risk, so there is nothing for the visitor to
      // act on.
      console.error(`[hubspot-forms] form ${id}: lead endpoint unreachable:`, err);
    }
  }

  function notifyWordPress(form, id, spec) {
    if (!WP_ORIGIN || notified.has(form)) return;
    notified.add(form);

    if (spec?.replay === 'ajax') return notifyViaEndpoint(form, id);

    // Where to post. The mirrored `action` is the page this form was captured
    // on, and may carry the `#gf_19` fragment Gravity Forms appends; a fragment
    // is not sent with a request, but it has no business in a URL built by hand.
    //
    // It is only trusted when it is a plain page path. Gravity Forms renders
    // `action` as whatever the *current request URI* was, and form 16 lives in
    // post content fetched through WPGraphQL — so on that one the attribute is
    // the loader's own `/graphql?query={posts…}` URL, several kilobytes of it.
    // Posting there reaches the WAF, which answers 415 or 403, and the lead's
    // notification is lost to a URL that was never a page.
    //
    // Falling back to the current path is safe: Gravity Forms recognises a
    // submission by `gform_submit`, not by which page receives it.
    const raw = (form.getAttribute('action') || '').split('#')[0];
    const usable = raw && !raw.includes('?') && !/\/graphql\/?$/.test(raw);

    let url;
    try {
      url = new URL(usable ? raw : location.pathname, WP_ORIGIN + '/');
      url.search = '';
      url.protocol = 'https:';
      url.host = new URL(WP_ORIGIN).host;
    } catch {
      return;
    }

    // Same bytes the endpoint path sends — see `replayBody`. Shared so the two
    // cannot drift: a field added to one and not the other would be missing
    // from exactly half the site's leads.
    const body = replayBody(form);

    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      // `keepalive` so the request survives the page navigating away — the
      // confirmation for form 5 is a download link, and form 21 starts a file
      // download the moment it renders.
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).catch(err => {
      console.error(`[hubspot-forms] form ${id}: notification replay failed:`, err);
    });
  }

  /* -------------------------------------------------------------- submit */

  /**
   * HubSpot's v3 payload. `objectTypeId: '0-1'` is the contact object; `hutk`
   * is the tracking cookie, which ties this submission to everything HubSpot
   * already knows about the visitor. It is optional, and absent unless
   * something else on the page has loaded HubSpot's tracking script — the
   * submission is accepted either way, it just arrives without a source.
   */
  function payload(form, spec) {
    const fields = [];

    for (const [name, property] of Object.entries(spec.fields)) {
      const val = value(form, name);
      if (!val) continue;

      // Gravity Forms asks for one "Name"; HubSpot stores two. Split on the
      // first space and give the rest to the surname, which is what HubSpot's
      // own form embed does with a single name field.
      //
      // `name:first` keeps only the forename, for a collected form whose
      // allowlist has no `lastname` — sending one is not an error, it is worse
      // than an error, because it succeeds and vanishes.
      if (property === 'name' || property === 'name:first') {
        const [first, ...rest] = val.split(/\s+/);
        fields.push({ objectTypeId: '0-1', name: 'firstname', value: first });
        if (rest.length && property === 'name') {
          fields.push({ objectTypeId: '0-1', name: 'lastname', value: rest.join(' ') });
        }
        continue;
      }

      fields.push({ objectTypeId: '0-1', name: property, value: val });
    }

    /**
     * Several answers into one property, labelled.
     *
     * For questions a form asks that HubSpot has no property for. Empty
     * answers are left out rather than sent as a label with nothing after it,
     * and if every one is empty the property is not sent at all — an empty
     * string would overwrite whatever the contact already had there.
     */
    if (spec.summary) {
      const lines = spec.summary.parts
        .map(([label, name]) => [label, value(form, name)])
        .filter(([, val]) => val)
        .map(([label, val]) => `${label}: ${val}`);

      if (lines.length) {
        fields.push({
          objectTypeId: '0-1',
          name: spec.summary.property,
          value: lines.join('\n'),
        });
      }
    }

    const hutk = cookie('hubspotutk');

    return {
      fields,
      context: {
        ...(hutk ? { hutk } : {}),
        pageUri: location.href,
        pageName: document.title,
      },
    };
  }

  async function send(spec, body) {
    // Ten seconds, then give up and offer the mailto. A submit button that
    // spins forever is the one failure mode worse than an error message.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 10000);

    try {
      const res = await fetch(ENDPOINT + spec.guid, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abort.signal,
      });
      if (res.ok) return true;

      // HubSpot answers 400 with which field it objected to. That is a
      // configuration error — a property the form does not declare — and it
      // will affect every submission until someone reads it, so say so.
      console.error('[hubspot-forms] rejected:', res.status, await res.text());
      return false;
    } catch (err) {
      console.error('[hubspot-forms] request failed:', err);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  async function handle(form, id, spec) {
    if (form.dataset.hsSending) return;

    if (!validate(form, spec)) {
      window[`gf_submitting_${id}`] = false;
      return;
    }

    // A filled honeypot is a bot. Show it the confirmation and send nothing —
    // an error would tell it which field gave it away.
    if (trapped(form)) return showConfirmation(form, spec);

    if (!spec.guid) {
      console.error(
        `[hubspot-forms] form ${id} has no HubSpot guid; nothing was sent. ` +
        'Fill it in at the top of /scripts/hubspot-forms.js.'
      );
      showError(form);
      window[`gf_submitting_${id}`] = false;
      return;
    }

    form.dataset.hsSending = '1';

    // Before `busy()`, which disables the submit button — and a disabled
    // control is one `FormData` leaves out. Before the `await` too: the
    // notification emails are the point of this, and they should not wait on
    // HubSpot, nor be lost if HubSpot is the thing that is down.
    notifyWordPress(form, id, spec);

    const restore = busy(form, id);
    const ok = await send(spec, payload(form, spec));
    delete form.dataset.hsSending;

    if (!ok) {
      restore();
      showError(form);
      return;
    }

    showConfirmation(form, spec);
    announce(id);
  }

  /* ---------------------------------------------------------------- wire */

  // One delegated listener rather than one per form: the demo modal is
  // rendered on ~270 pages and the post template carries two forms of its own,
  // and a listener that is attached on `submit` cannot be missed by markup
  // that appeared after this script ran.
  document.addEventListener('submit', event => {
    const form = event.target;
    const key = form instanceof HTMLFormElement && specKey(form);
    const spec = key && FORMS[key];
    if (!spec) return;

    event.preventDefault();

    // `gf_submitting_<id>` and `gform_confirmation_loaded` are Gravity Forms'
    // and are keyed by its numeric id, so a named form passes the id it
    // replays to where it has one, and its own key where it does not.
    handle(form, gravityId(form) ?? key, spec);
  });

  // Clear a field's error as soon as it is being fixed, rather than making the
  // user submit again to find out.
  document.addEventListener('input', event => {
    if (event.target.classList?.contains('hs-invalid')) clearInvalid(event.target);
  });

  /**
   * Open the connection to HubSpot when someone starts filling a form, so the
   * DNS lookup, TCP handshake and TLS negotiation are already done by the time
   * they press the button — roughly 200-300ms off the wait, on a cold origin.
   *
   * On focus rather than on load: this is a host no page ever contacts unless a
   * form is actually used, and 900 pages speculatively warming it would be
   * exactly the kind of always-on third-party cost this file exists to avoid.
   */
  document.addEventListener('focusin', function warm(event) {
    if (!event.target.closest?.('form[id^="gform_"], form[data-hs-form]')) return;
    document.removeEventListener('focusin', warm);

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `https://api-${REGION}.hsforms.com`;
    document.head.appendChild(link);
  });
})();
