/**
 * The home page's behaviour.
 *
 *   - sections fade up as they scroll into view
 *   - the hero's cursor spotlight
 *   - the "MVNO in a Box" hero animation: layer inspection that resumes the
 *     loop on its own, offscreen suspension, responsive scaling
 *   - the platform hub tabs and the case-study tabs
 *   - the count-up on the headline numbers
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

/* ------------------------------------------------------------ hero box */

// The hub images are the original vector exports from Figma. Motion is kept
// separate from their intrinsic isometric transforms so the artwork stays intact.
const art = document.querySelector('.hm-hero-art');

if (art) {
  const sceneWrap = art.querySelector('.hm-scene-wrap');
  const scene = art.querySelector('.hm-scene');
  const caption = document.getElementById('hero-caption');
  const DEFAULT_CAPTION = caption.textContent;
  const hubDescriptions = {
    telecom: 'TelecomHub — multi-operator connectivity, one API.',
    control: 'ControlHub — every line, cost, and invoice in one view.',
    ux: 'UXHub — your plans, checkout, billing, and brand.',
    agent: 'AgentHub — real phone numbers for AI conversations.',
  };

  /**
   * How long an opened layer stays open before the loop resumes.
   *
   * There are no pause or replay buttons, so this is the only way back to the
   * animation after a visitor picks a hub. It waits while the pointer is over
   * the artwork or focus is inside it, so it never closes under someone who is
   * still looking.
   */
  const RESUME_AFTER = 6000;
  let resumeTimer = 0;
  let outsideViewport = false;

  // The scene is drawn at 580px and scaled to whatever width it is given.
  const scaleScene = () => {
    scene.style.setProperty('--scene-scale', String(sceneWrap.clientWidth / 580));
  };
  scaleScene();
  if ('ResizeObserver' in window) new ResizeObserver(scaleScene).observe(sceneWrap);
  else window.addEventListener('resize', scaleScene);

  // Paused while offscreen or in a background tab; nobody is watching.
  const syncMotion = () => {
    art.classList.toggle('hm-is-paused', outsideViewport || document.hidden);
  };

  const clearHubSelection = () => {
    art.querySelectorAll('[data-hub], [data-select-hub]').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.classList.remove('hm-active');
    });
  };

  const replay = () => {
    if (reducedMotion.matches) return;
    art.dataset.view = 'auto';
    clearHubSelection();
    caption.textContent = DEFAULT_CAPTION;
    // Flush the view change before restarting every part on the same timeline.
    void scene.offsetWidth;
    scene.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 0; });
  };

  const scheduleResume = () => {
    clearTimeout(resumeTimer);
    if (reducedMotion.matches) return;
    resumeTimer = setTimeout(() => {
      if (art.matches(':hover') || art.contains(document.activeElement)) scheduleResume();
      else replay();
    }, RESUME_AFTER);
  };

  const exploreHub = id => {
    if (!Object.hasOwn(hubDescriptions, id)) return;
    art.dataset.view = 'open';
    clearHubSelection();
    art.querySelectorAll(`[data-hub="${id}"], [data-select-hub="${id}"]`).forEach(button => {
      button.setAttribute('aria-pressed', 'true');
      button.classList.add('hm-active');
    });
    caption.textContent = hubDescriptions[id];
    scheduleResume();
  };

  art.querySelectorAll('[data-hub]').forEach(button => {
    button.addEventListener('click', () => exploreHub(button.dataset.hub));
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) exploreHub(button.dataset.hub);
    });
  });
  art.querySelectorAll('[data-select-hub]').forEach(button => {
    button.addEventListener('click', () => exploreHub(button.dataset.selectHub));
  });
  document.addEventListener('visibilitychange', syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      outsideViewport = !entries[0].isIntersecting;
      syncMotion();
    }, { threshold: 0 }).observe(art);
  }

  // Reduced motion: the layers sit open, still, and can be inspected.
  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      clearTimeout(resumeTimer);
      art.dataset.view = 'open';
      caption.textContent = 'Four connected layers. Select a hub to explore.';
    }
    syncMotion();
  };
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
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
tablist([...document.querySelectorAll('.hm-story-tabs [role="tab"]')]);

/* ------------------------------------------------------------- numbers */

// The headline numbers count up from zero the first time they are seen. The
// markup already holds the final values, so this only ever animates towards
// what is there.
const counters = [...document.querySelectorAll('.hm [data-count]')];
if (counters.length && !reducedMotion.matches && 'IntersectionObserver' in window) {
  const run = () => {
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - p, 3);
      for (const el of counters) el.textContent = String(Math.round(Number(el.dataset.count) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const watch = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    watch.disconnect();
    run();
  }, { rootMargin: '0px 0px 10% 0px' });
  watch.observe(counters[0].closest('.hm-stats'));
}
