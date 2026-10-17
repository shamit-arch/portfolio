// The wall monitor's screen: a 160×90 pixel canvas with three animated modes.
//   0 Overworld   – Minecraft-style world; sun, moon and sky follow the viewer's local time
//   1 Focus timer – 25 min focus / 5 min break Pomodoro
//   2 Sunset sail – a little sheep-headed ship at sunset
export const SCREEN_W = 160;
export const SCREEN_H = 90;

export const MODES = [
  { name: 'Overworld', desc: 'A blocky little world. The sun and moon follow your local time.' },
  { name: 'Focus timer', desc: '25 min deep focus, 5 min break. Click the screen to start or pause.' },
  { name: 'Sunset sail', desc: 'Somewhere on the Grand Line, a sheep-headed ship sails into the evening.' },
];

// ── 3×5 pixel font ────────────────────────────────────────────
const GLYPHS = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001110',
  ':': '000010000010000', '.': '000000000000010', '-': '000000111000000', ' ': '000000000000000',
};

const pad2 = (n) => String(n).padStart(2, '0');
const lerp = (a, b, t) => a + (b - a) * t;
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}
// tiny deterministic hash for terrain / stars
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function createMonitorScreen({ ctx, texture, onTimerEnd }) {
  const W = SCREEN_W, H = SCREEN_H;
  let mode = 0;
  let lastDraw = -1;

  const px = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  function textWidth(str, s = 1) {
    return str.length * 4 * s - s;
  }
  function text(str, x, y, col, s = 1, shadow) {
    if (shadow) text(str, x + Math.min(s, 2), y + Math.min(s, 2), shadow, s);
    [...str.toUpperCase()].forEach((ch, i) => {
      const g = GLYPHS[ch] || GLYPHS[' '];
      for (let j = 0; j < 15; j++) if (g[j] === '1') px(x + i * 4 * s + (j % 3) * s, y + Math.floor(j / 3) * s, s, s, col);
    });
  }
  const clockStr = (d = new Date()) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  // ── Pomodoro state (keeps running whatever mode is on screen) ──
  const FOCUS = 25 * 60, BREAK = 5 * 60;
  const timer = { phase: 'focus', total: FOCUS, left: FOCUS, running: false, last: 0 };
  function tickTimer() {
    const now = performance.now();
    if (timer.running) {
      timer.left -= (now - timer.last) / 1000;
      if (timer.left <= 0) {
        const ended = timer.phase;
        timer.phase = ended === 'focus' ? 'break' : 'focus';
        timer.total = timer.left = timer.phase === 'focus' ? FOCUS : BREAK;
        onTimerEnd?.(ended);
      }
    }
    timer.last = now;
  }

  // ── mode 0: overworld ─────────────────────────────────────────
  const COLS = W / 5; // 5px blocks
  const heights = Array.from({ length: COLS }, (_, i) => Math.round(Math.sin(i * 0.33) * 1.6 + Math.sin(i * 0.9 + 1) * 0.8 + hash(i) * 0.6));
  const SKY_KEYS = [
    [0, '#070b24'], [4.5, '#0d1438'], [6, '#e9866a'], [7.5, '#7fb6ff'], [16.5, '#7fb6ff'],
    [18.2, '#ff8a5a'], [19.5, '#2a2558'], [21, '#0b1030'], [24, '#070b24'],
  ];
  function skyAt(h) {
    for (let i = 0; i < SKY_KEYS.length - 1; i++) {
      const [h0, c0] = SKY_KEYS[i], [h1, c1] = SKY_KEYS[i + 1];
      if (h >= h0 && h <= h1) return mixHex(c0, c1, (h - h0) / (h1 - h0));
    }
    return SKY_KEYS[0][1];
  }
  function drawOverworld(t) {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    const night = h < 5.5 || h > 19.5 ? 1 : h < 7 ? 1 - (h - 5.5) / 1.5 : h > 18 ? (h - 18) / 1.5 : 0;
    const sky = skyAt(h);
    px(0, 0, W, H, sky);
    for (let y = 0; y < 40; y += 4) px(0, y, W, 4, `rgba(0,0,0,${0.06 - y * 0.0015})`); // banded sky
    // stars
    if (night > 0.05) for (let i = 0; i < 40; i++) {
      if (hash(i + 7) * 1.2 > night) continue;
      const tw = hash(i + Math.floor(t * 1.5)) > 0.85 ? '#ffffff' : '#c9d4ff';
      px(hash(i) * W, hash(i + 99) * 45, 1, 1, tw);
    }
    // square sun (6–18h) and moon (18–6h) on an arc
    const sunP = (h - 6) / 12, moonP = (((h - 18) % 24) + 24) % 24 / 12;
    const arc = (p) => [8 + p * (W - 24), 52 - Math.sin(p * Math.PI) * 42];
    if (sunP >= 0 && sunP <= 1) {
      const [x, y] = arc(sunP);
      px(x - 1, y - 1, 10, 10, '#fff3a0');
      px(x, y, 8, 8, '#ffe14d');
    }
    if (moonP >= 0 && moonP <= 1) {
      const [x, y] = arc(moonP);
      px(x, y, 8, 8, '#e8ecf4');
      px(x + 2, y + 2, 2, 2, '#b9c0cf');
      px(x + 5, y + 4, 2, 2, '#b9c0cf');
    }
    // drifting blocky clouds
    const cloudCol = night > 0.5 ? 'rgba(180,190,220,0.35)' : 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 4; i++) {
      const x = ((hash(i * 3) * 220 + t * (2 + i * 0.6)) % 220) - 40;
      const y = 6 + i * 6;
      px(x, y, 22 + i * 3, 4, cloudCol);
      px(x + 5, y - 3, 12, 3, cloudCol);
    }
    // terrain
    const base = 62;
    for (let c = 0; c < COLS; c++) {
      const top = base - heights[c] * 5;
      const x = c * 5;
      px(x, top, 5, 5, '#5fa53a');
      px(x, top, 5, 1, '#79c24a');
      if (hash(c + 3) > 0.5) px(x + 1, top + 3, 1, 2, '#7a5634');
      px(x, top + 5, 5, 10, '#8b5e3c');
      if (hash(c) > 0.6) px(x + 2, top + 8, 1, 1, '#6d4528');
      for (let y = top + 15; y < H; y += 5) {
        px(x, y, 5, 5, (c + y / 5) % 2 ? '#7b7b7b' : '#727272');
        if (hash(c * 31 + y) > 0.93) px(x + 1, y + 1, 2, 2, hash(c + y) > 0.5 ? '#3a3a3a' : '#5ad1e6'); // coal / diamond
      }
    }
    const groundAt = (col) => base - heights[col] * 5;
    // trees
    for (const c of [4, 19]) {
      const g = groundAt(c), x = c * 5;
      px(x + 1, g - 15, 3, 15, '#6b4a2b');
      px(x - 5, g - 25, 15, 10, '#2f7d32');
      px(x, g - 30, 5, 5, '#2f7d32');
      px(x - 4, g - 24, 2, 2, '#3f9a42');
    }
    // little plank house
    {
      const c = 25, g = groundAt(c), x = c * 5;
      px(x, g - 15, 20, 15, '#b8915a');
      for (let r = 0; r < 3; r++) px(x, g - 15 + r * 5, 20, 1, '#9a7744');
      px(x + 3, g - 10, 4, 10, '#6b4a2b');
      px(x + 11, g - 11, 5, 4, night > 0.4 ? '#ffd56a' : '#a8d8ff');
      px(x - 2, g - 18, 24, 3, '#7a4b2a');
      px(x + 2, g - 21, 16, 3, '#7a4b2a');
    }
    // a tiny explorer walking back and forth
    {
      const span = 70, pos = (t * 6) % (span * 2);
      const x = 40 + (pos < span ? pos : span * 2 - pos);
      const g = groundAt(Math.floor((x + 2) / 5));
      const step = Math.floor(t * 4) % 2;
      px(x, g - 9, 3, 3, '#c69c72');
      px(x, g - 9, 3, 1, '#4a2f1a');
      px(x, g - 6, 3, 3, '#2fa3b6');
      px(x + (step ? 0 : 1), g - 3, 1, 3, '#3a3f8f');
      px(x + (step ? 2 : 1), g - 3, 1, 3, '#3a3f8f');
    }
    if (night > 0) px(0, 0, W, H, `rgba(8,12,40,${night * 0.45})`);
    const clk = clockStr(d);
    text(clk, W - textWidth(clk, 2) - 4, 4, '#ffffff', 2, 'rgba(0,0,0,0.5)');
  }

  // ── mode 1: focus timer ──────────────────────────────────────
  function drawTimer(t) {
    const focus = timer.phase === 'focus';
    px(0, 0, W, H, focus ? '#1b1633' : '#12322a');
    for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) px(x, y, 1, 1, focus ? '#2a2350' : '#1d4a3d');
    // pixel tomato
    px(8, 9, 10, 9, '#e0453a');
    px(9, 8, 8, 11, '#e0453a');
    px(10, 10, 3, 2, '#ff8a7a');
    px(12, 6, 2, 3, '#3f9a42');
    px(10, 7, 6, 1, '#3f9a42');
    const label = timer.running ? (focus ? 'DEEP FOCUS' : 'BREAK TIME') : timer.left === timer.total ? 'READY' : 'PAUSED';
    text(label, 24, 10, focus ? '#f2b233' : '#7fe0b0', 1);
    const secs = Math.max(0, Math.ceil(timer.left));
    const str = `${pad2(Math.floor(secs / 60))}:${pad2(secs % 60)}`;
    const blinkOff = !timer.running && timer.left !== timer.total && Math.floor(t * 2) % 2;
    if (!blinkOff) text(str, (W - textWidth(str, 6)) / 2, 26, '#ffffff', 6, focus ? '#5a3fb0' : '#2f8a66');
    // progress bar
    const p = 1 - timer.left / timer.total;
    px(16, 70, W - 32, 6, '#0b0a18');
    px(17, 71, Math.round((W - 34) * p), 4, focus ? '#f2b233' : '#7fe0b0');
    const hint = timer.running ? 'CLICK TO PAUSE' : 'CLICK TO START';
    text(hint, (W - textWidth(hint)) / 2, 80, '#8c86b0');
    const clk = clockStr();
    text(clk, W - textWidth(clk) - 4, 4, '#8c86b0');
  }

  // ── mode 2: sunset sail ──────────────────────────────────────
  const SHIP = [
    '.............k........',
    '.............kkk......',
    '.............m........',
    '........wwwwwwwwww....',
    '........wwwwwwwwww....',
    '........wwwwwwwwww....',
    '........wwwwwwwwww....',
    '.........wwwwwwww.....',
    '.............m........',
    '.............m........',
    '..hh.........m......ss',
    '..hhhhhhhhhhhhhhhhhssk',
    '..hhhhhhhhhhhhhhhhhsss',
    '...HHHHHHHHHHHHHHHHss.',
    '....HHHHHHHHHHHHHHH...',
  ];
  const SHIP_COL = { k: '#1a1410', m: '#4a2f1a', w: '#fff4dc', h: '#a8703a', H: '#6e4522', s: '#fbf6ea' };
  const SKY_BANDS = ['#2b1d4a', '#4d2a63', '#82356b', '#c4485f', '#ee7a4a', '#f7b35a', '#fbe08a'];
  function drawSail(t) {
    const horizon = 52;
    SKY_BANDS.forEach((c, i) => px(0, (i * horizon) / SKY_BANDS.length, W, Math.ceil(horizon / SKY_BANDS.length) + 1, c));
    // sun sitting on the horizon
    for (let y = -12; y <= 0; y++) {
      const w = Math.round(Math.sqrt(144 - y * y));
      px(112 - w, horizon + y, w * 2, 1, y > -3 ? '#ffe9a0' : '#fff2b8');
    }
    // sea
    for (let y = horizon; y < H; y++) px(0, y, W, 1, mixHex('#3a3f7a', '#141a3c', (y - horizon) / (H - horizon)));
    for (let i = 0; i < 46; i++) {
      const y = horizon + 2 + Math.floor(hash(i) * (H - horizon - 3));
      const x = (hash(i + 50) * W + t * (6 + (y - horizon) * 0.5)) % (W + 20) - 10;
      const nearSun = Math.abs(x - 112) < 12 + (y - horizon) * 0.4;
      px(x, y, 3 + Math.floor(hash(i + 9) * 6), 1, nearSun && hash(i + Math.floor(t * 3)) > 0.3 ? '#ffd27a' : '#5560a8');
    }
    // the ship, bobbing
    const bob = Math.round(Math.sin(t * 1.6) * 1.2);
    const sx = 30 + Math.sin(t * 0.2) * 6, sy = horizon - 11 + bob;
    SHIP.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && px(sx + x * 2, sy - 10 + y * 2, 2, 2, SHIP_COL[ch])));
    px(sx + 4, sy + 20, 40, 1, '#2a2f66'); // shadow line on the water
    // gulls
    for (let i = 0; i < 3; i++) {
      const gx = ((t * (8 + i * 2) + i * 60) % (W + 30)) - 15;
      const gy = 14 + i * 7 + Math.sin(t * 2 + i) * 2;
      const up = Math.floor(t * 4 + i) % 2;
      px(gx, gy, 1, 1, '#2b1d2a');
      px(gx + 1, gy + (up ? -1 : 1), 1, 1, '#2b1d2a');
      px(gx + 2, gy, 1, 1, '#2b1d2a');
      px(gx + 3, gy + (up ? -1 : 1), 1, 1, '#2b1d2a');
      px(gx + 4, gy, 1, 1, '#2b1d2a');
    }
  }

  const DRAW = [drawOverworld, drawTimer, drawSail];

  return {
    draw(t) {
      tickTimer();
      if (t - lastDraw < 1 / 12) return;
      lastDraw = t;
      DRAW[mode](t);
      texture.needsUpdate = true;
    },
    next(dir = 1) {
      mode = (mode + dir + DRAW.length) % DRAW.length;
      lastDraw = -1;
      return mode;
    },
    get mode() {
      return mode;
    },
    timer: {
      toggle() {
        timer.running = !timer.running;
        timer.last = performance.now();
        lastDraw = -1;
        return timer.running;
      },
      reset() {
        timer.running = false;
        timer.phase = 'focus';
        timer.total = timer.left = FOCUS;
        lastDraw = -1;
      },
      get running() {
        return timer.running;
      },
    },
  };
}
