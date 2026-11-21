"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setScrollRoot } from "@/lib/scroll";
import { setPrefs } from "@/lib/prefs";
import { APPS, DESKTOP, appFor } from "./apps";
import WinIcon, { IconDefs, Orb } from "./icons";
import "./win.css";

const BAR = 40;
const MIN_W = 360;
const MIN_H = 240;
const CELL_W = 92;
const CELL_H = 100;
const ICONS_KEY = "omj-win-icons";
const EDGES = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

let zTop = 10;
let animTimer = 0;

function animate() {
  document.documentElement.setAttribute("data-win-anim", "");
  clearTimeout(animTimer);
  animTimer = setTimeout(() => document.documentElement.removeAttribute("data-win-anim"), 260);
}

const here = () => location.pathname + location.search;
const desk = () => ({ w: innerWidth, h: innerHeight - BAR });

function geometry(app, count) {
  const { w: vw, h: vh } = desk();
  const max = app.kind === "page" && app.id === "music";
  const rows = Math.max(1, Math.floor((vh - 16) / CELL_H));
  const left = 8 + Math.ceil(DESKTOP.length / rows) * CELL_W + 12;
  const w = Math.min(app.kind === "page" ? 1180 : 760, vw - left - 32);
  const h = Math.min(app.kind === "page" ? vh - 56 : 520, vh - 56);
  const step = (count % 8) * 28;
  return { x: Math.max(left, Math.round((vw - w) / 2)) + step, y: 20 + step, w, h, max };
}

function makeWin(app, kind, count) {
  const g = geometry({ ...app, kind }, count);
  return { ...app, kind, ...g, z: ++zTop, min: false, closed: false, prev: null };
}

function readIcons() {
  try {
    const saved = JSON.parse(localStorage.getItem(ICONS_KEY));
    if (saved && typeof saved === "object") return saved;
  } catch {}
  return {};
}

function layoutIcons(saved) {
  const rows = Math.max(1, Math.floor((desk().h - 16) / CELL_H));
  const taken = new Set();
  const out = {};
  for (const id of DESKTOP) {
    const s = saved[id];
    if (s && Number.isInteger(s.c) && Number.isInteger(s.r) && s.r < rows && !taken.has(`${s.c}:${s.r}`)) {
      out[id] = s;
      taken.add(`${s.c}:${s.r}`);
    }
  }
  let i = 0;
  for (const id of DESKTOP) {
    if (out[id]) continue;
    while (taken.has(`${Math.floor(i / rows)}:${i % rows}`)) i++;
    out[id] = { c: Math.floor(i / rows), r: i % rows };
    taken.add(`${out[id].c}:${out[id].r}`);
  }
  return out;
}

function minimizedTransform(win) {
  const btn = document.querySelector(`[data-task="${CSS.escape(win.id)}"]`);
  const r = btn?.getBoundingClientRect() ?? { left: innerWidth / 2, top: innerHeight, width: 0, height: 0 };
  const s = 0.12;
  return `translate(${Math.round(r.left + r.width / 2 - (win.w * s) / 2)}px, ${Math.round(r.top + r.height / 2 - (win.h * s) / 2)}px) scale(${s})`;
}

function frameStyle(win) {
  const g = win.max ? { x: 0, y: 0, ...desk() } : win;
  return {
    width: `${g.w}px`,
    height: `${g.h}px`,
    zIndex: win.z,
    transform: win.min ? minimizedTransform({ ...win, w: g.w, h: g.h }) : `translate(${g.x}px, ${g.y}px)`,
  };
}

