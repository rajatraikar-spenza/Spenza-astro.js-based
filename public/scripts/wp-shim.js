/**
 * Replaces Elementor's jQuery-based frontend runtime with a small vanilla shim.
 *
 * Elementor ships ~300KB of jQuery + frontend JS to drive a handful of
 * behaviours. The mirrored markup only uses nested menus, carousels, counters,
 * tabs and accordions, so those are reimplemented here against the same class
 * contracts the mirrored CSS expects (`.e-active`, `aria-expanded`, ...).
 *
 * Motion is deliberately a little smoother than stock Elementor: transitions
 * use an ease-out curve and everything is disabled under prefers-reduced-motion.
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TABLET_BREAKPOINT = 1024;

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const ready = fn =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  /* ---------------------------------------------------------------- menus */

  /**
   * Elementor nested menu. Desktop opens on hover (matching the widget's
   * `open_on: hover` setting); at or below the tablet breakpoint the nav
   * becomes a dropdown driven by the toggle button.
   */
  function initNestedMenus() {
    document.querySelectorAll('.elementor-widget-n-menu').forEach(widget => {
      const nav = widget.querySelector('.e-n-menu');
      if (!nav) return;

      const toggle = widget.querySelector('.e-n-menu-toggle');
      const wrapper = widget.querySelector('.e-n-menu-wrapper');
      const items = [...widget.querySelectorAll('.e-n-menu-item')];
      const isMobile = () => window.innerWidth <= TABLET_BREAKPOINT;

      const panelsOf = item => {
        const btn = item.querySelector('.e-n-menu-dropdown-icon');
        if (!btn) return null;
        const id = btn.getAttribute('aria-controls');
        const panel = id && widget.querySelector('#' + CSS.escape(id));
        return panel ? { btn, panel } : null;
      };

      // Two elements need `e-active`: the inner `.e-con` (which the display
      // rule keys off) and its `.e-n-menu-content` wrapper (which the
      // `top: 100%` positioning rule keys off). Setting only the first leaves
      // the panel overlapping the nav bar.
      const setState = (item, active) => {
        const p = panelsOf(item);
        if (!p) return;
        p.panel.classList.toggle('e-active', active);
        p.panel.closest('.e-n-menu-content')?.classList.toggle('e-active', active);
        p.btn.setAttribute('aria-expanded', String(active));
        item.querySelector('.e-n-menu-title')?.classList.toggle('e-active', active);
      };

      const closeAll = except => {
        items.forEach(item => {
          const p = panelsOf(item);
          if (!p || p.panel === except) return;
          setState(item, false);
        });
      };

      const open = item => {
        const p = panelsOf(item);
        closeAll(p?.panel);
        setState(item, true);
        // Position after the panel is displayed so it can be measured.
        if (p && !isMobile()) positionMenuPanel(item, p.panel);
      };

      const close = item => setState(item, false);

      // Hover intent: a short open delay stops the menu flickering as the
      // pointer crosses items, and a longer close delay forgives diagonal
      // travel down into the panel.
      let openTimer, closeTimer;
      items.forEach(item => {
        if (!panelsOf(item)) return;

        on(item, 'mouseenter', () => {
          if (isMobile()) return;
          clearTimeout(closeTimer);
          openTimer = setTimeout(() => open(item), 60);
        });
        on(item, 'mouseleave', () => {
          if (isMobile()) return;
          clearTimeout(openTimer);
          closeTimer = setTimeout(() => close(item), 180);
        });

        // Click drives the panel on touch/mobile, and is the keyboard path.
        const btn = item.querySelector('.e-n-menu-dropdown-icon');
        on(btn, 'click', e => {
          e.preventDefault();
          e.stopPropagation();
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          expanded ? close(item) : open(item);
        });
      });

      // Mobile: the widget CSS keys off data-layout="dropdown".
      const syncLayout = () => {
        if (isMobile()) {
          nav.setAttribute('data-layout', 'dropdown');
          // Stacked panels must not keep a desktop offset.
          items.forEach(item => {
            const p = panelsOf(item);
            const inner = p?.panel.matches('.e-con') ? p.panel : p?.panel.querySelector('.e-con');
            if (inner) inner.style.marginInlineStart = '';
          });
        } else {
          nav.removeAttribute('data-layout');
          toggle?.setAttribute('aria-expanded', 'false');
          closeAll();
        }
      };
      syncLayout();
      on(window, 'resize', debounce(syncLayout, 150));

      on(toggle, 'click', e => {
        e.preventDefault();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        if (expanded) closeAll();
      });

      // Dismiss on outside click and on Escape.
      on(document, 'click', e => {
        if (!widget.contains(e.target)) {
          closeAll();
          if (isMobile()) toggle?.setAttribute('aria-expanded', 'false');
        }
      });
      on(document, 'keydown', e => {
        if (e.key !== 'Escape') return;
        closeAll();
        toggle?.setAttribute('aria-expanded', 'false');
      });

      if (wrapper) wrapper.dataset.shimReady = 'true';
    });
  }

  /* ------------------------------------------------------------- counters */

  /** Animate `.elementor-counter` numbers when they scroll into view. */
  function initCounters() {
    const counters = document.querySelectorAll('.elementor-counter-number');
    if (!counters.length) return;

    const run = el => {
      const to = parseFloat(el.dataset.toValue ?? el.textContent) || 0;
      const from = parseFloat(el.dataset.fromValue) || 0;
      const duration = parseInt(el.dataset.duration, 10) || 2000;
      const decimals = parseInt(el.dataset.roundingDecimals ?? el.dataset.decimals, 10) || 0;
      const delimiter = el.dataset.delimiter ?? ',';

      if (reduceMotion) {
        el.textContent = format(to, decimals, delimiter);
        return;
      }

      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast start, long gentle settle.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = format(from + (to - from) * eased, decimals, delimiter);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    counters.forEach(el => io.observe(el));
  }

  function format(value, decimals, delimiter) {
    const fixed = Number(value).toFixed(decimals);
    const [int, frac] = fixed.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
    return frac ? `${grouped}.${frac}` : grouped;
  }

  /* ------------------------------------------------------------ carousels */

  /** Initialise every mirrored Elementor carousel with the bundled Swiper. */
  function initCarousels() {
    if (typeof window.Swiper !== 'function') return;

    document.querySelectorAll('.swiper, .elementor-image-carousel-wrapper').forEach(node => {
      if (node.dataset.shimSwiper === 'true') return;
      if (!node.querySelector('.swiper-wrapper')) return;
      node.dataset.shimSwiper = 'true';

      const widget = node.closest('[data-settings]');
      let cfg = {};
      try {
        cfg = JSON.parse(widget?.dataset.settings || '{}');
      } catch { /* widget has no usable settings; fall back to defaults */ }

      const perView = parseInt(cfg.slides_to_show, 10) || 3;
      const perViewTablet = parseInt(cfg.slides_to_show_tablet, 10) || Math.min(perView, 3);
      const perViewMobile = parseInt(cfg.slides_to_show_mobile, 10) || 1;
      const gap = cfg.image_spacing_custom?.size ?? 30;
      const loop = cfg.infinite !== 'no';

      const options = {
        slidesPerView: perViewMobile,
        spaceBetween: Number(gap) || 0,
        loop,
        speed: Number(cfg.speed) || 600,
        watchOverflow: true,
        breakpoints: {
          768: { slidesPerView: perViewTablet },
          1025: { slidesPerView: perView },
        },
        slidesPerGroup: parseInt(cfg.slides_to_scroll, 10) || 1,
      };

      if (cfg.autoplay === 'yes' && !reduceMotion) {
        // Elementor uses autoplay_speed 0 (or omits it) for the continuously
        // scrolling logo strips — the slide never rests, `speed` alone paces it.
        // `Number(x) || fallback` must not be used here: 0 is falsy, and
        // collapsing it to a delay makes the marquee sit still, then jump.
        const raw = cfg.autoplay_speed;
        const delay = raw === undefined || raw === null || raw === '' ? 0 : Number(raw);

        options.autoplay = {
          delay: Number.isFinite(delay) ? delay : 0,
          disableOnInteraction: cfg.pause_on_interaction === 'yes',
          pauseOnMouseEnter: cfg.pause_on_hover === 'yes',
        };

        // A zero-delay marquee must ease linearly or it visibly stutters at
        // each slide boundary.
        if (options.autoplay.delay === 0) {
          options.speed = Number(cfg.speed) || 5000;
          options.allowTouchMove = false;
          node.classList.add('wp-marquee');
        }
      }
      // Widgets disagree on how they flag controls: the image carousel uses
      // `navigation: arrows|dots|both`, the loop carousel uses `arrows: yes`.
      // Elementor only renders the control elements when they are enabled, so
      // bind to whatever is actually in the markup — and search the whole
      // widget, since the arrows are siblings of the .swiper element.
      const scope = widget || node;
      const next = scope.querySelector('.elementor-swiper-button-next, .swiper-button-next');
      const prev = scope.querySelector('.elementor-swiper-button-prev, .swiper-button-prev');
      if (next && prev) {
        options.navigation = { nextEl: next, prevEl: prev };
        next.setAttribute('role', 'button');
        prev.setAttribute('role', 'button');
        if (!next.hasAttribute('aria-label')) next.setAttribute('aria-label', 'Next slide');
        if (!prev.hasAttribute('aria-label')) prev.setAttribute('aria-label', 'Previous slide');
      }

      const pagination = scope.querySelector('.swiper-pagination');
      if (pagination) options.pagination = { el: pagination, clickable: true };

      // Keyboard and pointer control, which stock Elementor leaves off.
      options.keyboard = { enabled: true, onlyInViewport: true };
      options.grabCursor = true;
      options.a11y = { enabled: true };

      try {
        new window.Swiper(node, options);
      } catch { /* a malformed carousel should not take down the page */ }
    });
  }

  /* ------------------------------------------------------- tabs/accordions */

  /** Elementor nested tabs. */
  function initTabs() {
    document.querySelectorAll('.elementor-widget-n-tabs').forEach(widget => {
      const buttons = [...widget.querySelectorAll('.e-n-tab-title')];
      const panels = [...widget.querySelectorAll('.e-n-tabs-content > .e-con')];
      if (!buttons.length || !panels.length) return;

      const activate = index => {
        buttons.forEach((b, i) => {
          b.setAttribute('aria-selected', String(i === index));
          b.classList.toggle('e-active', i === index);
        });
        panels.forEach((p, i) => p.classList.toggle('e-active', i === index));
      };

      buttons.forEach((btn, i) => on(btn, 'click', e => { e.preventDefault(); activate(i); }));
    });
  }

  /** Essential Addons advanced accordion. */
  function initAccordions() {
    document.querySelectorAll('.eael-adv-accordion').forEach(acc => {
      const toggleAll = acc.dataset.toggleSpeed !== undefined;
      acc.querySelectorAll('.eael-accordion-list').forEach(item => {
        const header = item.querySelector('.eael-accordion-header');
        const content = item.querySelector('.eael-accordion-content');
        if (!header || !content) return;

        on(header, 'click', e => {
          e.preventDefault();
          const isOpen = header.classList.contains('active');

          if (!toggleAll) {
            acc.querySelectorAll('.eael-accordion-header.active').forEach(h => {
              if (h === header) return;
              h.classList.remove('active');
              const c = h.parentElement.querySelector('.eael-accordion-content');
              if (c) collapse(c);
            });
          }
          header.classList.toggle('active', !isOpen);
          isOpen ? collapse(content) : expand(content);
        });

        // Match the initial DOM state rather than assuming everything is shut.
        if (!header.classList.contains('active')) content.style.display = 'none';
      });
    });
  }

  function expand(el) {
    el.style.display = 'block';
    if (reduceMotion) return;
    const target = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    el.style.transition = 'height 320ms cubic-bezier(0.22, 1, 0.36, 1)';
    requestAnimationFrame(() => { el.style.height = target + 'px'; });
    setTimeout(() => { el.style.height = ''; el.style.overflow = ''; el.style.transition = ''; }, 340);
  }

  function collapse(el) {
    if (reduceMotion) { el.style.display = 'none'; return; }
    el.style.overflow = 'hidden';
    el.style.height = el.scrollHeight + 'px';
    el.style.transition = 'height 260ms cubic-bezier(0.22, 1, 0.36, 1)';
    requestAnimationFrame(() => { el.style.height = '0px'; });
    setTimeout(() => {
      el.style.display = 'none';
      el.style.height = '';
      el.style.overflow = '';
      el.style.transition = '';
    }, 280);
  }

  /* --------------------------------------------------------------- sticky */

  /**
   * The header container carries Elementor Pro's `sticky: "top"` setting, which
   * only works with Elementor's runtime. Reimplement it with `position: sticky`
   * — no fixed positioning, no spacer element, so nothing shifts on scroll.
   */
  function initStickyHeader() {
    const header = document.querySelector('.elementor-location-header');
    if (!header) return;

    header.classList.add('wp-sticky-header');

    // Elevate the header only once the page has actually moved, so the shadow
    // reads as a response to scrolling rather than a permanent border.
    //
    // Driven by a sentinel rather than scroll events: an observer reports the
    // true state regardless of how the scroll happened (wheel, keyboard,
    // scrollTo, anchor jump) and costs nothing while idle.
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      ([entry]) => header.classList.toggle('wp-header-scrolled', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* ---------------------------------------------------- dropdown position */

  /**
   * Elementor stretches the nested-menu panel across the full header width and
   * relies on its runtime to compute the offsets, which leaves the panel
   * floating out of line with the item that opened it. Align each panel's inner
   * box under its own trigger, clamped to stay inside the viewport.
   */
  function positionMenuPanel(item, panel) {
    const inner = panel.matches('.e-con') ? panel : panel.querySelector('.e-con');
    if (!inner) return;

    const title = item.querySelector('.e-n-menu-title');
    const track = panel.closest('.e-n-menu-content') || panel.parentElement;
    if (!title || !track) return;

    // Measure with any previous offset cleared, or offsets compound.
    inner.style.marginInlineStart = '0px';

    const trackLeft = track.getBoundingClientRect().left;
    const titleRect = title.getBoundingClientRect();
    const innerWidth = inner.getBoundingClientRect().width;
    const margin = 16;

    let offset = titleRect.left - trackLeft;
    const maxOffset = window.innerWidth - margin - innerWidth - trackLeft;
    offset = Math.max(margin - trackLeft, Math.min(offset, maxOffset));

    inner.style.marginInlineStart = `${Math.round(offset)}px`;
  }

  /* ------------------------------------------------------ contrast repair */

  /**
   * Some Elementor buttons declare near-white label text but end up with no
   * background at all, rendering white-on-white. The same happens on the live
   * WordPress site, so it is a content bug rather than a mirroring artefact.
   *
   * Detect it from computed styles (the affected buttons share no distinguishing
   * class with the healthy ones) and restore the brand gradient the page CSS
   * was trying to apply.
   */
  function fixInvisibleButtons() {
    document.querySelectorAll('.elementor-button').forEach(btn => {
      const cs = getComputedStyle(btn);
      const hasOwnBackground =
        cs.backgroundImage !== 'none' || !isTransparent(cs.backgroundColor);
      if (hasOwnBackground) return;

      const fg = parseRgb(cs.color);
      if (!fg) return;
      const bg = effectiveBackground(btn);
      if (contrast(fg, bg) >= 2) return;

      btn.classList.add('wp-btn-restored');
    });
  }

  function parseRgb(value) {
    const parts = (value || '').match(/-?[\d.]+/g);
    return parts && parts.length >= 3 ? parts.slice(0, 3).map(Number) : null;
  }

  function isTransparent(color) {
    const parts = (color || '').match(/-?[\d.]+/g);
    return !parts || (parts.length > 3 && Number(parts[3]) === 0);
  }

  /** Nearest painted background behind an element. */
  function effectiveBackground(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (!isTransparent(color)) {
        const parts = parseRgb(color);
        if (parts) return parts;
      }
      node = node.parentElement;
    }
    return [255, 255, 255];
  }

  function relativeLuminance([r, g, b]) {
    const channel = v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function contrast(fg, bg) {
    const a = relativeLuminance(fg);
    const b = relativeLuminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  /* --------------------------------------------------------------- reveal */

  /**
   * Elementor hides entrance-animated elements with `.elementor-invisible` and
   * relies on its runtime to un-hide them. Reveal them on scroll instead, and
   * apply the same treatment to top-level sections for a smoother page.
   */
  function initReveal() {
    document.querySelectorAll('.elementor-invisible').forEach(el => {
      if (reduceMotion) {
        el.classList.remove('elementor-invisible');
        return;
      }
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const settings = safeJson(entry.target.dataset.settings);
          const name = settings?.animation || settings?._animation;
          entry.target.classList.remove('elementor-invisible');
          if (name && name !== 'none') entry.target.classList.add('animated', name);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      io.observe(el);
    });
  }

  function safeJson(value) {
    try { return JSON.parse(value || 'null'); } catch { return null; }
  }

  /* ---------------------------------------------------------------- utils */

  function debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  ready(() => {
    initStickyHeader();
    initNestedMenus();
    initCounters();
    initTabs();
    initAccordions();
    initReveal();
    fixInvisibleButtons();
    // Swiper is loaded with `defer`, so it may land after DOMContentLoaded.
    initCarousels();
    on(window, 'load', initCarousels);
  });
})();
