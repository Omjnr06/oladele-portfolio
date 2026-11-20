"use client";
import { useEffect, useState } from "react";
import { onScroll, scrollTop, scrollToId, scrollToTop } from "@/lib/scroll";

export default function BackToTop({ label = "Back to Top", targetId }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => setShow(scrollTop() > 300);
    update();
    return onScroll(update);
  }, []);

  const go = (e) => {
    e.preventDefault();
    if (!targetId || !scrollToId(targetId)) scrollToTop();
  };

  return (
    <button
      onClick={go}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`group fixed bottom-6 right-6 max-md:bottom-24 md:bottom-8 md:right-8 z-50 flex items-center justify-center p-3 md:p-4 rounded-full bg-scrim/60 border border-bright/10 text-accent shadow-lg backdrop-blur-md hover:bg-scrim hover:border-accent overflow-hidden paper:rounded-md paper:border-0 paper:bg-transparent paper:p-2 paper:text-accent-2 paper:shadow-none paper:backdrop-blur-none paper:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-[opacity,translate,background-color,border-color,visibility] duration-300 ease-out ${show ? "opacity-100 translate-y-0 visible" : "pointer-events-none opacity-0 translate-y-5 invisible"}`}
    >
      <span aria-hidden className="hidden rotate-[-4deg] font-hand text-2xl leading-none transition-transform duration-150 group-hover:-translate-y-0.5 paper:block">↑ top</span>
      <svg className="shrink-0 paper:hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
      <span className="paper:hidden max-w-0 overflow-hidden group-hover:max-w-xs transition-[max-width,opacity,margin] duration-500 ease-in-out font-mono text-[11px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
        {label}
      </span>
    </button>
  );
}
