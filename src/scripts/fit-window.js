/**
 * Fitting the window. On a desktop a section marked data-fit is held to the
 * height of the window under the 64px header, so nothing in it is cut off
 * while it is in view. Its CSS closes it up by --k, from 0 (as designed) to 1
 * (tight); this finds the least --k at which every data-fit-box inside it
 * fits. A section of stacked rows marks each row as a box, so each row fits
 * on its own (its heading together with the first, data-fit-with-next); a
 * tabbed section names its panels in data-fit-variants and is
 * measured with the tallest one showing. Past a third of the way a section
 * may also switch to a tighter arrangement (data-fit-tight), such as a
 * two-line headline.
 *
 * It all happens in one synchronous pass, so the panels it switches through
 * are never painted. Used by scripts/home.js and scripts/hub.js; fitAuto()
 * below does the same for pages whose CSS has no --k.
 */

// Past 1 is only for the shortest laptops (768px and under); every measure
// keyed to --k bottoms out at a size that still reads.
const HEADER = 64, AIR = 24, MOST = 1.3, DESKTOP = 961;

const tallest = (sec) => {
  const boxes = sec.querySelectorAll('[data-fit-box]');
  // A box marked data-fit-with-next is measured together with the element
  // after it: a section's heading and its first row make one screen.
  const size = b => b.hasAttribute('data-fit-with-next') && b.nextElementSibling
    ? b.nextElementSibling.getBoundingClientRect().bottom - b.getBoundingClientRect().top
    : b.offsetHeight;
  const measure = () => Math.max(...[...(boxes.length ? boxes : [sec])].map(size));
  const panels = sec.dataset.fitVariants ? [...sec.querySelectorAll(sec.dataset.fitVariants)] : [];
  if (!panels.length) return measure();
  const was = panels.map(p => p.hidden);
  let h = 0;
  panels.forEach((_, i) => { panels.forEach((q, j) => { q.hidden = j !== i; }); h = Math.max(h, measure()); });
  panels.forEach((p, i) => { p.hidden = was[i]; });
  return h;
};

let listening = false;

export function fitWindow() {
  const fitted = [...document.querySelectorAll('[data-fit]')];
  if (!fitted.length || listening) return;
  listening = true;
  const fit = () => {
    const room = innerHeight - HEADER - AIR;
    for (const sec of fitted) {
      const set = k => { sec.style.setProperty('--k', String(k)); sec.toggleAttribute('data-fit-tight', k >= .34); };
      set(0);
      if (innerWidth < DESKTOP || tallest(sec) <= room) continue;
      set(MOST);
      if (tallest(sec) > room) continue;
      let lo = 0, hi = MOST;
      for (let i = 0; i < 8; i++) { const k = (lo + hi) / 2; set(k); if (tallest(sec) > room) lo = k; else hi = k; }
      set(hi.toFixed(3));
    }
  };
  let queued = 0;
  const refit = () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(fit); };
  fit();
  addEventListener('resize', refit);
  document.fonts?.ready.then(refit);
}

/*
 * Automatic fitting, for a page built in WordPress or any page whose CSS has
 * no --k: <main data-fit-auto> (WpLayout's `fit`). Its sections are main's
 * grandchildren — the top-level Elementor containers, or a hand-built page's
 * <section>s inside its wrapper. A section taller than the window has its
 * own vertical spacing closed up (paddings, block margins, gaps, minimum
 * heights) and its headings set a little smaller, by the least amount that
 * makes its content fit; one that cannot fit even fully closed up — a long
 * list — is left exactly as it was. Each section is fitted as it nears the
 * window, so sections the page defers (content-visibility) stay deferred.
 */
const AUTO_MOST = 1.8;
const SPACING = ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'row-gap', 'min-height'];

const record = (sec) => {
  const list = [];
  for (const el of [sec, ...sec.querySelectorAll('*')]) {
    if (el.closest('svg') && el.localName !== 'svg') continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'absolute' || cs.position === 'fixed') continue;
    // A flex or grid item's margins may be `auto`, pushing it into place;
    // only margins in normal flow are spacing.
    const inFlow = !/flex|grid/.test(getComputedStyle(el.parentElement).display);
    const was = {};
    for (const p of SPACING) {
      if (p.startsWith('margin') && !inFlow) continue;
      const v = cs.getPropertyValue(p);
      if (v.endsWith('px') && parseFloat(v) > 0) was[p] = parseFloat(v);
    }
    if (/^h[1-3]$/.test(el.localName)) was['font-size'] = parseFloat(cs.fontSize);
    // A card's own padding is the margin round its text: it gives up half as much.
    const card = parseFloat(cs.borderTopWidth) > 0 || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.boxShadow !== 'none';
    if (Object.keys(was).length) list.push({ el, was, card, inline: Object.fromEntries(Object.keys(was).map(p => [p, [el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]])) });
  }
  return list;
};

const squeeze = (list, k) => {
  for (const { el, was, card, inline } of list) {
    for (const [p, px] of Object.entries(was)) {
      if (k === 0) { el.style.setProperty(p, ...inline[p]); continue; }
      // Open spacing goes first and furthest; a card's padding, headings and
      // minimum heights follow more slowly and only reach their floor on the
      // shortest screens (k up to AUTO_MOST).
      const f = p === 'font-size' ? Math.max(.8, 1 - .16 * k)
        : p === 'min-height' ? Math.max(.4, 1 - .5 * k)
        : card && p.startsWith('padding') ? Math.max(.4, 1 - .35 * k)
        : Math.max(.3, 1 - .7 * k);
      el.style.setProperty(p, (px * f).toFixed(2) + 'px', 'important');
    }
  }
};

export function fitAuto() {
  const main = document.querySelector('main[data-fit-auto]');
  if (!main) return;
  const sections = [...main.querySelectorAll(':scope > * > *')]
    .filter(s => !s.matches('script, style, template, link, [data-fit]') && s.offsetWidth >= innerWidth - 20);
  const lists = new Map();
  const content = (sec) => { const cs = getComputedStyle(sec); return sec.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom); };
  const fit = (sec) => {
    if (!lists.has(sec)) lists.set(sec, record(sec));
    const list = lists.get(sec), room = innerHeight - HEADER - AIR;
    squeeze(list, 0);
    if (innerWidth < DESKTOP || content(sec) <= room) return;
    squeeze(list, AUTO_MOST);
    if (content(sec) > room) { squeeze(list, 0); return; }
    let lo = 0, hi = AUTO_MOST;
    for (let i = 0; i < 7; i++) { const k = (lo + hi) / 2; squeeze(list, k); if (content(sec) > room) lo = k; else hi = k; }
    squeeze(list, hi);
  };
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { near.unobserve(e.target); fit(e.target); }
  }, { rootMargin: '100% 0px 100% 0px' });
  sections.forEach(s => near.observe(s));
  let queued = 0;
  addEventListener('resize', () => { cancelAnimationFrame(queued); queued = requestAnimationFrame(() => lists.forEach((_, sec) => fit(sec))); });
}
