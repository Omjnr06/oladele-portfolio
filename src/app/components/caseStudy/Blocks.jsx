import Rich from "../Rich";
import VideoBlock from "./VideoBlock";
import ThemeDemo from "./ThemeDemo";

export const BLOCK_TYPES = ["heading", "text", "tags", "points", "schema", "video", "screens", "compare", "image", "figure", "flow", "note", "link", "resources", "themeDemo"];

const TOKEN_COLORS = ["accent", "accent-2", "ok", "warn", "err", "muted", "fg"];
export const colorValue = (c) => (TOKEN_COLORS.includes(c) ? `var(--color-${c})` : c);

const FLOW_COLS = { 2: "@min-[638px]:grid-cols-2", 3: "@min-[638px]:grid-cols-3", 4: "@min-[638px]:grid-cols-4", 5: "@min-[638px]:grid-cols-5" };
const POINT_BORDER = { accent: "border-accent/30", neutral: "border-bright/10", warn: "border-warn/30" };
const POINT_GAP = { accent: "space-y-5", neutral: "space-y-4", warn: "space-y-6" };
const SNUG_AFTER_LEAD = new Set(["flow", "image", "compare", "themeDemo"]);

function after(block, next) {
  if (!next) return "";
  const t = next.type;
  switch (block.type) {
    case "text":
      if (block.variant === "lead") return SNUG_AFTER_LEAD.has(t) ? "mb-4" : "mb-6";
      return t === "heading" ? "mb-8" : "mb-4";
    case "image":
      return t === "heading" ? "mb-10" : "mb-8";
    case "flow":
      return t === "note" ? "mb-3" : "mb-10";
    case "points":
    case "screens":
    case "compare":
    case "note":
      return t === "heading" ? "mb-10" : "";
    default:
      return "";
  }
}

function Heading({ block, single }) {
  return (
    <h2 className={`font-bold text-lg ${single ? "mb-4" : "mb-5"} flex items-center gap-2`} style={{ color: colorValue(block.color) }}>
      <span className="text-bright/50">{">"}</span> {block.text}
    </h2>
  );
}

function Text({ block, gap, prev }) {
  const rich = <Rich text={block.body} link="text-accent-2 underline underline-offset-4 hover:text-bright transition-colors" />;
  if (block.variant === "lead") return <p className={`${gap} text-bright/60`}>{rich}</p>;
  if (block.variant === "light") {
    const spaced = prev?.type === "text" && prev.variant === "light";
    return <p className={`text-bright/80 leading-relaxed font-light ${spaced ? " mt-4" : ""}`}>{rich}</p>;
  }
  return <p className={gap || "mb-4"}>{rich}</p>;
}

function Points({ block, gap, single }) {
  return (
    <ul className={`${POINT_GAP[block.tone] ?? "space-y-5"} list-none ${gap ? ` ${gap}` : ""}`}>
      {block.items.map((item) => (
        <li key={item.title} className={`pl-4 border-l-2 ${item.later ? "border-bright/10" : POINT_BORDER[block.tone] ?? POINT_BORDER.accent}`}>
          <span className="text-bright font-bold">{item.title}</span>
          <br />
          {single ? item.body : <span className="text-bright/70">{item.body}</span>}
        </li>
      ))}
    </ul>
  );
}

