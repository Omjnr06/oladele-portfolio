"use client";
import { useEffect, useRef } from "react";

const SIZE = 360;

export default function DotGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!host || navigator.webdriver || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
    };
    const move = (e) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.dataset.on = "";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => delete el.dataset.on;
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} aria-hidden className="dot-glow" style={{ "--s": `${SIZE}px` }} />;
}
