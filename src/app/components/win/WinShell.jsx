"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { setScrollRoot } from "@/lib/scroll";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { APPS, DESKTOP, HOT, PINNED, appFor } from "./apps";
import WinIcon, { IconDefs, Orb } from "./icons";
import StartMenu from "./StartMenu";
import ContextMenu from "./ContextMenu";
import WinBoot from "./WinBoot";
import { play, setSoundOn, wakeAudio } from "./sound";
import { leaveTo, reloadClean } from "./leave";
import { AppView, hasNative } from "./registry";
import { ShellContext } from "./context";
import "./win.css";

const BAR = 40;
const MIN_W = 360;
const MIN_H = 240;
const SIZES = { lg: { w: 108, h: 124 }, md: { w: 92, h: 100 }, sm: { w: 80, h: 78 } };
const ICONS_KEY = "omj-win-icons";
const SIZE_KEY = "omj-win-iconsize";
const EDGES = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];
const ClockFlyout = dynamic(() => import("./ClockFlyout"), { ssr: false });

let zTop = 10;
let cell = SIZES.md;

function applySize(id) {
  cell = SIZES[id];
  return id;
}
let animTimer = 0;

function animate() {
  document.documentElement.setAttribute("data-win-anim", "");
  clearTimeout(animTimer);
  animTimer = setTimeout(() => document.documentElement.removeAttribute("data-win-anim"), 260);
}

const BOOTED_KEY = "omj-win-booted";

const here = () => location.pathname + location.search;

function wantsBoot() {
  const root = document.documentElement;
  if (root.hasAttribute("data-win-boot")) return true;
  if (navigator.webdriver || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(BOOTED_KEY);
  } catch {
    return false;
  }
}


const desk = () => ({ w: innerWidth, h: innerHeight - BAR });

