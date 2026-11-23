"use client";
import { useState } from "react";
import { getCaseStudy } from "@/content/caseStudies";
import Blocks, { figureStarts } from "../../caseStudy/Blocks";
import Showcase from "../../caseStudy/Showcase";
import "./apps.css";

export default function CaseStudyApp({ win }) {
  const study = getCaseStudy(win.id.replace(/^case-/, ""));
  const [tab, setTab] = useState(0);
  if (!study) return <div className="wa-loading">This case study could not be found.</div>;
  const single = study.modern?.layout === "single";
  const starts = figureStarts(study.sections);
  const shown = single ? study.sections.map((s, i) => [s, i]) : [[study.sections[tab], tab]];

  return (
    <div className="wa">
      <div className="wa-cmd">
        {study.actions?.map((a) => (
          <a key={a.href} className="wa-cmd-btn" href={a.href} target="_blank" rel="noopener noreferrer">
            {a.label.charAt(0) + a.label.slice(1).toLowerCase()}
          </a>
        ))}
        {!study.actions?.length && <span className="wa-dim" style={{ paddingLeft: 6 }}>{study.kicker}</span>}
      </div>
      <div className="wa-main">
        <header style={{ padding: "22px 26px 18px", borderBottom: "1px solid #dfe6ef", background: "linear-gradient(to bottom, #fff, #f3f7fc)" }}>
          <p className="wa-dim">{study.badge?.label}</p>
          <h1 style={{ marginTop: 4, color: "#17365d", fontSize: 26, fontWeight: 600, lineHeight: 1.15 }}>{study.title}</h1>
          <p style={{ marginTop: 8, maxWidth: "70ch", color: "#3c4a5c", fontSize: 14, lineHeight: 1.5 }}>{study.summary}</p>
          {study.stage && <p style={{ marginTop: 8, color: "#8a5a0b" }}>Current stage: {study.stage}</p>}
          {study.showcase && (
            <div style={{ marginTop: 14 }}>
              <Showcase id={study.showcase} />
            </div>
          )}
        </header>
        {!single && (
          <div className="wa-tabs" role="tablist" aria-label={`${study.title} sections`}>
            {study.sections.map((s, i) => (
              <button key={s.id} type="button" role="tab" aria-selected={tab === i} className="wa-tab" onClick={() => setTab(i)}>
                {s.label}
              </button>
            ))}
          </div>
        )}
        <div className="wa-case @container text-sm leading-relaxed text-bright/80" style={{ padding: "22px 26px 28px" }}>
          {shown.map(([s, i]) => (
            <section key={s.id} style={{ marginBottom: single ? 40 : 0 }}>
              <Blocks blocks={s.blocks} single={single} figStart={starts[i]} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
