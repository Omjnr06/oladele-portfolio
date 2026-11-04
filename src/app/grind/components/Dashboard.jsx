"use client";
import { useMemo, useState } from "react";
import { HIERARCHY, RESPONDED, metaFor, rankOf } from "../lib/status";
import { Chip, Segmented } from "./Controls";
import { Pipeline } from "./Pipeline";
import { Heatmap } from "./Heatmap";
import { StatusMenu } from "./StatusMenu";
import { Ticker } from "./Ticker";

const btn = "h-10 rounded-lg border border-line px-4 text-sm text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Stat({ label, value, format, sub }) {
  return (
    <div>
      <dt className="font-mono text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-4xl font-semibold leading-none tracking-[-0.025em] text-fg">
        <Ticker value={value} format={format} />
        {sub && <span className="ml-2 align-middle font-mono text-xs font-normal tracking-normal text-muted">{sub}</span>}
      </dd>
    </div>
  );
}

export function Dashboard({ rows, error, loading, onRetry, onLock, onStatusChange, saving }) {
  const [picked, setPicked] = useState([]);
  const [sort, setSort] = useState("stage");
  const [limit, setLimit] = useState(25);
  const toggle = (s) => { setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s])); setLimit(25); };
  const only = (s) => { setPicked(s ? [s] : []); setLimit(25); };

  const { counts, total, responded } = useMemo(() => {
    const counts = {};
    for (const r of rows || []) counts[r.status || "No status"] = (counts[r.status || "No status"] || 0) + 1;
    const total = rows?.length || 0;
    const responded = (rows || []).filter((r) => RESPONDED.has(r.status)).length;
    return { counts, total, responded };
  }, [rows]);

  const list = useMemo(() => {
    const out = (rows || []).filter((r) => !picked.length || picked.includes(r.status || "No status"));
    const date = (r) => r.dateApplied || r.created || "";
    return out.sort((a, b) => (sort === "stage" ? rankOf(a.status) - rankOf(b.status) : 0) || date(b).localeCompare(date(a)));
  }, [rows, picked, sort]);
  const extra = Object.keys(counts).filter((s) => !HIERARCHY.includes(s));

  return (
    <section id="applications" aria-labelledby="dash-h" className="mt-24 scroll-mt-[calc(var(--controls-h,0px)+16px)] border-t border-line pt-12">
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2">{"// private · this device only"}</p>
          <h2 id="dash-h" tabIndex={-1} className="outline-none text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-fg">Your applications</h2>
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onRetry} className={btn}>Refresh</button>
          <button type="button" onClick={onLock} className={btn}>Lock this device</button>
        </div>
      </div>

      {error && <p className="py-4 text-sm text-red-300">Couldn&apos;t load applications: {error.replace(/\.$/, "")}. Check that NOTION_TOKEN and NOTION_DB_ID are set in Vercel, then refresh.</p>}
      {loading && !rows && (
        <div aria-hidden className="grid gap-6">
          <div className="h-16 w-2/3 animate-pulse rounded-[10px] bg-panel motion-reduce:animate-none" />
          <div className="h-3 animate-pulse rounded-[4px] bg-panel motion-reduce:animate-none" />
          <div className="h-32 animate-pulse rounded-[10px] bg-panel motion-reduce:animate-none" />
        </div>
      )}
      {rows && total === 0 && <p className="py-4 text-sm text-muted">Nothing logged yet. Open a role above and choose Mark applied, or press A on a focused row.</p>}

      {rows && total > 0 && (
        <div className="grid gap-12">
          <dl className="flex flex-wrap gap-x-12 gap-y-6">
            <Stat label="applications" value={total} />
            <Stat label="response rate" value={total ? (responded / total) * 100 : 0} format={(v) => `${Math.round(v)}%`} sub={`${responded} heard back`} />
            <Stat label="interviewing" value={counts.Interviewing || 0} />
            <Stat label="offers" value={counts.Offer || 0} />
          </dl>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-fg">Pipeline</h3>
            <Pipeline counts={counts} total={total} active={picked.length === 1 ? picked[0] : null} onSelect={only} />
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-fg">Activity <span className="ml-2 font-mono text-xs font-normal text-muted">last 26 weeks</span></h3>
            <Heatmap rows={rows} />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="text-sm font-semibold text-fg">{picked.length === 1 ? metaFor(picked[0]).label : picked.length ? "Filtered applications" : "All applications"} <span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted">{list.length}</span></h3>
              <div className="ml-auto">
                <Segmented id="appsort" label="Sort applications" value={sort} onChange={setSort}
                  options={[{ value: "stage", label: "By stage" }, { value: "newest", label: "Newest" }]} />
              </div>
            </div>
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by status">
              <Chip tone="private" active={!picked.length} onClick={() => only(null)} count={total}>All</Chip>
              {[...HIERARCHY, ...extra].map((s) => (
                <Chip key={s} tone="private" active={picked.includes(s)} count={counts[s] || 0} onClick={() => toggle(s)}>
                  <span aria-hidden className="mr-2 inline-block size-2 rounded-[2px] align-middle" style={{ background: metaFor(s).fill }} />
                  {metaFor(s).label}
                </Chip>
              ))}
            </div>
            <div className="rounded-[10px] border border-line">
              <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_7rem_13rem] gap-4 rounded-t-[10px] border-b border-line bg-panel px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted md:grid">
                <span>Company</span><span>Role</span><span>Applied</span><span className="text-right">Status</span>
              </div>
              <ul>
                {list.length === 0 && <li className="px-4 py-8 text-sm text-muted">No applications with {picked.length === 1 ? `status ${metaFor(picked[0]).label}` : "those statuses"}. <button type="button" onClick={() => only(null)} className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">Show all</button></li>}
                {list.slice(0, limit).map((a) => (
                  <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_7rem_13rem]">
                    <span className="truncate text-sm font-semibold text-fg">
                      {a.link ? <a href={a.link} target="_blank" rel="noopener noreferrer" className="transition-[color] duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">{a.company}</a> : a.company}
                    </span>
                    <span className="order-3 col-span-2 truncate text-sm text-fg/60 md:order-none md:col-span-1">{a.role || "—"}</span>
                    <span className="order-4 col-span-2 font-mono text-xs tabular-nums text-muted md:order-none md:col-span-1">{a.dateApplied || "—"}</span>
                    <span className="flex justify-end md:order-none">
                      <StatusMenu value={a.status} disabled={saving[a.id]} onChange={(s) => onStatusChange(a, s)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {list.length > limit && (
              <button type="button" onClick={() => setLimit((l) => l + 50)} className="mt-4 h-10 font-mono text-xs text-muted transition-[color] duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
                Show {Math.min(50, list.length - limit)} more · {list.length - limit} left
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
