"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const RAW_URL = "https://raw.githubusercontent.com/Omjnr06/Grind/bot-state/open_roles.json";

function timeAgo(iso) {
  if (!iso) return "unknown";
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

function shortDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GrindDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("ALL");
  const [q, setQ] = useState("");
  const [source, setSource] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [dashKey, setDashKey] = useState("");
  const [applied, setApplied] = useState(null);
  const [appliedError, setAppliedError] = useState(null);
  const [marking, setMarking] = useState({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${RAW_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message || "failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplied(key) {
    if (!key) return;
    setAppliedError(null);
    try {
      const res = await fetch(`/api/applied?key=${encodeURIComponent(key)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `HTTP ${res.status}`);
      setApplied(j.rows || []);
    } catch (e) {
      setAppliedError(e.message || "failed");
      setApplied(null);
    }
  }

  async function markApplied(r) {
    if (!dashKey) return;
    setMarking((m) => ({ ...m, [r.url]: "loading" }));
    try {
      const qs = new URLSearchParams({
        key: dashKey, c: r.company, r: r.title, loc: r.location, u: r.url, src: r.source,
      });
      const res = await fetch(`/api/applied?${qs.toString()}`, { method: "POST" });
      if (!res.ok) throw new Error();
      setMarking((m) => ({ ...m, [r.url]: "done" }));
      loadApplied(dashKey);
    } catch {
      setMarking((m) => ({ ...m, [r.url]: "error" }));
    }
  }

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    const stored = urlKey || window.localStorage.getItem("grind_key") || "";
    if (stored) {
      if (urlKey) window.localStorage.setItem("grind_key", urlKey);
      setDashKey(stored);
      loadApplied(stored);
    }
  }, []);

  const unlocked = !!dashKey;

  const roles = data?.roles || [];
  const sources = useMemo(() => ["ALL", ...Array.from(new Set(roles.map((r) => r.source)))], [roles]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = roles.filter((r) => {
      if (tier !== "ALL" && r.tier !== tier) return false;
      if (source !== "ALL" && r.source !== source) return false;
      if (needle) {
        const hay = `${r.company} ${r.title} ${r.location}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    if (sortBy === "NEWEST") {
      out.sort((a, b) => new Date(b.first_seen || 0) - new Date(a.first_seen || 0));
    }
    return out;
  }, [roles, tier, q, source, sortBy]);

  const targetCount = data?.counts?.target ?? 0;
  const relevantCount = data?.counts?.relevant ?? 0;

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[var(--accent-cyan)] selection:text-black relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-journal-dots opacity-80" />
      <div className="absolute top-[8%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-20">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-10 font-mono text-[10px] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Projects
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8">
          <div className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase mb-3">// Live pipeline feed</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Grind — Open Roles</h1>
          <p className="text-white/50 font-light max-w-2xl">
            The standing board from my internship-alert pipeline. It aggregates 5 sources every 15 minutes, dedupes by URL, and ranks by target company and location. This view reads the pipeline&apos;s latest published feed.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-white/40">
            <span className="text-[var(--accent-cyan)]">{targetCount} target</span>
            <span className="text-white/20">·</span>
            <span>{relevantCount} relevant</span>
            <span className="text-white/20">·</span>
            <span>updated {timeAgo(data?.generated_at)}</span>
            <button onClick={load} className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-[var(--accent-cyan)] border border-white/10 hover:border-[var(--accent-cyan)]/40 rounded px-3 py-1.5 transition-colors">
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5 p-1 rounded-lg bg-[#0a0a0a] border border-white/10">
            {[["ALL", "All"], ["A", "Targets"], ["B", "Relevant"]].map(([v, label]) => (
              <button key={v} onClick={() => setTier(v)}
                className={`px-3 py-1.5 rounded font-mono text-[11px] tracking-wide transition-colors ${tier === v ? "bg-[var(--accent-cyan)] text-black" : "text-white/50 hover:text-white/80"}`}>
                {label}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="filter by company, role, location..."
            className="flex-1 min-w-[200px] bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white/80 placeholder:text-white/25 focus:border-[var(--accent-cyan)]/40 focus:outline-none" />
          <select value={source} onChange={(e) => setSource(e.target.value)}
            className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white/70 focus:border-[var(--accent-cyan)]/40 focus:outline-none">
            {sources.map((s) => <option key={s} value={s}>{s === "ALL" ? "all sources" : s}</option>)}
          </select>
          <div className="flex gap-1.5 p-1 rounded-lg bg-[#0a0a0a] border border-white/10">
            {[["NEWEST", "Newest"], ["TIER", "By tier"]].map(([v, label]) => (
              <button key={v} onClick={() => setSortBy(v)}
                className={`px-3 py-1.5 rounded font-mono text-[11px] tracking-wide transition-colors ${sortBy === v ? "bg-[var(--accent-cyan)] text-black" : "text-white/50 hover:text-white/80"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {loading && <div className="font-mono text-sm text-white/40 py-16 text-center">loading feed...</div>}
        {error && <div className="font-mono text-sm text-red-400/80 py-16 text-center">could not load feed: {error}</div>}
        {!loading && !error && (
          <>
            <div className="font-mono text-[10px] text-white/30 mb-3">{filtered.length} shown</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((r, i) => (
                <div key={r.url + i} className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 transition-colors hover:border-[var(--accent-cyan)]/40 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${r.tier === "A" ? "border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)]" : "border-white/15 text-white/40"}`}>
                      {r.tier === "A" ? "TARGET" : "RELEVANT"}
                    </span>
                    {shortDate(r.first_seen) && (
                      <span className="font-mono text-[9px] text-white/30" title="When the pipeline first detected this role">
                        seen {shortDate(r.first_seen)}
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-white/25 ml-auto">{r.source}</span>
                  </div>
                  <div className="font-bold text-white/90 mb-1">{r.company}</div>
                  <div className="text-sm text-white/60 mb-3 flex-1">{r.title}</div>
                  <div className="font-mono text-[10px] text-white/35 mb-3">{r.location}{r.season ? ` · ${r.season}` : ""}</div>
                  <div className="flex gap-2">
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 font-mono text-[10px] uppercase tracking-widest text-center border border-white/10 hover:border-[var(--accent-cyan)]/50 hover:text-[var(--accent-cyan)] rounded px-3 py-2 transition-colors">
                      Apply →
                    </a>
                    {unlocked && (
                      <button onClick={() => markApplied(r)} disabled={marking[r.url] === "loading" || marking[r.url] === "done"}
                        className={`font-mono text-[10px] uppercase tracking-widest border rounded px-3 py-2 transition-colors ${
                          marking[r.url] === "done" ? "border-green-500/40 text-green-400/80"
                          : marking[r.url] === "error" ? "border-red-500/40 text-red-400/80"
                          : "border-[var(--accent-violet)]/40 text-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/10"}`}>
                        {marking[r.url] === "loading" ? "..." : marking[r.url] === "done" ? "Logged" : marking[r.url] === "error" ? "Failed" : "Mark Applied"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <div className="font-mono text-sm text-white/30 py-12 text-center">no roles match these filters.</div>}
          </>
        )}

        {unlocked && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-mono text-sm text-[var(--accent-violet)] tracking-widest uppercase">// Applied (private)</h2>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[var(--accent-violet)]/30 text-[var(--accent-violet)]/70">unlocked</span>
              <button onClick={() => loadApplied(dashKey)} className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-[var(--accent-violet)] border border-white/10 rounded px-3 py-1.5 transition-colors">Refresh</button>
            </div>
            {appliedError && <div className="font-mono text-xs text-red-400/80 py-4">could not load applied list: {appliedError}</div>}
            {applied && applied.length === 0 && <div className="font-mono text-xs text-white/30 py-4">no applications logged yet.</div>}
            {applied && applied.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1.6fr_1fr_0.8fr] gap-2 px-4 py-2 border-b border-white/10 font-mono text-[9px] uppercase tracking-widest text-white/30">
                  <span>Company</span><span>Role</span><span>Status</span><span>Date</span>
                </div>
                {applied.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1.4fr_1.6fr_1fr_0.8fr] gap-2 px-4 py-2.5 border-b border-white/5 last:border-0 items-center">
                    <span className="text-sm text-white/80 truncate">{a.company}</span>
                    <span className="text-xs text-white/50 truncate">{a.role}</span>
                    <span className="font-mono text-[10px] text-[var(--accent-cyan)]">{a.status}</span>
                    <span className="font-mono text-[10px] text-white/35">{a.dateApplied}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-2 text-white/40 font-mono text-sm">
          <span>omj@grind:~$</span>
          <span className="animate-pulse bg-white/60 w-2 h-4 inline-block" />
        </div>
      </div>
    </main>
  );
}