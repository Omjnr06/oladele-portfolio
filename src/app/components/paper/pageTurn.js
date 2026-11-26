const FRAMES = 48;
const LIFT = 0.3;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function clipRect(w, h, keep, start) {
  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const slots = [];
  for (let j = 0; j < 4; j++) {
    const i = (start + j) % 4;
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const fa = keep(a);
    const fb = keep(b);
    slots.push(fa >= 0 ? a : null);
    slots.push(fa >= 0 !== fb >= 0 ? [a[0] + (b[0] - a[0]) * (fa / (fa - fb)), a[1] + (b[1] - a[1]) * (fa / (fa - fb))] : null);
  }
  const first = slots.find(Boolean) ?? corners[start];
  let last = first;
  return slots.map((q) => (last = q ?? last));
}

function polygon(pts) {
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;
}

const m = (a, b, c, d, e, f) => `matrix(${[a, b, c, d, e, f].map((n) => +n.toFixed(5)).join(", ")})`;

function frame(t, w, h) {
  const e = ease(t);
  const c = [w, h];
  const p = [w - 2 * w * e, h - h * LIFT * Math.sin(Math.PI * e)];
  const len = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
  const n = [(p[0] - c[0]) / len, (p[1] - c[1]) / len];
  const mid = [(c[0] + p[0]) / 2, (c[1] + p[1]) / 2];
  const side = ([x, y]) => (x - mid[0]) * n[0] + (y - mid[1]) * n[1];
  const md = mid[0] * n[0] + mid[1] * n[1];
  const u = [-n[0], -n[1]];
  const v = [-u[1], u[0]];
  const oy = 1.5 * h;
  return {
    flat: polygon(clipRect(w, h, side, 0)),
    fold: polygon(clipRect(w, h, (q) => -side(q), 2)),
    flap: m(1 - 2 * n[0] * n[0], -2 * n[0] * n[1], -2 * n[0] * n[1], 1 - 2 * n[1] * n[1], 2 * md * n[0], 2 * md * n[1]),
    shade: m(u[0], u[1], v[0], v[1], mid[0] - oy * v[0], mid[1] - oy * v[1]),
    dark: Math.min(1, 5 * e, 4 * (1 - e)),
  };
}

export function runPageTurn(dir, duration) {
  const w = innerWidth;
  const h = innerHeight;
  const frames = Array.from({ length: FRAMES + 1 }, (_, i) => frame(Math.min(0.999, Math.max(0.004, i / FRAMES)), w, h));
  if (dir === "prev") frames.reverse();
  const root = document.documentElement;
  const anims = [];
  const run = (pseudoElement, keyframes) => {
    try {
      anims.push(root.animate(keyframes, { duration, easing: "linear", fill: "both", pseudoElement }));
    } catch {}
  };
  run(dir === "prev" ? "::view-transition-new(root)" : "::view-transition-old(root)", frames.map((f) => ({ clipPath: f.flat })));
  run("::view-transition-group(pt-flap)", frames.map((f) => ({ transform: f.flap })));
  run("::view-transition-new(pt-flap)", frames.map((f) => ({ clipPath: f.fold })));
  run("::view-transition-group(pt-shade)", frames.map((f) => ({ transform: f.shade, opacity: f.dark })));
  return () => anims.forEach((a) => a.cancel());
}