function geometry(app, count) {
  const { w: vw, h: vh } = desk();
  const max = app.kind === "page" && app.id === "music";
  const rows = Math.max(1, Math.floor((vh - 16) / cell.h));
  const left = 8 + Math.ceil(DESKTOP.length / rows) * cell.w + 12;
  const [sw, sh] = app.size ?? (app.kind === "page" ? [1180, vh - 56] : [760, 520]);
  const w = Math.min(sw, vw - left - 32);
  const step = (count % 8) * 28;
  const y = 20 + step;
  const h = Math.max(MIN_H, Math.min(sh, vh - y - 16));
  return { x: Math.min(Math.max(left, Math.round((vw - w) / 2)) + step, Math.max(left, vw - w - 16)), y: Math.min(y, vh - h - 8), w, h, max };
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

function readSize() {
  try {
    const s = localStorage.getItem(SIZE_KEY);
    if (SIZES[s]) return s;
  } catch {}
  return "md";
}

const kind = (id) => (APPS[id].icon === "folder" || APPS[id].icon === "games" ? 0 : (APPS[id].label ?? APPS[id].title).includes(".") ? 1 : 2);

const SORTS = {
  name: (a, b) => (APPS[a].label ?? APPS[a].title).localeCompare(APPS[b].label ?? APPS[b].title),
  type: (a, b) => kind(a) - kind(b) || SORTS.name(a, b),
};

function layoutIcons(saved, order = DESKTOP) {
  const rows = Math.max(1, Math.floor((desk().h - 16) / cell.h));
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
  for (const id of order) {
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
    document.documentElement.setAttribute("data-win-drag", "");
    const start = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
    const move = (m) => {
      const { w: vw, h: vh } = desk();
      const x = Math.min(vw - 120, Math.max(120 - win.w, start.x + m.clientX - start.px));
      const y = Math.min(vh - 30, Math.max(0, start.y + m.clientY - start.py));
      actions.patch(win.id, { x, y });
    };
    const up = () => {
      document.documentElement.removeAttribute("data-win-drag");
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
    document.documentElement.setAttribute("data-win-drag", "");
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
      document.documentElement.removeAttribute("data-win-drag");
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
        <AppView win={win} open={actions.open} fallback={<Soon win={win} />} />
      </div>
    </section>
  );
}

function iconBox(p) {
  return { left: 8 + p.c * cell.w, top: 12 + p.r * cell.h, right: 8 + p.c * cell.w + cell.w - 8, bottom: 12 + p.r * cell.h + cell.h - 8 };
}

function Desktop({ onOpen }) {
  const [size, setSize] = useState(() => applySize(readSize()));
  const [pos, setPos] = useState(() => layoutIcons(readIcons()));
  const [sel, setSel] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [band, setBand] = useState(null);
  const [menu, setMenu] = useState(null);
  const [gen, setGen] = useState(0);

  const savePos = (next) => {
    setPos(next);
    try {
      localStorage.setItem(ICONS_KEY, JSON.stringify(next));
    } catch {}
  };

  const startDrag = (id) => (e) => {
    if (e.button !== 0) return;
    setSel((cur) => (e.ctrlKey ? (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]) : cur.includes(id) ? cur : [id]));
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
      const rows = Math.max(1, Math.floor((desk().h - 16) / cell.h));
      const from = pos[id];
      const c = Math.max(0, Math.round((from.c * cell.w + u.clientX - start.px) / cell.w));
      const r = Math.min(rows - 1, Math.max(0, Math.round((from.r * cell.h + u.clientY - start.py) / cell.h)));
      const next = { ...pos };
      const other = Object.keys(next).find((k) => k !== id && next[k].c === c && next[k].r === r);
      if (other) next[other] = from;
      next[id] = { c, r };
      savePos(next);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const startBand = (e) => {
    if (e.target !== e.currentTarget || e.button !== 0) return;
    setSel([]);
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const move = (m) => {
      const b = { left: Math.min(x0, m.clientX), top: Math.min(y0, m.clientY), right: Math.max(x0, m.clientX), bottom: Math.max(y0, m.clientY) };
      setBand(b);
      setSel(
        DESKTOP.filter((id) => {
          const r = iconBox(pos[id]);
          return r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
        }),
      );
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setBand(null);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const arrange = { label: "Auto arrange icons", onSelect: () => savePos(layoutIcons({})) };

  const pickSize = (next) => {
    setSize(applySize(next));
    try {
      localStorage.setItem(SIZE_KEY, next);
    } catch {}
    savePos(layoutIcons(pos));
  };

  const sizeItem = (id, label) => ({ label, checked: size === id, onSelect: () => pickSize(id) });

  const openMenu = (e, id) => {
    e.preventDefault();
    if (id) setSel((cur) => (cur.includes(id) ? cur : [id]));
    const items = id
      ? [{ label: "Open", strong: true, onSelect: () => onOpen(APPS[id].path) }, "sep", arrange]
      : [
          { label: "View", items: [sizeItem("lg", "Large icons"), sizeItem("md", "Medium icons"), sizeItem("sm", "Small icons"), "sep", arrange] },
          {
            label: "Sort by",
            items: [
              { label: "Name", onSelect: () => savePos(layoutIcons({}, [...DESKTOP].sort(SORTS.name))) },
              { label: "Item type", onSelect: () => savePos(layoutIcons({}, [...DESKTOP].sort(SORTS.type))) },
            ],
          },
          { label: "Refresh", onSelect: () => setGen((g) => g + 1) },
          "sep",
          { label: "Personalize", onSelect: () => onOpen(APPS.personalize.path) },
          { label: "About Oladele", onSelect: () => onOpen(APPS.home.path) },
        ];
    setMenu({ x: e.clientX, y: e.clientY, items });
  };

  return (
    <div className="win-desktop" data-size={size} onPointerDown={startBand} onContextMenu={(e) => e.target === e.currentTarget && openMenu(e, null)}>
      {DESKTOP.map((id, i) => {
        const app = APPS[id];
        const p = pos[id];
        const d = dragging?.id === id ? dragging : null;
        return (
          <button
            key={`${id}-${gen}`}
            type="button"
            className="win-icon"
            data-selected={sel.includes(id) ? "" : undefined}
            data-dragging={d ? "" : undefined}
            style={{ "--i": i, transform: `translate(${p.c * cell.w + (d?.dx ?? 0)}px, ${p.r * cell.h + (d?.dy ?? 0)}px)` }}
            onPointerDown={startDrag(id)}
            onFocus={() => setSel((cur) => (cur.includes(id) ? cur : [id]))}
            onDoubleClick={() => onOpen(app.path)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(app.path)}
            onContextMenu={(e) => openMenu(e, id)}
          >
            <WinIcon name={app.icon} className="win-icon-img" />
            <span className="win-icon-label">{app.label ?? app.title}</span>
          </button>
        );
      })}
      {band && <div aria-hidden className="win-band" style={{ left: band.left, top: band.top, width: band.right - band.left, height: band.bottom - band.top }} />}
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <button type="button" className="win-clock" aria-label={`${now.toLocaleString()}. Show calendar`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
        <span>{now.toLocaleDateString()}</span>
      </button>
      {open && <ClockFlyout onClose={() => setOpen(false)} />}
    </>
  );
}

function TrayMore({ onOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    onOpen(APPS[id].path);
  };

  return (
    <div ref={ref} className="win-more">
      <button type="button" className="win-tray-btn win-more-btn" aria-label="Show hidden icons" title="Show hidden icons" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 10 10" aria-hidden><path d="M2 6.5l3-3 3 3" /></svg>
      </button>
      {open && (
        <div className="win-more-pop" role="group" aria-label="Hidden icons">
          {["personalize", "taskmgr", "games"].map((id) => (
            <button key={id} type="button" className="win-tray-btn" aria-label={APPS[id].title} title={APPS[id].title} onClick={() => go(id)}>
              <WinIcon name={APPS[id].icon} className="win-tray-ico" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NET_TIP = ["magbadelojr.com", "Internet access"].join("\n");

function hot(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`);
}

function Taskbar({ wins, focused, actions, startOpen, onStart }) {
  const { sound } = usePrefs();
  const [menu, setMenu] = useState(null);
  const open = wins.filter((w) => !w.closed);
  const ids = [...PINNED, ...open.map((w) => w.id).filter((id) => !PINNED.includes(id))];
  const onMenu = (e) => {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      host: e.currentTarget.parentElement,
      items: [
        { label: "Start Task Manager", onSelect: () => actions.open(APPS.taskmgr.path) },
        "sep",
        { label: "Show the desktop", onSelect: actions.showDesktop },
      ],
    });
  };
  return (
    <nav className="win-taskbar" aria-label="Taskbar" onContextMenu={onMenu}>
      <button type="button" className="win-orb" aria-label="Start" aria-expanded={startOpen} title="Start" onClick={onStart}>
        <Orb className="win-orb-img" />
      </button>
      <div className="win-tasks">
        {ids.map((id) => {
          const w = open.find((x) => x.id === id);
          const app = w ?? APPS[id];
          const active = !!w && focused === id && !w.min;
          return (
            <button
              key={id}
              type="button"
              data-task={id}
              data-running={w ? "" : undefined}
              className="win-task"
              aria-label={app.title}
              title={app.title}
              aria-pressed={w ? active : undefined}
              style={{ "--hot": HOT[app.icon] ?? HOT.doc }}
              onPointerMove={hot}
              onClick={() => (!w ? actions.open(app.path) : active ? actions.minimize(id) : actions.focus(id, { restore: true }))}
            >
              <WinIcon name={app.icon} className="win-task-ico" />
            </button>
          );
        })}
      </div>
      <div className="win-tray">
        <TrayMore onOpen={actions.open} />
        <span className="win-tray-btn win-net" role="img" aria-label="Network: Internet access" title={NET_TIP}>
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M3 17h2v-3H3zM7 17h2V11H7zM11 17h2V8h-2zM15 17h2V4h-2z" />
          </svg>
        </span>
        <button
          type="button"
          className="win-tray-btn"
          aria-label={sound ? "Mute sounds" : "Turn sounds on"}
          title={sound ? "Sounds on" : "Sounds off"}
          onClick={() => setPrefs({ sound: !sound })}
        >
          <WinIcon name={sound ? "speaker" : "mute"} className="win-tray-ico" />
        </button>
        <Clock />
        <button type="button" className="win-peek" aria-label="Show desktop" title="Show desktop" onClick={actions.showDesktop} />
      </div>
      {menu && createPortal(<ContextMenu {...menu} onClose={() => setMenu(null)} />, menu.host)}
    </nav>
  );
}

export default function WinShell() {
  const [pageEl] = useState(() => document.getElementById("win-page"));
  const [pageUrl] = useState(here);
  const [wins, setWins] = useState(() => {
    const app = appFor(here());
    return [makeWin(app, hasNative(app.id) ? "app" : "page", 0)];
  });
  const [focused, setFocused] = useState(() => appFor(here()).id);
  const [booting, setBooting] = useState(wantsBoot);
  const [startOpen, setStartOpen] = useState(false);
  const { sound } = usePrefs();
  const winsRef = useRef(wins);

  useEffect(() => {
    setSoundOn(sound);
  }, [sound]);

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
        const win = makeWin(app, "app", winsRef.current.filter((w) => !w.closed).length);
        winsRef.current = [...winsRef.current, win];
        setWins((ws) => [...ws, win]);
        play("open");
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
      open,
      patch: (id, next) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...next } : w))),
      minimize: (id) => {
        animate();
        play("minimize");
        setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
        setFocused((f) => (f === id ? null : f));
      },
      toggleMax: (id) => {
        animate();
        setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max } : w)));
      },
      close: (id) => {
        play("close");
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
    [focus, open],
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
      if (document.documentElement.dataset.pack !== "windows" && here() !== pageUrl) reloadClean();
    };
  }, [open, pageUrl]);

  useEffect(() => {
    const wake = () => wakeAudio();
    const onKey = (e) => {
      if (e.key === "Escape" && e.ctrlKey) {
        e.preventDefault();
        setStartOpen((o) => !o);
      }
    };
    window.addEventListener("pointerdown", wake, { once: true, capture: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", wake, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const endBoot = useCallback(() => {
    document.documentElement.removeAttribute("data-win-boot");
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {}
    setBooting(false);
  }, []);

  const closeStart = useCallback(({ restoreFocus } = {}) => {
    setStartOpen(false);
    if (restoreFocus) document.querySelector(".win-orb")?.focus();
  }, []);

  useEffect(() => {
    const onResize = () => setWins((ws) => [...ws]);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const shell = useMemo(() => ({ wins, focused, actions: stable }), [wins, focused, stable]);

  return (
    <ShellContext.Provider value={shell}>
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
      <Taskbar wins={wins} focused={focused} actions={stable} startOpen={startOpen} onStart={() => setStartOpen((o) => !o)} />
      {startOpen && (
        <StartMenu
          onOpen={open}
          onClose={closeStart}
          onShutDown={() => leaveTo("modern", "cyan")}
          onSwitchUser={() => leaveTo("paper", "cream")}
          onRestart={() => {
            setStartOpen(false);
            setBooting(true);
          }}
        />
      )}
      {booting && <WinBoot onDone={endBoot} />}
    </ShellContext.Provider>
  );
}
