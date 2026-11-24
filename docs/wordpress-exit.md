# Leaving WordPress

WordPress used to do three jobs the static site cannot: email the alerts and replies for every form,
keep the lead entries, and send the conversion to OpenAI Ads. The lead endpoint does all three now.
This page is how it works, how to cut over to it, and what is left before WordPress can be switched off.

## The lead endpoint (`admin-api/lead`, AWS Lambda `spenza-lead`)

The browser still posts the lead to HubSpot (`public/scripts/hubspot-forms.js`). It then posts the same
form body to the endpoint, which:

1. validates it (only the seven allowlisted form ids, the form's required fields, an email shape, an
   origin check and a per-IP throttle of 8 a minute);
2. archives it as JSON in the private, versioned bucket `spenza-leads-archive`, under
   `leads/YYYY/MM/DD/form-<id>-<time>-<rand>.json`;
3. emails the sales alert to `ALERT_TO` (Amazon SES, sent from `website@spenza.com`, Reply-To the lead);
4. emails the visitor the form's reply, from `sales@spenza.com` (form 20 picks one of six by its
   dropdown; forms 15, 16 and 21 have one; 5 and 19 have none, as on WordPress);
5. sends `lead_created` to OpenAI's Conversions API with the hashed email and the shared event id.

The reply texts are in `admin-api/lead/replies.json`, copied from the Gravity Forms notifications.
Form ids, required fields and labels are in `admin-api/lead/forms.mjs`.

Deploy or update: `scripts/lead-deploy.sh` (idempotent; it prints `LEAD_ENDPOINT=<url>`).
The site learns the URL from the repo variable `LEAD_ENDPOINT`; leaving it unset ships no endpoint.

### Settings on the function

| Variable | Meaning |
| :-- | :-- |
| `ALERT_TO` | Comma list of internal recipients. Currently sales@, siva.sai@, vinay@, darpan.jain@spenza.com. |
| `SEND_CLIENT_REPLY` | `1` emails the visitor. Leave `0` while WordPress still sends its own. |
| `SEND_OAI` and `OAI_CAPI_KEY` | `1` plus the Conversions API key sends the event. The key is set on the function only, never in the repo. |

Set a secret with the deploy script's environment, for example
`OAI_CAPI_KEY=... SEND_OAI=1 scripts/lead-deploy.sh`, or `aws lambda update-function-configuration`.

## Cutting over (no lead is lost, none is doubled by the visitor)

1. Deploy the function with the real `ALERT_TO`, `SEND_CLIENT_REPLY=0`, `SEND_OAI=0`.
2. Set the repo variable `LEAD_ENDPOINT` and merge. The browser now posts to both WordPress and the
   endpoint. Sales gets two alerts per lead (one from each) for the comparison period; visitors get one reply
   (WordPress'). The OpenAI event is sent once (WordPress').
3. Compare for about a week: every lead in `s3://spenza-leads-archive/leads/` should match a WordPress entry.
4. Flip: `SEND_CLIENT_REPLY=1`, `SEND_OAI=1` with the key, then delete the repo variable `WP_FORMS_ORIGIN`
   and redeploy. WordPress no longer receives anything.

## Content and images

- Uploads: `scripts/lib/cms-images.mjs` writes `name.webp` (at most 1600px, 200 KB) and keeps the upload's
  own format as `name.png` or `name.jpg` beside it (at most 1600px, 600 KB). Posts reference the WebP;
  `scripts/lib/cms-picture.mjs` lets the page serve `<picture>` with the WebP first and the original format as the
  `<img>` fallback. A fallback is only offered when the file exists.
- Backup: every deploy copies `src/content/cms-blog`, `src/content/cms-meta` and `public/cms-media` to
  `s3://spenza-content-backup/latest/content.tar.gz` and `by-commit/<sha>.tar.gz`. The bucket is versioned,
  private, and CI can write to it but not read or delete. The repo is still the source of truth.

## Before WordPress is terminated

- [x] The lead endpoint ran in parallel for six days (17-24 Nov 2026); its archive matched every WordPress entry and held 7 leads WordPress had silently dropped.
- [x] `SEND_CLIENT_REPLY` and `SEND_OAI` are on, and `WP_FORMS_ORIGIN` is removed (24 Nov 2026).
- [x] The WordPress loader, the schedule and `repository_dispatch` triggers and `wp:media-sync-s3` are removed from the build. Every live post is an admin post under `src/content/cms-blog`; the 141 older WordPress-only slugs are redirects in `src/data/site-redirects.mjs`.
- [ ] Gravity Forms entries are exported (CSV) and the full WordPress uploads folder is copied to S3.
- [ ] A final Hostinger backup of the WordPress files and database is stored.
- [ ] The Privacy Policy and other pages no longer name `@preprod.spenza.com`.
- [ ] DNS has no record still pointing at preprod.
