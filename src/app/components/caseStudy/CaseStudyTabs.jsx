"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Blocks, { figureStarts, SheetHead } from "./Blocks";

export default function CaseStudyTabs({ sections, file, title }) {
  const [active, setActive] = useState(sections[0].id);
  const index = Math.max(0, sections.findIndex((s) => s.id === active));
  const section = sections[index];

  const onKeyDown = (e, index) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = sections[(index + step + sections.length) % sections.length];
    setActive(next.id);
    e.currentTarget.parentElement.querySelector(`[data-tab='${next.id}']`)?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label="Case study sections" className="mb-8 flex flex-wrap gap-2 p-1.5 rounded-xl bg-panel border border-bright/10 w-fit paper:mb-0 paper:gap-1 paper:p-0 paper:pl-3 paper:rounded-none paper:border-0 paper:bg-transparent max-md:paper:w-full max-md:paper:flex-nowrap max-md:paper:overflow-x-auto max-md:paper:pt-1 paper:[scrollbar-width:none]">
        {sections.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            data-tab={s.id}
            aria-selected={active === s.id}
            tabIndex={active === s.id ? 0 : -1}
            onClick={() => setActive(s.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative px-4 py-2 rounded-lg font-mono text-xs tracking-wide transition-colors paper:-mb-px paper:shrink-0 paper:rounded-none paper:rounded-t-md paper:border paper:border-line paper:py-1 paper:font-hand paper:text-xl paper:tracking-normal ${active === s.id ? "text-on-accent paper:z-10 paper:border-b-[#fffdf8] paper:bg-[#fffdf8] paper:text-accent" : "text-bright/50 hover:text-bright/80 paper:bg-[color-mix(in_srgb,var(--color-ink)_92%,var(--color-fg))] paper:text-muted paper:hover:text-fg"}`}
          >
            {active === s.id && <motion.span layoutId="activePill" className="absolute inset-0 rounded-lg bg-accent paper:hidden" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full bg-panel border border-bright/10 rounded-xl shadow-2xl overflow-hidden paper-sheet">
        <div className="h-10 bg-panel-2 border-b border-bright/5 flex items-center px-4 gap-2 paper:hidden">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 font-mono text-[11px] text-bright/50 tracking-widest">
            {file}__{section.label.toLowerCase().replace(/[^a-z]/g, "_")}.tsx
          </span>
        </div>

        <div role="tabpanel" aria-label={section.label} className="@container p-6 md:p-10 font-mono text-sm leading-relaxed text-bright/80 min-h-[420px] paper:font-sans paper:text-[15px] paper:leading-[1.7]">
          <SheetHead title={title} label={`Section ${index + 1} of ${sections.length}: ${section.label}`} />
          <AnimatePresence mode="wait">
            <motion.div key={section.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <section>
                <Blocks blocks={section.blocks} figStart={figureStarts(sections)[index]} />
              </section>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
