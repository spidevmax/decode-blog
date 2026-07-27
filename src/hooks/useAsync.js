import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps an async function from services/api in the idle → loading →
 * success | error cycle, with retry and out-of-order response protection.
 *
 * Generic infrastructure: it knows nothing about the domain. Per-entity hooks
 * (useAlbums, useNews…) build on top of it.
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

    fetcherRef
      .current(...depsRef.current)
      .then((data) => {
        if (!active || id !== requestId.current) return;
        setSettled({ key, data, error: null });
      })
      .catch((error) => {
        if (!active || id !== requestId.current) return;
        setSettled({ key, data: null, error });
      });

    return () => {
      // Invalidate this request: its response can no longer write state.
      active = false;
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
