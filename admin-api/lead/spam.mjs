// Spam quarantine for the lead endpoint.
//
// Quarantine never drops or rejects a lead. A suspected one is archived and alerted like any
// other; the alert is tagged, and no client reply or ad conversion is sent. The sender gets the
// same response either way. Everything here fails open: if a check cannot run, the lead is
// treated as genuine.
//
// Two signals, either one is enough:
//   tor          the request came from a Tor exit node
//   random_text  two or more of the name / company / use-case answers are random mixed-case strings

const TOR_LIST_URL = 'https://check.torproject.org/torbulkexitlist';
const TOR_TTL_MS = 60 * 60 * 1000;
const TOR_RETRY_MS = 5 * 60 * 1000;
const TOR_TIMEOUT_MS = 2000;
// The real list has over a thousand addresses. Far fewer means we were handed something else.
const TOR_MIN_ENTRIES = 100;

let tor = { exits: new Set(), nextFetch: 0 };
export const resetTorCache = () => { tor = { exits: new Set(), nextFetch: 0 }; };

/** The exit list, cached in the warm Lambda. A failed refresh keeps the last good copy. */
async function torExits(deps) {
  if (deps.now() < tor.nextFetch) return tor.exits;
  try {
    const res = await deps.fetch(TOR_LIST_URL, { signal: AbortSignal.timeout(TOR_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const exits = new Set((await res.text()).split('\n').map(l => l.trim()).filter(l => /^[0-9a-f.:]{3,45}$/i.test(l)));
    if (exits.size < TOR_MIN_ENTRIES) throw new Error(`only ${exits.size} addresses`);
    tor = { exits, nextFetch: deps.now() + TOR_TTL_MS };
  } catch (err) {
    console.error('[lead] tor list unavailable:', err.message);
    tor.nextFetch = deps.now() + TOR_RETRY_MS;
  }
  return tor.exits;
}

// Free-text answers worth reading, per form. A form with fewer than two can never be
// quarantined for its text, so one odd-looking answer is never enough.
const TEXT_FIELDS = {
  5: ['input_1.3', 'input_8.6', 'input_3'],
  20: ['input_1', 'input_6'],
  22: ['input_1', 'input_3', 'input_6'],
  23: ['input_1', 'input_3'],
};

/** One unbroken word of 12+ letters that jumps from lower to upper case 3+ times: "eTeOqVRPHSXWgEMrtR". */
export const looksRandom = value => {
  const s = String(value ?? '').trim();
  return /^[A-Za-z]{12,}$/.test(s) && (s.match(/[a-z](?=[A-Z])/g) || []).length >= 3;
};

export async function spamReasons({ formId, fields, ip }, env, deps) {
  if (env.SPAM_FILTER === '0') return [];
  const reasons = [];
  try {
    if (ip && (await torExits(deps)).has(ip)) reasons.push('tor');
    if ((TEXT_FIELDS[formId] ?? []).filter(k => looksRandom(fields[k])).length >= 2) reasons.push('random_text');
  } catch (err) {
    console.error('[lead] spam check failed, treating as genuine:', err.message);
    return [];
  }
  return reasons;
}
