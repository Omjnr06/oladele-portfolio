"use client";
import { forwardRef } from "react";
import { motion } from "framer-motion";

const spring = { type: "spring", stiffness: 550, damping: 38, mass: 0.8 };
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Segmented({ id, options, value, onChange, label }) {
  const onKey = (e) => {
    const i = options.findIndex((o) => o.value === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const o = options[(next + options.length) % options.length];
    onChange(o.value);
    e.currentTarget.querySelector(`[data-value="${o.value}"]`)?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="inline-flex shrink-0 gap-1 rounded-lg border border-line bg-panel p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={active} tabIndex={active ? 0 : -1} data-value={o.value}
            onClick={() => onChange(o.value)}
            className={`relative h-8 rounded-md px-2 text-sm sm:px-3 font-medium transition-[color,transform] duration-150 active:scale-[0.97] ${focusRing} ${active ? "text-ink" : "text-muted hover:text-fg"}`}>
            {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-md bg-accent" transition={spring} />}
            <span className="relative whitespace-nowrap">
              {o.label}
              {o.count != null && <span className={`ml-2 hidden font-mono sm:inline text-[11px] tabular-nums ${active ? "text-ink/70" : "text-muted/80"}`}>{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children, count, tone = "accent" }) {
  const on = tone === "accent" ? "border-accent/50 bg-accent/10 text-accent" : "border-accent-2/50 bg-accent-2/10 text-[#c4b5fd]";
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-sm transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97] ${focusRing} ${active ? on : "border-line bg-panel text-muted hover:border-line-strong hover:text-fg"}`}>
      {children}
      {count != null && <span className="ml-2 font-mono text-[11px] tabular-nums opacity-70">{count}</span>}
    </button>
  );
}

export function Select({ value, onChange, options, label }) {
  return (
    <label className="relative inline-flex shrink-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`h-10 appearance-none rounded-lg border border-line bg-panel pl-3 pr-8 text-sm text-fg transition-[border-color] duration-150 hover:border-line-strong ${focusRing}`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}{o.count != null ? ` · ${o.count}` : ""}</option>)}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
    </label>
  );
}

export const Search = forwardRef(function Search({ value, onChange, shortcut, id, label = "Search roles", placeholder = "Company, role or city" }, ref) {
  return (
    <label className="relative flex min-w-0 basis-full items-center md:basis-0 md:flex-1">
      <span className="sr-only">{label}</span>
      <svg aria-hidden className="pointer-events-none absolute left-3 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={ref} id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-line bg-panel pl-8 pr-12 text-base text-fg placeholder:text-muted/70 transition-[border-color] duration-150 hover:border-line-strong md:text-sm ${focusRing}`} />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search"
          className={`absolute right-2 flex size-8 items-center justify-center rounded-md text-muted hover:text-fg ${focusRing}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-3 hidden rounded md:block border border-line px-2 font-mono text-[11px] text-muted">/</kbd>
      ) : null}
    </label>
  );
});
