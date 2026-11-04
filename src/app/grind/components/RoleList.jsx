"use client";
import { memo, useState } from "react";
import { Kbd } from "./Kbd";
import { DAY, ago } from "../lib/filters";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent";

function ageTone(seen, now) {
  const a = now - seen;
  if (a < DAY) return "text-accent";
  if (a < 7 * DAY) return "text-accent/70";
  return "text-muted";
}

function placeLabel(r) {
  const named = r.regions.filter((g) => g !== "Elsewhere");
  return named.length ? named.slice(0, 2).join(" · ") + (named.length > 2 ? ` +${named.length - 2}` : "") : r.location || "—";
}

function Chevron({ open }) {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className={`shrink-0 text-muted transition-transform duration-200 ease-out-soft ${open ? "rotate-90" : ""}`}><path d="m9 6 6 6-6 6" /></svg>
  );
}

function Expand({ open, children }) {
  return (
    <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out-soft motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={!open}>
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export const RoleRow = memo(function RoleRow({ role: r, now, since, open, onToggle, owner, applied, onMark, onUndo, onCopy, nested }) {
  const isNew = since && r.seen > since;
  return (
    <li className="border-b border-line last:border-b-0 [contain-intrinsic-size:auto_48px] [content-visibility:auto]">
      <div className="flex items-stretch">
        <button type="button" data-nav data-row={r.id} aria-expanded={open} onClick={() => onToggle(r.id)}
          className={`group flex min-h-12 min-w-0 flex-1 items-center gap-3 py-2 text-left transition-[background-color] duration-150 hover:bg-white/[0.025] active:bg-white/[0.04] ${nested ? "pl-8" : "pl-4"} pr-2 ${focusRing}`}>
          <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${isNew ? "bg-accent" : "bg-transparent"}`} />
          <span className="grid min-w-0 flex-1 gap-1 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,9rem)_5.5rem] md:items-center md:gap-4">
            <span className="flex min-w-0 items-center gap-2">
              <span className={`truncate text-sm font-semibold ${applied ? "text-fg/60" : "text-fg"}`}>{r.company}</span>
              {r.tier === "A" && <span className="shrink-0 rounded border border-line-strong px-1 font-mono text-[11px] leading-4 text-muted">top</span>}
              {r.track === "pm" && <span className="shrink-0 rounded border border-line-strong px-1 font-mono text-[11px] leading-4 text-muted">pm</span>}
              {applied && <span className="shrink-0 rounded border border-accent-2/40 px-1 font-mono text-[11px] leading-4 text-[#c4b5fd]">applied</span>}
            </span>
            <span className={`line-clamp-2 text-sm md:line-clamp-none md:truncate ${applied ? "text-fg/40" : "text-fg/70"}`}>{r.title}</span>
            <span className="truncate font-mono text-[11px] text-muted md:text-xs">{placeLabel(r)}</span>
            <span className="hidden truncate font-mono text-xs text-muted md:block">{r.season === "Unspecified" ? "—" : r.season}</span>
          </span>
          <span className={`w-12 shrink-0 text-right font-mono text-xs tabular-nums ${ageTone(r.seen, now)}`} title={new Date(r.seen).toLocaleString()} suppressHydrationWarning>{ago(r.seen, now)}</span>
          <Chevron open={open} />
        </button>
        <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${r.company} posting in a new tab`}
          className={`flex w-12 shrink-0 items-center justify-center text-muted transition-[color,background-color] duration-150 hover:bg-white/[0.025] hover:text-accent ${focusRing}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M8 7h9v9" /></svg>
        </a>
      </div>
      <Expand open={open}>
        <div className={`flex flex-col gap-4 pb-4 pr-4 pt-1 md:flex-row md:items-end md:justify-between ${nested ? "pl-12" : "pl-8"}`}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="font-mono text-xs leading-5 text-muted">role</dt><dd className="text-fg/90">{r.title}</dd>
            <dt className="font-mono text-xs leading-5 text-muted">where</dt><dd className="text-fg/80">{r.location || "Not listed"}</dd>
            <dt className="font-mono text-xs leading-5 text-muted">term</dt><dd className="text-fg/80">{r.season === "Unspecified" ? "Not listed" : r.season}</dd>
            <dt className="font-mono text-xs leading-5 text-muted">found</dt><dd className="text-fg/80" suppressHydrationWarning>{new Date(r.seen).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} <span className="text-muted">via {r.source}</span></dd>
          </dl>
          <div className="flex shrink-0 flex-wrap gap-2">
            {owner ? (
              applied ? (
                applied.id && !applied.pending ? (
                  <button type="button" onClick={() => onUndo(r)} className={`h-10 rounded-lg border border-line px-4 text-sm text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] ${focusRing}`}>
                    Unmark applied
                  </button>
                ) : (
                  <span className="flex h-10 items-center rounded-lg border border-accent-2/30 px-4 text-sm text-[#c4b5fd]">{applied.pending ? "Saving…" : `Applied ${applied.dateApplied || ""}`}</span>
                )
              ) : (
                <button type="button" onClick={() => onMark(r)} className={`h-10 rounded-lg border border-accent-2/40 px-4 text-sm text-[#c4b5fd] transition-[background-color,transform] duration-150 hover:bg-accent-2/10 active:scale-[0.97] ${focusRing}`}>
                  Mark applied<span aria-hidden className="ml-1 hidden md:inline-flex"><Kbd>a</Kbd></span>
                </button>
              )
            ) : (
              <button type="button" onClick={() => onCopy(r)} className={`h-10 rounded-lg border border-line px-4 text-sm text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] ${focusRing}`}>
                Copy link<span aria-hidden className="ml-1 hidden md:inline-flex"><Kbd>c</Kbd></span>
              </button>
            )}
            <a href={r.url} target="_blank" rel="noopener noreferrer" className={`flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97] ${focusRing}`}>
              Open posting
              <span aria-hidden className="hidden md:inline-flex"><kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-ink/30 px-1 font-mono text-[11px] leading-none text-ink/80">o</kbd></span>
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </a>
          </div>
        </div>
      </Expand>
    </li>
  );
});

