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
  const MOBILE_BREAKPOINT = 767;

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /**
   * The viewport width, read once and kept.
   *
   * Asking the window for its width is a layout-forcing read: doing it after anything
   * has touched the DOM makes the browser stop and recompute layout before it
   * answers. The menu and the responsive-config lookup below ask on every call,
   * once per widget per property, and Lighthouse attributed 162ms of forced
   * synchronous layout to that one line — on the main thread, during load,
   * which is exactly where it hurts. Nothing here needs a fresher answer than
   * the last resize.
   */
  let viewportWidth = window.innerWidth;
  on(window, 'resize', () => { viewportWidth = window.innerWidth; }, { passive: true });
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
      const isMobile = () => viewportWidth <= TABLET_BREAKPOINT;

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

      // `content_width: full_width` is Elementor's page-wide mega menu. Its
      // runtime stretches the panel track; anything else keeps the panel at the
      // widget's own width and has to be aligned under the item that opened it.
      const settings = safeJson(widget.getAttribute('data-settings'));
      const isStretched = settings?.content_width === 'full_width';

      const stretchAll = () => {
        if (!isStretched || isMobile()) return;
        items.forEach(item => stretchMenuPanel(item.querySelector('.e-n-menu-content')));
      };

      const open = item => {
        const p = panelsOf(item);
        closeAll(p?.panel);
        setState(item, true);
        if (!p || isMobile()) return;
        // Measure after the panel is displayed.
        if (isStretched) stretchMenuPanel(p.panel.closest('.e-n-menu-content'));
        else positionMenuPanel(item, p.panel);
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
          // Stacked panels must not keep a desktop offset or stretch.
          items.forEach(item => {
            const p = panelsOf(item);
            const inner = p?.panel.matches('.e-con') ? p.panel : p?.panel.querySelector('.e-con');
            if (inner) inner.style.marginInlineStart = '';
            clearMenuStretch(item.querySelector('.e-n-menu-content'));
          });
        } else {
          nav.removeAttribute('data-layout');
          toggle?.setAttribute('aria-expanded', 'false');
          closeAll();
          stretchAll();
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

  /* --------------------------------------------------------- classic menus */

  /**
   * Elementor's *classic* nav-menu widget — a different widget from the nested
   * menu above, and the one behind the blog's category filter bar ("All, BYOD,
   * eSIM, IoT, MVNO…").
   *
   * It ships two copies of the list: a horizontal one for desktop and a
   * dropdown for narrow screens, with a burger between them. Elementor's
   * runtime is what puts `elementor-active` on that burger; without it the
   * dropdown stayed clamped at `max-height: 0` forever, so on a phone the
   * filter bar was a hamburger that did nothing and there was no way to reach
   * a category at all. 202 mirrored pages carry one.
   *
   * The class contract is the widget's own, so the mirrored CSS animates it:
   *
   *   .elementor-menu-toggle:not(.elementor-active) + .elementor-nav-menu__container
   *     { max-height: 0; transform: scaleY(0) }
   *   .elementor-menu-toggle.elementor-active + .elementor-nav-menu__container
   *     { max-height: var(--menu-height); transform: scaleY(1) }
   */
  function initClassicMenus() {
    document.querySelectorAll('.elementor-widget-nav-menu').forEach(widget => {
      const toggle = widget.querySelector('.elementor-menu-toggle');
      const dropdown = widget.querySelector('.elementor-nav-menu--dropdown');
      if (!toggle || !dropdown) return;

      const setOpen = open => {
        toggle.classList.toggle('elementor-active', open);
        toggle.setAttribute('aria-expanded', String(open));
        dropdown.setAttribute('aria-hidden', String(!open));
        // The dropdown copy ships with its links taken out of the tab order,
        // which is correct only while it is shut.
        dropdown.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', open ? '0' : '-1'));

        if (!open) return;
        // `max-height` animates from the measured content height. Elementor's
        // fallback is 100vh, which on a short list makes the transition run
        // mostly through empty space.
        dropdown.style.setProperty('--menu-height', `${dropdown.scrollHeight}px`);
        positionDropdown(widget, dropdown);
      };

      const isOpen = () => toggle.classList.contains('elementor-active');

      on(toggle, 'click', e => {
        e.preventDefault();
        setOpen(!isOpen());
      });

      // The toggle is a div with `role="button"`, so it produces no synthetic
      // click of its own from the keyboard.
      on(toggle, 'keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        setOpen(!isOpen());
      });

      on(document, 'click', e => {
        if (isOpen() && !widget.contains(e.target)) setOpen(false);
      });

      on(document, 'keydown', e => {
        if (e.key === 'Escape' && isOpen()) setOpen(false);
      });

      // Past the widget's breakpoint the horizontal copy takes over and the
      // burger is hidden, so an open dropdown would be orphaned on screen.
      on(window, 'resize', debounce(() => {
        if (!isOpen()) return;
        if (getComputedStyle(toggle).display === 'none') setOpen(false);
        else positionDropdown(widget, dropdown);
      }, 150));

      setOpen(false);
    });
  }

  /** Widest a drill-down panel gets before it stops reading as a menu. */
  const DROPDOWN_MAX_WIDTH = 260;

  /**
   * `elementor-nav-menu--stretch` makes the dropdown `position: absolute` and
   * leaves Elementor's runtime to give it a position. Unset, an absolutely
   * positioned box shrinks to fit its widest item — a ragged panel hanging off
   * whatever edge the burger happens to sit on.
   *
   * Elementor's own answer is to span the whole container, which is right for
   * the desktop bar it was designed for but not for a phone: eight categories
   * across a full-bleed 390px strip read as a section of the page rather than
   * as a menu belonging to the button that opened it.
   *
   * So: a panel of at most `DROPDOWN_MAX_WIDTH`, hung from the burger's right
   * edge and clamped inside the container's padding box.
   */
  function positionDropdown(widget, dropdown) {
    if (!widget.classList.contains('elementor-nav-menu--stretch')) return;

    const anchor = dropdown.offsetParent || widget;
    const container = widget.closest('.e-con, .elementor-container, .elementor-section') || widget;
    const style = getComputedStyle(container);
    const box = container.getBoundingClientRect();

    // The container's padding box is as far as the panel may go either way.
    const limitLeft = box.left + (parseFloat(style.paddingLeft) || 0);
    const limitRight = box.right - (parseFloat(style.paddingRight) || 0);

    const width = Math.min(DROPDOWN_MAX_WIDTH, limitRight - limitLeft);
    const right = Math.min(widget.getBoundingClientRect().right, limitRight);
    const left = Math.max(limitLeft, right - width);

    const from = anchor.getBoundingClientRect();
    dropdown.style.left = `${Math.round(left - from.left)}px`;
    dropdown.style.width = `${Math.round(Math.min(width, limitRight - left))}px`;
  }

  /* -------------------------------------------------------- subscribe form */

  /**
   * The subscribe form is drawn as one pill: an email field joined to a
   * Subscribe button. On a phone the button took nearly half of it, so the
   * field could not show a whole address.
   *
   * The button's share is set by its `.gform_footer`, a flex item that will not
   * shrink below a 164px floor. Clearing that floor needs `min-width: 0`, and
   * the declaration has no effect from the stylesheet on this one element —
   * verified sitting in the served CSS, inside a media block that demonstrably
   * applies (its neighbouring declarations land), matching the element, and
   * still losing. Set on the element it holds, which is why it is here.
   *
   * The width itself stays in CSS; this only lifts the floor that was pinning
   * it.
   */
  function initSubscribeForms() {
    document.querySelectorAll('.eSim .gform_footer').forEach(footer => {
      footer.style.setProperty('min-width', '0', 'important');
    });
  }

  /* ------------------------------------------------------------ off-canvas */

  /**
   * Elementor Pro's off-canvas panel — which on this site *is* the mobile
   * navigation. The nested menu above is hidden below the tablet breakpoint;
   * everything narrower gets a hamburger that opens this panel instead.
   *
   * The hamburger is an icon widget whose href is one of Elementor's
   * `#elementor-action:` links: a base64 payload naming the widget to open.
   * Only Elementor's runtime knows how to read those, so on the mirror the
   * hamburger pointed at a fragment that does not exist. Tapping it did
   * nothing, on every page, which left phones with no navigation at all.
   *
   * The class contract below is the widget's own, so the mirrored CSS does the
   * work: `aria-hidden` drives visibility, `animated` plus an animate.css name
   * plays the entrance, `animated-reverse-wrapper` plays the exit, and
   * `e-off-canvas__no-scroll` locks the page behind the panel.
   */
  function initOffCanvas() {
    const open = new Set();
    const opener = new WeakMap();

    const find = id => {
      const el = document.getElementById(`off-canvas-${id}`);
      return el?.closest('.elementor-widget-off-canvas') ? el : null;
    };

    const entranceOf = panel => {
      const settings = safeJson(panel.closest('[data-settings]')?.dataset.settings) || {};
      // The panel only ever shows at tablet width and below, so the tablet
      // override is the one that applies.
      return settings.entrance_animation_tablet || settings.entrance_animation || 'none';
    };

    const show = panel => {
      if (open.has(panel)) return;
      open.add(panel);

      opener.set(panel, document.activeElement);
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');

      const main = panel.querySelector('.e-off-canvas__main');
      if (main) {
        const entrance = reduceMotion ? 'none' : entranceOf(panel);
        main.classList.remove('animated-reverse-wrapper');
        main.classList.add('animated', entrance);
        // Remembered so the exit can take exactly this class back off again.
        panel.dataset.shimEntrance = entrance;
      }
      document.body.classList.add('e-off-canvas__no-scroll');

      // Focus the first control so keyboard and screen-reader users land
      // inside the panel; `inert` on everything else is Elementor's own trap.
      panel.querySelector('a[href], button:not([disabled])')?.focus({ preventScroll: true });
    };

    const hide = panel => {
      if (!open.has(panel)) return;
      open.delete(panel);

      const main = panel.querySelector('.e-off-canvas__main');
      const settle = () => {
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('inert', '');
        if (main) {
          main.classList.remove('animated', 'animated-reverse-wrapper');
          if (panel.dataset.shimEntrance) main.classList.remove(panel.dataset.shimEntrance);
        }
        if (!open.size) document.body.classList.remove('e-off-canvas__no-scroll');
        // Return focus to whatever opened the panel, or the page would drop
        // the keyboard user back at the top of the document.
        const trigger = opener.get(panel);
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      };

      if (!main || reduceMotion) return settle();
      main.classList.add('animated-reverse-wrapper');
      setTimeout(settle, offCanvasDuration(panel));
    };

    // Elementor's action links, in both directions.
    on(document, 'click', event => {
      const link = event.target.closest?.('a[href*="elementor-action"]');
      if (!link) return;
      const action = parseElementorAction(link.getAttribute('href'));
      if (action?.name !== 'off_canvas') return;

      const panel = action.settings?.id && find(action.settings.id);
      if (!panel) return;

      event.preventDefault();
      action.mode === 'close' ? hide(panel) : show(panel);
    });

    // The overlay is the panel's own dismiss target.
    document.querySelectorAll('.e-off-canvas__overlay').forEach(overlay => {
      on(overlay, 'click', () => {
        const panel = overlay.closest('.e-off-canvas');
        if (panel) hide(panel);
      });
    });

    on(document, 'keydown', event => {
      if (event.key === 'Escape') [...open].forEach(hide);
    });

    // Growing past the breakpoint hides the hamburger, so an open panel would
    // be left covering a desktop layout with no way to dismiss it.
    on(window, 'resize', debounce(() => {
      if (viewportWidth > TABLET_BREAKPOINT) [...open].forEach(hide);
    }, 150));
  }

  /**
   * `#elementor-action%3Aaction%3Doff_canvas%3Aopen%26settings%3D<base64>`
   * decodes to `#elementor-action:action=off_canvas:open&settings=<base64>`,
   * and the payload is `{"id":"2c89149","displayMode":"open"}`.
   */
  function parseElementorAction(href) {
    let decoded;
    try { decoded = decodeURIComponent(href || ''); } catch { return null; }

    const match = /^#elementor-action:action=([\w-]+)(?::([\w-]+))?&settings=(.*)$/.exec(decoded);
    if (!match) return null;

    let settings = null;
    try { settings = JSON.parse(atob(match[3])); } catch { /* payload is not ours to read */ }
    return { name: match[1], mode: match[2] || settings?.displayMode || 'open', settings };
  }

  /** The widget's animation duration, so the exit is not cut short. */
  function offCanvasDuration(panel) {
    const raw = getComputedStyle(panel).getPropertyValue('--e-off-canvas-animation-duration').trim();
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) return 400;
    return raw.endsWith('ms') ? value : value * 1000;
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
    document.querySelectorAll('.swiper, .elementor-image-carousel-wrapper').forEach(node => {
      if (node.dataset.shimSwiper === 'true' || node.dataset.shimMarquee === 'true') return;
      if (!node.querySelector('.swiper-wrapper')) return;

      const widget = node.closest('[data-settings]');
      let cfg = {};
      try {
        cfg = JSON.parse(widget?.dataset.settings || '{}');
      } catch { /* widget has no usable settings; fall back to defaults */ }

      // Autoplay with no delay is Elementor's continuously scrolling logo
      // strip, not a slideshow. It is driven by CSS rather than Swiper — see
      // `setupMarquee` for why.
      if (cfg.autoplay === 'yes' && autoplayDelay(cfg) === 0) {
        node.dataset.shimMarquee = 'true';
        setupMarquee(node, cfg);
        return;
      }

      if (typeof window.Swiper !== 'function') return;
      node.dataset.shimSwiper = 'true';

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
        /*
         * Never `disableOnInteraction`, whatever the widget asks for.
         *
         * Elementor's `pause_on_interaction` maps onto that Swiper option, but
         * Swiper reads it far more broadly than the label suggests: in that
         * mode its mouseenter handler calls `autoplay.stop()` rather than
         * `pause()`, and mouseleave deliberately does nothing. One hover — or,
         * on touch, one emulated mouseenter from the first tap — killed the
         * carousel for the life of the page.
         *
         * Swiper's own `pauseOnMouseEnter` is no use either: `pause()` only
         * defers the next slide until the current transition ends, then
         * resumes on its own even while the pointer is still inside. So hover
         * is handled below with an explicit stop/start pair, which round-trips
         * cleanly.
         */
        options.autoplay = {
          delay: autoplayDelay(cfg),
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        };
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

      let swiper;
      try {
        swiper = new window.Swiper(node, options);
      } catch { /* a malformed carousel should not take down the page */ }

      if (swiper && options.autoplay && cfg.pause_on_hover === 'yes') {
        on(node, 'mouseenter', () => swiper.autoplay?.stop());
        on(node, 'mouseleave', () => swiper.autoplay?.start());
      }
    });
  }

  /**
   * Elementor writes `autoplay_speed: 0` — or omits it — for the continuously
   * scrolling logo strips, meaning "the slide never rests". `Number(x) ||
   * fallback` must not be used here: 0 is falsy, and collapsing it to a delay
   * makes the strip sit still, then jump.
   */
  function autoplayDelay(cfg) {
    const raw = cfg.autoplay_speed;
    if (raw === undefined || raw === null || raw === '') return 0;
    const delay = Number(raw);
    return Number.isFinite(delay) ? delay : 0;
  }

  /* ------------------------------------------------------------- marquees */

  /**
   * The continuously scrolling logo strips: "Trusted by Industry Leaders" and
   * the security-and-compliance badges on six other pages.
   *
   * These were Swiper carousels with a zero autoplay delay, and they carry
   * `pause_on_interaction: yes` — so they hit the stop-on-hover trap described
   * in `initCarousels` and never restarted. Stepping slide by slide was also
   * the wrong mechanism for a marquee: Swiper's loop rewind is a visible hitch
   * at each pass, and it cannot be paused reversibly.
   *
   * A CSS animation fixes both. It runs on the compositor, scrolls at a
   * constant velocity instead of per-slide, and `animation-play-state` makes
   * hover-pause exactly reversible — so a phone, which never leaves a hover
   * state, simply never stops.
   *
   * The track is rebuilt as two identical passes and translated by exactly one
   * pass, which lands on a frame indistinguishable from the start; that is
   * what makes the loop seamless.
   */
  function setupMarquee(node, cfg) {
    const track = node.querySelector('.swiper-wrapper');
    if (!track) return;

    const template = [...track.querySelectorAll(':scope > .swiper-slide')].map(el => {
      const clone = el.cloneNode(true);
      // Swiper's own loop duplicates, if a previous pass left any.
      clone.classList.remove('swiper-slide-duplicate', 'swiper-slide-active');
      clone.removeAttribute('style');
      return clone;
    });
    if (!template.length) return;

    node.classList.add('wp-marquee');
    if (cfg.pause_on_hover === 'yes') node.dataset.marqueePause = 'hover';
    // Elementor sets `dir="rtl"` on the strips that travel left to right.
    // Layout is forced back to `ltr` in CSS so the track always grows to the
    // right; the direction of travel comes from the animation instead.
    if (node.getAttribute('dir') === 'rtl') {
      track.style.setProperty('--wp-marquee-direction', 'reverse');
    }

    const build = () => {
      const viewport = node.clientWidth;
      if (!viewport) return;

      const per = Math.max(1, slidesPerView(cfg));
      const gap = slideSpacing(cfg);
      const step = Math.max(1, (viewport - gap * (per - 1)) / per) + gap;

      // One pass has to be at least a viewport wide, or translating by it
      // would expose the gap past the end of the second pass.
      const repeats = Math.max(1, Math.ceil(viewport / (step * template.length)));
      const pass = [];
      for (let i = 0; i < repeats; i++) template.forEach(el => pass.push(el.cloneNode(true)));

      const slides = pass.concat(
        pass.map(el => {
          const copy = el.cloneNode(true);
          // The second pass is the same logos again; a screen reader should
          // read them once, and they must not be tab stops.
          copy.setAttribute('aria-hidden', 'true');
          copy.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
          return copy;
        })
      );

      slides.forEach(el => {
        el.style.width = `${step - gap}px`;
        el.style.marginInlineEnd = `${gap}px`;
      });
      track.replaceChildren(...slides);

      // Elementor's `speed` is how long one slide takes to travel its own
      // width, so a pass of n slides takes n * speed — constant velocity
      // whatever the viewport.
      track.style.setProperty('--wp-marquee-distance', `${Math.round(step * pass.length)}px`);
      track.style.setProperty(
        '--wp-marquee-duration',
        `${Math.round((Number(cfg.speed) || 5000) * pass.length)}ms`
      );
    };

    // Width is the only input that matters, and rebuilding changes the track's
    // height but not the node's width, so this cannot feed itself.
    let lastWidth = 0;
    const rebuild = () => {
      const width = node.clientWidth;
      if (!width || width === lastWidth) return;
      lastWidth = width;
      build();
    };

    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(node);
    else on(window, 'resize', debounce(rebuild, 150));
    rebuild();
  }

  /** Elementor's responsive value chain: mobile falls back to tablet, tablet to desktop. */
  function responsive(cfg, key, parse) {
    const width = viewportWidth;
    const keys = width <= MOBILE_BREAKPOINT
      ? [`${key}_mobile`, `${key}_tablet`, key]
      : width <= TABLET_BREAKPOINT
        ? [`${key}_tablet`, key]
        : [key];
    for (const name of keys) {
      const value = parse(cfg[name]);
      if (value !== null) return value;
    }
    return null;
  }

  function slidesPerView(cfg) {
    const count = responsive(cfg, 'slides_to_show', raw => {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    });
    return count ?? 3;
  }

  function slideSpacing(cfg) {
    const gap = responsive(cfg, 'image_spacing_custom', raw => {
      // Elementor stores an unset responsive override as `{ size: "" }`.
      if (raw?.size === undefined || raw.size === '') return null;
      const n = Number(raw.size);
      return Number.isFinite(n) ? n : null;
    });
    return gap ?? 20;
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

  /**
   * Spectra (Ultimate Addons for Gutenberg) FAQ block.
   *
   * Every blog post ends in one of these, and it arrives collapsed: the block's
   * own CSS sets `.uagb-faq-child__outer-wrap .uagb-faq-content{display:none}`
   * and the plugin's frontend script is what opens it. That script is not part
   * of the mirror, so the questions were inert — clicking one did nothing.
   *
   * The class contract below is the plugin's own, which is what lets the CSS the
   * page already loads do the rest: `.uagb-faq-item-active` is what swaps the
   * plus glyph for the minus. Both behaviour flags live in the wrapper's class
   * list, written there by the editor.
   */
  function initFaqBlocks() {
    document.querySelectorAll('.uagb-faq__outer-wrap').forEach(block => {
      const items = [...block.querySelectorAll('.uagb-faq-child__outer-wrap')];
      if (!items.length) return;

      const closeOthers = block.classList.contains('uagb-faq-inactive-other-true');
      const expandFirst = block.classList.contains('uagb-faq-expand-first-true');

      const setOpen = (item, open, animate) => {
        const content = item.querySelector('.uagb-faq-content');
        if (!content) return;
        item.classList.toggle('uagb-faq-item-active', open);
        const button = item.querySelector('.uagb-faq-questions-button');
        if (button) button.setAttribute('aria-expanded', String(open));

        // Inline display beats the block's stylesheet rule, which is how the
        // plugin itself opens a panel.
        if (!animate) content.style.display = open ? 'block' : 'none';
        else if (open) expand(content);
        else collapse(content);
      };

      items.forEach((item, i) => {
        const button = item.querySelector('.uagb-faq-questions-button');
        if (!button) return;

        const toggle = () => {
          const open = item.classList.contains('uagb-faq-item-active');
          if (!open && closeOthers) {
            items.forEach(other => {
              if (other !== item && other.classList.contains('uagb-faq-item-active')) {
                setOpen(other, false, true);
              }
            });
          }
          setOpen(item, !open, true);
        };

        on(button, 'click', e => { e.preventDefault(); toggle(); });

        // The block puts `tabindex` on the item rather than the question, so the
        // item is what takes keyboard focus — and it is a div, so Enter and
        // Space produce no synthetic click of their own.
        on(item, 'keydown', e => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          toggle();
        });

        setOpen(item, expandFirst && i === 0, false);
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

  /* ------------------------------------------------------ table of contents */

  /**
   * Elementor's table-of-contents widget ships only a spinner: its runtime scans
   * the page for headings and builds the list client-side. Without that, every
   * blog post and case study shows a spinner that never resolves where the
   * "jump to section" sidebar should be.
   *
   * Build the same list against the same class contract the widget CSS expects,
   * and mirror how Elementor picks anchors — a heading's own `id` wins, so the
   * URLs the content already links to (`#Challenges`) keep working, and only
   * anchorless headings get a generated one keyed to their index.
   */
  function initTableOfContents() {
    const widgets = document.querySelectorAll('.elementor-widget-table-of-contents');
    if (!widgets.length) return;

    // The header sticks, so an anchor landing at y=0 sits underneath it.
    const header = document.querySelector('.elementor-location-header');
    const offset = Math.round(header?.getBoundingClientRect().height || 0) + 24;

    /**
     * Scroll explicitly, and animate it by hand.
     *
     * The theme makes `<body>` the scroll container (`overflow: hidden auto`),
     * and in that combination Chrome quietly ignores both `scrollIntoView()` and
     * `behavior: 'smooth'` — verified on the live site too, so this is the
     * site's own CSS rather than something the mirror introduced. Only an
     * instant scroll actually moves the page, so tween it ourselves rather than
     * hand the reader an abrupt jump.
     */
    let scrolling;
    const scrollToHeading = heading => {
      const to = Math.max(0, heading.getBoundingClientRect().top + window.scrollY - offset);
      const from = window.scrollY;
      const distance = to - from;

      cancelAnimationFrame(scrolling);
      // A hidden tab never runs animation frames, so the tween would stall
      // half-way and land the reader somewhere arbitrary when they come back.
      if (reduceMotion || document.hidden || !distance) {
        window.scrollTo({ top: to, behavior: 'instant' });
        return;
      }

      const duration = Math.min(700, Math.max(300, Math.abs(distance) * 0.35));
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        // easeInOutCubic — settles without overshooting on long jumps.
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo({ top: from + distance * eased, behavior: 'instant' });
        if (t < 1) scrolling = requestAnimationFrame(step);
      };
      scrolling = requestAnimationFrame(step);
    };

    widgets.forEach(widget => {
      const body = widget.querySelector('.elementor-toc__body');
      if (!body) return;

      const settings = safeJson(widget.getAttribute('data-settings')) || {};
      const tags = settings.headings_by_tags?.length
        ? settings.headings_by_tags
        : ['h2', 'h3', 'h4', 'h5', 'h6'];
      const excluded = (settings.exclude_headings_by_selector || []).filter(Boolean);

      const article = document.querySelector('.elementor-widget-theme-post-content');
      const deeper = articleSectionFallback(tags, article);
      const selector = deeper ? [...tags, deeper].join(',') : tags.join(',');

      // Page-wide, minus the widget's own heading: Elementor lists the related
      // articles and subscribe headings too, not just the article body.
      const headings = [...document.querySelectorAll(selector)].filter(h =>
        !h.closest('.elementor-widget-table-of-contents') &&
        h.textContent.trim() &&
        !excluded.some(sel => safeMatches(h, sel)) &&
        // The widened level counts inside the article only. Page-wide it would
        // also sweep up the summary-box cards and the related-post titles, which
        // are headings of the same rank but are not sections of the article.
        (tags.includes(h.tagName.toLowerCase()) || article.contains(h))
      );

      if (!headings.length) {
        body.textContent = settings.no_headings_message || 'No headings were found on this page.';
        return;
      }

      const list = document.createElement('ul');
      list.className = 'elementor-toc__list-wrapper';

      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `elementor-toc__heading-anchor-${index}`;
        heading.style.scrollMarginTop = `${offset}px`;

        const item = document.createElement('li');
        item.className = 'elementor-toc__list-item';
        const wrapper = document.createElement('div');
        wrapper.className = 'elementor-toc__list-item-text-wrapper';
        const link = document.createElement('a');
        link.className = 'elementor-toc__list-item-text';
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        on(link, 'click', e => {
          e.preventDefault();
          history.pushState(null, '', `#${heading.id}`);
          scrollToHeading(heading);
        });

        wrapper.append(link);
        item.append(wrapper);
        list.append(item);
      });

      body.replaceChildren(list);
    });

    // A hash in the URL was resolved before the generated anchors existed, so
    // send the page there once the list is built.
    const hash = location.hash.slice(1);
    const target = hash && document.getElementById(decodeURIComponent(hash));
    if (target) requestAnimationFrame(() => scrollToHeading(target));
  }

  function safeMatches(el, selector) {
    try { return el.matches(selector); } catch { return false; }
  }

  /**
   * A deliberate divergence from the live site.
   *
   * The widget is configured for `h2`, but a number of posts — the Angel Watch
   * case study among them — were written with their sections as `h3` or `h4`.
   * On those, the configured level matches nothing inside the article, so the
   * sidebar lists only the surrounding chrome ("Related Articles", the popup
   * heading) and the reader is left with no way to jump between sections. That
   * is how it behaves on WordPress too; it is still broken, so fix it here.
   *
   * Only widen where the configured level genuinely is not carrying sections:
   * if the article has its own headings at that level, nothing changes.
   */
  function articleSectionFallback(tags, article) {
    if (!article) return null;

    const sectionsAt = selector =>
      [...article.querySelectorAll(selector)].filter(h => h.textContent.trim()).length;

    if (sectionsAt(tags.join(',')) >= 2) return null;

    return ['h2', 'h3', 'h4', 'h5', 'h6']
      .find(tag => !tags.includes(tag) && sectionsAt(tag) >= 2) || null;
  }

  /* --------------------------------------------------------------- search */

  /**
   * Elementor Pro's search widget ships pre-hidden (`.e-search.hidden`, which the
   * widget CSS renders as `opacity:0;visibility:hidden`) and relies on its runtime
   * to reveal it once the handler is attached. Without that, the widget still
   * occupies its box but paints nothing — on the blog and archive filter bars that
   * reads as a blank white panel beside the category links.
   *
   * Reveal it. The live-results dropdown is an authenticated WP AJAX endpoint and
   * cannot be mirrored, so the form is left to submit normally.
   *
   * Elementor's clear button is not wired up: it is hidden in `wp-polish.css`
   * instead, so the only control in the field is the magnifier.
   */
  function initSearch() {
    document.querySelectorAll('.elementor-widget-search .e-search').forEach(widget => {
      widget.classList.remove('hidden');
    });
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
   * Elementor's full-width mega menu is driven entirely by CSS:
   *
   *   .e-n-menu-content { left: var(--stretch-left); right: var(--stretch-right);
   *                       width: var(--stretch-width); position: absolute }
   *
   * Its runtime measures the page and writes those three custom properties. We
   * do not ship that runtime, so they stayed unset and the panel collapsed back
   * to the menu widget's own box — a narrow panel hanging off the left edge of
   * whichever item opened it, instead of the page-wide bar the live site shows.
   *
   * Stretch to the document's content box, which is what Elementor measures
   * against, and let the panel's own boxed container centre itself inside it.
   */
  function stretchMenuPanel(track) {
    if (!track) return;
    // The track is absolutely positioned, so offsets are relative to whichever
    // ancestor establishes its containing block.
    const anchor = track.offsetParent || track.parentElement;
    if (!anchor) return;

    const page = document.body.getBoundingClientRect();
    const from = anchor.getBoundingClientRect();

    track.style.setProperty('--stretch-left', `${Math.round(page.left - from.left)}px`);
    track.style.setProperty('--stretch-right', 'auto');
    track.style.setProperty('--stretch-width', `${Math.round(page.width)}px`);
  }

  function clearMenuStretch(track) {
    if (!track) return;
    track.style.removeProperty('--stretch-left');
    track.style.removeProperty('--stretch-right');
    track.style.removeProperty('--stretch-width');
  }

  /**
   * Non-stretched menus keep the widget's own width, so their panel has to be
   * aligned under the item that opened it, clamped to stay inside the viewport.
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
    const maxOffset = viewportWidth - margin - innerWidth - trackLeft;
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
   *
   * Buttons awaiting `initContainerLazyload` are skipped: their background image
   * is suppressed by Elementor's lazy-load rule, so measuring them now would
   * misread a not-yet-painted gradient as no gradient and tag them for good.
   * The observer calls back into here once the container is marked loaded.
   */
  /**
   * Reads first, writes after.
   *
   * `getComputedStyle` is only cheap while nothing has invalidated style, and
   * adding a class in the same loop invalidates it for every button still to
   * come — so a page with a few dozen buttons recomputed style a few dozen
   * times. Collecting the matches and applying them in a second pass costs one
   * recalculation instead.
   */
  function fixInvisibleButtons(root = document) {
    const restore = [];

    root.querySelectorAll('.elementor-button').forEach(btn => {
      if (btn.closest('.e-con.e-parent:not(.e-lazyloaded):not(.e-no-lazyload)')) return;

      const cs = getComputedStyle(btn);
      const hasOwnBackground =
        cs.backgroundImage !== 'none' || !isTransparent(cs.backgroundColor);
      if (hasOwnBackground) return;

      const fg = parseRgb(cs.color);
      if (!fg) return;
      const bg = effectiveBackground(btn);
      if (contrast(fg, bg) >= 2) return;

      restore.push(btn);
    });

    for (const btn of restore) btn.classList.add('wp-btn-restored');
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

  /* ------------------------------------------------------- background lazy */

  /**
   * Elementor's background lazy-load, which the mirrored CSS relies on.
   *
   * Elementor ships a rule that blanks the background of every top-level
   * container from the fourth onwards until its runtime marks it loaded:
   *
   *   .e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload),
   *   .e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) *
   *     { background-image: none !important }
   *
   * Note the descendant `*`: without the `e-lazyloaded` class nothing below
   * those containers can paint a background image either. On posts that meant
   * the TL;DR panel lost its gradient and "Related <span>Articles</span>" — a
   * gradient clipped to the text — rendered transparent, i.e. invisible.
   *
   * `!important` beats every author rule, so the class is the only fix.
   */
  function initContainerLazyload() {
    const containers = document.querySelectorAll('.e-con.e-parent:not(.e-no-lazyload)');
    const load = el => {
      el.classList.add('e-lazyloaded');
      // Its buttons can be measured now that their backgrounds can paint.
      fixInvisibleButtons(el);
    };

    if (!('IntersectionObserver' in window)) {
      containers.forEach(load);
      return;
    }

    // Elementor's own margin: start painting a little before the container
    // scrolls in, so the background is never seen appearing.
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 400px 0px' });

    containers.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------- video */

  /**
   * Start autoplaying videos when they scroll into view, not on page load.
   *
   * Elementor emits `<video autoplay muted>` for its background videos, which
   * makes the browser fetch the file during initial load — 2.1MB competing with
   * the LCP image on five landing pages, for something usually below the fold.
   * The build rewrites `autoplay` to `data-wp-autoplay` so nothing starts on its
   * own, and this begins playback at the point it would first be seen.
   *
   * `play()` returns a promise that rejects when a browser declines to autoplay.
   * That is a normal outcome, not an error, so it is swallowed: the video simply
   * stays on its first frame, which is what it would have done anyway.
   */
  function initAutoplayVideos() {
    const videos = document.querySelectorAll('video[data-wp-autoplay]');
    if (!videos.length) return;

    const start = el => {
      el.preload = 'auto';
      el.muted = true;           // Required, or the play() promise rejects.
      const played = el.play();
      if (played && typeof played.catch === 'function') played.catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      videos.forEach(start);
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        start(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 200px 0px' });

    videos.forEach(el => io.observe(el));
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


  /* --------------------------------------------------------------- selects */

  /**
   * A themed dropdown around the form's native `<select>`.
   *
   * The list a `<select>` opens is drawn by the operating system: it cannot be
   * given the site's type, its rounded corners or its orange, so the control
   * always looked borrowed from somewhere else. This puts a listbox of our own
   * in front of it.
   *
   * The `<select>` itself stays in the DOM and stays the thing that submits —
   * every choice is written back to it and a `change` event dispatched, so
   * Gravity Forms and its validation see exactly what they saw before. It is
   * taken out of the tab order and hidden from assistive technology, because
   * the button and listbox in front of it carry the same role, state and
   * keyboard behaviour: arrows and Home/End to move, Enter to choose, Escape to
   * close, and type-ahead on first letters.
   *
   * Nothing runs on a page with no select on it, which is nearly all of them.
   */
  function initSelects() {
    document.querySelectorAll('select.gfield_select').forEach(enhanceSelect);
  }

  function enhanceSelect(select) {
    if (select.dataset.wpSelect === 'ready' || select.multiple) return;
    select.dataset.wpSelect = 'ready';

    const options = [...select.options];
    if (!options.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'wp-select';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wp-select__button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    // The visible label the field already has, so the button announces the same
    // question the sighted user is answering.
    const labelled = select.id && document.querySelector('label[for="' + CSS.escape(select.id) + '"]');
    if (labelled) {
      if (!labelled.id) labelled.id = select.id + '-label';
      button.setAttribute('aria-labelledby', labelled.id);
    }

    const value = document.createElement('span');
    value.className = 'wp-select__value';
    button.appendChild(value);
    wrap.appendChild(button);

    const list = document.createElement('ul');
    list.className = 'wp-select__list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    if (labelled && labelled.id) list.setAttribute('aria-labelledby', labelled.id);

    const items = options.map((option, i) => {
      const li = document.createElement('li');
      li.className = 'wp-select__option';
      li.setAttribute('role', 'option');
      li.id = (select.id || 'wp-select') + '-opt-' + i;
      li.dataset.value = option.value;
      li.textContent = option.text;
      list.appendChild(li);
      return li;
    });
    wrap.appendChild(list);

    let active = Math.max(0, select.selectedIndex);

    const isPlaceholder = () => select.value === '';

    function paint() {
      value.textContent = options[select.selectedIndex]?.text ?? '';
      wrap.classList.toggle('wp-select--empty', isPlaceholder());
      items.forEach((li, i) => {
        const chosen = i === select.selectedIndex;
        li.setAttribute('aria-selected', String(chosen));
        li.classList.toggle('is-selected', chosen);
        li.classList.toggle('is-active', i === active);
      });
    }

    function open() {
      if (!list.hidden) return;
      active = Math.max(0, select.selectedIndex);
      list.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      paint();
      items[active]?.scrollIntoView({ block: 'nearest' });
      list.setAttribute('aria-activedescendant', items[active]?.id ?? '');
    }

    function close(refocus) {
      if (list.hidden) return;
      list.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (refocus) button.focus();
    }

    function choose(i) {
      if (i < 0 || i >= options.length) return;
      select.selectedIndex = i;
      // What Gravity Forms and any conditional logic listen for.
      select.dispatchEvent(new Event('change', { bubbles: true }));
      active = i;
      paint();
      close(true);
    }

    function move(delta) {
      active = Math.min(options.length - 1, Math.max(0, active + delta));
      paint();
      items[active].scrollIntoView({ block: 'nearest' });
      list.setAttribute('aria-activedescendant', items[active].id);
    }

    on(button, 'click', () => (list.hidden ? open() : close(false)));

    on(button, 'keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
        list.focus();
      }
    });

    list.tabIndex = -1;

    on(list, 'keydown', e => {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); move(1); break;
        case 'ArrowUp': e.preventDefault(); move(-1); break;
        case 'Home': e.preventDefault(); active = 0; paint(); break;
        case 'End': e.preventDefault(); active = options.length - 1; paint(); break;
        case 'Enter':
        case ' ': e.preventDefault(); choose(active); break;
        case 'Escape': e.preventDefault(); close(true); break;
        case 'Tab': close(false); break;
        default:
          if (e.key.length === 1) {
            const from = active + 1;
            const found = options.findIndex((o, i) =>
              i >= from && o.text.toLowerCase().startsWith(e.key.toLowerCase()));
            const wrapped = found >= 0 ? found : options.findIndex(o =>
              o.text.toLowerCase().startsWith(e.key.toLowerCase()));
            if (wrapped >= 0) { active = wrapped; paint(); items[active].scrollIntoView({ block: 'nearest' }); }
          }
      }
    });

    items.forEach((li, i) => {
      on(li, 'click', () => choose(i));
      on(li, 'mousemove', () => { if (active !== i) { active = i; paint(); } });
    });

    on(document, 'click', e => { if (!wrap.contains(e.target)) close(false); });

    // The form can reset or be filled programmatically; keep the face in step.
    on(select, 'change', paint);

    paint();
  }


  /* ----------------------------------------------------------- lead modal */

  /**
   * The "Subscribe Now" button on a post.
   *
   * A post carries the same `.get-started` widget the marketing pages use and
   * the same lead-capture modal — the identical Gravity form, the identical
   * "Get Started with Spenza" copy — but under `#emailPopup` rather than
   * `#emailPopup-1`, and with nothing bound to the button. The modal was only
   * ever reachable by scrolling a quarter of the way down the article, which
   * opens it unasked; pressing the button that exists to ask for it did
   * nothing at all.
   *
   * Only the unbound case is handled here. Where `#emailPopup-1` is present
   * the page's own extracted script already binds `.get-started`, and binding
   * it a second time would be two handlers racing to set the same property.
   *
   * Opening by hand deliberately ignores the two guards the scroll trigger
   * respects — `popupOpened`, and the `popupSubmitted` flag in sessionStorage.
   * Those exist to stop the modal appearing uninvited twice, which is not a
   * reason to refuse someone who just pressed the button.
   *
   * Closing stays with the markup that owns it: the button's own
   * `onclick="closePopup()"` and the overlay's click-outside listener, both
   * defined alongside the modal in the post template.
   */
  function initSubscribeButtons() {
    if (document.querySelector('#emailPopup-1')) return;

    const overlay = document.querySelector('#emailPopup');
    if (!overlay) return;

    document.querySelectorAll('.get-started').forEach(widget => {
      const button = widget.querySelector('a.elementor-button') || widget;
      on(button, 'click', e => {
        e.preventDefault();
        overlay.style.display = 'flex';
      });
    });
  }

  ready(() => {
    initStickyHeader();
    initNestedMenus();
    initClassicMenus();
    initSubscribeForms();
    initOffCanvas();
    initCounters();
    initTabs();
    initAccordions();
    initFaqBlocks();
    initTableOfContents();
    initSearch();
    initSelects();
    initSubscribeButtons();
    initContainerLazyload();
    initAutoplayVideos();
    initReveal();
    fixInvisibleButtons();
    // Swiper is loaded with `defer`, so it may land after DOMContentLoaded.
    initCarousels();
    on(window, 'load', initCarousels);
  });
})();
