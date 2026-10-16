import * as THREE from 'three';
import './style.css';
import * as content from './content.js';
import { buildDesk, WALL_Z, LAPTOP_SCALE } from './scene/desk.js';
import { paintingCanvas, blankCanvas } from './scene/paintings.js';
import { PixelPass } from './fx/pixelPass.js';
import { createOS } from './ui/os.js';
import { createGallery, createAnimeLog, createNotebook, createPlain } from './ui/panels.js';
import { sfx, music, setMuted, isMuted } from './audio.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

// ── renderer / scene ─────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#231d1a');
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.05, 20);
const pixel = new PixelPass(renderer);
const desk = buildDesk(scene);

// lights
const hemi = new THREE.HemisphereLight('#fff1dc', '#5a4a3c', 1.5);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffe9c7', 2.2);
sun.position.set(-1.2, 3.2, 2.6);
sun.target.position.set(0, 0.9, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.8, bottom: -1.2, near: 0.5, far: 8 });
sun.shadow.bias = -0.002;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
const lampLight = new THREE.SpotLight('#ffe7b8', 3, 3, 1.0, 0.7, 0);
lampLight.position.set(0, 1.95, -0.2);
lampLight.target.position.set(0, 0.75, 0.05);
scene.add(lampLight, lampLight.target);
const glow = new THREE.PointLight('#f6b33a', 0, 1.6, 1);
glow.position.set(0.3, 1.6, -0.15);
scene.add(glow);
const screenLight = new THREE.PointLight('#8fd0ff', 0, 0.8, 1.5);
scene.add(screenLight);

// dust in the lamp light
const DUST = 140;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 1.4;
  dustPos[i * 3 + 1] = 0.8 + Math.random() * 1.15;
  dustPos[i * 3 + 2] = -0.3 + Math.random() * 0.6;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#fff3d0', size: 0.006, transparent: true, opacity: 0.7 }));
scene.add(dust);

// ── paintings ────────────────────────────────────────────────
const art = content.paintings.map((p, index) => ({ ...p, index, ...paintingCanvas(p) }));
const blank = blankCanvas();
// Triptychs get the whole frame; consecutive single paintings are hung three at a time.
const slides = [];
{
  let group = null;
  for (const a of art) {
    if (a.layout === 'triptych') {
      slides.push({ type: 'triptych', items: [a] });
      group = null;
    } else {
      if (!group || group.items.length === 3) slides.push((group = { type: 'trio', items: [] }));
      group.items.push(a);
    }
  }
}
const slideOf = (paintingIndex) => {
  const s = slides.findIndex((sl) => sl.items.some((a) => a.index === paintingIndex));
  return { slide: Math.max(0, s), item: Math.max(0, slides[Math.max(0, s)].items.findIndex((a) => a.index === paintingIndex)) };
};

const panels = desk.painting.panels;
let shownSlide = 0;
function panelView(slide, i) {
  const s = slides[slide];
  if (s.type === 'triptych') return { tex: s.items[0].texture, off: i / 3, scale: 1 / 3 };
  return { tex: (s.items[i] || blank).texture, off: 0, scale: 1 };
}
function applyPanel(m, side, v) {
  m.uniforms['u' + side].value = v.tex;
  m.uniforms['uOff' + side].value = v.off;
  m.uniforms['uScale' + side].value = v.scale;
}
panels.forEach((m, i) => {
  applyPanel(m, 'A', panelView(0, i));
  applyPanel(m, 'B', panelView(0, i));
});
function showSlide(n) {
  if (n === shownSlide) return;
  sfx('swap');
  panels.forEach((m, i) => {
    applyPanel(m, 'A', panelView(shownSlide, i));
    applyPanel(m, 'B', panelView(n, i));
    m.uniforms.uMix.value = 0;
  });
  shownSlide = n;
  refreshPanels();
  tween(reduceMotion ? 0.01 : 0.7, (e) => panels.forEach((m) => (m.uniforms.uMix.value = e)), null, 'linear');
}
/** Hover glow at the desk; in the gallery, spotlight the selected painting of a set of three. */
function refreshPanels() {
  const trio = mode === 'painting' && slides[shownSlide].type === 'trio';
  panels.forEach((m, i) => {
    m.uniforms.uHover.value = trio ? (i === gallery.item ? 1 : -1) : hovered === 'painting' && mode === 'home' ? 1 : 0;
  });
}

