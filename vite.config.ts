import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: { port: 4173 },
  preview: { port: 4174 },
  build: { sourcemap: true },
  test: { exclude: ['**/node_modules/**', 'tests/e2e/**'] }
});
