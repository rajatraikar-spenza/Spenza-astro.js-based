import './home-hero.js';

/**
 * The home page's behaviour.
 *
 *   - sections fade up as they scroll into view
 *   - the hero's cursor spotlight
 *   - the hero's customer stage (scripts/home-hero.js)
 *   - the Spenza advantage walkthrough and its isometric card stack
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

/* ------------------------------------------------------- advantage stack */

// The Spenza advantage walkthrough (Advantage.astro), after the "How it works"
// panel on livekit.com: one hub at a time is the current step, and its card
// slides out of the isometric stack with room either side and lights up.
//
// From 1024px the panel is sticky in a tall track and the scroll picks the
// step, a quarter of the track each, filling the rail and the number's ring
// as it goes. Below that there is no track, and the steps advance on a timer
// while the stack is on screen. A click on a step or a card picks it — by
// scrolling to its quarter, where the scroll is in charge.
const how = document.querySelector('.hm-how');

if (how) {
  const art = how.querySelector('.hm-how__art');
  const iso = art.querySelector('.hm-iso');
  const track = how.querySelector('.hm-how__track');
  const panel = how.querySelector('.hm-how__panel');
  const steps = [...how.querySelectorAll('.hm-how__step')];
  const cards = [...iso.querySelectorAll('.hm-iso-card')];
  const sticky = window.matchMedia('(min-width: 1024px)');
  const STEP = 4000;

  // The stage is drawn at 864x580 and scaled to fit its column, measured by
  // the 700x520 the stack itself takes up in the middle of it.
  const fit = () => {
    const s = Math.min(art.clientWidth / 700, art.clientHeight / 520) || 1;
    iso.style.setProperty('--iso-scale', s.toFixed(4));
  };
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(art); else addEventListener('resize', fit);

  /* Where the cards sit along the stack's line, in the stage's pixels, as on
     livekit.com: the ones before the current card packed 50px apart, 140px
     clear either side of it, the ones after 50px apart again. CENTRE shifts
     the whole run so it sits in the middle of the stage. */
  const PACK = 50, CLEAR = 140, START = -90, CENTRE = -75;
  const spots = (a) => {
    const x = [];
    for (let k = 0; k < cards.length; k++) {
      if (k < a) x.push(START + PACK * k);
      else if (k === a) x.push(a === 0 ? 0 : x[k - 1] + CLEAR);
      else x.push(x[k - 1] + (k === a + 1 ? CLEAR : PACK));
    }
    return x.map((v) => v + CENTRE);
  };

  // The label of a card coming into the light resolves out of random letters.
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const scramble = (tag) => {
    const text = tag.dataset.text;
    if (reducedMotion.matches) { tag.textContent = text; return; }
    const started = performance.now();
    const frame = (now) => {
      const done = Math.floor((now - started) / 28);
      tag.textContent = [...text].map((ch, k) => (ch === ' ' || k < done ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (done < text.length && tag.isConnected) requestAnimationFrame(frame); else tag.textContent = text;
    };
    requestAnimationFrame(frame);
  };

  let active = -1, visible = false, timer = 0;

  /* The AgentHub waveform, live while its card is lit and on screen: a caller
     talks, a beat of silence, the agent answers (the bars turn orange), and
     round again. Out of the light the bars ease back to the artwork's still
     shape. */
  const wave = how.querySelector('.lv-wave');
  const voice = (() => {
    if (!wave) return () => {};
    const bars = [...wave.children];
    const TURNS = [['user', 1700], ['', 450], ['agent', 2300], ['', 650]];
    let raf = 0, t0 = 0, next = 0, gate = 0, gateUntil = 0;
    const level = bars.map(() => 0.12);
    const aim = bars.map(() => 0.12);
    const frame = (now) => {
      const cycle = TURNS.reduce((n, [, d]) => n + d, 0);
      let t = (now - t0) % cycle, who = '';
      for (const [name, d] of TURNS) { if (t < d) { who = name; break; } t -= d; }
      wave.classList.toggle('is-agent', who === 'agent');
      // Speech comes in syllables: bursts of 120-320ms with short gaps, and
      // within a burst every bar picks a new height every ~90ms, the middle
      // ones reaching furthest.
      if (now > gateUntil) { gate = gate ? 0 : 1; gateUntil = now + (gate ? 120 + Math.random() * 200 : 40 + Math.random() * 90); }
      if (now > next) {
        next = now + 70 + Math.random() * 50;
        bars.forEach((_, k) => {
          const mid = 1 - Math.abs(k - 3) / 4.5;
          aim[k] = who && gate ? 0.25 + 0.75 * mid * (0.45 + 0.55 * Math.random()) : 0.1 + 0.06 * Math.random();
        });
      }
      bars.forEach((bar, k) => {
        level[k] += (aim[k] - level[k]) * 0.32;
        bar.style.setProperty('--h', level[k].toFixed(3));
      });
      raf = requestAnimationFrame(frame);
    };
    return (on) => {
      if (on && !raf && !reducedMotion.matches) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
      if (!on && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        wave.classList.remove('is-agent');
        bars.forEach((bar) => bar.style.removeProperty('--h'));
      }
    };
  })();
  const talk = () => voice(visible && active >= 0 && cards[active].dataset.hub === 'agent');

  const show = (i) => {
    const before = active;
    active = i;
    steps.forEach((step, k) => {
      if (k === i) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
      step.classList.toggle('is-done', k < i);
      if (k !== i) step.style.removeProperty('--fill');
    });
    if (i === before) return;
    // The cards move one after another, from the end the move starts at.
    const forward = i > before;
    const x = spots(i);
    cards.forEach((card, k) => {
      card.style.setProperty('--x', String(x[k]));
      card.style.setProperty('--delay', `${(forward ? k : cards.length - 1 - k) * 50}ms`);
      card.classList.toggle('is-lit', k === i);
    });
    scramble(cards[i].querySelector('.hm-iso-tag'));
    talk();
    // On the timer, the current step's rail and ring fill over its four seconds.
    if (how.classList.contains('is-timed')) {
      steps[i].style.setProperty('--fill', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => steps[i].style.setProperty('--fill', '1')));
    }
  };

  const tick = () => {
    clearInterval(timer);
    const timed = visible && !sticky.matches && !reducedMotion.matches;
    how.classList.toggle('is-timed', timed);
    if (timed) {
      steps[active].style.setProperty('--fill', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => steps[active].style.setProperty('--fill', '1')));
      timer = setInterval(() => show((active + 1) % steps.length), STEP);
    }
  };

  // Where the scroll is through the track, as a step and a fraction of it.
  const fromScroll = () => {
    if (!sticky.matches) return;
    const range = track.offsetHeight - panel.offsetHeight;
    const top = parseFloat(getComputedStyle(panel).top) || 0;
    const p = range > 0 ? (top - track.getBoundingClientRect().top) / range : 0;
    const at = Math.min(steps.length - 1e-6, Math.max(0, p * steps.length));
    const i = Math.floor(at);
    if (i !== active) show(i);
    steps[i].style.setProperty('--fill', (at - i).toFixed(3));
  };
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fromScroll(); });
  }, { passive: true });

  const pick = (i) => {
    if (sticky.matches) {
      const range = track.offsetHeight - panel.offsetHeight;
      const top = parseFloat(getComputedStyle(panel).top) || 0;
      const y = track.getBoundingClientRect().top + scrollY - top + ((i + 0.5) / steps.length) * range;
      scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    } else {
      show(i);
      tick();
    }
  };
  steps.forEach((step, i) => step.querySelector('button').addEventListener('click', () => pick(i)));
  cards.forEach((card, i) => card.addEventListener('click', () => pick(i)));

  show(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) art.classList.add('is-in');
      tick();
      talk();
    }, { threshold: 0.2 }).observe(art);
  } else { visible = true; art.classList.add('is-in'); }
  sticky.addEventListener('change', () => { fromScroll(); tick(); });
  fromScroll();
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
    const top = r.offsetTop + 5, h = Math.max(40, r.offsetHeight - 10);
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