// ── tiny tween system ────────────────────────────────────────
const tweens = [];
const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t) => 1 - (1 - t) ** 3,
  back: (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2,
};
function tween(dur, update, done, kind = 'inOut') {
  return new Promise((resolve) => {
    tweens.push({ t: 0, dur: Math.max(dur, 0.001), update, kind, done: () => (done?.(), resolve()) });
  });
}

// ── camera rig ───────────────────────────────────────────────
const rig = { pos: new THREE.Vector3(0, 1.7, 3.4), target: new THREE.Vector3(0, 1.2, 0) };
let currentView = homeView;
let flying = false;

function fitDistance(halfW, halfH) {
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  return Math.max(halfH / t, halfW / (t * camera.aspect));
}
function homeView() {
  const d = fitDistance(camera.aspect < 0.8 ? 0.92 : 1.12, 0.74);
  return { pos: new THREE.Vector3(0, 1.48, 0.0 + d), target: new THREE.Vector3(0, 1.2, 0.0) };
}
function paintingView() {
  const p = desk.painting;
  const narrow = camera.aspect < 0.9;
  const ty = p.group.position.y - (narrow ? 0.12 : 0.1);
  const d = fitDistance(p.width / 2 + 0.06, p.height / 2 + (narrow ? 0.26 : 0.18));
  return { pos: new THREE.Vector3(0, ty, WALL_Z + d), target: new THREE.Vector3(0, ty, WALL_Z) };
}
const screenInfo = (() => {
  // where the screen ends up when the lid is open
  const { lidPivot, screen } = desk.laptop;
  const prev = lidPivot.rotation.x;
  lidPivot.rotation.x = LID_OPEN();
  scene.updateMatrixWorld(true);
  const center = screen.getWorldPosition(new THREE.Vector3());
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(screen.getWorldQuaternion(new THREE.Quaternion()));
  lidPivot.rotation.x = prev;
  scene.updateMatrixWorld(true);
  return { center, normal };
})();
function LID_OPEN() {
  return THREE.MathUtils.degToRad(-105);
}
function laptopView() {
  const d = fitDistance(0.16 * LAPTOP_SCALE * 1.18, 0.1 * LAPTOP_SCALE * 1.4);
  const { center, normal } = screenInfo;
  return { pos: center.clone().addScaledVector(normal, d).add(new THREE.Vector3(0, -0.03, 0)), target: center.clone().add(new THREE.Vector3(0, -0.03, 0)) };
}
const HAT_OUT = new THREE.Vector3(-0.6, 1.38, 0.62);
function hatView() {
  const wide = camera.aspect > 1.1;
  const target = HAT_OUT.clone().add(wide ? new THREE.Vector3(0.3, 0, 0) : new THREE.Vector3(0, -0.2, 0));
  const d = fitDistance(wide ? 0.55 : 0.26, wide ? 0.3 : 0.5);
  return { pos: target.clone().add(new THREE.Vector3(0.05, 0.06, d)), target };
}
function notebookView() {
  const c = desk.notebook.position;
  const wide = camera.aspect > 1.1;
  const target = c.clone().add(wide ? new THREE.Vector3(0.18, 0, -0.02) : new THREE.Vector3(0, -0.12, 0.05));
  const d = fitDistance(wide ? 0.45 : 0.2, 0.32);
  return { pos: target.clone().add(new THREE.Vector3(0, d * 0.85, d * 0.55)), target };
}

function flyTo(viewFn, dur = 1.1) {
  currentView = viewFn;
  const v = viewFn();
  const p0 = rig.pos.clone(), t0 = rig.target.clone();
  flying = true;
  return tween(reduceMotion ? 0.01 : dur, (e) => {
    rig.pos.lerpVectors(p0, v.pos, e);
    rig.target.lerpVectors(t0, v.target, e);
  }, () => (flying = false));
}

// ── UI ───────────────────────────────────────────────────────
const ui = {
  back: $('#back'), hint: $('#hint'), tooltip: $('#tooltip'), toast: $('#toast'),
  gallery: $('#gallery-ui'), anime: $('#anime-ui'), notebook: $('#notebook-ui'), os: $('#os'),
};
$('#hud-name').textContent = content.profile.name;
$('#hud-title').textContent = content.profile.title;
document.title = `${content.profile.name} — Portfolio`;

