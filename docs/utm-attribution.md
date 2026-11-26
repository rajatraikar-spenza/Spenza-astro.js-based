# UTM attribution

Where each sign-up or enquiry came from, and how many people click a CTA versus
finish its form. Built in `src/components/Analytics.astro` (arrival, links,
click events) and `public/scripts/hubspot-forms.js` (form attribution).

## Naming convention

| Field | Meaning | Examples |
| :---- | :------ | :------- |
| `utm_source` | The page the CTA was clicked on, **or** the external channel on a link we hand out | `travel_esim`, `homepage`, `mvno_article_<short_name>`, `shiva_sales_email`, `linkedin` |
| `utm_medium` | How it travelled | `website`, `email`, `social` |
| `utm_campaign` | Which CTA / campaign | `start_free_trial`, `login`, `contact`, `popup_open`, `inline_form` |
| `utm_content` | Where on the page | `nav`, `footer`, `body`, `popup` |
| `ft_source` / `first_touch_source` | The channel that first brought the visitor to spenza.com (from the first tagged landing URL) | `linkedin` |

Page keys come from the URL path: `/travel-esim/` -> `travel_esim`, `/` ->
`homepage`, `/<category>/<slug>/` -> `<category>_<slug>` (60 characters max).

`first_touch_source` exists so the channel survives the page name: a LinkedIn
visitor who later clicks Start free trial on the Travel eSIM page is
`utm_source=travel_esim` and `ft_source=linkedin`.

## What the site does

1. **Arrival.** `utm_*` on a landing URL is kept in two cookies on
   `.spenza.com`: `sp_ft` (first touch, written once, 90 days) and `sp_lt`
   (last touch). Value is JSON: `{utm_source, utm_medium, utm_campaign,
   utm_content, t}`. `web.spenza.com` can read both.
2. **Links.** Every Login / Start free trial link to `web.spenza.com/auth/*`
   gets `utm_source=<page>&utm_medium=website&utm_campaign=<login|start_free_trial>
   &utm_content=<nav|footer|body>` and `ft_source=<first touch>` if there is
   one. A link that already has `utm_source` (a sales email) is left alone.
3. **Clicks.** `cta_click` in GA4 and Clarity for Start free trial, Login,
   Contact Us and the demo pop-up buttons, with `cta`, `cta_page`,
   `cta_placement`. Clarity also gets `cta_click_<cta>` and a `cta_page` tag.
4. **Forms.** After a confirmed submit of any site form with an email field
   (15, 19, 20, ...), the same values are posted to the HubSpot form "Website
   attribution (companion to site forms)" and matched to the contact by email.
   The GA4 submit event (`lead_form_submit` etc.) carries `cta` and `cta_page`,
   so clicks and completions can be compared per page.

HubSpot contact properties (all single-line text): `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, `first_touch_source`. These hold the **most
recent** conversion's values; HubSpot's own Original Source still records the
first.

The lead forms themselves are HubSpot *collected* forms, which silently drop any
field outside their fixed list. That is why attribution goes to a separate form
rather than being added to them. Companion form id:
`5aeefb3a-fd66-47a3-9767-6c22abe188ea` (portal 25414858, EU1).

## Links to hand out (not code)

- Shiva's sales emails:
  `https://web.spenza.com/auth/signup?utm_source=shiva_sales_email&utm_medium=email&utm_campaign=sales_outreach`
- LinkedIn posts: `?utm_source=linkedin&utm_medium=social&utm_campaign=<post_name>`
  on any spenza.com or web.spenza.com URL.
- MVNE page and articles: when the MVNE page ships, its Contact Us and pop-up
  triggers are already covered; articles report as `<category>_<slug>`.

## What the app team (`web.spenza.com`) needs to do

The marketing site cannot do this part.

1. On the signup page, read `utm_source`, `utm_medium`, `utm_campaign`,
   `utm_content`, `ft_source` from the URL. If absent, fall back to the `sp_ft`
   cookie.
2. Persist them through navigation (session storage or the same cookie).
3. Send them with the signup request; add `utm_source` (and the others if
   wanted) to the user/lead table and the signup API.
4. Fire a `sign_up` event (GA4) when the account is created, so the
   `cta_click` -> `sign_up` ratio per page can be reported.

Login is a click-count only; the app is the only place that can say who logged
in.

## GA4 setup (one-off, in the GA4 admin)

Register `cta`, `cta_page` and `cta_placement` as event-scoped custom
dimensions, or they will not appear in reports.

## Caveat

A `utm_source=<page>` link opens a new session in any GA4 property on
`web.spenza.com`, replacing the original acquisition source there. The channel
is preserved in `ft_source` and `first_touch_source` for exactly that reason.
