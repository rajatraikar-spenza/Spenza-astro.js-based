/**
 * The cookie notice.
 *
 * A notice, not a consent gate. Analytics on this site — GA4 and Microsoft
 * Clarity — load on page open for everyone, and nothing the visitor does here
 * changes that. So this bar informs and dismisses: one button, no Accept, no
 * Reject.
 *
 * That shape is deliberate. A "Reject" wired to nothing is worse than no button
 * at all, because it tells the visitor a choice was recorded when none was. If
 * analytics ever become optional again, the two buttons come back together with
 * the gate in `src/components/Analytics.astro` — not before.
 *
 * UI only. The tags themselves are started by the inline block that component
 * emits, which runs long before this file is fetched, so the visit is measured
 * whether or not this ever arrives.
 *
 * Built here rather than shipped in the markup because it is chrome, and the
 * alternative is the same block copied into three layouts.
 */
(function () {
  'use strict';

  var notice = window.spenzaNotice;
  if (!notice) return;

  var TEXT = 'We use cookies and analytics to understand how visitors use this site. ' +
             'By continuing to browse, you agree to this — see our ';
  var PRIVACY = '/privacy-policy/';

  var banner = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function dismiss() {
    if (banner) {
      banner.remove();
      banner = null;
    }
    notice.acknowledge();
  }

  function open() {
    if (banner) return;

    banner = el('div', 'spz-consent');
    // `region`, not `dialog`: it asks nothing and traps nothing, and a dialog
    // role promises a screen reader an interaction that is not there.
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie notice');

    var text = el('p', 'spz-consent__text');
    text.appendChild(document.createTextNode(TEXT));
    var link = el('a', null, 'Privacy Policy');
    link.href = PRIVACY;
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));

    var actions = el('div', 'spz-consent__actions');
    var ok = el('button', 'spz-consent__btn spz-consent__btn--accept', 'Got it');
    ok.type = 'button';
    ok.addEventListener('click', dismiss);
    actions.appendChild(ok);

    banner.appendChild(text);
    banner.appendChild(actions);

    /*
     * First child of `<body>`, not appended.
     *
     * The bar is `position: fixed`, so where it sits in the DOM decides nothing
     * about where it is painted — but it decides everything about tab order.
     * Appended, a keyboard visitor would reach it after the entire page and its
     * footer. Focus is not stolen: the bar does not block the page, so taking
     * the caret out of whatever the visitor was doing would be its own small
     * rudeness.
     */
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function init() {
    if (!notice.seen()) open();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
