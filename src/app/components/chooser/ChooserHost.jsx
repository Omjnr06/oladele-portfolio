"use client";
import { useEffect, useState } from "react";
import { CHOOSER_EVENT } from "@/lib/events";

export default function ChooserHost() {
  const [Chooser, setChooser] = useState(null);

  useEffect(() => {
    const onOpen = () => import("./Chooser").then((m) => setChooser(() => m.default));
    window.addEventListener(CHOOSER_EVENT, onOpen);
    return () => window.removeEventListener(CHOOSER_EVENT, onOpen);
  }, []);

  return Chooser ? <Chooser onClose={() => setChooser(null)} /> : null;
}
