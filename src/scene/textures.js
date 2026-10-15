import * as THREE from 'three';

// Deterministic PRNG so the textures look the same on every load.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

export function toTexture(c, repeat = [1, 1]) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  return t;
}

const px = (ctx, x, y, col, w = 1, h = 1) => {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
};

export function shade(hex, amt) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return '#' + c.getHexString();
}

/** Light oak wood, grain running vertically (rotate UVs for horizontal). */
export function woodTexture(seed = 3, base = '#b98a55', w = 32, h = 64) {
  const [c, ctx] = canvas(w, h);
  const r = rng(seed);
  px(ctx, 0, 0, base, w, h);
  for (let x = 0; x < w; x++) {
    const stripe = Math.sin(x * 0.9 + r() * 2) * 0.5 + (r() - 0.5) * 0.6;
    const col = shade(base, stripe * 0.06);
    px(ctx, x, 0, col, 1, h);
  }
  // dark grain streaks
  for (let i = 0; i < w * 0.6; i++) {
    const x = Math.floor(r() * w);
    let y = Math.floor(r() * h);
    const len = 4 + Math.floor(r() * 18);
    for (let j = 0; j < len; j++) {
      px(ctx, x + (r() < 0.15 ? 1 : 0), (y + j) % h, shade(base, -0.12 - r() * 0.05));
    }
  }
  // a knot or two
  for (let k = 0; k < 2; k++) {
    const kx = Math.floor(r() * (w - 6)) + 3;
    const ky = Math.floor(r() * (h - 8)) + 4;
    px(ctx, kx - 1, ky - 2, shade(base, -0.08), 3, 5);
    px(ctx, kx, ky - 1, shade(base, -0.14), 1, 3);
  }
  return toTexture(c);
}

/** Grey stone/marble desk top with crack veins. */
export function marbleTexture(seed = 7) {
  const w = 96, h = 48;
  const [c, ctx] = canvas(w, h);
  const r = rng(seed);
  const base = '#9aa0a3';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) px(ctx, x, y, shade(base, (r() - 0.5) * 0.06));
  for (let v = 0; v < 9; v++) {
    let x = r() * w, y = r() * h;
    const dx = (r() - 0.5) * 2, dy = (r() - 0.5) * 0.8;
    for (let i = 0; i < 30; i++) {
      px(ctx, Math.floor(x) % w, Math.floor(y) % h, shade(base, -0.1 - r() * 0.06));
      x += dx + (r() - 0.5);
      y += dy + (r() - 0.5);
      if (x < 0) x += w;
      if (y < 0) y += h;
    }
  }
  return toTexture(c);
}

export function wallTexture(seed = 11) {
  const w = 64, h = 64;
  const [c, ctx] = canvas(w, h);
  const r = rng(seed);
  const base = '#ebe1c8';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) px(ctx, x, y, shade(base, (r() - 0.5) * 0.03));
  return toTexture(c, [2, 2]);
}

export function strawTexture(seed = 5) {
  const w = 32, h = 32;
  const [c, ctx] = canvas(w, h);
  const r = rng(seed);
  const base = '#e3c99a';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const weave = ((x >> 1) + (y >> 1)) % 2 === 0;
      px(ctx, x, y, shade(base, (weave ? 0.04 : -0.06) + (r() - 0.5) * 0.04));
    }
    if (y % 4 === 3) px(ctx, 0, y, shade(base, -0.12), w, 1);
  }
  return toTexture(c, [6, 1]);
}

export function notebookTexture() {
  const w = 64, h = 48;
  const [c, ctx] = canvas(w, h);
  const r = rng(21);
  px(ctx, 0, 0, '#f7f4ec', w, h);
  for (let y = 4; y < h; y += 3) px(ctx, 0, y, '#cfd6e2', w, 1);
  px(ctx, 31, 0, '#d8d2c2', 2, h); // spine
  // handwriting on left page
  for (let y = 5; y < h - 6; y += 3) {
    let x = 3;
    while (x < 27) {
      const len = 2 + Math.floor(r() * 5);
      if (x + len > 28) break;
      for (let i = 0; i < len; i++) px(ctx, x + i, y - (r() < 0.4 ? 1 : 0), '#3a3f5c');
      x += len + 1;
    }
  }
  return toTexture(c);
}

// Laptop textures are higher resolution than the rest so the ThinkPad reads as a detailed object.
const LAP_W = 256, LAP_H = 176;

