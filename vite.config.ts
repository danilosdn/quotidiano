import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 4173 },
  preview: { port: 4174 },
  build: { sourcemap: true }
});
