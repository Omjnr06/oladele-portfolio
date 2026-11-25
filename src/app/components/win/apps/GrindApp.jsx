"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { REGIONS } from "@/app/grind/lib/normalize";
import { hydrateRows } from "@/app/grind/lib/rows";
import { DEFAULTS, ago, filterRoles, normUrl, seasonOptions } from "@/app/grind/lib/filters";
import { ACTIVE } from "@/app/grind/lib/status";
import WinIcon from "../icons";
import DetailsList from "./DetailsList";
import GrindApplications from "./GrindApplications";
import "./apps.css";
import "./list.css";
import "./taskmgr.css";
import "./grind.css";

const PAGE = 150;
const VISIT_LAST = "grind_visit_last";
const VISIT_PREV = "grind_visit_prev";
const SESSION_GAP = 30 * 6e4;

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
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    getFeed().then(setState);
  }, []);
  return { ...state, reload };
}

function useApplications(owner) {
  const [state, setState] = useState({ rows: null, error: null, loading: false });
  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch("/api/applied", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        setState({ rows: j.rows, error: null, loading: false });
      })
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  }, []);
  useEffect(() => {
    if (!owner) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [owner, load]);
  return [state, setState, load];
}

function SignIn({ onDone, onCancel }) {
  const [key, setKey] = useState("");
  const [state, setState] = useState({ busy: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    if (!key.trim() || state.busy) return;
    setState({ busy: true, error: null });
    try {
      const res = await fetch("/api/grind/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key.trim() }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      onDone();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <div className="gr-dlg" role="dialog" aria-modal="true" aria-labelledby="gr-dlg-h" onKeyDown={(e) => e.key === "Escape" && onCancel()}>
      <form className="gr-dlg-box" onSubmit={submit}>
        <p id="gr-dlg-h" className="gr-dlg-head">
          Windows Security
        </p>
        <div className="gr-dlg-body">
          <h2>Sign in to Grind</h2>
          <p className="wa-dim">Enter the owner key to see your applications on this device.</p>
          <div className="gr-dlg-row">
            <WinIcon name="user" className="gr-dlg-ico" />
            <label className="gr-dlg-field">
              <span className="sr-only">Owner key</span>
              <input autoFocus type="password" placeholder="Owner key" autoComplete="current-password" spellCheck={false} value={key} onChange={(e) => setKey(e.target.value)} />
            </label>
          </div>
          {state.error && (
            <p className="gr-dlg-err" role="alert">
              {state.error}
            </p>
          )}
        </div>
        <div className="gr-dlg-foot">
          <button type="submit" className="wa-btn wa-btn--default" disabled={state.busy || !key.trim()}>
            {state.busy ? "Checking…" : "OK"}
          </button>
          <button type="button" className="wa-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function GrindApp() {
  const feed = useFeed();
  const owner = feed.owner;
  const [apps, setApps, loadApps] = useApplications(owner);
  const [f, setF] = useState(DEFAULTS);
  const [sort, setSort] = useState({ key: "seen", dir: -1 });
  const [sel, setSel] = useState(null);
  const [limit, setLimit] = useState(PAGE);
  const [note, setNote] = useState(null);
  const [now, setNow] = useState(0);
  const [since, setSince] = useState(null);
  const [tab, setTab] = useState("roles");
  const [signing, setSigning] = useState(false);
  const [saving, setSaving] = useState({});
  const q = useDeferredValue(f.q);
  const view = owner ? tab : "roles";

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const visit = () => {
      try {
        const last = Number(localStorage.getItem(VISIT_LAST)) || 0;
        let prev = Number(localStorage.getItem(VISIT_PREV)) || 0;
        if (last && Date.now() - last > SESSION_GAP) {
          prev = last;
          localStorage.setItem(VISIT_PREV, String(prev));
        }
        localStorage.setItem(VISIT_LAST, String(Date.now()));
        if (prev) setSince(prev);
      } catch {}
    };
    tick();
    visit();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const set = (patch) => {
    setF((s) => ({ ...s, ...patch }));
    setLimit(PAGE);
  };

  const applied = useMemo(() => new Map((apps.rows || []).filter((r) => r.link).map((r) => [normUrl(r.link), r])), [apps.rows]);
  const isApplied = useCallback((r) => applied.has(normUrl(r.url)), [applied]);
  const live = useMemo(() => ({ ...f, q, top: owner && f.top, hideApplied: owner && f.hideApplied }), [f, q, owner]);
  const run = useCallback((over) => filterRoles(feed.roles, { ...live, ...over }, { now, since, isApplied }), [feed.roles, live, now, since, isApplied]);
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
  const fresh = useMemo(() => (since ? feed.roles.filter((r) => r.seen > since).length : 0), [feed.roles, since]);
  const picked = filtered.find((r) => r.id === sel) ?? null;
  const shown = filtered.slice(0, limit);
  const activeApps = (apps.rows || []).filter((r) => ACTIVE.has(r.status)).length;

  const openRole = (r) => window.open(r.url, "_blank", "noopener,noreferrer");

  const copy = async (url, company) => {
    try {
      await navigator.clipboard.writeText(url);
      setNote({ msg: `Copied the ${company} posting link.` });
    } catch {
      setNote({ msg: "Your browser blocked clipboard access. Open the posting and copy its address instead." });
    }
  };

  const unmark = async (r) => {
    const row = applied.get(normUrl(r.url));
    if (!row?.id || row.pending) return;
    setApps((a) => ({ ...a, rows: a.rows.filter((x) => x.id !== row.id) }));
    try {
      const res = await fetch(`/api/applied?id=${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNote({ msg: `Unmarked ${r.company}.` });
    } catch {
      setApps((a) => ({ ...a, rows: [row, ...a.rows] }));
      setNote({ msg: `Couldn't unmark ${r.company}. Try again.` });
    }
  };

  const mark = async (r) => {
    if (isApplied(r)) return;
    const tmp = { id: `tmp-${r.id}`, pending: true, company: r.company, role: r.title, location: r.location, link: r.url, source: r.source, status: "Applied", dateApplied: null };
    setApps((a) => ({ ...a, rows: [tmp, ...(a.rows || [])] }));
    try {
      const res = await fetch("/api/applied", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: r.company, role: r.title, location: r.location, link: r.url, source: r.source }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      const row = { ...tmp, id: j.id, pending: false, dateApplied: j.dateApplied };
      setApps((a) => ({ ...a, rows: a.rows.map((x) => (x.id === tmp.id ? row : x)) }));
      setNote({
        msg: `Marked ${r.company} as applied.`,
        action: {
          label: "Undo",
          run: async () => {
            setApps((a) => ({ ...a, rows: a.rows.filter((x) => x.id !== row.id) }));
            const ok = await fetch(`/api/applied?id=${encodeURIComponent(row.id)}`, { method: "DELETE" }).then((x) => x.ok, () => false);
            if (!ok) setApps((a) => ({ ...a, rows: [row, ...a.rows] }));
            setNote({ msg: ok ? `Unmarked ${r.company}.` : `Couldn't undo ${r.company}. Try again.` });
          },
        },
      });
    } catch (e) {
      setApps((a) => ({ ...a, rows: a.rows.filter((x) => x.id !== tmp.id) }));
      setNote({ msg: `Couldn't save ${r.company} to Notion${e.message ? ` (${e.message})` : ""}. Try again.` });
    }
  };

  const setStatus = async (row, status, quiet = false) => {
    const prev = row.status;
    const patch = (to) => setApps((a) => ({ ...a, rows: a.rows.map((x) => (x.id === row.id ? { ...x, status: to } : x)) }));
    patch(status);
    setSaving((x) => ({ ...x, [row.id]: true }));
    try {
      const res = await fetch(`/api/applied?id=${encodeURIComponent(row.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error);
      if (!quiet) setNote({ msg: `${row.company} moved to ${status}.`, action: { label: "Undo", run: () => setStatus({ ...row, status }, prev, true) } });
    } catch (e) {
      patch(prev);
      setNote({ msg: `Couldn't update ${row.company}${e.message ? ` (${e.message})` : ""}. Try again.` });
    } finally {
      setSaving((x) => {
        const n = { ...x };
        delete n[row.id];
        return n;
      });
    }
  };

  const signedIn = () => {
    setSigning(false);
    setNote({ msg: "Signed in on this device for a year." });
    feed.reload();
  };

  const signOut = async () => {
    await fetch("/api/grind/unlock", { method: "DELETE" }).catch(() => {});
    setApps({ rows: null, error: null, loading: false });
    setTab("roles");
    setNote({ msg: "Signed out. Your applications are hidden on this device." });
    feed.reload();
  };

  const roleMenu = (r) => [
    { label: "Open posting", strong: true, onSelect: () => openRole(r) },
    { label: "Copy link", onSelect: () => copy(r.url, r.company) },
    ...(owner ? ["sep", isApplied(r) ? { label: "Unmark applied", onSelect: () => unmark(r) } : { label: "Mark applied", onSelect: () => mark(r) }] : []),
  ];

  const columns = [
    {
      key: "company",
      label: "Company",
      width: "minmax(120px, 1.1fr)",
      render: (r) => (
        <>
          {owner && r.tier === "A" && (
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
    ...(owner ? [{ key: "applied", label: "Applied", width: "84px", sort: false, render: (r) => applied.get(normUrl(r.url))?.status ?? "" }] : []),
  ];

  const toggleRegion = (g) => set({ regions: f.regions.includes(g) ? f.regions.filter((x) => x !== g) : [...f.regions, g] });
  const dirty = JSON.stringify({ ...f, q: f.q.trim() }) !== JSON.stringify(DEFAULTS);

  if (feed.loading && !feed.roles.length && !feed.error) return <div className="wa-loading">Loading roles…</div>;

  return (
    <div className="wa gr">
      {owner && (
        <div className="wa-tabs" role="tablist" aria-label="Grind">
          {[
            ["roles", "Open roles"],
            ["apps", "My applications"],
          ].map(([id, label]) => (
            <button key={id} type="button" role="tab" className="wa-tab" aria-selected={view === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
      {note && (
        <div className="wa-info" role="status">
          <WinIcon name="chart" className="wa-info-ico" />
          <span>{note.msg}</span>
          {note.action && (
            <button
              type="button"
              className="wa-btn"
              onClick={() => {
                note.action.run();
                setNote(null);
              }}
            >
              {note.action.label}
            </button>
          )}
          <button type="button" className="wa-btn gr-ok" onClick={() => setNote(null)}>
            OK
          </button>
        </div>
      )}
      {view === "apps" ? (
        <GrindApplications rows={apps.rows} error={apps.error} loading={apps.loading} onRetry={loadApps} onStatus={setStatus} saving={saving} onCopy={copy} />
      ) : (
        <>
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
                {since && <option value="new">Since last visit ({fresh})</option>}
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
            {owner && (
              <>
                <button type="button" className="wa-cmd-btn" aria-pressed={f.top} onClick={() => set({ top: !f.top })}>
                  Top companies
                </button>
                <button type="button" className="wa-cmd-btn" aria-pressed={f.hideApplied} onClick={() => set({ hideApplied: !f.hideApplied })}>
                  Hide applied
                </button>
              </>
            )}
            <input type="search" className="gr-search" aria-label="Search roles" placeholder="Search roles" value={f.q}
              onChange={(e) => set({ q: e.target.value })}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || owner || f.q.trim().toLowerCase() !== "runas") return;
                set({ q: "" });
                setSigning(true);
              }}
            />
          </div>
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
              {owner && (
                <>
                  <p className="wa-nav-head">Owner</p>
                  <button type="button" className="wa-nav-item" onClick={signOut}>
                    <WinIcon name="user" className="wa-nav-ico" />
                    Sign out
                  </button>
                </>
              )}
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
                  menuFor={roleMenu}
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
                <p>{[picked.location, picked.season === "Unspecified" ? "Term not listed" : picked.season, `posted ${ago(picked.seen, now)} ago`, `via ${picked.source}`].filter(Boolean).join(", ")}</p>
                <div className="wa-details-actions">
                  <button type="button" className="wa-btn wa-btn--default" onClick={() => openRole(picked)}>
                    Open posting
                  </button>
                  <button type="button" className="wa-btn" onClick={() => copy(picked.url, picked.company)}>
                    Copy link
                  </button>
                  {owner &&
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
        </>
      )}
      <div className="wa-status">
        {view === "apps" ? (
          <span>
            {(apps.rows || []).length} applications, {activeApps} active
          </span>
        ) : (
          <span>
            {filtered.length.toLocaleString()} of {feed.roles.length.toLocaleString()} roles
          </span>
        )}
        {feed.generatedAt && now > 0 && <span>Updated {ago(Date.parse(feed.generatedAt), now)} ago</span>}
        {view === "roles" && dirty && (
          <button type="button" className="wa-link gr-clear" onClick={() => set(DEFAULTS)}>
            Clear filters
          </button>
        )}
      </div>
      {signing && <SignIn onDone={signedIn} onCancel={() => setSigning(false)} />}
    </div>
  );
}
