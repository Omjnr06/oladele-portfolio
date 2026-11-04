"use client";
import { motion } from "framer-motion";
import { STATUSES, metaFor } from "../lib/status";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Pipeline({ counts, total, active, onSelect }) {
  const order = [...STATUSES, ...Object.keys(counts).filter((s) => !STATUSES.includes(s))];
  const present = order.filter((s) => counts[s]);
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px]" role="img" aria-label={present.map((s) => `${metaFor(s).label} ${counts[s]}`).join(", ")}>
        {present.map((s) => (
          <motion.button key={s} type="button" layout onClick={() => onSelect(active === s ? null : s)} aria-hidden tabIndex={-1}
            title={`${metaFor(s).label}: ${counts[s]}`}
            style={{ flexGrow: counts[s], flexBasis: 0, minWidth: 8, background: metaFor(s).fill }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={`h-full first:rounded-l-[4px] last:rounded-r-[4px] transition-opacity duration-150 ${active && active !== s ? "opacity-30" : "opacity-100"}`} />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {order.filter((s) => counts[s] || STATUSES.includes(s)).map((s) => {
          const m = metaFor(s);
          const n = counts[s] || 0;
          const on = active === s;
          return (
            <li key={s}>
              <button type="button" aria-pressed={on} disabled={!n} onClick={() => onSelect(on ? null : s)}
                className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-[border-color,background-color,transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-40 ${focusRing} ${on ? "border-accent-2/60 bg-accent-2/10" : "border-line hover:border-line-strong"}`}>
                <span aria-hidden className="size-2 rounded-[2px]" style={{ background: m.fill }} />
                <span className="text-fg/80">{m.label}</span>
                <span className="font-mono text-xs tabular-nums text-fg">{n}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted">{total ? Math.round((n / total) * 100) : 0}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