const gallery = createGallery(ui.gallery, slides, { onSlide: showSlide, onSelect: () => refreshPanels() });
createAnimeLog(ui.anime, content.anime);
createNotebook(ui.notebook, content.now);
createPlain($('#plain'), content);

const os = createOS(ui.os, {
  content,
  sfx,
  // the laptop shows the real drawings at full resolution (the wall stays pixelated)
  art: (content.drawings || []).map((d) => ({
    title: d.title, medium: d.medium, year: d.year, note: d.note,
    thumb: () => d.src,
    full: () => d.src,
    pixelated: false,
  })),
  onPower: (on) => setLaptopPower(on),
  onShutdown: (after) => closeLaptop(after),
  onOpenGallery: (i) => enterPainting(i),
  onOpenAnime: () => enterHat(),
});

function showPanel(el) {
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('visible'));
}
function hidePanel(el) {
  el.classList.remove('visible');
  setTimeout(() => !el.classList.contains('visible') && (el.hidden = true), 250);
}
let toastTimer;
function toast(msg) {
  ui.toast.textContent = msg;
  ui.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('visible'), 2600);
}

// ── modes ────────────────────────────────────────────────────
let mode = 'intro';
function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  ui.back.hidden = m === 'home' || m === 'intro';
  if (m !== 'home' && m !== 'intro') ui.hint.classList.add('gone');
  setHover(null);
  refreshPanels();
}

async function goHome() {
  const was = mode;
  if (was === 'laptop') return os.shutdown();
  setMode('home');
  sfx('close');
  if (was === 'painting') hidePanel(ui.gallery);
  if (was === 'notebook') hidePanel(ui.notebook);
  if (was === 'hat') {
    hidePanel(ui.anime);
    returnHat();
  }
  await flyTo(homeView);
}

async function enterPainting(i) {
  setMode('painting');
  sfx('open');
  if (typeof i === 'number') {
    const { slide, item } = slideOf(i);
    gallery.set(slide, item);
    showSlide(slide);
  }
  refreshPanels();
  await flyTo(paintingView);
  if (mode === 'painting') showPanel(ui.gallery);
}

// laptop
const lid = desk.laptop.lidPivot;
function drawScreen(kind) {
  const { screenCtx: c, screenTex } = desk.laptop;
  c.fillStyle = kind === 'on' ? '#16305c' : '#020203';
  c.fillRect(0, 0, 160, 100);
  if (kind === 'on') {
    c.fillStyle = '#2b4f8c';
    for (let y = 0; y < 100; y += 4) c.fillRect(0, y, 160, 1);
    c.fillStyle = '#c9c9c9';
    c.fillRect(0, 92, 160, 8);
    c.fillStyle = '#f2b233';
    for (let i = 0; i < 4; i++) c.fillRect(8, 8 + i * 16, 10, 8);
  }
  screenTex.needsUpdate = true;
}
function setLaptopPower(on) {
  drawScreen(on ? 'on' : 'off');
  desk.laptop.led.material.color.set(on ? '#7dff9a' : '#331010');
  desk.laptop.dot.material.color.set(on ? '#ff3b36' : '#5a1214');
  screenLight.intensity = on ? 0.6 : 0;
}
async function enterLaptop() {
  setMode('laptop');
  sfx('open');
  screenLight.position.copy(screenInfo.center).addScaledVector(screenInfo.normal, 0.15);
  const from = lid.rotation.x;
  tween(reduceMotion ? 0.01 : 0.9, (e) => (lid.rotation.x = THREE.MathUtils.lerp(from, LID_OPEN(), e)), null, 'out');
  await flyTo(laptopView, 1.2);
  if (mode !== 'laptop') return;
  updateOsRect();
  os.show();
}
async function closeLaptop(after) {
  os.hide();
  setMode('home');
  const from = lid.rotation.x;
  tween(reduceMotion ? 0.01 : 0.7, (e) => (lid.rotation.x = THREE.MathUtils.lerp(from, 0, e)), null, 'inOut');
  if (after) return after();
  await flyTo(homeView);
}
const _v = new THREE.Vector3();
function updateOsRect() {
  const { screen } = desk.laptop;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of [[-0.16, -0.1], [0.16, -0.1], [0.16, 0.1], [-0.16, 0.1]]) {
    _v.set(x, y, 0);
    screen.localToWorld(_v).project(camera);
    const sx = (_v.x * 0.5 + 0.5) * innerWidth;
    const sy = (-_v.y * 0.5 + 0.5) * innerHeight;
    minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
    minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
  }
  os.setRect({ left: minX, top: minY, width: maxX - minX, height: maxY - minY });
}

