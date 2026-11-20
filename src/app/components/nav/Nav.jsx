"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { icons } from "./icons";
import { usePrefs } from "@/lib/prefs";
import { PALETTE_EVENT } from "@/lib/events";
import OmjMark from "./OmjMark";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const PHONE = {
  nav: "max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:top-auto max-md:h-auto max-md:w-auto max-md:flex-row max-md:rounded-full max-md:border max-md:p-1.5 max-md:shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]",
  brand: "max-md:hidden",
  list: "max-md:flex-1 max-md:flex-row max-md:justify-between",
  item: "max-md:h-10 max-md:flex-row max-md:gap-2 max-md:rounded-full max-md:py-0",
  on: "max-md:w-auto max-md:px-3.5",
  off: "max-md:w-10 max-md:justify-center",
  round: "max-md:rounded-full",
  icon: "max-md:size-[18px]",
  labelOn: "max-md:text-xs max-[379px]:hidden",
  labelOff: "max-md:hidden",
  tools: "max-md:mt-0 max-md:ml-1 max-md:flex-row max-md:border-t-0 max-md:border-l max-md:pt-0 max-md:pl-1",
};

const PILL = {
  nav: "md:pill:fixed md:pill:left-1/2 md:pill:top-4 md:pill:h-auto md:pill:w-auto md:pill:-translate-x-1/2 md:pill:flex-row md:pill:rounded-full md:pill:border md:pill:p-1.5 md:pill:shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]",
  dock: "md:pill:relative md:pill:inset-auto md:pill:h-auto md:pill:w-auto md:pill:flex-row md:pill:rounded-full md:pill:border md:pill:p-1.5 md:pill:shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]",
  brand: "md:pill:hidden",
  list: "md:pill:flex-row md:pill:gap-1",
  item: "md:pill:h-10 md:pill:flex-row md:pill:gap-2 md:pill:rounded-full md:pill:py-0",
  on: "md:pill:w-auto md:pill:px-3.5",
  off: "md:pill:w-10 md:pill:justify-center",
  round: "md:pill:rounded-full",
  icon: "md:pill:size-[18px]",
  labelOn: "md:pill:text-xs",
  labelOff: "md:pill:hidden",
  tools: "md:pill:mt-0 md:pill:ml-1 md:pill:flex-row md:pill:border-t-0 md:pill:border-l md:pill:pt-0 md:pill:pl-1",
};

const PAPER = {
  nav: "paper:bg-transparent md:paper:w-16 md:paper:bg-[color-mix(in_srgb,var(--color-ink)_93%,var(--color-fg))] max-md:paper:inset-x-0 max-md:paper:bottom-0 max-md:paper:rounded-none max-md:paper:border-x-0 max-md:paper:border-b-0 max-md:paper:bg-[color-mix(in_srgb,var(--color-ink)_93%,var(--color-fg))] max-md:paper:px-2 max-md:paper:pb-[max(6px,env(safe-area-inset-bottom))] max-md:paper:pt-0 max-md:paper:shadow-none",
  list: "md:paper:-mr-px md:paper:items-end md:paper:gap-1.5",
  item: "paper:border paper:border-line md:paper:w-11 md:paper:rounded-none md:paper:rounded-l-lg md:paper:border-r-0 md:paper:py-3 max-md:paper:-mt-px max-md:paper:rounded-none max-md:paper:rounded-b-lg max-md:paper:border-t-0",
  on: "paper:bg-ink md:paper:w-12",
  off: "paper:bg-[color-mix(in_srgb,var(--color-ink)_97%,var(--color-fg))]",
  mark: "paper:hidden",
  icon: "md:paper:hidden",
  labelOn: "md:paper:rotate-180 md:paper:text-xs md:paper:[writing-mode:vertical-rl]",
  labelOff: "md:paper:rotate-180 md:paper:text-xs md:paper:[writing-mode:vertical-rl]",
  tools: "md:paper:border-t-0",
};

const SHAPES = {
  auto: { nav: `sticky top-0 h-[100svh] w-20 border-r py-4 ${PHONE.nav} ${PILL.nav} ${PAPER.nav}`, parts: [PHONE, PILL, PAPER] },
  dock: { nav: `absolute inset-y-0 left-0 w-20 border-r py-4 ${PILL.dock}`, parts: [PILL] },
};

