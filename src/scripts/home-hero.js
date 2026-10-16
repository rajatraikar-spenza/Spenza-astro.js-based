/**
 * The hero's "Live on Spenza" stage: every four seconds the next customer
 * fades in, its tab's bar filling as the time runs. A tab click jumps straight
 * to that customer and the cycle carries on from there. It never pauses for
 * the pointer or for focus — only while the tab is in the background.
 *
 * The first customer is already in the markup (Hero.astro); this swaps in the
 * others from the JSON beside it.
 */

const stage = document.getElementById('sh-stage');
const box = document.getElementById('sh-stageBox');
const source = document.getElementById('sh-data');

if (stage && box && source) {
  const CUSTOMERS = JSON.parse(source.textContent);
  const DURATION = 4000;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const tabs = [...stage.querySelectorAll('.sh-tab')];
  const bars = tabs.map(tab => tab.querySelector('.sh-bar'));
  const SVGNS = 'http://www.w3.org/2000/svg';
  let current = 0;
  let started = performance.now();
  let swapping = false;

  const setText = (id, value) => { $(id).textContent = value; };

  // Text that changes with the stage rolls over: the old letters drop out of
  // sight one after another while the new ones drop in from above, and the
  // width eases between the two so whatever follows moves with it. Each
  // rolling element (`.sh-roll` in the CSS) clips its own letters. The
  // headline's word rolls slowest; the stage's numbers and caption quicker.
  const word = $('sh-word');
  const ROLL = 560;
  const EASE = 'cubic-bezier(.65, 0, .35, 1)';
  const split = text => {
    const span = document.createElement('span');
    for (const ch of text) {
      const letter = document.createElement('span');
      letter.className = 'sh-ch';
      letter.textContent = ch === ' ' ? '\u00a0' : ch;
      span.append(letter);
    }
    return span;
  };
  const roll = (box, text, stagger = 45) => {
    let out = box.lastElementChild;
    // A roll still running is finished at once rather than stacked on.
    for (const el of [...box.children]) if (el !== out) el.remove();
    box.getAnimations({ subtree: true }).forEach(a => a.finish());
    out.classList.remove('sh-in');
    if (out.textContent.replace(/\u00a0/g, ' ') === text) return;
    if (reduce) { box.replaceChildren(split(text)); return; }
    if (!out.querySelector('.sh-ch')) { const s = split(out.textContent); out.replaceWith(s); out = s; }

    const inc = split(text);
    inc.className = 'sh-in';
    box.append(inc);
    const from = out.getBoundingClientRect().width;
    const to = inc.getBoundingClientRect().width;
    const outs = [...out.children];
    const ins = [...inc.children];
    const total = ROLL + stagger * Math.max(outs.length, ins.length);
    const size = box.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: total, easing: EASE, fill: 'forwards' });
    outs.forEach((el, k) => el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }],
      { duration: ROLL, delay: k * stagger, easing: EASE, fill: 'forwards' }));
    const done = ins.map((el, k) => el.animate([{ transform: 'translateY(-110%)' }, { transform: 'translateY(0)' }],
      { duration: ROLL, delay: k * stagger, easing: EASE, fill: 'backwards' }).finished);
    Promise.all(done).then(() => {
      if (!inc.isConnected) return;
      out.remove();
      inc.classList.remove('sh-in');
      size.finished.then(() => size.cancel(), () => {});
    }, () => {});
  };

  // The customer's device beside the map. RocketPhone's dialer is mid-call:
  // its timer runs and its keys are pressed now and then, while it is on
  // screen.
  const devices = [...stage.querySelectorAll('.sh-dev')];
  const dialer = stage.querySelector('.sh-dialer');
  const clock = dialer?.querySelector('.sh-dl-time');
  const keys = dialer ? [...dialer.querySelectorAll('.sh-dl-pad span')] : [];
  let seconds = 134;
  const pad = n => String(n).padStart(2, '0');
  setInterval(() => {
    if (!visible || document.hidden || !dialer?.classList.contains('is-on')) return;
    seconds += 1;
    clock.textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
    if (reduce) return;
    const key = keys[Math.floor(Math.random() * keys.length)];
    key.classList.add('is-press');
    setTimeout(() => key.classList.remove('is-press'), 220);
  }, 1000);

  // The stage's blocks — the customer, the pins and their labels, the
  // customer's device — drop out one after another, and the next customer's drop back in
  // from above in the same order, as the letters do.
  const blocks = [...stage.querySelectorAll('[data-swap]')];
  const OUT = 240;
  const drop = (from, to, opacity, delay, duration) => blocks.forEach((el, k) => el.animate(
    [{ transform: `translateY(${from}px)`, opacity: opacity[0] }, { transform: `translateY(${to}px)`, opacity: opacity[1] }],
    { duration, delay: delay + k * 45, easing: EASE, fill: 'both' }));
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  };

  const render = i => {
    const c = CUSTOMERS[i];
    const b = c.brand;
    for (const [name, value] of [['--brand', b.brand], ['--brand-text', b.text], ['--brand-line', b.line],
      ['--brand-bar', b.bar], ['--brand-btn', b.btn], ['--screen', b.screen]]) stage.style.setProperty(name, value);

    const logo = $('sh-logo');
    logo.removeAttribute('width');
    logo.removeAttribute('height');
    logo.src = c.logo;
    logo.style.height = `${c.logoH}px`;
    logo.alt = c.name;
    setText('sh-sub', c.sub);

    const pins = $('sh-pins');
    const labels = $('sh-labels');
    pins.replaceChildren();
    labels.replaceChildren();
    for (const m of c.markets) {
      const g = svgEl('g', { class: 'sh-pin', transform: `translate(${m.x} ${m.y})` });
      g.append(svgEl('circle', { class: 'sh-halo', r: '8' }), svgEl('circle', { class: 'sh-ring', r: '5' }), svgEl('circle', { class: 'sh-core', r: '3.6' }));
      pins.append(g);
      const label = document.createElement('span');
      label.className = 'sh-pinlabel';
      label.style.left = `${(m.x / 580) * 100}%`;
      label.style.top = `${(m.y / 216) * 100}%`;
      if (m.ly && c.markets.length > 2) label.style.marginTop = `${m.ly}px`;
      label.textContent = `${m.name} · live`;
      labels.append(label);
    }
    $('sh-map').setAttribute('aria-label', `World map showing ${c.name} live in ${c.markets.map(m => m.name).join(' and ')}`);

    devices.forEach(d => d.classList.toggle('is-on', d.dataset.dev === c.name));
    tabs.forEach((tab, k) => tab.setAttribute('aria-pressed', String(k === i)));
  };

  // Preload the other logos so a swap never waits on the network — unless the
  // stage is hidden.
  const preload = () => {
    if (box.offsetParent) CUSTOMERS.slice(1).forEach(c => { new Image().src = c.logo; });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(preload);
  else setTimeout(preload, 2000);

  const go = (i, announce) => {
    if (swapping) return;
    current = i;
    started = performance.now();
    const c = CUSTOMERS[i];
    if (word) roll(word, c.word);
    roll($('sh-kMarkets'), String(c.markets.length), 70);
    roll($('sh-kNetworks'), String(c.networks), 70);
    roll($('sh-capText'), c.caption, 12);
    if (reduce) render(i);
    else {
      swapping = true;
      blocks.forEach(el => el.getAnimations().forEach(a => a.cancel()));
      drop(0, 14, [1, 0], 0, OUT);
      setTimeout(() => {
        render(i);
        blocks.forEach(el => el.getAnimations().forEach(a => a.cancel()));
        drop(-14, 0, [0, 1], 0, ROLL);
        swapping = false;
      }, OUT + 45 * (blocks.length - 1));
    }
    if (announce) setText('sh-announce', `Showing ${CUSTOMERS[i].name}`);
  };

  // One frame loop drives the bars and the advance. A background tab gets no
  // frames, so the clock is held rather than letting it run on unseen.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else started += performance.now() - hiddenAt;
  });
  // The loop only runs while the stage is on screen; scrolled away, it holds.
  // Coming back resumes the current customer's time.
  let visible = false;
  let leftAt = 0;
  const frame = now => {
    if (!visible) return;
    const elapsed = now - started;
    if (elapsed >= DURATION) go((current + 1) % CUSTOMERS.length, false);
    else {
      // A transform, not a width: it never touches layout.
      const fill = Math.min(elapsed / DURATION, 1);
      bars.forEach((bar, k) => { bar.style.transform = `scaleX(${k === current ? fill : 0})`; });
    }
    requestAnimationFrame(frame);
  };
  const watch = on => {
    if (on === visible) return;
    visible = on;
    if (on) {
      if (leftAt) started += performance.now() - leftAt;
      requestAnimationFrame(frame);
    } else leftAt = performance.now();
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => watch(entry.isIntersecting)).observe(box);
  } else watch(true);

  tabs.forEach(tab => tab.addEventListener('click', () => go(Number(tab.dataset.i), true)));

  // The stage is drawn at 660x630 and scaled to its column; Hero.astro does
  // the first fit inline, before paint.
  const fit = () => {
    const s = Math.min(1, (box.clientWidth || 660) / 660);
    stage.style.transform = `scale(${s})`;
    box.style.height = `${630 * s}px`;
  };
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box.parentNode);
  else window.addEventListener('resize', fit);
}
