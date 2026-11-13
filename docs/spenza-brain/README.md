# Spenza brain (internal knowledge for the AI blog pipeline)

**This repository is public. Do not put internal notes in this folder.** Only this README and its
`.gitignore` are tracked, and CI (`scripts/check-brain-private.mjs`) fails any pull request that adds more.

The brain is the company knowledge library (Google Drive: Company Wiki, Product, Marketing). It reaches the
pipeline in one of two private ways:

1. **A private repository** of markdown exports. Set the repository variable `BRAIN_REPO` (`owner/name`) and the
   secret `BRAIN_REPO_TOKEN` (read access to it). The `ai-blog` workflow checks it out for the run only.
2. **A private endpoint.** Set the secrets `SPENZA_BRAIN_URL` and `SPENZA_BRAIN_TOKEN`. It receives
   `POST {"query": "...", "topK": 6}` and answers `{"results": [{"title": "...", "text": "...", "url": "optional", "status": "optional"}]}`.

Locally, put notes here for a test run; the nested `.gitignore` keeps them out of git.

## What goes in

Export only what a public blog may draw on: **00 Company Wiki, 01 Product, 04 Marketing**. Never 02 Sales
(deal pricing), 03 Customers, 05 Engineering (security detail) or 06 Operations. Each file may start with:

```
---
status: documented      # documented | approved | draft (default) | proposed | meeting-reported | historical | restricted
as_of: 2026-10-23
---
```

## How the pipeline treats it

- Chunks marked `proposed`, `historical`, `restricted`, `superseded`, `meeting-reported` or `open-question` are
  **never** shown to the writer.
- Everything else is labelled with its status. Unmarked or `draft` material is *unverified*: it guides
  terminology and positioning, but a product claim may only be written if the excerpt says `documented` or
  `approved`, or a public Spenza page confirms it. (The library's own rules say nothing is approved until a
  named owner signs it off.)
- Chunks containing email addresses, phone numbers, credentials or words like "confidential" are dropped.
- Customers are never named in a post.
