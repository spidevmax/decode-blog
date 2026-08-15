import { useCallback, useEffect, useRef, useState } from 'react';
import { invalidate, load, peek } from './asyncCache';
import { retryDelay, shouldRetry } from './useAsync.helpers';

/**
 * Wraps an async function from services/api in the idle → loading →
 * success | error cycle, with retry and out-of-order response protection.
 *
 * Generic infrastructure: it knows nothing about the domain. Per-entity hooks
 * (useAlbums, useNews…) build on top of it.
 *
 * A dropped request retries itself a couple of times before the reader is told
 * anything, so a blip stays a slightly longer load rather than becoming a wall
 * asking them to press a button. `loading` covers those attempts; by the time
 * `error` is set, retrying has already been tried and has stopped helping.
 *
 * Results go through `asyncCache`, so the same call made twice — by two
 * components at once, or by the same page revisited — costs one round trip.
 *
 * @param {(...args:any[]) => Promise<T>} fetcher  must be a stable reference,
 *   normally a function imported from `services/api`: it is half of the cache
 *   key, so an arrow written inline at the call site is a different fetcher on
 *   every render and will never hit the cache. Wrap the arguments, not the
 *   function — that is what `deps` is for.
 * @param {any[]} deps  arguments passed to the fetcher; they also trigger refetch
 * @param {{ enabled?: boolean }} [options]
 */
export const useAsync = (fetcher, deps, { enabled = true } = {}) => {
  // Only the most recent request may write to state.
  const requestId = useRef(0);
  const [attempt, setAttempt] = useState(0);

  // Fetcher and args are recreated every render; we read them via refs so they
  // do not count as effect dependencies. What does trigger a refetch is
  // `depsKey`, the serialised args.
  const fetcherRef = useRef(fetcher);
  const depsRef = useRef(deps);
  useEffect(() => {
    fetcherRef.current = fetcher;
    depsRef.current = deps;
  });

  const depsKey = JSON.stringify(deps);

  // Identity of the current request. Changing it is, on its own, the signal to
  // refetch: no effect is needed to sync the loading flag.
  const key = `${depsKey}|${attempt}`;
  const [settled, setSettled] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const fetcher = fetcherRef.current;

    // Already answered. The value is read straight out of the cache during
    // render, below, so there is nothing to wait for and nothing to set.
    if (peek(fetcher, depsKey)) return undefined;

    const id = ++requestId.current;
    let active = true;

    // Still the only gate on writing state: a superseded request stays silent,
    // whether it is on its first attempt or its last.
    const isCurrent = () => active && id === requestId.current;

    // Attempts, until one succeeds or the policy gives up. Note what this no
    // longer does: it does not stop when the component moves on. The request
    // is shared now — someone else may be waiting on it, and its result is
    // worth keeping either way — so unmounting silences *us*, and the work
    // runs to completion and fills the cache.
    const run = async () => {
      for (let failures = 0; ; failures += 1) {
        try {
          return await fetcher(...depsRef.current);
        } catch (error) {
          if (!shouldRetry(error, failures)) throw error;
          await new Promise((resolve) => setTimeout(resolve, retryDelay(failures)));
        }
      }
    };

    load(fetcher, depsKey, run).then(
      (data) => {
        if (isCurrent()) setSettled({ key, data, error: null });
      },
      (error) => {
        if (isCurrent()) setSettled({ key, data: null, error });
      },
    );

    return () => {
      // Invalidate this request: its response can no longer write state.
      active = false;
    };
  }, [enabled, key, depsKey]);

  // Retrying means going back to the network, so the failed call is forgotten
  // first — otherwise the button would keep re-serving whatever is on file.
  const retry = useCallback(() => {
    invalidate(fetcherRef.current, JSON.stringify(depsRef.current));
    setAttempt((n) => n + 1);
  }, []);

  // The result only counts if it matches the current request; otherwise we are
  // still loading. All derived during render, no setState inside effects.
  //
  // A cache hit counts too, and counts on the very first render: reading it
  // here rather than waiting for the effect is what makes a revisit paint the
  // list immediately instead of flashing a loader at something already known.
  const cached = enabled ? peek(fetcher, depsKey) : null;
  const fresh =
    settled?.key === key
      ? settled
      : cached
        ? { key, data: cached.data, error: null }
        : null;

  if (!enabled) {
    return { data: null, loading: false, error: null, retry };
  }

  return {
    data: fresh?.data ?? null,
    error: fresh?.error ?? null,
    loading: fresh === null,
    retry,
  };
};