/** Lid top: matte black, "lenovo" mark, "ThinkPad" logo. Returns the texture and the UV of the red i-dot. */
export function lidTexture() {
  const [c, ctx] = canvas(LAP_W, LAP_H);
  const r = rng(2);
  px(ctx, 0, 0, '#1d1e22', LAP_W, LAP_H);
  for (let i = 0; i < 400; i++) px(ctx, Math.floor(r() * LAP_W), Math.floor(r() * LAP_H), '#202126');
  // subtle diagonal sheen
  for (let i = 0; i < LAP_W; i++) px(ctx, i, Math.floor(i * 0.5) % LAP_H, '#222328', 1, 2);
  ctx.fillStyle = '#5c5e66';
  ctx.font = 'bold 9px Arial, sans-serif';
  ctx.fillText('lenovo', 14, 18);
  ctx.fillStyle = '#a9abb3';
  ctx.font = 'italic bold 15px Arial, sans-serif';
  const x0 = 160, base = 158;
  ctx.fillText('ThinkPad', x0, base);
  const ix = x0 + ctx.measureText('Th').width + ctx.measureText('i').width / 2 + 1;
  px(ctx, Math.round(ix) - 2, base - 15, '#1d1e22', 4, 4); // clear the font's own dot
  px(ctx, Math.round(ix) - 1, base - 14, '#e0302f', 3, 3);
  return { texture: toTexture(c), dot: { u: ix / LAP_W, v: 1 - (base - 12.5) / LAP_H } };
}

/** Inner lid around the screen: bezel, webcam, small logo. */
export function bezelTexture() {
  const [c, ctx] = canvas(LAP_W, LAP_H);
  px(ctx, 0, 0, '#0d0e10', LAP_W, LAP_H);
  px(ctx, 125, 4, '#1c1e24', 7, 5);
  px(ctx, 127, 5, '#3a4a66', 3, 3);
  px(ctx, 134, 6, '#2a2c30', 1, 1);
  ctx.fillStyle = '#4a4c54';
  ctx.font = 'italic bold 8px Arial, sans-serif';
  ctx.fillText('ThinkPad', 12, LAP_H - 6);
  return toTexture(c);
}

/** Keyboard deck: keys with highlights, TrackPoint, red-striped buttons, touchpad, grille. */
export function keyboardTexture() {
  const [c, ctx] = canvas(LAP_W, LAP_H);
  px(ctx, 0, 0, '#232428', LAP_W, LAP_H);
  for (let x = 30; x < 226; x += 3) px(ctx, x, 7, '#141518', 1, 2); // speaker grille
  const key = (x, y, w, h) => {
    px(ctx, x, y, '#0d0e10', w, h);
    px(ctx, x, y, '#2b2c32', w, 1);
    px(ctx, x + 2, y + 2, '#5d606a', 2, 1);
  };
  // function row
  for (let k = 0; k < 16; k++) key(20 + k * 13.5, 14, 12, 7);
  // main rows
  const rows = [
    [0, 14, 13], [6, 13, 13], [9, 12, 13], [14, 11, 13],
  ];
  rows.forEach(([off, n], r) => {
    for (let k = 0; k < n; k++) key(20 + off + k * 15, 24 + r * 15, 13, 13);
  });
  // wide keys at row ends
  key(20, 39, 4, 13); key(20, 54, 7, 13); key(20, 69, 12, 13);
  key(201, 54, 35, 13); key(195, 69, 41, 13); key(230, 24, 6, 13); key(221, 39, 15, 13);
  // bottom row with space bar + arrows
  [[20, 13], [35, 13], [50, 13], [65, 13]].forEach(([x, w]) => key(x, 84, w, 13));
  key(80, 84, 88, 13);
  [[170, 13], [185, 13]].forEach(([x, w]) => key(x, 84, w, 13));
  key(204, 91, 10, 6); key(216, 85, 10, 6); key(216, 91, 10, 6); key(228, 91, 10, 6);
  // TrackPoint between G, H and B
  px(ctx, 126, 66, '#7d0f12', 4, 4);
  px(ctx, 127, 67, '#e0302f', 2, 2);
  // TrackPoint buttons with red stripes
  px(ctx, 84, 104, '#151619', 88, 10);
  px(ctx, 84, 104, '#2b2c32', 88, 1);
  px(ctx, 112, 104, '#0b0c0e', 1, 10);
  px(ctx, 143, 104, '#0b0c0e', 1, 10);
  px(ctx, 86, 106, '#c8262c', 1, 6);
  px(ctx, 110, 106, '#c8262c', 1, 6);
  px(ctx, 145, 106, '#c8262c', 1, 6);
  px(ctx, 169, 106, '#c8262c', 1, 6);
  // touchpad
  px(ctx, 84, 116, '#2e3036', 88, 50);
  px(ctx, 85, 117, '#1a1b1f', 86, 48);
  // fingerprint reader, sticker, power button, status led
  px(ctx, 190, 128, '#3a3c42', 9, 9);
  px(ctx, 192, 130, '#16171a', 5, 5);
  px(ctx, 214, 150, '#7b8090', 16, 12);
  px(ctx, 216, 152, '#2f5fb3', 12, 4);
  px(ctx, 225, 4, '#111215', 10, 8);
  px(ctx, 227, 6, '#3b3d44', 6, 4);
  return toTexture(c);
}

export function toonGradient() {
  const data = new Uint8Array([70, 150, 255]);
  const t = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}
