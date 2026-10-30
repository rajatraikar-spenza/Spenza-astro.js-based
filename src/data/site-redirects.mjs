/**
 * Redirects this repo decided on, as opposed to the ones WordPress serves.
 *
 * `wp-redirects.json` is a *capture* — `npm run wp:redirects` writes it from
 * WordPress' own 301 table, so anything hand-added there is lost the next time
 * that script runs. These are editorial decisions about URLs this site owns, so
 * they need somewhere that a mirror run cannot overwrite.
 *
 * Merged into the same redirect table as the captured ones by
 * `scripts/aws-build-cf-function.mjs`, excluded from the sitemap by
 * `astro.config.mjs`, and served as HTML stand-ins by `[...wpRedirect].astro`
 * when `HOST_REDIRECTS` is unset. One entry here reaches all three.
 *
 * ---- The five shell routes (audit finding T02) -----------------------------
 *
 * `/demo/`, `/device-vendors-demo/`, `/enterprises-demo/`, `/mno/` and
 * `/telecom-savings-calculator/` were in the sitemap and returned HTTP 200, but
 * all five rendered the *blog archive* — headline "Latest Telecom Industry
 * Insights", a newsletter field, category pills and a search box. Their five
 * partials were byte-identical apart from the form `action` carrying each
 * slug. They are mirror artefacts: WordPress served the archive template for
 * URLs that had no page behind them, and the import captured that five times.
 *
 * So the site was submitting five duplicate copies of its own archive to
 * Google, and any visitor arriving on one got a page about nothing they asked
 * for.
 *
 * Redirected rather than retired because all five rank. Over the 16-month
 * Search Console window they carry ~9 clicks and ~1,818 impressions between
 * them, and `/mno/` sits at position 8.3 — page one. A 410 throws that away and
 * still dead-ends the visitor; a redirect keeps the signal and lands them
 * somewhere that answers the question.
 *
 * Each target is the closest page that actually serves the intent, not the
 * nearest sales page. Revisit any of them by editing this file — nothing else
 * needs to change.
 */
