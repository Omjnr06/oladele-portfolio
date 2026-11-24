"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { REGIONS } from "@/app/grind/lib/normalize";
import { hydrateRows } from "@/app/grind/lib/rows";
import { DEFAULTS, ago, filterRoles, normUrl, seasonOptions } from "@/app/grind/lib/filters";
import WinIcon from "../icons";
import DetailsList from "./DetailsList";
import "./apps.css";
import "./grind.css";

const PAGE = 150;
const BOARD = "/grind?theme=modern";

const compare = {
  company: (a, b) => a.company.localeCompare(b.company),
  title: (a, b) => a.title.localeCompare(b.title),
  location: (a, b) => a.location.localeCompare(b.location),
  season: (a, b) => a.season.localeCompare(b.season),
  seen: (a, b) => a.seen - b.seen,
};

const getFeed = () =>
  fetch("/api/grind/feed", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((j) => ({ loading: false, error: j.error, roles: hydrateRows(j.rows), owner: j.owner, generatedAt: j.generatedAt }))
    .catch((e) => ({ loading: false, error: e.message, roles: [], owner: false, generatedAt: null }));

function useFeed() {
  const [state, setState] = useState({ loading: true, error: null, roles: [], owner: false, generatedAt: null });
  useEffect(() => {
    let on = true;
    getFeed().then((s) => on && setState(s));
    return () => {
      on = false;
    };
  }, []);
  const reload = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    getFeed().then(setState);
  };
  return { ...state, reload };
}

function useApplied(owner) {
  const [map, setMap] = useState(() => new Map());
  useEffect(() => {
    if (!owner) return;
    fetch("/api/applied", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setMap(new Map(j.rows.filter((r) => r.link).map((r) => [normUrl(r.link), { id: r.id, status: r.status }]))))
      .catch(() => {});
  }, [owner]);
  return [map, setMap];
}

