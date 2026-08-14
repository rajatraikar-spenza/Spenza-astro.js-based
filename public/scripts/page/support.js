/* Custom site scripts extracted from the WordPress page "support".
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
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".spenza-icon-box").forEach(card => {

        // Make sure the card clips the canvas
        card.style.position = "relative";
        card.style.overflow = "hidden";

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.className = "brush-canvas";
        card.prepend(canvas);

        const ctx = canvas.getContext("2d");

        function resize() {
            const rect = card.getBoundingClientRect();

            canvas.width = rect.width;
            canvas.height = rect.height;

            canvas.style.width = "100%";
            canvas.style.height = "100%";
        }

        resize();
        window.addEventListener("resize", resize);

        const colors = [
            "#FFFFFF",
            "rgba(255,255,255,1)",
            "rgba(255,255,255,1)",
            "rgba(255,255,255,1)",
            "rgba(255,255,255,1)",
            "rgba(255,255,255,1)"
        ];

        function drawBrush(x, y) {

            // Prevent drawing outside the canvas
            if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
                return;
            }

            for (let i = 0; i < 60; i++) {

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 12;

                const px = x + Math.cos(angle) * distance;
                const py = y + Math.sin(angle) * distance;

                // Skip particles outside canvas
                if (
                    px < 0 ||
                    py < 0 ||
                    px > canvas.width ||
                    py > canvas.height
                ) {
                    continue;
                }

                const size = Math.random() * 0.9 + 0.2;

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.globalAlpha = Math.random() * 0.35 + 0.1;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }

        let mouseInside = false;

        card.addEventListener("mousemove", (e) => {

            mouseInside = true;

            const rect = card.getBoundingClientRect();

            drawBrush(
                e.clientX - rect.left,
                e.clientY - rect.top
            );

        });

        card.addEventListener("mouseenter", () => {
            mouseInside = true;
        });

        card.addEventListener("mouseleave", () => {
            mouseInside = false;

            // Smoothly clear when mouse leaves
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        function fade() {

            if (mouseInside) {
                ctx.save();
                ctx.globalCompositeOperation = "destination-out";
                ctx.fillStyle = "rgba(0,0,0,0.03)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            requestAnimationFrame(fade);
        }

        fade();

    });

});



/* ===========================================
   AI SEARCH DEMO
=========================================== */

const conversations = [
    {
        question: "Why is my data slow?",
        answer: "Your network looks healthy, but you're currently connected to a congested cell tower. Switching to 5G Auto or Wi-Fi should improve performance."
    },
    {
        question: "Is roaming on?",
        answer: "Roaming is currently turned off. You can enable it anytime from your account settings before you travel."
    },
    {
        question: "When does my plan renew?",
        answer: "Your current plan renews automatically on the 12th of every month. We'll send you a reminder before renewal."
    },
    {
        question: "How much data do I have left?",
        answer: "You have 18.6 GB of high-speed data remaining. Your allowance resets in 9 days."
    },
    {
        question: "Can I activate my eSIM?",
        answer: "Yes. Simply scan your carrier's QR code or install the eSIM profile directly from the app."
    },
    {
        question: "Why can't I make calls?",
        answer: "Everything looks good on your account. Try restarting your device or refreshing your network settings."
    },
    {
        question: "Can I keep my number?",
        answer: "Absolutely. Number transfer is supported and normally completes within a few hours."
    },
    {
        question: "How do I contact support?",
        answer: "You can start a live chat anytime or request a callback from one of our support specialists."
    }
];

/* ===========================================
   ELEMENTS
=========================================== */

const conversation = document.getElementById("conversation");
const typedText = document.getElementById("typedText");
const sendBtn = document.getElementById("sendBtn");

/* ===========================================
   SETTINGS
=========================================== */

let currentIndex = 0;

const MAX_MESSAGES = 6;

const TYPE_SPEED_MIN = 25;
const TYPE_SPEED_MAX = 65;

