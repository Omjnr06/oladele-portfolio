"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import useTopTracks, { spotifyUrl, useSong } from "@/app/music/hooks/useTopTracks";
import { SpotifyGlyph } from "./OnRepeat";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Row({ track, live }) {
  const s = useSong(track);
  return (
    <li>
      <a
        href={spotifyUrl(track.id)}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex min-h-12 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-bright/5 ${focus}`}
      >
        {live && <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted">{track.rank + 1}</span>}
        <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-panel-2 paper:rounded-none paper:shadow-[0_1px_2px_rgb(0_0_0/0.2)]">
          {s?.thumb && <img src={s.thumb} alt="" loading="lazy" className="size-full object-cover" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">{s?.title || "Spotify track"}</span>
          {s?.artist && <span className="block truncate text-xs text-muted">{s.artist}</span>}
        </span>
      </a>
    </li>
  );
}

export default function OnRepeatModal({ onClose }) {
  const top = useTopTracks();
  const reduce = useReducedMotion();
  const panel = useRef(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const live = !!top?.live;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-scrim/60" />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="on-repeat-title"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 38 }}
        className="relative flex max-h-[min(640px,88vh)] w-full max-w-sm flex-col rounded-xl border border-line-strong bg-panel shadow-[0_2px_4px_rgb(0_0_0/.3),0_16px_48px_-8px_rgb(0_0_0/.6)] outline-none paper:rounded-sm paper:bg-ink paper:shadow-[0_2px_6px_rgb(60_40_10/.18),0_24px_48px_-16px_rgb(60_40_10/.35)]"
      >
        <div className="flex items-start gap-3 px-4 pb-2 pt-4">
          <SpotifyGlyph className="mt-0.5 h-5 w-5 shrink-0 text-[#1DB954]" />
          <div className="min-w-0 flex-1">
            <h2 id="on-repeat-title" className="text-base font-semibold text-fg paper:font-hand paper:text-2xl paper:font-normal paper:leading-none">
              On repeat
            </h2>
            <p className="mt-1 text-xs text-muted">{!top ? "Loading…" : live ? "My top 10 on Spotify, last 4 weeks" : "A few songs from my playlist"}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={`grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-[background-color,color,transform] duration-150 hover:bg-bright/5 hover:text-fg active:scale-95 ${focus}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <ol className="min-h-0 overflow-y-auto px-2 pb-3">
          {top?.tracks.map((t) => (
            <Row key={t.id} track={t} live={live} />
          ))}
        </ol>
      </motion.div>
    </div>,
    document.body,
  );
}
