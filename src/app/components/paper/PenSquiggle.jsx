"use client";
import { useEffect, useRef } from "react";

const WAVES = [5, 7, 4, 6, 8, 5, 6, 4, 7, 5, 6, 5, 7, 4, 6, 5, 8, 5, 6, 4];
const STEP = 600 / WAVES.length;
const D = `M2 10 ${WAVES.map((a, i) => `Q ${(2 + STEP * (i + 0.5)).toFixed(1)} ${i % 2 ? 10 + a : 10 - a} ${(2 + STEP * (i + 1)).toFixed(1)} 10`).join(" ")}`;

export default function PenSquiggle() {
  const path = useRef(null);

  useEffect(() => {
    const host = path.current?.closest("h1");
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const replay = () => {
      if (document.documentElement.dataset.pack !== "paper") return;
      const runs = [...host.querySelectorAll(".ink-letter, .pen-draw")].flatMap((el) => el.getAnimations());
      if (!runs.length || runs.some((a) => a.playState === "running")) return;
      runs.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
    };
    host.addEventListener("pointerenter", replay);
    return () => host.removeEventListener("pointerenter", replay);
  }, []);

  return (
    <svg aria-hidden viewBox="0 0 604 20" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-5 left-1 hidden h-5 w-[min(100%,68rem)] text-accent-2 paper:block">
      <path ref={path} className="pen-draw" d={D} pathLength="1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
