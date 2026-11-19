"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function VideoBlock({ src, caption }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-bright/10 max-w-sm mx-auto" onClick={() => setExpanded(true)}>
        <video src={src} autoPlay muted loop playsInline aria-label={caption} className="w-full block" />
        <div className="absolute inset-0 flex items-center justify-center bg-scrim/0 group-hover:bg-scrim/30 transition-colors">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[11px] tracking-widest uppercase bg-scrim/60 px-3 py-1.5 rounded border border-bright/20">
            Click to expand
          </span>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-surface="media"
            className="fixed inset-0 z-50 bg-scrim/90 flex items-center justify-center p-6"
            onClick={() => setExpanded(false)}
          >
            <motion.video
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={src}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="max-h-[90vh] max-w-full rounded-lg border border-bright/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="absolute top-6 right-6 font-mono text-[11px] uppercase tracking-widest text-bright/60 hover:text-bright border border-bright/20 rounded px-3 py-1.5" onClick={() => setExpanded(false)}>
              Close ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
