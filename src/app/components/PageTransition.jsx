"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

let navigated = false;

const cdOn = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

const PLACES = { "/": "home", "/resume": "resume", "/music": "music vault", "/grind": "the grind", "/stats": "site stats", "/lab": "lab" };
const place = (path) => PLACES[path] ?? (path.startsWith("/projects/") ? `case study: ${path.split("/")[2]}` : path.slice(1));

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

export default function PageTransition({ children }) {
  const path = usePathname();
  const [cd] = useState(() => navigated && cdOn());
  const [veil, setVeil] = useState(cd);

  useEffect(() => {
    navigated = true;
  }, []);

  return (
    <div data-transition={cd ? "cd" : undefined} className={`${cd ? "" : "page-enter "}h-full w-full`}>
      {veil && <CdVeil path={path} onDone={() => setVeil(false)} />}
      {children}
    </div>
  );
}
