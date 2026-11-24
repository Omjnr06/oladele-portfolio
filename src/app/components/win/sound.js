let ctx = null;
let enabled = true;

export function setSoundOn(on) {
  enabled = on;
}

export function wakeAudio() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    ctx = new Ctx();
  } catch {
    ctx = null;
  }
  return ctx;
}

function voice(c, out, { f, to, at, dur, type = "sine", peak = 0.12, attack = 0.012 }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.05);
}

const SOUNDS = {
  startup(c, out, t) {
    [329.63, 415.3, 493.88, 659.25, 830.61].forEach((f, i) => {
      voice(c, out, { f, at: t + i * 0.11, dur: 2.2 - i * 0.18, peak: 0.07, attack: 0.04 });
      voice(c, out, { f: f * 2, at: t + i * 0.11, dur: 1.1, type: "triangle", peak: 0.015, attack: 0.03 });
    });
    voice(c, out, { f: 164.81, at: t, dur: 2.4, type: "triangle", peak: 0.05, attack: 0.2 });
  },
  open(c, out, t) {
    voice(c, out, { f: 880, to: 1320, at: t, dur: 0.07, type: "triangle", peak: 0.04 });
  },
  minimize(c, out, t) {
    voice(c, out, { f: 700, to: 300, at: t, dur: 0.12, type: "triangle", peak: 0.045 });
  },
  close(c, out, t) {
    voice(c, out, { f: 520, to: 360, at: t, dur: 0.09, type: "triangle", peak: 0.04 });
  },
  shutdown(c, out, t) {
    [830.61, 659.25, 493.88, 415.3].forEach((f, i) => {
      voice(c, out, { f, at: t + i * 0.14, dur: 1.2 - i * 0.12, peak: 0.06, attack: 0.03 });
    });
    voice(c, out, { f: 164.81, at: t + 0.2, dur: 1.4, type: "triangle", peak: 0.04, attack: 0.15 });
  },
  error(c, out, t) {
    voice(c, out, { f: 466.16, at: t, dur: 0.18, type: "square", peak: 0.035 });
    voice(c, out, { f: 349.23, at: t + 0.16, dur: 0.28, type: "square", peak: 0.035 });
  },
};

export function play(name) {
  if (!enabled || !SOUNDS[name]) return;
  if (!ctx && !navigator.userActivation?.hasBeenActive) return;
  const c = wakeAudio();
  if (!c) return;
  const out = c.createGain();
  out.gain.value = 0.9;
  out.connect(c.destination);
  SOUNDS[name](c, out, c.currentTime + 0.02);
}
