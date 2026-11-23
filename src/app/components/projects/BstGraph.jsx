"use client";
import { searchPath, shortName } from "@/lib/projectTree";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function BstGraph({ bst, selected, onSelect }) {
  const n = bst.nodes.length;
  const pos = Object.fromEntries(bst.nodes.map((node) => [node.id, { x: ((node.x + 0.5) / n) * 100, y: 10 + (bst.depth ? node.depth / bst.depth : 0) * 80 }]));
  const path = searchPath(bst.root, selected);
  const onPath = new Set(path);
  const names = Object.fromEntries(bst.nodes.map((node) => [node.id, shortName(node.p)]));

  return (
    <div className="mt-4">
      <p className="text-muted">keys: project ids, inserted in build order</p>
      <div className="relative mt-4 h-[clamp(240px,38svh,360px)]" data-bst="">
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          {bst.edges.map(([a, b]) => {
            const hot = onPath.has(a) && onPath.has(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={pos[a].x}
                y1={pos[a].y}
                x2={pos[b].x}
                y2={pos[b].y}
                vectorEffect="non-scaling-stroke"
                strokeWidth={hot ? 2 : 1}
                className={`transition-[stroke] duration-200 ${hot ? "stroke-accent" : "stroke-bright/15"}`}
              />
            );
          })}
        </svg>
        {bst.nodes.map((node) => {
          const on = node.id === selected;
          const hot = onPath.has(node.id);
          return (
            <button
              key={node.id}
              type="button"
              title={node.p.title}
              aria-label={node.p.title}
              aria-current={on ? "true" : undefined}
              onClick={() => onSelect(node.id)}
              style={{ left: `${pos[node.id].x}%`, top: `${pos[node.id].y}%` }}
              className={`absolute flex h-8 -translate-x-1/2 -translate-y-1/2 items-center rounded-md border px-2 text-[12px] leading-none transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${focus} ${on ? "border-accent bg-accent text-on-accent" : hot ? "border-accent/60 bg-panel text-bright" : "border-bright/15 bg-panel text-muted hover:border-accent/50 hover:text-fg"}`}
            >
              {names[node.id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