// hat
const hat = desk.hat;
async function enterHat() {
  setMode('hat');
  sfx('open');
  const p0 = hat.pivot.position.clone();
  const r0 = hat.pivot.rotation.z;
  tween(reduceMotion ? 0.01 : 1.0, (e) => {
    hat.pivot.position.lerpVectors(p0, HAT_OUT, e);
    hat.pivot.position.y += Math.sin(e * Math.PI) * 0.12;
    hat.pivot.rotation.z = THREE.MathUtils.lerp(r0, 0, e) + e * Math.PI * 2;
  }, () => (hat.pivot.rotation.z = 0), 'out');
  await flyTo(hatView);
  if (mode === 'hat') showPanel(ui.anime);
}
function returnHat() {
  const p0 = hat.pivot.position.clone();
  const ry = hat.pivot.rotation.y, rx = hat.pivot.rotation.x;
  tween(reduceMotion ? 0.01 : 0.9, (e) => {
    hat.pivot.position.lerpVectors(p0, hat.home, e);
    hat.pivot.rotation.set(rx * (1 - e), ry * (1 - e), hat.homeRot.z * e);
  }, null, 'inOut');
}

async function enterNotebook() {
  setMode('notebook');
  sfx('page');
  await flyTo(notebookView);
  if (mode === 'notebook') showPanel(ui.notebook);
}

let night = false;
function toggleNight() {
  night = !night;
  sfx('click');
  document.body.classList.toggle('night', night);
  const to = night
    ? { hemi: 0.25, sun: 0.15, lamp: 0, glow: 1.4, emis: 0, bright: 1.05, bg: '#0b0a10' }
    : { hemi: 1.5, sun: 2.2, lamp: 3, glow: 0, emis: 0.6, bright: 0.9, bg: '#231d1a' };
  const from = { hemi: hemi.intensity, sun: sun.intensity, lamp: lampLight.intensity, glow: glow.intensity, emis: desk.lamp.mat.emissiveIntensity, bright: panels[0].uniforms.uBright.value };
  const bg0 = scene.background.clone(), bg1 = new THREE.Color(to.bg);
  const L = THREE.MathUtils.lerp;
  tween(0.6, (e) => {
    hemi.intensity = L(from.hemi, to.hemi, e);
    sun.intensity = L(from.sun, to.sun, e);
    lampLight.intensity = L(from.lamp, to.lamp, e);
    glow.intensity = L(from.glow, to.glow, e);
    desk.lamp.mat.emissiveIntensity = L(from.emis, to.emis, e);
    panels.forEach((m) => (m.uniforms.uBright.value = L(from.bright, to.bright, e)));
    scene.background.lerpColors(bg0, bg1, e);
  });
  toast(night ? 'Lights out. The signal is on.' : 'Lights on.');
}

function onObject(id, hit) {
  if (flying) return;
  if (mode === 'painting' && id === 'painting') {
    const p = hit?.object.userData.panel;
    const s = slides[shownSlide];
    if (s.type === 'trio' && p !== undefined && p < s.items.length && p !== gallery.item) return gallery.select(p);
    return gallery.next();
  }
  if (mode === 'laptop' && hit?.object.userData.power) return os.boot();
  if (mode !== 'home') return;
  switch (id) {
    case 'painting': return enterPainting();
    case 'laptop': return enterLaptop();
    case 'hat': return enterHat();
    case 'notebook': return enterNotebook();
    case 'lamp': return toggleNight();
    case 'headphones': {
      const on = music.toggle();
      sfx('click');
      $('#btn-music').classList.toggle('on', on);
      return toast(on ? '♪ Now playing: desk lo-fi (chiptune mix)' : 'Music paused');
    }
    case 'bottle': sfx('click'); return toast('Hydration check! Go drink some water 💧');
    case 'knob': {
      sfx('nope');
      const k = desk.interactive.find((o) => o.userData.id === 'knob');
      tween(0.4, (e) => (k.rotation.z = Math.sin(e * Math.PI * 4) * 0.4 * (1 - e)));
      return toast("Locked. That's where the Batsuit lives.");
    }
  }
}

