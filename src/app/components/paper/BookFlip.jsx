"use client";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PAGE_EVENT } from "@/lib/events";
import { usePrefs } from "@/lib/prefs";
import { place } from "@/lib/places";
import { profile } from "@/content/profile";

function waitForPage(path) {
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener(PAGE_EVENT, check);
      clearTimeout(timer);
      setTimeout(resolve, 0);
    };
    const check = (e) => e.detail === path && done();
    const timer = setTimeout(done, 3000);
    window.addEventListener(PAGE_EVENT, check);
  });
}

export default function BookFlip() {
  const router = useRouter();
  const { pack } = usePrefs();
  const [dest, setDest] = useState("");

  useEffect(() => {
    const onClick = (e) => {
      const root = document.documentElement;
      if (root.dataset.pack !== "paper" || !document.startViewTransition) return;
      if (window.__omjBookFlip) {
        if (e.target.closest?.("a[href]")) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        return;
      }
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const href = url.pathname + url.search + url.hash;
      window.__omjBookFlip = true;
      flushSync(() => setDest(place(url.pathname)));
      const t = document.startViewTransition(async () => {
        root.setAttribute("data-book-flip", "");
        router.push(href);
        await waitForPage(url.pathname);
      });
      t.ready.catch(() => {});
      t.updateCallbackDone.catch(() => {});
      t.finished
        .catch(() => {})
        .finally(() => {
          window.__omjBookFlip = false;
          root.removeAttribute("data-book-flip");
        });
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <>
      <div aria-hidden className="book-stage">
        <div className="book-base">
          <span className="book-dest font-hand">{dest}</span>
        </div>
      </div>
      <div aria-hidden className="book-front">
        <span className="book-spine" />
        <span className="book-band" />
        <div className="book-label">
          <p className="book-title font-hand">Oladele&apos;s Portfolio</p>
          <p className="book-sub font-mono">{profile.course}</p>
        </div>
        <p className="book-owner font-hand">property of {profile.firstName} {profile.lastName}</p>
        {pack === "paper" && (
          <figure className="book-photo">
            <Image src="/assets/images/junior-headshot.JPG" alt="" width={180} height={180} sizes="180px" loading="eager" className="book-photo-img" />
          </figure>
        )}
      </div>
    </>
  );
}
