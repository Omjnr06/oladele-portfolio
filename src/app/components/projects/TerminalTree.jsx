"use client";
import { motion, useReducedMotion } from "framer-motion";
import ProjectPreview from "./ProjectPreview";
import BstGraph from "./BstGraph";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent";

function moveFocus(e) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const leaves = [...e.currentTarget.querySelectorAll("[data-leaf]")];
  const i = leaves.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const next = leaves[(i + (e.key === "ArrowDown" ? 1 : -1) + leaves.length) % leaves.length];
  next.focus();
  next.click();
}

function Leaf({ p, last, groupLast, selected, onSelect }) {
  const reduce = useReducedMotion();
  const on = selected === p.id;
  return (
    <li>
      <div className="flex items-center whitespace-pre">
        <span aria-hidden className="text-muted/60">{`${groupLast ? "    " : "│   "}${last ? "└── " : "├── "}`}</span>
        <button
          type="button"
          data-leaf={p.id}
          aria-current={on ? "true" : undefined}
          onClick={() => onSelect(p.id)}
          className={`relative -mx-1 flex min-h-8 min-w-0 items-center gap-3 rounded px-1 text-left transition-colors duration-150 ${focus} ${on ? "text-accent" : "text-bright hover:text-accent"}`}
        >
          {on && <motion.span layoutId="tree-selection" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }} aria-hidden className="absolute inset-0 rounded bg-accent/10 ring-1 ring-accent/30" />}
          <span className="relative truncate">{`${p.id}/`}</span>
          {p.tag && <span className="relative shrink-0 text-[11px] uppercase tracking-[0.12em] text-ok">{p.tag}</span>}
        </button>
      </div>
      {on && (
        <div className="whitespace-normal py-3 pl-4 font-sans lg:hidden">
          <ProjectPreview p={p} compact />
        </div>
      )}
    </li>
  );
}

export default function TerminalTree({ groups, selected, onSelect, mode, setMode, bst }) {
  const cmd = mode === "graph" ? `bst --search ${selected}` : "tree --dirsfirst";
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-bright/10 bg-panel shadow-2xl">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-bright/5 bg-panel-2 px-4">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-widest text-bright/50">~/projects</span>
        <div role="radiogroup" aria-label="View" className="ml-auto hidden rounded-lg border border-bright/10 p-0.5 lg:flex">
          {["tree", "graph"].map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`relative h-8 rounded-md px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-150 ${focus} ${mode === m ? "text-accent" : "text-muted hover:text-fg"}`}
            >
              {mode === m && <motion.span layoutId="tree-mode" transition={{ type: "spring", stiffness: 520, damping: 40 }} aria-hidden className="absolute inset-0 rounded-md bg-accent/10" />}
              <span className="relative">{m === "graph" ? "--graph" : "tree"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5 font-mono text-sm leading-7">
        <p className="text-muted">
          <span className="text-accent-2 max-sm:hidden">omj@server:</span><span className="text-accent">~/projects</span>$ <span className="text-bright">{cmd}</span>
        </p>
        {mode === "graph" ? (
          <BstGraph bst={bst} selected={selected} onSelect={onSelect} />
        ) : (
          <>
            <p className="text-bright">projects/</p>
            <ul onKeyDown={moveFocus} aria-label="Projects">
              {groups.map((g, gi) => {
                const groupLast = gi === groups.length - 1;
                return (
                  <li key={g.dir}>
                    <p className="whitespace-pre text-accent-2">
                      <span aria-hidden className="text-muted/60">{groupLast ? "└── " : "├── "}</span>
                      {g.dir}/
                    </p>
                    <ul>
                      {g.items.map((p, i) => (
                        <Leaf key={p.id} p={p} last={i === g.items.length - 1} groupLast={groupLast} selected={selected} onSelect={onSelect} />
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
