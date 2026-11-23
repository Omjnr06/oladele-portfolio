"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function useOffscreenPause(ref, reduce) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => {
      el.querySelectorAll("video").forEach((v) => {
        if (!entry.isIntersecting) v.pause();
        else if (!reduce) v.play().catch(() => {});
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, reduce]);
}

const nav = "grid size-10 place-items-center rounded-full text-bright transition-[opacity,background-color,transform] duration-150 hover:bg-scrim/60 active:scale-95 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const Arrow = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export default function MusicSpotlight({ tracks, role }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const boxRef = useRef(null);
  useOffscreenPause(boxRef, reduce);
  const n = tracks.length;

  useEffect(() => {
    if (hovered || n <= 1) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % n), 12000);
    return () => clearInterval(t);
  }, [n, hovered]);

  const t = tracks[index];
  if (!t) return null;

  return (
    <div
      ref={boxRef}
      id="spotlight"
      data-surface="media"
      className="paper-print group relative h-full min-h-[260px] w-full lg:min-h-0 overflow-hidden rounded-xl border border-bright/10 bg-ink shadow-2xl scroll-mt-24"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={t.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {reduce ? (
            <video src={`${t.loop ?? t.videoUrl}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover opacity-80" />
          ) : (
            <video src={t.loop ?? t.videoUrl} preload="metadata" autoPlay muted loop playsInline className="h-full w-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-scrim/90 via-scrim/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
            <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2 [@media(max-height:760px)]:hidden">
              <span className="h-2 w-2 rounded-full bg-err animate-pulse" aria-hidden />
              Live session
            </p>
            <h3 className="text-[clamp(1.25rem,3.4vh,2rem)] font-bold leading-tight tracking-tight text-bright">{t.title}</h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-bright/70 [@media(max-height:760px)]:hidden">Original by {t.originalArtist}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/music?track=${t.id}`}
                className="inline-flex h-10 items-center rounded-lg border border-accent-2/40 bg-accent-2/15 px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2 transition-[background-color,transform] duration-150 hover:bg-accent-2/25 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Open the Music Vault
              </Link>
              {role && (
                <p className="text-sm text-bright/80">
                  <span className="text-bright/60">Currently: </span>
                  {role.role}, {role.company.split(",")[0]}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {n > 1 && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1">
          <button type="button" aria-label="Previous clip" onClick={() => setIndex((p) => (p - 1 + n) % n)} className={`${nav} ${hovered ? "opacity-100" : "opacity-0 max-lg:opacity-100"}`}>
            <Arrow d="M15 18l-6-6 6-6" />
          </button>
          <div className="flex items-center gap-2 px-1">
            {tracks.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show clip ${i + 1}`}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${index === i ? "w-8 bg-accent-2" : "w-2 bg-bright/30 hover:bg-bright/60"}`}
              />
            ))}
          </div>
          <button type="button" aria-label="Next clip" onClick={() => setIndex((p) => (p + 1) % n)} className={`${nav} ${hovered ? "opacity-100" : "opacity-0 max-lg:opacity-100"}`}>
            <Arrow d="M9 18l6-6-6-6" />
          </button>
        </div>
      )}
    </div>
  );
}
