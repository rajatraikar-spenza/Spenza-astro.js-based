/* Custom site scripts extracted from the WordPress page "esim-compatibility-checker".
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
/* =========================================================
   eSIM COMPATIBLE DEVICES - COMPLETE WORKING CODE
========================================================= */

/* =========================================================
   COMPLETE eSIM COMPATIBLE DEVICES LIST
========================================================= */

const eSIMCompatibleDevices = [
  {
    brand: "Apple",
    smartphones: [
      "iPhone XS",
      "iPhone XS Max",
      "iPhone XR",
      "iPhone 11",
      "iPhone 11 Pro",
      "iPhone 11 Pro Max",
      "iPhone SE (2020)",
      "iPhone 12",
      "iPhone 12 mini",
      "iPhone 12 Pro",
      "iPhone 12 Pro Max",
      "iPhone 13",
      "iPhone 13 mini",
      "iPhone 13 Pro",
      "iPhone 13 Pro Max",
      "iPhone SE (2022)",
      "iPhone 14",
      "iPhone 14 Plus",
      "iPhone 14 Pro",
      "iPhone 14 Pro Max",
      "iPhone 15",
      "iPhone 15 Plus",
      "iPhone 15 Pro",
      "iPhone 15 Pro Max",
      "iPhone 16",
      "iPhone 16 Plus",
      "iPhone 16 Pro",
      "iPhone 16 Pro Max",
      "iPhone 16e",
      "iPhone 17",
      "iPhone 17 Air",
      "iPhone 17 Pro",
      "iPhone 17 Pro Max",
      "iPhone 17e"
    ],
    tablets: [
      "iPad Pro 11-inch (2018+, Cellular)",
      "iPad Pro 12.9-inch (3rd Gen+, Cellular)",
      "iPad Pro 13-inch (M4, Cellular)",
      "iPad Air (3rd Gen+, Cellular)",
      "iPad Air 11-inch (M2/M3, Cellular)",
      "iPad Air 13-inch (M2/M3, Cellular)",
      "iPad mini (5th Gen+, Cellular)",
      "iPad mini (A17 Pro, Cellular)",
      "iPad (10th Gen, Cellular)",
      "iPad (11th Gen, Cellular)"
    ]
  },

  {
    brand: "Samsung",
    smartphones: [
      "Galaxy S20",
      "Galaxy S20+",
      "Galaxy S20 Ultra",
      "Galaxy S21",
      "Galaxy S21+",
      "Galaxy S21 Ultra",
      "Galaxy S22",
      "Galaxy S22+",
      "Galaxy S22 Ultra",
      "Galaxy S23",
      "Galaxy S23+",
      "Galaxy S23 Ultra",
      "Galaxy S24",
      "Galaxy S24+",
      "Galaxy S24 Ultra",
      "Galaxy S24 FE",
      "Galaxy S25",
      "Galaxy S25 Edge",
      "Galaxy S25+",
      "Galaxy S25 Ultra",
      "Galaxy S25 FE",
      "Galaxy S26",
      "Galaxy S26+",
      "Galaxy S26 Ultra",
      "Galaxy Z Fold (Original)",
      "Galaxy Z Fold3",
      "Galaxy Z Fold5",
      "Galaxy Z Fold6",
      "Galaxy Z Fold7",
      "Galaxy Z Flip5",
      "Galaxy Z Flip6",
      "Galaxy Z Flip7",
      "Galaxy Z Flip7 FE",
      "Galaxy Z TriFold",
      "Galaxy A17",
      "Galaxy A23 5G",
      "Galaxy A35",
      "Galaxy A36",
      "Galaxy A54 5G",
      "Galaxy A55 5G",
      "Galaxy A56",
      "Galaxy A57 5G",
      "Galaxy XCover7 Pro"
    ],
    tablets: [
      "Galaxy Tab S9",
      "Galaxy Tab S9+",
      "Galaxy Tab S9 Ultra",
      "Galaxy Tab S10+",
      "Galaxy Tab S10 Ultra"
    ]
  },

  {
    brand: "Google",
    smartphones: [
      "Pixel 4",
      "Pixel 4 XL",
      "Pixel 4a",
      "Pixel 4a 5G",
      "Pixel 5",
      "Pixel 5a",
      "Pixel 6",
      "Pixel 6 Pro",
      "Pixel 6a",
      "Pixel 7",
      "Pixel 7 Pro",
      "Pixel 7a",
      "Pixel Fold",
      "Pixel 8",
      "Pixel 8 Pro",
      "Pixel 8a",
      "Pixel 9",
      "Pixel 9 Pro",
      "Pixel 9 Pro XL",
      "Pixel 9 Pro Fold",
      "Pixel 10",
      "Pixel 10 Pro",
      "Pixel 10 Pro XL",
      "Pixel 10 Pro Fold"
    ],
    tablets: [
      "Pixel Tablet 2 (Cellular)"
    ]
  },

  {
    brand: "Motorola",
    smartphones: [
      "Razr (2019+)",
      "Razr 5G",
      "Razr+",
      "Razr 40",
      "Razr 40 Ultra",
      "Razr 50",
      "Razr 50 Ultra",
      "Razr+ (2024)",
      "Razr+ (2025)",
      "Razr Ultra (2025)",
      "Razr Ultra (2026)",
      "Razr 60",
      "Razr 60 Ultra",
      "Razr Fold",
      "Edge (2022+)",
      "Edge 40",
      "Edge 40 Pro",
      "Edge 40 Neo",
      "Edge 50",
      "Edge 50 Pro",
      "Edge 50 Ultra",
      "Edge 50 Fusion",
      "Edge 50 Neo",
      "Edge 60",
      "Edge 60 Pro",
      "Edge 60 Fusion",
      "Edge 60 Stylus",
      "Edge 60 Neo",
      "ThinkPhone",
      "ThinkPhone 25",
      "Moto G34",
      "Moto G35",
      "Moto G53",
      "Moto G54",
      "Moto G75",
      "Moto G77",
      "Moto G85",
      "Moto G86",
      "Moto G Power (2024)",
      "Moto G Power (2025)",
      "Moto G Power (2026)",
      "Moto G Stylus 5G"
    ],
    tablets: []
  },

  {
    brand: "OnePlus",
    smartphones: [
      "OnePlus 11",
      "OnePlus 12",
      "OnePlus 13",
      "OnePlus 13R",
      "OnePlus 13T",
      "OnePlus Open"
    ],
    tablets: []
  },

  {
    brand: "Nothing",
    smartphones: [
      "Nothing Phone (3a) Pro"
    ],
    tablets: []
  },

  {
    brand: "Oppo",
    smartphones: [
      "Find X5 Pro",
      "Find X6 Pro",
      "Find X7 Ultra",
      "Find X8",
      "Find X8 Pro",
      "Find X9 Pro",
      "Find N5",
      "Reno 15 Pro Max"
    ],
    tablets: []
  },

  {
    brand: "Vivo",
    smartphones: [
      "X90 Pro",
      "X100",
      "X100 Pro",
      "X200",
      "X200 Pro",
      "X200s",
      "X200T",
      "X200 FE",
      "X300",
      "X300 Pro",
      "V29",
      "V40 Series"
    ],
    tablets: []
  },

  {
    brand: "Realme",
    smartphones: [
      "Realme 14 Pro+",
      "Realme GT 7"
    ],
    tablets: []
  },

  {
    brand: "Honor",
    smartphones: [
      "Magic4 Pro",
      "Magic5 Pro",
      "Magic6 Pro",
      "Magic7 Pro",
      "Magic7 Lite",
      "Magic8 Pro",
      "Magic8 Pro Air",
      "Magic V2",
      "Magic V3",
      "Magic V5",
      "Magic Vs3",
      "Honor 90",
      "Honor 200",
      "Honor 200 Pro",
      "Honor 400",
      "Honor 400 Lite",
      "Honor 400 Pro"
    ],
    tablets: []
  },

  {
    brand: "Huawei",
    smartphones: [
      "P40",
      "P40 Pro",
      "Mate 40 Pro",
      "Pura 70 Pro"
    ],
    tablets: []
  },

  {
    brand: "Sony",
    smartphones: [
      "Xperia 1 IV",
      "Xperia 5 IV",
      "Xperia 1 V",
      "Xperia 5 V",
      "Xperia 1 VI",
      "Xperia 5 VI",
      "Xperia 1 VII"
    ],
    tablets: []
  }
];