const ANSWER_SPEED_MIN = 12;
const ANSWER_SPEED_MAX = 25;

const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

const random = (min,max)=>
    Math.floor(Math.random()*(max-min+1))+min;

/* ===========================================
   TYPE QUESTION IN SEARCH BAR
=========================================== */

async function typeQuestion(text) {

    typedText.textContent = "";

    for (const letter of text) {

        typedText.textContent += letter;

        await wait(random(TYPE_SPEED_MIN, TYPE_SPEED_MAX));

    }

}

/* ===========================================
   DELETE QUESTION
=========================================== */

async function deleteQuestion() {

    while (typedText.textContent.length > 0) {

        typedText.textContent =
            typedText.textContent.slice(0, -1);

        await wait(12);

    }

}

/* ===========================================
   SEND BUTTON ANIMATION
=========================================== */

async function animateSend() {

    sendBtn.classList.add("sending");

    await wait(450);

    sendBtn.classList.remove("sending");

}

/* ===========================================
   SEARCH BAR PULSE
=========================================== */

async function pulseSearchBar() {

    const box = document.querySelector(".search-box");

    box.style.transform = "scale(.985)";
    box.style.transition = "all .25s ease";

    await wait(120);

    box.style.transform = "scale(1)";

}

/* ===========================================
   THINKING LOADER
=========================================== */

function createLoader() {

    const loader = document.createElement("div");

    loader.className = "loading";

    loader.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    return loader;

}

/* ===========================================
   HUMAN TYPING EFFECT
=========================================== */

async function typeAnswer(element, text) {

    element.textContent = "";

    for (const letter of text) {

        element.textContent += letter;

        let speed = random(
            ANSWER_SPEED_MIN,
            ANSWER_SPEED_MAX
        );

        // Pause naturally after punctuation
        if (letter === "." || letter === "," || letter === "?") {
            speed += 120;
        }

        await wait(speed);

    }

}
/* ===========================================
   CREATE QUESTION + ANSWER MESSAGE
=========================================== */

async function createConversation(item) {

    const wrapper = document.createElement("div");
    wrapper.className = "message";

    wrapper.innerHTML = `
        <div class="question">
            ${item.question}
        </div>

        <div class="answer"></div>
    `;

    conversation.appendChild(wrapper);

    // Trigger CSS animation
    requestAnimationFrame(() => {
        wrapper.classList.add("show");
    });

    smoothScroll();

    await wait(350);

    const answer = wrapper.querySelector(".answer");

    // Loading animation
    const loader = createLoader();

    answer.appendChild(loader);

    await wait(1400);

    loader.remove();

    await typeAnswer(answer, item.answer);

}

/* ===========================================
   SMOOTH SCROLL
=========================================== */

function smoothScroll() {

    conversation.scrollTo({

        top: conversation.scrollHeight,

        behavior: "smooth"

    });

}

/* ===========================================
   REMOVE OLD CONVERSATIONS
=========================================== */

function removeOldMessages() {

    const messages = conversation.querySelectorAll(".message");

    if (messages.length <= MAX_MESSAGES)
        return;

    const first = messages[0];

    first.style.transition =
        "all .45s cubic-bezier(.22,.61,.36,1)";

    first.style.opacity = "0";

    first.style.transform =
        "translateY(-40px)";

    setTimeout(() => {

        first.remove();

    }, 450);

}

/* ===========================================
   MESSAGE STAGGER EFFECT
=========================================== */

async function revealMessage(message){

    message.classList.add("show");

    await wait(300);

}

/* ===========================================
   RESET SEARCH BAR
=========================================== */

async function resetSearch(){

    await deleteQuestion();

    await wait(250);

}

/* ===========================================
   PROCESS ONE SEARCH
=========================================== */

