"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { profile } from "@/content/profile";
import { THEMES, PACKS, packFits } from "@/lib/themes";
import { BOOT_DONE_EVENT, PACK_BOOT_EVENT } from "@/lib/events";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { markPackBooted } from "@/lib/packSwitch";
import { track } from "@/lib/track";
import NotebookCover from "../paper/NotebookCover";

export const BOOT_MS = 2200;
const OPEN_MS = 1000;

const CMD = "boot --session";
const COMMIT = process.env.NEXT_PUBLIC_COMMIT || "local";
const BUILT = (process.env.NEXT_PUBLIC_BUILT_AT || "").slice(0, 10).replaceAll("-", ".");

const LABELS = [
  ...PACKS.map((p) => `:root[data-pack="${p.id}"] .boot-pack::before{content:"${p.label.toLowerCase()}"}`),
  ...Object.values(THEMES).flatMap((t) => t.variants.map((v) => `:root[data-theme="${v.id}"] .boot-theme::before{content:"${v.label.toLowerCase()}"}`)),
].join("");

const LINES = [
  ["whoami", `${profile.firstName} ${profile.lastName}`],
  ["status", profile.status],
  ["theme", <><span className="boot-pack" /> / <span className="boot-theme" /></>],
  ["build", <>{COMMIT}<span className="ml-3 text-muted">{BUILT}</span></>],
  ["now", profile.now],
].filter(([, v]) => v);

const STEP = 0.06;
const FIRST = 0.28;
const READY = FIRST + LINES.length * STEP;
const ARM = READY + 6 * STEP + 0.08;
const WAIT = 5;

const OPTIONS = [
  { id: "modern", label: "default", note: "dark terminal" },
  { id: "paper", label: "paper", note: "notebook" },
  { id: "windows", label: "windows", note: "classic desktop" },
];

function findTarget() {
  const mark = document.querySelector('[data-site-nav] [aria-label="About Oladele"]');
  if (mark && mark.getBoundingClientRect().width > 0) return mark;
  return document.querySelector("[data-site-nav]");
}

function lockScroll() {
  const block = (e) => e.preventDefault();
  const keys = (e) => {
    if ([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) e.preventDefault();
  };
  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", keys);
  return () => {
    window.removeEventListener("wheel", block);
    window.removeEventListener("touchmove", block);
    window.removeEventListener("keydown", keys);
  };
}

function collapse(el, target, ms) {
  const box = el.getBoundingClientRect();
  const body = el.querySelector("[data-boot-body]");
  const ease = "cubic-bezier(0.65, 0, 0.25, 1)";
  body.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }], { duration: ms * 0.45, easing: "ease-in", fill: "forwards" });
  let to = `inset(50% 50% 50% 50% round 12px)`;
  if (target) {
    const r = target.getBoundingClientRect();
    const round = `${Math.min(parseFloat(getComputedStyle(target).borderTopLeftRadius) || 8, r.height / 2)}px`;
    to = `inset(${r.top - box.top}px ${box.right - r.right}px ${box.bottom - r.bottom}px ${r.left - box.left}px round ${round})`;
  }
  return el.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: to }], { duration: ms, easing: ease, fill: "forwards" }).finished;
}

