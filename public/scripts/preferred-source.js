/**
 * The "Make us a preferred source on Google" button, upgraded to Google's own
 * overlay.
 *
 * Left alone, the button is a link to `google.com/preferences/source?q=…`: it
 * lands the reader on Google's full preferences page, in a new tab, and asks
 * them to find us there and add us. Google also publishes a one-step version —
 * `news.google.com/swg/js/v1/publisher.js` opens a small window reading "Add
 * Spenza as a Preferred Source" over a single Add button and nothing else. That
 * is what this wires up, and it is what the reader is actually being offered.
 *
 * `preferred-sources-control="manual"` is what stops the library prompting on
 * its own schedule; `addPreferredSource()` is then ours to call on the press.
 *
 * The library is loaded with the page rather than on demand, and it is 73KB
 * compressed. Deferring it until the button scrolls near — the obvious saving,
 * since most readers never press it — was tried and abandoned: the overlay is a
 * popup, and a popup opened from a callback that resolves after a network fetch
 * has lost the user gesture that gets it past the blocker. A button that
 * sometimes silently falls back to the old two-step page is worse than 73KB.
 *
 * It stays additive either way. If the library never arrives — blocked,
 * offline, or pressed before it lands — nothing calls `preventDefault` and the
 * anchor does exactly what it did before.
 */
(function () {
  var buttons = document.querySelectorAll('.spenza-preferred');
  if (!buttons.length) return;

  /** Google's API object, once its library hands it over. */
  var api = null;

  // The queue is drained by the library whenever it lands, so pushing before
  // the script exists is the documented order rather than a race.
  (self.PREFERRED_SOURCE = self.PREFERRED_SOURCE || []).push(function (ps) {
    ps.init({ theme: 'light', lang: 'en' });
    api = ps;
  });

  var script = document.createElement('script');
  script.async = true;
  script.setAttribute('preferred-sources-control', 'manual');
  script.src = 'https://news.google.com/swg/js/v1/publisher.js';
  document.head.appendChild(script);

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (event) {
      if (!api) return;
      event.preventDefault();
      api.addPreferredSource();
    });
  }
})();
