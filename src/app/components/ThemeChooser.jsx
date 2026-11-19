"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PACKS, THEMES } from "@/lib/themes";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { themeTransition } from "@/lib/themeTransition";
import { isHandheld } from "@/lib/device";
import { track } from "@/lib/track";

const WIDTH = 320;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

let statsPromise = null;
const loadStats = () =>
  (statsPromise ??= fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null));

function place(a) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(WIDTH, vw - 32);
  const clampLeft = (x) => Math.max(16, Math.min(x, vw - w - 16));
  if (a.left < 120 && a.top > vh / 2) return { style: { left: a.right + 12, bottom: vh - a.bottom, width: w }, origin: "bottom left" };
  if (a.top < vh / 2) return { style: { left: clampLeft(a.right - w), top: a.bottom + 12, width: w }, origin: "top right" };
  return { style: { left: clampLeft(a.right - w), bottom: vh - a.top + 12, width: w }, origin: "bottom right" };
}

function Swatch({ colors }) {
  return (
    <span aria-hidden className="relative flex size-6 overflow-hidden rounded-full border border-line-strong">
      {colors.map((c) => (
        <span key={c} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

export default function ThemeMenu({ anchor, triggerRef, onClose }) {
  const prefs = usePrefs();
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const [popular, setPopular] = useState(null);
  const [{ style, origin }] = useState(() => place(anchor));
  const handheld = isHandheld();
  const variants = THEMES[prefs.pack]?.variants ?? [];

  useEffect(() => {
    let alive = true;
    loadStats().then((s) => {
      const top = s && Object.entries(s.variants ?? {}).sort((a, b) => b[1] - a[1])[0];
      if (alive && top && top[1] >= 10) setPopular(top[0]);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
      triggerRef.current?.focus();
    };
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      onClose();
    };
    const onResize = () => onClose();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    panelRef.current?.querySelector("[aria-checked='true'], button:not([disabled])")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose, triggerRef]);

  const choose = (e, patch) => themeTransition(e, () => setPrefs(patch));

  const onVariantKeys = (e, index) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = variants[(index + step + variants.length) % variants.length];
    e.currentTarget.parentElement.querySelector(`[data-variant='${next.id}']`)?.focus();
  };

  const current = variants.find((v) => v.id === prefs.variant);
  const popularLabel = variants.find((v) => v.id === popular)?.label;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label="Choose a theme"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 38 }}
      style={{ ...style, transformOrigin: origin }}
      className="fixed z-[60] rounded-xl border border-line-strong bg-panel p-2 shadow-[0_2px_4px_rgb(0_0_0/.3),0_16px_48px_-8px_rgb(0_0_0/.6)]"
    >
      <p className="px-2 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Theme</p>
      <ul className="flex flex-col gap-1">
        {PACKS.map((pack) => {
          const ready = !!THEMES[pack.id];
          const blocked = pack.desktopOnly && handheld;
          const selected = prefs.pack === pack.id;
          const note = !ready ? "In progress" : blocked ? "Desktop only" : null;
          return (
            <li key={pack.id} className={`rounded-lg border ${selected ? "border-accent/40 bg-accent/5" : "border-transparent"}`}>
              <button
                type="button"
                disabled={!ready || blocked}
                aria-pressed={selected}
                onClick={(e) => {
                  if (selected) return;
                  track("pack_selected", pack.id);
                  choose(e, { pack: pack.id, variant: THEMES[pack.id].variants[0]?.id });
                }}
                className={`flex min-h-11 w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-[background-color,transform] duration-150 enabled:hover:bg-bright/5 enabled:active:scale-[0.98] disabled:cursor-not-allowed ${focus}`}
              >
                <span className="flex-1">
                  <span className={`block text-sm font-medium ${ready && !blocked ? "text-fg" : "text-muted"}`}>{pack.label}</span>
                  {pack.blurb && <span className="block text-xs leading-relaxed text-muted">{pack.blurb}</span>}
                </span>
                {note && <span className="mt-0.5 shrink-0 rounded border border-line px-1.5 font-mono text-[11px] leading-5 text-muted">{note}</span>}
              </button>
              {selected && variants.length > 1 && (
                <div className="px-3 pb-3 pt-1">
                  <div role="radiogroup" aria-label={`${pack.label} colours`} className="flex flex-wrap gap-1">
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
                          onKeyDown={(e) => onVariantKeys(e, i)}
                          onClick={(e) => {
                            if (on) return;
                            track("variant_selected", v.id);
                            choose(e, { variant: v.id });
                          }}
                          className={`flex size-10 items-center justify-center rounded-full border transition-[border-color,transform] duration-150 active:scale-95 ${focus} ${on ? "border-accent" : "border-transparent hover:border-line-strong"}`}
                        >
                          <Swatch colors={v.swatch} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    <span className="text-fg">{current?.label}</span>
                    {popularLabel && <span>{popularLabel === current?.label ? " is the most picked" : `. Most picked: ${popularLabel}`}</span>}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-2 border-t border-line px-2 pb-1 pt-3 max-md:hidden">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Navigation</p>
        <div role="radiogroup" aria-label="Navigation style" className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line p-1">
          {[
            ["rail", "Side rail"],
            ["pill", "Top bar"],
          ].map(([id, label]) => {
            const on = prefs.navMode === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  if (on) return;
                  onClose();
                  setPrefs({ navMode: id });
                }}
                className={`h-9 rounded-md text-sm transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${focus} ${on ? "bg-accent/10 text-accent" : "text-muted hover:text-fg"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
