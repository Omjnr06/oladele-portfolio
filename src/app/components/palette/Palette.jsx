"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prepare, search, parseCommand } from "@/lib/search";
import { lockScroll, scrollToId, scrollToTop } from "@/lib/scroll";
import { THEMES } from "@/lib/themes";
import { themeTransition } from "@/lib/themeTransition";
import { setPrefs } from "@/lib/prefs";
import { track } from "@/lib/track";

const RECENT_KEY = "omj-palette-recent";
const GROUPS = {
  recent: "Recent",
  page: "Pages",
  section: "Pages",
  project: "Projects",
  experience: "Resume",
  skill: "Skills",
  clip: "Music",
  photo: "Photos",
  link: "Links",
  action: "Actions",
};

let indexPromise = null;
const loadIndex = () =>
  (indexPromise ??= fetch("/palette-index.json")
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(prepare)
    .catch((err) => {
      indexPromise = null;
      throw err;
    }));

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecent = (id) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecent().filter((x) => x !== id)].slice(0, 5)));
  } catch {}
};

function clientActions() {
  const out = [{ id: "action-top", type: "action", title: "Back to top", sub: "Scroll this page to the top", act: "top", keys: ["scroll", "top", "up"] }];
  out.push(
    { id: "action-nav-rail", type: "action", title: "Nav: side rail", sub: "Show the navigation as a side rail", act: "nav", value: "rail", keys: ["nav", "rail", "sidebar", "layout"] },
    { id: "action-nav-pill", type: "action", title: "Nav: top bar", sub: "Show the navigation as a floating top bar", act: "nav", value: "pill", keys: ["nav", "pill", "top", "bar", "layout"] },
  );
  for (const [pack, t] of Object.entries(THEMES)) {
    for (const v of t.variants) {
      out.push({ id: `theme-${pack}-${v.id}`, type: "action", title: `Theme: ${t.label} ${v.label}`, sub: "Switch the site's look", act: "theme", value: { pack, variant: v.id }, keys: ["theme", pack, v.id] });
    }
  }
  return out;
}

const parentOf = (path) => {
  if (path === "/") return null;
  if (path.startsWith("/projects/")) return "/#projects";
  return "/";
};

const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || "");

function Row({ id, result, active, onPick, onHover }) {
  const { item, why } = result;
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onClick={onPick}
      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-100 ${active ? "bg-accent/10" : ""}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{item.title}</span>
        <span className={`block truncate text-xs ${why ? "text-accent/80" : "text-muted"}`}>{why ?? item.sub}</span>
      </span>
      {item.external && (
        <svg aria-label="Opens in a new tab" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      )}
      <kbd aria-hidden className={`font-mono text-[11px] text-muted ${active ? "visible" : "invisible"}`}>↵</kbd>
    </div>
  );
}

