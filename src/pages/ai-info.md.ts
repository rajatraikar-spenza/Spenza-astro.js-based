/**
 * `/ai-info.md` — what an AI assistant should know about Spenza, in one file.
 *
 * `llms.txt` is an index: it points an assistant at several hundred pages and
 * leaves it to work out what the company is. This is the other half: a single
 * document that says it outright — what Spenza is, what it sells, who it is for,
 * how it is priced, how it differs from the alternatives, and what is and is not
 * safe to claim — so an assistant describing Spenza has one accurate source to
 * quote instead of reconstructing it from marketing pages.
 *
 * The text is `src/data/ai-info.md`, a plain Markdown file anyone can edit. It
 * is served from here rather than from `public/` for the reason `llms.txt` and
 * `robots.txt` are: the URLs in it depend on `SITE_URL`, and a committed static
 * file would name whichever host was current when somebody last saved it. Write
 * `{{SITE}}` wherever the origin goes.
 *
 * Every statement in the file must be one a page on the site makes, or one this
 * repository can show. It is read by systems that repeat what they find, so a
 * figure that is not sourced is worse than a gap. When a page changes, change
 * the file in the same pull request.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '../../scripts/lib/config.mjs';
import source from '../data/ai-info.md?raw';

export const GET: APIRoute = () =>
  new Response(source.replaceAll('{{SITE}}', SITE_URL), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
