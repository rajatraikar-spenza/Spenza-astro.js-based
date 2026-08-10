// Generate one Astro page per mirrored WordPress page.
import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT = path.resolve(import.meta.dirname, '..');
const pages = JSON.parse(await fs.readFile(path.join(PROJECT, 'src/data/wp-pages.json'), 'utf8'));

const written = [];
for (const slug of Object.keys(pages)) {
  const file = slug === 'index' ? 'index.astro' : `${slug}.astro`;
  const body = `---
import WpLayout from '../layouts/WpLayout.astro';
import content from '../partials/${slug}.html?raw';
---

<WpLayout slug="${slug}">
  <Fragment set:html={content} />
</WpLayout>
`;
  await fs.writeFile(path.join(PROJECT, 'src/pages', file), body, 'utf8');
  written.push(file);
}

process.stdout.write(`generated ${written.length} pages:\n${written.join('\n')}\n`);
