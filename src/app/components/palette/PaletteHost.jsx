"use client";
import { useEffect, useState } from "react";

import { PALETTE_EVENT } from "@/lib/events";

export default function PaletteHost() {
  const [Palette, setPalette] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let loading = null;
    const toggle = (e) => {
      loading ??= import("./Palette").then((m) => setPalette(() => m.default));
      const q = typeof e?.detail?.query === "string" ? e.detail.query : null;
      setQuery(q ?? "");
      setOpen((o) => (q !== null ? true : !o));
    };
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      toggle(null);
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(PALETTE_EVENT, toggle);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(PALETTE_EVENT, toggle);
    };
  }, []);

  return open && Palette ? <Palette key={query} initialQuery={query} onClose={() => setOpen(false)} /> : null;
}
