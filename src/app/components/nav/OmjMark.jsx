"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { contact } from "@/content/contact";
import { BOOT_DONE_EVENT } from "@/lib/events";

const TEXT = "OMJ";
const GLYPHS = "<>/\\_#$%&*01";
const BUILT = process.env.NEXT_PUBLIC_BUILT_AT;
const COMMIT = process.env.NEXT_PUBLIC_COMMIT;
const github = contact.find((c) => c.id === "github")?.href;

const noop = () => () => {};
const useNow = () => useSyncExternalStore(noop, () => Math.floor(Date.now() / 60000), () => null);

function ago(min) {
  if (min < 2) return "just now";
  if (min < 60) return `${min}m ago`;
  if (min < 48 * 60) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 1440)}d ago`;
}

let activityPromise = null;
const loadActivity = () =>
  (activityPromise ??= fetch("/api/activity")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => d?.activity ?? null)
    .catch(() => null));

function useActivity() {
  const [activity, setActivity] = useState(null);
  useEffect(() => {
    let alive = true;
    const run = () => loadActivity().then((a) => alive && setActivity(a));
    const id = "requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1500);
    return () => {
      alive = false;
      if ("cancelIdleCallback" in window) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);
  return activity;
}

function useScramble() {
  const [text, setText] = useState(TEXT);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const run = () => {
    if (timer.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const end = 5 + TEXT.length * 2;
    timer.current = setInterval(() => {
      frame += 1;
      setText(TEXT.split("").map((c, i) => (frame > 4 + i * 2 ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
      if (frame >= end) {
        clearInterval(timer.current);
        timer.current = null;
        setText(TEXT);
      }
    }, 45);
  };
  return [text, run];
}

export default function OmjMark({ className = "" }) {
  const [text, scramble] = useScramble();
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const card = useRef(null);
  const now = useNow();
  const activity = useActivity();
  const since = (iso) => (now != null && iso ? Math.max(0, now - Math.floor(Date.parse(iso) / 60000)) : null);
  const minutes = since(activity?.at ?? BUILT);
  const fresh = minutes != null && minutes < 24 * 60;

  useEffect(() => {
    window.addEventListener(BOOT_DONE_EVENT, scramble);
    return () => window.removeEventListener(BOOT_DONE_EVENT, scramble);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btn.current?.focus();
    };
    const onDown = (e) => {
      if (card.current?.contains(e.target) || btn.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btn}
        type="button"
        aria-label="About Oladele"
        aria-expanded={open}
        aria-haspopup="dialog"
        onPointerEnter={scramble}
        onFocus={scramble}
        onClick={() => setOpen((o) => !o)}
        className={`relative flex size-10 items-center justify-center rounded-lg border font-mono text-[11px] font-bold tracking-[0.06em] transition-[color,border-color,background-color,transform] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${open ? "border-accent/40 bg-accent/10 text-accent" : "border-line text-fg/80 hover:border-line-strong hover:text-fg"}`}
      >
        <span aria-hidden>{text}</span>
        {fresh && (
          <span aria-hidden className="absolute -right-1 -top-1 flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative size-2.5 rounded-full border-2 border-panel bg-ok" />
          </span>
        )}
      </button>

      {open && (
        <div ref={card} role="dialog" aria-label="About Oladele" className="palette-in absolute left-full top-0 z-[60] ml-3 w-72 rounded-xl border border-line-strong bg-panel p-4 shadow-[0_2px_4px_rgb(0_0_0/.3),0_16px_48px_-8px_rgb(0_0_0/.6)]">
          <div className="flex items-center gap-3">
            <Image src="/assets/images/junior-headshot.JPG" alt="" width={40} height={40} sizes="40px" className="size-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="truncate text-xs text-muted">{profile.status}</p>
            </div>
          </div>
          {profile.now && (
            <p className="mt-4 text-sm leading-relaxed text-fg/90">
              <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Now</span>
              {profile.now}
            </p>
          )}
          {minutes != null && (
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${fresh ? "bg-ok" : "bg-muted"}`} />
              {activity ? (
                <span className="min-w-0 truncate">
                  {activity.action}{" "}
                  <a href={activity.url} target="_blank" rel="noopener noreferrer" className="text-fg/80 underline-offset-2 hover:text-accent hover:underline">
                    {activity.repo}
                  </a>{" "}
                  {ago(minutes)}
                </span>
              ) : (
                <span>
                  site shipped {ago(minutes)} {COMMIT && <span className="text-fg/60">{COMMIT}</span>}
                </span>
              )}
            </p>
          )}
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <a href={profile.resumePdf.href} target="_blank" rel="noopener noreferrer" className="flex h-9 flex-1 items-center justify-center rounded-md bg-accent text-sm font-medium text-on-accent transition-transform duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Open resume
            </a>
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="flex h-9 flex-1 items-center justify-center rounded-md border border-line-strong text-sm text-fg/80 transition-[color,border-color,transform] duration-150 hover:border-accent/40 hover:text-fg active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                GitHub
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
