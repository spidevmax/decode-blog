/**
 * Request cache and in-flight deduplication for useAsync.
 *
 * Two different jobs, one table:
 *
 * 1. Deduplication. Two callers asking for the same thing at the same time
 *    get the same promise, not two round trips. This is what stops the news
 *    archive being fetched twice on /news/:id, and what keeps StrictMode's
 *    double-mounted effects from doubling every request in development.
 *
 * 2. Reuse. A resolved result stays put, so going Home → Reviews → Home
 *    paints from memory instead of spending another round trip on a list the
 *    reader saw ten seconds ago.
 *
 * Only successes are kept. A failure is dropped on the way out, so the retry
 * button — and the next component to ask — actually go back to the network
 * rather than being handed the same error for the rest of the session.
 *
 * Entries live as long as the page does. There is no TTL: this reads an
 * archive of published reviews, where nothing changes under the reader
 * mid-session. A backend serving mutable data would want one, and it belongs
 * here rather than at the call sites.
 *
 * Results are shared by reference between everyone who asks for the same key,
 * so nothing downstream may mutate what it is given. `api.js` already hands
 * out defensive copies; this keeps one of them instead of one per caller.
 */

/**
 * fetcher → depsKey → entry.
 *
 * Keyed by the function itself, because the serialised arguments alone are
 * not an identity: `getNews()` and `getFeatures()` both key as `[]`, and one
 * would happily serve the other's cached result. Weak, so a fetcher that goes
 * out of scope takes its results with it.
 *
 * An entry is `{ promise }` while in flight and `{ data }` once resolved.
 */
let byFetcher = new WeakMap();

const entriesFor = (fetcher) => {
  let entries = byFetcher.get(fetcher);
  if (!entries) {
    entries = new Map();
    byFetcher.set(fetcher, entries);
  }
  return entries;
};

/**
 * The resolved value for this call, if there is one.
 *
 * Read during render, so it must stay synchronous and must not report
 * in-flight requests: those have nothing to show yet.
 *
 * @returns {{data: any}|null}
 */
export const peek = (fetcher, depsKey) => {
  const entry = byFetcher.get(fetcher)?.get(depsKey);
  return entry && 'data' in entry ? { data: entry.data } : null;
};

/**
 * Runs `run`, or joins the identical call already running, or returns what
 * that call resolved to earlier.
 *
 * @param {Function} fetcher  identity of the call, not necessarily what runs
 * @param {string} depsKey  its serialised arguments
 * @param {() => Promise<any>} run  what to do on a miss, retries included
 */
export const load = (fetcher, depsKey, run) => {
  const entries = entriesFor(fetcher);
  const entry = entries.get(depsKey);

  if (entry) return 'data' in entry ? Promise.resolve(entry.data) : entry.promise;

  const promise = run().then(
    (data) => {
      // Only overwrite our own entry: an invalidate() while this was in
      // flight means someone wants this result gone, not enshrined.
      if (entries.get(depsKey)?.promise === promise) {
        entries.set(depsKey, { data });
      }
      return data;
    },
    (error) => {
      if (entries.get(depsKey)?.promise === promise) entries.delete(depsKey);
      throw error;
    },
  );

  entries.set(depsKey, { promise });
  return promise;
};

/** Forgets one call, so the next asker goes back to the network. */
export const invalidate = (fetcher, depsKey) => {
  byFetcher.get(fetcher)?.delete(depsKey);
};

/** Empties the cache. For tests: nothing in the app has cause to call it. */
export const clearCache = () => {
  byFetcher = new WeakMap();
};
