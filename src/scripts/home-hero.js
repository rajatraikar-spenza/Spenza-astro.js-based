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

  // The headline's last word rolls over with the stage: the old word's letters
  // drop out of sight one after another while the new one's drop in from
  // above, and the word's width eases between the two so the full stop
  // follows. The letters are clipped by the word (`.sh-rot` in the CSS).
  const word = $('sh-word');
  const STAGGER = 45;
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
  const roll = text => {
    let out = word.lastElementChild;
    // A roll still running is finished at once rather than stacked on.
    for (const el of [...word.children]) if (el !== out) el.remove();
    word.getAnimations({ subtree: true }).forEach(a => a.finish());
    out.classList.remove('sh-in');
    if (out.textContent.replace(/\u00a0/g, ' ') === text) return;
    if (reduce) { word.replaceChildren(split(text)); return; }
    if (!out.querySelector('.sh-ch')) { const s = split(out.textContent); out.replaceWith(s); out = s; }

    const inc = split(text);
    inc.className = 'sh-in';
    word.append(inc);
    const from = out.getBoundingClientRect().width;
    const to = inc.getBoundingClientRect().width;
    const outs = [...out.children];
    const ins = [...inc.children];
    const total = ROLL + STAGGER * Math.max(outs.length, ins.length);
    const size = word.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: total, easing: EASE, fill: 'forwards' });
    outs.forEach((el, k) => el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }],
      { duration: ROLL, delay: k * STAGGER, easing: EASE, fill: 'forwards' }));
    const done = ins.map((el, k) => el.animate([{ transform: 'translateY(-110%)' }, { transform: 'translateY(0)' }],
      { duration: ROLL, delay: k * STAGGER, easing: EASE, fill: 'backwards' }).finished);
    Promise.all(done).then(() => {
      if (!inc.isConnected) return;
      out.remove();
      inc.classList.remove('sh-in');
      size.finished.then(() => size.cancel(), () => {});
    }, () => {});
  };
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  };

  const render = i => {
    const c = CUSTOMERS[i];
    const p = c.phone;
    const b = c.brand;
    for (const [name, value] of [['--brand', b.brand], ['--brand-text', b.text], ['--brand-line', b.line],
      ['--brand-bar', b.bar], ['--brand-btn', b.btn], ['--screen', b.screen]]) stage.style.setProperty(name, value);

    for (const [id, h] of [['sh-logo', c.logoH[0]], ['sh-pLogo', c.logoH[1]]]) {
      const img = $(id);
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.src = c.logo;
      img.style.height = `${h}px`;
    }
    $('sh-logo').alt = c.name;
    setText('sh-sub', c.sub);
    setText('sh-capText', c.caption);
    setText('sh-kMarkets', String(c.markets.length));
    setText('sh-kNetworks', String(c.networks));

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

    setText('sh-aLabel', p.aLabel); setText('sh-aText', p.aText); setText('sh-aBtn', p.aBtn);
    setText('sh-plL', p.plL); setText('sh-plN', p.plN); setText('sh-plBig', p.plBig); setText('sh-plCap', p.plCap);
    setText('sh-r1k', p.rows[0][0]); setText('sh-r1v', p.rows[0][1]);
    setText('sh-r2k', p.rows[1][0]); setText('sh-r2v', p.rows[1][1]);
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
    if (word) roll(CUSTOMERS[i].word);
    if (reduce) render(i);
    else {
      swapping = true;
      stage.classList.add('sh-is-out');
      setTimeout(() => {
        render(i);
        stage.classList.remove('sh-is-out');
        swapping = false;
      }, 280);
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
