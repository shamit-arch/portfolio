// Tiny WebAudio sound kit: UI blips + a lo-fi chiptune loop for the headphones.
let ctx, master, musicGain, timer;
let muted = false;

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    musicGain.gain.value = 0;
    musicGain.connect(lp).connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'square', vol = 0.1, dest = master) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(start + dur + 0.02);
  return o;
}

const SFX = {
  hover: [[880, 0, 0.03, 'square', 0.025]],
  click: [[660, 0, 0.05], [990, 0.04, 0.05]],
  open: [[523, 0, 0.06], [784, 0.05, 0.08]],
  close: [[784, 0, 0.05], [392, 0.04, 0.07]],
  key: [[1200, 0, 0.02, 'square', 0.03]],
  power: [[220, 0, 0.12, 'triangle', 0.2], [440, 0.1, 0.18, 'triangle', 0.2]],
  chime: [[523, 0, 0.18, 'triangle', 0.15], [659, 0.12, 0.18, 'triangle', 0.15], [784, 0.24, 0.3, 'triangle', 0.15]],
  page: [[300, 0, 0.05, 'triangle', 0.12], [450, 0.05, 0.06, 'triangle', 0.08]],
  swap: [[392, 0, 0.05], [523, 0.05, 0.05], [659, 0.1, 0.07]],
  nope: [[200, 0, 0.12, 'square', 0.08], [150, 0.1, 0.15, 'square', 0.08]],
};

export function sfx(name) {
  if (muted) return;
  try {
    ensure();
    const t = ctx.currentTime;
    (SFX[name] || []).forEach(([f, d, len, type, vol]) => tone(f, t + d, len, type, vol));
  } catch {
    /* audio unavailable */
  }
}

// Am7 – Fmaj7 – Cmaj7 – G6, arpeggiated
const CHORDS = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [48, 52, 55, 59],
  [55, 59, 62, 64],
];
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let step = 0, nextTime = 0;
const BEAT = 60 / 78 / 2; // eighth notes at 78bpm

function schedule() {
  while (nextTime < ctx.currentTime + 0.2) {
    const bar = Math.floor(step / 8) % CHORDS.length;
    const chord = CHORDS[bar];
    const i = step % 8;
    const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
    tone(midi(chord[pattern[i]] + 12), nextTime, BEAT * 0.9, 'triangle', 0.06, musicGain);
    if (i === 0) tone(midi(chord[0] - 12), nextTime, BEAT * 7, 'sine', 0.16, musicGain);
    if (i === 4) tone(midi(chord[1]), nextTime, BEAT * 3, 'square', 0.02, musicGain);
    // vinyl-ish hat
    if (i % 2 === 1) {
      const n = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, 800, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length);
      n.buffer = buf;
      const g = ctx.createGain();
      g.gain.value = 0.03;
      n.connect(g).connect(musicGain);
      n.start(nextTime);
    }
    nextTime += BEAT * (i % 2 ? 0.92 : 1.08); // a little swing
    step++;
  }
}

export const music = {
  playing: false,
  toggle() {
    ensure();
    this.playing = !this.playing;
    const t = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setTargetAtTime(this.playing && !muted ? 1 : 0, t, 0.3);
    if (this.playing && !timer) {
      nextTime = ctx.currentTime + 0.05;
      timer = setInterval(schedule, 50);
    } else if (!this.playing) {
      setTimeout(() => {
        if (!this.playing) {
          clearInterval(timer);
          timer = null;
        }
      }, 1200);
    }
    return this.playing;
  },
};

export function setMuted(m) {
  muted = m;
  if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
}
export const isMuted = () => muted;
