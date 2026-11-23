"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ProjectMedia from "./ProjectMedia";
import { displayTitle, projectLinks } from "./links";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Action({ link, primary }) {
  const cls = primary
    ? `inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97] ${focus}`
    : `inline-flex h-10 items-center rounded-lg border border-bright/10 px-4 text-sm text-bright transition-[border-color,color,transform] duration-150 hover:border-accent/50 hover:text-accent active:scale-[0.97] ${focus}`;
  return link.internal ? (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {link.label}
    </a>
  );
}

export default function ProjectPreview({ p, compact = false }) {
  const reduce = useReducedMotion();
  const links = projectLinks(p);
  const tall = p.media.orientation === "portrait";
  const frame = tall
    ? `mx-auto aspect-[9/19.5] rounded-[1.75rem] border-4 ${compact ? "h-[360px]" : "h-[min(100%,480px)] lg:mx-0"}`
    : `w-full rounded-lg border ${compact ? "aspect-[16/9]" : "aspect-[16/10] max-h-[44svh]"}`;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={p.id}
        data-preview={p.id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }}
        className={`flex min-h-0 flex-col ${compact ? "gap-3" : "h-full gap-4"} ${tall && !compact ? "lg:flex-row lg:gap-6" : ""}`}
      >
        <div data-surface="media" data-portrait={tall || undefined} className={`relative shrink-0 overflow-hidden border-bright/10 bg-ink ${frame}`}>
          <ProjectMedia p={p} full sizes={tall ? "240px" : "(min-width: 1024px) 40vw, 100vw"} />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2">
            {p.categories.join(" / ")}
            {p.tag && <span className="ml-3 text-ok">{p.tag}</span>}
          </p>
          <h2 className={`mt-1 font-bold tracking-tight text-bright ${compact ? "text-xl" : "text-2xl"}`}>{p.title}</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{p.summary}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Built with">
            {p.stack.map((s) => (
              <li key={s} className="rounded-md border border-bright/10 px-2 py-0.5 font-mono text-[11px] text-bright/80">
                {s}
              </li>
            ))}
          </ul>
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2" aria-label={`Links for ${displayTitle(p)}`}>
              {links.map((l, i) => (
                <Action key={l.id} link={l} primary={i === 0} />
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </AnimatePresence>
  );
}
