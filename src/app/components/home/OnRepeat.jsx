"use client";
import { useRef, useState } from "react";
import { loadTopTracks } from "@/app/music/hooks/useTopTracks";

export const SpotifyGlyph = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.11a.62.62 0 0 1 .21.86zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.98-1.16a.78.78 0 1 1-.45-1.49c3.63-1.1 8.14-.57 11.24 1.32a.78.78 0 0 1 .26 1.07zm.1-2.85C14.83 8.98 9.4 8.8 6.3 9.74a.93.93 0 1 1-.54-1.78c3.56-1.08 9.56-.87 13.33 1.37a.93.93 0 1 1-.95 1.6z" />
  </svg>
);

let modalPromise = null;
const loadModal = () => (modalPromise ??= import("./OnRepeatModal").then((m) => m.default));

export default function OnRepeat() {
  const trigger = useRef(null);
  const [Modal, setModal] = useState(null);
  const [open, setOpen] = useState(false);

  const warm = () => {
    loadTopTracks();
    loadModal();
  };

  const show = () => {
    warm();
    Promise.all([loadModal(), loadTopTracks()]).then(([M]) => {
      setModal(() => M);
      setOpen(true);
    });
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onPointerEnter={warm}
        onFocus={warm}
        onClick={show}
        aria-haspopup="dialog"
        className="-my-3 inline-flex h-10 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent paper:font-hand paper:text-lg paper:normal-case paper:tracking-normal"
      >
        <SpotifyGlyph className="h-4 w-4" />
        On repeat
      </button>
      {open && Modal && (
        <Modal
          onClose={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
        />
      )}
    </>
  );
}
