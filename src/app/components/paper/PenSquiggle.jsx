"use client";
import { useEffect, useRef } from "react";
import { BOOT_DONE_EVENT } from "@/lib/events";

const WAVES = [5, 7, 4, 6, 8, 5, 6, 4, 7, 5, 6, 5, 7, 4, 6, 5, 8, 5, 6, 4];
const STEP = 600 / WAVES.length;
const D = `M2 10 ${WAVES.map((a, i) => `Q ${(2 + STEP * (i + 0.5)).toFixed(1)} ${i % 2 ? 10 + a : 10 - a} ${(2 + STEP * (i + 1)).toFixed(1)} 10`).join(" ")}`;

export default function PenSquiggle() {
  const path = useRef(null);

  useEffect(() => {
    const el = path.current;
    const host = el?.closest("h1");
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let run = null;
    const redraw = () => {
      if (document.documentElement.dataset.pack !== "paper" || (run && run.playState === "running")) return;
      el.style.animation = "none";
      run = el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, easing: "cubic-bezier(0.6, 0, 0.3, 1)", fill: "forwards" });
    };
    host.addEventListener("pointerenter", redraw);
    window.addEventListener(BOOT_DONE_EVENT, redraw);
    return () => {
      host.removeEventListener("pointerenter", redraw);
      window.removeEventListener(BOOT_DONE_EVENT, redraw);
    };
  }, []);

  return (
    <svg aria-hidden viewBox="0 0 604 20" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-5 left-1 hidden h-5 w-[min(100%,68rem)] text-accent-2 paper:block">
      <path ref={path} className="pen-draw" d={D} pathLength="1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
