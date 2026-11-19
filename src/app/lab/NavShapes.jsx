"use client";
import { motion } from "framer-motion";
import { icons } from "../components/nav/icons";

export const ITEMS = [
  { key: "home", label: "Home", path: "~/", short: "home" },
  { key: "projects", label: "Projects", path: "projects/", short: "work" },
  { key: "resume", label: "Resume", path: "resume", short: "cv" },
  { key: "music", label: "Music", path: "music/", short: "music" },
  { key: "contact", label: "Contact", path: "contact", short: "mail" },
];

const spring = { type: "spring", stiffness: 320, damping: 32 };
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function Indicator({ id, className }) {
  return <motion.span layoutId={id} aria-hidden className={`absolute inset-0 ${className}`} transition={spring} />;
}

function Utility({ kind, mac, label, compact }) {
  const Icon = icons[kind];
  if (kind === "search" && !compact) {
    return (
      <button type="button" aria-label="Search" className={`flex h-9 shrink-0 items-center gap-2 rounded-full border border-line px-3 text-muted transition-[color,border-color,transform] duration-150 hover:border-line-strong hover:text-fg active:scale-[0.97] ${focus}`}>
        <Icon width={16} height={16} />
        <kbd className="whitespace-nowrap font-mono text-[11px]">{mac ? "⌘K" : "Ctrl K"}</kbd>
      </button>
    );
  }
  return (
    <button type="button" aria-label={label ?? kind} title={label} className={`flex size-10 items-center justify-center rounded-lg text-muted transition-[color,background-color,transform] duration-150 hover:bg-bright/5 hover:text-fg active:scale-[0.95] ${focus}`}>
      <Icon width={18} height={18} />
    </button>
  );
}

