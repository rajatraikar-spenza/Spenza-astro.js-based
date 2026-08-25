/**
 * The cookie consent banner.
 *
 * UI only. The decision itself, its storage and what it gates all live in the
 * inline block `src/components/Analytics.astro` emits, which runs before this
 * file is even fetched — so a returning visitor who accepted is already being
 * recorded by the time this loads, and one who declined is not, whether or not
 * this ever arrives.
 *
 * That split is deliberate: the gate has to be inline and tiny because it is on
 * the critical path of every page; the banner is only needed on the one visit
 * where the question is open, so it is deferred and cached like the rest of
 * `/scripts/`.
 *
 * Built here rather than shipped in the markup for two reasons. It must not
 * exist without JavaScript — a banner whose buttons do nothing is worse than no
 * banner, because it implies a choice was recorded. And it is chrome, so the
 * alternative is the same block of markup copied into three layouts.
 */
(function () {
  'use strict';

  var consent = window.spenzaConsent;
  if (!consent) return;

  var TEXT = 'We use cookies to see how visitors use this site, so we can make it better. ' +
             'Analytics stay switched off unless you accept.';
  var PRIVACY = '/privacy-policy/';

  var banner = null;

  /**
   * The footer's legal row — "Privacy Policy", "Terms of Service". The widget
   * id is Elementor's and belongs to the mirrored footer partial; the class
   * selector is the fallback for a footer that gets rebuilt without it.
   */
  var LEGAL_ROW = '.elementor-element-a22a6db .elementor-icon-list-items, ' +
                  'footer .footer-list .elementor-icon-list-items';

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function close() {
    if (!banner) return;
    banner.remove();
    banner = null;
    document.body.classList.remove('spz-consent-open');
  }

  function answer(grant) {
    close();
    // `deny` may reload the page when Clarity is already running, so nothing
    // below it can be relied on to happen.
    if (grant) consent.grant(); else consent.deny();
  }

  function open() {
    if (banner) return;

    banner = el('div', 'spz-consent');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    var text = el('p', 'spz-consent__text');
    text.appendChild(document.createTextNode(TEXT + ' '));
    var link = el('a', null, 'Privacy Policy');
    link.href = PRIVACY;
    text.appendChild(link);
    text.appendChild(document.createTextNode('.'));

    var actions = el('div', 'spz-consent__actions');
    var reject = el('button', 'spz-consent__btn spz-consent__btn--reject', 'Reject');
    var accept = el('button', 'spz-consent__btn spz-consent__btn--accept', 'Accept');
    reject.type = 'button';
    accept.type = 'button';
    reject.addEventListener('click', function () { answer(false); });
    accept.addEventListener('click', function () { answer(true); });

    // Reject first in the DOM as well as on screen: it is the option that
    // changes nothing, and it should not be the one you reach past.
    actions.appendChild(reject);
    actions.appendChild(accept);
    banner.appendChild(text);
    banner.appendChild(actions);

    /*
     * First child of `<body>`, not appended.
     *
     * The banner is `position: fixed`, so where it sits in the DOM decides
     * nothing about where it is painted — but it decides everything about tab
     * order. Appended, a keyboard visitor would reach the cookie question after
     * the entire page and its footer. There is no focus trap and focus is not
     * stolen: the banner does not block the page, so taking the caret out of
     * whatever the visitor was doing would be its own small rudeness.
     */
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.classList.add('spz-consent-open');
  }

  /**
   * A way back to the question, for anyone who wants to change their mind —
   * which consent that cannot be withdrawn as easily as it was given is not.
   * Added to the footer's legal row so it sits with the privacy policy, and
   * added at runtime because a control that needs this script to work should
   * not be in the markup when this script is absent.
   */
  function addReopen() {
    var row = document.querySelector(LEGAL_ROW);
    if (!row) return;

    var sibling = row.querySelector('.elementor-icon-list-item');
    var item = el('li', sibling ? sibling.className : 'elementor-icon-list-item');

    var button = el('button', 'spz-consent-reopen', 'Cookie Settings');
    button.type = 'button';
    button.addEventListener('click', open);

    // Match whatever wrapper the row's own links put their label in, so the
    // mirrored typography applies to this one too.
    var label = el('span', 'elementor-icon-list-text');
    label.appendChild(button);
    item.appendChild(label);
    row.appendChild(item);
  }

  function init() {
    if (!consent.state()) open();
    addReopen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
