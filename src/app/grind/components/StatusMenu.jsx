"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STATUSES, metaFor } from "../lib/status";

export function StatusMenu({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const root = useRef(null);
  const btn = useRef(null);
  const listId = useId();
  const m = metaFor(value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open) root.current?.querySelectorAll("[role=option]")[idx]?.focus();
  }, [open, idx]);

  const show = () => { setIdx(Math.max(0, STATUSES.indexOf(value))); setOpen(true); };
  const pick = (s) => { setOpen(false); btn.current?.focus(); if (s !== value) onChange(s); };

  const onKey = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); show(); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => (i + 1) % STATUSES.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => (i - 1 + STATUSES.length) % STATUSES.length); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(STATUSES[idx]); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className="relative" onKeyDown={onKey}>
      <button ref={btn} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        onClick={() => (open ? setOpen(false) : show())}
        className={`flex h-8 items-center gap-2 rounded-md border border-line px-2 font-mono text-xs transition-[border-color,background-color,transform] duration-150 hover:border-line-strong active:scale-[0.97] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${m.ink}`}>
        <span aria-hidden className="size-2 rounded-[2px]" style={{ background: m.fill }} />
        {m.label}
        <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul id={listId} role="listbox" aria-label="Change status"
            initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -2, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 550, damping: 38 }}
            className="absolute right-0 top-full z-30 mt-2 w-56 origin-top-right rounded-[10px] border border-line-strong bg-panel-2 p-1 shadow-[0_2px_4px_rgb(0_0_0/.3),0_16px_48px_-8px_rgb(0_0_0/.6)]">
            {STATUSES.map((s, i) => {
              const sm = metaFor(s);
              return (
                <li key={s} role="option" aria-selected={s === value} tabIndex={-1}
                  onClick={() => pick(s)} onPointerEnter={() => setIdx(i)}
                  className={`flex h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm outline-none ${i === idx ? "bg-white/[0.06]" : ""} ${s === value ? "text-fg" : "text-fg/70"}`}>
                  <span aria-hidden className="size-2 rounded-[2px]" style={{ background: sm.fill }} />
                  {sm.label}
                  {s === value && <svg aria-hidden className="ml-auto text-accent" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
