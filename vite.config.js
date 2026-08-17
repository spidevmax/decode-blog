import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Both test projects read these when `api.js` is imported, so they have to be
 * set here: a `beforeAll` would run after the module was already evaluated.
 *
 * No simulated failures and no latency. The suite checks what the API returns,
 * not how long it takes, and half a second of setTimeout per call proves
 * nothing while making the run twenty times slower.
 */
const TEST_ENV = { VITE_API_FAIL_RATE: '0', VITE_API_LATENCY: '0' };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // A single root alias: `@/components/...`, `@/hooks/...`, etc.
      // The editor's equivalent lives in jsconfig.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    /**
     * Two projects, one `npm test`, split by what they need rather than by
     * what they cover.
     *
     * `node` holds the pure logic — helpers and the service layer — and runs
     * with no DOM at all. That is why it finishes in under half a second, and
     * that speed is worth protecting: it is the suite you can afford to leave
     * running while you work. Nothing that needs a browser belongs in it.
     *
     * `dom` is for hooks and components, and pays for jsdom to get them. The
     * file extension decides which project claims a test, so there is nothing
     * to configure per file: `.test.js` is pure, `.test.jsx` renders.
     */
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.js'],
          env: TEST_ENV,
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.jsx'],
          setupFiles: ['./src/test/setup.js'],
          env: TEST_ENV,
        },
      },
    ],
  },
});
