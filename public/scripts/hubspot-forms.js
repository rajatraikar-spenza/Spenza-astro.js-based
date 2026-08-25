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
      guid: 'e7291c23-7818-44f4-8995-81fb89b2ccb7',
      fields: { input_3: 'email' },
      required: ['input_3'],
      email: ['input_3'],
      success: `<p>${THANKS}</p>`,
    },

    // Homepage Popup — the lead-capture modal behind every "book your demo
    // now" / "Get Started" button, plus the copy inside the post template.
    15: {
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

    // Analysis Report Mail — the MVNO calculator's "send me the report" gate.
    // The page script waits on Gravity Forms' `gform_confirmation_loaded` to
    // start the download, so a success here has to announce itself; see
    // `announce()` below.
    21: {
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

  function labelFor(input) {
    const id = input.id && CSS.escape(input.id);
    const label = id && input.form?.querySelector(`label[for="${id}"]`);
    // Strip Gravity Forms' "(Required)" / "*" suffix out of the label text.
    const text = label?.textContent.replace(/\s*\(Required\)\s*$|\s*\*\s*$/, '').trim();
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

  /** The element Gravity Forms would have replaced: the whole form wrapper. */
  const wrapperOf = form =>
    form.closest('.gform_wrapper') || form.parentElement || form;

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
    const id = form instanceof HTMLFormElement && gravityId(form);
    const spec = id && FORMS[id];
    if (!spec) return;

    event.preventDefault();
    handle(form, id, spec);
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
    if (!event.target.closest?.('form[id^="gform_"]')) return;
    document.removeEventListener('focusin', warm);

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `https://api-${REGION}.hsforms.com`;
    document.head.appendChild(link);
  });
})();
