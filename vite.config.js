import { defineConfig } from 'vite';

// base './' so the built site works from any folder (GitHub Pages, Netlify, etc.)
export default defineConfig({
  base: './',
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 800, // three.js alone is ~600 kB
    rolldownOptions: {
      // two pages: the 3D desk and the printable resume
      input: { main: 'index.html', resume: 'resume.html' },
    },
  },
});
