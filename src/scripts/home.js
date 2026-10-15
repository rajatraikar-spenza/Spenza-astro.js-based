import './home-hero.js';

/**
 * The home page's behaviour.
 *
 *   - sections fade up as they scroll into view
 *   - the hero's cursor spotlight
 *   - the hero's customer stage (scripts/home-hero.js)
 *   - the "MVNO in a Box" animation in the Spenza advantage section
 *   - the platform hub tabs
 *   - the Alternatives board and the Customer proof carousel
 *
 * Everything here is progressive: without it the page is complete and static —
 * every section visible, the first tab of each set shown, the numbers already
 * at their values. The FAQ needs no script at all (see Faq.astro).
 */

const page = document.querySelector('.hm');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (page) {
  // Reveal. The hidden starting state is keyed off `.js`, so it only applies
  // once this has run and can promise to undo it.
  page.classList.add('js');
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  page.querySelectorAll('.hm-reveal').forEach(el => reveal.observe(el));

  // Idle: the page runs dozens of looping animations — the logo marquee, every
  // card illustration, the hero box — and a section scrolled out of view has no reason
  // to keep painting them. Each one is paused until it comes back.
  const idle = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('hm-idle', !entry.isIntersecting);
  }, { rootMargin: '200px 0px' });
  page.querySelectorAll(':scope > section').forEach(section => idle.observe(section));

  // Spotlight: a soft glow that follows the cursor across the hero.
  const hero = page.querySelector('.hm-hero');
  hero?.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const box = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${event.clientX - box.left}px`);
    hero.style.setProperty('--my', `${event.clientY - box.top}px`);
    hero.style.setProperty('--so', '1');
  });
  hero?.addEventListener('pointerleave', () => hero.style.setProperty('--so', '0'));
}

/* ------------------------------------------------------- advantage box */

// Clicking a layer never cuts the cycle short: the box finishes opening, the
// layer rises and holds, then it settles back and the box closes and the loop
// carries on. Hover and focus never pause it.
const art = document.querySelector('.hm-hero--platform .hm-hero-art');

if (art) {
  const wrap = art.querySelector('.hm-scene-wrap');
  const scene = art.querySelector('.hm-scene');
  const cap = document.getElementById('hero-caption');
  const rest = cap.textContent;
  const CAPS = {
    telecom: 'TelecomHub — multi-operator connectivity, one API.',
    control: 'ControlHub — every line, cost, and invoice in one view.',
    ux: 'UXHub — your plans, checkout, billing, and brand.',
    agent: 'AgentHub — real phone numbers for AI conversations.',
  };

  const fit = () => scene.style.setProperty('--scene-scale', String(wrap.clientWidth / 580));
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap); else addEventListener('resize', fit);

  /* Every piece runs one 20s cycle: shut until 8%, open by 25%, all tags in by
     28%, starting to close at 74%, shut again by 94%. */
  const D = 20000, SHUT_UNTIL = 1600, OPEN = 5600, CLOSE = 14800, SHUT_FROM = 18800;
  const HOLD = 4000, SETTLE = 1000;
  let anims = null, mode = 'auto', picked = null, timer = 0, visible = true;

  const take = () => {
    if (anims) return;
    anims = scene.getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getTiming().duration === D);
    const t = anims.length ? anims[0].currentTime : 0;
    anims.forEach((a) => { a.currentTime = t; });
  };
  const now = () => anims[0].currentTime % D;
  const seek = (t) => anims.forEach((a) => { a.currentTime = t; });
  const rate = (r) => anims.forEach((a) => { a.playbackRate = r; });
  const run = () => {
    if (!anims) return;
    const go = visible && !document.hidden && mode !== 'lift';
    anims.forEach((a) => (go ? a.play() : a.pause()));
  };
  const raise = (hub) => {
    mode = 'lift';
    run();
    art.querySelectorAll('[data-hub]').forEach((c) => {
      const on = c.dataset.hub === hub;
      c.classList.toggle('hm-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    cap.textContent = CAPS[hub];
    clearTimeout(timer);
    if (!reducedMotion.matches) timer = setTimeout(settle, HOLD);
  };
  const settle = () => {
    picked = null;
    mode = 'auto';
    art.querySelectorAll('[data-hub]').forEach((c) => { c.classList.remove('hm-active'); c.setAttribute('aria-pressed', 'false'); });
    cap.textContent = rest;
    seek(Math.max(now(), CLOSE - SETTLE));
    run();
  };
  /* Opening forwards, or reopening by playing the close backwards, until the
     box is fully open; then the card rises. */
  const watch = () => {
    if (mode !== 'wait') return;
    const t = now(), back = anims[0].playbackRate < 0;
    if (back ? t <= CLOSE : t >= OPEN && t <= CLOSE) { rate(1); raise(picked); }
    else requestAnimationFrame(watch);
  };
  const pick = (hub) => {
    if (!Object.hasOwn(CAPS, hub)) return;
    picked = hub;
    if (reducedMotion.matches || mode === 'lift') { raise(hub); return; }
    start();
    if (!anims.length) { raise(hub); return; }
    if (mode === 'wait') return;
    const t = now();
    if (t >= OPEN && t <= CLOSE) { raise(hub); return; }
    if (t > CLOSE && t < SHUT_FROM) rate(-1);
    else if (t < SHUT_UNTIL || t >= SHUT_FROM) seek(SHUT_UNTIL);
    mode = 'wait';
    run();
    requestAnimationFrame(watch);
  };

  art.querySelectorAll('[data-hub]').forEach((c) => {
    c.addEventListener('click', () => pick(c.dataset.hub));
    c.addEventListener('focus', () => { if (c.matches(':focus-visible')) pick(c.dataset.hub); });
  });

  document.addEventListener('visibilitychange', run);
  // The box waits, shut, until the section is on screen, then starts its cycle
  // from the beginning — so nobody arrives to find it already done.
  let seen = false;
  const start = () => {
    if (seen) return;
    seen = true;
    take();
    seek(0);
    art.classList.add('is-live');
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (e.intersectionRatio >= 0.35) start();
      run();
    }, { threshold: [0, 0.35] }).observe(art);
  } else start();
  const motion = () => {
    if (reducedMotion.matches) { art.dataset.view = 'open'; cap.textContent = 'Four connected layers. Select a hub to explore.'; }
    else art.dataset.view = 'auto';
  };
  reducedMotion.addEventListener('change', motion);
  motion();
}

/* ---------------------------------------------------------------- tabs */

/**
 * A tablist with roving focus: click, or arrows / Home / End from the keyboard.
 * Each tab's `aria-controls` names the panel it shows.
 */
function tablist(tabs) {
  const select = (tab, focus = false) => {
    for (const other of tabs) {
      const on = other === tab;
      other.setAttribute('aria-selected', String(on));
      other.tabIndex = on ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !on;
    }
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const moves = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next;
      if (Object.hasOwn(moves, event.key)) next = (index + moves[event.key] + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
}

tablist([...document.querySelectorAll('.hm-tabs [role="tab"]')]);

/* ------------------------------------------- alternatives and customer proof */

const still = reducedMotion.matches;

/* The Alternatives: Rest → Pop when the board scrolls into view, then a
   focus band walks the seven rows. Hovering or focusing a row takes over;
   leaving hands control back. */
document.querySelectorAll('.sz-cmp').forEach((board) => {
  const rows = [...board.querySelectorAll('.sz-cmp__row')];
  const band = board.querySelector('.sz-cmp__band');
  const cell = board.querySelector('.sz-cmp__cell');
  let row = 0, timer = 0, held = false, seen = false;

  const place = () => {
    const r = rows[row - 1];
    if (!r) return;
    const top = r.offsetTop + 5, h = Math.max(68, r.offsetHeight - 10);
    for (const el of [band, cell]) { el.style.top = top + 'px'; el.style.height = h + 'px'; }
  };
  const focus = (n) => {
    row = n;
    board.dataset.row = String(n);
    rows.forEach((r, i) => r.classList.toggle('is-on', i === n - 1));
    place();
  };
  const step = () => {
    clearTimeout(timer);
    if (held) return;
    timer = setTimeout(() => { focus(row % rows.length + 1); step(); }, row ? 2400 : 900);
  };
  const start = () => {
    if (seen) { step(); return; }
    seen = true;
    if (still) { board.dataset.state = 'pop'; focus(1); return; }
    setTimeout(() => { board.dataset.state = 'pop'; step(); }, 350);
  };

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) start();
    else clearTimeout(timer);
  }, { threshold: .35 }).observe(board);

  rows.forEach((r, i) => {
    const take = () => { if (board.dataset.state !== 'pop') return; held = true; clearTimeout(timer); focus(i + 1); };
    r.addEventListener('mouseenter', take);
    r.addEventListener('focusin', take);
  });
  board.addEventListener('mouseleave', () => { if (!held) return; held = false; if (!still) step(); });
  addEventListener('resize', place);
});

/* Customer proof carousel: tabs, arrows and arrow keys move one story at a
   time; neighbours sit either side of the active card, and a card wrapping
   round from one side to the other jumps rather than sliding across. */
document.querySelectorAll('.sz-car').forEach((car) => {
  const tabs = [...car.querySelectorAll('[role="tab"]')];
  const cards = [...car.querySelectorAll('.sz-case')];
  const now = car.querySelector('.sz-car__now');
  const n = cards.length;
  let active = 0;
  const slot = (i) => { const d = (i - active + n) % n; return d === 0 ? 0 : d === 1 ? 1 : -1; };

  const show = (next, fromKey) => {
    const before = cards.map((_, i) => slot(i));
    active = (next + n) % n;
    cards.forEach((c, i) => {
      const pos = slot(i);
      c.classList.toggle('is-jump', Math.abs(pos - before[i]) > 1);
      c.style.setProperty('--pos', pos);
      c.classList.toggle('is-active', pos === 0);
      c.querySelectorAll('a').forEach((l) => { l.tabIndex = pos === 0 ? 0 : -1; });
      c.setAttribute('aria-hidden', String(pos !== 0));
    });
    requestAnimationFrame(() => requestAnimationFrame(() => cards.forEach((c) => c.classList.remove('is-jump'))));
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === active));
      t.tabIndex = i === active ? 0 : -1;
    });
    if (fromKey) tabs[active].focus();
    now.textContent = String(active + 1).padStart(2, '0');
    car.dataset.active = String(active);
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); show(active + k, true); }
      else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      else if (e.key === 'End') { e.preventDefault(); show(n - 1, true); }
    });
  });
  car.querySelector('.sz-car__btn--prev').addEventListener('click', () => show(active - 1));
  car.querySelector('.sz-car__btn--next').addEventListener('click', () => show(active + 1));
  cards.forEach((c, i) => c.addEventListener('click', () => { if (i !== active) show(i); }));
  show(0);

  /* Auto-advance, as in the prototype: each story holds for six seconds,
     then the next slides in from the right. It pauses while the pointer or
     focus is inside the carousel and while it is off screen, and any manual
     move restarts the six seconds. */
  if (still) return;
  const HOLD = 6000;
  let timer = 0, inView = false, paused = false;
  const arm = () => {
    clearTimeout(timer);
    if (inView && !paused && !document.hidden) timer = setTimeout(() => { show(active + 1); arm(); }, HOLD);
  };
  car.addEventListener('click', arm);
  car.addEventListener('keydown', arm);
  car.addEventListener('mouseenter', () => { paused = true; arm(); });
  car.addEventListener('mouseleave', () => { paused = false; arm(); });
  car.addEventListener('focusin', () => { paused = true; arm(); });
  car.addEventListener('focusout', (e) => { if (!car.contains(e.relatedTarget)) { paused = false; arm(); } });
  document.addEventListener('visibilitychange', arm);
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; arm(); }, { threshold: .4 }).observe(car);
});