export default function Boot({ auto = false, duration = BOOT_MS, contained = false, target, onDone }) {
  const ref = useRef(null);
  const done = useRef(onDone);
  const [gone, setGone] = useState(false);
  const [left, setLeft] = useState(null);
  const [stopped, setStopped] = useState(false);
  const [active, setActive] = useState(0);
  const [fits, setFits] = useState(true);
  const [def, setDef] = useState("modern");
  const leaveRef = useRef(null);
  const finishRef = useRef(null);
  const chosen = useRef(false);
  const { pack } = usePrefs();

  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (auto && !root.hasAttribute("data-boot")) return;
    const start = auto && typeof window.__omjBootAt === "number" ? window.__omjBootAt : performance.now();
    const unlock = contained ? () => {} : lockScroll();
    let alive = true;
    const finish = () => {
      unlock();
      if (!alive) return;
      if (auto) ["data-boot", "data-boot-menu", "data-boot-live", "data-boot-default"].forEach((a) => root.removeAttribute(a));
      if (!contained) window.dispatchEvent(new Event(BOOT_DONE_EVENT));
      setGone(true);
      done.current?.();
    };
    const paper = !contained && root.dataset.pack === "paper";
    const openBook = () => {
      const el = ref.current;
      if (!el) return finish();
      if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-in", fill: "forwards" }).finished.then(finish, finish);
        return;
      }
      root.setAttribute("data-boot-open", "");
      const t = document.startViewTransition(() => {
        unlock();
        if (auto) root.removeAttribute("data-boot");
        if (alive) flushSync(() => setGone(true));
      });
      t.ready.catch(() => {});
      t.updateCallbackDone.catch(() => {});
      t.finished
        .catch(() => {})
        .finally(() => {
          root.removeAttribute("data-boot-open");
          window.dispatchEvent(new Event(BOOT_DONE_EVENT));
          if (alive) done.current?.();
        });
    };
    const leave = () => {
      if (paper) return openBook();
      const el = ref.current;
      if (!el) return finish();
      const goal = contained ? target?.current : findTarget();
      collapse(el, goal, duration * 0.3).then(finish, finish);
    };
    leaveRef.current = leave;
    finishRef.current = finish;
    const menu = auto && root.hasAttribute("data-boot-menu");
    if (menu) root.setAttribute("data-boot-live", "");
    const id = menu
      ? setTimeout(() => {
          const fit = packFits("windows");
          const asked = OPTIONS.findIndex((o) => o.id === root.dataset.bootDefault && (o.id !== "windows" || fit));
          setFits(fit);
          if (asked > 0 && !chosen.current) {
            setDef(OPTIONS[asked].id);
            setActive(asked);
          }
          setLeft((l) => (chosen.current ? l : WAIT));
        }, Math.max(0, start + duration * ARM - performance.now()))
      : setTimeout(leave, Math.max(0, start + (paper ? duration - OPEN_MS : duration * 0.7) - performance.now()));
    return () => {
      alive = false;
      clearTimeout(id);
      unlock();
    };
  }, [auto, contained, duration, target]);

  const choose = (next) => {
    if (chosen.current) return;
    if (next === "windows" && !packFits("windows")) return;
    chosen.current = true;
    setLeft(null);
    track("pack_selected", next);
    const patch = { pack: next, variant: THEMES[next].variants[0].id };
    const root = document.documentElement;
    if (next === "modern") {
      setPrefs(patch);
      leaveRef.current?.();
      return;
    }
    if (next === "paper") {
      markPackBooted("paper");
      root.setAttribute("data-pack-boot", "paper");
    }
    finishRef.current?.();
    setPrefs(patch);
    if (next === "paper") window.dispatchEvent(new CustomEvent(PACK_BOOT_EVENT, { detail: "paper" }));
  };

  const chooseRef = useRef(choose);
  useEffect(() => {
    chooseRef.current = choose;
  });

  useEffect(() => {
    if (left === null) return;
    const id = setTimeout(() => (left <= 1 ? chooseRef.current(def) : setLeft(left - 1)), 1000);
    return () => clearTimeout(id);
  }, [left, def]);

  const live = left !== null || stopped;
  const stop = () => {
    if (chosen.current) return;
    setLeft(null);
    setStopped(true);
  };
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  });

  useEffect(() => {
    if (!live) return;
    const box = ref.current;
    const usable = OPTIONS.map((o, i) => (o.id !== "windows" || fits ? i : -1)).filter((i) => i >= 0);
    const onKey = (e) => {
      if (chosen.current || e.metaKey || e.ctrlKey || e.altKey) return;
      stopRef.current();
      const n = Number(e.key);
      if (n >= 1 && n <= OPTIONS.length) {
        e.preventDefault();
        return chooseRef.current(OPTIONS[n - 1].id);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        return chooseRef.current(def);
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const cur = Number(box?.querySelector("[data-active]")?.dataset.index ?? 0);
        const at = usable.indexOf(cur);
        const next = usable[(at + (e.key === "ArrowDown" ? 1 : -1) + usable.length) % usable.length];
        setActive(next);
        box?.querySelector(`[data-opt="${OPTIONS[next].id}"]`)?.focus({ preventScroll: true });
        return;
      }
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        const cur = Number(box?.querySelector("[data-active]")?.dataset.index ?? 0);
        chooseRef.current(OPTIONS[cur].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, fits, def]);

  if (gone) return null;

  return (
    <div
      ref={ref}
      data-auto={auto ? "" : undefined}
      data-contained={contained ? "" : undefined}
      className={`boot bg-ink font-mono text-fg ${contained ? "!absolute" : ""}`}
      style={{ "--boot": `${duration}ms`, "--n": CMD.length }}
    >
      <style>{LABELS}</style>
      {!contained && (
        <div className="boot-nb">
          <div className="book-base" />
          <NotebookCover photo={pack === "paper"} className="boot-nb-cover" />
        </div>
      )}
      <div data-boot-body="" className={`boot-term w-full ${contained ? "px-6 text-[11px] leading-[1.7]" : "px-6 text-[13px] leading-[1.8] md:pl-[max(8rem,12vw)] md:text-sm"}`}>
        <p aria-hidden className="whitespace-nowrap">
          <span className="text-accent">omj@magbadelojr</span>
          <span className="text-muted"> ~ % </span>
          <span className="boot-cmd">{CMD}</span>
          <span data-first="" className="boot-caret ml-0.5 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
        </p>
        <div aria-hidden className="mt-2">
          {LINES.map(([key, value], i) => (
            <p key={key} className="boot-line flex min-w-0 gap-4" style={{ "--at": FIRST + i * STEP }}>
              <span className="w-[7ch] shrink-0 text-muted">{key}</span>
              <span className="min-w-0 truncate text-fg/90">{value}</span>
            </p>
          ))}
        </div>
        <p aria-hidden className="boot-line mt-2 text-accent" style={{ "--at": READY }}>
          ready
          <span className="boot-caret ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
        </p>
        <div aria-hidden className={`boot-track mt-6 h-px bg-line ${contained ? "w-40" : "w-full max-w-72"}`}>
          <div className="boot-bar h-px bg-accent" />
        </div>
        {auto && (
          <div className="boot-menu mt-5" role="group" aria-label="Choose a version" onPointerDown={stop}>
            <p className="boot-line text-muted" style={{ "--at": READY + STEP }}>
              select a version
            </p>
            <div className="mt-1 flex flex-col items-start">
              {OPTIONS.map((o, i) => {
                const off = o.id === "windows" && !fits;
                return (
                  <button
                    key={o.id}
                    type="button"
                    data-opt={o.id}
                    data-index={i}
                    data-active={active === i || undefined}
                    disabled={off}
                    className="boot-line boot-opt"
                    style={{ "--at": READY + (i + 2) * STEP }}
                    onPointerEnter={() => {
                      if (off) return;
                      stop();
                      setActive(i);
                    }}
                    onFocus={() => setActive(i)}
                    onClick={() => choose(o.id)}
                  >
                    <span aria-hidden className="boot-arrow">&gt;</span>
                    <span aria-hidden className="text-muted">[{i + 1}]</span>
                    <span className="w-[9ch]">{o.label}</span>
                    <span className="text-muted">{off ? "desktop only" : o.note}</span>
                  </button>
                );
              })}
            </div>
            <p className="boot-line mt-2 min-h-[1.8em] text-muted" style={{ "--at": READY + 5 * STEP }}>
              {left !== null ? (
                <>
                  booting <span className="text-fg">{OPTIONS.find((o) => o.id === def).label}</span> in <span className="tabular-nums text-fg">{left}</span>
                </>
              ) : stopped ? (
                <>
                  press <span className="text-fg">enter</span> to boot
                </>
              ) : (
                "\u00a0"
              )}
              <span className="ml-4 max-md:hidden">↑↓ to move, 1 2 3 to pick</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
