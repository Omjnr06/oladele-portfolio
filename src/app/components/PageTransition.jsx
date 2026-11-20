"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PAGE_EVENT } from "@/lib/events";
import { place } from "@/lib/places";

let navigated = false;

const cdOn = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;


function CdVeil({ path, onDone }) {
  const done = useRef(onDone);
  const label = path === "/" ? "~" : path;
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-cd", "");
    const t = setTimeout(() => done.current(), 1000);
    return () => {
      clearTimeout(t);
      root.removeAttribute("data-cd");
    };
  }, []);
  return (
    <div aria-hidden className="cd-veil fixed inset-0 z-[70] flex items-center bg-ink font-mono text-fg" style={{ "--n": label.length + 3 }}>
      <div className="px-6 text-base leading-[1.7] md:pl-[max(8rem,12vw)] md:text-2xl">
        <p className="whitespace-nowrap">
          <span className="hidden text-accent sm:inline">omj@magbadelojr </span>
          <span className="text-muted">~ % </span>
          <span className="cd-cmd">cd {label}</span>
          <span className="cd-caret ml-1 inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-accent" />
        </p>
        <p className="cd-out mt-2 text-sm text-muted md:text-lg">
          opening <span className="text-fg">{place(path)}</span>
        </p>
        <div className="cd-out mt-4 h-px w-48 bg-line md:w-72">
          <div className="cd-bar h-px bg-accent" />
        </div>
      </div>
    </div>
  );
}

function FlipSheet({ onDone }) {
  const done = useRef(onDone);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-cd", "");
    const t = setTimeout(() => done.current(), 820);
    return () => {
      clearTimeout(t);
      root.removeAttribute("data-cd");
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 right-0 z-[70] md:left-16">
      <div className="flip-shade absolute inset-0" />
      <div className="flip-sheet paper-page absolute inset-0" />
    </div>
  );
}

export default function PageTransition({ children }) {
  const path = usePathname();
  const [cd] = useState(() => {
    if (!navigated) return null;
    if (window.__omjBookFlip) return "book";
    if (!cdOn()) return null;
    return document.documentElement.dataset.pack === "paper" ? "flip" : "cd";
  });
  const [veil, setVeil] = useState(!!cd);

  useEffect(() => {
    navigated = true;
    window.dispatchEvent(new CustomEvent(PAGE_EVENT, { detail: path }));
  }, [path]);

  return (
    <div data-transition={cd ?? undefined} className={`${cd ? "" : "page-enter "}h-full w-full`}>
      {veil && cd === "cd" && <CdVeil path={path} onDone={() => setVeil(false)} />}
      {veil && cd === "flip" && <FlipSheet onDone={() => setVeil(false)} />}
      {children}
    </div>
  );
}
