/**
 * The Font Awesome codepoint for an icon name, read from the mirrored stylesheet.
 *
 * Why this exists: the mirrored Font Awesome is never served as a file. It is
 * purged into the `_opt/` bundles, and purgecss keeps only the icons it saw in
 * the markup when it ran. That markup is the *mirrored* partials, so the set it
 * kept is whatever WordPress had rendered at import time — 208 icons, against
 * 219 distinct ones the headless posts now ask for. An icon outside that set
 * inherits the right font and the right `content: var(--fa)` rule and resolves
 * to nothing, which is a blank gap beside a card title.
 *
 * Re-running `npm run wp:optimize-css` would rebuild the bundles, and is the
 * documented answer — but it re-purges every page from current markup, and has
 * previously stripped rules from pages that were not the one being fixed. This
 * asks for less: the generic machinery is already in the bundle, so a post only
 * needs the `--fa` values for the icons it actually uses. That is a few hundred
 * bytes inline, and it cannot go stale, because it is derived from the same
 * data that renders the icons.
 */
/*
 * Imported with `?raw` rather than read with `fs`: this module is bundled, so
 * `import.meta.url` resolves to a chunk in a temp directory at build time and a
 * path relative to it silently misses. Vite inlines the stylesheet here instead,
 * at build only — none of it is shipped.
 */
import FA_CSS from '../../public/wp-assets/_cdn/cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css?raw';

/**
 * name -> codepoint escape, e.g. `clipboard-check` -> `\f46c`.
 *
 * Both stylesheet generations are read. 6.7 declares a custom property and
 * shares it across an alias list — `.fa-a,.fa-b{--fa:"\f148"}` — while 6.4 and
 * earlier set `content` on each `:before`. Reading only the modern form would
 * silently return an empty map against an older mirrored file.
 */
let glyphs: Map<string, string> | null = null;

function load(): Map<string, string> {
  if (glyphs) return glyphs;
  const map = new Map<string, string>();
  const css: string = FA_CSS ?? '';

  for (const rule of css.matchAll(/([^{}]+)\{--fa:\s*"([^"]+)"\}/g)) {
    for (const sel of rule[1].matchAll(/\.fa-([a-z0-9-]+)(?![a-z0-9-])/g)) {
      if (!map.has(sel[1])) map.set(sel[1], rule[2]);
    }
  }
  for (const rule of css.matchAll(/([^{}]+)\{content:\s*"([^"]+)"\}/g)) {
    for (const sel of rule[1].matchAll(/\.fa-([a-z0-9-]+):before/g)) {
      if (!map.has(sel[1])) map.set(sel[1], rule[2]);
    }
  }

  glyphs = map;
  return map;
}

/**
 * A `<style>` block declaring `--fa` for each icon name given, or '' when the
 * bundle already covers all of them.
 *
 * Names are taken from class lists this repo builds, and each is matched
 * against the stylesheet before use, so nothing a post supplies reaches the
 * output unchecked.
 */
export function faGlyphStyles(names: Iterable<string>): string {
  const map = load();
  const rules: string[] = [];
  const seen = new Set<string>();

  for (const raw of names) {
    const name = raw.replace(/^fa-/, '');
    if (seen.has(name)) continue;
    seen.add(name);
    const cp = map.get(name);
    if (cp) rules.push(`.fa-${name}{--fa:"${cp}"}`);
  }

  return rules.length ? `<style>${rules.join('')}</style>` : '';
}

/** The icon name out of a class list like `fa-classic fa-solid fa-gears`. */
export function iconNameFrom(classes: string): string {
  const parts = classes.trim().split(/\s+/);
  const style = new Set(['fa-classic', 'fa-sharp', 'fa-solid', 'fa-regular', 'fa-brands', 'fa-light', 'fa-thin', 'fa-duotone']);
  return parts.find(p => p.startsWith('fa-') && !style.has(p)) ?? '';
}
