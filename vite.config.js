import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Un único alias raíz: `@/components/...`, `@/hooks/...`, etc.
      // El equivalente para el editor vive en jsconfig.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    // api.js lee VITE_API_FAIL_RATE al importarse, así que hay que fijarla
    // antes de que se cargue el módulo: en un beforeAll llegaría tarde.
    env: { VITE_API_FAIL_RATE: '0' },
  },
});