/* =========================================================
   CREATE FLATTENED DEVICE LIST WITH BRAND INFO
========================================================= */

// This converts the structured data into a searchable list
const devices = [];
const deviceBrandMap = {}; // Track which brand each device belongs to

eSIMCompatibleDevices.forEach(brandData => {
  const allDevices = [...brandData.smartphones, ...brandData.tablets];
  
  allDevices.forEach(device => {
    devices.push(device);
    deviceBrandMap[device] = brandData.brand;
  });
});

// Remove duplicates and sort alphabetically
const uniqueDevices = [...new Set(devices)].sort();

/* =========================================================
   DOM ELEMENTS
========================================================= */

const input = document.getElementById("phone-search");
const list = document.getElementById("device-list");
const defaultText = document.getElementById("default-text");
const noResult = document.getElementById("no-result");
const typingText = document.getElementById("typing-text");

/* =========================================================
   RENDER FUNCTION - Enhanced with Brand Display
========================================================= */

function render(data) {
  list.innerHTML = "";
  
  if (data.length === 0) {
    list.style.display = "none";
    noResult.style.display = "block";
    defaultText.style.display = "none";
    return;
  }

  noResult.style.display = "none";
  defaultText.style.display = "none";
  list.style.display = "grid";

  data.forEach(item => {
    const li = document.createElement("li");
    li.className = "device-item";
    
    const brand = deviceBrandMap[item] || "Unknown";
    
    // Create device element with brand info
    li.innerHTML = `
      <div class="device-info">
        <span class="device-name">${item}</span>
        <span class="device-brand">${brand}</span>
      </div>
    `;
    
    // Add click handler
    li.addEventListener("click", function() {
      input.value = item;
      list.style.display = "none";
      defaultText.style.display = "none";
      noResult.style.display = "none";
    });
    
    li.addEventListener("mouseenter", function() {
      this.classList.add("hover");
    });
    
    li.addEventListener("mouseleave", function() {
      this.classList.remove("hover");
    });
    
    list.appendChild(li);
  });
}

