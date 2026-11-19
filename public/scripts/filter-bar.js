/* The blog / archive filter bar (see scripts/lib/filter-bar.mjs).

   The search box is always on the row. The category chips sit beside it while
   they fit; when they do not, they fold into a dropdown button. "Fit" is
   measured, not guessed from a breakpoint, so it stays right when a category
   is added, the font loads late or the window is resized. */
(function () {
  'use strict';

  var MIN_SEARCH = 240;   // the narrowest the search box is allowed to get beside the chips

  function init(bar) {
    var cats = bar.querySelector('.fb-cats');
    var toggle = bar.querySelector('.fb-toggle');
    var list = bar.querySelector('.fb-list');
    if (!cats || !toggle || !list) return;

    function setOpen(open) {
      bar.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function measure() {
      setOpen(false);
      bar.classList.remove('is-collapsed');
      var cs = getComputedStyle(bar);
      var inner = bar.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var gap = parseFloat(cs.columnGap) || 0;
      var need = list.scrollWidth;
      bar.classList.toggle('is-collapsed', need + gap + MIN_SEARCH > inner);
      bar.classList.add('is-ready');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!bar.classList.contains('is-open'));
    });
    document.addEventListener('click', function (e) {
      if (!bar.contains(e.target)) setOpen(false);
    });
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bar.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    bar.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !bar.contains(e.relatedTarget)) setOpen(false);
    });

    measure();
    if (window.ResizeObserver) {
      var last = bar.clientWidth;
      new ResizeObserver(function () {
        if (bar.clientWidth !== last) { last = bar.clientWidth; measure(); }
      }).observe(bar);
    } else {
      window.addEventListener('resize', measure);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('load', measure);
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-filter-bar]'), init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
