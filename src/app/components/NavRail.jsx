"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const spring = { type: "spring", stiffness: 420, damping: 36 };

export default function NavRail({ items, active }) {
  return (
    <nav aria-label="Site" className="sticky top-0 z-50 flex h-[100svh] w-12 shrink-0 flex-col items-center justify-center border-r border-line bg-panel md:w-20">
      <ul className="flex flex-col items-center gap-[clamp(0.5rem,4vh,3rem)]">
        {items.map((it) => {
          const on = it.key === active;
          const cls = `group relative flex min-w-10 items-center justify-center rounded-full px-1 py-[clamp(0.5rem,2.2vh,1rem)] transition-[color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${on ? "text-accent" : "text-fg/70 hover:text-fg"}`;
          const inner = (
            <>
              {on && <motion.span layoutId="rail-active" aria-hidden className="absolute inset-0 rounded-full border border-accent/40 bg-accent/10" transition={spring} />}
              <span className="relative rotate-180 font-mono text-[11px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-rl] md:text-xs">{it.label}</span>
            </>
          );
          return (
            <li key={it.key}>
              {it.onClick ? (
                <a href={it.href} onClick={it.onClick} aria-current={on ? "location" : undefined} className={cls}>{inner}</a>
              ) : (
                <Link href={it.href} aria-current={on ? "page" : undefined} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