export default function Palette({ onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const releaseRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState(null);
  const [failed, setFailed] = useState(false);
  const [note, setNote] = useState(null);
  const [extras] = useState(clientActions);
  const [recent] = useState(readRecent);
  const [mac] = useState(isMac);

  useEffect(() => {
    let alive = true;
    loadIndex().then(
      (i) => alive && setIndex(i),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, []);

  const pool = useMemo(() => {
    if (!index) return null;
    const actions = prepare({ items: extras, aliases: [] }).items;
    return { ...index, items: [...index.items, ...actions] };
  }, [index, extras]);

  const groups = useMemo(() => {
    if (!pool) return [];
    const { query: q, command } = parseCommand(query);
    if (command === "up") {
      const to = parentOf(pathname);
      return to ? [{ label: "Pages", rows: [{ item: { id: "up", type: "page", title: "Go up", sub: to, href: to }, why: null }] }] : [];
    }
    if (!q.trim()) {
      const byId = new Map(pool.items.map((i) => [i.id, i]));
      const rec = recent.map((id) => byId.get(id)).filter(Boolean);
      const jump = pool.items.filter((i) => i.type === "page" || i.type === "section");
      const acts = pool.items.filter((i) => i.type === "action");
      return [
        { label: "Recent", rows: rec },
        { label: "Jump to", rows: jump },
        { label: "Actions", rows: acts },
      ]
        .map((g) => ({ ...g, rows: g.rows.map((item) => ({ item, why: null })) }))
        .filter((g) => g.rows.length);
    }
    const results = search(pool, q, { limit: 40, types: command === "cd" ? ["page", "section", "project"] : null });
    const order = [];
    const map = new Map();
    for (const r of results) {
      const label = GROUPS[r.item.type] ?? "More";
      if (!map.has(label)) {
        map.set(label, []);
        order.push(label);
      }
      if (map.get(label).length < 6) map.get(label).push(r);
    }
    return order.map((label) => ({ label, rows: map.get(label) }));
  }, [pool, query, recent, pathname]);

  const flat = useMemo(() => groups.flatMap((g) => g.rows), [groups]);
  const current = Math.min(active, Math.max(0, flat.length - 1));

  const release = () => {
    releaseRef.current?.();
    releaseRef.current = null;
  };

  const go = (href) => {
    const url = new URL(href, location.origin);
    const here = url.pathname === location.pathname;
    const photo = url.searchParams.get("photo");
    if (here && photo) {
      window.dispatchEvent(new CustomEvent("omj:photo", { detail: photo }));
      scrollToId("gallery");
    } else if (here && url.hash) {
      scrollToId(url.hash.slice(1));
    } else if (here && url.pathname === "/music" && url.search) {
      location.assign(href);
    } else if (here && !url.search) {
      scrollToTop();
    } else {
      router.push(href);
    }
  };

  const run = (result) => {
    const { item } = result;
    if (!item) return;
    track("palette_used", item.type);
    if (item.id !== "up") saveRecent(item.id);
    if (item.act === "copy") {
      navigator.clipboard?.writeText(item.value).then(
        () => setNote("Copied"),
        () => setNote("Couldn't copy"),
      );
      setTimeout(onClose, 700);
      return;
    }
    release();
    onClose();
    if (item.act === "top") scrollToTop();
    else if (item.act === "theme") {
      track("variant_selected", item.value.variant);
      themeTransition(null, () => setPrefs(item.value));
    } else if (item.act === "nav") setPrefs({ navMode: item.value });
    else if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else if (item.href) go(item.href);
  };

  const runRef = useRef(run);
  const stateRef = useRef({ flat, current });
  useEffect(() => {
    runRef.current = run;
    stateRef.current = { flat, current };
  });

  useEffect(() => {
    const prev = document.activeElement;
    releaseRef.current = lockScroll();
    inputRef.current?.focus();
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") return;
      e.stopPropagation();
      const { flat, current } = stateRef.current;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!flat.length) return;
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((current + step + flat.length) % flat.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        runRef.current(flat[current] ?? {});
      } else if (e.key === "Tab") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      releaseRef.current?.();
      releaseRef.current = null;
      if (prev instanceof HTMLElement && prev.isConnected) prev.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    listRef.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
  }, [current, groups]);

  const optionId = (i) => `${listId}-o${i}`;
  const empty = !!pool && !flat.length;
  let n = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div aria-hidden className="palette-fade absolute inset-0 bg-scrim/60" onMouseDown={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search the site" className="palette-in relative flex max-h-[76vh] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_2px_4px_rgb(0_0_0/.3),0_24px_64px_-12px_rgb(0_0_0/.7)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat.length ? optionId(current) : undefined}
            aria-label="Search the site"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search projects, skills, music…"
            spellCheck={false}
            autoComplete="off"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 font-mono text-[11px] leading-5 text-muted">esc</kbd>
        </div>

        {!query && pool?.chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Try</span>
            {pool.chips.map((c) => (
              <button
                key={c}
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setQuery(c);
                  setActive(0);
                  inputRef.current?.focus();
                }}
                className="min-h-8 rounded-full border border-line px-3 text-xs text-fg/80 transition-[border-color,color,transform] duration-150 hover:border-accent/40 hover:text-fg active:scale-95"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {!pool && !failed && <p className="px-3 py-6 text-sm text-muted">Loading…</p>}
          {failed && <p className="px-3 py-6 text-sm text-muted">Search couldn&apos;t load. Check your connection and press Ctrl K again.</p>}
          {empty && (
            <p className="px-3 py-6 text-sm text-muted">
              No matches for &ldquo;{query.trim()}&rdquo;. Try a skill like Python, an instrument, or a page name.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label} className="pb-1">
              <p aria-hidden className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{g.label}</p>
              {g.rows.map((r) => {
                n += 1;
                const i = n;
                return <Row key={`${g.label}-${r.item.id}`} id={optionId(i)} result={r} active={i === current} onHover={() => i !== current && setActive(i)} onPick={() => run(r)} />;
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
          {note ? (
            <span role="status" className="text-accent">{note}</span>
          ) : (
            <>
              <span>↑↓ move</span>
              <span>↵ open</span>
              <span>esc close</span>
            </>
          )}
          <span className="ml-auto">{mac ? "⌘K" : "Ctrl K"}</span>
        </div>
      </div>
    </div>
  );
}
