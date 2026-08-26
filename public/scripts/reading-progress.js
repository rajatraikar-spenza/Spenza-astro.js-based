/*
 * The reading-progress bar on a blog post, and the scroll depth that opens the
 * Get Started popup.
 *
 * The bar is a fixed hairline across the top of the viewport, filled left to
 * right in the brand orange as the reader moves down the page — the bar
 * HubSpot's blog shows, and the one thing on a fourteen-minute article that
 * tells a reader how much is left before they have scrolled far enough to find
 * out for themselves.
 *
 * The track ships in the markup rather than being built here: it is a single
 * empty fixed element with a transparent background, so a reader without JS
 * sees nothing at all rather than an inert grey line. (The consent banner is
 * built in script for the opposite reason — its buttons imply a choice was
 * recorded, so a dead one is worse than none.)
 *
 * ---------------------------------------------------------------------------
 *
 * The popup is here, and not left to the template, because the template's own
 * trigger has never fired.
 *
 * `post-shell.html` carries this, all on one line — the newlines went when the
 * shell was captured:
 *
 *     window.addEventListener("scroll", function () { // Never show again
 *     after submission if (popupSubmitted || popupOpened) return; const
 *     scrollTop = … if (scrolledPercent >= 25) { popupOpened = true;
 *     openPopup(); } });
 *
 * That `//` runs to the end of the line, and the end of the line is `});` — so
 * the whole handler is a comment. The listener registers, does nothing, and
 * costs a scroll event for it. On every post, since the shell was generated.
 * `ArticleLayout` still retunes that snippet's 25 to 40 so the two agree if it
 * is ever regenerated with its newlines intact, but the depth that actually
 * opens the modal is the one below.
 *
 * Both read the same ratio:
 *
 *     scrollTop / (scrollHeight - innerHeight)
 *
 * which is what ties the popup to the bar. 40% is where the reader watches the
 * orange reach — not some other measure of the same page.
 */
(function () {
  var POPUP_AT = 0.4;

  /* The key the template's snippet reads, so the two agree about a visitor who
     has already given us their email. */
  var SUBMITTED_KEY = 'popupSubmitted';

  var fill = document.querySelector('.wp-read-progress__fill');
  var queued = false;
  var popupDone = false;

  function ratio() {
    var doc = document.documentElement;
    // A post short enough to fit the viewport has nothing to be part-way
    // through, and dividing by that zero would put the bar at NaN.
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    var p = (window.scrollY || doc.scrollTop || 0) / scrollable;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  /* Private mode throws on the whole storage object, not just on write. */
  function submitted() {
    try {
      return window.sessionStorage.getItem(SUBMITTED_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function maybeOpen(p) {
    if (popupDone || p < POPUP_AT) return;
    popupDone = true;
    // `openPopup` is the template's own opener for the template's own modal;
    // it is defined inline in the post, above this file.
    if (submitted() || typeof window.openPopup !== 'function') return;
    window.openPopup();
  }

  function paint() {
    queued = false;
    var p = ratio();
    // scaleX, not width: a transform is composited, so this costs no layout on
    // a handler that runs for every frame of every scroll.
    if (fill) fill.style.transform = 'scaleX(' + p + ')';
    maybeOpen(p);
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  /*
   * Posts grow after load — lazy images and YouTube embeds land, and each one
   * makes the page taller under a reader who has not moved. Without this the
   * bar keeps showing a fraction of a document that no longer exists, and reads
   * too far along on exactly the image-heavy posts where it matters most.
   */
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);

  paint();

  /*
   * Do not ask a second time for something already given.
   *
   * `hubspot-forms.js` fires `gform_confirmation_loaded` with the form id on
   * `detail` once a lead is captured — the id arrives as a string. Form 15 is
   * this modal. The flag is the session's, so the next post the visitor opens
   * does not put the same form in front of them again.
   */
  document.addEventListener('gform_confirmation_loaded', function (event) {
    if (!event.detail || String(event.detail.formId) !== '15') return;
    try {
      window.sessionStorage.setItem(SUBMITTED_KEY, 'true');
    } catch (e) {
      /* Private mode. The modal shows again next page; nothing else breaks. */
    }
    /* The modal stays open: `hubspot-forms.js` has just replaced the form with
       the thank-you, and closing it here would take that away in the same
       frame it appeared. The reader dismisses it. */
  });

  /*
   * The template's "Get Started" button, wired to the modal that ships beside
   * it.
   *
   * The extracted page script binds `.get-started` to a handler that opens
   * `#emailPopup-1` — the id the *marketing* pages' modal carries. The single
   * post template's is `#emailPopup`, so on every post that handler found
   * nothing and returned, having already called preventDefault: a dead click,
   * silently, in the same shape as the bug that put the modal in WpLayout.
   */
  document.querySelectorAll('.get-started').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      if (typeof window.openPopup !== 'function') return;
      event.preventDefault();
      window.openPopup();
    });
  });
})();
