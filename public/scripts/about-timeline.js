/**
 * The "Our Journey" rail on /about-us/.
 *
 * Fills the timeline's rail as the section is read and lights each milestone
 * as it is passed. The stylesheet defaults the fill to 100%, so if this never
 * runs the section is finished rather than empty — the failure mode of a
 * scroll effect should not be a blank line down the page.
 *
 * This replaced snippet 6 of `/scripts/page/about-us.js`, which slid a
 * 4404-unit SVG across a pinned window and re-measured the drawing on every
 * frame. Nothing here measures during a scroll: the rail's geometry is read
 * once per resize and cached, and a scroll frame only does arithmetic.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-sp-timeline]');
  if (!root) return;

  var rail = root.querySelector('.sp-timeline__rail');
  var items = Array.prototype.slice.call(root.querySelectorAll('.sp-timeline__item'));
  if (!rail || !items.length) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // The stylesheet already leaves the rail full; just settle the milestones.
    items.forEach(function (el) { el.classList.add('is-reached'); });
    return;
  }

  /**
   * Where down the window a milestone counts as reached. Two thirds rather
   * than the middle: at the middle the year under the reader's eye is still
   * unlit, which reads as the effect lagging behind the scroll.
   */
  var MARK = 0.66;

  /* Page-relative geometry, cached. Recomputed on resize, and after the fonts
     land — a webfont swap moves everything below it and would otherwise leave
     these offsets describing the previous layout. */
  var railTop = 0;
  var railHeight = 1;
  var dotOffsets = [];
  var itemTops = [];

  function measure() {
    var scrollY = window.pageYOffset;
    var box = rail.getBoundingClientRect();
    railTop = box.top + scrollY;
    railHeight = box.height || 1;
    dotOffsets = items.map(function (el) {
      var dot = el.querySelector('.sp-timeline__dot');
      var r = (dot || el).getBoundingClientRect();
      return r.top + scrollY + r.height / 2;
    });
    itemTops = items.map(function (el) {
      return el.getBoundingClientRect().top + scrollY;
    });
  }

  var ticking = false;

  function update() {
    ticking = false;
    var mark = window.pageYOffset + window.innerHeight * MARK;

    var progress = (mark - railTop) / railHeight;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    root.style.setProperty('--sp-timeline-progress', (progress * 100).toFixed(2) + '%');

    /* The milestone the reading line is inside. Past the last one it stays on
       the last rather than going out: the reader is still looking at it. */
    var active = -1;
    for (var i = 0; i < items.length; i++) {
      if (mark >= itemTops[i]) active = i;
    }

    for (var j = 0; j < items.length; j++) {
      items[j].classList.toggle('is-reached', mark >= dotOffsets[j]);
      items[j].classList.toggle('is-active', j === active);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function remeasure() {
    measure();
    update();
  }

  measure();
  update();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
})();
