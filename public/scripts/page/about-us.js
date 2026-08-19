/* Custom site scripts extracted from the WordPress page "about-us".
   Regenerate with: npm run wp:scripts */

/* --- snippet 1 --- */
try {
(function(){
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        /* ===== YOUR ORIGINAL JS (UNCHANGED) ===== */

        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-active');
                const active = mobileMenu.classList.contains('is-active');
                hamburgerIcon.style.display = active ? 'none' : 'block';
                closeIcon.style.display = active ? 'block' : 'none';
            });
        }

        const setupMobileSubmenu = (toggleId, submenuId) => {
            const toggle = document.getElementById(toggleId);
            const submenu = document.getElementById(submenuId);
            if (!toggle || !submenu) return;

            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                toggle.classList.toggle('submenu-is-open');
                submenu.classList.toggle('is-open');
            });
        };

        setupMobileSubmenu('mobile-product-toggle', 'mobile-product-submenu');
        setupMobileSubmenu('mobile-solutions-toggle', 'mobile-solutions-submenu');
        setupMobileSubmenu('mobile-resources-toggle', 'mobile-resources-submenu');
        setupMobileSubmenu('mobile-blog-toggle', 'mobile-blog-submenu');

        function setupDesktopMenu(trigger, panel) {
            if (!trigger || !panel) return;

            let timer;
            const show = () => {
                clearTimeout(timer);
                panel.classList.add('is-active');
            };
            const hide = () => {
                timer = setTimeout(() => panel.classList.remove('is-active'), 150);
            };

            trigger.addEventListener('mouseenter', show);
            panel.addEventListener('mouseenter', show);
            trigger.addEventListener('mouseleave', hide);
            panel.addEventListener('mouseleave', hide);
        }

        setupDesktopMenu(
            document.getElementById('solutions-menu-trigger-area'),
            document.getElementById('solutions-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('resources-menu-trigger-area'),
            document.getElementById('resources-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('blog-menu-trigger-area'),
            document.getElementById('blog-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('product-menu-trigger-area'),
            document.getElementById('product-menu-panel')
        );
    });
})();
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 1 skipped:', e && e.message);
}

