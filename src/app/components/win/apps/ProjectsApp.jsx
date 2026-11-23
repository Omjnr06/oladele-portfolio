"use client";
import { useMemo, useState } from "react";
import { projects, projectCategories, caseStudyHref } from "@/content/projects";
import WinIcon from "../icons";
import "./apps.css";

const nice = (c) => c.charAt(0) + c.slice(1).toLowerCase();
const STUDIES = "CASE STUDIES";

function Thumb({ p }) {
  const poster = p.media?.poster;
  return (
    <span className="wa-thumb">
      {poster ? <img src={poster} alt="" loading="lazy" draggable="false" /> : <WinIcon name="folder" className="wa-thumb-ico" />}
    </span>
  );
}

export default function ProjectsApp({ open }) {
  const [cat, setCat] = useState("ALL");
  const [sel, setSel] = useState(projects[0]?.id ?? null);

  const list = useMemo(() => {
    if (cat === "ALL") return projects;
    if (cat === STUDIES) return projects.filter((p) => p.caseStudy);
    return projects.filter((p) => p.categories.includes(cat));
  }, [cat]);

  const picked = list.find((p) => p.id === sel) ?? null;

  const launch = (p) => {
    const site = p.links?.live || p.links?.github;
    if (p.caseStudy) open(caseStudyHref(p.caseStudy));
    else if (site?.startsWith("/")) open(site);
    else if (site) window.open(site, "_blank", "noopener,noreferrer");
    else setSel(p.id);
  };

  const onKeys = (e) => {
    const i = list.findIndex((p) => p.id === sel);
    const cols = Math.max(1, Math.floor(e.currentTarget.clientWidth / 138));
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (step) {
      e.preventDefault();
      const next = list[Math.min(list.length - 1, Math.max(0, i + step))];
      if (next) {
        setSel(next.id);
        e.currentTarget.querySelector(`[data-file="${next.id}"]`)?.focus();
      }
    }
    if (e.key === "Enter" && picked) launch(picked);
  };

  return (
    <div className="wa">
      <div className="wa-addr">
        <WinIcon name="folder" className="wa-nav-ico" />
        <div className="wa-crumbs" aria-label="Location">
          <button type="button" className="wa-crumb" onClick={() => setCat("ALL")}>
            Oladele
          </button>
          <span className="wa-crumb-sep">›</span>
          <button type="button" className="wa-crumb" onClick={() => setCat("ALL")}>
            Projects
          </button>
          {cat !== "ALL" && (
            <>
              <span className="wa-crumb-sep">›</span>
              <span className="wa-crumb">{nice(cat)}</span>
            </>
          )}
        </div>
      </div>
      <div className="wa-row">
        <nav className="wa-nav" aria-label="Project folders">
          <p className="wa-nav-head">Libraries</p>
          {[...projectCategories, STUDIES].map((c) => (
            <button key={c} type="button" className="wa-nav-item" aria-pressed={cat === c} onClick={() => setCat(c)}>
              <WinIcon name="folder" className="wa-nav-ico" />
              {c === "ALL" ? "All projects" : nice(c)}
            </button>
          ))}
        </nav>
        <div className="wa-main">
          <div className="wa-files" role="listbox" aria-label="Projects" tabIndex={-1} onKeyDown={onKeys}>
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                data-file={p.id}
                aria-selected={sel === p.id}
                className="wa-file"
                onClick={() => setSel(p.id)}
                onDoubleClick={() => launch(p)}
              >
                <Thumb p={p} />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="wa-details">
        {picked ? (
          <>
            <Thumb p={picked} />
            <div>
              <h3>{picked.title}</h3>
              <p className="wa-dim">
                {picked.code} · {picked.categories.map(nice).join(", ")}
              </p>
              <p>{picked.summary}</p>
              <div className="wa-chips" style={{ marginTop: 6 }}>
                {picked.stack.map((s) => (
                  <span key={s} className="wa-chip">
                    {s}
                  </span>
                ))}
              </div>
              <div className="wa-details-actions">
                {picked.caseStudy && (
                  <button type="button" className="wa-btn wa-btn--default" onClick={() => open(caseStudyHref(picked.caseStudy))}>
                    Open case study
                  </button>
                )}
                {picked.links?.live && (
                  <a className="wa-btn" href={picked.links.live} target={picked.links.live.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer">
                    Live site
                  </a>
                )}
                {picked.links?.github && (
                  <a className="wa-btn" href={picked.links.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="wa-dim">{list.length} items</p>
        )}
      </div>
      <div className="wa-status">
        <span>{list.length} items</span>
        {picked && <span>1 item selected</span>}
      </div>
    </div>
  );
}