function Schema({ block, gap }) {
  return (
    <div className={`space-y-8 ${gap ? ` ${gap}` : ""}`}>
      {block.groups.map((grp) => (
        <div key={grp.name}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-bright/40">{grp.name}</span>
            {grp.note && <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-warn/30 text-warn-soft/80">{grp.note}</span>}
          </div>
          <div className="grid @min-[542px]:grid-cols-2 @min-[894px]:grid-cols-3 gap-3">
            {grp.tables.map((t) => (
              <div key={t.name} className="rounded-lg border border-bright/10 bg-scrim/40 overflow-hidden transition-colors hover:border-accent/40">
                <div className="px-3 py-1.5 bg-bright/[0.04] border-b border-bright/10 font-mono text-[12px] text-accent">{t.name}</div>
                <div className="p-3 space-y-1">
                  {t.cols.map(([c, ty]) => (
                    <div key={c} className="flex justify-between gap-3 font-mono text-[11px]">
                      <span className="text-bright/70">{c}</span>
                      <span className="text-bright/55">{ty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Screens({ block, gap }) {
  return (
    <div className={`grid grid-cols-2 @min-[542px]:grid-cols-3 @min-[894px]:grid-cols-4 gap-4 ${gap ? ` ${gap}` : ""}`}>
      {block.items.map((w) => (
        <div key={w.src} className="group rounded-lg overflow-hidden border border-bright/10 bg-scrim/40 transition-colors hover:border-accent/50">
          <img src={w.src} alt={w.label} loading="lazy" className="w-full block" />
          <div className="px-2 py-1.5 font-mono text-[11px] text-bright/40 text-center border-t border-bright/5 transition-colors group-hover:text-accent">{w.label}</div>
        </div>
      ))}
    </div>
  );
}

function Compare({ block, gap }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${gap ? ` ${gap}` : ""}`}>
      {block.items.map((it) => (
        <div key={it.src} className="rounded-lg overflow-hidden border border-bright/10 bg-scrim/40 transition-colors hover:border-accent/40">
          <img src={it.src} alt={it.label} loading="lazy" className="w-full block" />
          <div className="px-2 py-1.5 font-mono text-[11px] text-bright/40 text-center border-t border-bright/5">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function Img({ block, gap }) {
  if (block.size === "sm") {
    return (
      <div className={`rounded-lg overflow-hidden border border-bright/10 bg-scrim/40 ${gap ? ` ${gap}` : ""} max-w-md`}>
        <img src={block.src} alt={block.alt} loading="lazy" className="w-full block" />
      </div>
    );
  }
  return (
    <div className={`rounded-lg overflow-hidden border border-bright/10 ${gap ? ` ${gap}` : ""} transition-colors hover:border-accent/40`}>
      <img src={block.src} alt={block.alt} loading="lazy" className="w-full block" />
    </div>
  );
}

function Figure({ block }) {
  return (
    <div className="my-8 border border-bright/10 p-2 rounded bg-scrim/50">
      <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded opacity-90 hover:opacity-100 transition-opacity" />
    </div>
  );
}

function FlowBox({ step }) {
  return (
    <div className="rounded-lg border bg-scrim/40 px-3 py-2 text-center" style={{ borderColor: `color-mix(in srgb, ${colorValue(step.color)} 33.333%, transparent)` }}>
      <div className="font-mono text-[11px]" style={{ color: colorValue(step.color) }}>{step.label}</div>
      {step.sub && <div className="font-mono text-[11px] text-bright/55 mt-0.5">{step.sub}</div>}
    </div>
  );
}

function Flow({ block, gap }) {
  return (
    <div className={`rounded-lg border border-bright/10 bg-scrim/40 p-4 ${gap ? ` ${gap}` : ""} grid grid-cols-2 ${FLOW_COLS[block.steps.length] ?? ""} gap-2 items-center`}>
      {block.steps.map((s) => (
        <FlowBox key={s.label} step={s} />
      ))}
    </div>
  );
}

function Resources({ block }) {
  return (
    <div className="space-y-3">
      {block.items.map((it) =>
        it.href ? (
          <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded border border-bright/10 bg-bright/[0.03] hover:border-accent/50 transition-colors">
            <span className="font-mono text-xs text-bright/80">{it.label}</span>
            <span className="font-mono text-[11px] text-bright/40 ml-auto">{it.meta}</span>
          </a>
        ) : (
          <div key={it.label} className={`px-5 py-3 rounded border border-bright/10 bg-bright/[0.03] ${it.tone === "warn" ? "" : " transition-colors hover:border-accent/50"}`}>
            <span className="font-mono text-xs text-bright/60">{it.label}</span>
            <span className={`font-mono text-xs ${it.tone === "warn" ? "text-warn-soft/80" : "text-accent"}`}>{it.value}</span>
            {it.suffix && <span className="font-mono text-xs text-bright/40">{it.suffix}</span>}
          </div>
        ),
      )}
    </div>
  );
}

export function Block({ block, prev, next, single }) {
  const gap = after(block, next);
  switch (block.type) {
    case "heading":
      return <Heading block={block} single={single} />;
    case "text":
      return <Text block={block} gap={gap} prev={prev} />;
    case "tags":
      return (
        <div className="flex flex-wrap gap-2">
          {block.items.map((s) => (
            <span key={s} className="font-mono text-[11px] px-3 py-1 rounded border border-bright/10 bg-bright/[0.03] text-bright/70 transition-colors cursor-default hover:border-accent/50 hover:bg-accent/10 hover:text-accent">{s}</span>
          ))}
        </div>
      );
    case "points":
      return <Points block={block} gap={gap} single={single} />;
    case "schema":
      return <Schema block={block} gap={gap} />;
    case "video":
      return <VideoBlock src={block.src} caption={block.caption} />;
    case "screens":
      return <Screens block={block} gap={gap} />;
    case "compare":
      return <Compare block={block} gap={gap} />;
    case "image":
      return <Img block={block} gap={gap} />;
    case "figure":
      return <Figure block={block} />;
    case "flow":
      return <Flow block={block} gap={gap} />;
    case "note":
      return <p className={`${gap ? `${gap} ` : ""}text-bright/40 text-[12px]`}>{block.body}</p>;
    case "link":
      return (
        <a href={block.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${prev?.type === "schema" ? " mt-8" : ""} font-mono text-[11px] uppercase tracking-widest text-accent hover:underline`}>
          {block.label}
        </a>
      );
    case "resources":
      return <Resources block={block} />;
    case "themeDemo":
      return <ThemeDemo themes={block.themes} initial={block.initial} />;
    default:
      return null;
  }
}

export default function Blocks({ blocks, single = false }) {
  return blocks.map((block, i) => <Block key={i} block={block} prev={blocks[i - 1]} next={blocks[i + 1]} single={single} />);
}
