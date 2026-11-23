"use client";
import { useEffect, useState } from "react";
import { CONTACT_EVENT } from "@/lib/events";

export default function ContactHost() {
  const [Panel, setPanel] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let loading = null;
    const show = () => {
      if (document.documentElement.dataset.pack === "windows") {
        window.__omjWin?.open("/?app=contact");
        return;
      }
      loading ??= import("./ContactPanel").then((m) => setPanel(() => m.default));
      setOpen(true);
    };
    const fromHash = () => {
      if (location.hash === "#contact") show();
    };
    const first = setTimeout(fromHash, 0);
    window.addEventListener(CONTACT_EVENT, show);
    window.addEventListener("hashchange", fromHash);
    return () => {
      clearTimeout(first);
      window.removeEventListener(CONTACT_EVENT, show);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const close = () => {
    setOpen(false);
    if (location.hash === "#contact") history.replaceState(history.state, "", location.pathname + location.search);
  };

  return Panel ? <Panel open={open} onClose={close} /> : null;
}
