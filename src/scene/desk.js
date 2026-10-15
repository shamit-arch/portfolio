import * as THREE from 'three';
import {
  woodTexture, marbleTexture, wallTexture, strawTexture, notebookTexture,
  lidTexture, bezelTexture, keyboardTexture, toonGradient, canvas, toTexture,
} from './textures.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { panelMaterial } from './paintings.js';

const gradient = toonGradient();
export const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: gradient, ...opts });

const DESK_Y = 0.75;
export const WALL_Z = -0.36;
export const LAPTOP_SCALE = 1.3;

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, seg, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function tube(points, radius, mat) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 5, false), mat);
  m.castShadow = true;
  return m;
}

/** Builds the whole desk nook. Returns handles for everything main.js animates or clicks. */
export function buildDesk(scene) {
  const interactive = [];
  const register = (obj, id, label) => {
    obj.traverse((o) => (o.userData.id = id));
    obj.userData.label = label;
    interactive.push(obj);
    return obj;
  };

  const wood = toon({ map: woodTexture(3, '#b98a55') });
  const woodDark = toon({ map: woodTexture(8, '#8d6239') });
  const woodH = woodTexture(4, '#b98a55', 64, 32); // horizontal-ish for cabinet faces
  woodH.rotation = Math.PI / 2;
  const woodSide = toon({ map: woodH });

  // ── room shell ───────────────────────────────────────────
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), toon({ color: '#6b5a4a' }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), toon({ color: '#d9cdb2' }));
  backdrop.position.set(0, 2.5, WALL_Z - 0.06);
  scene.add(backdrop);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.32), toon({ map: wallTexture() }));
  wall.position.set(0, 1.36, WALL_Z);
  wall.receiveShadow = true;
  scene.add(wall);

  // desk top + drawer
  const marble = marbleTexture();
  const deskTop = box(1.62, 0.04, 0.68, toon({ map: marble }), 0, DESK_Y - 0.02, -0.02);
  scene.add(deskTop);
  scene.add(box(1.5, 0.26, 0.02, woodSide, 0, DESK_Y - 0.17, 0.3));
  scene.add(box(1.5, 0.008, 0.021, toon({ color: '#5b3f25' }), 0, DESK_Y - 0.31, 0.301));
  scene.add(box(0.02, 0.26, 0.021, toon({ color: '#5b3f25' }), 0.25, DESK_Y - 0.17, 0.301));

  // pillars either side + overhead cabinet
  scene.add(box(0.08, 2.1, 0.72, wood, -0.85, 1.05, -0.01));
  scene.add(box(0.08, 2.1, 0.72, wood, 0.85, 1.05, -0.01));
  scene.add(box(2.4, 0.3, 0.74, woodSide, 0, 2.15, -0.01));
  scene.add(box(1.62, 0.015, 0.7, toon({ color: '#9da3a3' }), 0, 2.0, -0.01));

  // left open shelves
  scene.add(box(0.85, 2.1, 0.02, woodDark, -1.32, 1.05, WALL_Z));
  for (const y of [0.05, 0.62, 1.3]) scene.add(box(0.85, 0.03, 0.7, wood, -1.32, y, -0.01));
  scene.add(box(0.06, 2.1, 0.72, wood, -1.76, 1.05, -0.01));

  const bottle = new THREE.Group();
  bottle.add(cyl(0.05, 0.05, 0.25, 12, toon({ color: '#e6e8e6' }), 0, 0.125, 0));
  bottle.add(cyl(0.048, 0.048, 0.03, 12, toon({ color: '#b9bcc0' }), 0, 0.26, 0));
  bottle.add(cyl(0.045, 0.045, 0.03, 12, toon({ color: '#eceeed' }), 0, 0.29, 0));
  bottle.position.set(-1.0, 1.315, 0.05);
  scene.add(register(bottle, 'bottle', 'Water bottle'));
  const bottle2 = cyl(0.045, 0.045, 0.3, 12, toon({ color: '#2f3b45' }), -1.12, 1.465, -0.12);
  scene.add(bottle2);
  // a bag slumped on the lower shelf
  const bag = box(0.5, 0.42, 0.45, toon({ color: '#2e3034' }), -1.3, 0.85, 0.02);
  bag.rotation.z = 0.12;
  scene.add(bag);
  scene.add(box(0.3, 0.15, 0.3, toon({ color: '#d6d2c9' }), -1.15, 0.72, 0.18));

  // right cabinet with door + knob
  scene.add(box(0.9, 2.1, 0.7, woodSide, 1.34, 1.05, -0.01));
  for (const y of [0.9, 1.55]) scene.add(box(0.9, 0.012, 0.01, toon({ color: '#3c2a1a' }), 1.34, y, 0.345));
  scene.add(box(0.012, 2.1, 0.01, toon({ color: '#3c2a1a' }), 0.95, 1.05, 0.345));
  const knob = new THREE.Group();
  const knobMat = toon({ color: '#c9ccd2' });
  knob.add(cyl(0.035, 0.035, 0.012, 14, knobMat, 0, 0, 0).rotateX(Math.PI / 2));
  knob.add(cyl(0.012, 0.012, 0.04, 8, knobMat, 0, 0, 0.02).rotateX(Math.PI / 2));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), knobMat);
  ball.position.z = 0.05;
  knob.add(ball);
  knob.position.set(1.02, 1.22, 0.35);
  scene.add(register(knob, 'knob', 'Cabinet door'));

  // ── under-cabinet lamp ───────────────────────────────────
  const lampMat = toon({ color: '#f4f4f0', emissive: new THREE.Color('#fff2cc'), emissiveIntensity: 0.6 });
  const lamp = box(0.5, 0.035, 0.07, lampMat, 0, 1.975, -0.2);
  lamp.castShadow = false;
  scene.add(register(lamp, 'lamp', 'Lamp (toggle lights)'));

  // ── triptych painting ────────────────────────────────────
  const panels = [];
  const paintingGroup = new THREE.Group();
  const PANEL_W = 0.36, PANEL_H = 0.44, GAP = 0.035;
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * (PANEL_W + GAP);
    const frame = box(PANEL_W + 0.012, PANEL_H + 0.012, 0.018, toon({ color: '#14161c' }), x, 0, 0.009);
    const mat = panelMaterial();
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), mat);
    panel.userData.panel = i;
    panel.position.set(x, 0, 0.0185);
    paintingGroup.add(frame, panel);
    panels.push(mat);
  }
  paintingGroup.position.set(0, 1.52, WALL_Z);
  scene.add(register(paintingGroup, 'painting', 'Paintings'));
  const painting = { group: paintingGroup, panels, width: 3 * PANEL_W + 2 * GAP, height: PANEL_H };

  // ── wall socket + charger + cables ───────────────────────
  const white = toon({ color: '#f1f0ea' });
  scene.add(box(0.17, 0.095, 0.012, white, 0.22, 1.12, WALL_Z + 0.006));
  for (let i = 0; i < 3; i++) scene.add(box(0.022, 0.05, 0.004, toon({ color: '#e2e0d6' }), 0.26 + i * 0.03 - 0.03, 1.12, WALL_Z + 0.013));
  scene.add(box(0.035, 0.05, 0.03, toon({ color: '#151515' }), 0.175, 1.12, WALL_Z + 0.025));
  const cableMat = toon({ color: '#141414' });
  scene.add(box(0.11, 0.032, 0.055, toon({ color: '#1b1b1d' }), -0.14, DESK_Y + 0.016, -0.25));
  scene.add(tube([[0.175, 1.1, -0.32], [0.18, 0.98, -0.32], [0.24, 0.85, -0.33], [0.25, 0.76, -0.3], [0.05, 0.756, -0.31], [-0.08, 0.758, -0.27]], 0.005, cableMat));
  scene.add(tube([[-0.2, 0.758, -0.25], [-0.36, 0.756, -0.2], [-0.42, 0.756, -0.05], [-0.36, 0.756, 0.02], [-0.38, 0.756, -0.08], [-0.3, 0.756, -0.02], [-0.24, 0.762, 0.0]], 0.0045, cableMat));

  // ── laptop (ThinkPad-ish; more detail than the rest of the room) ──
  const laptop = new THREE.Group();
  const black = toon({ color: '#1c1d20' });
  const LW = 0.36, LD = 0.25, BASE_H = 0.018, LID_H = 0.01;
  const flat = (w, d, mat, x, y, z, up = true) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = up ? -Math.PI / 2 : Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    return m;
  };

  const base = new THREE.Mesh(new RoundedBoxGeometry(LW, BASE_H, LD, 3, 0.004), black);
  base.position.y = BASE_H / 2;
  base.castShadow = base.receiveShadow = true;
  laptop.add(base);
  laptop.add(flat(LW - 0.008, LD - 0.008, toon({ map: keyboardTexture() }), 0, BASE_H + 0.0002, 0));
  // side ports
  const portMat = toon({ color: '#050506' });
  [[-1, -0.06, 0.009], [-1, -0.04, 0.009], [1, -0.05, 0.012], [1, -0.02, 0.006]].forEach(([side, z, len]) =>
    laptop.add(box(0.002, 0.005, len, portMat, side * (LW / 2 + 0.0005), BASE_H / 2, z)));
  // rubber feet
  [[-0.15, -0.1], [0.15, -0.1], [-0.15, 0.1], [0.15, 0.1]].forEach(([x, z]) => laptop.add(box(0.03, 0.002, 0.008, portMat, x, -0.0008, z)));
  // hinge
  const hinge = cyl(0.0055, 0.0055, 0.26, 12, toon({ color: '#141518' }), 0, BASE_H, -LD / 2 + 0.004);
  hinge.rotation.z = Math.PI / 2;
  laptop.add(hinge);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, BASE_H, -LD / 2);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(LW, LID_H, LD, 3, 0.003), black);
  lid.position.set(0, LID_H / 2, LD / 2);
  lid.castShadow = lid.receiveShadow = true;
  lidPivot.add(lid);
  const lidTop = lidTexture();
  const LTW = LW - 0.006, LTD = LD - 0.006;
  lidPivot.add(flat(LTW, LTD, toon({ map: lidTop.texture }), 0, LID_H + 0.0002, LD / 2));
  // the red i-dot glows when the laptop is on, like the real thing
  const dot = box(0.0042, 0.0006, 0.0042, new THREE.MeshBasicMaterial({ color: '#5a1214' }),
    (lidTop.dot.u - 0.5) * LTW, LID_H + 0.0006, LD / 2 - (lidTop.dot.v - 0.5) * LTD);
  dot.castShadow = false;
  lidPivot.add(dot);
  lidPivot.add(flat(LW - 0.006, LD - 0.006, new THREE.MeshBasicMaterial({ map: bezelTexture() }), 0, -0.0004, LD / 2, false));

  const [screenCanvas, screenCtx] = canvas(160, 100);
  screenCtx.fillStyle = '#000';
  screenCtx.fillRect(0, 0, 160, 100);
  const screenTex = toTexture(screenCanvas);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.0009, 0.13);
  lidPivot.add(screen);
  laptop.add(lidPivot);

  const powerBtn = cyl(0.0065, 0.0065, 0.002, 16, toon({ color: '#2a2b2f', emissive: new THREE.Color('#000') }), 0.14, BASE_H + 0.001, -0.11);
  powerBtn.userData.power = true;
  laptop.add(powerBtn);
  const led = box(0.005, 0.0025, 0.002, new THREE.MeshBasicMaterial({ color: '#331010' }), 0.12, 0.009, LD / 2 + 0.0005);
  laptop.add(led);

  laptop.position.set(0, DESK_Y, 0.07);
  laptop.rotation.y = 0.02;
  laptop.scale.setScalar(LAPTOP_SCALE);
  scene.add(register(laptop, 'laptop', 'Laptop — power it on'));

  // ── headphones (over-ear, cups swivelled flat, band arching up) ──
  const phones = new THREE.Group();
  const navy = toon({ color: '#243154' });
  const navyDark = toon({ color: '#151c30' });
  const metal = toon({ color: '#8a93a6' });
  const cupProfile = [
    [0.0, 0.006], [0.032, 0.006], [0.044, 0.009], [0.049, 0.015], [0.05, 0.024],
    [0.047, 0.031], [0.04, 0.036], [0.026, 0.039], [0.0, 0.04],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cupGeo = new THREE.LatheGeometry(cupProfile, 32);
  const CUP_X = 0.078;
  for (const s of [-1, 1]) {
    const cup = new THREE.Group();
    const shell = new THREE.Mesh(cupGeo, navy);
    shell.castShadow = shell.receiveShadow = true;
    cup.add(shell);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0085, 10, 32), navyDark);
    cushion.rotation.x = Math.PI / 2;
    cushion.position.y = 0.007;
    cushion.castShadow = true;
    cup.add(cushion);
    cup.add(cyl(0.028, 0.028, 0.002, 24, navyDark, 0, 0.002, 0)); // fabric inside
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0018, 6, 32), metal);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.037;
    cup.add(ring);
    // yoke + slider rising to the band
    const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.0035, 6, 20, Math.PI), navyDark);
    yoke.rotation.y = Math.PI / 2;
    yoke.rotation.z = 0;
    yoke.position.y = 0.022;
    yoke.scale.set(1, 0.35, 1.12);
    cup.add(yoke);
    if (s === 1) {
      cup.add(box(0.006, 0.004, 0.012, metal, 0.047, 0.022, 0.012)); // power button
      cup.add(box(0.003, 0.003, 0.003, new THREE.MeshBasicMaterial({ color: '#4fa3ff' }), 0.049, 0.026, -0.006)); // led
    }
    cup.scale.set(1, 1, 1.18);
    cup.position.set(s * CUP_X, 0, 0);
    phones.add(cup);
    phones.add(box(0.008, 0.03, 0.01, metal, s * (CUP_X + 0.012), 0.065, 0)); // slider
  }
  const bandCurve = new THREE.CatmullRomCurve3([
    [-CUP_X - 0.012, 0.05], [-CUP_X - 0.018, 0.1], [-0.07, 0.15], [-0.035, 0.172], [0, 0.178],
    [0.035, 0.172], [0.07, 0.15], [CUP_X + 0.018, 0.1], [CUP_X + 0.012, 0.05],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const band = new THREE.Mesh(new THREE.TubeGeometry(bandCurve, 64, 0.0075, 10, false), navy);
  band.scale.z = 1.9; // flattened band, wider than it is thick
  band.castShadow = true;
  phones.add(band);
  const padCurve = new THREE.CatmullRomCurve3([[-0.06, 0.152], [-0.03, 0.166], [0, 0.17], [0.03, 0.166], [0.06, 0.152]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const pad = new THREE.Mesh(new THREE.TubeGeometry(padCurve, 32, 0.0075, 10, false), navyDark);
  pad.scale.z = 1.7;
  pad.position.y = -0.005;
  phones.add(pad);
  phones.rotation.set(-0.55, 0.4, 0);
  phones.position.set(-0.5, DESK_Y + 0.004, 0.1);
  phones.userData.baseY = phones.position.y;
  scene.add(register(phones, 'headphones', 'Headphones — play music'));

  // ── notebook + pen ───────────────────────────────────────
  const notebook = new THREE.Group();
  const nbTex = notebookTexture();
  const paper = toon({ color: '#f1f0ea' });
  const page = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.012, 0.22), [paper, paper, toon({ map: nbTex }), paper, paper, paper]);
  page.position.y = 0.006;
  page.castShadow = page.receiveShadow = true;
  notebook.add(page);
  const pen = cyl(0.006, 0.006, 0.15, 8, toon({ color: '#0c0c0e' }), 0.05, 0.02, 0.0);
  pen.rotation.set(Math.PI / 2, 0, -0.9);
  notebook.add(pen);
  notebook.position.set(0.47, DESK_Y, 0.13);
  notebook.rotation.y = 0.18;
  scene.add(register(notebook, 'notebook', 'Notebook — /now'));
  const cap = cyl(0.007, 0.007, 0.04, 8, toon({ color: '#c8c9cc' }), 0.36, DESK_Y + 0.007, -0.07);
  cap.rotation.set(Math.PI / 2, 0, 1.3);
  scene.add(cap);

  // ── straw hat on the left pillar ─────────────────────────
  const hat = new THREE.Group();
  const straw = toon({ map: strawTexture() });
  const red = toon({ color: '#c8262c' });
  const brim = cyl(0.175, 0.175, 0.008, 28, straw);
  hat.add(brim);
  hat.add(cyl(0.085, 0.097, 0.075, 22, straw, 0, 0.04, 0));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.085, 22, 8, 0, Math.PI * 2, 0, Math.PI / 2), straw);
  dome.scale.y = 0.45;
  dome.position.y = 0.077;
  dome.castShadow = true;
  hat.add(dome);
  hat.add(cyl(0.0985, 0.1, 0.028, 22, red, 0, 0.02, 0));
  const hatPivot = new THREE.Group();
  hat.rotation.x = Math.PI / 2;
  hatPivot.add(hat);
  hatPivot.position.set(-0.86, 1.36, 0.36);
  hatPivot.rotation.z = 0.12;
  scene.add(register(hatPivot, 'hat', 'Straw hat — anime log'));
  scene.add(box(0.012, 0.012, 0.04, toon({ color: '#888' }), -0.86, 1.42, 0.355));

  return {
    interactive,
    painting,
    laptop: { group: laptop, lidPivot, screen, screenCanvas, screenCtx, screenTex, powerBtn, led, dot },
    hat: { pivot: hatPivot, inner: hat, home: hatPivot.position.clone(), homeRot: hatPivot.rotation.clone() },
    lamp: { mesh: lamp, mat: lampMat },
    headphones: phones,
    notebook,
    DESK_Y,
  };
}
