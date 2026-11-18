"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PACKS, THEMES } from "@/lib/themes";
import { applyTheme, setPrefs, usePrefs } from "@/lib/prefs";
import { themeTransition } from "@/lib/themeTransition";
import { isHandheld } from "@/lib/device";
import { track } from "@/lib/track";

const spring = { type: "spring", stiffness: 520, damping: 38 };

function Swatch({ colors }) {
  return (
    <span aria-hidden className="relative flex size-6 overflow-hidden rounded-full border border-line-strong">
      {colors.map((c) => (
        <span key={c} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

export default function ThemeChooser() {
  const prefs = usePrefs();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const handheld = isHandheld();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    panelRef.current?.querySelector("[aria-checked='true'], button:not([disabled])")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const choose = (e, patch) => themeTransition(e, () => setPrefs(patch));
  const preview = (variant) => applyTheme({ pack: prefs.pack, variant });
  const endPreview = () => applyTheme(prefs);

  const onVariantKeys = (e, list, index) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = list[(index + step + list.length) % list.length];
    e.currentTarget.parentElement.querySelector(`[data-variant='${next.id}']`)?.focus();
  };

  return (
    <div className="fixed bottom-6 left-16 z-50 md:bottom-8 md:left-28">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label="Choose a theme"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.12, ease: "easeIn" } }}
            transition={reduce ? { duration: 0.15 } : spring}
            style={{ transformOrigin: "bottom left" }}
            className="absolute bottom-full left-0 mb-3 w-[min(320px,calc(100vw-96px))] rounded-xl border border-line-strong bg-panel p-2 shadow-[0_2px_4px_rgb(0_0_0/.3),0_16px_48px_-8px_rgb(0_0_0/.6)]"
          >
            <p className="px-2 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Theme</p>
            <ul className="flex flex-col gap-1">
              {PACKS.map((pack) => {
                const ready = !!THEMES[pack.id];
                const blocked = pack.desktopOnly && handheld;
                const selected = prefs.pack === pack.id;
                const variants = THEMES[pack.id]?.variants ?? [];
                const note = !ready ? "In progress" : blocked ? "Desktop only" : null;
                return (
                  <li key={pack.id} className={`rounded-lg border ${selected ? "border-accent/40 bg-accent/5" : "border-transparent"}`}>
                    <button
                      type="button"
                      disabled={!ready || blocked}
                      aria-pressed={selected}
                      onClick={(e) => { if (selected) return; track("pack_selected", pack.id); choose(e, { pack: pack.id, variant: variants[0]?.id }); }}
                      className="flex min-h-11 w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-[background-color,transform] duration-150 enabled:hover:bg-bright/5 enabled:active:scale-[0.98] disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span className="flex-1">
                        <span className={`block text-sm font-medium ${ready && !blocked ? "text-fg" : "text-muted"}`}>{pack.label}</span>
                        <span className="block text-xs leading-relaxed text-muted">{pack.blurb}</span>
                      </span>
                      {note && <span className="mt-0.5 shrink-0 rounded border border-line px-1.5 font-mono text-[11px] leading-5 text-muted">{note}</span>}
                    </button>
                    {selected && variants.length > 0 && (
                      <div role="radiogroup" aria-label={`${pack.label} colours`} className="flex flex-wrap gap-2 px-3 pb-3 pt-1" onPointerLeave={endPreview}>
                        {variants.map((v, i) => {
                          const on = prefs.variant === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              aria-label={v.label}
                              title={v.label}
                              data-variant={v.id}
                              tabIndex={on ? 0 : -1}
                              onPointerEnter={() => preview(v.id)}
                              onFocus={() => preview(v.id)}
                              onBlur={endPreview}
                              onKeyDown={(e) => onVariantKeys(e, variants, i)}
                              onClick={(e) => { if (on) return; track("variant_selected", v.id); choose(e, { variant: v.id }); }}
                              className={`flex size-10 items-center justify-center rounded-full border transition-[border-color,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${on ? "border-accent" : "border-transparent hover:border-line-strong"}`}
                            >
                              <Swatch colors={v.swatch} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Theme"
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-full border border-line-strong bg-panel text-fg/70 transition-[color,border-color,transform] duration-150 hover:border-accent/40 hover:text-fg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
