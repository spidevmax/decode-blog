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
    // api.js lee estas variables al importarse, así que hay que fijarlas antes
    // de que se cargue el módulo: en un beforeAll llegarían tarde.
    // Sin fallos simulados y sin latencia: la suite comprueba qué devuelve la
    // API, no cuánto tarda, y media hora de setTimeout no prueba nada.
    env: { VITE_API_FAIL_RATE: '0', VITE_API_LATENCY: '0' },
  },
});
