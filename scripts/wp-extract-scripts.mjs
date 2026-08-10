// The site's own behaviour (tab panels, the case-study cards, the step ticker,
// popups, mobile submenus) lives in inline <script> blocks that WordPress
// injects in the footer — outside the Elementor content block, so the content
// extractor never saw them. Pull them into a per-page JS bundle.
import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const PAGES_DIR = path.join(CACHE, 'pages');
const OUT_DIR = path.join(PROJECT, 'public', 'scripts', 'page');

/**
 * Third-party tags, analytics and WordPress/plugin internals. These either
 * depend on a runtime we do not ship (jQuery, gform, Elementor) or should not
 * be carried into a static rebuild at all.
 */
const DENY = [
  /\bgform\b/, /ak_js_/, /wpcode_admin_bar/, /customize-support/,
  /dataLayer|gtag\(/, /\bvector\b.*snippet/i, /initApollo/, /_linkedin_partner_id|lintrk/,
  /wp-emoji|_wpemojiSettings/, /trident\|msie/i, /elementorWebCliConfig|elementorDevToolsConfig/,
  /wpApiSettings|wp\.i18n|wp\.apiFetch|wp\.data|wp\.date|moment\.updateLocale/,
  /elementorCommonConfig|elementorAppConfig|elementorFrontendConfig|ElementorProFrontendConfig/,
  /elementorAdminBarConfig|astraAddon|var astra =|zip_ai_react|leadin_wordpress/,
  /gravatarEnhancedHovercards|gform_theme_config|wpNotesArgs|EAELImageMaskingConfig/,
  /var localize =/, /hbspt|hs-script/, /clarity|hotjar|fbq\(/,
];

const rewriteUrls = s => s
  .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\/uploads\//g, '/wp-content/uploads/')
  .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\//g, '/wp-assets/wp-content/')
  .replace(/https?:\/\/preprod\.spenza\.com\/?/g, '/');

await fs.mkdir(OUT_DIR, { recursive: true });

const files = (await fs.readdir(PAGES_DIR)).filter(f => f.endsWith('.html'));
const manifest = {};

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const html = await fs.readFile(path.join(PAGES_DIR, file), 'utf8');
  const body = html.slice(html.indexOf('<body'));

  const scripts = [];
  const jsonLd = [];

  for (const m of body.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    const code = m[2].trim();
    if (!code) continue;                              // external script, no body
    if (/\bsrc\s*=/.test(attrs)) continue;

    const type = (attrs.match(/type=['"]([^'"]*)['"]/) || [])[1] || '';

    if (type === 'application/ld+json') {
      jsonLd.push(rewriteUrls(code));
      continue;
    }
    // WordPress-enqueued inline data blocks always carry an id (…-js-extra).
    if (/\bid\s*=/.test(attrs)) continue;
    if (type && !/^(text\/javascript|application\/javascript|module)$/.test(type)) continue;
    if (DENY.some(re => re.test(code))) continue;

    scripts.push(rewriteUrls(code));
  }

  if (scripts.length) {
    const banner =
      `/* Custom site scripts extracted from the WordPress page "${slug}".\n` +
      `   Regenerate with: npm run wp:scripts */\n\n`;
    // Several snippets are "run everywhere" WPCode blocks that target elements
    // from older designs and throw when those are absent — on the live site
    // too. Isolate each one so a missing target cannot break the others.
    const bundle = banner + scripts
      .map((s, i) => `/* --- snippet ${i + 1} --- */\ntry {\n(function(){\n${s}\n})();\n} catch (e) {\n  console.debug('[wp-page-script] snippet ${i + 1} skipped:', e && e.message);\n}`)
      .join('\n\n');
    await fs.writeFile(path.join(OUT_DIR, `${slug}.js`), bundle, 'utf8');
  }

  manifest[slug] = {
    script: scripts.length ? `/scripts/page/${slug}.js` : null,
    jsonLd,
  };
  process.stdout.write(`${slug.padEnd(52)} scripts:${String(scripts.length).padStart(2)}  ld+json:${jsonLd.length}\n`);
}

await fs.writeFile(
  path.join(PROJECT, 'src', 'data', 'wp-scripts.json'),
  JSON.stringify(manifest, null, 2), 'utf8'
);
process.stdout.write('\nwrote src/data/wp-scripts.json\n');
