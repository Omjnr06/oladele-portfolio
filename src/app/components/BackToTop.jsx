"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={go}
          className="group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center p-3 md:p-4 rounded-full bg-scrim/60 border border-bright/10 text-accent shadow-lg backdrop-blur-md hover:bg-scrim hover:border-accent transition overflow-hidden"
          aria-label="Back to top"
        >
          <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-[max-width,opacity,margin] duration-500 ease-in-out font-mono text-[11px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
            {label}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