const cx = (shape, key) => SHAPES[shape].parts.map((p) => p[key]).filter(Boolean).join(" ");
let ThemeMenu = null;

const noop = () => () => {};
const useMac = () => useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || ""), () => false);

function morphTo(mode) {
  const root = document.documentElement;
  const apply = () => root.setAttribute("data-nav", mode);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce || root.hasAttribute("data-theme-switching")) return apply();
  root.setAttribute("data-nav-morph", "");
  const t = document.startViewTransition(apply);
  t.finished.finally(() => root.removeAttribute("data-nav-morph"));
}

function useNavMode() {
  const { navMode, pack } = usePrefs();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pack === "paper") return;
    if (document.documentElement.getAttribute("data-nav") !== navMode) morphTo(navMode);
  }, [navMode, pack]);
}

export default function Nav({ items, active, shape = "auto" }) {
  useNavMode();
  const mac = useMac();
  const themeRef = useRef(null);
  const [menu, setMenu] = useState(null);

  const openTheme = () => {
    if (menu) return setMenu(null);
    const load = ThemeMenu ? Promise.resolve() : import("../ThemeChooser").then((m) => (ThemeMenu = m.default));
    load.then(() => setMenu(themeRef.current.getBoundingClientRect()));
  };

  return (
    <>
      <nav data-site-nav="" data-shape={shape} data-vt="nav" aria-label="Site" className={`z-50 flex shrink-0 flex-col items-center border-line bg-panel ${SHAPES[shape].nav}`}>
        <div data-vt="brand" className={`mb-auto ${cx(shape, "brand")}`}>
          <OmjMark />
        </div>

        <ul className={`flex flex-col items-center gap-0.5 ${cx(shape, "list")}`}>
          {items.map((it) => {
            const on = it.key === active;
            const Icon = icons[it.key];
            const cls = `relative flex w-14 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors duration-150 ${focus} ${cx(shape, "item")} ${cx(shape, on ? "on" : "off")} ${on ? "text-accent" : "text-muted hover:text-fg"}`;
            const inner = (
              <>
                {on && <span aria-hidden className={`absolute inset-0 rounded-xl border border-accent/30 bg-accent/10 ${cx(shape, "round")} ${cx(shape, "mark")}`} />}
                <Icon className={`relative size-5 shrink-0 ${cx(shape, "icon")}`} />
                <span className={`relative text-[11px] font-medium ${cx(shape, on ? "labelOn" : "labelOff")}`}>{it.label}</span>
              </>
            );
            return (
              <li key={it.key} data-vt={it.key}>
                {it.onClick ? (
                  <a href={it.href} onClick={it.onClick} aria-label={it.label} aria-current={on ? "location" : undefined} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={it.href} aria-label={it.label} aria-current={on ? "page" : undefined} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div data-vt="tools" className={`mt-auto flex flex-col items-center gap-1 border-t border-line pt-3 ${cx(shape, "tools")}`}>
          <button
            type="button"
            aria-label="Search"
            title={`Search (${mac ? "⌘K" : "Ctrl K"})`}
            onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}
            className={`flex size-10 items-center justify-center rounded-lg text-muted transition-[color,background-color,transform] duration-150 hover:bg-bright/5 hover:text-fg active:scale-95 ${focus} ${cx(shape, "round")}`}
          >
            <icons.search width={18} height={18} />
          </button>
          <button
            ref={themeRef}
            type="button"
            aria-label="Theme"
            aria-expanded={!!menu}
            aria-haspopup="dialog"
            onClick={openTheme}
            className={`flex size-10 items-center justify-center rounded-lg transition-[color,background-color,transform] duration-150 hover:bg-bright/5 hover:text-fg active:scale-95 ${focus} ${menu ? "text-fg" : "text-muted"} ${cx(shape, "round")}`}
          >
            <icons.theme width={18} height={18} />
          </button>
        </div>
      </nav>
      {menu && ThemeMenu && <ThemeMenu anchor={menu} triggerRef={themeRef} onClose={() => setMenu(null)} />}
    </>
  );
}