function RowList({ roles, nested, ctx }) {
  return (
    <ul>
      {roles.map((r) => (
        <RoleRow key={r.id} role={r} nested={nested} open={ctx.openId === r.id} applied={ctx.appliedFor(r)}
          now={ctx.now} since={ctx.since} owner={ctx.owner} onToggle={ctx.onToggle} onMark={ctx.onMark} onUndo={ctx.onUndo} onCopy={ctx.onCopy} />
      ))}
    </ul>
  );
}

function Rollup({ label, count, sub, open, onToggle, children, top }) {
  const muted = count == null;
  return (
    <li className="border-b border-line last:border-b-0">
      <button type="button" data-nav aria-expanded={open} onClick={onToggle}
        className={`flex min-h-12 w-full items-center gap-3 py-2 pl-4 pr-4 text-left transition-[background-color] duration-150 hover:bg-white/[0.025] active:bg-white/[0.04] ${focusRing}`}>
        <span aria-hidden className="size-1.5 shrink-0" />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`truncate text-sm ${muted ? "text-muted" : "font-semibold text-fg"}`}>{label}</span>
          {top && <span className="shrink-0 rounded border border-line-strong px-1 font-mono text-[11px] leading-4 text-muted">top</span>}
          {!muted && <span className="shrink-0 font-mono text-xs text-muted">{count} {count === 1 ? "role" : "roles"}</span>}
          {sub}
        </span>
        <Chevron open={open} />
      </button>
      <Expand open={open}>{open && children}</Expand>
    </li>
  );
}

function ShowMore({ left, onClick }) {
  if (left <= 0) return null;
  return (
    <button type="button" onClick={onClick}
      className={`h-12 w-full border-t border-line pl-8 text-left font-mono text-xs text-muted transition-[color] duration-150 hover:text-accent ${focusRing}`}>
      Show {Math.min(left, 100)} more <span className="text-muted/70">· {left} left</span>
    </button>
  );
}

function Margin({ label, count, children }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[7rem_minmax(0,1fr)]">
      <header className="z-10 flex items-baseline gap-2 bg-ink/90 py-3 md:sticky md:top-[var(--controls-h,0px)] md:block md:self-start md:bg-transparent md:pr-4 md:pt-4">
        <h2 className="text-sm font-semibold text-fg">{label}</h2>
        <p className="font-mono text-xs tabular-nums text-muted md:mt-1">{count}</p>
      </header>
      <div className="border-line md:border-l md:border-dashed">{children}</div>
    </section>
  );
}

const PAGE = 40;

export function FreshList({ groups, ctx }) {
  const [limits, setLimits] = useState({});
  const [openMore, setOpenMore] = useState({});
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => {
        const limit = limits[g.key] || PAGE;
        const entries = g.entries.slice(0, limit);
        return (
          <Margin key={g.key} label={g.label} count={g.count}>
            <ul>
              {entries.map((e) =>
                e.type === "role" ? (
                  <RoleRow key={e.role.id} role={e.role} open={ctx.openId === e.role.id} applied={ctx.appliedFor(e.role)}
                    now={ctx.now} since={ctx.since} owner={ctx.owner} onToggle={ctx.onToggle} onMark={ctx.onMark} onUndo={ctx.onUndo} onCopy={ctx.onCopy} />
                ) : (
                  <Rollup key={e.key} label={`+ ${e.roles.length} more at ${e.company}`} open={!!openMore[e.key]}
                    onToggle={() => setOpenMore((m) => ({ ...m, [e.key]: !m[e.key] }))}>
                    <RowList roles={e.roles} nested ctx={ctx} />
                  </Rollup>
                )
              )}
            </ul>
            <ShowMore left={g.entries.length - limit} onClick={() => setLimits((l) => ({ ...l, [g.key]: limit + 100 }))} />
          </Margin>
        );
      })}
    </div>
  );
}

export function CompanyList({ groups, ctx }) {
  const [limit, setLimit] = useState(60);
  const [open, setOpen] = useState({});
  const total = groups.reduce((n, g) => n + g.roles.length, 0);
  return (
    <Margin label="Companies" count={`${groups.length} · ${total} roles`}>
      <ul>
        {groups.slice(0, limit).map((g) => {
          const fresh = g.roles.filter((r) => ctx.now - r.seen < DAY).length;
          return (
            <Rollup key={g.key} label={g.company} count={g.roles.length} top={g.top} open={!!open[g.key]}
              onToggle={() => setOpen((m) => ({ ...m, [g.key]: !m[g.key] }))}
              sub={<span className={`ml-auto shrink-0 font-mono text-xs tabular-nums ${ageTone(g.newest, ctx.now)}`}>{fresh ? `${fresh} today` : ago(g.newest, ctx.now)}</span>}>
              <RowList roles={g.roles} nested ctx={ctx} />
            </Rollup>
          );
        })}
      </ul>
      <ShowMore left={groups.length - limit} onClick={() => setLimit((l) => l + 100)} />
    </Margin>
  );
}
