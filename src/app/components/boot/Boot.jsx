"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { profile } from "@/content/profile";
import { THEMES, PACKS } from "@/lib/themes";
import { BOOT_DONE_EVENT } from "@/lib/events";
import { usePrefs } from "@/lib/prefs";
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
      if (auto) root.removeAttribute("data-boot");
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
    const id = setTimeout(
      () => {
        if (paper) return openBook();
        const el = ref.current;
        if (!el) return finish();
        const goal = contained ? target?.current : findTarget();
        collapse(el, goal, duration * 0.3).then(finish, finish);
      },
      Math.max(0, start + (paper ? duration - OPEN_MS : duration * 0.7) - performance.now()),
    );
    return () => {
      alive = false;
      clearTimeout(id);
      unlock();
    };
  }, [auto, contained, duration, target]);

  if (gone) return null;

  return (
    <div
      ref={ref}
      data-auto={auto ? "" : undefined}
      data-contained={contained ? "" : undefined}
      aria-hidden
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
        <p className="whitespace-nowrap">
          <span className="text-accent">omj@magbadelojr</span>
          <span className="text-muted"> ~ % </span>
          <span className="boot-cmd">{CMD}</span>
          <span data-first="" className="boot-caret ml-0.5 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
        </p>
        <div className="mt-2">
          {LINES.map(([key, value], i) => (
            <p key={key} className="boot-line flex min-w-0 gap-4" style={{ "--at": FIRST + i * STEP }}>
              <span className="w-[7ch] shrink-0 text-muted">{key}</span>
              <span className="min-w-0 truncate text-fg/90">{value}</span>
            </p>
          ))}
        </div>
        <p className="boot-line mt-2 text-accent" style={{ "--at": READY }}>
          ready
          <span className="boot-caret ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
        </p>
        <div className={`mt-6 h-px bg-line ${contained ? "w-40" : "w-full max-w-72"}`}>
          <div className="boot-bar h-px bg-accent" />
        </div>
      </div>
    </div>
  );
}
