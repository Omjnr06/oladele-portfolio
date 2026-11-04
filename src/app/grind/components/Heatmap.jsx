"use client";
import { useMemo, useState } from "react";
import { HEAT } from "../lib/status";

const WEEKS = 26;
const CELL = 12;
const GAP = 2;

export const dayKey = (d) => d.toLocaleDateString("en-CA");

export function appliedDay(row) {
  if (/^\d{4}-\d{2}-\d{2}/.test(row.dateApplied || "")) return row.dateApplied.slice(0, 10);
  return row.created ? dayKey(new Date(row.created)) : null;
}

const step = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4);

export function Heatmap({ rows }) {
  const [hover, setHover] = useState(null);
  const { weeks, months, stats } = useMemo(() => {
    const byDay = new Map();
    for (const r of rows) {
      const k = appliedDay(r);
      if (k) byDay.set(k, (byDay.get(k) || 0) + 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);
    const weeks = [];
    const months = [];
    for (let w = 0; w < WEEKS; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const k = dayKey(date);
        days.push({ k, date, n: date > today ? null : byDay.get(k) || 0 });
        if (date.getDate() === 1 || (w === 0 && d === 0)) months.push({ w, label: date.toLocaleDateString("en-US", { month: "short" }) });
      }
      weeks.push(days);
    }
    const count = (from, to) => {
      let n = 0;
      for (const [k, v] of byDay) if (k >= dayKey(from) && k <= dayKey(to)) n += v;
      return n;
    };
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(weekStart.getDate() - 1);
    const thirty = new Date(today);
    thirty.setDate(today.getDate() - 29);
    let streak = 0;
    const cur = new Date(today);
    if (!byDay.get(dayKey(cur))) cur.setDate(cur.getDate() - 1);
    while (byDay.get(dayKey(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
    return {
      weeks,
      months: months.filter((m, i) => m.w <= WEEKS - 3 && (i === 0 || m.w - months[i - 1].w >= 3)),
      stats: { thisWeek: count(weekStart, today), lastWeek: count(lastWeekStart, lastWeekEnd), thirty: count(thirty, today), streak },
    };
  }, [rows]);

  const width = WEEKS * (CELL + GAP) - GAP;

  return (
    <div className="grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
      <div className="relative max-w-full overflow-x-auto pb-1 [scrollbar-color:rgb(255_255_255/.15)_transparent] [scrollbar-width:thin]">
        <div className="relative ml-8" style={{ width }}>
          <div className="relative mb-2 h-4 font-mono text-[11px] text-muted">
            {months.map((m) => <span key={`${m.w}-${m.label}`} className="absolute" style={{ left: m.w * (CELL + GAP) }}>{m.label}</span>)}
          </div>
          <div className="absolute -left-8 top-6 grid font-mono text-[11px] leading-3 text-muted" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}>
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-flow-col" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: `${CELL}px`, gap: GAP }} onPointerLeave={() => setHover(null)}>
            {weeks.flat().map((c, i) => (
              <span key={c.k} aria-hidden
                onPointerEnter={() => c.n !== null && setHover({ ...c, x: Math.floor(i / 7) * (CELL + GAP), y: (i % 7) * (CELL + GAP) })}
                className="rounded-[2px]"
                style={{ background: c.n === null ? "transparent" : HEAT[step(c.n)], boxShadow: c.n === 0 ? "inset 0 0 0 1px rgb(255 255 255 / 0.04)" : undefined }} />
            ))}
          </div>
          {hover && (
            <div role="tooltip" className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-line-strong bg-panel-2 px-2 py-1 text-xs text-fg shadow-[0_8px_24px_-4px_rgb(0_0_0/.5)]"
              style={{ left: Math.min(Math.max(hover.x + CELL / 2, 56), width - 56), top: hover.y + 24 - 4 }}>
              <span className="font-semibold tabular-nums">{hover.n}</span> {hover.n === 1 ? "application" : "applications"}
              <span className="text-muted"> · {hover.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-end gap-1 font-mono text-[11px] text-muted">
            <span className="mr-1">Less</span>
            {HEAT.map((c) => <span key={c} aria-hidden className="size-3 rounded-[2px]" style={{ background: c }} />)}
            <span className="ml-1">More</span>
          </div>
        </div>
        <p className="sr-only">
          {stats.thisWeek} applications this week, {stats.lastWeek} last week, {stats.thirty} in the last 30 days, {stats.streak} day streak. The full list is below.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-1">
        {[["this week", stats.thisWeek, `vs ${stats.lastWeek} last week`], ["last 30 days", stats.thirty, null], ["streak", stats.streak, stats.streak === 1 ? "day" : "days"]].map(([label, v, sub]) => (
          <div key={label}>
            <dt className="font-mono text-xs text-muted">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums text-fg">{v}{sub && <span className="ml-2 font-mono text-xs font-normal text-muted">{sub}</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
