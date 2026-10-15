import * as THREE from 'three';
import { canvas, rng, shade } from './textures.js';

// Every painting is rendered into one low-res canvas that spans the three wall panels.
export const PW = 150; // 3 × 50
export const PH = 64;

const fill = (ctx, col, x, y, w, h) => {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
};

function skyline(ctx, r, baseY, col, winCol, density = 0.35) {
  let x = 0;
  while (x < PW) {
    const bw = 4 + Math.floor(r() * 9);
    const bh = 6 + Math.floor(r() * 16);
    fill(ctx, col, x, baseY - bh, bw, bh + 10);
    for (let wy = baseY - bh + 2; wy < baseY - 1; wy += 2)
      for (let wx = x + 1; wx < x + bw - 1; wx += 2)
        if (r() < density) fill(ctx, winCol, wx, wy, 1, 1);
    x += bw + (r() < 0.3 ? 1 : 0);
  }
}

const painters = {
  batsignal(ctx) {
    const r = rng(42);
    for (let y = 0; y < PH; y++)
      for (let x = 0; x < PW; x++) fill(ctx, r() < 0.04 ? '#1a2440' : '#0d1220', x, y, 1, 1);
    // beam: a widening cone from the city to the signal
    const sx = 38, sy = 50, ex = 124, ey = 20;
    for (let x = sx; x < ex; x++) {
      const t = (x - sx) / (ex - sx);
      const cy = sy + (ey - sy) * t;
      const half = 1 + t * 11;
      for (let y = Math.floor(cy - half); y <= cy + half; y++) {
        const d = Math.abs(y - cy) / half;
        const col = d > 0.8 ? '#f08a1c' : d > 0.5 ? '#f6c33a' : '#f3e98a';
        fill(ctx, col, x, y, 1, 1);
      }
    }
    // signal disc
    for (let y = -14; y <= 14; y++)
      for (let x = -17; x <= 17; x++) {
        const d = (x * x) / (17 * 17) + (y * y) / (14 * 14);
        if (d <= 1) fill(ctx, d > 0.8 ? '#f08a1c' : '#efe48c', ex + x, ey + y, 1, 1);
      }
    // bat silhouette
    ctx.fillStyle = '#0b0b0e';
    ctx.beginPath();
    const bx = ex, by = ey;
    ctx.moveTo(bx - 14, by - 3);
    ctx.lineTo(bx - 6, by - 6);
    ctx.lineTo(bx - 4, by - 2);
    ctx.lineTo(bx - 2, by - 8);
    ctx.lineTo(bx - 1, by - 5);
    ctx.lineTo(bx + 1, by - 5);
    ctx.lineTo(bx + 2, by - 8);
    ctx.lineTo(bx + 4, by - 2);
    ctx.lineTo(bx + 6, by - 6);
    ctx.lineTo(bx + 14, by - 3);
    ctx.lineTo(bx + 10, by + 3);
    ctx.lineTo(bx + 6, by + 1);
    ctx.lineTo(bx + 3, by + 6);
    ctx.lineTo(bx, by + 3);
    ctx.lineTo(bx - 3, by + 6);
    ctx.lineTo(bx - 6, by + 1);
    ctx.lineTo(bx - 10, by + 3);
    ctx.closePath();
    ctx.fill();
    skyline(ctx, r, 58, '#121a3a', '#e8d65a', 0.3);
    fill(ctx, '#1a2a6a', 0, 58, PW, 6);
  },

  sunset(ctx) {
    const r = rng(7);
    const bands = ['#2b1d4a', '#4d2a63', '#82356b', '#c4485f', '#ee7a4a', '#f7b35a', '#fbe08a'];
    for (let y = 0; y < 38; y++) fill(ctx, bands[Math.min(bands.length - 1, Math.floor((y / 38) * bands.length))], 0, y, PW, 1);
    // sun
    for (let y = -10; y <= 10; y++)
      for (let x = -10; x <= 10; x++) if (x * x + y * y <= 100) fill(ctx, '#fff2b0', 100 + x, 36 + y, 1, 1);
    // sea
    for (let y = 38; y < PH; y++) {
      fill(ctx, shade('#1f3d6b', -(y - 38) * 0.006), 0, y, PW, 1);
      for (let i = 0; i < 10; i++) {
        const x = Math.floor(r() * PW);
        const w = 2 + Math.floor(r() * 6);
        fill(ctx, Math.abs(x - 100) < 14 ? '#f7c56a' : '#3e6aa0', x, y, w, 1);
      }
    }
    // little ship with a sheep-head prow
    fill(ctx, '#5a3a22', 30, 44, 22, 4);
    fill(ctx, '#5a3a22', 32, 48, 18, 2);
    fill(ctx, '#3b2616', 40, 26, 1, 18);
    fill(ctx, '#f2ece0', 34, 28, 13, 11);
    fill(ctx, '#d43a3a', 39, 32, 3, 3);
    fill(ctx, '#f5f0e1', 51, 41, 4, 4);
    // birds
    [[70, 14], [76, 18], [64, 20]].forEach(([x, y]) => {
      fill(ctx, '#2b1d4a', x, y, 1, 1);
      fill(ctx, '#2b1d4a', x + 1, y + 1, 1, 1);
      fill(ctx, '#2b1d4a', x + 2, y, 1, 1);
    });
  },

  sakura(ctx) {
    const r = rng(9);
    for (let y = 0; y < PH; y++) fill(ctx, shade('#8fc6e8', -y * 0.004), 0, y, PW, 1);
    // mountain
    for (let x = 0; x < PW; x++) {
      const h = Math.max(0, 40 - Math.abs(x - 75) * 0.55);
      const top = 50 - h;
      fill(ctx, '#4a5f8c', x, top, 1, PH - top);
      if (h > 30) fill(ctx, '#f4f6fb', x, top, 1, Math.floor((h - 30) * 0.9) + 1);
    }
    fill(ctx, '#3d6b45', 0, 52, PW, 12);
    // blossom trees
    const tree = (cx, cy, rad) => {
      fill(ctx, '#4a2f25', cx, cy, 2, 14);
      for (let i = 0; i < rad * 18; i++) {
        const a = r() * Math.PI * 2, d = r() * rad;
        fill(ctx, r() < 0.5 ? '#f5a9c4' : '#f9cfe0', Math.floor(cx + Math.cos(a) * d * 1.4), Math.floor(cy + Math.sin(a) * d), 1, 1);
      }
    };
    tree(18, 42, 11);
    tree(132, 44, 10);
    tree(110, 50, 6);
    for (let i = 0; i < 40; i++) fill(ctx, '#f9cfe0', Math.floor(r() * PW), Math.floor(r() * PH), 1, 1);
  },

  starry(ctx) {
    const r = rng(13);
    for (let y = 0; y < PH; y++)
      for (let x = 0; x < PW; x++) {
        const swirl = Math.sin(x * 0.12 + Math.sin(y * 0.2) * 2) + Math.cos(y * 0.15 - x * 0.04);
        fill(ctx, swirl > 0.9 ? '#3a64b5' : swirl > -0.2 ? '#22417f' : '#16285a', x, y, 1, 1);
      }
    const star = (x, y, rad) => {
      for (let j = -rad; j <= rad; j++)
        for (let i = -rad; i <= rad; i++)
          if (i * i + j * j <= rad * rad) fill(ctx, i * i + j * j < rad ? '#fff6b0' : '#e8c341', x + i, y + j, 1, 1);
    };
    for (let i = 0; i < 12; i++) star(Math.floor(r() * PW), Math.floor(r() * 34), 1 + Math.floor(r() * 2));
    star(128, 12, 6); // moon
    for (let x = 0; x < PW; x++) {
      const top = 46 + Math.floor(Math.sin(x * 0.07) * 4);
      fill(ctx, '#142046', x, top, 1, PH - top);
    }
    // cypress
    for (let y = 14; y < PH; y++) {
      const w = Math.max(1, Math.floor((y - 14) * 0.18));
      fill(ctx, '#0d1a12', 20 - w, y, w * 2 + 1, 1);
    }
    for (let i = 0; i < 12; i++) fill(ctx, '#ffd86a', 60 + Math.floor(r() * 50), 50 + Math.floor(r() * 10), 1, 1);
  },

  rain(ctx) {
    const r = rng(17);
    for (let y = 0; y < PH; y++) fill(ctx, shade('#2a1640', y * 0.003), 0, y, PW, 1);
    skyline(ctx, r, 60, '#1a0f2b', '#ff4fa3', 0.25);
    const neon = ['#22e3ff', '#ff4fa3', '#ffd23f'];
    for (let i = 0; i < 6; i++) fill(ctx, neon[i % 3], 10 + i * 24, 30 + (i % 2) * 6, 6, 2);
    for (let i = 0; i < 140; i++) {
      const x = Math.floor(r() * PW), y = Math.floor(r() * PH);
      fill(ctx, '#8fa6d8', x, y, 1, 2);
    }
    fill(ctx, '#120a1e', 0, 60, PW, 4);
    for (let i = 0; i < 30; i++) fill(ctx, neon[i % 3], Math.floor(r() * PW), 61 + Math.floor(r() * 3), 2, 1);
  },
};

