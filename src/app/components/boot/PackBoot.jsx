"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PACK_BOOT_EVENT } from "@/lib/events";
import { markPackBooted } from "@/lib/packSwitch";

export default function PackBoot() {
  const [boot, setBoot] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    markPackBooted(root.dataset.pack);
    let n = 0;
    const onBoot = () => {
      const id = ++n;
      import("./Boot")
        .then((m) => setBoot({ id, Boot: m.default }))
        .catch(() => root.removeAttribute("data-pack-boot"));
    };
    window.addEventListener(PACK_BOOT_EVENT, onBoot);
    return () => window.removeEventListener(PACK_BOOT_EVENT, onBoot);
  }, []);

  useLayoutEffect(() => {
    if (boot) document.documentElement.removeAttribute("data-pack-boot");
  }, [boot]);

  if (!boot) return null;
  const { Boot, id } = boot;
  return createPortal(<Boot key={id} onDone={() => setBoot(null)} />, document.body);
}
