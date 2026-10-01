/* The site navbar's behaviour (components/SiteNav.astro).
   Full-width bar → floating pill on scroll, hover/click mega-menus, and the
   mobile drawer. State lives on the `.sn` root: `is-scrolled`, `is-menu-open`. */
(function () {
  const root = document.querySelector('[data-site-nav]');
  if (!root) return;

  const shell = root.querySelector('.sn-shell');
  const sheet = root.querySelector('.sn-sheet');
  const sin = root.querySelector('.sn-sheet-in');
  const paneEls = [...root.querySelectorAll('.sn-pane')];
  const trigs = [...root.querySelectorAll('.sn-links [data-open]')];
  const burger = root.querySelector('.sn-burger');
  const narrow = () => innerWidth <= 880;
  let cur = null, timer = null, lastPointer = 'mouse';
  document.addEventListener('pointerdown', e => { lastPointer = e.pointerType || 'mouse'; }, true);

  const fit = () => { if (cur) sheet.style.height = sin.offsetHeight + 'px'; };

  function setBurger(isOpen) {
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    burger.querySelector('.sn-l1').setAttribute('d', isOpen ? 'M5 5l10 10' : 'M3 7h14');
    burger.querySelector('.sn-l2').setAttribute('d', isOpen ? 'M15 5 5 15' : 'M3 13h14');
  }

  function open(name) {
    if (cur === name) return;
    const was = cur;
    paneEls.forEach(p => p.classList.toggle('is-on', p.dataset.pane === name));
    const p = paneEls.find(x => x.dataset.pane === name);
    // The stack builds from the network up each time it is shown.
    if (name === 'platform' || name === 'mobile') {
      p.classList.remove('is-build'); void p.offsetWidth; p.classList.add('is-build');
    }
    cur = name;
    trigs.forEach(b => b.setAttribute('aria-expanded', String(b.dataset.open === name)));
    setBurger(name === 'mobile');
    // Opening from closed: no height animation, only the fade; switching
    // between menus: the card resizes smoothly to the new pane.
    if (!was) sheet.classList.add('is-instant');
    shell.classList.add('is-open');
    root.classList.add('is-menu-open');
    sheet.style.height = sin.offsetHeight + 'px';
    if (!was) requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.remove('is-instant')));
  }

  function close() {
    if (!cur) return;
    cur = null;
    shell.classList.remove('is-open');
    root.classList.remove('is-menu-open');
    trigs.forEach(b => b.setAttribute('aria-expanded', 'false'));
    setBurger(false);
  }

  trigs.forEach(b => {
    b.addEventListener('mouseenter', () => {
      if (narrow()) return;
      clearTimeout(timer);
      timer = setTimeout(() => open(b.dataset.open), cur ? 0 : 80);
    });
    b.addEventListener('click', e => {
      clearTimeout(timer);
      // Keyboard and touch toggle; a mouse click just opens (hover already did).
      const toggle = e.detail === 0 || lastPointer !== 'mouse';
      if (toggle && cur === b.dataset.open) close(); else open(b.dataset.open);
    });
  });
  shell.addEventListener('mouseenter', () => { if (!narrow() && cur !== 'mobile') clearTimeout(timer); });
  shell.addEventListener('mouseleave', () => {
    if (narrow() || cur === 'mobile') return;
    clearTimeout(timer);
    timer = setTimeout(close, 200);
  });
  burger.addEventListener('click', () => { cur === 'mobile' ? close() : open('mobile'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cur) {
      const b = cur === 'mobile' ? burger : trigs.find(x => x.dataset.open === cur);
      close();
      b && b.focus();
    }
  });
  shell.addEventListener('focusout', e => { if (e.relatedTarget && !shell.contains(e.relatedTarget)) close(); });
  document.addEventListener('click', e => { if (cur && !shell.contains(e.target)) close(); });
  sheet.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  root.querySelectorAll('.sn-pane[data-pane="mobile"] details').forEach(d => d.addEventListener('toggle', fit));

  /* hover a layer to see its hub */
  const layers = [...root.querySelectorAll('.sn-pane[data-pane="platform"] .sn-layer')];
  const details = [...root.querySelectorAll('.sn-pane[data-pane="platform"] .sn-hub-detail')];
  let hub = 'telecom';
  layers.forEach(el => {
    const act = () => {
      if (hub === el.dataset.hub) return;
      hub = el.dataset.hub;
      layers.forEach(x => x.classList.toggle('is-on', x === el));
      details.forEach(d => { d.hidden = d.dataset.hub !== hub; });
      fit();
    };
    el.addEventListener('mouseenter', act);
    el.addEventListener('focus', act);
  });

  /* full width → pill
     Two thresholds (shrink past 64px, expand below 24px) stop the bar
     flickering between states when the scroll rests near the switch point. */
  const ENTER = 64, EXIT = 24;
  let sc = false, ticking = false;
  const check = () => {
    const y = window.scrollY;
    const s = sc ? y > EXIT : y > ENTER;
    if (s === sc) return;
    sc = s;
    root.classList.toggle('is-scrolled', s);
    close();
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; check(); });
  }, { passive: true });
  check();

  /* crossing the mobile breakpoint closes any open menu */
  let wasNarrow = narrow();
  addEventListener('resize', () => {
    const n = narrow();
    if (n !== wasNarrow) { wasNarrow = n; close(); } else fit();
  });
})();
