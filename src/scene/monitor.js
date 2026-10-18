// The wall monitor's screen: a 160×90 pixel canvas with hacker vibes.
//   left  – a green terminal auto-typing my real workflow (Django, git, deploys), on a loop
//   right – Matrix-style code rain over a live CPU graph
//   top   – user@host bar and a ticking clock
export const SCREEN_W = 160;
export const SCREEN_H = 90;

// ── 3×5 pixel font (upper-case only; lower-case is drawn as upper) ──
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
  ':': '000010000010000', '.': '000000000000010', ',': '000000000010100', '-': '000000111000000',
  '_': '000000000000111', '/': '001001010100100', $: '011110010011110', '>': '100010001010100',
  '<': '001010100010001', '@': '010101111100011', '~': '000000011110000', '=': '000111000111000',
  '&': '010101010101011', '[': '110100100100110', ']': '011001001001011', '(': '010100100100010',
  ')': '010001001001010', '*': '000101010101000', '!': '010010010000010', '?': '110001010000010',
  '%': '101001010100101', '+': '000010111010000', '|': '010010010010010', '#': '101111101111101',
  "'": '010010000000000', '"': '101101000000000', ' ': '000000000000000',
};

const G = {
  bg: '#040a06', bar: '#0b2214', prompt: '#3dff7a', cmd: '#c8ffd8', out: '#36a35c',
  ok: '#ffd23f', dim: '#14532b', head: '#e0ffe9', frame: '#1c6b3a',
};

// What the terminal "types". Each line fits the 24-char pane.
const SCRIPT = [
  { cmd: 'whoami', out: ['shamit patel', 'dev + artist + idea guy'] },
  { cmd: 'cd talk2anyone', out: [] },
  { cmd: 'py manage.py runserver', out: ['watching for changes...', 'serving on :8000  OK'] },
  { cmd: 'git commit -am fix', out: ['[main 4f2a9c1] fix', '3 files changed'] },
  { cmd: 'git push', out: ['github.com/shamit-arch', 'main -> main  OK'] },
  { cmd: 'npm run build', out: ['built in 0.54s  OK'] },
  { cmd: 'wrangler deploy', out: ['uploading 11 files...', 'live on the edge  OK'] },
  { cmd: 'sqlite3 inventory.db', out: ['sqlite> select count(*)', '1284'] },
  { cmd: 'ping gotham', out: ['reply from batsignal', 'time=1ms ttl=64'] },
  { cmd: 'sudo make coffee', out: ['[sudo] password: ****', 'brewing...  OK'] },
  { cmd: 'clear', out: [] },
];
const TYPE = 0.07; // seconds per typed character
const STEPS = [];
let LOOP = 0.8;
for (const s of SCRIPT) {
  STEPS.push({ kind: 'cmd', text: s.cmd, start: LOOP });
  LOOP += s.cmd.length * TYPE + 0.35;
  for (const o of s.out) {
    STEPS.push({ kind: 'out', text: o, start: LOOP });
    LOOP += 0.22;
  }
  LOOP += s.cmd === 'clear' ? 0.25 : 0.9;
}

const pad2 = (n) => String(n).padStart(2, '0');
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const RAIN_CHARS = '0110ABCDEF7$#%*<>=+';

