/* Custom site scripts extracted from the WordPress page "mvno-calculator".
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
   MVNO Financial Calculator
   Part 1
========================================================= */

/*
   Everything is wrapped in this IIFE so all the const/let
   declarations below live in their own private scope instead
   of the global one. If this file ever gets accidentally
   enqueued/included twice on the page (a common WordPress
   issue with themes + page builders both loading the same
   script), this prevents "Identifier has already been
   declared" syntax errors.
*/
(function(){

"use strict";

/* =========================================================
   DOM Elements
========================================================= */

const elements = {

    form: document.getElementById("mvnoCalculator"),

    upfront: document.getElementById("upfront"),
    opex: document.getElementById("opex"),
    months: document.getElementById("months"),

    initial: document.getElementById("initial"),
    growth: document.getElementById("growth"),
    churn: document.getElementById("churn"),

    calculate: document.getElementById("recalc"),

    finalSubscribers: document.getElementById("m-finalSubs"),
    finalRevenue: document.getElementById("m-finalRev"),
    breakEven: document.getElementById("m-breakeven"),
    cumulativeProfit: document.getElementById("m-cumProfit"),

    projectionLabel: document.getElementById("projectionLabel"),

    tableBody: document.querySelector("#projTable tbody"),

    downloadReport: document.getElementById("downloadReport"),
    downloadCSV: document.getElementById("dlCsv"),
    downloadExcel: document.getElementById("dlXlsx"),
    downloadPDF: document.getElementById("dlPdf")

};

/* =========================================================
   Plan mix: ACPU and ARPU are not entered directly. Each
   category carries three example plans with fixed allowances; their
   cost and price, editable,
   weighted by the share of subscribers on each, are the ACPU
   and ARPU the projection uses. Edits are kept per category,
   so switching away and back does not lose them.
========================================================= */

const PLAN_SETS = {

    iot: [
        { name: "A \u2014 Low usage", data: "100 MB", cost: 2, price: 4, mix: 50 },
        { name: "B \u2014 Medium usage", data: "500 MB", cost: 5, price: 8, mix: 30 },
        { name: "C \u2014 High usage", data: "1 GB", cost: 10, price: 15, mix: 20 }
    ],

    mobile: [
        { name: "A \u2014 Basic", data: "1 GB", voice: "Unlimited talk & text", cost: 20, price: 25, mix: 50 },
        { name: "B \u2014 Standard", data: "5 GB", voice: "Unlimited talk & text", cost: 30, price: 40, mix: 30 },
        { name: "C \u2014 Premium", data: "20 GB", voice: "Unlimited talk & text", cost: 40, price: 70, mix: 20 }
    ]

};

const PLAN_DEFAULT = "mobile";

const plan = {
    rows: [...document.querySelectorAll(".mc-plan[data-plan]")],
    radios: [...document.querySelectorAll('input[name="planCat"]')],
    acpu: document.getElementById("mcAcpu"),
    arpu: document.getElementById("mcArpu"),
    mix: document.getElementById("mcMix"),
    error: document.getElementById("mcMixError"),
    cat: PLAN_DEFAULT,
    sets: {}
};

plan.inputs = plan.rows.flatMap(row => [...row.querySelectorAll('input[type="number"]')]);

function resetPlanSets(){
    plan.sets = JSON.parse(JSON.stringify(PLAN_SETS));
}

/* Fills the three rows from the current category. */
function loadPlans(){

    const set = plan.sets[plan.cat];

    plan.radios.forEach(r => { r.checked = r.value === plan.cat; });

    plan.rows.forEach((row, i) => {
        const p = set[i];
        row.querySelector(".mc-plan-name").textContent = p.name;
        row.querySelectorAll("span[data-k]").forEach(el => {
            el.textContent = p[el.dataset.k] ?? "";
            el.hidden = !p[el.dataset.k];
        });
        row.querySelectorAll("input[data-k]").forEach(input => {
            input.value = p[input.dataset.k];
        });
    });

}

/* Weighted by mix as a share of 100, so a mix that does not add up shows up
   in the total (and stops Calculate) rather than being quietly rescaled. */
function planTotals(){

    return plan.sets[plan.cat].reduce((t, p) => {
        const mix = Number(p.mix) || 0;
        t.acpu += (Number(p.cost) || 0) * mix / 100;
        t.arpu += (Number(p.price) || 0) * mix / 100;
        t.mix += mix;
        return t;
    }, { acpu: 0, arpu: 0, mix: 0 });

}

function formatCents(value){

    return value.toLocaleString("en-US", {
        style: "currency", currency: "USD",
        minimumFractionDigits: Number.isInteger(Math.round(value * 100) / 100) ? 0 : 2,
        maximumFractionDigits: 2
    });

}

function renderPlanTotals(){

    const t = planTotals();
    const off = Math.abs(t.mix - 100) > 0.01;

    if(plan.acpu) plan.acpu.textContent = formatCents(t.acpu);
    if(plan.arpu) plan.arpu.textContent = formatCents(t.arpu);
    if(plan.mix){
        plan.mix.textContent = +t.mix.toFixed(2) + "%";
        plan.mix.classList.toggle("is-off", off);
    }
    if(plan.error && !off) plan.error.textContent = "";

}

resetPlanSets();

/* =========================================================
   Calculator State
========================================================= */

const state = {

    inputs: {},

    projections: []

};

/* =========================================================
   Formatting Helpers
========================================================= */

function formatCurrency(value){

    return value.toLocaleString("en-US",{

        style:"currency",

        currency:"USD",

        maximumFractionDigits:0

    });

}

function formatNumber(value){

    return Math.round(value).toLocaleString("en-US");

}

/* =========================================================
   Input Helpers
========================================================= */

function getInputValue(input){

    return Number(input.value);

}

function getInputs(){

    return {

        upfrontCosts: getInputValue(elements.upfront),

        monthlyOperatingExpenses: getInputValue(elements.opex),

        acpu: planTotals().acpu,

        projectionMonths: Math.max(
            1,
            Math.min(
                200,
                getInputValue(elements.months)
            )
        ),

        initialSubscribers: getInputValue(elements.initial),

        monthlyGrowthRate:
            getInputValue(elements.growth) / 100,

        arpu: planTotals().arpu,

        churnRate:
            getInputValue(elements.churn) / 100

    };

}

/* =========================================================
   Validation
========================================================= */

function clearValidation(){

    document.querySelectorAll(

        ".field-error"

    ).forEach(error=>{

        error.textContent="";

    });

    document.querySelectorAll(

        ".is-invalid"

    ).forEach(input=>{

        input.classList.remove("is-invalid");

    });

}

function showError(input,message){

    input.classList.add("is-invalid");

    const error = input
        .closest(".form-group")
        .querySelector(".field-error");

    if(error){

        error.textContent = message;

    }

}

function validateInputs(){

    clearValidation();

    let valid = true;

    const requiredFields = [

        elements.upfront,
        elements.opex,
        elements.months,
        elements.initial,
        elements.growth,
        elements.churn,
        ...plan.inputs

    ];

    requiredFields.forEach(input=>{

        if(input.value.trim()===""){

            showError(

                input,

                "This field is required."

            );

            valid = false;

            return;

        }

        if(Number(input.value) < 0){

            showError(

                input,

                "Value cannot be negative."

            );

            valid = false;

        }

    });

    if(Number(elements.months.value) < 1){

        showError(

            elements.months,

            "Minimum value is 1."

        );

        valid = false;

    }

    const mix = planTotals().mix;

    if(plan.error) plan.error.textContent = "";

    if(Math.abs(mix - 100) > 0.01){

        if(plan.error) plan.error.textContent =
            `The plan mix adds up to ${+mix.toFixed(2)}%. It needs to total 100%.`;

        valid = false;

    }

    return valid;

}

/* =========================================================
   MVNO Financial Calculator
   Part 2
========================================================= */

/* =========================================================
   Financial Calculation Engine
========================================================= */

function calculateProjections(data){

    const projections = [];

    let subscribers = data.initialSubscribers;

    let cumulativeProfit = -data.upfrontCosts;

    for(let month = 1; month <= data.projectionMonths; month++){

        const churned = Math.floor(
            subscribers * data.churnRate
        );

        const added = Math.floor(
            subscribers * data.monthlyGrowthRate
        );

        subscribers = subscribers - churned + added;

        const revenue = subscribers * data.arpu;

        const costs =
            data.monthlyOperatingExpenses +
            (subscribers * data.acpu);

        const profit = revenue - costs;

        cumulativeProfit += profit;

        projections.push({

            month,

            subscribers,

            revenue,

            costs,

            profit,

            cumulativeProfit

        });

    }

    return projections;

}

/* =========================================================
   Summary Cards
========================================================= */

function renderSummary(){

    if(!state.projections.length){

        elements.finalSubscribers.textContent = "0";

        elements.finalRevenue.textContent = "$0";

        elements.breakEven.textContent = "—";

        elements.cumulativeProfit.textContent = "$0";

        return;

    }

    const final = state.projections[state.projections.length - 1];

    elements.finalSubscribers.textContent =
        formatNumber(final.subscribers);

    elements.finalRevenue.textContent =
        formatCurrency(final.revenue);

    elements.cumulativeProfit.textContent =
        formatCurrency(final.cumulativeProfit);

   const breakEvenIndex =
    state.projections.findIndex(
        (item, i) =>
            item.cumulativeProfit >= 0 && i > 0
    );

    elements.breakEven.textContent =
        breakEvenIndex === -1
            ? "Not Reached"
            : "Month " + state.projections[breakEvenIndex].month;

}

/* =========================================================
   Projection Heading
========================================================= */

function renderProjectionHeading(){

    elements.projectionLabel.textContent =
        state.inputs.projectionMonths;

}

/* =========================================================
   Projection Table
========================================================= */

function renderTable(){

    elements.tableBody.innerHTML = "";

    const evenIndex = state.projections.findIndex(
        (item, i) => item.cumulativeProfit >= 0 && i > 0
    );

    const sign = v => v < 0 ? "is-neg" : "is-pos";

    state.projections.forEach((item, i)=>{

        const row = document.createElement("tr");

        if(i === evenIndex) row.className = "is-even";

        row.innerHTML = `

            <td>${item.month}</td>

            <td>${formatNumber(item.subscribers)}</td>

            <td>${formatCurrency(item.revenue)}</td>

            <td>${formatCurrency(item.costs)}</td>

            <td class="${sign(item.profit)}">${formatCurrency(item.profit)}</td>

            <td class="${sign(item.cumulativeProfit)}">${formatCurrency(item.cumulativeProfit)}</td>

        `;

        elements.tableBody.appendChild(row);

    });

}

/* =========================================================
   Enable Downloads
========================================================= */

function toggleDownloads(enable){

    elements.downloadReport.disabled = !enable;

    elements.downloadCSV.disabled = !enable;

    elements.downloadExcel.disabled = !enable;

    elements.downloadPDF.disabled = !enable;

}

/* =========================================================
   Main Calculator
========================================================= */

function calculate(){

    if(!validateInputs()){

        toggleDownloads(false);

        return;

    }

    state.inputs = getInputs();

    state.projections = calculateProjections(state.inputs);

    renderProjectionHeading();

    renderSummary();

    renderTable();

    toggleDownloads(true);

    renderInsights();

}

/* =========================================================
   MVNO Financial Calculator
   Part 3
========================================================= */

/* =========================================================
   Export Data
========================================================= */

function getExportData(){

    return state.projections.map(item => ({

        Month: item.month,

        Subscribers: item.subscribers,

        Revenue: item.revenue,

        Costs: item.costs,

        "Monthly Profit": item.profit,

        "Cumulative Profit": item.cumulativeProfit

    }));

}

/* =========================================================
   CSV Download
========================================================= */

function downloadCSV(){

    if(!state.projections.length){

        return;

    }

    const rows = getExportData();

    const headers = Object.keys(rows[0]);

    const csv = [

        headers.join(","),

        ...rows.map(row =>

            headers.map(key => row[key]).join(",")

        )

    ].join("\n");

    const blob = new Blob(

        [csv],

        {

            type:"text/csv;charset=utf-8;"

        }

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "mvno_projections.csv";

    link.click();

    URL.revokeObjectURL(link.href);

}

/* =========================================================
   Excel Download
========================================================= */

function downloadExcel(){

    if(!state.projections.length){

        return;

    }

    if(typeof XLSX === "undefined"){

        // Never a blocking alert(): a modal dialog here freezes the tab, and
        // this runs straight off a successful form submission. See loadLib().
        reportDownloadFailure("Excel");

        return;

    }

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(

        getExportData()

    );

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Projections"

    );

    XLSX.writeFile(

        workbook,

        "mvno_projections.xlsx"

    );

}

/* =========================================================
   PDF Download
========================================================= */

function downloadPDF(){

    if(!state.projections.length){

        return;

    }

    if(typeof window.jspdf === "undefined"){

        reportDownloadFailure("PDF");

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({

        unit:"pt",

        format:"a4"

    });

    doc.setFontSize(18);

    doc.text(

        "MVNO Financial Projection Report",

        40,

        40

    );

    doc.setFontSize(11);

    doc.text(

        "Generated: " +

        new Date().toLocaleDateString(),

        40,

        62

    );

    const final =

        state.projections[state.projections.length - 1];

    const breakEvenIndex =

        state.projections.findIndex(

            row => row.cumulativeProfit >= 0

        );

    const breakEven =

        breakEvenIndex === -1

        ? "Not Reached"

        : "Month " +

          state.projections[breakEvenIndex].month;

    doc.text(

        "Final Subscribers: " +

        formatNumber(final.subscribers),

        40,

        95

    );

    doc.text(

        "Final Revenue: " +

        formatCurrency(final.revenue),

        40,

        112

    );

    doc.text(

        "Break-even: " +

        breakEven,

        40,

        129

    );

    doc.text(

        "Cumulative Profit: " +

        formatCurrency(final.cumulativeProfit),

        40,

        146

    );

    const tableRows =

        state.projections.map(item => ([

            item.month,

            formatNumber(item.subscribers),

            formatCurrency(item.revenue),

            formatCurrency(item.costs),

            formatCurrency(item.profit),

            formatCurrency(item.cumulativeProfit)

        ]));

    doc.autoTable({

        startY:180,

        head:[[

            "Month",

            "Subscribers",

            "Revenue",

            "Costs",

            "Monthly Profit",

            "Cumulative Profit"

        ]],

        body:tableRows,

        styles:{

            fontSize:9,

            halign:"center"

        },

        headStyles:{

            fillColor:[255,110,36]

        }

    });

    doc.save(

        "mvno_projections.pdf"

    );

}

/* =========================================================
   MVNO Financial Calculator
   Part 4
========================================================= */

/* =========================================================
   Live Recalculation (no button click required)
========================================================= */

function debounce(fn, delay = 300){

    let timer;

    return function(...args){

        clearTimeout(timer);

        timer = setTimeout(() => fn.apply(this, args), delay);

    };

}

const liveInputs = [

    elements.upfront,
    elements.opex,
    elements.months,
    elements.initial,
    elements.growth,
    elements.churn

];

const debouncedCalculate = debounce(calculate, 400);

/* Live recalculation removed by scripts/lib/inline-scripts.mjs: the
   projections update when "Calculate Now" is clicked, not on every
   keystroke. The button below already calls calculate() directly. */

/* =========================================================
   Event Listeners - Calculate Button (still works instantly)
========================================================= */

elements.calculate.addEventListener("click", calculate);

/* On a phone the results are below the form: take the reader to them. */
elements.calculate.addEventListener("click", () => {
    const results = document.querySelector(".mc-results");
    if(!results || !state.projections.length || window.innerWidth > 900) return;
    if(results.getBoundingClientRect().top > window.innerHeight * 0.6) results.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* =========================================================
   Report Modal Controls
========================================================= */

/*
   Your current HTML only has .report-modal-content sitting directly
   on the page - there is no outer #reportModal wrapper around it.
   That wrapper is what provides position:fixed, the dark backdrop,
   and the hidden-by-default behavior. Without it, the content just
   renders inline wherever it sits in the markup.

   This block auto-creates that wrapper at runtime if it's missing,
   so the modal works correctly even before the HTML is fixed on
   the WordPress side. If #reportModal already exists in your markup,
   this block does nothing and just uses it directly.
*/
let reportModal = document.getElementById("reportModal");

if(!reportModal){

    const modalContent = document.querySelector(".report-modal-content");

    if(modalContent){

        reportModal = document.createElement("div");

        reportModal.id = "reportModal";

        reportModal.className = "report-modal";

        // Put the wrapper where .report-modal-content currently sits,
        // then move the content inside it.
        modalContent.parentNode.insertBefore(reportModal, modalContent);

        reportModal.appendChild(modalContent);

    }

}

const cancelBtn = document.getElementById("cancelReport");
const closeBtn = document.querySelector(".report-close");

/*
   If any ancestor on the page has a CSS transform/filter/will-change
   (common with page builders like Elementor/Divi), it creates a new
   containing block and breaks position:fixed - the modal then renders
   inline in the page flow instead of as a full-screen overlay.
   Moving the modal to be a direct child of <body> guarantees it always
   escapes that and positions correctly relative to the viewport.
*/
if(reportModal && reportModal.parentElement !== document.body){

    document.body.appendChild(reportModal);

}

if(reportModal){

    // Force-hide immediately on load, inline, so no theme/page-builder
    // CSS with !important can leave it visibly sitting in the page.
    reportModal.style.position = "fixed";
    reportModal.style.inset = "0";
    reportModal.style.display = "none";
    reportModal.style.alignItems = "center";
    reportModal.style.justifyContent = "center";
    reportModal.style.background = "rgba(0,0,0,.45)";
    reportModal.style.zIndex = "999999";

}

function openModal(){

    if(!reportModal) return;

    reportModal.style.display = "flex";

    reportModal.classList.add("show");

    document.body.classList.add("modal-open");

}

function closeModal(){

    if(!reportModal) return;

    reportModal.classList.remove("show");

    reportModal.style.display = "none";

    document.body.classList.remove("modal-open");

}

elements.downloadReport.addEventListener("click", openModal);

if(cancelBtn) cancelBtn.addEventListener("click", closeModal);

if(closeBtn) closeBtn.addEventListener("click", closeModal);

// Click outside the modal content closes it
if(reportModal){

    reportModal.addEventListener("click", function(e){

        if(e.target === reportModal){

            closeModal();

        }

    });

}

// Escape key closes it
document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        closeModal();

    }

});

/* =========================================================
   Download Type Buttons
   (one format at a time - CSV, Excel or PDF)
========================================================= */

/*
   These used to be a multi-select: every click toggled its own button and
   left the others alone, so picking PDF and then Excel lit both and handed
   the visitor two files for one submission. Nothing in the markup said the
   set was additive - three pill buttons under a "Download as" label read as
   a radio group - so the second pick looked like a broken deselect rather
   than a second choice. One selection, always exactly one, is what the UI
   was already promising.
*/

let selectedDownloads = new Set(["pdf"]); // matches the "active" class on PDF button in the HTML by default

function typeFromButton(btn){

    if(btn.id === "dlCsv") return "csv";

    if(btn.id === "dlXlsx") return "xlsx";

    return "pdf";

}

const downloadTypeButtons = document.querySelectorAll(".download-type");

downloadTypeButtons.forEach(btn=>{

    // A radio group, not a set of independent toggles. Announcing it as one
    // keeps a screen reader's reading of these buttons matching what a
    // sighted visitor sees the highlight do.
    btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");

    btn.addEventListener("click", function(){

        const type = typeFromButton(this);

        // Already the choice: clicking it again must not clear it, because
        // there is no valid empty state here - the visitor is owed a file.
        if(selectedDownloads.has(type)) return;

        selectedDownloads = new Set([type]);

        downloadTypeButtons.forEach(other=>{

            const isChosen = other === this;

            other.classList.toggle("active", isChosen);

            other.setAttribute("aria-pressed", isChosen ? "true" : "false");

        });

        // Start fetching what this format needs now rather than after the
        // form comes back, so the file is usually ready the moment it is
        // owed. Picking a format is the earliest honest signal of intent.
        ensureLibs([type]);

    });

});

/* =========================================================
   Export Libraries, On Demand
========================================================= */

/*
   WordPress loads jsPDF, its autotable plugin and SheetJS from cdnjs on
   every view of this page - 1.28MB of blocking script for three buttons
   most visitors never press. The mirror dropped those tags, so nothing
   defined XLSX or window.jspdf and every download fell through to an
   alert() instead. A blocking dialog is the worst possible failure here:
   it fires straight off a successful form submission and freezes the tab.

   Self-hosted under /vendor/ and fetched per format, the first time that
   format is wanted. CSV needs nothing and stays instant; Excel pulls the
   881KB SheetJS only if Excel is actually chosen.

   The version is in each filename because these are referenced from JS,
   not from the markup, so the build's script-digest stamper never sees
   them - and /vendor/ is served with a long max-age. Upgrading a library
   means a new filename, which is the only thing that reaches a returning
   visitor's cache.
*/

const LIBS = {
    xlsx: ["/vendor/xlsx-0.18.5.full.min.js"],
    // autotable patches jsPDF's prototype, so order matters.
    pdf: ["/vendor/jspdf-2.5.1.umd.min.js", "/vendor/jspdf-autotable-3.8.2.min.js"]
};

const libCache = new Map();

function loadScript(src){

    if(!libCache.has(src)){

        libCache.set(src, new Promise((resolve, reject)=>{

            const el = document.createElement("script");

            el.src = src;

            // A script element created in JS defaults to async, and async
            // means "run whenever it arrives". autotable patches jsPDF's
            // prototype, so arriving first leaves doc.autoTable undefined and
            // the PDF dies half-written with no download and no message.
            // async = false restores document order for injected scripts:
            // still downloaded in parallel, executed in the order added.
            el.async = false;

            el.onload = resolve;

            // Drop the rejected promise from the cache so a download attempted
            // after a dropped connection can try again rather than inheriting
            // the first failure forever.
            el.onerror = () => { libCache.delete(src); reject(new Error(src)); };

            document.head.appendChild(el);

        }));

    }

    return libCache.get(src);

}

function ensureLibs(types){

    const wanted = types.flatMap(type => LIBS[type] || []);

    return Promise.all(wanted.map(loadScript)).catch(err => {

        console.error("[mvno-calculator] export library failed to load:", err);

    });

}

/*
   Shown in place of the alert() the download functions used to raise. The
   lead has already reached HubSpot by this point, so the report is the
   only thing outstanding and someone can still send it by hand.
*/
let downloadFailed = false;

function reportDownloadFailure(format){

    downloadFailed = true;

    console.error("[mvno-calculator] " + format + " library unavailable.");

    const modal = document.querySelector(".report-modal-content");

    if(!modal) return;

    let note = modal.querySelector(".hs-form-error");

    if(!note){

        note = document.createElement("p");

        note.className = "hs-form-error";

        note.setAttribute("role", "alert");

        modal.prepend(note);

    }

    note.textContent =
        "Your details are saved, but the " + format + " could not be generated. " +
        "Please try again, or email sales@spenza.com and we will send the report.";

}

async function runSelectedDownloads(){

    // Fallback: if the user submits without picking any format, default to PDF
    if(selectedDownloads.size === 0){

        selectedDownloads.add("pdf");

    }

    // Await once for every selected format, so the modal is not closed out
    // from under a download that has not started yet.
    downloadFailed = false;

    await ensureLibs([...selectedDownloads]);

    // One format failing must not take the others down with it, and must not
    // leave this promise rejected: the caller closes the modal on its result,
    // so a throw here would strand the modal open with no explanation.
    selectedDownloads.forEach(type=>{

        try{

            if(type === "csv") downloadCSV();

            else if(type === "xlsx") downloadExcel();

            else downloadPDF();

        }catch(err){

            console.error("[mvno-calculator] " + type + " export threw:", err);

            reportDownloadFailure(type.toUpperCase());

        }

    });

    return !downloadFailed;

}

/* =========================================================
   Form Submission Trigger
========================================================= */

/*
   In production (with the real Gravity Forms embed), the form
   submits via AJAX and fires "gform_confirmation_loaded" once
   the lead/email has been captured. That is the correct point
   to trigger the downloads.
*/

/*
   On WordPress that event is a jQuery custom event, dispatched with
   jQuery(document).trigger(...), which only jQuery's own event system
   delivers - so the listener had to be registered through jQuery too,
   and was, inside an `if (window.jQuery)`.

   This site ships no jQuery: wp-shim.js replaced Elementor's runtime and
   nothing put it back. So that branch never ran, the else branch was
   empty, and picking a format and pressing "Send & Download" captured the
   lead and then silently handed the user no file at all.

   /scripts/hubspot-forms.js announces a successful submission as a native
   CustomEvent instead, carrying the form id on `detail`. The jQuery
   listener is gone rather than kept alongside it: nothing dispatches the
   jQuery event any more, so it could only ever have fired twice or not at
   all, and both are worse than one.
*/

document.addEventListener("gform_confirmation_loaded", async function(event){

    if(String(event.detail && event.detail.formId) !== "21") return;

    // Only close once the file is on its way. If a library could not be
    // fetched, the modal stays open carrying the message that says so — the
    // lead is already captured, and closing would hide the one part that
    // still needs the visitor to do something.
    if(await runSelectedDownloads()) closeModal();

});

/* =========================================================
   Trigger Real Gravity Forms Submit via Custom Button
========================================================= */

/*
   The Gravity Forms shortcode [gravityform id="21" ...] renders
   its own real submit button (#gform_submit_button_21) and email
   field (#input_21_1) directly into the modal markup. That real
   button is hidden with CSS (#gform_submit_button_21{display:none;})
   and our own styled button below internally clicks it, so the
   user only ever sees our "Send & Download" button while Gravity
   Forms' own validation/AJAX submission still runs untouched.
*/

const customSubmitBtn = document.getElementById("customSubmitBtn");

if(customSubmitBtn){

    customSubmitBtn.addEventListener("click", function(){

        const emailInput = document.getElementById("input_21_1");

        const realGformSubmit = document.getElementById("gform_submit_button_21");

        if(!emailInput || !realGformSubmit){

            

            return;

        }

        // Basic front-end check before triggering GF's own validation/submit
        if(!emailInput.value.trim() || !emailInput.checkValidity()){

            emailInput.classList.add("is-invalid");

            emailInput.focus();

            return;

        }

        emailInput.classList.remove("is-invalid");

        // Internally trigger Gravity Forms' real (visually-hidden) submit
        // button. Dispatching an actual MouseEvent (rather than relying
        // only on .click()) ensures any jQuery-bound handlers Gravity
        // Forms attaches also receive it correctly.
        realGformSubmit.dispatchEvent(
            new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            })
        );

    });

}