function Dock({ mode, active, onSelect, scope, phone, mac }) {
  const rail = mode === "rail";
  return (
    <motion.nav
      layout
      transition={spring}
      aria-label="Site"
      className={
        rail
          ? "absolute inset-y-0 left-0 flex w-[76px] flex-col items-center border-r border-line bg-panel py-4"
          : phone
            ? "absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl border border-line bg-panel px-1.5 py-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
            : "absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-panel p-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
      }
    >
      {rail && (
        <motion.span layout="position" className="mb-auto flex size-9 items-center justify-center rounded-lg border border-line font-mono text-[11px] font-bold tracking-[0.06em] text-fg/80">
          OMJ
        </motion.span>
      )}
      <motion.ul layout="position" className={rail ? "flex flex-col items-center gap-0.5" : phone ? "flex flex-1 gap-0.5" : "flex items-center gap-1"}>
        {ITEMS.map((it) => {
          const on = it.key === active;
          const Icon = icons[it.key];
          return (
            <motion.li layout="position" key={it.key} className={phone ? "min-w-0 flex-1" : undefined}>
              <button
                type="button"
                onClick={() => onSelect(it.key)}
                aria-current={on ? "page" : undefined}
                className={`relative flex items-center rounded-xl transition-colors duration-150 ${focus} ${rail ? "w-14 flex-col gap-1 py-1.5" : phone ? "w-full flex-col gap-1 py-1.5" : "h-9 gap-2 rounded-full px-3"} ${on ? "text-accent" : "text-muted hover:text-fg"}`}
              >
                {on && <Indicator id={`${scope}-dock`} className={`border border-accent/30 bg-accent/10 ${rail || phone ? "rounded-xl" : "rounded-full"}`} />}
                <Icon className="relative" width={rail || phone ? 20 : 16} height={rail || phone ? 20 : 16} />
                <span className="relative text-[11px] font-medium">{it.label}</span>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
      {!phone && (
        <motion.div layout="position" className={rail ? "mt-auto flex flex-col items-center gap-1 border-t border-line pt-3" : "ml-1 flex items-center gap-1 border-l border-line pl-2"}>
          <Utility kind="search" label="Search" compact={rail} mac={mac} />
          <Utility kind="theme" label="Theme" />
        </motion.div>
      )}
    </motion.nav>
  );
}

function Prompt({ mode, active, onSelect, scope, phone, mac }) {
  const rail = mode === "rail";
  return (
    <motion.nav
      layout
      transition={spring}
      aria-label="Site"
      className={
        rail
          ? "absolute inset-y-0 left-0 flex w-[124px] flex-col border-r border-line bg-panel px-2 py-4"
          : phone
            ? "absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-line bg-panel px-2 py-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
            : "absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-line bg-panel py-1.5 pl-3 pr-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
      }
    >
      {!phone && (
        <motion.span layout="position" className={`font-mono text-[11px] text-muted ${rail ? "mb-auto px-2" : "mr-2"}`}>
          omj@site
        </motion.span>
      )}
      <motion.ul layout="position" className={rail ? "flex flex-col gap-0.5" : phone ? "flex flex-1 justify-between" : "flex items-center"}>
        {ITEMS.map((it, i) => {
          const on = it.key === active;
          return (
            <motion.li layout="position" key={it.key}>
              <button
                type="button"
                onClick={() => onSelect(it.key)}
                aria-current={on ? "page" : undefined}
                className={`relative flex items-baseline gap-2 rounded-md font-mono text-xs transition-colors duration-150 ${focus} ${rail ? "w-full px-2 py-2" : "px-2.5 py-1.5"} ${on ? "text-accent" : "text-fg/70 hover:text-fg"}`}
              >
                {on && <Indicator id={`${scope}-prompt`} className="rounded-md bg-accent/10" />}
                {rail && <span className="relative text-[11px] tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>}
                <span className="relative">
                  {phone ? it.short : it.path}
                </span>
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
      {!phone && (
        <motion.div layout="position" className={rail ? "mt-auto flex flex-col gap-2 px-1" : "ml-2 flex items-center gap-1 border-l border-line pl-2"}>
          {rail && <span className="px-1 font-mono text-[11px] text-muted">~ cd /{active === "home" ? "" : active}</span>}
          <div className="flex items-center gap-1">
            <Utility kind="search" label="Search" mac={mac} compact={rail} />
            <Utility kind="theme" label="Theme" />
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function Minimal({ mode, active, onSelect, scope, phone, mac }) {
  const rail = mode === "rail";
  return (
    <motion.nav
      layout
      transition={spring}
      aria-label="Site"
      className={
        rail
          ? "absolute inset-y-0 left-0 flex w-14 flex-col items-center border-r border-line bg-panel py-4"
          : phone
            ? "absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full border border-line bg-panel p-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
            : "absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-panel p-1.5 shadow-[0_8px_32px_-8px_rgb(0_0_0/.6)]"
      }
    >
      {rail && (
        <motion.span layout="position" className="mb-auto font-mono text-[11px] font-bold text-fg/80">
          O.
        </motion.span>
      )}
      <motion.ul layout="position" className={rail ? "flex flex-col items-center gap-2" : phone ? "flex flex-1 justify-between" : "flex items-center gap-1"}>
        {ITEMS.map((it) => {
          const on = it.key === active;
          const Icon = icons[it.key];
          const showLabel = !rail && on;
          return (
            <motion.li layout key={it.key} transition={spring} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(it.key)}
                aria-current={on ? "page" : undefined}
                aria-label={it.label}
                className={`relative flex h-10 items-center gap-2 rounded-full transition-colors duration-150 ${focus} ${showLabel ? "px-3.5" : "w-10 justify-center"} ${on ? "text-accent" : "text-muted hover:text-fg"}`}
              >
                {on && <Indicator id={`${scope}-min`} className="rounded-full bg-accent/10" />}
                <Icon className="relative shrink-0" width={18} height={18} />
                {showLabel && (
                  <motion.span layout="position" className="relative text-xs font-medium">
                    {it.label}
                  </motion.span>
                )}
              </button>
              {rail && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-md border border-line bg-panel-2 px-2 py-1 font-mono text-[11px] text-fg opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
                >
                  {it.label}
                </span>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
      {!phone && (
        <motion.div layout="position" className={rail ? "mt-auto flex flex-col items-center gap-1" : "ml-1 flex items-center gap-1 border-l border-line pl-1"}>
          <Utility kind="search" label="Search" compact mac={mac} />
          <Utility kind="theme" label="Theme" />
        </motion.div>
      )}
    </motion.nav>
  );
}

export const DIRECTIONS = {
  dock: {
    label: "A. Dock",
    Comp: Dock,
    railWidth: 76,
    note: "Icon + label stacked, like a dock. Easiest to scan; recruiters see every word.",
  },
  prompt: {
    label: "B. Prompt",
    Comp: Prompt,
    railWidth: 124,
    note: "Terminal paths, numbered. Matches the `cd` transition and the case-study prompts.",
  },
  minimal: {
    label: "C. Minimal",
    Comp: Minimal,
    railWidth: 56,
    note: "Icons only, labels on hover. Most room for content; the pill shows the active label.",
  },
};

export function NavShape({ direction, ...props }) {
  const { Comp } = DIRECTIONS[direction];
  return <Comp {...props} />;
}