export function createMonitorScreen({ ctx, texture }) {
  const W = SCREEN_W, H = SCREEN_H;
  let lastDraw = -1;

  const rect = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  function text(str, x, y, col) {
    ctx.fillStyle = col;
    [...str.toUpperCase()].forEach((ch, i) => {
      const g = GLYPHS[ch] || GLYPHS[' '];
      for (let j = 0; j < 15; j++) if (g[j] === '1') ctx.fillRect(Math.round(x + i * 4 + (j % 3)), Math.round(y + Math.floor(j / 3)), 1, 1);
    });
  }

  // ── left: terminal ──────────────────────────────────────────
  function drawTerminal(t) {
    const now = t % LOOP;
    const lines = [];
    for (const s of STEPS) {
      if (s.start > now) break;
      if (s.kind === 'cmd') lines.push({ kind: 'cmd', text: s.text.slice(0, Math.floor((now - s.start) / TYPE)) });
      else lines.push({ kind: 'out', text: s.text });
    }
    if (!lines.length || lines[lines.length - 1].kind === 'out') lines.push({ kind: 'cmd', text: '' });
    const ROWS = 13, x0 = 3, y0 = 11;
    const shown = lines.slice(-ROWS);
    shown.forEach((l, i) => {
      const y = y0 + i * 6;
      if (l.kind === 'cmd') {
        text('$', x0, y, G.prompt);
        text(l.text, x0 + 8, y, G.cmd);
      } else {
        text(l.text, x0, y, G.out);
        if (l.text.endsWith('OK')) text('OK', x0 + (l.text.length - 2) * 4, y, G.ok);
      }
    });
    // blinking block cursor after the last line
    if (Math.floor(t * 2.5) % 2 === 0) {
      const last = shown[shown.length - 1];
      rect(x0 + 8 + last.text.length * 4, y0 + (shown.length - 1) * 6, 3, 5, G.prompt);
    }
  }

  // ── right: code rain + CPU graph ────────────────────────────
  function drawRain(t) {
    const x0 = 104, top = 9, bottom = 58;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, top, W - x0, bottom - top);
    ctx.clip();
    for (let c = 0; c < 11; c++) {
      const speed = 10 + hash(c) * 22;
      const head = ((t * speed + hash(c + 5) * 120) % 90) + top - 10;
      for (let k = 0; k < 9; k++) {
        const y = Math.round((head - k * 6) / 6) * 6;
        if (y < top - 5 || y > bottom) continue;
        const idx = Math.floor(hash(c * 31 + Math.floor(y / 6) + Math.floor(t * (3 + (k === 0 ? 6 : 0)))) * RAIN_CHARS.length);
        const col = k === 0 ? G.head : k < 3 ? G.prompt : k < 6 ? G.out : G.dim;
        text(RAIN_CHARS[idx], x0 + 1 + c * 5, y, col);
      }
    }
    ctx.restore();
  }

  function drawCpu(t) {
    const x0 = 104, y0 = 61, w = W - x0 - 2, h = 27;
    rect(x0, y0, w, 1, G.frame);
    const n = Math.floor(t * 4);
    const load = (i) => 0.25 + 0.45 * hash(i * 0.37) + 0.25 * Math.sin(i * 0.21);
    const cur = Math.round(Math.max(3, Math.min(99, load(n) * 100)));
    text('CPU', x0 + 1, y0 + 3, G.out);
    text(`${cur}%`, x0 + w - `${cur}%`.length * 4, y0 + 3, cur > 70 ? G.ok : G.prompt);
    const bars = Math.floor(w / 2);
    for (let i = 0; i < bars; i++) {
      const v = Math.max(0.05, Math.min(1, load(n - (bars - 1 - i))));
      const bh = Math.round(v * 16);
      rect(x0 + i * 2, y0 + h - bh, 1, bh, v > 0.7 ? G.ok : i === bars - 1 ? G.prompt : G.out);
    }
  }

  function draw(t) {
    rect(0, 0, W, H, G.bg);
    // top bar
    rect(0, 0, W, 8, G.bar);
    text('shamit@desk:~', 2, 2, G.prompt);
    const d = new Date();
    const clock = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    text(clock, W - clock.length * 4 - 1, 2, G.cmd);
    rect(101, 9, 1, H - 9, G.frame); // pane divider
    drawTerminal(t);
    drawRain(t);
    drawCpu(t);
    // CRT scanlines + a faint flicker
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 1; y < H; y += 2) ctx.fillRect(0, y, W, 1);
    if (hash(Math.floor(t * 12)) > 0.94) rect(0, 0, W, H, 'rgba(61,255,122,0.05)');
  }

  return {
    draw(t) {
      if (t - lastDraw < 1 / 15) return;
      lastDraw = t;
      draw(t);
      texture.needsUpdate = true;
    },
  };
}