/* =========================================================
   Results: verdict sentence, chart, stale notice
========================================================= */

const insight = {
    verdict: document.getElementById("mcVerdict"),
    chart: document.getElementById("mcChart"),
    stale: document.getElementById("mcStale"),
    margin: document.getElementById("mcMargin"),
    reset: document.getElementById("mcReset"),
    chips: document.querySelectorAll(".mc-chip[data-months]")
};

function compactCurrency(value){

    const sign = value < 0 ? "-" : "";
    const v = Math.abs(value);

    if(v >= 1e6) return sign + "$" + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if(v >= 1e3) return sign + "$" + (v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k";
    return sign + "$" + Math.round(v);

}

function renderVerdict(){

    if(!insight.verdict || !state.projections.length) return;

    const months = state.inputs.projectionMonths;
    const final = state.projections[state.projections.length - 1];
    const even = state.projections.find((item, i) => item.cumulativeProfit >= 0 && i > 0);
    const span = months === 1 ? "1 month" : months + " months";

    let text;

    if(even){
        text = `You break even in <b>month ${even.month}</b> and finish ${span} <b class="mc-gain">${formatCurrency(final.cumulativeProfit)}</b> ahead.`;
    } else if(final.profit > 0){
        text = `You are profitable each month by the end, but still <b class="mc-loss">${formatCurrency(-final.cumulativeProfit)}</b> short of recovering your costs after ${span}. Try a longer projection.`;
    } else {
        text = `On these numbers you <b class="mc-loss">do not break even</b>: costs outrun revenue every month. Raise plan prices or growth, or lower costs.`;
    }

    insight.verdict.innerHTML = text;

}

function renderChart(){

    const el = insight.chart;

    if(!el || !state.projections.length) return;

    const data = state.projections;
    // Drawn at the size it is shown, so the axis text stays 11px on a phone.
    const W = Math.round(el.clientWidth) || 640;
    const H = W < 520 ? 210 : Math.round(W * 240 / 640);
    const L = 56, R = 12, T = 14, B = 28;
    const values = data.map(d => d.cumulativeProfit).concat(-state.inputs.upfrontCosts, 0);
    const min = Math.min(...values), max = Math.max(...values);

    // Round axis steps (1, 2, 2.5 or 5 x 10^n), always through $0.
    const raw = Math.max(max - min, 1) / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const tick = [1, 2, 2.5, 5, 10].map(f => f * mag).find(t => t >= raw);
    const lo = Math.floor(min / tick) * tick, hi = Math.ceil(max / tick) * tick;

    const n = data.length;
    const x = i => L + (n === 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
    const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
    const zero = y(0);

    const pts = data.map((d, i) => [x(i), y(d.cumulativeProfit)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${pts[n - 1][0].toFixed(1)} ${zero.toFixed(1)} L${pts[0][0].toFixed(1)} ${zero.toFixed(1)} Z`;

    const ticks = [];
    for(let t = lo; t <= hi + tick / 2; t += tick) ticks.push(Math.abs(t) < tick / 1e6 ? 0 : t);
    const step = Math.max(1, Math.ceil(n / 8));

    const even = data.findIndex((d, i) => d.cumulativeProfit >= 0 && i > 0);

    el.style.height = H + "px";
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">`;
    svg += `<defs><clipPath id="mcAbove"><rect x="0" y="0" width="${W}" height="${zero.toFixed(1)}"/></clipPath>`;
    svg += `<clipPath id="mcBelow"><rect x="0" y="${zero.toFixed(1)}" width="${W}" height="${(H - zero).toFixed(1)}"/></clipPath></defs>`;
    ticks.forEach(t => {
        svg += `<line class="mc-grid-l" x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`;
        svg += `<text class="mc-ax" x="${L - 8}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${compactCurrency(t)}</text>`;
    });
    svg += `<path class="mc-area mc-area--gain" d="${area}" clip-path="url(#mcAbove)"/>`;
    svg += `<path class="mc-area mc-area--loss" d="${area}" clip-path="url(#mcBelow)"/>`;
    svg += `<line class="mc-zero" x1="${L}" x2="${W - R}" y1="${zero.toFixed(1)}" y2="${zero.toFixed(1)}"/>`;
    svg += `<path class="mc-line mc-line--gain" d="${line}" clip-path="url(#mcAbove)"/>`;
    svg += `<path class="mc-line mc-line--loss" d="${line}" clip-path="url(#mcBelow)"/>`;
    data.forEach((d, i) => {
        if(i % step && i !== n - 1) return;
        svg += `<text class="mc-ax" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${d.month}</text>`;
    });
    svg += `</svg>`;

    let marker = "";
    if(even !== -1){
        const left = x(even) / W * 100, top = y(data[even].cumulativeProfit) / H * 100;
        marker = `<span class="mc-mark" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%"></span>` +
            `<span class="mc-mark-label${x(even) + 170 > W ? " is-left" : ""}" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%">Break-even · month ${data[even].month}</span>`;
    }

    el.innerHTML = svg + marker;
    el.setAttribute("aria-label", "Cumulative profit by month, from " + formatCurrency(data[0].cumulativeProfit) + " in month 1 to " + formatCurrency(data[n - 1].cumulativeProfit) + " in month " + data[n - 1].month + (even !== -1 ? ", breaking even in month " + data[even].month : ", not breaking even") + ".");

}

if(insight.chart && "ResizeObserver" in window){
    let lastWidth = 0;
    new ResizeObserver(() => {
        const w = Math.round(insight.chart.clientWidth);
        if(w && w !== lastWidth){ lastWidth = w; renderChart(); }
    }).observe(insight.chart);
}

/* Where the sticky results stop: just under the site header, whatever its
   height at this width. */
const siteHeader = document.querySelector(".sn");
let stickyTop = -1;
const setStickyTop = () => {
    const bottom = siteHeader ? Math.max(0, siteHeader.getBoundingClientRect().bottom) : 0;
    const top = Math.round((bottom < 200 ? bottom : 0) + 16);
    if(top === stickyTop) return;
    stickyTop = top;
    document.querySelector(".mc")?.style.setProperty("--mc-top", top + "px");
};
setStickyTop();
window.addEventListener("resize", setStickyTop);
// The header changes height once the page scrolls (.is-scrolled).
let stickyFrame = 0;
window.addEventListener("scroll", () => {
    if(!stickyFrame) stickyFrame = requestAnimationFrame(() => { stickyFrame = 0; setStickyTop(); });
}, { passive: true });

function renderMargin(){

    if(!insight.margin) return;

    const { arpu, acpu } = planTotals();

    const m = arpu - acpu;
    const pct = arpu > 0 ? Math.round(m / arpu * 1000) / 10 : 0;
    insight.margin.className = "mc-margin " + (m > 0 ? "is-gain" : "is-loss");
    insight.margin.textContent = m > 0
        ? `Contribution per subscriber: ${formatCents(m)}/mo (${pct}% of revenue)`
        : `Each subscriber costs more than they pay: ${formatCents(m)}/mo`;

}

function setStale(on){

    if(insight.stale) insight.stale.hidden = !on;
    document.querySelector(".mc-results")?.classList.toggle("is-stale", on);

}

function syncChips(){

    insight.chips.forEach(chip => {
        const on = chip.dataset.months === String(elements.months.value);
        chip.classList.toggle("is-on", on);
        chip.setAttribute("aria-pressed", on ? "true" : "false");
    });

}

function renderInsights(){

    renderVerdict();
    renderChart();
    setStale(false);
    syncChips();

}

/* Results update when asked (see the note above), so a changed figure marks
   them out of date instead of recalculating them. */
liveInputs.forEach(input => {

    input.addEventListener("input", () => {
        setStale(true);
        renderMargin();
        syncChips();
    });

    input.addEventListener("keydown", e => {
        if(e.key === "Enter"){
            e.preventDefault();
            calculate();
        }
    });

});

/* A plan figure edited: totals and margin follow at once, the projection
   waits for Calculate like every other figure. */
plan.rows.forEach((row, i) => {
    row.querySelectorAll("input[data-k]").forEach(input => {
        input.addEventListener("input", () => {
            const k = input.dataset.k;
            plan.sets[plan.cat][i][k] = input.value;
            renderPlanTotals();
            renderMargin();
            setStale(true);
        });
        input.addEventListener("keydown", e => {
            if(e.key === "Enter"){
                e.preventDefault();
                calculate();
            }
        });
    });
});

/* Switching category is a choice, like the projection-length chips, so it
   recalculates straight away. */
plan.radios.forEach(r => r.addEventListener("change", () => {
    if(!r.checked) return;
    plan.cat = r.value;
    loadPlans();
    renderPlanTotals();
    renderMargin();
    calculate();
}));

insight.chips.forEach(chip => chip.addEventListener("click", () => {
    elements.months.value = chip.dataset.months;
    calculate();
}));

if(insight.reset) insight.reset.addEventListener("click", () => {
    liveInputs.forEach(input => { input.value = input.defaultValue; });
    resetPlanSets();
    plan.cat = PLAN_DEFAULT;
    loadPlans();
    renderPlanTotals();
    renderMargin();
    calculate();
});

elements.form.addEventListener("submit", e => {
    e.preventDefault();
    calculate();
});

/* =========================================================
   Initial Render (Auto Run with Default Values)
========================================================= */

function init(){

    // Run initial calculation using default input values
    loadPlans();
    renderPlanTotals();
    renderMargin();
    calculate();

    // Ensure downloads state is correct
    toggleDownloads(state.projections.length > 0);

}

init();

})(); // end IIFE
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
const reportModal = document.getElementById("reportModal");

const openBtn = document.getElementById("downloadReport");

const cancelBtn = document.getElementById("cancelReport");

const closeBtn = document.querySelector(".report-close");


openBtn.addEventListener("click", () => {

    reportModal.classList.add("show");

    document.body.classList.add("modal-open");

});


function closeModal() {

    reportModal.classList.remove("show");

    document.body.classList.remove("modal-open");

}


cancelBtn.addEventListener("click", closeModal);

closeBtn.addEventListener("click", closeModal);


reportModal.addEventListener("click", function(e){

    if(e.target===reportModal){

        closeModal();

    }

});


document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeModal();

    }

});;
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 6 skipped:', e && e.message);
}