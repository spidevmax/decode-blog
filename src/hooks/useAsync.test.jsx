import { renderHook, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAsync } from './useAsync';

/**
 * A fetcher whose calls resolve when the test says so.
 *
 * Most of what useAsync does only exists in the window between a request
 * starting and finishing — superseding it, joining it, retrying it — so the
 * tests need to hold that window open rather than race it.
 */
const controllable = () => {
  const calls = [];

  const fetcher = vi.fn((...args) => {
    let settle;
    const promise = new Promise((resolve, reject) => {
      settle = { resolve, reject };
    });
    calls.push({ args, ...settle });
    return promise;
  });

  return { fetcher, calls };
};

/** An error shaped like the ones services/api.js throws. */
const apiError = (status) => Object.assign(new Error(`status ${status}`), { status });

describe('the request cycle', () => {
  it('starts loading, then reports the data', async () => {
    const { fetcher, calls } = controllable();
    const { result } = renderHook(() => useAsync(fetcher, ['a']));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    calls[0].resolve('albums');
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('albums');
    expect(result.current.error).toBeNull();
  });

  it('passes the deps to the fetcher as arguments', async () => {
    const { fetcher, calls } = controllable();
    renderHook(() => useAsync(fetcher, ['techno', 1997]));

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(calls[0].args).toEqual(['techno', 1997]);
  });

  it('refetches when the deps change', async () => {
    const { fetcher, calls } = controllable();
    const { result, rerender } = renderHook(({ genre }) => useAsync(fetcher, [genre]), {
      initialProps: { genre: 'techno' },
    });

    calls[0].resolve('techno albums');
    await waitFor(() => expect(result.current.data).toBe('techno albums'));

    rerender({ genre: 'jazz' });
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(calls).toHaveLength(2);

    calls[1].resolve('jazz albums');
    await waitFor(() => expect(result.current.data).toBe('jazz albums'));
  });

  it('does not fetch at all when disabled', () => {
    const { fetcher } = controllable();
    const { result } = renderHook(() => useAsync(fetcher, ['a'], { enabled: false }));

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });
});

/**
 * Two mechanisms defend this, and it is worth knowing which is load-bearing.
 * `isCurrent()` stops a superseded request from writing state at all, and the
 * `settled.key === key` check during render refuses to read a result that
 * belongs to a different request. Mutating the guard away leaves these tests
 * green — the render check alone keeps the data right — while mutating the
 * key check away turns them red. The guard earns its place by skipping a
 * pointless state update, not by protecting correctness on its own.
 */
describe('out-of-order responses', () => {
  // The bug this prevents: filter to techno, change your mind and filter to
  // jazz, and the slower techno response lands last and wins.
  it('ignores a superseded response that arrives late', async () => {
    const { fetcher, calls } = controllable();
    const { result, rerender } = renderHook(({ genre }) => useAsync(fetcher, [genre]), {
      initialProps: { genre: 'techno' },
    });

    rerender({ genre: 'jazz' });
    await waitFor(() => expect(calls).toHaveLength(2));

    // The second request answers first, then the abandoned one straggles in.
    calls[1].resolve('jazz albums');
    await waitFor(() => expect(result.current.data).toBe('jazz albums'));

    calls[0].resolve('techno albums');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(result.current.data).toBe('jazz albums');
  });

  it('stays silent after the component is gone', async () => {
    const { fetcher, calls } = controllable();
    const { unmount } = renderHook(() => useAsync(fetcher, ['a']));

    await waitFor(() => expect(calls).toHaveLength(1));
    unmount();

    // Resolving into an unmounted hook must not warn or throw.
    calls[0].resolve('albums');
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
});

describe('retrying', () => {
  it('absorbs a transient failure without telling the reader', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(apiError(503))
      .mockResolvedValueOnce('albums');

    const { result } = renderHook(() => useAsync(fetcher, ['a']));

    await waitFor(() => expect(result.current.data).toBe('albums'), { timeout: 3000 });
    // The reader saw a slightly longer load, never an error.
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('gives up after the policy runs out and surfaces the failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(apiError(503));
    const { result } = renderHook(() => useAsync(fetcher, ['a']));

    await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 4000 });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    // The first attempt plus AUTO_RETRIES.
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  // A 404 is an answer, not a blip. Asking twice more only delays the message.
  it('does not retry a 404', async () => {
    const fetcher = vi.fn().mockRejectedValue(apiError(404));
    const { result } = renderHook(() => useAsync(fetcher, ['missing']));

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error.status).toBe(404);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('goes back to the network when retry() is called', async () => {
    const fetcher = vi.fn().mockRejectedValue(apiError(503));
    const { result } = renderHook(() => useAsync(fetcher, ['a']));

    await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 4000 });

    fetcher.mockResolvedValue('albums');
    result.current.retry();

    await waitFor(() => expect(result.current.data).toBe('albums'), { timeout: 4000 });
    expect(result.current.error).toBeNull();
  });
});

describe('caching', () => {
  it('serves a repeat visit from memory, with no loading flash', async () => {
    const { fetcher, calls } = controllable();

    const first = renderHook(() => useAsync(fetcher, ['a']));
    calls[0].resolve('albums');
    await waitFor(() => expect(first.result.current.data).toBe('albums'));
    first.unmount();

    // Mounting again is the reader navigating back. The data has to be there
    // on the very first render: a loader in front of something already known
    // is the flicker this cache exists to remove.
    const second = renderHook(() => useAsync(fetcher, ['a']));
    expect(second.result.current.loading).toBe(false);
    expect(second.result.current.data).toBe('albums');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('lets two callers share one request', async () => {
    const { fetcher, calls } = controllable();

    const a = renderHook(() => useAsync(fetcher, ['x']));
    const b = renderHook(() => useAsync(fetcher, ['x']));

    await waitFor(() => expect(calls).toHaveLength(1));

    calls[0].resolve('shared');
    await waitFor(() => expect(a.result.current.data).toBe('shared'));
    await waitFor(() => expect(b.result.current.data).toBe('shared'));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  // StrictMode mounts every effect twice in development. Without dedup that
  // doubled every request in the app.
  it('survives StrictMode double-mounting with one request', async () => {
    const { fetcher, calls } = controllable();

    renderHook(() => useAsync(fetcher, ['a']), { wrapper: StrictMode });

    await waitFor(() => expect(calls).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('keeps separate arguments apart', async () => {
    const { fetcher, calls } = controllable();

    const techno = renderHook(() => useAsync(fetcher, ['techno']));
    const jazz = renderHook(() => useAsync(fetcher, ['jazz']));

    await waitFor(() => expect(calls).toHaveLength(2));
    calls[0].resolve('techno albums');
    calls[1].resolve('jazz albums');

    await waitFor(() => expect(techno.result.current.data).toBe('techno albums'));
    await waitFor(() => expect(jazz.result.current.data).toBe('jazz albums'));
  });

  // A cached failure would hand the retry button the same error forever.
  it('does not cache a failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(apiError(404));

    const first = renderHook(() => useAsync(fetcher, ['missing']));
    await waitFor(() => expect(first.result.current.error).toBeTruthy());
    first.unmount();

    fetcher.mockResolvedValue('found after all');
    const second = renderHook(() => useAsync(fetcher, ['missing']));
    await waitFor(() => expect(second.result.current.data).toBe('found after all'));
  });
});
