import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { clearCache } from '@/hooks/asyncCache';

/**
 * Setup for the `dom` project only. The `node` project never loads this.
 */

/**
 * A working `localStorage`.
 *
 * jsdom 30 under Node 26 exposes none: jsdom does not install one, and Node's
 * own experimental global stays disabled without `--localstorage-file`. The
 * app survives that — `FavoritesProvider` wraps every access in a try/catch,
 * because private mode and quota errors are real — but surviving it is not
 * the same as being tested, and favourites that silently never persist would
 * make the storage format untestable.
 *
 * An in-memory Storage, reset between tests, so the provider is exercised
 * against something that behaves like the real thing.
 */
if (!window.localStorage) {
  const entries = new Map();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => (entries.has(String(key)) ? entries.get(String(key)) : null),
      setItem: (key, value) => entries.set(String(key), String(value)),
      removeItem: (key) => entries.delete(String(key)),
      clear: () => entries.clear(),
      key: (index) => [...entries.keys()][index] ?? null,
      get length() {
        return entries.size;
      },
    },
  });
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  /**
   * The request cache lives at module scope and deliberately outlives every
   * component that uses it — which, in a test file, means it outlives the
   * test. Clearing it keeps cases independent: without this, the second test
   * to ask for the same data would silently be handed the first test's answer
   * and never touch its own fetcher.
   */
  clearCache();

  // Same reasoning for saved items: one test's shelf is not the next one's.
  window.localStorage.clear();
});
