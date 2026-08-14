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
(function(){
  const wrap = document.getElementById('timeline-section');
  const svg  = wrap && wrap.querySelector('svg');
  if(!wrap || !svg) return;

  const dashes = svg.querySelectorAll('[stroke-dasharray]');
  const MQ = window.matchMedia('(min-width:768px)');

  function reset(){
    wrap.classList.remove('is-pinned','is-pinned-bottom');
    svg.style.transform = '';
    dashes.forEach(el => { el.style.strokeDashoffset = ''; });
  }

  function update(){
    if(!MQ.matches){ reset(); return; }

    const wrapTop = wrap.offsetTop;
    const wrapH   = wrap.offsetHeight;
    const vh      = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    const start = wrapTop;
    const end   = wrapTop + wrapH - vh;

    if(scrollY < start){
      wrap.classList.remove('is-pinned','is-pinned-bottom');
    } else if(scrollY >= start && scrollY <= end){
      wrap.classList.add('is-pinned');
      wrap.classList.remove('is-pinned-bottom');
    } else {
      wrap.classList.remove('is-pinned');
      wrap.classList.add('is-pinned-bottom');
    }

    let progress = (scrollY - start) / (end - start);
    progress = Math.max(0, Math.min(1, progress));

    const maxShift = svg.getBoundingClientRect().width - window.innerWidth;
    svg.style.transform = `translateX(${-maxShift * progress}px)`;

    dashes.forEach((el, i) => {
      const len = el.getTotalLength ? el.getTotalLength() : 100;
      const p = Math.max(0, Math.min(1, (progress * dashes.length) - i));
      el.style.strokeDashoffset = len * (1 - p);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(()=>{ update(); ticking=false; }); ticking = true; }
  }, {passive:true});
  window.addEventListener('resize', update);
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