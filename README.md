# Pixel Desk

An interactive pixel-art 3D portfolio built with Three.js + Vite.

- **Painting**: browse artwork (arrows / ◀ ▶ keys, or click the painting again)
- **Laptop**: open it, press power, and browse a retro desktop (about, projects, skills, drawings, contact, resume, terminal)
- **Straw hat**: anime log with filters
- **Notebook**: a "/now" page · **Lamp**: night mode · **Headphones**: lo-fi chiptune

## Edit your content
Everything lives in `src/content.js`: bio, contact links, skills, projects, paintings, anime and the notebook page.
- Real artwork: put images in `public/paintings/` and use `{ src: './paintings/file.jpg', title: ... }`.
- Project thumbnails: put images in `public/projects/` and set `thumb: './projects/file.png'`.
- Resume: put `resume.pdf` in `public/` and set `resumeUrl: './resume.pdf'`.

## Run / build
```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (deploy to GitHub Pages, Netlify, Vercel...)
```
