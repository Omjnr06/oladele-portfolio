"use client";
import { useRef, useState } from "react";

const W = 17;
const H = 9;
const CHARS = " .o+=*BOX@%&#/^";

function bytes(seed, n) {
  const out = [];
  for (let k = 0; out.length < n; k++) {
    let h = 2166136261 ^ k;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    for (let s = 0; s < 4; s++) out.push((h >>> (s * 8)) & 255);
  }
  return out.slice(0, n);
}

function walk(seed) {
  const count = Array(W * H).fill(0);
  const first = Array(W * H).fill(-1);
  let x = W >> 1;
  let y = H >> 1;
  const start = y * W + x;
  let step = 0;
  for (const b of bytes(seed, 32)) {
    for (let s = 0; s < 8; s += 2) {
      x = Math.max(0, Math.min(W - 1, x + (b >> s & 1 ? 1 : -1)));
      y = Math.max(0, Math.min(H - 1, y + (b >> (s + 1) & 1 ? 1 : -1)));
      const i = y * W + x;
      count[i]++;
      if (first[i] < 0) first[i] = step;
      step++;
    }
  }
  const end = y * W + x;
  const cells = count.map((c, i) => ({ ch: i === start ? "S" : i === end ? "E" : CHARS[Math.min(c, CHARS.length - 1)], at: i === start ? 0 : first[i] }));
  return { cells, steps: step };
}

const ART = walk("omj@magbadelojr");
const STEP = 0.011;
const DONE = ART.steps * STEP + 0.35;

export default function Randomart() {
  const [n, setN] = useState(0);
  const busy = useRef(0);
  const replay = () => {
    if (Date.now() < busy.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    busy.current = Date.now() + (DONE + 1.2) * 1000;
    setN((x) => x + 1);
  };

  return (
    <div aria-hidden key={n} onPointerEnter={replay} className="randomart select-none font-mono text-[11px] leading-[1.1] text-muted" style={{ "--done": `${DONE}s` }}>
      <pre className="randomart-box">
        {"+--[ED25519 256]--+\n"}
        {Array.from({ length: H }, (_, r) => (
          <span key={r}>
            |
            {ART.cells.slice(r * W, r * W + W).map((c, i) => (
              <span key={i} className={c.ch === "S" || c.ch === "E" ? "text-accent" : c.ch === " " ? undefined : "randomart-cell text-fg"} style={c.at >= 0 ? { animationDelay: `${0.25 + c.at * STEP}s` } : undefined}>
                {c.ch}
              </span>
            ))}
            {"|\n"}
          </span>
        ))}
        {"+--[magbadelojr]--+"}
      </pre>
      <p className="randomart-ok mt-1 text-ok">✓ host verified</p>
    </div>
  );
}
