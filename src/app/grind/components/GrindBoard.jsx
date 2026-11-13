"use client";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { REGIONS } from "../lib/normalize";
import { hydrateRows } from "../lib/rows";
import { DEFAULTS, ago, filterRoles, groupByCompany, groupByFreshness, normUrl, seasonOptions, toQuery } from "../lib/filters";
import { Chip, Search, Segmented, Select } from "./Controls";
import { CompanyList, FreshList } from "./RoleList";
import { Dashboard } from "./Dashboard";
import { Ticker } from "./Ticker";
import { Kbd } from "./Kbd";
import { ACTIVE } from "../lib/status";
import { Toast } from "./Toast";
import { Terminal } from "./Terminal";

const VISIT_LAST = "grind_visit_last";
const VISIT_PREV = "grind_visit_prev";
const SESSION_GAP = 30 * 6e4;

function LiveDot({ live }) {
  return (
    <span className="relative flex size-2" aria-hidden>
      {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />}
      <span className={`relative inline-flex size-2 rounded-full ${live ? "bg-accent" : "bg-white/30"}`} />
    </span>
  );
}

export default function GrindBoard({ feed, owner, initial, unlockStatus }) {
  const router = useRouter();
  const { generatedAt, error: feedError } = feed;
  const roles = useMemo(() => hydrateRows(feed.rows), [feed.rows]);
  const genTs = generatedAt ? Date.parse(generatedAt) : roles.reduce((m, r) => Math.max(m, r.seen), 0);

  const [f, setF] = useState({ ...DEFAULTS, ...initial });
  const [now, setNow] = useState(genTs);
  const [since, setSince] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [applied, setApplied] = useState({ rows: null, error: null, loading: false });
  const [appliedMap, setAppliedMap] = useState(() => new Map());
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const barRef = useRef(null);
  const wrapRef = useRef(null);
  const mapRef = useRef(appliedMap);
  mapRef.current = appliedMap;

  const q = useDeferredValue(f.q);
  const set = useCallback((patch) => setF((s) => ({ ...s, ...patch })), []);
  const showToast = useCallback((t) => setToast({ key: Date.now(), ...t }), []);
  const dismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    try {
      const last = Number(localStorage.getItem(VISIT_LAST)) || 0;
      let prev = Number(localStorage.getItem(VISIT_PREV)) || 0;
      if (last && Date.now() - last > SESSION_GAP) { prev = last; localStorage.setItem(VISIT_PREV, String(prev)); }
      localStorage.setItem(VISIT_LAST, String(Date.now()));
      if (prev) setSince(prev);
    } catch {}
    return () => clearInterval(t);
  }, []);

  // Keep an open tab current: re-fetch the server data every 5 min while visible,
  // and right away when you come back to the tab (at most once a minute).
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 60_000) return;
      last = Date.now();
      router.refresh();
    };
    const t = setInterval(refresh, 5 * 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  useEffect(() => {
    if (unlockStatus === "failed") showToast({ msg: "That key didn't match. Type it at the omj@grind prompt at the bottom of the page instead.", error: true });
    if (unlockStatus === "unconfigured") showToast({ msg: "The server has no DASHBOARD_SECRET set. Add it in Vercel and redeploy.", error: true });
  }, [unlockStatus, showToast]);

  useEffect(() => {
    if (owner) return;
    let legacy = null;
    try { legacy = localStorage.getItem("grind_key"); } catch {}
    if (!legacy) return;
    fetch("/api/grind/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: legacy }) })
      .then(async (r) => {
        if (r.ok) {
          try { localStorage.removeItem("grind_key"); } catch {}
          router.refresh();
          return;
        }
        const j = await r.json().catch(() => ({}));
        if (sessionStorage.getItem("grind_legacy_warned")) return;
        sessionStorage.setItem("grind_legacy_warned", "1");
        showToast({ msg: j.code === "unconfigured" ? "The server has no DASHBOARD_SECRET set. Add it in Vercel and redeploy." : "The key saved on this device no longer matches. Type your current key at the omj@grind prompt below.", error: true });
      })
      .catch(() => {});
  }, [owner, router, showToast]);

  useEffect(() => {
    const qs = toQuery({ ...f, q });
    const current = new URLSearchParams(window.location.search);
    current.delete("unlock");
    if (current.toString().replaceAll("%2C", ",") === qs.slice(1)) return;
    const t = setTimeout(() => window.history.replaceState(null, "", `${window.location.pathname}${qs}`), 0);
    return () => clearTimeout(t);
  }, [f, q]);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => wrapRef.current?.style.setProperty("--controls-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const loadApplied = useCallback(async () => {
    setApplied((a) => ({ ...a, loading: true, error: null }));
    try {
      const res = await fetch("/api/applied", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setApplied({ rows: j.rows, error: null, loading: false });
      setAppliedMap((old) => {
        const m = new Map();
        for (const r of j.rows) if (r.link) m.set(normUrl(r.link), { id: r.id, status: r.status, dateApplied: r.dateApplied });
        for (const [k, v] of old) if (v.pending) m.set(k, v);
        return m;
      });
    } catch (e) {
      setApplied((a) => ({ ...a, loading: false, error: e.message }));
    }
  }, []);

  useEffect(() => { if (owner) loadApplied(); }, [owner, loadApplied]);

  const isApplied = useCallback((r) => appliedMap.has(normUrl(r.url)), [appliedMap]);
  const appliedFor = useCallback((r) => appliedMap.get(normUrl(r.url)) || null, [appliedMap]);

  const unmark = useCallback(async (r, entry) => {
    const k = normUrl(r.url);
    setAppliedMap((m) => { const n = new Map(m); n.delete(k); return n; });
    setApplied((a) => ({ ...a, rows: a.rows?.filter((x) => x.id !== entry.id) ?? a.rows }));
    try {
      const res = await fetch(`/api/applied?id=${encodeURIComponent(entry.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error);
      showToast({ msg: `Unmarked ${r.company}.` });
    } catch (e) {
      setAppliedMap((m) => new Map(m).set(k, entry));
      showToast({ msg: `Couldn't unmark ${r.company}${e.message ? ` (${e.message})` : ""}. Try again.`, error: true });
    }
  }, [showToast]);

  const mark = useCallback(async (r) => {
    const k = normUrl(r.url);
    if (mapRef.current.has(k)) return;
    setAppliedMap((m) => new Map(m).set(k, { pending: true, status: "Applied" }));
    try {
      const res = await fetch("/api/applied", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: r.company, role: r.title, location: r.location, link: r.url, source: r.source }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      const entry = { id: j.id, status: "Applied", dateApplied: j.dateApplied };
      setAppliedMap((m) => new Map(m).set(k, entry));
      setApplied((a) => ({ ...a, rows: a.rows ? [{ id: j.id, company: r.company, role: r.title, location: r.location, link: r.url, source: r.source, status: "Applied", dateApplied: j.dateApplied }, ...a.rows] : a.rows }));
      showToast({ msg: `Marked ${r.company} as applied.`, action: { label: "Undo", run: () => unmark(r, entry) } });
    } catch (e) {
      setAppliedMap((m) => { const n = new Map(m); n.delete(k); return n; });
      showToast({ msg: `Couldn't save ${r.company} to Notion${e.message ? ` (${e.message})` : ""}. Try again.`, error: true });
    }
  }, [showToast, unmark]);

  const onUndo = useCallback((r) => {
    const entry = mapRef.current.get(normUrl(r.url));
    if (entry?.id) unmark(r, entry);
  }, [unmark]);

  const onToggle = useCallback((id) => setOpenId((cur) => (cur === id ? null : id)), []);

  const [saving, setSaving] = useState({});
  const setStatus = useCallback(async (row, status, { quiet } = {}) => {
    const prev = row.status;
    const patchRows = (to) => setApplied((a) => ({ ...a, rows: a.rows?.map((x) => (x.id === row.id ? { ...x, status: to } : x)) ?? a.rows }));
    const patchMap = (to) => setAppliedMap((m) => {
      const k = row.link && normUrl(row.link);
      if (!k || !m.has(k)) return m;
      return new Map(m).set(k, { ...m.get(k), status: to });
    });
    patchRows(status); patchMap(status);
    setSaving((x) => ({ ...x, [row.id]: true }));
    try {
      const res = await fetch(`/api/applied?id=${encodeURIComponent(row.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error);
      if (!quiet) showToast({ msg: `${row.company} moved to ${status}.`, action: { label: "Undo", run: () => setStatus({ ...row, status }, prev, { quiet: true }) } });
    } catch (e) {
      patchRows(prev); patchMap(prev);
      showToast({ msg: `Couldn't update ${row.company}${e.message ? ` (${e.message})` : ""}. Try again.`, error: true });
    } finally {
      setSaving((x) => { const n = { ...x }; delete n[row.id]; return n; });
    }
  }, [showToast]);

  const jumpToApps = useCallback(() => {
    const el = document.getElementById("applications");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.querySelector("h2")?.focus({ preventScroll: true });
  }, []);
  const activeApps = useMemo(() => (applied.rows || []).filter((r) => ACTIVE.has(r.status)).length, [applied.rows]);

  const copyLink = useCallback(async (r) => {
    try { await navigator.clipboard.writeText(r.url); showToast({ msg: `Copied the ${r.company} posting link.` }); }
    catch { showToast({ msg: "Your browser blocked clipboard access. Open the posting and copy its URL instead.", error: true }); }
  }, [showToast]);

  const live = useMemo(() => ({ ...f, q }), [f, q]);
  const run = useCallback((over) => filterRoles(roles, { ...live, ...over }, { now, since, isApplied }), [roles, live, now, since, isApplied]);
  const filtered = useMemo(() => run({}), [run]);
  const trackCounts = useMemo(() => {
    const base = run({ track: "all" });
    return { all: base.length, swe: base.filter((r) => r.track === "swe").length, pm: base.filter((r) => r.track === "pm").length };
  }, [run]);
  const regionCounts = useMemo(() => {
    const m = Object.fromEntries(REGIONS.map((g) => [g, 0]));
    for (const r of run({ regions: [] })) for (const g of r.regions) m[g]++;
    return m;
  }, [run]);
  const seasons = useMemo(() => seasonOptions(roles), [roles]);
  const newCount = useMemo(() => (since ? roles.filter((r) => r.seen > since).length : 0), [roles, since]);
  const groups = useMemo(() => (f.view === "company" ? groupByCompany(filtered) : groupByFreshness(filtered, now)), [filtered, f.view, now]);
  const roleById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);

  const dirty = toQuery({ ...DEFAULTS, ...f, q, view: "fresh" }) !== "";
  const toggleRegion = (g) => set({ regions: f.regions.includes(g) ? f.regions.filter((x) => x !== g) : [...f.regions, g] });

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        // Context-aware: once the applications section reaches the top half of the screen, '/' targets its search.
        const apps = document.getElementById("applications");
        const appSearch = document.getElementById("app-search");
        const inApps = apps && appSearch && apps.getBoundingClientRect().top < window.innerHeight / 2;
        const target = inApps ? appSearch : searchRef.current;
        target?.focus();
        target?.select();
        return;
      }
      if (typing) { if (e.key === "Escape") e.target.blur(); return; }
      if (e.target.closest?.("[role=listbox]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const rows = [...document.querySelectorAll("[data-nav]")].filter((el) => el.offsetParent !== null);
      const i = rows.indexOf(document.activeElement);
      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        const next = rows[i < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, i + (e.key === "j" ? 1 : -1)))];
        next?.focus();
        next?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Escape") {
        setOpenId(null);
      } else if (e.key === "m" && owner) {
        e.preventDefault();
        jumpToApps();
      } else if (e.key === "o" || e.key === "c" || (e.key === "a" && owner)) {
        const id = e.target.closest?.("li")?.querySelector("[data-row]")?.dataset.row;
        const r = id && roleById.get(id);
        if (!r) return;
        e.preventDefault();
        if (e.key === "o") window.open(r.url, "_blank", "noopener,noreferrer");
        else if (e.key === "c") copyLink(r);
        else mark(r);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [owner, roleById, mark, copyLink, jumpToApps]);

  const lock = async () => {
    await fetch("/api/grind/unlock", { method: "DELETE" }).catch(() => {});
    setApplied({ rows: null, error: null, loading: false });
    setAppliedMap(new Map());
    router.refresh();
  };

  const ctx = { now, since, owner, openId, onToggle, onMark: mark, onUndo, onCopy: copyLink, appliedFor };
  const isLive = genTs && now - genTs < 45 * 6e4;

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen w-full overflow-x-clip bg-ink text-fg selection:bg-accent selection:text-ink">
        <div aria-hidden className="bg-journal-dots pointer-events-none absolute inset-0 opacity-60" />
        <div ref={wrapRef} className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 md:px-8 md:pt-16">
          <Link href="/#projects" className="mb-12 inline-flex h-10 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-[color] duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to projects
          </Link>

          <header className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{"// grind · live pipeline feed"}</p>
              <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">Open roles</h1>
              <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-fg/70">
                {roles.length.toLocaleString()} internship and new-grad roles across the US, Canada and the UK, pulled from 7 public trackers every 15 minutes and deduplicated.
                Newest first; companies with a flood of postings fold up so everyone else stays visible.
              </p>
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs text-muted md:items-end">
              <span className="flex items-center gap-2"><LiveDot live={isLive} />updated {genTs ? `${ago(genTs, now)} ago` : "unknown"}</span>
              {newCount > 0 && f.age !== "new" && (
                <button type="button" onClick={() => set({ age: "new" })}
                  className="h-8 rounded-full border border-accent/40 px-3 text-accent transition-[background-color,transform] duration-150 hover:bg-accent/10 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  {newCount} new since your last visit
                </button>
              )}
            </div>
          </header>

          <div ref={barRef} className="sticky top-0 z-20 -mx-4 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented id="track" label="Track" value={f.track} onChange={(v) => set({ track: v })}
                options={[{ value: "all", label: "All", count: trackCounts.all }, { value: "swe", label: "SWE", count: trackCounts.swe }, { value: "pm", label: "PM", count: trackCounts.pm }]} />
              <Segmented id="view" label="Group by" value={f.view} onChange={(v) => set({ view: v })}
                options={[{ value: "fresh", label: "Freshness" }, { value: "company", label: "Company" }]} />
              <Search ref={searchRef} value={f.q} onChange={(v) => set({ q: v })} shortcut />
              {owner && (
                <button type="button" onClick={jumpToApps}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-accent-2/40 bg-accent-2/10 px-3 text-sm font-medium text-[#ddd6fe] transition-[background-color,transform] duration-150 hover:bg-accent-2/20 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                  My applications
                  {applied.rows && <span className="font-mono text-[11px] tabular-nums text-[#c4b5fd]">{activeApps} active</span>}
                  <span aria-hidden className="hidden md:inline-flex"><Kbd>m</Kbd></span>
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Select label="Posted" value={f.age} onChange={(v) => set({ age: v })}
                options={[{ value: "all", label: "Any time" }, { value: "today", label: "Today" }, { value: "week", label: "This week" }, { value: "month", label: "This month" }, ...(since ? [{ value: "new", label: "Since last visit" }] : [])]} />
              <Select label="Term" value={f.season} onChange={(v) => set({ season: v })}
                options={[{ value: "all", label: "Any term" }, ...seasons]} />
              <Chip active={f.top} onClick={() => set({ top: !f.top })}>Top companies</Chip>
              {owner && <Chip tone="private" active={f.hideApplied} onClick={() => set({ hideApplied: !f.hideApplied })}>Hide applied</Chip>}
              <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />
              {REGIONS.filter((g) => regionCounts[g] || f.regions.includes(g)).map((g) => (
                <Chip key={g} active={f.regions.includes(g)} count={regionCounts[g]} onClick={() => toggleRegion(g)}>{g}</Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 font-mono text-xs text-muted">
            <span><span className="text-fg"><Ticker value={filtered.length} /></span> roles</span>
            {dirty && (
              <button type="button" onClick={() => setF({ ...DEFAULTS, view: f.view })}
                className="h-8 rounded-md px-2 transition-[color] duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">
                Clear filters
              </button>
            )}
            <span className="ml-auto hidden items-center gap-4 lg:flex" aria-label="Keyboard shortcuts">
              <span><Kbd>/</Kbd> search</span>
              <span><Kbd>j</Kbd><Kbd>k</Kbd> move</span>
              <span><Kbd>↵</Kbd> expand</span>
              <span><Kbd>o</Kbd> open</span>
              <span><Kbd>c</Kbd> copy link</span>
              {owner && <span><Kbd>a</Kbd> mark applied</span>}
              {owner && <span><Kbd>m</Kbd> my applications</span>}
            </span>
          </div>

          {feedError ? (
            <div className="py-24">
              <p className="text-base text-fg">The pipeline feed didn&apos;t load: {feedError}.</p>
              <p className="mt-2 text-sm text-muted">GitHub may be rate-limiting or the bot-state branch is mid-publish. It usually clears within a minute.</p>
              <button type="button" onClick={() => router.refresh()} className="mt-6 h-10 rounded-lg bg-accent px-4 text-sm font-medium text-ink transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24">
              <p className="text-base text-fg">No roles match these filters.</p>
              <p className="mt-2 text-sm text-muted">Try another region or term, or widen the posted window.</p>
              <button type="button" onClick={() => setF({ ...DEFAULTS, view: f.view })} className="mt-6 h-10 rounded-lg border border-line px-4 text-sm text-fg transition-[border-color,transform] duration-150 hover:border-line-strong active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Clear filters
              </button>
            </div>
          ) : f.view === "company" ? (
            <CompanyList key={toQuery(live)} groups={groups} ctx={ctx} />
          ) : (
            <FreshList key={toQuery(live)} groups={groups} ctx={ctx} />
          )}

          {owner && <Dashboard rows={applied.rows} error={applied.error} loading={applied.loading} onRetry={loadApplied} onLock={lock} onStatusChange={setStatus} saving={saving} />}

          <Terminal owner={owner} onUnlocked={() => { try { localStorage.removeItem("grind_key"); } catch {} showToast({ msg: "Unlocked on this device for a year." }); router.refresh(); }} />
        </div>
        <Toast toast={toast} onDismiss={dismiss} />
      </main>
    </MotionConfig>
  );
}