// Single-canvas paintings fill one panel (portrait, same aspect as a panel).
export const SW = 60;
export const SH = 73;

const singles = {
  strawhat(ctx) {
    const r = rng(23);
    for (let y = 0; y < SH; y++) fill(ctx, y % 6 < 3 ? '#b8232a' : '#a91f26', 0, y, SW, 1);
    for (let i = 0; i < 30; i++) fill(ctx, '#d84a4f', Math.floor(r() * SW), Math.floor(r() * SH), 1, 1);
    const cx = 30, cy = 40;
    // brim
    for (let y = -9; y <= 9; y++)
      for (let x = -26; x <= 26; x++) {
        const d = (x * x) / 676 + (y * y) / 81;
        if (d <= 1) fill(ctx, d > 0.75 ? '#a8874f' : (x + y) % 3 === 0 ? '#d9bd85' : '#e8cf9a', cx + x, cy + y, 1, 1);
      }
    // crown
    for (let y = -20; y <= 0; y++) {
      const half = 13 - Math.max(0, -y - 14) * 1.2;
      for (let x = -half; x <= half; x++) fill(ctx, (Math.floor(x) + y) % 3 === 0 ? '#d9bd85' : '#ecd5a3', cx + Math.floor(x), cy - 3 + y, 1, 1);
    }
    fill(ctx, '#c8262c', cx - 13, cy - 8, 27, 5);
    fill(ctx, '#8f141a', cx - 13, cy - 4, 27, 1);
    fill(ctx, '#fff1c7', cx - 8, cy - 20, 4, 2);
    // sparkles
    [[8, 10], [50, 14], [12, 62], [48, 60]].forEach(([x, y]) => {
      fill(ctx, '#ffe9a8', x, y - 2, 1, 5);
      fill(ctx, '#ffe9a8', x - 2, y, 5, 1);
    });
  },

  moon(ctx) {
    const r = rng(31);
    for (let y = 0; y < SH; y++) fill(ctx, shade('#0f1a3a', y * 0.0025), 0, y, SW, 1);
    for (let i = 0; i < 40; i++) fill(ctx, r() < 0.3 ? '#fff6c8' : '#9fb3e6', Math.floor(r() * SW), Math.floor(r() * 44), 1, 1);
    for (let y = -13; y <= 13; y++)
      for (let x = -13; x <= 13; x++) {
        const a = x * x + y * y <= 169;
        const b = (x - 6) * (x - 6) + (y + 3) * (y + 3) <= 130;
        if (a && !b) fill(ctx, x < -8 ? '#e8d07a' : '#fff1b0', 22 + x, 22 + y, 1, 1);
      }
    for (let y = 48; y < SH; y++) {
      fill(ctx, shade('#14254f', -(y - 48) * 0.005), 0, y, SW, 1);
      if (r() < 0.8) fill(ctx, '#f6e6a0', 16 + Math.floor(r() * 10), y, 2 + Math.floor(r() * 4), 1);
      for (let i = 0; i < 3; i++) fill(ctx, '#2b4482', Math.floor(r() * SW), y, 3, 1);
    }
    // small boat
    fill(ctx, '#0a0f1f', 38, 50, 12, 2);
    fill(ctx, '#0a0f1f', 43, 40, 1, 10);
    fill(ctx, '#0a0f1f', 44, 42, 5, 6);
  },

  koi(ctx) {
    const r = rng(37);
    for (let y = 0; y < SH; y++)
      for (let x = 0; x < SW; x++) {
        const w = Math.sin(x * 0.3 + y * 0.15) + Math.cos(y * 0.25 - x * 0.1);
        fill(ctx, w > 1.2 ? '#3fa3a0' : w > -0.5 ? '#2a8583' : '#216b6e', x, y, 1, 1);
      }
    const fish = (cx, cy, flip, body, spot) => {
      for (let i = 0; i < 18; i++) {
        const t = i / 17;
        const x = cx + (flip ? -1 : 1) * (i - 9);
        const yy = cy + Math.round(Math.sin(t * Math.PI * 1.2) * 3);
        const half = Math.round(3.2 * Math.sin(Math.min(1, t * 1.15) * Math.PI) + 0.6);
        fill(ctx, body, x, yy - half, 1, half * 2 + 1);
        if (i % 5 === 2) fill(ctx, spot, x, yy - 1, 1, 2);
      }
      const tx = cx + (flip ? 1 : -1) * 10;
      fill(ctx, body, tx + (flip ? 0 : -2), cy - 3, 3, 2);
      fill(ctx, body, tx + (flip ? 0 : -2), cy + 2, 3, 2);
    };
    fish(28, 22, false, '#f07a2a', '#fff4e6');
    fish(32, 48, true, '#f4efe6', '#e0402a');
    // lily pads
    [[10, 64, 6], [50, 10, 5], [52, 62, 4]].forEach(([x, y, rad]) => {
      for (let j = -rad; j <= rad; j++)
        for (let i = -rad; i <= rad; i++)
          if (i * i + j * j <= rad * rad && !(i > 0 && Math.abs(j) < 1)) fill(ctx, '#4f9a3c', x + i, y + j, 1, 1);
      fill(ctx, '#f6a6c8', x - 1, y - 1, 2, 2);
    });
    for (let i = 0; i < 25; i++) fill(ctx, '#7fd0c8', Math.floor(r() * SW), Math.floor(r() * SH), 2, 1);
  },
};

