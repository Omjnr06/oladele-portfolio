"use client";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { PAGE_EVENT } from "@/lib/events";
import { usePrefs } from "@/lib/prefs";
import { place } from "@/lib/places";
import NotebookCover from "./NotebookCover";
import { runPageTurn } from "./pageTurn";

const TURN_MS = 800;

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

const ORDER = ["/", "/projects", "/resume", "/music", "/grind", "/stats", "/lab"];
const rank = (path) => {
  const i = ORDER.indexOf(path);
  if (i >= 0) return i;
  if (path.startsWith("/projects/")) return 1.5;
  return ORDER.length;
};

export default function BookFlip() {
  const router = useRouter();
  const { pack } = usePrefs();
  const [dest, setDest] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const can = () => root.dataset.pack === "paper" && !!document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const flip = (url) => {
      const href = url.pathname + url.search + url.hash;
      const book = url.pathname === "/";
      const dir = rank(url.pathname) >= rank(location.pathname) ? "next" : "prev";
      window.__omjBookFlip = true;
      if (book) flushSync(() => setDest(place(url.pathname)));
      else root.setAttribute("data-page-turn", dir);
      const t = document.startViewTransition(async () => {
        if (book) root.setAttribute("data-book-flip", "");
        else root.setAttribute("data-page-turn-live", "");
        router.push(href);
        await waitForPage(url.pathname);
      });
      let stop = null;
      t.ready.then(() => !book && (stop = runPageTurn(dir, TURN_MS))).catch(() => {});
      t.updateCallbackDone.catch(() => {});
      t.finished
        .catch(() => {})
        .finally(() => {
          stop?.();
          window.__omjBookFlip = false;
          root.removeAttribute("data-book-flip");
          root.removeAttribute("data-page-turn");
          root.removeAttribute("data-page-turn-live");
        });
    };
    const onClick = (e) => {
      if (root.dataset.pack !== "paper" || !document.startViewTransition) return;
      if (window.__omjBookFlip) {
        if (e.target.closest?.("a[href]")) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        return;
      }
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !can()) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      flip(url);
    };
    window.__omjBookGo = (href) => {
      const url = new URL(href, location.href);
      if (!can() || window.__omjBookFlip || url.origin !== location.origin || url.pathname === location.pathname) return false;
      flip(url);
      return true;
    };
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      delete window.__omjBookGo;
    };
  }, [router]);

  return (
    <>
      <div aria-hidden className="book-stage">
        <div className="book-base">
          <span className="book-dest font-hand">{dest}</span>
        </div>
      </div>
      <NotebookCover photo={pack === "paper"} className="book-front" />
      <div aria-hidden className="pt-flap" />
      <div aria-hidden className="pt-shade" />
    </>
  );
}
