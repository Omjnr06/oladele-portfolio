export const DAY = 864e5;

export const DEFAULTS = { track: "all", top: false, regions: [], season: "all", age: "all", q: "", view: "fresh", hideApplied: false };

export const BUCKETS = [
  { key: "today", label: "Today", max: DAY },
  { key: "week", label: "This week", max: 7 * DAY },
  { key: "month", label: "This month", max: 30 * DAY },
  { key: "older", label: "Older", max: Infinity },
];

export const ROLLUP_AFTER = 3;

const one = (v) => (Array.isArray(v) ? v[0] : v);

export function parseParams(sp = {}) {
  const track = one(sp.track);
  const age = one(sp.age);
  return {
    track: ["swe", "pm"].includes(track) ? track : "all",
    top: one(sp.top) === "1",
    regions: (one(sp.region) || "").split(",").map((s) => s.trim()).filter(Boolean),
    season: one(sp.season) || "all",
    age: ["today", "week", "month", "new"].includes(age) ? age : "all",
    q: one(sp.q) || "",
    view: one(sp.view) === "company" ? "company" : "fresh",
    hideApplied: one(sp.hide) === "applied",
  };
}

export function toQuery(f) {
  const p = new URLSearchParams();
  if (f.track !== "all") p.set("track", f.track);
  if (f.top) p.set("top", "1");
  if (f.regions.length) p.set("region", f.regions.join(","));
  if (f.season !== "all") p.set("season", f.season);
  if (f.age !== "all") p.set("age", f.age);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.view !== "fresh") p.set("view", f.view);
  if (f.hideApplied) p.set("hide", "applied");
  const s = p.toString().replaceAll("%2C", ",");
  return s ? `?${s}` : "";
}

export const normUrl = (u) => (u || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();

export function bucketOf(seen, now) {
  const age = now - seen;
  return BUCKETS.find((b) => age < b.max).key;
}

export function filterRoles(roles, f, { now, since, isApplied }) {
  const needle = f.q.trim().toLowerCase();
  const maxAge = f.age === "today" ? DAY : f.age === "week" ? 7 * DAY : f.age === "month" ? 30 * DAY : Infinity;
  return roles.filter((r) => {
    if (f.track !== "all" && r.track !== f.track) return false;
    if (f.top && r.tier !== "A") return false;
    if (f.regions.length && !r.regions.some((g) => f.regions.includes(g))) return false;
    if (f.season !== "all" && r.season !== f.season) return false;
    if (f.age === "new" ? !(since && r.seen > since) : now - r.seen > maxAge) return false;
    if (f.hideApplied && isApplied(r)) return false;
    if (needle && !`${r.company} ${r.title} ${r.location}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

export function groupByFreshness(list, now) {
  const sorted = [...list].sort((a, b) => b.seen - a.seen);
  return BUCKETS.map((b) => {
    const roles = sorted.filter((r) => bucketOf(r.seen, now) === b.key);
    const byCompany = new Map();
    for (const r of roles) byCompany.set(r.ck, (byCompany.get(r.ck) || 0) + 1);
    const shown = new Map();
    const entries = [];
    const extra = new Map();
    for (const r of roles) {
      const n = (shown.get(r.ck) || 0) + 1;
      shown.set(r.ck, n);
      if (n <= ROLLUP_AFTER || byCompany.get(r.ck) <= ROLLUP_AFTER + 1) {
        entries.push({ type: "role", role: r });
        if (n === ROLLUP_AFTER && byCompany.get(r.ck) > ROLLUP_AFTER + 1) {
          const rest = { type: "more", key: `${b.key}:${r.ck}`, company: r.company, roles: [] };
          extra.set(r.ck, rest);
          entries.push(rest);
        }
      } else {
        extra.get(r.ck).roles.push(r);
      }
    }
    return { ...b, count: roles.length, entries };
  }).filter((g) => g.count);
}

export function groupByCompany(list) {
  const map = new Map();
  for (const r of list) {
    if (!map.has(r.ck)) map.set(r.ck, { key: r.ck, company: r.company, roles: [], newest: 0, top: false });
    const g = map.get(r.ck);
    g.roles.push(r);
    g.newest = Math.max(g.newest, r.seen);
    g.top = g.top || r.tier === "A";
  }
  const groups = [...map.values()];
  groups.forEach((g) => g.roles.sort((a, b) => b.seen - a.seen));
  return groups.sort((a, b) => b.newest - a.newest);
}

const TERM_ORDER = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };

export function seasonOptions(roles) {
  const counts = new Map();
  for (const r of roles) counts.set(r.season, (counts.get(r.season) || 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => {
      if (a === "Unspecified") return 1;
      if (b === "Unspecified") return -1;
      const [ta, ya = "9999"] = a.split(" ");
      const [tb, yb = "9999"] = b.split(" ");
      return ya.localeCompare(yb) || TERM_ORDER[ta] - TERM_ORDER[tb];
    })
    .map(([value, count]) => ({ value, count, label: value === "Unspecified" ? "Term not listed" : value.includes(" ") ? value : `${value} (no year)` }));
}

export function ago(ts, now) {
  const m = Math.max(0, Math.round((now - ts) / 6e4));
  if (m < 60) return `${m || 1}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