export default function GrindApp() {
  const feed = useFeed();
  const [applied, setApplied] = useApplied(feed.owner);
  const [f, setF] = useState(DEFAULTS);
  const [sort, setSort] = useState({ key: "seen", dir: -1 });
  const [sel, setSel] = useState(null);
  const [limit, setLimit] = useState(PAGE);
  const [note, setNote] = useState(null);
  const [now, setNow] = useState(0);
  const q = useDeferredValue(f.q);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const set = (patch) => {
    setF((s) => ({ ...s, ...patch }));
    setLimit(PAGE);
  };

  const isApplied = useCallback((r) => applied.has(normUrl(r.url)), [applied]);
  const live = useMemo(() => ({ ...f, q }), [f, q]);
  const run = useCallback((over) => filterRoles(feed.roles, { ...live, ...over }, { now, since: null, isApplied }), [feed.roles, live, now, isApplied]);
  const filtered = useMemo(() => {
    const list = run({});
    const by = compare[sort.key];
    return list.sort((a, b) => by(a, b) * sort.dir || b.seen - a.seen);
  }, [run, sort]);
  const tracks = useMemo(() => {
    const base = run({ track: "all" });
    return { all: base.length, swe: base.filter((r) => r.track === "swe").length, pm: base.filter((r) => r.track === "pm").length };
  }, [run]);
  const regionCounts = useMemo(() => {
    const m = Object.fromEntries(REGIONS.map((g) => [g, 0]));
    for (const r of run({ regions: [] })) for (const g of r.regions) m[g]++;
    return m;
  }, [run]);
  const seasons = useMemo(() => seasonOptions(feed.roles), [feed.roles]);
  const picked = filtered.find((r) => r.id === sel) ?? null;
  const shown = filtered.slice(0, limit);

  const openRole = (r) => window.open(r.url, "_blank", "noopener,noreferrer");

  const copy = async (r) => {
    try {
      await navigator.clipboard.writeText(r.url);
      setNote(`Copied the ${r.company} posting link.`);
    } catch {
      setNote("Your browser blocked clipboard access. Open the posting and copy its address instead.");
    }
  };

  const mark = async (r) => {
    const k = normUrl(r.url);
    setApplied((m) => new Map(m).set(k, { pending: true, status: "Applied" }));
    try {
      const res = await fetch("/api/applied", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: r.company, role: r.title, location: r.location, link: r.url, source: r.source }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setApplied((m) => new Map(m).set(k, { id: j.id, status: "Applied" }));
      setNote(`Marked ${r.company} as applied.`);
    } catch (e) {
      setApplied((m) => {
        const n = new Map(m);
        n.delete(k);
        return n;
      });
      setNote(`Couldn't save ${r.company} to Notion${e.message ? ` (${e.message})` : ""}. Try again.`);
    }
  };

  const unmark = async (r) => {
    const k = normUrl(r.url);
    const entry = applied.get(k);
    if (!entry?.id) return;
    setApplied((m) => {
      const n = new Map(m);
      n.delete(k);
      return n;
    });
    try {
      const res = await fetch(`/api/applied?id=${encodeURIComponent(entry.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNote(`Unmarked ${r.company}.`);
    } catch {
      setApplied((m) => new Map(m).set(k, entry));
      setNote(`Couldn't unmark ${r.company}. Try again.`);
    }
  };

  const columns = [
    {
      key: "company",
      label: "Company",
      width: "minmax(120px, 1.1fr)",
      render: (r) => (
        <>
          {r.tier === "A" && (
            <span className="gr-top" title="Top company">
              ★
            </span>
          )}
          <span>{r.company}</span>
        </>
      ),
    },
    { key: "title", label: "Role", width: "minmax(160px, 2fr)" },
    { key: "location", label: "Location", width: "minmax(100px, 1fr)" },
    { key: "season", label: "Term", width: "104px" },
    { key: "seen", label: "Posted", width: "72px", align: "end", dir: -1, render: (r) => (now ? ago(r.seen, now) : "") },
    ...(feed.owner ? [{ key: "applied", label: "Applied", width: "84px", sort: false, render: (r) => applied.get(normUrl(r.url))?.status ?? "" }] : []),
  ];

  const toggleRegion = (g) => set({ regions: f.regions.includes(g) ? f.regions.filter((x) => x !== g) : [...f.regions, g] });
  const dirty = JSON.stringify({ ...f, q: f.q.trim() }) !== JSON.stringify(DEFAULTS);

  if (feed.loading && !feed.roles.length) return <div className="wa-loading">Loading roles…</div>;

  return (
    <div className="wa gr">
      <div className="wa-cmd gr-cmd">
        {[
          ["all", "All"],
          ["swe", "SWE"],
          ["pm", "PM"],
        ].map(([v, label]) => (
          <button key={v} type="button" className="wa-cmd-btn" aria-pressed={f.track === v} onClick={() => set({ track: v })}>
            {label} <span className="wa-dim">{tracks[v]}</span>
          </button>
        ))}
        <span className="wa-cmd-sep" />
        <label className="gr-field">
          <span>Posted</span>
          <select value={f.age} onChange={(e) => set({ age: e.target.value })}>
            <option value="all">Any time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </label>
        <label className="gr-field">
          <span>Term</span>
          <select value={f.season} onChange={(e) => set({ season: e.target.value })}>
            <option value="all">Any term</option>
            {seasons.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="wa-cmd-btn" aria-pressed={f.top} onClick={() => set({ top: !f.top })}>
          Top companies
        </button>
        {feed.owner && (
          <button type="button" className="wa-cmd-btn" aria-pressed={f.hideApplied} onClick={() => set({ hideApplied: !f.hideApplied })}>
            Hide applied
          </button>
        )}
        <input type="search" className="gr-search" aria-label="Search roles" placeholder="Search roles" value={f.q} onChange={(e) => set({ q: e.target.value })} />
      </div>
      {note && (
        <div className="wa-info" role="status">
          <WinIcon name="chart" className="wa-info-ico" />
          <span>{note}</span>
          <button type="button" className="wa-btn" onClick={() => setNote(null)}>
            OK
          </button>
        </div>
      )}
      <div className="wa-row">
        <nav className="wa-nav" aria-label="Regions">
          <p className="wa-nav-head">Regions</p>
          <button type="button" className="wa-nav-item" aria-pressed={!f.regions.length} onClick={() => set({ regions: [] })}>
            All regions
          </button>
          {REGIONS.filter((g) => regionCounts[g] || f.regions.includes(g)).map((g) => (
            <button key={g} type="button" className="wa-nav-item gr-region" aria-pressed={f.regions.includes(g)} onClick={() => toggleRegion(g)}>
              <span>{g}</span>
              <span className="wa-dim">{regionCounts[g]}</span>
            </button>
          ))}
          <p className="wa-nav-head">{feed.owner ? "Owner" : "More"}</p>
          <a className="wa-nav-item" href={BOARD} target="_blank" rel="noopener noreferrer">
            {feed.owner ? "Open dashboard" : "Open full board"}
          </a>
        </nav>
        <div className="wa-main gr-main">
          {feed.error ? (
            <div className="gr-empty">
              <p>The pipeline feed didn&apos;t load: {feed.error}.</p>
              <p className="wa-dim">GitHub may be rate-limiting. It usually clears within a minute.</p>
              <button type="button" className="wa-btn" onClick={feed.reload}>
                Try again
              </button>
            </div>
          ) : (
            <DetailsList
              label="Open roles"
              columns={columns}
              rows={shown}
              rowKey={(r) => r.id}
              selected={picked?.id ?? null}
              onSelect={setSel}
              onOpen={openRole}
              sort={sort}
              onSort={setSort}
              empty={
                <div className="wl-empty">
                  <p>No roles match these filters.</p>
                  {dirty && (
                    <button type="button" className="wa-btn" onClick={() => set(DEFAULTS)}>
                      Clear filters
                    </button>
                  )}
                </div>
              }
              footer={
                filtered.length > limit && (
                  <div className="wl-more">
                    <button type="button" className="wa-btn" onClick={() => setLimit((l) => l + PAGE)}>
                      Show {Math.min(PAGE, filtered.length - limit)} more
                    </button>
                  </div>
                )
              }
            />
          )}
        </div>
      </div>
      {picked && (
        <div className="wa-details gr-details">
          <WinIcon name="chart" className="wa-thumb-ico" />
          <div>
            <h3>
              {picked.title} <span className="wa-dim">at</span> {picked.company}
            </h3>
            <p>
              {[picked.location, picked.season === "Unspecified" ? "Term not listed" : picked.season, `posted ${ago(picked.seen, now)} ago`, `via ${picked.source}`].filter(Boolean).join("  ·  ")}
            </p>
            <div className="wa-details-actions">
              <button type="button" className="wa-btn wa-btn--default" onClick={() => openRole(picked)}>
                Open posting
              </button>
              <button type="button" className="wa-btn" onClick={() => copy(picked)}>
                Copy link
              </button>
              {feed.owner &&
                (isApplied(picked) ? (
                  <button type="button" className="wa-btn" disabled={applied.get(normUrl(picked.url))?.pending} onClick={() => unmark(picked)}>
                    Unmark applied
                  </button>
                ) : (
                  <button type="button" className="wa-btn" onClick={() => mark(picked)}>
                    Mark applied
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="wa-status">
        <span>
          {filtered.length.toLocaleString()} of {feed.roles.length.toLocaleString()} roles
        </span>
        {feed.generatedAt && now > 0 && <span>Updated {ago(Date.parse(feed.generatedAt), now)} ago</span>}
        {dirty && (
          <button type="button" className="wa-link gr-clear" onClick={() => set(DEFAULTS)}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