export const SITE_REDIRECTS = {
  /**
   * The demo forms are Gravity Forms 19 and 20, and 20 lives on /contact-us/.
   * There is no dedicated demo page to send these to, which is what the audit
   * concluded as well.
   */
  '/demo/': '/contact-us/',

  /**
   * Same reasoning, and the Conversion Plan names /contact-us/ as the
   * commercial destination for the enterprise mobility hub (H6).
   */
  '/enterprises-demo/': '/contact-us/',

  /**
   * Device vendors are OEM and hardware buyers, and /connected-devices/ is
   * their solution page — it is the commercial destination the Conversion Plan
   * gives the eSIM & Provisioning hub (H3). More useful than a generic contact
   * form for someone who searched for a device demo.
   */
  '/device-vendors-demo/': '/connected-devices/',

  /**
   * Not a sales page, deliberately. Four post bodies link here as a glossary
   * definition — "Mobile Network Operator (<a href="/mno/">MNO</a>)" — so the
   * link is a request for an explanation, and someone ranking at position 8.3
   * for this wants the same thing. This article defines MNO against MVNO, MVNE
   * and MVNA, which is the answer both audiences came for.
   *
   * If a real MNO *offering* page is ever built, point this at it instead and
   * relink those four posts at the article directly.
   */
  '/mno/': '/mvno/mno-mvno-mvne-mvna-roles/',

  /**
   * There is no savings calculator, and /mvno-calculator/ is not one — it
   * estimates what launching an MVNO costs, which is the opposite intent to
   * "how much could I save". Sending 691 impressions of savings intent at a
   * launch-cost tool would be a worse answer than none.
   *
   * This pointed at /connectivity-revenue-optimization/, then the page about
   * reducing telecom spend. That page became the Voice Observability Solution,
   * so this now lands on a different topic — kept pointing there only because
   * the old URL is itself a redirect now, and a chain fails the CloudFront
   * build. It needs a real telecom-spend destination; replace this when there
   * is one.
   */
  '/telecom-savings-calculator/': '/voice-observability-solution/',

  /**
   * The Solution page renamed to what it now is. The old address carries years
   * of links from posts and elsewhere, so it is a permanent redirect rather than
   * a retirement. Point anything new at the target directly: a redirect whose
   * target is this key is a chain, and the CloudFront function build rejects
   * chains.
   */
  '/connectivity-revenue-optimization/': '/voice-observability-solution/',

  /**
   * Audit finding T05. The inventory records this as a private post, and the
   * URL 404s, but a public Google Fi case study exists at /mvno/google-fi/ —
   * so this looks like a predecessor whose inbound links now dead-end.
   *
   * The private source stays private; this only routes the old public URL at
   * the page that replaced it.
   */
  '/mvno/google-fi-case-study/': '/mvno/google-fi/',

  /**
   * ---- Blog cleanup, Week 1: broken URLs ------------------------------------
   *
   * From the blog architecture plan (crawl of 13 Oct 2026, Search Console
   * 1 Apr – 6 Oct). Each of these returned 404 while Google still showed it,
   * and each points at the live article it was a malformed or retired copy of.
   */

  /**
   * The launch-cost article was published under a doubled slug, and WordPress
   * then recorded the clean URL — the one holding 6,304 impressions at
   * position 6.4 — as a 301 *to* the typo. The post is republished at the
   * clean slug, the captured rule is gone from `wp-redirects.json`, and the
   * typo now points the right way. Both have to ship together: with the old
   * rule still captured, the two would loop.
   */
  '/mvno/mvno-mvno-launch-cost/': '/mvno/mvno-launch-cost/',

  /** Old slug, same article; 1,013 impressions and 5 clicks while it 404'd. */
  '/telecom/5g-standalone-vs-non-standalone/': '/telecom/telecom-5g-standalone-vs-non-standalone/',

  /** Old slug, same article; 156 impressions while it 404'd. */
  '/iot/consumer-iot-vs-industrial-iot/': '/iot/consumer-iot-vs-industrial-iot-iiot-key-differences/',

  // Malformed variants of live slugs, each still listed in Google.
  '/esim/esim-for-iot/': '/esim/iot-sim-cards-guide/',
  '/esim/iot-s-management-guide/': '/esim/iot-sim-management-guide/',
  '/mvno/google-fi-5g-refind/': '/mvno/google-fi-2/',
  '/mvno/mvno-provider-selection/': '/telecom/oss-bss-checklist/',
  '/telecom/5g-via-4g-speed-comparison/': '/telecom/5g-vs-4g-speed-comparison/',
  '/telecom/5g-vs-5g-plus-vs-5g-uc-vs-5g-uw/': '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw/',
  '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw-carrier-branding-decoded/': '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw/',
  '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw-decoded/': '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw/',
  '/telecom/5g-vs-5ge-vs-5g-plus-wp-uc-uw/': '/telecom/5g-vs-5ge-vs-5g-plus-vs-5g-uc-vs-5g-uw/',
  '/telecom/bss-for-form/': '/telecom/bss-full-form/',
  '/telecom/skype-vs-zoom-teams-comparison/': '/telecom/skype-vs-zoom-vs-teams-comparison/',

  /**
   * ---- Blog cleanup, Week 1: the 43 removed posts --------------------------
   *
   * Thin, duplicate or off-topic posts the plan retires outright, each sent to
   * the live page that now answers the same question. Every target is the
   * page's current URL, not the one the plan will give it later: several
   * targets are themselves due a new slug, and pointing at that now would be a
   * redirect to a 404. Repoint these when those reslugs ship — the build
   * fails on a chain, so it will say which.
   *
   * Inbound links in post bodies were replaced in WordPress before these
   * posts were unpublished, so these catch only external links and search.
   */
  '/byod/byod-planning/': '/byod/byod-in-2025-benefits-risks-and-best-practices/',
  '/byod/byod-policies/': '/byod/byod-in-2025-benefits-risks-and-best-practices/',
  '/esim/esim-covid-19/': '/esim/esim/',
  '/esim/esim-for-travellers/': '/esim/esim-vs-physical-sim-airport-decision/',
  '/esim/esim-global-connectivity/': '/esim/esim-for-enterprises-business-enabler-2025/',
  '/esim/esim-transformation/': '/esim/esim/',
  '/esim/esim-transforming-iot-connectivity/': '/esim/iot-sim-cards-guide/',
  '/esim/iot-esim-connectivity/': '/esim/iot-sim-cards-guide/',
  '/esim/iot-management-remote-esim-provisioning/': '/esim/what-is-remote-sim-provisioning-rsp-guide-2026/',
  '/mvno/design-mvno-user-experience/': '/uxhub/',
  '/mvno/global-mvno-expansion/': '/mvno/mvno-network-selection/',
  '/mvno/iot-mvno-industrial-automation/': '/mvno/iot-mvnos-vs-traditional/',
  '/mvno/monetize-baby-monitor-connectivity/': '/esim/esim-for-oems/',
  '/mvno/mvno-differentiation/': '/mvno/top-mvno-marketing-strategies/',
  '/mvno/mvno-management-solution/': '/mvne/',
  '/mvno/us-mvno-introduction/': '/mvno/launch-mvno-us-guide/',
  '/spenza-product/bulk-import-operations/': '/controlhub/',
  '/spenza-product/create-branded-mobile-experience-for-enterprise-user/': '/uxhub/',
  '/spenza-product/pdf-parsing-for-telecom-invoices/': '/controlhub/',
  '/spenza-product/purchase-plan/': '/spenza-product/purchasing-spenza-marketplace-plans/',
  '/spenza-product/spenza-admin-dashboard-overview/': '/controlhub/',
  '/spenza-product/spenza-business-continuity/': '/esim/business-internet-failover/',
  '/spenza-product/spenza-super-admin-overview/': '/spenza-product/taas-billing-plan-bundling/',
  '/spenza-product/unlock-operational-efficiency-with-spenza-iot-aggregation-platform/': '/iot-solutions/',
  '/telecom/caas-for-iot/': '/iot-solutions/',
  '/telecom/dual-esim-support-iphone-13/': '/esim/dual-sim-esim/',
  '/telecom/employee-mobile-service/': '/telecom/connectivity-as-a-benefit/',
  '/telecom/global-iot-network-management-simplified/': '/telecom/single-pane-of-glass-iot-connectivity-management/',
  '/telecom/impact-5g-enterprise/': '/telecom/5g-vs-4g-speed-comparison/',
  '/telecom/integrated-connectivity-management/': '/telecom/single-pane-of-glass-iot-connectivity-management/',
  '/telecom/iot-connectivity-management-platform/': '/esim/leading-iot-connectivity-management-platforms/',
  '/telecom/iot-connectivity/': '/telecom/iot-connectivity-cost-guide-2025/',
  '/telecom/iot-device-management/': '/telecom/single-pane-of-glass-iot-connectivity-management/',
  '/telecom/iot-regional-plan-flexibility/': '/iot/global-iot-connectivity-2026/',
  '/telecom/mobile-plan-management-simplified/': '/tem/business-mobile-cost-quality/',
  '/telecom/telecom-expense-management-api/': '/tem/what-is-telecom-expense-management-tem/',
  '/telecom/telecom-expense-management/': '/tem/what-is-telecom-expense-management-tem/',
  '/telecom/why-is-mobile-roaming-expensive/': '/business-roaming-packs/',
  '/telecom/wireless-telecom-expense-management/': '/tem/wireless-expense-management-challenges/',
  '/tem/hidden-mobile-service-costs/': '/tem/business-mobile-cost-quality/',
  '/tem/telecom-billing-mistakes/': '/tem/telecom-compliance-audits/',
  '/tem/traditional-connectivity-plans/': '/tem/business-mobile-cost-quality/',
  '/tem/wireless-connectivity-management-enterprises/': '/tem/wireless-expense-management-challenges/',

  /**
   * ---- The three hub rewrites (Oct 2026) ------------------------------------
   *
   * Twelve posts fold into three rewritten hubs that keep their URLs:
   * /esim/leading-iot-connectivity-management-platforms/, /telecom/oss-bss/ and
   * /mvno/launch-mvno-us-guide/. Each donor below 301s straight to its hub.
   *
   * These are inert until the donor is unpublished in WordPress. While a donor
   * is still a published post its route is a real page, and a real page wins
   * over a redirect — so merging this ahead of the unpublish is safe, and the
   * redirects take effect in the same build that drops the donors.
   *
   * Each donor also appears under its legacy /blog/<slug>/ alias. Those aliases
   * are generated from wp-posts.json and point at the donor's own URL, which
   * becomes a redirect source here, so left alone they would be a chain and fail
   * the build. Listing them explicitly sends them to the hub in one hop.
   *
   * /telecom/iot-connectivity-management-platform/ and /mvno/us-mvno-introduction/
   * already redirect to their hubs, above.
   */
  '/esim/iot-connectivity-platforms/': '/esim/leading-iot-connectivity-management-platforms/',
  '/esim/best-iot-connectivity-management-platform/': '/esim/leading-iot-connectivity-management-platforms/',
  '/telecom/what-is-connectivity-management-platform-cmp/': '/esim/leading-iot-connectivity-management-platforms/',
  '/telecom/iot-connectivity-management-platform-features-2025/': '/esim/leading-iot-connectivity-management-platforms/',
  '/esim/optimize-iot-deployment-connectivity-management-platform/': '/esim/leading-iot-connectivity-management-platforms/',
  '/blog/iot-connectivity-platforms/': '/esim/leading-iot-connectivity-management-platforms/',
  '/blog/best-iot-connectivity-management-platform/': '/esim/leading-iot-connectivity-management-platforms/',
  '/blog/what-is-connectivity-management-platform-cmp/': '/esim/leading-iot-connectivity-management-platforms/',
  '/blog/iot-connectivity-management-platform-features-2025/': '/esim/leading-iot-connectivity-management-platforms/',
  '/blog/optimize-iot-deployment-connectivity-management-platform/': '/esim/leading-iot-connectivity-management-platforms/',
  // Was captured pointing at /esim/iot-connectivity-platforms/, itself a donor now.
  '/iot/iot-connectivity-platform/': '/esim/leading-iot-connectivity-management-platforms/',

  '/telecom/oss-full-form/': '/telecom/oss-bss/',
  '/blog/oss-full-form/': '/telecom/oss-bss/',

  '/mvno/mvno-launch-checklist/': '/mvno/launch-mvno-us-guide/',
  '/mvno/top-10-tips-launching-mvno-us-2025/': '/mvno/launch-mvno-us-guide/',
  '/mvno/launch-us-mvno-now/': '/mvno/launch-mvno-us-guide/',
  '/mvno/how-to-set-up-mvno/': '/mvno/launch-mvno-us-guide/',
  '/blog/mvno-launch-checklist/': '/mvno/launch-mvno-us-guide/',
  '/blog/top-10-tips-launching-mvno-us-2025/': '/mvno/launch-mvno-us-guide/',
  '/blog/launch-us-mvno-now/': '/mvno/launch-mvno-us-guide/',
  '/blog/how-to-set-up-mvno/': '/mvno/launch-mvno-us-guide/',
  // Was captured pointing at /mvno/how-to-set-up-mvno/, itself a donor now.
  '/blog/how-to-set-up-mvno-2025-guide/': '/mvno/launch-mvno-us-guide/',

  // MVNO and MVNE, batch 1: roles pillar and white-label guide. Inert until the donors are unpublished.
  // Roles pillar: six overlapping MNO/MVNO/MVNE/MVNA posts.
  '/mvno/mno-vs-mvnos/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/mno-vs-mvnos/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/mvno/mvne-explained/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/mvne-explained/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/mvno/mvne-mvna-mno-to-launch-mvno/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/mvne-mvna-mno-to-launch-mvno/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/mvno/mvno-vs-mvne/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/mvno-vs-mvne/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/spenza-product/what-is-mvne-strategy-services/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/what-is-mvne-strategy-services/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/telecom/mvne-vs-mvna/': '/mvno/mno-mvno-mvne-mvna-roles/',
  '/blog/mvne-vs-mvna/': '/mvno/mno-mvno-mvne-mvna-roles/',
  // Was captured pointing at /mvno/mvne-explained/, itself a donor now.
  '/mvne-platform/': '/mvno/mno-mvno-mvne-mvna-roles/',
  // White label: the ranking guide moves to the evergreen slug; three posts fold in.
  '/mvno/brand-mvnos-revolutionizing-mobile/': '/mvno/white-label-mvno/',
  '/blog/brand-mvnos-revolutionizing-mobile/': '/mvno/white-label-mvno/',
  '/mvno/branded-reseller-mvno/': '/mvno/white-label-mvno/',
  '/blog/branded-reseller-mvno/': '/mvno/white-label-mvno/',
  '/mvno/how-to-launch-mvno-non-telco-brand-2025/': '/mvno/white-label-mvno/',
  '/blog/how-to-launch-mvno-non-telco-brand-2025/': '/mvno/white-label-mvno/',
  '/mvno/white-label-mvno-launch-guide-2025/': '/mvno/white-label-mvno/',
  '/blog/white-label-mvno-launch-guide-2025/': '/mvno/white-label-mvno/',
  // Was captured pointing at /mvno/brand-mvnos-revolutionizing-mobile/, itself a donor now.
  '/mvno/how-consumer-brands-are-revolutionizing-mobile-telecom/': '/mvno/white-label-mvno/',
};

/**
 * Paths this site has removed for good, answered with 410 Gone.
 *
 * Not redirected: a 301 tells Google the content moved, and for a page taken
 * down over a Safe Browsing flag the honest answer is that it no longer exists.
 * The CloudFront function answers these before any redirect, the build emits no
 * page for them, and `unlinkGonePaths` in `scripts/lib/html-perf.mjs` turns post
 * links to them into plain text so no article points at a dead URL.
 *
 * ---- Retired after the Safe Browsing flag of 21 Oct 2026 --------------------
 *
 * /mobility-policy/ was a 2024 WordPress page that gated a .docx and a PDF
 * behind a form asking for name, email, phone, address, country and headcount,
 * two of its required fields labelled "Untitled", the files then served from
 * another host. That is the shape Google's "deceptive pages: trick visitors into
 * sharing personal info or downloading software" describes.
 */
export const SITE_GONE = [
  '/mobility-policy/',
];
