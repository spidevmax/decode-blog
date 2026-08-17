import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearCache, invalidate, load, peek } from './asyncCache';

/** A fetcher that resolves when told to, so overlapping calls can be staged. */
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  clearCache();
});

describe('peek', () => {
  it('reports nothing for a call that has never been made', () => {
    expect(peek(() => {}, '[]')).toBeNull();
  });

  it('reports nothing while the call is still in flight', async () => {
    const fetcher = () => {};
    const pending = deferred();
    const inFlight = load(fetcher, '[]', () => pending.promise);

    expect(peek(fetcher, '[]')).toBeNull();

    pending.resolve('done');
    await inFlight;
    expect(peek(fetcher, '[]')).toEqual({ data: 'done' });
  });
});

describe('load', () => {
  it('runs the fetcher on a miss', async () => {
    const run = vi.fn().mockResolvedValue('albums');
    await expect(load(() => {}, '[]', run)).resolves.toBe('albums');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('serves a resolved result without running again', async () => {
    const fetcher = () => {};
    const run = vi.fn().mockResolvedValue('albums');

    await load(fetcher, '[]', run);
    await expect(load(fetcher, '[]', run)).resolves.toBe('albums');

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('joins a call already in flight instead of starting a second', async () => {
    const fetcher = () => {};
    const pending = deferred();
    const run = vi.fn(() => pending.promise);

    const first = load(fetcher, '[]', run);
    const second = load(fetcher, '[]', run);

    pending.resolve('news');
    expect(await first).toBe('news');
    expect(await second).toBe('news');
    expect(run).toHaveBeenCalledTimes(1);
  });

  // The serialised arguments alone are not an identity: every no-argument
  // getter keys as '[]', and one must not be served the other's result.
  it('keeps different fetchers apart under the same key', async () => {
    const getNews = () => {};
    const getFeatures = () => {};

    await load(getNews, '[]', async () => 'news');
    await load(getFeatures, '[]', async () => 'features');

    expect(peek(getNews, '[]')).toEqual({ data: 'news' });
    expect(peek(getFeatures, '[]')).toEqual({ data: 'features' });
  });

  it('keeps different arguments apart for the same fetcher', async () => {
    const getAlbums = () => {};

    await load(getAlbums, '[{"genre":"Techno"}]', async () => 'techno');
    await load(getAlbums, '[{"genre":"Jazz"}]', async () => 'jazz');

    expect(peek(getAlbums, '[{"genre":"Techno"}]')).toEqual({ data: 'techno' });
    expect(peek(getAlbums, '[{"genre":"Jazz"}]')).toEqual({ data: 'jazz' });
  });

  // A cached failure would hand the retry button the same error forever.
  it('does not keep failures', async () => {
    const fetcher = () => {};
    const run = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(load(fetcher, '[]', run)).rejects.toThrow('offline');
    expect(peek(fetcher, '[]')).toBeNull();

    run.mockResolvedValue('recovered');
    await expect(load(fetcher, '[]', run)).resolves.toBe('recovered');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('rejects every caller that joined a failing call', async () => {
    const fetcher = () => {};
    const pending = deferred();

    const first = load(fetcher, '[]', () => pending.promise);
    const second = load(fetcher, '[]', () => pending.promise);

    pending.reject(new Error('offline'));
    await expect(first).rejects.toThrow('offline');
    await expect(second).rejects.toThrow('offline');
  });
});

describe('invalidate', () => {
  it('sends the next caller back to the fetcher', async () => {
    const fetcher = () => {};
    const run = vi.fn().mockResolvedValue('first');

    await load(fetcher, '[]', run);
    invalidate(fetcher, '[]');
    expect(peek(fetcher, '[]')).toBeNull();

    run.mockResolvedValue('second');
    await expect(load(fetcher, '[]', run)).resolves.toBe('second');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('is silent about calls that were never cached', () => {
    expect(() => invalidate(() => {}, '[]')).not.toThrow();
  });

  // Invalidating mid-flight means "forget this", not "forget it until it
  // lands and then keep it after all".
  it('stops an in-flight call from being cached when it resolves', async () => {
    const fetcher = () => {};
    const pending = deferred();

    const inFlight = load(fetcher, '[]', () => pending.promise);
    invalidate(fetcher, '[]');

    pending.resolve('stale');
    await inFlight;

    expect(peek(fetcher, '[]')).toBeNull();
  });
});