// ── picking / hover ──────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(9, 9);
const mouse = { x: 0, y: 0, cx: 0, cy: 0, moved: false };
let hovered = null;
const savedEmissive = new Map(); // material -> original emissive
const _glow = new THREE.Color();

function rootOf(id) {
  return desk.interactive.find((o) => o.userData.id === id);
}
function setHover(id) {
  if (hovered === id) return;
  if (hovered) {
    savedEmissive.forEach((c, m) => m.emissive.copy(c));
    savedEmissive.clear();
  }
  hovered = id;
  document.body.style.cursor = id ? 'pointer' : '';
  ui.tooltip.classList.toggle('visible', !!id && mode === 'home');
  refreshPanels();
  if (!id) return;
  ui.tooltip.textContent = rootOf(id).userData.label;
  sfx('hover');
  rootOf(id).traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) if (m.emissive && !savedEmissive.has(m)) savedEmissive.set(m, m.emissive.clone());
  });
}

function pick() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(desk.interactive, true);
  return hits.find((h) => h.object.userData.id) || null;
}

function allowedHover(hit) {
  if (!hit) return null;
  const id = hit.object.userData.id;
  if (mode === 'home') return id;
  if (mode === 'painting' && id === 'painting') return id;
  if (mode === 'laptop' && hit.object.userData.power && os.state === 'off') return id;
  return null;
}

const gl = $('#gl');
gl.addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  mouse.x = pointer.x;
  mouse.y = pointer.y;
  mouse.cx = e.clientX;
  mouse.cy = e.clientY;
  mouse.moved = true;
});
gl.addEventListener('pointerleave', () => {
  pointer.set(9, 9);
  mouse.moved = true;
});
gl.addEventListener('click', (e) => {
  if (mode === 'intro') return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const hit = pick();
  if (hit) onObject(hit.object.userData.id, hit);
});

ui.back.addEventListener('click', goHome);
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea')) return;
  if (e.key === 'Escape' && mode !== 'home' && mode !== 'intro') goHome();
  if (mode === 'painting' && e.key === 'ArrowRight') gallery.next();
  if (mode === 'painting' && e.key === 'ArrowLeft') gallery.prev();
});

$('#btn-sound').addEventListener('click', (e) => {
  setMuted(!isMuted());
  e.currentTarget.classList.toggle('off', isMuted());
  e.currentTarget.textContent = isMuted() ? '🔇' : '🔊';
});
$('#btn-music').addEventListener('click', (e) => {
  e.currentTarget.classList.toggle('on', music.toggle());
});
$('#btn-plain').addEventListener('click', () => ($('#plain').hidden = false));
$('#plain').addEventListener('click', (e) => e.target.closest('.plain-close') && ($('#plain').hidden = true));

// ── resize ───────────────────────────────────────────────────
const PIXEL_LEVELS = [
  { name: 'CHUNKY', density: 260 },
  { name: 'CRISP', density: 380 },
  { name: 'HD', density: 600 },
];
let pixelLevel = 1;
try {
  const saved = +localStorage.getItem('pixel-level');
  if (saved >= 0 && saved < PIXEL_LEVELS.length && localStorage.getItem('pixel-level') !== null) pixelLevel = saved;
} catch { /* storage unavailable */ }
const pxBtn = $('#btn-px');
function applyPixelLevel() {
  pxBtn.textContent = 'PX';
  pxBtn.title = `Pixel size: ${PIXEL_LEVELS[pixelLevel].name} (click to change)`;
  pixel.setSize(innerWidth, innerHeight, PIXEL_LEVELS[pixelLevel].density);
}
pxBtn.addEventListener('click', () => {
  pixelLevel = (pixelLevel + 1) % PIXEL_LEVELS.length;
  try { localStorage.setItem('pixel-level', pixelLevel); } catch { /* ignore */ }
  applyPixelLevel();
  sfx('click');
  toast(`Pixel size: ${PIXEL_LEVELS[pixelLevel].name}`);
});

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  pixel.setSize(w, h, PIXEL_LEVELS[pixelLevel].density);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (mode !== 'intro' && !flying) {
    const v = currentView();
    rig.pos.copy(v.pos);
    rig.target.copy(v.target);
  }
}
addEventListener('resize', resize);
resize();
applyPixelLevel();

