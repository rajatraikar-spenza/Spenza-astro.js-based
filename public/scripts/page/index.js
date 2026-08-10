/* Custom site scripts extracted from the WordPress page "index".
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
  console.debug('[wp-page-script] snippet 3 skipped:', e && e.message);
}

/* --- snippet 4 --- */
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
  console.debug('[wp-page-script] snippet 4 skipped:', e && e.message);
}

/* --- snippet 5 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", function () {

  const emailPopupOne = document.querySelector('#emailPopup-1');

  // Buttons
  const getStartedBtns = document.querySelectorAll('.get-started');
  const bookDemoBtns = document.querySelectorAll('#book-demo-1');

  let popupOpen = 0;

  // =========================
  // OPEN POPUP
  // =========================
  window.openPopupOne = function () {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'flex';
  }

  // =========================
  // CLOSE POPUP
  // =========================
  window.closePopup = function () {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'none';
  }

  // =========================
  // CLOSE WHEN CLICK OUTSIDE
  // =========================
  if (emailPopupOne) {

    emailPopupOne.addEventListener('click', function (e) {

      if (e.target === this) {
        closePopup();
      }

    });

  }

  // =========================
  // .get-started BUTTON CLICK
  // =========================
  getStartedBtns.forEach(btn => {

    btn.addEventListener('click', function (e) {

      e.preventDefault();

      openPopupOne();

    });

  });

  // =========================
  // #book-demo-1 BUTTON CLICK
  // =========================
  bookDemoBtns.forEach(btn => {

    btn.addEventListener('click', function (e) {

      e.preventDefault();

      openPopupOne();

    });

  });

  // =========================
  // EXIT INTENT POPUP
  // =========================
  document.addEventListener("mouseleave", function (event) {

    if (event.clientY <= 0 && popupOpen === 0) {

      openPopupOne();

      popupOpen++;

    }

  });

});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 5 skipped:', e && e.message);
}

/* --- snippet 6 --- */
try {
(function(){
// Stories Section - Expandable Cards
        document.addEventListener('DOMContentLoaded', function() {
            const storiesGrid = document.getElementById('storiesGrid');
            if (!storiesGrid) return;

            const storyCards = storiesGrid.querySelectorAll('.story-card');
            let isMobile = window.innerWidth <= 768;

            // Handle window resize
            window.addEventListener('resize', function() {
                isMobile = window.innerWidth <= 768;
            });

            storyCards.forEach(card => {
                // Handle hover on desktop
                card.addEventListener('mouseenter', function() {
                    if (!isMobile && this.classList.contains('collapsed')) {
                        expandCard(this);
                    }
                });

                // Handle click for touch devices and desktop
                card.addEventListener('click', function(e) {
                    if (isMobile) {
                        // On mobile, scroll to center the card
                        scrollToCard(this);
                    } else if (this.classList.contains('collapsed')) {
                        e.preventDefault();
                        expandCard(this);
                    }
                });
            });

            function expandCard(cardToExpand) {
                // Collapse all cards first and switch to collapsed images
                storyCards.forEach(card => {
                    if (card !== cardToExpand) {
                        card.classList.remove('expanded');
                        card.classList.add('collapsed');
                        // Switch to collapsed image
                        const img = card.querySelector('.story-card-image img');
                        const collapsedImg = card.getAttribute('data-collapsed-img');
                        if (img && collapsedImg) {
                            img.src = collapsedImg;
                        }
                    }
                });

                // Expand the clicked/hovered card and switch to expanded image
                cardToExpand.classList.remove('collapsed');
                cardToExpand.classList.add('expanded');
                const img = cardToExpand.querySelector('.story-card-image img');
                const expandedImg = cardToExpand.getAttribute('data-expanded-img');
                if (img && expandedImg) {
                    img.src = expandedImg;
                }
            }

            function scrollToCard(card) {
                const container = storiesGrid;
                const cardRect = card.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollLeft = container.scrollLeft +
                    (cardRect.left - containerRect.left) -
                    (containerRect.width - cardRect.width) / 2;

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }

            // Scroll indicators
            const indicators = document.querySelectorAll('#storiesIndicators .indicator');

            // Update indicators on scroll
            if (storiesGrid && indicators.length) {
                storiesGrid.addEventListener('scroll', function() {
                    const scrollLeft = storiesGrid.scrollLeft;
                    const cardWidth = storyCards[0].offsetWidth + 16; // including gap
                    const activeIndex = Math.round(scrollLeft / cardWidth);

                    indicators.forEach((ind, idx) => {
                        ind.classList.toggle('active', idx === activeIndex);
                    });
                });

                // Click on indicators to scroll
                indicators.forEach((indicator, index) => {
                    indicator.addEventListener('click', function() {
                        const cardWidth = storyCards[0].offsetWidth + 16;
                        storiesGrid.scrollTo({
                            left: cardWidth * index,
                            behavior: 'smooth'
                        });
                    });
                });
            }
        });
(function () {
  const mq = window.matchMedia('(max-width: 499px)');

  function handleChange(e) {
    const cards = document.querySelectorAll('#storiesGrid .story-card');
    if (!cards.length) return;

    cards.forEach((card, index) => {
      if (index === 0) return; // keep first card unchanged

      if (e.matches) {
        // Mobile
        card.classList.remove('collapsed');
        card.classList.add('expanded');
      } else {
        // Desktop
        card.classList.remove('expanded');
        card.classList.add('collapsed');
      }
    });
  }

  // Run once on load
  handleChange(mq);

  // Listen for breakpoint changes
  mq.addEventListener('change', handleChange);
})();
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 6 skipped:', e && e.message);
}

/* --- snippet 7 --- */
try {
(function(){
const steps = document.querySelectorAll(".step");

      let current = 0;

      setInterval(() => {
        steps.forEach((step) => {
          step.classList.remove("active");
        });

        steps[current].classList.add("active");

        current++;

        if (current >= steps.length) {
          current = 0;
        }
      }, 2000);
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 7 skipped:', e && e.message);
}

/* --- snippet 8 --- */
try {
(function(){
const sectionTwo = document.querySelector("#product-sec-3");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sectionTwo.classList.add("active");
      } else {
        sectionTwo.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.4
  }
);

observer.observe(sectionTwo);
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 8 skipped:', e && e.message);
}

/* --- snippet 9 --- */
try {
(function(){
const cards = document.querySelectorAll(".client-card");

      cards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
          // Remove active class from all cards
          cards.forEach((c) => c.classList.remove("active"));
          // Add active class to hovered card
          this.classList.add("active");
        });
      });

      // Keep the first card active when mouse leaves
      const container = document.querySelector(".clients-container");
      container.addEventListener("mouseleave", function () {
        cards.forEach((c) => c.classList.remove("active"));
        cards[0].classList.add("active");
      });
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 9 skipped:', e && e.message);
}

/* --- snippet 10 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", function () {

  const tabs = document.querySelectorAll(".tab-item");
  const contents = document.querySelectorAll(".content-item");

  tabs.forEach((tab, index) => {

    tab.addEventListener("click", () => {

      // prevent re-click
      if (tab.classList.contains("active")) return;

      // remove all active
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      // activate clicked
      tab.classList.add("active");

      // activate right content
      if (contents[index]) {
        contents[index].classList.add("active");
      }

    });

  });

});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 10 skipped:', e && e.message);
}