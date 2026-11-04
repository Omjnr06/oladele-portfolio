"use client";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const noop = () => () => {};

export function Toast({ toast, onDismiss }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.error ? 7000 : 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!mounted) return null;
  return createPortal(
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.key} role="status"
            initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="pointer-events-auto flex max-w-md items-center gap-4 rounded-[10px] border border-line-strong bg-panel-2 py-3 pl-4 pr-3 text-sm text-fg shadow-[0_1px_2px_rgb(0_0_0/.3),0_8px_24px_-4px_rgb(0_0_0/.5)]">
            <span className={toast.error ? "text-red-300" : ""}>{toast.msg}</span>
            {toast.action && (
              <button type="button" onClick={() => { toast.action.run(); onDismiss(); }}
                className="h-8 shrink-0 rounded-md px-3 font-medium text-accent transition-[background-color] duration-150 hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent">
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
