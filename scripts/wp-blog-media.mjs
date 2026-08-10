// Blog markdown was imported with absolute preprod.spenza.com URLs, so every
// post hot-links its images back to WordPress. Download the media and rewrite
// the markdown to local paths.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://preprod.spenza.com';
const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const BLOG_DIR = path.join(PROJECT, 'src/content/blog');

const cookieHeader = await (async () => {
  const raw = await fs.readFile(path.join(CACHE, 'cookies.txt'), 'utf8');
  const seen = new Set();
  return raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#')).map(l => l.split('\t'))
    .filter(p => p.length >= 7).map(p => [p[5].trim(), p[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k))
    .map(([k, v]) => `${k}=${v}`).join('; ');
})();

const files = (await fs.readdir(BLOG_DIR)).filter(f => f.endsWith('.md'));

// ---- Collect media references ------------------------------------------
const media = new Set();
for (const f of files) {
  const md = await fs.readFile(path.join(BLOG_DIR, f), 'utf8');
  for (const m of md.matchAll(/https:\/\/preprod\.spenza\.com(\/wp-content\/uploads\/[^\s"'<>)\\]+)/g)) {
    // Markdown carries HTML-encoded ampersands from the WordPress export.
    media.add(m[1].replace(/&#0?38;/g, '&').replace(/&amp;/g, '&').split('?')[0]);
  }
}

const missing = [...media].filter(rel => !existsSync(path.join(PROJECT, 'public', rel)));
process.stdout.write(`blog media referenced: ${media.size}, missing: ${missing.length}\n`);

let ok = 0;
const failed = [];
const CONCURRENCY = 16;
for (let i = 0; i < missing.length; i += CONCURRENCY) {
  await Promise.all(missing.slice(i, i + CONCURRENCY).map(async rel => {
    const dest = path.join(PROJECT, 'public', rel);
    try {
      const res = await fetch(ORIGIN + encodeURI(rel), {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) {
      failed.push(`${rel} -> ${e.message}`);
    }
  }));
  if (i % 320 === 0) process.stdout.write(`  ${Math.min(i + CONCURRENCY, missing.length)}/${missing.length}\n`);
}
process.stdout.write(`downloaded: ${ok}, failed: ${failed.length}\n`);

// ---- Rewrite the markdown ----------------------------------------------
let rewritten = 0;
for (const f of files) {
  const file = path.join(BLOG_DIR, f);
  const before = await fs.readFile(file, 'utf8');
  const after = before
    .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\/uploads\//g, '/wp-content/uploads/')
    .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\//g, '/wp-assets/wp-content/')
    .replace(/https?:\/\/preprod\.spenza\.com\//g, '/')
    .replace(/https?:\/\/preprod\.spenza\.com(?![\w.])/g, '/');
  if (after !== before) {
    await fs.writeFile(file, after, 'utf8');
    rewritten++;
  }
}
process.stdout.write(`markdown rewritten: ${rewritten}/${files.length}\n`);

if (failed.length) {
  await fs.writeFile(path.join(CACHE, 'blog-media-failures.txt'), failed.join('\n'), 'utf8');
  process.stdout.write(`failures written to .wp-cache/blog-media-failures.txt\n`);
  process.stdout.write(failed.slice(0, 15).join('\n') + '\n');
}
