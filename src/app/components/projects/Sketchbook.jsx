"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ProjectMedia from "./ProjectMedia";
import { displayTitle, projectLinks } from "./links";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const pageNo = (i) => String(i + 1).padStart(2, "0");

const Tick = () => (
  <svg aria-hidden viewBox="0 0 16 16" className="mr-1 inline-block h-3.5 w-3.5 align-[-1px] text-accent-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8.5 6 12l7.5-8.5" />
  </svg>
);

function HandLink({ link }) {
  const cls = `inline-flex min-h-9 items-center font-hand text-[22px] leading-none text-accent underline decoration-accent/40 decoration-2 underline-offset-4 transition-[color,translate] duration-150 hover:translate-x-1 hover:decoration-accent ${focus}`;
  const label = { case: "→ read the case study", live: link.internal ? "→ open it live" : "→ see it live", github: "→ the source code" }[link.id];
  return link.internal ? (
    <Link href={link.href} className={cls}>
      {label}
    </Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  );
}

function Entry({ p, index, tilt = "-rotate-1" }) {
  const links = projectLinks(p);
  const tall = p.media.orientation === "portrait";
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-hand text-xl lowercase text-accent-2">{p.categories.join(" + ").toLowerCase()}</p>
        <p className="font-hand text-xl text-muted">p. {pageNo(index)}</p>
      </div>
      <div className="mt-4 grid items-start gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className={`paper-print paper-tape-top relative bg-ink ${tall ? "mx-auto aspect-[9/19.5] h-[clamp(240px,36vh,320px)]" : "aspect-[16/10] w-full"} ${tilt}`} data-surface="media">
          <div className="relative h-full w-full overflow-hidden">
            <ProjectMedia p={p} full sizes={tall ? "160px" : "(min-width: 1024px) 20vw, 90vw"} />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="font-hand text-[34px] leading-[1.05] text-bright">{displayTitle(p)}</h2>
          {p.tag && <p className="mt-2 inline-block -rotate-3 rounded-sm border-2 border-current px-2 font-hand text-lg leading-6 text-ok">{p.tag}</p>}
          {links.length > 0 && (
            <div className="mt-2 flex flex-col items-start">
              {links.map((l) => (
                <HandLink key={l.id} link={l} />
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="mt-5 max-w-prose text-[15px] leading-[1.65] text-fg">{p.summary}</p>
      <p className="mt-3 text-[14px] leading-[1.8] text-fg">
        <span className="mr-2 font-hand text-xl text-accent-2">built with</span>
        {p.stack.map((s) => (
          <span key={s} className="mr-3 whitespace-nowrap">
            <Tick />
            {s}
          </span>
        ))}
      </p>
    </>
  );
}

export default function Sketchbook({ ordered, groups, selected, onSelect }) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(1);
  const index = ordered.findIndex((p) => p.id === selected);
  const p = ordered[index];
  const pick = (id) => {
    if (id === selected) return;
    setDir(ordered.findIndex((x) => x.id === id) > index ? 1 : -1);
    onSelect(id);
  };
  const swipe = {
    enter: (d) => (reduce ? { opacity: 0 } : { x: d * 56, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: reduce ? { duration: 0.12 } : { type: "spring", stiffness: 420, damping: 26 } },
    exit: (d) => (reduce ? { opacity: 0, transition: { duration: 0.1 } } : { x: d * -56, opacity: 0, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }),
  };

  return (
    <div data-no-rule className="h-full min-h-0">
      <div data-sketchbook="" className="sketch-spread relative hidden h-full min-h-[520px] grid-cols-2 lg:grid">
        <nav aria-label="Contents" className="sketch-page overflow-y-auto">
          <p className="font-hand text-[40px] leading-none text-bright">contents</p>
          <div className="mt-3 grid gap-3">
            {groups.map((g) => (
              <div key={g.dir}>
                <p className="font-hand text-xl leading-7 text-accent-2">{g.label}</p>
                <ul>
                  {g.items.map((item) => {
                    const on = item.id === selected;
                    const n = ordered.indexOf(item);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={on ? "page" : undefined}
                          onClick={() => pick(item.id)}
                          className={`group relative flex min-h-9 w-full items-baseline gap-2 text-left font-hand text-[22px] leading-tight transition-colors duration-150 ${focus} ${on ? "text-accent" : "text-bright hover:text-accent"}`}
                        >
                          <span className="relative">
                            {displayTitle(item)}
                            {on && <motion.span layoutId="sketch-underline" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 24 }} aria-hidden className="absolute -bottom-0.5 -left-1 -right-1 h-[3px] -rotate-1 rounded-full bg-accent-2" />}
                          </span>
                          <span aria-hidden className="mb-1.5 flex-1 border-b-2 border-dotted border-muted/40" />
                          <span className="text-muted">{pageNo(n)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 font-hand text-xl text-muted [@media(max-height:820px)]:hidden">pick one →</p>
        </nav>

        <div className="sketch-page sketch-leaf relative overflow-hidden" style={{ padding: 0 }}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.article
              key={p.id}
              data-entry={p.id}
              custom={dir}
              variants={swipe}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 overflow-y-auto px-11 py-7"
            >
              <Entry p={p} index={index} />
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <ol className="grid gap-8 lg:hidden" aria-label="Projects">
        {ordered.map((item, i) => (
          <li key={item.id} className={`index-card px-5 pb-6 pt-4 ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
            <Entry p={item} index={i} tilt={i % 2 ? "rotate-1" : "-rotate-1"} />
          </li>
        ))}
      </ol>
    </div>
  );
}
