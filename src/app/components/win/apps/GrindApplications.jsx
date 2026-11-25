"use client";
import { useMemo, useState } from "react";
import { HIERARCHY, RESPONDED, STATUSES, metaFor, rankOf } from "@/app/grind/lib/status";
import { appliedDay, dayKey } from "@/app/grind/components/Heatmap";
import DetailsList from "./DetailsList";

const WEEKS = 26;
const FILL = {
  Offer: "#2f9e44",
  Interviewing: "#2f7fd9",
  Applied: "#8db8ea",
  "Interview and Rejected": "#a8b0ba",
  Rejected: "#d3d8de",
};
const HEAT = ["#ffffff", "#c6dcf5", "#8db8ea", "#4b8fdc", "#1f5fb4"];
const fill = (s) => FILL[s] ?? "#e6e9ed";
const level = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4);
const dateOf = (r) => r.dateApplied || r.created || "";

function useActivity(rows) {
  return useMemo(() => {
    const byDay = new Map();
    for (const r of rows) {
      const k = appliedDay(r);
      if (k) byDay.set(k, (byDay.get(k) || 0) + 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);
    const cells = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ k: dayKey(d), d, n: d > today ? null : byDay.get(dayKey(d)) || 0 });
    }
    const sum = (from, to) => {
      let n = 0;
      for (const [k, v] of byDay) if (k >= dayKey(from) && k <= dayKey(to)) n += v;
      return n;
    };
    const week = new Date(today);
    week.setDate(today.getDate() - today.getDay());
    const thirty = new Date(today);
    thirty.setDate(today.getDate() - 29);
    let streak = 0;
    const cur = new Date(today);
    if (!byDay.get(dayKey(cur))) cur.setDate(cur.getDate() - 1);
    while (byDay.get(dayKey(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return { cells, week: sum(week, today), thirty: sum(thirty, today), streak };
  }, [rows]);
}

export default function GrindApplications({ rows, error, loading, onRetry, onStatus, saving, onCopy }) {
  const [status, setStatus] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "status", dir: 1 });
  const [sel, setSel] = useState(null);
  const all = useMemo(() => rows || [], [rows]);
  const act = useActivity(all);

  const counts = useMemo(() => {
    const m = {};
    for (const r of all) m[r.status || "No status"] = (m[r.status || "No status"] || 0) + 1;
    return m;
  }, [all]);
  const total = all.length;
  const responded = all.filter((r) => RESPONDED.has(r.status)).length;
  const order = [...HIERARCHY, ...Object.keys(counts).filter((s) => !HIERARCHY.includes(s))];

  const list = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const by = {
      company: (a, b) => a.company.localeCompare(b.company),
      role: (a, b) => (a.role || "").localeCompare(b.role || ""),
      location: (a, b) => (a.location || "").localeCompare(b.location || ""),
      date: (a, b) => dateOf(a).localeCompare(dateOf(b)),
      status: (a, b) => rankOf(a.status) - rankOf(b.status),
    }[sort.key];
    return all
      .filter((r) => (!status || (r.status || "No status") === status) && terms.every((t) => `${r.company} ${r.role} ${r.location}`.toLowerCase().includes(t)))
      .sort((a, b) => by(a, b) * sort.dir || dateOf(b).localeCompare(dateOf(a)));
  }, [all, status, query, sort]);

  const open = (r) => r.link && window.open(r.link, "_blank", "noopener,noreferrer");

  const columns = [
    { key: "company", label: "Company", width: "minmax(120px, 1.1fr)" },
    { key: "role", label: "Role", width: "minmax(150px, 1.8fr)", render: (r) => r.role || "—" },
    { key: "location", label: "Location", width: "minmax(90px, 1fr)", render: (r) => r.location || "—" },
    { key: "date", label: "Applied", width: "92px", dir: -1, render: (r) => r.dateApplied || "—" },
    {
      key: "status",
      label: "Status",
      width: "170px",
      render: (r) => (
        <select
          className="ga-status"
          aria-label={`Status for ${r.company}`}
          value={r.status || ""}
          disabled={saving[r.id] || r.pending}
          style={{ "--c": fill(r.status) }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatus(r, e.target.value)}
        >
          {!STATUSES.includes(r.status) && <option value={r.status || ""}>{metaFor(r.status).label}</option>}
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {metaFor(s).label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  if (error)
    return (
      <div className="gr-empty">
        <p>Couldn&apos;t load your applications: {error.replace(/\.$/, "")}.</p>
        <p className="wa-dim">Check that NOTION_TOKEN and NOTION_DB_ID are set in Vercel.</p>
        <button type="button" className="wa-btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  if (loading && !rows) return <div className="wa-loading">Loading applications…</div>;

  return (
    <div className="ga">
      <div className="ga-top">
        <fieldset className="tm-box">
          <legend>Summary</legend>
          <dl className="ga-stats">
            <dt>Applications</dt>
            <dd>{total}</dd>
            <dt>Response rate</dt>
            <dd>
              {total ? Math.round((responded / total) * 100) : 0}% <span className="wa-dim">({responded} heard back)</span>
            </dd>
            <dt>Interviewing</dt>
            <dd>{counts.Interviewing || 0}</dd>
            <dt>Offers</dt>
            <dd>{counts.Offer || 0}</dd>
          </dl>
        </fieldset>
        <fieldset className="tm-box">
          <legend>Pipeline</legend>
          <div className="ga-bar" role="img" aria-label={order.filter((s) => counts[s]).map((s) => `${metaFor(s).label} ${counts[s]}`).join(", ")}>
            {order
              .filter((s) => counts[s])
              .map((s) => (
                <span key={s} title={`${metaFor(s).label}: ${counts[s]}`} data-dim={(status && status !== s) || undefined} style={{ flexGrow: counts[s], background: fill(s) }} />
              ))}
          </div>
          <div className="ga-legend" role="group" aria-label="Filter by status">
            {order
              .filter((s) => counts[s] || STATUSES.includes(s))
              .map((s) => (
                <button key={s} type="button" aria-pressed={status === s} disabled={!counts[s]} onClick={() => setStatus(status === s ? null : s)}>
                  <span aria-hidden style={{ background: fill(s) }} />
                  {metaFor(s).label} <span className="wa-dim">{counts[s] || 0}</span>
                </button>
              ))}
          </div>
        </fieldset>
        <fieldset className="tm-box">
          <legend>Activity, last 26 weeks</legend>
          <div className="ga-heat" aria-hidden>
            {act.cells.map((c) => (
              <span key={c.k} title={c.n === null ? undefined : `${c.n} on ${c.d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`} data-future={c.n === null || undefined} style={{ background: c.n === null ? undefined : HEAT[level(c.n)] }} />
            ))}
          </div>
          <p className="ga-heat-sum">
            {act.week} this week, {act.thirty} in the last 30 days, {act.streak}-day streak
          </p>
        </fieldset>
      </div>
      <div className="wa-cmd ga-cmd">
        <label className="gr-field">
          <span>Status</span>
          <select value={status ?? ""} onChange={(e) => setStatus(e.target.value || null)}>
            <option value="">All</option>
            {order.map((s) => (
              <option key={s} value={s}>
                {metaFor(s).label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="wa-cmd-btn" onClick={onRetry}>
          Refresh
        </button>
        <input type="search" className="gr-search" aria-label="Search your applications" placeholder="Search applications" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="ga-list">
        <DetailsList
          label="Your applications"
          columns={columns}
          rows={list}
          rowKey={(r) => r.id}
          selected={sel}
          onSelect={setSel}
          onOpen={open}
          sort={sort}
          onSort={setSort}
          menuFor={(r) => [
            ...(r.link
              ? [
                  { label: "Open posting", strong: true, onSelect: () => open(r) },
                  { label: "Copy link", onSelect: () => onCopy(r.link, r.company) },
                  "sep",
                ]
              : []),
            { label: "Set status", items: STATUSES.map((s) => ({ label: metaFor(s).label, checked: r.status === s, onSelect: () => s !== r.status && onStatus(r, s) })) },
          ]}
          empty={
            <div className="wl-empty">
              <p>{total ? "No applications match." : "Nothing logged yet. Right-click a role in Open roles and choose Mark applied."}</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
