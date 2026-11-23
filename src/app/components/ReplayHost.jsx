"use client";
import { useEffect } from "react";

export default function ReplayHost() {
  useEffect(() => {
    let last = null;
    const onOver = (e) => {
      const el = e.target.closest?.("[data-replay]");
      if (el === last) return;
      last = el;
      if (!el) return;
      const anims = el.getAnimations({ subtree: true });
      if (!anims.length || anims.some((a) => a.playState === "running")) return;
      anims.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
    };
    document.addEventListener("pointerover", onOver);
    return () => document.removeEventListener("pointerover", onOver);
  }, []);
  return null;
}