/* Fitting the window. On a desktop a section marked data-fit is held to the
   height of the window under the 64px header: its CSS closes it up by --k,
   from 0 (as designed) to 1 (tight), and this finds the least --k at which
   its data-fit-box fits — with its tallest tab showing, for a tabbed section
   (data-fit-variants names the panels). It all happens in one synchronous
   pass, so the panels it switches through are never painted. */
const fitted = [...document.querySelectorAll('[data-fit]')];
if (fitted.length) {
  // Past 1 is only for the shortest laptops (768px and under); every measure
  // keyed to --k bottoms out at a size that still reads.
  const HEADER = 64, AIR = 24, MOST = 1.3;
  const height = (sec, box) => {
    const panels = sec.dataset.fitVariants ? [...sec.querySelectorAll(sec.dataset.fitVariants)] : [];
    if (!panels.length) return box.offsetHeight;
    const was = panels.map(p => p.hidden);
    let h = 0;
    panels.forEach((_, i) => { panels.forEach((q, j) => { q.hidden = j !== i; }); h = Math.max(h, box.offsetHeight); });
    panels.forEach((p, i) => { p.hidden = was[i]; });
    return h;
  };
  const fit = () => {
    const room = innerHeight - HEADER - AIR;
    for (const sec of fitted) {
      const box = sec.querySelector('[data-fit-box]') || sec;
      // Past a third of the way, a section may also switch to a tighter
      // arrangement (data-fit-tight), such as a two-line headline.
      const set = k => { sec.style.setProperty('--k', String(k)); sec.toggleAttribute('data-fit-tight', k >= .34); };
      set(0);
      if (innerWidth < 961 || height(sec, box) <= room) continue;
      set(MOST);
      if (height(sec, box) > room) continue;
      let lo = 0, hi = MOST;
      for (let i = 0; i < 8; i++) { const k = (lo + hi) / 2; set(k); if (height(sec, box) > room) lo = k; else hi = k; }
      set(hi.toFixed(3));
    }
  };
  let queued = 0;
  const refit = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(fit); };
  fit();
  addEventListener('resize', refit);
  document.fonts?.ready.then(refit);
}