function coverDraw(ctx, img, W, H) {
  const s = Math.max(W / img.width, H / img.height);
  const w = img.width * s, h = img.height * s;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

function nearestTexture(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Returns { canvas, texture, ready, layout } for a painting entry from content.js.
 * layout 'triptych' spans all three panels; 'single' fills one panel.
 */
export function paintingCanvas(entry) {
  const layout = entry.layout || (entry.src ? 'single' : singles[entry.procedural] ? 'single' : 'triptych');
  const W = layout === 'triptych' ? PW : SW;
  const H = layout === 'triptych' ? PH : SH;
  const [c, ctx] = canvas(W, H);
  const tex = nearestTexture(c);
  let ready = Promise.resolve();
  if (entry.src) {
    fill(ctx, '#111', 0, 0, W, H);
    ready = new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        coverDraw(ctx, img, W, H);
        tex.needsUpdate = true;
        res();
      };
      img.onerror = () => {
        console.warn(`Painting not found: ${entry.src}`);
        res();
      };
      img.src = entry.src;
    });
  } else if (layout === 'single') {
    (singles[entry.procedural] || singles.moon)(ctx);
  } else {
    (painters[entry.procedural] || painters.batsignal)(ctx);
  }
  return { canvas: c, texture: tex, ready, layout };
}

