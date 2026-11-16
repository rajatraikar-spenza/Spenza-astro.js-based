// Astro integration: a single-file copy of the home page, rebuilt on every build.
//
// `dist/index.html` is the home page, but it only works next to the rest of
// `dist` — two CSS bundles, a dozen scripts, fonts and images are all separate
// requests. This folds them into one file that opens from disk, an email or a
// CMS upload, with every style, script, font and picture the page has.
//
// It reads the *finished* output at `astro:build:done`, so it cannot drift: any
// change to the home page (a component, copy, CSS, a script) reaches the next
// build's `dist/index.html`, and therefore this file. Nothing is hand-copied.
//
// What goes inline, and what does not:
//   inlined   stylesheets (with the fonts/images they reference), every script
//             (module scripts are bundled into one first), <img>/<source>/icons
//   absolute  anything that is not in `dist` — the post and customer images that
//             live on MEDIA_ORIGIN — plus legacy font formats, anything large,
//             and every in-site link, which points at SITE_URL
// Absolute rather than dropped, so the page still renders when online. Offline,
// only those few images are missing.
//
// Written outside `dist` on purpose. A second copy of the home page at a public
// URL would be duplicate content that Google is free to index.
import * as esbuild from 'esbuild';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, MEDIA_ORIGIN } from './config.mjs';

const MIME = {
  '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

/** Legacy font formats (woff2 is in every font-face list ahead of them); inlining them only adds weight. */
const SKIP_INLINE = new Set(['.eot', '.ttf', '.otf', '.woff']);
/** One asset bigger than this stays a link instead of ballooning the file. */
const MAX_INLINE = 600 * 1024;

export default function homeSnapshot({ out = 'output/home.html' } = {}) {
  return {
    name: 'home-snapshot',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const src = path.join(dist, 'index.html');
        const exists = await fs.stat(src).then(() => true, () => false);
        if (!exists) return;

        const outFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', out);
        const html = await snapshot(dist, await fs.readFile(src, 'utf8'));
        await fs.mkdir(path.dirname(outFile), { recursive: true });
        await fs.writeFile(outFile, html);
        logger.info(`home snapshot: ${out} (${(html.length / 1024).toFixed(0)} KB)`);

        // Optional: keep a zip of it current too (`spenza-home/index.html`
        // inside). Set HOME_SNAPSHOT_ZIP in .env to a path; unset on CI, so the
        // deploy never needs `zip`. Replaced in place, never accumulated.
        const zipPath = process.env.HOME_SNAPSHOT_ZIP;
        if (zipPath) {
          const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'home-snapshot-'));
          try {
            await fs.mkdir(path.join(stage, 'spenza-home'));
            await fs.writeFile(path.join(stage, 'spenza-home', 'index.html'), html);
            const tmp = path.join(stage, 'out.zip');
            await promisify(execFile)('zip', ['-qr', tmp, 'spenza-home'], { cwd: stage });
            await fs.copyFile(tmp, zipPath);
            logger.info(`home snapshot: updated ${zipPath}`);
          } catch (err) {
            logger.warn(`home snapshot: could not write ${zipPath}: ${err.message}`);
          } finally {
            await fs.rm(stage, { recursive: true, force: true });
          }
        }
      },
    },
  };
}

