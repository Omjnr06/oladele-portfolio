"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Blocks from "./Blocks";

export default function CaseStudyTabs({ sections, file }) {
  const [active, setActive] = useState(sections[0].id);
  const section = sections.find((s) => s.id === active) ?? sections[0];

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
      <div role="tablist" aria-label="Case study sections" className="mb-8 flex flex-wrap gap-2 p-1.5 rounded-xl bg-panel border border-bright/10 w-fit">
        {sections.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            data-tab={s.id}
            aria-selected={active === s.id}
            tabIndex={active === s.id ? 0 : -1}
            onClick={() => setActive(s.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative px-4 py-2 rounded-lg font-mono text-xs tracking-wide transition-colors ${active === s.id ? "text-on-accent" : "text-bright/50 hover:text-bright/80"}`}
          >
            {active === s.id && <motion.span layoutId="activePill" className="absolute inset-0 rounded-lg bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="w-full bg-panel border border-bright/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="h-10 bg-panel-2 border-b border-bright/5 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 font-mono text-[11px] text-bright/50 tracking-widest">
            {file}__{section.label.toLowerCase().replace(/[^a-z]/g, "_")}.tsx
          </span>
        </div>

        <div role="tabpanel" aria-label={section.label} className="@container p-6 md:p-10 font-mono text-sm leading-relaxed text-bright/80 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div key={section.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <section>
                <Blocks blocks={section.blocks} />
              </section>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
