import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base './' so the built site works from any folder (GitHub Pages, Netlify, etc.)
export default defineConfig({
  base: './',
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 800, // three.js alone is ~600 kB
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        resume: resolve(import.meta.dirname, 'resume.html'),
      },
    },
  },
});
