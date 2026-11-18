"use client";
import { useEffect, useState } from "react";

export const PALETTE_EVENT = "omj:palette";

export default function PaletteHost() {
  const [Palette, setPalette] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let loading = null;
    const toggle = () => {
      loading ??= import("./Palette").then((m) => setPalette(() => m.default));
      setOpen((o) => !o);
    };
    const onKey = (e) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      toggle();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener(PALETTE_EVENT, toggle);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener(PALETTE_EVENT, toggle);
    };
  }, []);

  return open && Palette ? <Palette onClose={() => setOpen(false)} /> : null;
}