function Chrome({ win, actions }) {
  const drag = (e) => {
    if (e.button !== 0 || e.target.closest("button") || win.max) return;
    e.preventDefault();
    const bar = e.currentTarget;
    bar.setPointerCapture(e.pointerId);
    const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
    const move = (m) => {
      const { w: vw, h: vh } = desk();
      const x = Math.min(vw - 120, Math.max(120 - win.w, start.x + m.clientX - start.px));
      const y = Math.min(vh - 30, Math.max(0, start.y + m.clientY - start.py));
      actions.patch(win.id, { x, y });
    };
    const up = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  };

  const resize = (edge) => (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const s = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    const move = (m) => {
      const dx = m.clientX - s.px;
      const dy = m.clientY - s.py;
      const next = {};
      if (edge.includes("e")) next.w = Math.max(MIN_W, s.w + dx);
      if (edge.includes("s")) next.h = Math.max(MIN_H, s.h + dy);
      if (edge.includes("w")) {
        next.w = Math.max(MIN_W, s.w - dx);
        next.x = s.x + s.w - next.w;
      }
      if (edge.includes("n")) {
        next.h = Math.max(MIN_H, s.h - dy);
        next.y = Math.max(0, s.y + s.h - next.h);
      }
      actions.patch(win.id, next);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return (
    <>
      <div className="win-bar" onPointerDown={drag} onDoubleClick={(e) => !e.target.closest("button") && actions.toggleMax(win.id)}>
        <WinIcon name={win.icon} className="win-bar-ico" />
        <span className="win-title">{win.title}</span>
        <div className="win-caps">
          <button type="button" className="win-cap" aria-label={`Minimize ${win.title}`} onClick={() => actions.minimize(win.id)}>
            <svg viewBox="0 0 10 10" aria-hidden><path d="M2 7.5h6" /></svg>
          </button>
          <button type="button" className="win-cap" aria-label={win.max ? `Restore ${win.title}` : `Maximize ${win.title}`} onClick={() => actions.toggleMax(win.id)}>
            <svg viewBox="0 0 10 10" aria-hidden>{win.max ? <path d="M3 1.5h5.5V7M1.5 3h5.5v5.5H1.5z" /> : <path d="M1.5 1.5h7v7h-7z" />}</svg>
          </button>
          <button type="button" className="win-cap win-cap-x" aria-label={`Close ${win.title}`} onClick={() => actions.close(win.id)}>
            <svg viewBox="0 0 10 10" aria-hidden><path d="M2 2l6 6M8 2L2 8" /></svg>
          </button>
        </div>
      </div>
      {!win.max && EDGES.map((d) => <div key={d} aria-hidden className={`win-rs win-rs-${d}`} onPointerDown={resize(d)} />)}
    </>
  );
}

function Soon({ win }) {
  return (
    <div className="win-soon">
      <WinIcon name={win.icon} className="win-soon-ico" />
      <h2>{win.title}</h2>
      <p>This window gets its own app in the next update. Until then you can open the page itself in this window.</p>
      <button type="button" onClick={() => location.assign(win.url)}>
        Open {win.title}
      </button>
    </div>
  );
}

function PageWindow({ win, focused, actions, el }) {
  useLayoutEffect(() => {
    el.classList.add("win");
    return () => el.classList.remove("win");
  }, [el]);

  useLayoutEffect(() => {
    Object.assign(el.style, frameStyle(win));
    el.toggleAttribute("data-focused", focused);
    el.toggleAttribute("data-min", win.min);
    el.toggleAttribute("data-max", win.max);
    el.toggleAttribute("data-closed", win.closed);
    el.setAttribute("aria-label", win.title);
  });

  useEffect(() => {
    const down = () => actions.focus(win.id);
    el.addEventListener("pointerdown", down, true);
    return () => el.removeEventListener("pointerdown", down, true);
  }, [el, win.id, actions]);

  useEffect(
    () => () => {
      el.removeAttribute("style");
      ["data-focused", "data-min", "data-max", "data-closed", "aria-label"].forEach((a) => el.removeAttribute(a));
    },
    [el],
  );

  return createPortal(<Chrome win={win} actions={actions} />, el);
}

function AppWindow({ win, focused, actions }) {
  return (
    <section
      className="win"
      aria-label={win.title}
      data-focused={focused ? "" : undefined}
      data-min={win.min ? "" : undefined}
      data-max={win.max ? "" : undefined}
      style={frameStyle(win)}
      onPointerDownCapture={() => actions.focus(win.id)}
    >
      <Chrome win={win} actions={actions} />
      <div className="win-client">
        <Soon win={win} />
      </div>
    </section>
  );
}

function Desktop({ onOpen }) {
  const [pos, setPos] = useState(() => layoutIcons(readIcons()));
  const [sel, setSel] = useState(null);
  const [dragging, setDragging] = useState(null);

  const startDrag = (id) => (e) => {
    if (e.button !== 0) return;
    setSel(id);
    const el = e.currentTarget;
    const start = { px: e.clientX, py: e.clientY };
    let moved = false;
    const move = (m) => {
      const dx = m.clientX - start.px;
      const dy = m.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) el.setPointerCapture(e.pointerId);
      moved = true;
      setDragging({ id, dx, dy });
    };
    const up = (u) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setDragging(null);
      if (!moved) return;
      const rows = Math.max(1, Math.floor((desk().h - 16) / CELL_H));
      const from = pos[id];
      const c = Math.max(0, Math.round((from.c * CELL_W + u.clientX - start.px) / CELL_W));
      const r = Math.min(rows - 1, Math.max(0, Math.round((from.r * CELL_H + u.clientY - start.py) / CELL_H)));
      const next = { ...pos };
      const other = Object.keys(next).find((k) => k !== id && next[k].c === c && next[k].r === r);
      if (other) next[other] = from;
      next[id] = { c, r };
      setPos(next);
      try {
        localStorage.setItem(ICONS_KEY, JSON.stringify(next));
      } catch {}
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return (
    <div className="win-desktop" onPointerDown={(e) => e.target === e.currentTarget && setSel(null)}>
      {DESKTOP.map((id) => {
        const app = APPS[id];
        const p = pos[id];
        const d = dragging?.id === id ? dragging : null;
        return (
          <button
            key={id}
            type="button"
            className="win-icon"
            data-selected={sel === id ? "" : undefined}
            data-dragging={d ? "" : undefined}
            style={{ transform: `translate(${p.c * CELL_W + (d?.dx ?? 0)}px, ${p.r * CELL_H + (d?.dy ?? 0)}px)` }}
            onPointerDown={startDrag(id)}
            onFocus={() => setSel(id)}
            onDoubleClick={() => onOpen(app.path)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(app.path)}
          >
            <WinIcon name={app.icon} className="win-icon-img" />
            <span className="win-icon-label">{app.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="win-clock" aria-label={now.toLocaleString()}>
      <span>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
      <span>{now.toLocaleDateString()}</span>
    </div>
  );
}

function Taskbar({ wins, focused, actions }) {
  const open = wins.filter((w) => !w.closed);
  return (
    <nav className="win-taskbar" aria-label="Taskbar">
      <button type="button" className="win-orb" aria-label="Show desktop" title="Show desktop" onClick={actions.showDesktop}>
        <Orb className="win-orb-img" />
      </button>
      <div className="win-tasks">
        {open.map((w) => (
          <button
            key={w.id}
            type="button"
            data-task={w.id}
            className="win-task"
            aria-pressed={focused === w.id && !w.min}
            onClick={() => (focused === w.id && !w.min ? actions.minimize(w.id) : actions.focus(w.id, { restore: true }))}
          >
            <WinIcon name={w.icon} className="win-task-ico" />
            <span>{w.title}</span>
          </button>
        ))}
      </div>
      <div className="win-tray">
        <button
          type="button"
          className="win-tray-btn"
          title="Leave Windows"
          aria-label="Leave Windows"
          onClick={() => {
            setPrefs({ pack: "modern", variant: "cyan" });
            location.reload();
          }}
        >
          <WinIcon name="power" className="win-tray-ico" />
        </button>
        <Clock />
      </div>
    </nav>
  );
}

export default function WinShell() {
  const [pageEl] = useState(() => document.getElementById("win-page"));
  const [pageUrl] = useState(here);
  const [wins, setWins] = useState(() => [makeWin(appFor(here()), "page", 0)]);
  const [focused, setFocused] = useState(() => appFor(here()).id);
  const winsRef = useRef(wins);

  useLayoutEffect(() => {
    winsRef.current = wins;
  });

  const sync = useCallback((id, mode) => {
    const w = winsRef.current.find((x) => x.id === id);
    if (!w || w.url === here()) return;
    if (mode === "push") history.pushState(null, "", w.url);
    else history.replaceState(history.state, "", w.url);
  }, []);

  const focus = useCallback(
    (id, { restore = false, mode = "replace" } = {}) => {
      setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: w.z === zTop ? w.z : ++zTop, min: restore ? false : w.min, closed: false } : w)));
      if (restore && winsRef.current.find((w) => w.id === id)?.min) animate();
      setFocused(id);
      sync(id, mode);
    },
    [sync],
  );

  const open = useCallback(
    (href, { push = true } = {}) => {
      const app = appFor(href);
      const exists = winsRef.current.find((w) => w.id === app.id);
      if (exists) {
        if (exists.min) animate();
        setWins((ws) => ws.map((w) => (w.id === app.id ? { ...w, z: ++zTop, min: false, closed: false } : w)));
      } else {
        const win = makeWin(app, "soon", winsRef.current.filter((w) => !w.closed).length);
        winsRef.current = [...winsRef.current, win];
        setWins((ws) => [...ws, win]);
      }
      setFocused(app.id);
      if (push && app.url !== here()) history.pushState(null, "", app.url);
      else if (!push && exists && exists.url !== here()) history.replaceState(history.state, "", exists.url);
    },
    [],
  );

  const stable = useMemo(
    () => ({
      focus,
      patch: (id, next) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...next } : w))),
      minimize: (id) => {
        animate();
        setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
        setFocused((f) => (f === id ? null : f));
      },
      toggleMax: (id) => {
        animate();
        setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max } : w)));
      },
      close: (id) => {
        const rest = winsRef.current.filter((w) => w.id !== id && !w.closed && !w.min).sort((a, b) => b.z - a.z);
        setWins((ws) => ws.flatMap((w) => (w.id !== id ? [w] : w.kind === "page" ? [{ ...w, closed: true, max: false, min: false }] : [])));
        const next = rest[0];
        setFocused(next?.id ?? null);
        if (next && next.url !== here()) history.replaceState(history.state, "", next.url);
      },
      showDesktop: () => {
        animate();
        setWins((ws) => ws.map((w) => ({ ...w, min: !w.closed ? true : w.min })));
        setFocused(null);
      },
    }),
    [focus],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    const client = document.getElementById("win-client");
    setScrollRoot(client);
    root.setAttribute("data-win-ready", "");
    return () => {
      setScrollRoot(null);
      root.removeAttribute("data-win-ready");
      root.removeAttribute("data-win-anim");
    };
  }, []);

  useEffect(() => {
    window.__omjWin = { open };
    const onPop = () => open(here(), { push: false });
    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname + url.search === here() && url.hash) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      open(url.pathname + url.search);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("click", onClick, true);
    return () => {
      delete window.__omjWin;
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("click", onClick, true);
      if (document.documentElement.dataset.pack !== "windows" && here() !== pageUrl) location.reload();
    };
  }, [open, pageUrl]);

  useEffect(() => {
    const onResize = () => setWins((ws) => [...ws]);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <IconDefs />
      <div className="win-wall" aria-hidden />
      <Desktop onOpen={open} />
      {wins.map((w) =>
        w.kind === "page" ? (
          <PageWindow key={w.id} win={w} focused={focused === w.id} actions={stable} el={pageEl} />
        ) : (
          <AppWindow key={w.id} win={w} focused={focused === w.id} actions={stable} />
        ),
      )}
      <Taskbar wins={wins} focused={focused} actions={stable} />
    </>
  );
}
