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
 * The library costs about 240KB across `publisher.js` and the three
 * `boq-subscribewithgoogle` chunks it pulls, and almost no reader presses the
 * button. Loading it *on the press* was tried and abandoned, for a good reason
 * worth keeping written down: the overlay is a popup, and a popup opened from a
 * callback that resolves after a network fetch has lost the user gesture that
 * gets it past the blocker.
 *
 * So it is deferred to the first sign of a reader instead — the first pointer,
 * key, touch or scroll anywhere on the page. That is not the press, so the
 * gesture is intact when the press comes; it is simply always earlier. A reader
 * whose very first action is clicking this button gets the fallback below,
 * which is the same thing they got when the library was blocked.
 *
 * There is deliberately no idle-time fallback. One was tried, and it defeated
 * the point: `requestIdleCallback` fires about a second after load, so the
 * 240KB landed inside the window that decides Time to Interactive and the page
 * paid for it anyway. A reader who never touches the page never reaches this
 * button either — and reaching it means scrolling, which is the event below.
 * Before this it loaded with the page, and 240KB of third-party script on a
 * phone was paid by every visitor for a feature a handful use.
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

  var requested = false;

  function loadLibrary() {
    if (requested) return;
    requested = true;
    for (var j = 0; j < EVENTS.length; j++) {
      window.removeEventListener(EVENTS[j], loadLibrary, LISTEN);
    }
    var script = document.createElement('script');
    script.async = true;
    script.setAttribute('preferred-sources-control', 'manual');
    script.src = 'https://news.google.com/swg/js/v1/publisher.js';
    document.head.appendChild(script);
  }

  var EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  var LISTEN = { passive: true, once: false };
  for (var k = 0; k < EVENTS.length; k++) {
    window.addEventListener(EVENTS[k], loadLibrary, LISTEN);
  }


  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (event) {
      // Not ready: let the anchor do what it always did, and start the
      // fetch so a second press gets the overlay.
      if (!api) { loadLibrary(); return; }
      event.preventDefault();
      api.addPreferredSource();
    });
  }
})();
