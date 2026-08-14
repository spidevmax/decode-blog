import { useCallback, useEffect, useRef, useState } from 'react';
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
 * @param {(...args:any[]) => Promise<T>} fetcher
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

    const id = ++requestId.current;
    let active = true;
    let timer = null;

    // Still the only gate on writing state: a superseded request stays silent,
    // whether it is on its first attempt or its last.
    const isCurrent = () => active && id === requestId.current;

    const run = async () => {
      for (let failures = 0; ; failures += 1) {
        try {
          const data = await fetcherRef.current(...depsRef.current);
          if (!isCurrent()) return;
          setSettled({ key, data, error: null });
          return;
        } catch (error) {
          if (!isCurrent()) return;

          if (!shouldRetry(error, failures)) {
            setSettled({ key, data: null, error });
            return;
          }

          await new Promise((resolve) => {
            timer = setTimeout(resolve, retryDelay(failures));
          });
          if (!isCurrent()) return;
        }
      }
    };

    run();

    return () => {
      // Invalidate this request: its response can no longer write state.
      active = false;
      // And stop a pending retry from firing after the deps changed.
      if (timer) clearTimeout(timer);
    };
  }, [enabled, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // The result only counts if it matches the current request; otherwise we are
  // still loading. All derived during render, no setState inside effects.
  const fresh = settled?.key === key ? settled : null;

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
