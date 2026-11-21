"use client";
import { useEffect } from "react";
import { PAGE_EVENT } from "@/lib/events";
import { usePrefs } from "@/lib/prefs";

const RULE = 32;
const LIFT = 2;
const TEXT = ":is(p, li, h1, h2, h3, h4, dt, dd, blockquote)";
const PAGES = ".paper-page, .paper-card";
const SKIP = ".paper-sheet, .paper-print, .paper-fig, [data-no-rule]";
const metrics = new Map();

function ascent(cs) {
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  if (!metrics.has(font)) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = font;
    const m = ctx.measureText("Hg");
    metrics.set(font, [m.fontBoundingBoxAscent, m.fontBoundingBoxDescent]);
  }
  return metrics.get(font);
}

function floating(el, page) {
  for (let e = el; e && e !== page; e = e.parentElement) {
    const p = getComputedStyle(e).position;
    if (p === "absolute" || p === "fixed") return true;
  }
  return false;
}

function reset() {
  document.querySelectorAll("[data-snapped]").forEach((el) => {
    el.style.marginTop = el.dataset.snapM ?? "";
    el.style.paddingTop = el.dataset.snapP ?? "";
    delete el.dataset.snapped;
    delete el.dataset.snapM;
    delete el.dataset.snapP;
  });
}

function offset(page) {
  const top = parseFloat(getComputedStyle(page).getPropertyValue("--rule-top")) || 96;
  return top + RULE - 1;
}

function snapPage(page) {
  const line = offset(page);
  const items = [...page.querySelectorAll(`${TEXT}, [data-rule-box], [data-rule-lead]`)].filter((el) => {
    const skip = el.closest(SKIP);
    return !(skip && page.contains(skip)) && el.parentElement.closest(PAGES) === page && !el.parentElement.closest(TEXT);
  });
  for (const el of items) {
    if (!el.getClientRects().length || floating(el, page)) continue;
    const box = el.hasAttribute("data-rule-box");
    const m = el.hasAttribute("data-rule-lead") ? el.querySelector(TEXT) : el;
    if (!m) continue;
    const cs = getComputedStyle(el);
    let target = 0;
    if (!box) {
      const ms = getComputedStyle(m);
      const lh = parseFloat(ms.lineHeight);
      if (!lh) continue;
      const [a, d] = ascent(ms);
      target = parseFloat(ms.paddingTop) + parseFloat(ms.borderTopWidth) + (lh - (a + d)) / 2 + a + LIFT;
    }
    const at = () => m.getBoundingClientRect().top - page.getBoundingClientRect().top + target;
    const delta = (((line - at()) % RULE) + RULE) % RULE;
    if (delta < 0.5 || delta > RULE - 0.5) continue;
    el.dataset.snapM = el.style.marginTop;
    el.dataset.snapP = el.style.paddingTop;
    el.dataset.snapped = "";
    el.style.marginTop = `${parseFloat(cs.marginTop) + delta}px`;
    const miss = (((line - at()) % RULE) + RULE) % RULE;
    if (miss > 0.5 && miss < RULE - 0.5) {
      el.style.marginTop = el.dataset.snapM;
      el.style.paddingTop = `${parseFloat(cs.paddingTop) + delta}px`;
    }
  }
}

function run() {
  reset();
  if (document.documentElement.dataset.pack !== "paper") return;
  [...document.querySelectorAll(PAGES)].reverse().forEach((page) => {
    if (!page.classList.contains("flip-sheet")) snapPage(page);
  });
}

export default function RuleSnap() {
  const { pack } = usePrefs();

  useEffect(() => {
    if (pack !== "paper") {
      reset();
      return;
    }
    let frame = 0;
    const soon = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };
    const ro = new ResizeObserver(soon);
    const watch = () => {
      ro.disconnect();
      document.querySelectorAll(PAGES).forEach((p) => ro.observe(p));
    };
    const onPage = () => {
      run();
      watch();
    };
    onPage();
    document.fonts?.ready.then(soon);
    window.addEventListener(PAGE_EVENT, onPage);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener(PAGE_EVENT, onPage);
      reset();
    };
  }, [pack]);

  return null;
}
