// Shared plumbing for the WordPress mirroring scripts: the authenticated fetch,
// the Elementor block extractor, and the asset/CSS mirroring rules. Archives and
// single posts run the same pipeline, so the rules live here rather than being
// copied — a fix in one has to reach both.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { wpMediaRe, rewriteWpUrls, WP_ORIGIN, WP_HOST, PROJECT as ROOT } from './config.mjs';

export const ORIGIN = WP_ORIGIN;
export const PROJECT = ROOT;
const CACHE = path.join(PROJECT, '.wp-cache');

/**
 * Admin-only chrome and third-party widgets. None of it belongs in a static
 * rebuild, and most of it is only present because the mirror runs authenticated.
 */
const EXCLUDE = [
  'admin-bar', 'dashicons', 'wordfence', 'gravatar-enhanced', 'zip-ai',
  'noticons', 'adminbar', 'litespeed', 'coming-soon', 'jetpack',
  'wp-includes/css/admin-bar', 'notes/admin-bar', 'customize-',
];
const isExcluded = u => EXCLUDE.some(x => u.includes(x));

/** A logged-in WordPress session, read from the gitignored cookie jar. */
export const cookieHeader = await (async () => {
  const raw = await fs.readFile(path.join(CACHE, 'cookies.txt'), 'utf8');
  const seen = new Set();
  return raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#')).map(l => l.split('\t'))
    .filter(p => p.length >= 7).map(p => [p[5].trim(), p[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k))
    .map(([k, v]) => `${k}=${v}`).join('; ');
})();

export async function fetchDoc(url) {
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.text();
}

/** Slice out a balanced <div> block starting at the first match of `startRe`. */
export function extractDivBlock(html, startRe) {
  const m = startRe.exec(html);
  if (!m) return null;
  const tagRe = /<div\b|<\/div>/gi;
  tagRe.lastIndex = m.index;
  let depth = 0, t;
  while ((t = tagRe.exec(html))) {
    if (t[0].toLowerCase() === '</div>') {
      depth--;
      if (depth === 0) return html.slice(m.index, t.index + 6);
    } else depth++;
  }
  return null;
}

/** Gravity Forms' runtime is not mirrored, so its bootstrap scripts are dead. */
export function stripDeadScripts(html) {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (tag, body) =>
    /\bgform\b|\bgformInitSpinner\b|ak_js_/.test(body) ? '' : tag
  );
}

/** Point every absolute WordPress URL at the mirrored copy. */
export const rewriteUrls = rewriteWpUrls;

export function localPathFor(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/^\/+/, '');
  if (u.hostname !== WP_HOST) p = path.posix.join('_cdn', u.hostname, p);
  return p;
}

/**
 * Mirror every stylesheet the document links, in document order.
 *
 * Whole document, not just <head>: Gravity Forms enqueues from the shortcode, so
 * its stylesheets land in the body — and Elementor's cascade depends on order.
 */
export async function mirrorStylesheets(html, outRoot) {
  const hrefs = [...html.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/g)]
    .map(t => (t[0].match(/href=['"]([^'"]+)['"]/) || [])[1])
    .filter(Boolean).map(h => h.replace(/&#0?38;/g, '&'))
    .map(h => (h.startsWith('//') ? 'https:' + h : h))
    .filter(h => /^https?:/.test(h) && !isExcluded(h));

  const localHrefs = [];
  for (const href of hrefs) {
    const clean = href.split('#')[0];
    const rel = localPathFor(clean);
    const dest = path.join(outRoot, rel);
    localHrefs.push('/wp-assets/' + rel.split(path.sep).join('/'));
    if (existsSync(dest)) continue;
    try {
      const r = await fetch(clean, {
        headers: { Cookie: clean.startsWith(ORIGIN) ? cookieHeader : '', 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const body = /\.css($|\?)/.test(clean)
        ? rewriteUrls(await r.text())
        : Buffer.from(await r.arrayBuffer());
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, body);
    } catch { /* a missing optional stylesheet should not abort the page */ }
  }
  return localHrefs;
}

/**
 * Bundle the document's inline <style> blocks into a content-addressed file.
 * Whole document again: WPCode and Astra emit real layout CSS in the body.
 */
export async function writeInlineCss(html, outRoot) {
  const chunks = [];
  for (const m of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    const id = (m[1].match(/id=['"]([^'"]*)['"]/) || [])[1] || '';
    if (['admin-bar-inline-css', 'wp-emoji-styles-inline-css'].includes(id)) continue;
    if (m[2].trim()) chunks.push(`/* ${id || 'inline'} */\n${m[2].trim()}`);
  }
  const css = rewriteUrls(chunks.join('\n\n'));
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);
  const dir = path.join(outRoot, 'inline');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `inline-${hash}.css`);
  if (!existsSync(file)) await fs.writeFile(file, css, 'utf8');
  return { href: `/wp-assets/inline/inline-${hash}.css`, bytes: css.length };
}

/**
 * The mirrored body class, minus the session-only flags. Astra and Elementor key
 * styling off these, so everything else is kept verbatim.
 */
export function bodyClassOf(html) {
  return ((html.match(/<body[^>]*\bclass="([^"]*)"/) || [])[1] || '')
    .split(/\s+/)
    .filter(c => c && !['logged-in', 'admin-bar', 'no-customize-support', 'customize-support'].includes(c))
    .join(' ');
}

export const titleOf = html => ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim();
export const descriptionOf = html =>
  ((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim();

/** Every uploads path the markup references, as site-relative paths. */
export function collectMedia(markup, into = new Set()) {
  for (const m of markup.matchAll(wpMediaRe())) {
    into.add(m[1].replace(/&#0?38;/g, '&').split('?')[0]);
  }
  return into;
}

/** Download whichever of `refs` is not already on disk under public/. */
export async function downloadMedia(refs, concurrency = 12) {
  const missing = [...refs].filter(rel => !existsSync(path.join(PROJECT, 'public', rel)));
  let ok = 0;
  for (let i = 0; i < missing.length; i += concurrency) {
    await Promise.all(missing.slice(i, i + concurrency).map(async rel => {
      try {
        const r = await fetch(ORIGIN + encodeURI(rel), {
          headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
        });
        if (!r.ok) return;
        const dest = path.join(PROJECT, 'public', rel);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, Buffer.from(await r.arrayBuffer()));
        ok++;
      } catch { /* skip */ }
    }));
  }
  return { total: refs.size ?? refs.length, missing: missing.length, downloaded: ok };
}

const dataDir = path.join(PROJECT, 'src', 'data');
export const readData = async f => JSON.parse(await fs.readFile(path.join(dataDir, f), 'utf8'));
export const writeData = (f, value) =>
  fs.writeFile(path.join(dataDir, f), JSON.stringify(value, null, 2), 'utf8');