async function performSearch(item){

    // Type question
    await typeQuestion(item.question);

    await wait(500);

    // Tiny pulse
    await pulseSearchBar();

    // Send animation
    await animateSend();

    await wait(200);

    // Move into chat
    await createConversation(item);

    // Clear search box
    await resetSearch();

    // Remove old messages
    removeOldMessages();

}
/* ===========================================
   SEARCH FLOW
=========================================== */

async function performSearch(item){

    // Type into search bar
    await typeQuestion(item.question);

    await wait(400);

    // Search bar press effect
    await pulseSearchBar();

    // Paper plane animation
    await animateSend();

    await wait(150);

    // Create conversation
    const message = await createConversation(item);

    // Fly animation
    animateMessage(message);

    // Clear search
    await resetSearch();

    removeOldMessages();

    await wait(1200);

}


/* ===========================================
   MESSAGE ENTRANCE
=========================================== */

function animateMessage(message){

    message.animate([
        {
            opacity:0,
            transform:"translateY(40px) scale(.96)"
        },
        {
            opacity:1,
            transform:"translateY(0px) scale(1)"
        }

    ],{

        duration:650,

        easing:"cubic-bezier(.22,.61,.36,1)",

        fill:"forwards"

    });

}


/* ===========================================
   CHAT AUTO SCROLL
=========================================== */

function smoothScroll(){

    const target = conversation.scrollHeight;

    const start = conversation.scrollTop;

    const distance = target - start;

    const duration = 600;

    let startTime = null;

    function animation(current){

        if(!startTime){

            startTime = current;

        }

        const progress = Math.min((current-startTime)/duration,1);

        conversation.scrollTop =
            start + distance * ease(progress);

        if(progress < 1){

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}


/* ===========================================
   EASING
=========================================== */

function ease(t){

    return 1-Math.pow(1-t,3);

}


/* ===========================================
   RANDOM THINKING TIME
=========================================== */

async function thinking(){

    await wait(random(900,1800));

}


/* ===========================================
   REMOVE MESSAGE BEAUTIFULLY
=========================================== */

function removeOldMessages(){

    const messages =
        conversation.querySelectorAll(".message");

    if(messages.length <= MAX_MESSAGES)
        return;

    const first = messages[0];

    first.animate([

        {

            opacity:1,

            transform:"translateY(0)"

        },

        {

            opacity:0,

            transform:"translateY(-50px)"

        }

    ],{

        duration:500,

        easing:"ease"

    });

    setTimeout(()=>{

        first.remove();

    },500);

}
/* ===========================================
   SHUFFLE QUESTIONS
=========================================== */

let queue = [...conversations];

function shuffleQuestions() {

    queue.sort(() => Math.random() - 0.5);

}

/* ===========================================
   LOOP
=========================================== */

async function startDemo() {

    shuffleQuestions();

    while (true) {

        if (currentIndex >= queue.length) {

            currentIndex = 0;

            shuffleQuestions();

        }

        await performSearch(queue[currentIndex]);

        currentIndex++;

        // Small pause before next search
        await wait(random(1200, 2200));

    }

}

/* ===========================================
   SEARCH BAR GLOW
=========================================== */

function startGlow() {

    const box = document.querySelector(".search-box");

    box.animate([

        {
            boxShadow: "0 0 0 rgba(0,0,0,0)"
        },

        {
            boxShadow: "0 0 25px rgba(0,0,0,.08)"
        },

        {
            boxShadow: "0 0 0 rgba(0,0,0,0)"
        }

    ], {

        duration: 1800,

        easing: "ease-in-out"

    });

}

/* ===========================================
   START
=========================================== */

window.addEventListener("load", async () => {

    await wait(800);

    startGlow();

    startDemo();

});


(function(){
  document.querySelectorAll('video.elementor-video').forEach(video => {
    video.loop = true;
    video.muted = true;
    video.play().catch(()=>{}); // handles autoplay-block edge cases

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(()=>{});
    });
  });
})();;
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 5 skipped:', e && e.message);
}