/** An empty panel, for a group with fewer than three single paintings. */
export function blankCanvas() {
  const [c, ctx] = canvas(SW, SH);
  fill(ctx, '#161922', 0, 0, SW, SH);
  for (let y = 0; y < SH; y += 2) for (let x = (y / 2) % 2; x < SW; x += 2) fill(ctx, '#1b1f2a', x, y, 1, 1);
  fill(ctx, '#3a4050', 26, 30, 8, 2); // "?" mark
  fill(ctx, '#3a4050', 32, 32, 2, 4);
  fill(ctx, '#3a4050', 29, 36, 3, 2);
  fill(ctx, '#3a4050', 29, 40, 2, 2);
  return { canvas: c, texture: nearestTexture(c), layout: 'single' };
}

/**
 * Panel material: shows either a third of a triptych or one whole single painting,
 * with a dithered pixel dissolve from image A to image B.
 */
export function panelMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uA: { value: null },
      uB: { value: null },
      uOffA: { value: 0 },
      uOffB: { value: 0 },
      uScaleA: { value: 1 },
      uScaleB: { value: 1 },
      uMix: { value: 0 },
      uBright: { value: 0.9 },
      uHover: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uA, uB;
      uniform float uMix, uOffA, uOffB, uScaleA, uScaleB, uBright, uHover;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        float n = hash(floor(vUv * vec2(25.0, 32.0)));
        vec3 a = texture2D(uA, vec2(uOffA + vUv.x * uScaleA, vUv.y)).rgb;
        vec3 b = texture2D(uB, vec2(uOffB + vUv.x * uScaleB, vUv.y)).rgb;
        vec3 col = n < uMix ? b : a;
        col *= uBright + (uHover > 0.0 ? uHover * 0.18 : uHover * 0.4);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