// ── loop ─────────────────────────────────────────────────────
const clock = new THREE.Clock();
const offset = new THREE.Vector3();
const lookAt = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    tw.update(ease[tw.kind](tw.t));
    if (tw.t >= 1) {
      tweens.splice(i, 1);
      tw.done();
    }
  }

  // camera: rig + pointer parallax + idle sway
  const k = mode === 'home' || mode === 'intro' ? 1 : 0.12;
  const sway = reduceMotion ? 0 : 1;
  const tx = (mouse.x * 0.08 + Math.sin(t * 0.35) * 0.012 * sway) * k;
  const ty = (mouse.y * 0.04 + Math.sin(t * 0.5) * 0.008 * sway) * k;
  offset.x += (tx - offset.x) * Math.min(1, dt * 4);
  offset.y += (ty - offset.y) * Math.min(1, dt * 4);
  camera.position.copy(rig.pos).add(offset);
  lookAt.copy(rig.target).addScaledVector(offset, 0.3);
  camera.lookAt(lookAt);

  // hover
  if (mouse.moved && !flying) {
    mouse.moved = false;
    setHover(allowedHover(pick()));
  }
  if (hovered) {
    const pulse = 0.12 + Math.sin(t * 6) * 0.05;
    savedEmissive.forEach((c, m) => m.emissive.copy(c).add(_glow.setRGB(pulse, pulse * 0.8, pulse * 0.4)));
    ui.tooltip.style.transform = `translate(${mouse.cx + 16}px, ${mouse.cy + 14}px)`;
  }

  // life
  const pos = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    pos[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0004 - 0.0002;
    pos[i * 3] += Math.cos(t * 0.2 + i * 1.7) * 0.0003;
    if (pos[i * 3 + 1] < 0.78) pos[i * 3 + 1] = 1.95;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dust.visible = mode === 'home' || mode === 'intro';
  dust.material.opacity = night ? 0.15 : 0.7;

  if (mode === 'hat' && !reduceMotion) {
    hat.pivot.rotation.y = Math.sin(t * 0.8) * 0.45;
    hat.pivot.rotation.x = Math.sin(t * 1.1) * 0.12;
    hat.pivot.position.y = HAT_OUT.y + Math.sin(t * 1.6) * 0.015;
  }
  desk.headphones.position.y = desk.headphones.userData.baseY + (music.playing && !reduceMotion ? Math.abs(Math.sin(t * Math.PI * 1.3)) * 0.006 : 0);
  desk.laptop.powerBtn.material.emissive.setRGB(...(mode === 'laptop' && os.state === 'off' ? [0.2 + Math.sin(t * 5) * 0.2, 0.25, 0.1] : [0, 0, 0]));

  pixel.render(scene, camera);
  if (mode === 'laptop' && !ui.os.hidden) updateOsRect();
  requestAnimationFrame(frame);
}

// ── intro ────────────────────────────────────────────────────
drawScreen('off');
// A sketchbook page draws the desk in pencil while the scene loads; "Step into my desk" dives in.
const intro = $('#intro');
const enterBtn = $('#intro-enter');
const finishDrawing = () => intro.classList.add('drawn');
if (reduceMotion) finishDrawing();
intro.querySelector('.intro-sketch').addEventListener('click', finishDrawing);
const drawingDone = new Promise((res) => setTimeout(res, reduceMotion ? 0 : 2200));
Promise.all([...art.map((p) => p.ready), drawingDone]).then(() => {
  intro.classList.add('ready');
  enterBtn.disabled = false;
});
enterBtn.addEventListener('click', async () => {
  sfx('page');
  finishDrawing();
  intro.classList.add('gone');
  setTimeout(() => intro.remove(), 1000);
  setMode('home');
  await flyTo(homeView, 1.8);
});
$('#intro-plain').addEventListener('click', () => ($('#plain').hidden = false));
requestAnimationFrame(frame);