/** Where an asset lives when it is not inlined. */
function absolute(url) {
  if (/^(https?:|data:|mailto:|tel:|#|javascript:)/i.test(url) || url === '') return url;
  if (url.startsWith('//')) return `https:${url}`;
  const origin = MEDIA_ORIGIN && /^\/(wp-content\/uploads|wp-assets\/uploads)\//.test(url) ? MEDIA_ORIGIN : SITE_URL;
  return url.startsWith('/') ? origin + url : url;
}

export async function snapshot(dist, html) {
  const file = url => {
    const p = url.split('#')[0].split('?')[0];
    if (!p.startsWith('/') || p.startsWith('//')) return null;
    return path.join(dist, decodeURIComponent(p));
  };

  /** A local URL as a data: URI if it is in `dist` and a sensible size, else absolute. */
  async function asset(url, base = '/') {
    if (/^(https?:|data:|#|\/\/)/i.test(url)) return absolute(url);
    const resolved = url.startsWith('/') ? url : new URL(url, `http://x${base}`).pathname + (url.match(/[?#].*$/)?.[0] ?? '');
    const f = file(resolved);
    const ext = path.extname(resolved.split(/[?#]/)[0]).toLowerCase();
    if (!f || SKIP_INLINE.has(ext) || !MIME[ext] || /\/fonts\//.test(resolved)) return absolute(resolved);
    try {
      const buf = await fs.readFile(f);
      if (buf.length > MAX_INLINE) return absolute(resolved);
      return `data:${MIME[ext]};base64,${buf.toString('base64')}`;
    } catch {
      return absolute(resolved);
    }
  }

  const replaceAsync = async (str, re, fn) => {
    const parts = [];
    let last = 0;
    for (const m of str.matchAll(re)) {
      parts.push(str.slice(last, m.index), fn(...m));
      last = m.index + m[0].length;
    }
    parts.push(str.slice(last));
    return (await Promise.all(parts)).join('');
  };

  /** Rewrite every url(...) in a stylesheet, relative to where that sheet lived. */
  const cssUrls = (css, base) =>
    replaceAsync(css, /url\(\s*(['"]?)([^'")]+)\1\s*\)/g, async (_, q, u) => `url("${await asset(u.trim(), base)}")`);

  // Drop hints that only make sense next to the files that are about to vanish.
  html = html.replace(/<link\b[^>]*\brel=["']?(?:modulepreload|preload|prefetch)["']?[^>]*>\s*/gi, '');

  // Stylesheets -> <style>
  html = await replaceAsync(html, /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, async tag => {
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    const f = href && file(href);
    if (!f) return tag;
    let css;
    try { css = await fs.readFile(f, 'utf8'); } catch { return tag.replace(href, absolute(href)); }
    return `<style>${(await cssUrls(css, path.posix.dirname(href.split('?')[0]) + '/')).replace(/<\/style/gi, '<\\/style')}</style>`;
  });

  // Scripts with a local src -> the same script as a deferred data: URL, which
  // keeps their order, their `defer`, and `document.currentScript` attributes.
  html = await replaceAsync(html, /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi, async (tag, a, srcUrl, b) => {
    const f = file(srcUrl);
    if (!f) return tag.replace(srcUrl, absolute(srcUrl));
    let code;
    const isModule = /\btype=["']module["']/i.test(a + b);
    try {
      code = isModule
        ? (await esbuild.build({ entryPoints: [f], bundle: true, format: 'iife', write: false, minify: true, logLevel: 'silent' })).outputFiles[0].text
        : await fs.readFile(f, 'utf8');
    } catch { return tag.replace(srcUrl, absolute(srcUrl)); }
    const attrs = `${a}${b}`.replace(/\btype=["']module["']/i, '').replace(/\b(defer|async)\b/gi, '').trim();
    return `<script ${attrs} defer src="data:text/javascript;base64,${Buffer.from(code).toString('base64')}"></script>`;
  });

  // Inline <style> blocks and style="" attributes with url(...) in them.
  html = await replaceAsync(html, /<style\b[^>]*>[\s\S]*?<\/style>/gi, tag => cssUrls(tag, '/'));
  html = await replaceAsync(html, /\bstyle=(["'])([^"']*url\([^"']*)\1/gi, async (_, q, v) => `style=${q}${await cssUrls(v, '/')}${q}`);

  // Pictures and icons: src / srcset / poster on img, source, video, link.
  html = await replaceAsync(html, /\b(src|poster|href)=(["'])(\/[^"']*)\2/gi, async (m, attr, q, u, off) => {
    const tagStart = html.lastIndexOf('<', off);
    const tagName = html.slice(tagStart + 1, tagStart + 12).match(/^[a-z0-9]+/i)?.[0].toLowerCase();
    // In-site navigation points at the live site; only media is embedded.
    if (attr === 'href' && tagName !== 'link') return `${attr}=${q}${absolute(u)}${q}`;
    if (tagName === 'script') return m;
    return `${attr}=${q}${await asset(u)}${q}`;
  });
  html = await replaceAsync(html, /\bsrcset=(["'])([^"']+)\1/gi, async (_, q, v) => {
    const items = await Promise.all(v.split(',').map(async c => {
      const [u, ...rest] = c.trim().split(/\s+/);
      return [await asset(u), ...rest].join(' ');
    }));
    return `srcset=${q}${items.join(', ')}${q}`;
  });
  // Lazy-load attributes some images carry in place of src.
  html = await replaceAsync(html, /\b(data-(?:src|bg|lazy-src))=(["'])(\/[^"']*)\2/gi, async (_, a, q, u) => `${a}=${q}${await asset(u)}${q}`);
  // Forms and anything else still pointing at a root-relative path.
  html = html.replace(/\b(action)=(["'])(\/[^"']*)\2/gi, (_, a, q, u) => `${a}=${q}${absolute(u)}${q}`);

  return html;
}
