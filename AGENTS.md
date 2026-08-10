## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## WordPress mirror

This project is a faithful mirror of `preprod.spenza.com`, not a reinterpretation.
See README.md for the full architecture. Key rules when working on it:

- Mirrored pages use `WpLayout.astro`, which loads the exact stylesheet set the
  WordPress page loaded, **in order** — Elementor's cascade depends on it.
- Never hand-edit `src/partials/**` or `src/data/wp-*.json`. They are generated;
  change the script in `scripts/` and re-run it.
- Inline `<style>` blocks must be extracted from the **whole document**, not just
  `<head>` — WPCode snippets put real layout CSS in the body.
- The site's own behaviour lives in footer inline scripts, extracted per page to
  `public/scripts/page/<slug>.js`. Elementor's jQuery runtime is replaced by
  `public/scripts/wp-shim.js`.
- Blog posts live at `/<category>/<slug>/`, matching WordPress. Do not move them.
- After any change to the pipeline, run:
  `npm run build && npm run wp:audit && npm run wp:audit-links`
- `.wp-cache/` holds a live WordPress session cookie. It is gitignored — never
  commit it.