/* =========================================================
   INITIAL STATE
========================================================= */

defaultText.style.display = "block";
list.style.display = "none";
noResult.style.display = "none";

/* =========================================================
   SEARCH FUNCTIONALITY
========================================================= */

input.addEventListener("input", function () {
  const value = this.value.toLowerCase().trim();
  
  if (value === "") {
    // Reset to initial state
    list.style.display = "none";
    noResult.style.display = "none";
    defaultText.style.display = "block";
    return;
  }

  // Filter devices based on input
  const filtered = uniqueDevices.filter(device =>
    device.toLowerCase().includes(value) ||
    deviceBrandMap[device].toLowerCase().includes(value)
  );

  render(filtered);
});

/* =========================================================
   TYPEWRITER EFFECT
========================================================= */

const suggestions = [
  "ie. iPhone 15 Pro",
  "ie. Samsung Galaxy S24",
  "ie. Google Pixel 8",
  "ie. iPad Pro",
  "ie. Galaxy Z Flip"
];

let i = 0;
let char = 0;
let deleting = false;
let stop = false;

function typeLoop() {
  if (stop) return;
  
  const current = suggestions[i];
  
  if (!deleting) {
    char++;
    typingText.textContent = current.substring(0, char);
    
    if (char === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    char--;
    typingText.textContent = current.substring(0, char);
    
    if (char === 0) {
      deleting = false;
      i = (i + 1) % suggestions.length;
    }
  }
  
  setTimeout(typeLoop, deleting ? 40 : 80);
}

// Start typewriter effect
typeLoop();

/* =========================================================
   STOP TYPEWRITER ON FOCUS
========================================================= */

input.addEventListener("focus", () => {
  stop = true;
  typingText.classList.add("hide");
});

/* =========================================================
   RESUME TYPEWRITER IF INPUT EMPTY ON BLUR
========================================================= */

input.addEventListener("blur", () => {
  if (input.value.trim() === "") {
    stop = false;
    typingText.classList.remove("hide");
    typeLoop();
  }
});

/* =========================================================
   DEVICE DETAILS MODAL (OPTIONAL)
========================================================= */

function showDeviceDetails(deviceName) {
  const brand = deviceBrandMap[deviceName];
  
  // Find the device info from the main array
  const brandData = eSIMCompatibleDevices.find(b => b.brand === brand);
  const isSmartphone = brandData.smartphones.includes(deviceName);
  const deviceType = isSmartphone ? "Smartphone" : "Tablet";
  
  console.log(`
    Device: ${deviceName}
    Brand: ${brand}
    Type: ${deviceType}
    eSIM Supported: Yes ✓
  `);
}

/* =========================================================
   EXPORT FOR USE
========================================================= */

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    eSIMCompatibleDevices,
    uniqueDevices,
    deviceBrandMap,
    showDeviceDetails
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