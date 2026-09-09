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
   * /connectivity-revenue-optimization/ is the page about reducing telecom
   * spend, and the Conversion Plan's commercial destination for the Telecom
   * Spend & Revenue Assurance hub (H4). Replace this with the real tool if one
   * is ever built — the audit's first choice, and still the better answer.
   */
  '/telecom-savings-calculator/': '/connectivity-revenue-optimization/',

  /**
   * Audit finding T05. The inventory records this as a private post, and the
   * URL 404s, but a public Google Fi case study exists at /mvno/google-fi/ —
   * so this looks like a predecessor whose inbound links now dead-end.
   *
   * The private source stays private; this only routes the old public URL at
   * the page that replaced it.
   */
  '/mvno/google-fi-case-study/': '/mvno/google-fi/',
};
