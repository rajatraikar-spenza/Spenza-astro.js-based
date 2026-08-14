// Minimal WPGraphQL client for the headless content pipeline.
//
// GET, not POST. A WAF in front of WordPress refuses POST to /graphql with a
// 403 block page regardless of user agent, while GET queries answer anonymously
// — no credentials, no cookie jar, nothing to expire. POST is only what most
// GraphQL clients happen to default to, so this costs nothing.
//
// The practical limit of GET is URL length, which caps query *size*, not
// response size: a 127-character query returns 10 full posts. Keep queries
// small and paginate; do not interpolate large values into a query.
import { WP_ORIGIN } from './config.mjs';

const ENDPOINT = `${WP_ORIGIN}/graphql`;

/**
 * WordPress sits behind a WAF that treats a default client UA as suspicious.
 * A normal browser UA is what the mirroring scripts already send.
 */
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Run a query and return `data`, retrying transient failures.
 *
 * Throws rather than returning partial data: a loader that quietly yields 240
 * of 256 posts produces a build that looks fine and is silently missing
 * content, which is far worse than a failed build.
 */
export async function wpQuery(query, { retries = 3, timeoutMs = 60_000 } = {}) {
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}`;
  if (url.length > 6000) {
    throw new Error(
      `GraphQL GET URL is ${url.length} chars, which risks the server's URL limit. ` +
      `Split the query or reduce the page size.`
    );
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        const body = (await res.text()).slice(0, 200);
        // A 403 here is the WAF, not a bad query — say so, because the fix is
        // completely different from a GraphQL error.
        const hint = res.status === 403
          ? ' (looks like the WAF — confirm GET to /graphql is still allowed)'
          : '';
        throw new Error(`HTTP ${res.status}${hint}: ${body}`);
      }

      const json = await res.json();
      if (json.errors?.length) {
        throw new Error(`GraphQL error: ${json.errors.map(e => e.message).join('; ')}`);
      }
      if (!json.data) throw new Error('GraphQL response contained no data');
      return json.data;
    } catch (e) {
      lastError = e;
      if (attempt < retries) await sleep(attempt * 1500);
    }
  }
  throw new Error(`WPGraphQL query failed after ${retries} attempts: ${lastError.message}`);
}

/**
 * Page through a connection until WordPress says there is nothing left.
 *
 * `build(cursor)` returns the query for one page; `pick(data)` returns that
 * connection. Guarded against a cursor that stops advancing, which would
 * otherwise spin forever against a misbehaving endpoint.
 */
export async function wpPaginate(build, pick, { pageSize, onPage } = {}) {
  const out = [];
  let cursor = null;
  let guard = 0;

  for (;;) {
    const data = await wpQuery(build(cursor));
    const conn = pick(data);
    if (!conn) throw new Error('WPGraphQL response was missing the expected connection');

    out.push(...conn.nodes);
    onPage?.(out.length);

    if (!conn.pageInfo?.hasNextPage) break;

    const next = conn.pageInfo.endCursor;
    if (!next || next === cursor) {
      throw new Error(`Pagination stalled at ${out.length} records — cursor stopped advancing`);
    }
    cursor = next;

    if (++guard > 500) throw new Error(`Pagination exceeded 500 pages of ${pageSize} — aborting`);
  }
  return out;
}