/* --- snippet 2 --- */
try {
(function(){
const lazyloadRunObserver = () => {
					const lazyloadBackgrounds = document.querySelectorAll( `.e-con.e-parent:not(.e-lazyloaded)` );
					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
						entries.forEach( ( entry ) => {
							if ( entry.isIntersecting ) {
								let lazyloadBackground = entry.target;
								if( lazyloadBackground ) {
									lazyloadBackground.classList.add( 'e-lazyloaded' );
								}
								lazyloadBackgroundObserver.unobserve( entry.target );
							}
						});
					}, { rootMargin: '200px 0px 200px 0px' } );
					lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 2 skipped:', e && e.message);
}

/* --- snippet 3 --- */
try {
(function(){
// --- 3. Founder Modal Logic ---
      const modal = document.getElementById("founder-modal");
      const openBtn = document.getElementById("open-leader-modal");
      const closeBtn = document.querySelector(".modal-close-btn");

      if (modal && openBtn && closeBtn) {
        openBtn.onclick = function () {
          modal.style.display = "flex";
        };
        closeBtn.onclick = function () {
          modal.style.display = "none";
        };
        window.onclick = function (event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        };
      }
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 3 skipped:', e && e.message);
}

/* --- snippet 4 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", function () {

  const emailPopupOne = document.querySelector('#emailPopup-1');

  // Buttons
  const getStartedBtns = document.querySelectorAll('.get-started');

  let popupOpen = 0;

 function openPopup() {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'flex';
  }
  window.closePopupOne = function () {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'none';
  }


  // =========================
  // CLOSE WHEN CLICK OUTSIDE
  // =========================
  if (emailPopupOne) {

    emailPopupOne.addEventListener('click', function (e) {

      if (e.target === this) {
        closePopupOne();
      }

    });

  }

  // =========================
  // .get-started BUTTON CLICK
  // =========================
  getStartedBtns.forEach(btn => {

    btn.addEventListener('click', function (e) {

      e.preventDefault();

      openPopup();

    });

  });

});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 4 skipped:', e && e.message);
}

/* --- snippet 5 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", () => {
  const mobileSubMenus = {
    products: {
      trigger: ".products-trigger",
      submenu: "#products-submenu",
      backBtn: ".products-back-btn",
    },

    solutions: {
      trigger: ".solutions-trigger",
      submenu: "#solutions-submenu",
      backBtn: ".solutions-back-btn",
    },

    resources: {
      trigger: ".resources-trigger",
      submenu: "#resources-submenu",
      backBtn: ".resources-back-btn",
    },

    blog: {
      trigger: ".blog-trigger",
      submenu: "#blog-submenu",
      backBtn: ".blog-back-btn",
    },

    caseStudies: {
      trigger: ".case-studies-trigger",
      submenu: "#case-studies-submenu",
      backBtn: ".case-studies-back-btn",
    },
  };

  Object.values(mobileSubMenus).forEach((menu) => {
    const trigger = document.querySelector(menu.trigger);
    const submenu = document.querySelector(menu.submenu);
    const backBtn = document.querySelector(menu.backBtn);

    // Open submenu
    trigger?.addEventListener("click", (e) => {
      e.preventDefault();

      submenu?.classList.add("active");
    });

    // Back to main menu
    backBtn?.addEventListener("click", (e) => {
      e.preventDefault();

      submenu?.classList.remove("active");
    });
  });
});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 5 skipped:', e && e.message);
}

/* --- snippet 6 --- */
try {
(function(){
/* The "Our Journey" timeline: hold one screen still and slide the drawing
   across it. The stage is held by `position: sticky` (see wp-polish.css), so
   the only thing left to do here is move the drawing — no pinning classes to
   toggle, and nothing that forces the page to lay out again mid-scroll. */
(function(){
  const wrap  = document.getElementById('timeline-section');
  const stage = wrap && wrap.querySelector('.e-con-inner');
  /* Two drawings ship in this section, a wide one and a tall one for phones.
     The effect belongs to the wide one; the other is display:none up here. */
  const svg   = wrap && wrap.querySelector('.animate-timeline:not(.elementor-hidden-desktop) svg');
  if(!wrap || !stage || !svg) return;

  const MQ = window.matchMedia('(min-width:768px)');
  const clamp01 = n => n < 0 ? 0 : n > 1 ? 1 : n;

  /* How far down the window the stage is stuck — the height of the sticky
     header. Measured, because it is also where the scroll starts counting. */
  let stageTop = 0;

  /* Where each dashed stem sits along the drawing, as a fraction of its width.
     Document order is not left to right — the 2023 stem is authored last — so
     drawing them by index drew them out of order. Both numbers come from the
     viewBox, which no amount of scrolling or resizing changes. */
  const vbWidth = (svg.viewBox && svg.viewBox.baseVal.width) || 0;
  const stems = Array.prototype.map.call(
    svg.querySelectorAll('[stroke-dasharray]'),
    el => {
      const box = el.getBBox();
      return {
        el,
        at:  vbWidth ? (box.x + box.width / 2) / vbWidth : 0,
        len: el.getTotalLength ? el.getTotalLength() : 100,
      };
    }
  );

  function reset(){
    wrap.style.height = '';
    wrap.style.removeProperty('--stage-top');
    svg.style.transform = '';
    stems.forEach(s => { s.el.style.strokeDashoffset = ''; });
  }

  /* Make the section as tall as the drawing needs and no taller: one screen to
     stand in, plus a little over a pixel of scroll for every pixel the drawing
     has to travel. The mirrored CSS asked for four screens no matter what the
     drawing measured, so on a short window most of that scroll was spent on a
     drawing that had already finished moving. */
  function measure(){
    if(!MQ.matches){ reset(); return; }

    /* The site header is sticky, so a stage stuck to the top of the window
       would spend the whole section with its first line behind it. Start
       below it instead — the header keeps its height as the page scrolls, so
       one measurement holds. */
    const header = document.querySelector('.elementor-location-header');
    stageTop = header ? Math.round(header.getBoundingClientRect().height) : 0;
    wrap.style.setProperty('--stage-top', stageTop + 'px');

    const over = Math.max(0, svg.getBoundingClientRect().width - stage.clientWidth);
    wrap.style.height = (stage.offsetHeight + over * 1.3) + 'px';
  }

  function update(){
    if(!MQ.matches){ reset(); return; }

    /* The stage stays stuck for exactly as long as the section is taller than
       it, which is the whole of the scroll this effect gets. On a window wide
       enough to hold the whole drawing there is nothing to travel, so it just
       sits there, drawn. (Not reset(): that would hand the section back its
       four screens of scroll and give it nothing to do with them.) */
    const travel = wrap.offsetHeight - stage.offsetHeight;
    if(travel <= 0){
      svg.style.transform = '';
      stems.forEach(s => { s.el.style.strokeDashoffset = '0'; });
      return;
    }
    /* Counted from the moment the stage sticks, which is when the top of the
       section reaches the bottom of the header — not the top of the window.
       Out by those few dozen pixels, the drawing was still moving after the
       stage had started to leave. */
    const progress = clamp01((stageTop - wrap.getBoundingClientRect().top) / travel);

    const stageW   = stage.clientWidth;
    const drawW    = svg.getBoundingClientRect().width;
    const maxShift = Math.max(0, drawW - stageW);
    svg.style.transform = `translate3d(${-maxShift * progress}px, 0, 0)`;

    /* Each stem draws its dots over the stretch of scroll just after it comes
       in from the right, so they arrive with the year they belong to rather
       than all at once. The stretch is shortened for the stems that come in
       late, because the drawing stops moving before they reach the middle and
       a stem left half drawn is worse than a fast one. */
    stems.forEach(s => {
      const entry = maxShift ? clamp01((s.at * drawW - stageW * 0.95) / maxShift) : 0;
      const span  = Math.max(0.08, Math.min(0.22, 1 - entry));
      const p     = clamp01((progress - entry) / span);
      s.el.style.strokeDashoffset = s.len * (1 - p);
    });
  }

  /* One pass per frame at most, and a remeasure only on the frames that asked
     for one — a window drag fires resize far faster than it can be answered. */
  let ticking = false;
  let pendingMeasure = false;

  function frame(){
    ticking = false;
    if(pendingMeasure){ pendingMeasure = false; measure(); }
    update();
  }

  function schedule(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  function remeasure(){ pendingMeasure = true; schedule(); }

  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', remeasure);
  if(MQ.addEventListener) MQ.addEventListener('change', remeasure);
  /* The drawing is sized in vh, so its width is only final once the fonts and
     the rest of the page have settled; measure again when the load event says
     they have. */
  window.addEventListener('load', remeasure);

  /* The first pass runs now rather than a frame from now, so the drawing is
     in place before the section is ever painted. */
  measure();
  update();
})();


document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".eSim-card").forEach(card => {

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.className = "brush-canvas";
        card.prepend(canvas);

        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = card.clientWidth;
            canvas.height = card.clientHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        // Gradient Colors
        const colors = [
            "#FF6E24",
            "#FF6622",
            "#FF5E1B",
            "#FF5613",
            "#FF4D0A",
            "#FF4500"
        ];

        function drawBrush(x, y) {

            // Slightly denser brush
            for (let i = 0; i < 60; i++) {

                const angle = Math.random() * Math.PI * 2;

                // Brush spread (increase for bigger brush)
                const distance = Math.random() * 12;

                const px = x + Math.cos(angle) * distance;
                const py = y + Math.sin(angle) * distance;

                // Particle size
                const size = Math.random() * 0.9 + 0.2;

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);

                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.globalAlpha = Math.random() * 0.35 + 0.10;

                ctx.fill();
            }
        }

        card.addEventListener("mousemove", (e) => {

            const rect = card.getBoundingClientRect();

            drawBrush(
                e.clientX - rect.left,
                e.clientY - rect.top
            );

        });

        function fade() {

            // Lower = longer trail
            ctx.fillStyle = "rgba(255,255,255,0.015)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            requestAnimationFrame(fade);

        }

        fade();

        card.addEventListener("mouseleave", () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

    });

});;
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 6 skipped:', e && e.message);
}