/**
 * The hub pages' behaviour — UX Hub, Telecom Hub, Control Hub.
 *
 *   - sections fade up as they scroll into view, and the headline numbers
 *     count up as theirs does
 *   - the product video (see HubVideo.astro for the sequence)
 *   - UX Hub's brand-studio swatches, Telecom Hub's four questions, and
 *     Control Hub's plan builder
 *
 * Everything is progressive: without this the page is complete and static —
 * every section visible, the numbers at their values, the plain `<video>`
 * from the `<noscript>` in place of the poster. The FAQ needs no script.
 */

const page = document.querySelector('.ux');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (page) {
  // The hidden starting state is keyed off `.js`, so it only applies once this
  // has run and can promise to undo it.
  page.classList.add('js');
  reveal(page);
  page.querySelectorAll('[data-hub-video]').forEach(initVideo);
  initStudio(page);
  initQuestions(page);
  initBuilder(page);
}

function reveal(root) {
  const items = root.querySelectorAll('.rv');
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      entry.target.querySelectorAll('.cnt').forEach(countUp);
      io.unobserve(entry.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}

function countUp(el) {
  const to = Number(el.dataset.to);
  const format = n => n.toLocaleString('en-US');
  if (reducedMotion) {
    el.textContent = format(to);
    return;
  }
  const duration = 1400;
  let start = null;
  const step = t => {
    start ??= t;
    const p = Math.min(1, (t - start) / duration);
    el.textContent = format(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── product video ─────────────────────────────────────────────── */

function initVideo(box) {
  const template = box.querySelector('template');
  const poster = box.querySelector('.poster');
  const end = box.querySelector('.vid-end');
  const error = box.querySelector('.vid-err');
  const title = box.dataset.title;
  /** @type {HTMLVideoElement | null} */
  let video = null;

  // Mount the player behind the poster. `metadata` fetches the file's index
  // and little else, so a hover that never becomes a click costs a few KB.
  function mount() {
    if (video) return video;
    video = document.importNode(template.content, true).querySelector('video');
    video.preload = 'metadata';
    box.insertBefore(video, poster);
    wire(video);
    return video;
  }

  for (const type of ['pointerenter', 'focus', 'touchstart']) {
    poster.addEventListener(type, mount, { once: true, passive: true });
  }

  poster.addEventListener('click', () => {
    const v = mount();
    v.preload = 'auto';
    box.classList.add('is-loading');
    v.play()?.catch(err => {
      // Autoplay policy or a decode failure: hand the visitor the native
      // controls instead of a spinner that never stops.
      if (err.name !== 'AbortError') showPlayer(false);
    });
  });

  end.querySelector('[data-replay]').addEventListener('click', () => {
    video.currentTime = 0;
    video.play();
  });

  function showPlayer(focus) {
    box.classList.remove('is-loading');
    box.classList.add('is-playing');
    if (focus) video.focus({ preventScroll: true });
  }

  function wire(v) {
    // No "Save video as…": the download option is off in the controls too.
    v.addEventListener('contextmenu', e => e.preventDefault());

    v.addEventListener('playing', () => {
      // Keyboard users keep their place: focus moves from the poster, which
      // is about to disappear, to the player that replaced it.
      const hadFocus = document.activeElement === poster;
      showPlayer(hadFocus);
      end.hidden = true;
    });

    v.addEventListener('play', () => {
      end.hidden = true;
    });

    v.addEventListener('ended', () => {
      end.hidden = false;
      if (box.contains(document.activeElement)) end.querySelector('[data-replay]').focus();
    });

    // A failed `<source>` fires on the source, not the video; only the last
    // one failing means nothing on the list could play.
    v.querySelector('source:last-of-type').addEventListener('error', () => {
      box.classList.remove('is-loading');
      error.hidden = false;
    });

    // Pause once mostly scrolled away, and leave it paused: resuming on its
    // own as the visitor scrolls back would be a surprise with the sound on.
    // Left alone in fullscreen and picture-in-picture, where the visitor has
    // taken it out of the page on purpose.
    new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.25 || v.paused) return;
      if (document.fullscreenElement || v.webkitDisplayingFullscreen) return;
      if (document.pictureInPictureElement === v) return;
      v.pause();
    }, { threshold: [0, 0.25] }).observe(box);

    track(v, title);
  }
}

/**
 * GA4's video events, as its enhanced measurement names them for YouTube, so
 * these sit beside any embedded video in the same reports. `gtag` is absent on
 * previews (no measurement id), and then this sends nothing.
 */
function track(v, title) {
  const send = (name, extra = {}) =>
    window.gtag?.('event', name, {
      video_title: title,
      video_provider: 'spenza',
      video_url: v.currentSrc,
      video_duration: Math.round(v.duration) || undefined,
      video_current_time: Math.round(v.currentTime),
      ...extra,
    });

  let started = false;
  const marks = [25, 50, 75];
  let next = 0;

  v.addEventListener('playing', () => {
    if (started) return;
    started = true;
    send('video_start');
  });

  v.addEventListener('timeupdate', () => {
    if (next >= marks.length || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    while (next < marks.length && pct >= marks[next]) {
      send('video_progress', { video_percent: marks[next] });
      next++;
    }
  });

  v.addEventListener('ended', () => send('video_complete', { video_percent: 100 }));
}

/* ── per-page interactions ─────────────────────────────────────── */

// UX Hub: the brand studio repaints its phone in the swatch picked, and puts
// the logo picked in its header.
function initStudio(root) {
  const studio = root.querySelector('#studio');
  if (!studio) return;
  const logos = studio.querySelectorAll('.logo-opt');
  const mark = studio.querySelector('.ph-logo');
  logos.forEach(button => {
    button.addEventListener('click', () => {
      logos.forEach(b => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      studio.dataset.logo = button.dataset.logo;
      // Restart the pop-in, so the swap reads as a change.
      mark.style.animation = 'none';
      void mark.offsetWidth;
      mark.style.animation = '';
    });
  });
  const swatches = studio.querySelectorAll('.sw button');
  swatches.forEach(button => {
    button.addEventListener('click', () => {
      swatches.forEach(b => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      studio.style.setProperty('--brand', button.dataset.c);
    });
  });
}

// Telecom Hub: pointing at a question highlights its answer on the tower, and
// the other way round. Tapping does the same on touch screens.
function initQuestions(root) {
  const questions = root.querySelectorAll('.q-item');
  const tags = root.querySelectorAll('.tower .tag');
  if (!questions.length) return;
  const select = n => {
    questions.forEach(q => q.classList.toggle('on', q.dataset.q === n));
    tags.forEach(t => t.classList.toggle('on', t.dataset.q === n));
  };
  for (const el of [...questions, ...tags]) {
    el.addEventListener('mouseenter', () => select(el.dataset.q));
    el.addEventListener('click', () => select(el.dataset.q));
  }
}

// Control Hub: the plan builder previews a plan per device type.
const PLANS = {
  wearable: { name: 'Kids Watch 1 GB', bill: 0, base: 'Operator B · LTE-M wholesale', mk: 'US, GB', data: '1 GB', voice: '100 min', sms: '100', cost: '$3.10', mu: '$4.90', sell: '$8.00' },
  smartphone: { name: 'Business 5 GB', bill: 1, base: 'Operator A · 5G wholesale', mk: 'US', data: '5 GB', voice: 'Unlimited', sms: 'Unlimited', cost: '$9.00', mu: '$6.00', sell: '$15.00' },
  telematics: { name: 'Tracker 50 MB', bill: 1, base: 'Operator C · LTE-M wholesale', mk: '180 countries', data: '50 MB', voice: 'None', sms: '50', cost: '$0.80', mu: '$1.10', sell: '$1.90' },
  camera: { name: 'Camera 10 GB', bill: 2, base: 'Operator A · Cat-1 pooled', mk: 'US, GB, DE', data: '10 GB', voice: 'None', sms: 'None', cost: '$8.50', mu: '$5.50', sell: '$14.00' },
};

function initBuilder(root) {
  const builder = root.querySelector('#builder');
  if (!builder) return;
  const fields = { name: 'pbName', base: 'pbBase', mk: 'pbMk', data: 'pbData', voice: 'pbVoice', sms: 'pbSms', cost: 'pbCost', mu: 'pbMu', sell: 'pbSell' };
  const apply = plan => {
    for (const [key, id] of Object.entries(fields)) builder.querySelector(`#${id}`).textContent = plan[key];
    builder.querySelectorAll('#pbBill span').forEach((s, i) => s.classList.toggle('on', i === plan.bill));
  };
  const buttons = builder.querySelectorAll('.dev button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      const plan = PLANS[button.dataset.d];
      if (reducedMotion) return apply(plan);
      builder.classList.add('swap');
      setTimeout(() => {
        apply(plan);
        builder.classList.remove('swap');
      }, 220);
    });
  });
}
