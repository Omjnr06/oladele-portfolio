"use client";
import { useMemo, useState } from "react";

const STATUS_TONE = {
  Applied: "text-[#c4b5fd]",
  Interview: "text-accent",
  Interviewing: "text-accent",
  Offer: "text-emerald-300",
  Rejected: "text-muted",
};

export function AppliedPanel({ rows, error, loading, onRetry, onLock }) {
  const [limit, setLimit] = useState(25);
  const counts = useMemo(() => {
    const m = new Map();
    (rows || []).forEach((r) => m.set(r.status || "No status", (m.get(r.status || "No status") || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <section aria-labelledby="applied-h" className="mt-24 border-t border-line pt-12">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2">{"// private · this device only"}</p>
          <h2 id="applied-h" className="text-2xl font-semibold tracking-[-0.015em] text-fg">Applications</h2>
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onRetry} className="h-10 rounded-lg border border-line px-4 text-sm text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Refresh
          </button>
          <button type="button" onClick={onLock} className="h-10 rounded-lg border border-line px-4 text-sm text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Lock this device
          </button>
        </div>
      </div>

      {error && <p className="py-4 text-sm text-red-300">Couldn&apos;t load applications: {error.replace(/\.$/, "")}. Check that NOTION_TOKEN and NOTION_DB_ID are set in Vercel, then refresh.</p>}
      {loading && !rows && <div className="h-48 animate-pulse rounded-[10px] border border-line bg-panel motion-reduce:animate-none" />}
      {rows && rows.length === 0 && <p className="py-4 text-sm text-muted">Nothing logged yet. Open a role above and choose Mark applied.</p>}

      {rows && rows.length > 0 && (
        <>
          <dl className="mb-6 flex flex-wrap gap-x-8 gap-y-2">
            <div><dt className="font-mono text-xs text-muted">total</dt><dd className="text-2xl font-semibold tabular-nums text-fg">{rows.length}</dd></div>
            {counts.map(([s, n]) => (
              <div key={s}><dt className="font-mono text-xs text-muted">{s.toLowerCase()}</dt><dd className={`text-2xl font-semibold tabular-nums ${STATUS_TONE[s] || "text-fg"}`}>{n}</dd></div>
            ))}
          </dl>
          <div className="overflow-hidden rounded-[10px] border border-line">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_8rem_7rem] gap-4 border-b border-line bg-panel px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted md:grid">
              <span>Company</span><span>Role</span><span>Status</span><span>Applied</span>
            </div>
            <ul>
              {rows.slice(0, limit).map((a) => (
                <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_8rem_7rem] md:items-center">
                  <span className="truncate text-sm font-semibold text-fg">
                    {a.link ? <a href={a.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">{a.company}</a> : a.company}
                  </span>
                  <span className="order-3 col-span-2 truncate text-sm text-fg/60 md:order-none md:col-span-1">{a.role || "—"}</span>
                  <span className={`text-right font-mono text-xs md:text-left ${STATUS_TONE[a.status] || "text-fg/70"}`}>{a.status || "—"}</span>
                  <span className="hidden font-mono text-xs tabular-nums text-muted md:block">{a.dateApplied || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
          {rows.length > limit && (
            <button type="button" onClick={() => setLimit((l) => l + 50)} className="mt-4 h-10 font-mono text-xs text-muted transition-[color] duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
              Show {Math.min(50, rows.length - limit)} more · {rows.length - limit} left
            </button>
          )}
        </>
      )}
    </section>
  );
}
