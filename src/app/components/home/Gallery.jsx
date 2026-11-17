"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Gallery({ images }) {
  const count = images.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % count]));

  const show = (i) => {
    const idx = (i + count) % count;
    setCurrent(idx);
    setLoaded((prev) => {
      const next = (idx + 1) % count;
      if (prev.has(idx) && prev.has(next)) return prev;
      return new Set([...prev, idx, next]);
    });
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => show(current + 1), 5000);
    return () => clearInterval(t);
  });

  return (
    <motion.div
      className="mb-32 relative w-full h-[450px] md:h-[clamp(420px,calc(100svh-8rem),550px)] border border-bright/10 bg-ink rounded-xl overflow-hidden group shadow-2xl cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset }) => {
        if (offset.x < -50) show(current + 1);
        else if (offset.x > 50) show(current - 1);
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${current === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {loaded.has(index) && (
            <Image
              src={image.src}
              alt={`Gallery snapshot ${index + 1}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1200px"
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-bright)_2%,transparent)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />

      <button aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); show(current - 1); }} className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-scrim/40 text-bright backdrop-blur-md border border-bright/10 transition duration-300 hover:bg-scrim/70 hover:scale-110 ${paused ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button aria-label="Next photo" onClick={(e) => { e.stopPropagation(); show(current + 1); }} className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-scrim/40 text-bright backdrop-blur-md border border-bright/10 transition duration-300 hover:bg-scrim/70 hover:scale-110 ${paused ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-scrim/80 to-transparent z-20 flex items-end justify-center pb-6 pointer-events-none">
        <div className="flex gap-2">
          {images.map((image, idx) => (
            <button
              key={image.id}
              aria-label={`Show photo ${idx + 1}`}
              onClick={(e) => { e.stopPropagation(); show(idx); }}
              className={`h-1.5 rounded-full transition-[width,background-color,box-shadow,opacity] duration-500 pointer-events-auto ${current === idx ? "w-8 md:w-10 bg-bright shadow-[0_0_10px_color-mix(in_srgb,var(--color-bright)_50%,transparent)]" : "w-2 bg-bright/30 hover:bg-bright/60"}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
