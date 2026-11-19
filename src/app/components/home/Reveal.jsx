"use client";
import { useEffect, useRef } from "react";

export default function Reveal({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || navigator.webdriver || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (location.hash || el.getBoundingClientRect().top < innerHeight) return;
    el.dataset.armed = "";
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.dataset.in = "";
        timer = setTimeout(() => {
          delete el.dataset.armed;
          delete el.dataset.in;
        }, 1000);
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      delete el.dataset.armed;
      delete el.dataset.in;
    };
  }, []);

  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
