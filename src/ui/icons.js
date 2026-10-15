// Tiny pixel-map icons → data URLs. Each char is one pixel; '.' is transparent.
const PALETTE = {
  K: '#111318', w: '#f4f1e8', g: '#9aa3ad', d: '#5d6672',
  Y: '#8a5a12', y: '#f2b233', B: '#2f5fb3', b: '#7fb0ff', R: '#e0302f', r: '#ff8a80',
  G: '#3fd46b', k: '#0b1a10', s: '#e3c99a', S: '#a8874f', n: '#1d2b55', o: '#f08a1c',
};

const MAPS = {
  folder: [
    '............',
    '.YYYY.......',
    'YyyyyYYYYYY.',
    'YyyyyyyyyyyY',
    'YYYYYYYYYYYY',
    'YyyyyyyyyyyY',
    'YyyyyyyyyyyY',
    'YyyyyyyyyyyY',
    'YyyyyyyyyyyY',
    'YYYYYYYYYYYY',
  ],
  txt: [
    '.KKKKKKK....',
    '.KwwwwwKK...',
    '.KwwwwwKwK..',
    '.KwddwwKKKK.',
    '.KwwwwwwwwK.',
    '.KwddddddwK.',
    '.KwwwwwwwwK.',
    '.KwdddddwwK.',
    '.KwwwwwwwwK.',
    '.KwddddwwwK.',
    '.KwwwwwwwwK.',
    '.KKKKKKKKKK.',
  ],
  pdf: [
    '.KKKKKKK....',
    '.KwwwwwKK...',
    '.KwwwwwKwK..',
    '.KwwwwwKKKK.',
    '.KRRRRRRRRK.',
    '.KRwwRwwRRK.',
    '.KRRRRRRRRK.',
    '.KwddddddwK.',
    '.KwwwwwwwwK.',
    '.KwdddddwwK.',
    '.KwwwwwwwwK.',
    '.KKKKKKKKKK.',
  ],
  exe: [
    'KKKKKKKKKKKK',
    'KBBBBBBBBRwK',
    'KKKKKKKKKKKK',
    'KwwwwwwwwwwK',
    'KwGGGwwwwwwK',
    'KwGGGGGwwwwK',
    'KwGGGGGGGGwK',
    'KwyyyyyywwwK',
    'KwwwwwwwwwwK',
    'KKKKKKKKKKKK',
  ],
  term: [
    'KKKKKKKKKKKK',
    'KgggggggggRK',
    'KKKKKKKKKKKK',
    'KkkkkkkkkkkK',
    'KkGkkkkkkkkK',
    'KkkGkkkkkkkK',
    'KkGkkGGGGkkK',
    'KkkkkkkkkkkK',
    'KKKKKKKKKKKK',
  ],
  mail: [
    'KKKKKKKKKKKK',
    'KwKwwwwwwKwK',
    'KwwKwwwwKwwK',
    'KwwwKwwKwwwK',
    'KwwwwKKwwwwK',
    'KwwwwwwwwwwK',
    'KwwwwwwwwwwK',
    'KKKKKKKKKKKK',
  ],
  image: [
    'KKKKKKKKKKKK',
    'KnnnnnnnnnnK',
    'KnnnnnnnoonK',
    'KnnnnnnooonK',
    'KnnnnnoooynK',
    'KnnnnoooyynK',
    'KnnyyynnnnnK',
    'KnyyyyynnynK',
    'KyyyyyyyyyyK',
    'KKKKKKKKKKKK',
  ],
  hat: [
    '............',
    '....SSSS....',
    '...SssssS...',
    '...SssssS...',
    '..SRRRRRRS..',
    '.SSssssssSS.',
    'SssssssssssS',
    '.SSSSSSSSSS.',
  ],
  trash: [
    '....KKKK....',
    'KKKKKKKKKKKK',
    'KggggggggggK',
    '.KgdgdgdgdK.',
    '.KgdgdgdgdK.',
    '.KgdgdgdgdK.',
    '.KgdgdgdgdK.',
    '.KgdgdgdgdK.',
    '..KKKKKKKK..',
  ],
  start: [
    '.RRRR.GGGG..',
    '.RRRR.GGGG..',
    '.RRRR.GGGG..',
    '............',
    '.BBBB.yyyy..',
    '.BBBB.yyyy..',
    '.BBBB.yyyy..',
  ],
};

const cache = {};
export function icon(name) {
  if (cache[name]) return cache[name];
  const map = MAPS[name] || MAPS.txt;
  const c = document.createElement('canvas');
  c.width = 12;
  c.height = map.length;
  const ctx = c.getContext('2d');
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      ctx.fillStyle = PALETTE[ch] || '#f0f';
      ctx.fillRect(x, y, 1, 1);
    }),
  );
  return (cache[name] = c.toDataURL());
}

/** A generated pixel thumbnail for a project with no image. */
export function projectThumb(title, color) {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 30;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#14161c';
  ctx.fillRect(0, 0, 48, 30);
  let seed = [...title].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = r() < 0.6 ? color : '#2a2f3a';
    ctx.fillRect(Math.floor(r() * 44), Math.floor(r() * 26), 2 + Math.floor(r() * 10), 1 + Math.floor(r() * 5));
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 26, 48, 4);
  return c.toDataURL();
}
