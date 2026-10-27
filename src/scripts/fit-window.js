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
 * are never painted. Used by scripts/home.js and scripts/hub.js.
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

export function fitWindow() {
  const fitted = [...document.querySelectorAll('[data-fit]')];
  if (!fitted.length) return;
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
