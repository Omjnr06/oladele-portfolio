import Link from "next/link";
import Blocks, { colorValue, figureStarts, SheetHead } from "./Blocks";
import CaseStudyTabs from "./CaseStudyTabs";
import Showcase from "./Showcase";
import SiteNav from "../SiteNav";
import ReportHeader from "../paper/ReportHeader";
import MarginNote from "../paper/MarginNote";

const TOKEN_BADGE = {
  accent: "text-accent bg-accent/10 border-accent/20",
  "accent-2": "text-accent-2 bg-accent-2/10 border-accent-2/20",
};

const ACTION_ICONS = {
  document: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>,
  external: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>,
};

const ACTION_STYLE = {
  accent: { box: "bg-accent/10 border-accent/30 shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:bg-accent/20 hover:border-accent/60", icon: "text-accent" },
  "accent-2": { box: "bg-accent-2/10 border-accent-2/30 shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent-2)_10%,transparent)] hover:bg-accent-2/20 hover:border-accent-2/60", icon: "text-accent-2" },
};

function Badge({ badge }) {
  const base = "font-mono text-[11px] tracking-[0.3em] uppercase px-3 py-1 rounded border paper-stamp";
  if (TOKEN_BADGE[badge.color]) return <span className={`${base} ${TOKEN_BADGE[badge.color]}`}>{badge.label}</span>;
  const c = colorValue(badge.color);
  return (
    <span className={base} style={{ color: c, background: `color-mix(in oklab, ${c} 10%, transparent)`, borderColor: `color-mix(in oklab, ${c} 20%, transparent)` }}>
      {badge.label}
    </span>
  );
}

function Prompt({ text, className }) {
  return (
    <>
      <div className={`${className} paper:hidden`}>
        <span>{text}</span>
        <span className="animate-pulse bg-bright/60 w-2 h-4 inline-block" />
      </div>
      <p className="hidden paper:block mt-8 font-hand text-2xl text-accent-2">end of notes, O.M.</p>
    </>
  );
}

export default function CaseStudy({ study }) {
  const { modern } = study;
  const single = modern.layout === "single";

  return (
    <main className="min-h-screen w-full flex flex-row bg-ink text-bright font-sans selection:bg-accent selection:text-on-accent relative">
      <SiteNav page="case" />
      <div className="flex-1 min-w-0 relative overflow-x-clip paper-page">
      <div className="absolute inset-0 z-0 pointer-events-none bg-journal-dots opacity-80 paper:hidden" />
      <div className={`absolute top-[10%] right-[-10%] w-[500px] h-[500px] ${modern.glow === "accent" ? "bg-accent" : "bg-accent-2"} opacity-[0.03] rounded-full blur-[120px] pointer-events-none paper:hidden`} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-12 font-mono text-[11px] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Projects
        </Link>

        <ReportHeader path={`/projects/${study.slug}`} />

        <div className={`rise-in relative ${single ? "mb-12" : "mb-10"}`}>
          <div className="absolute right-0 top-0 hidden lg:block">
            <MarginNote note={study.marginNote} className="max-w-56 rotate-[4deg] text-right" />
          </div>
          <div className={`flex items-center gap-3 mb-4 ${single ? "" : " flex-wrap"}`}>
            <Badge badge={study.badge} />
            <span className="font-mono text-[11px] text-accent tracking-[0.3em] uppercase">{`// ${study.kicker}`}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-bright">{study.title}</h1>
          <p className="text-xl text-bright/60 font-light leading-relaxed max-w-2xl">{study.summary}</p>

          {study.stage && (
            <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-wide px-4 py-2 rounded-full border border-warn/30 bg-warn/5 text-warn-soft">
              <span className="w-2 h-2 rounded-full bg-warn animate-pulse" />
              CURRENT STAGE: {study.stage}
            </div>
          )}

          {study.showcase && (
            <div className="mt-8 paper:w-fit paper-taped paper-tilt-l">
              <Showcase id={study.showcase} />
            </div>
          )}
        </div>

        {study.actions?.length > 0 && (
          <div className="rise-in rise-in-1 mb-16 flex flex-col sm:flex-row gap-4">
            {study.actions.map((a) => {
              const s = ACTION_STYLE[a.color] ?? ACTION_STYLE.accent;
              return (
                <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-3 px-6 py-3 border rounded transition group ${s.box} paper:shadow-none paper:rounded-sm`}>
                  <svg className={`w-5 h-5 ${s.icon} group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">{ACTION_ICONS[a.icon]}</svg>
                  <span className="font-mono text-xs uppercase tracking-widest text-bright">{a.label}</span>
                </a>
              );
            })}
          </div>
        )}

        {single ? (
          <div className="rise-in rise-in-2 w-full bg-panel border border-bright/10 rounded-xl shadow-2xl overflow-hidden paper-sheet">
            <div className="h-10 bg-panel-2 border-b border-bright/5 flex items-center px-4 gap-2 paper:hidden">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 font-mono text-[11px] text-bright/50 tracking-widest">{modern.file}</span>
            </div>
            <div className="@container p-6 md:p-10 font-mono text-sm leading-relaxed text-bright/80 space-y-12 paper:font-sans paper:text-[15px] paper:leading-[1.7]">
              <SheetHead title={study.title} label="Report" />
              {study.sections.map((s, i) => (
                <section key={s.id}>
                  <Blocks blocks={s.blocks} single figStart={figureStarts(study.sections)[i]} />
                </section>
              ))}
              <section>
                <Prompt text={modern.prompt} className="mt-12 pt-8 border-t border-bright/5 flex items-center gap-2 text-bright/40" />
              </section>
            </div>
          </div>
        ) : (
          <>
            <CaseStudyTabs sections={study.sections} file={modern.file} title={study.title} />
            <Prompt text={modern.prompt} className="mt-8 pt-8 border-t border-bright/5 flex items-center gap-2 text-bright/40 font-mono text-sm" />
          </>
        )}
      </div>
      </div>
    </main>
  );
}
