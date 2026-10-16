import * as THREE from 'three';
import { canvas } from './textures.js';

// Wall paintings are photos drawn into small canvases, so they pick up the same pixel look as the room.
// A triptych canvas spans all three panels; a single fills one panel (both match the panel aspect).
export const PW = 240;
export const PH = 98;
export const SW = 80;
export const SH = 98;

const fill = (ctx, col, x, y, w, h) => {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
};

function coverDraw(ctx, img, W, H) {
  const s = Math.max(W / img.width, H / img.height);
  const w = img.width * s, h = img.height * s;
  ctx.imageSmoothingEnabled = true; // average the photo down, then show it with nearest filtering
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

function nearestTexture(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Returns { canvas, texture, ready, layout } for a painting entry ({ src, layout }) from content.js. */
export function paintingCanvas(entry) {
  const layout = entry.layout || 'single';
  const W = layout === 'triptych' ? PW : SW;
  const H = layout === 'triptych' ? PH : SH;
  const [c, ctx] = canvas(W, H);
  fill(ctx, '#0d1220', 0, 0, W, H);
  const tex = nearestTexture(c);
  const ready = new Promise((res) => {
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
  return { canvas: c, texture: tex, ready, layout };
}

/** An empty panel, for a group with fewer than three single paintings. */
export function blankCanvas() {
  const [c, ctx] = canvas(SW, SH);
  fill(ctx, '#161922', 0, 0, SW, SH);
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
