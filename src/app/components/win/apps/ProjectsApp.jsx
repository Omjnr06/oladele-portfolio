"use client";
import { useMemo, useState } from "react";
import FileView, { Stack, selectedText, useSelection } from "./FileView";
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
  const selection = useSelection(projects[0]?.id ?? null);

  const list = useMemo(() => {
    if (cat === "ALL") return projects;
    if (cat === STUDIES) return projects.filter((p) => p.caseStudy);
    return projects.filter((p) => p.categories.includes(cat));
  }, [cat]);

  const chosen = list.filter((p) => selection.sel.includes(p.id));
  const picked = chosen.length === 1 ? chosen[0] : null;

  const launch = (p) => {
    const site = p.links?.live || p.links?.github;
    if (p.caseStudy) open(caseStudyHref(p.caseStudy));
    else if (site?.startsWith("/")) open(site);
    else if (site) window.open(site, "_blank", "noopener,noreferrer");
    else selection.only(p.id);
  };

  const menuFor = (items) => {
    if (!items.length) return [{ label: "Select all", onSelect: () => selection.set({ sel: list.map((p) => p.id) }) }];
    if (items.length > 1) return [{ label: "Open", strong: true, onSelect: () => items.forEach(launch) }];
    const p = items[0];
    return [
      { label: "Open", strong: true, onSelect: () => launch(p) },
      ...(p.links?.live && p.caseStudy ? [{ label: "Live site", onSelect: () => window.open(p.links.live, "_blank", "noopener,noreferrer") }] : []),
      ...(p.links?.github ? [{ label: "GitHub", onSelect: () => window.open(p.links.github, "_blank", "noopener,noreferrer") }] : []),
    ];
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
          <FileView
            key={cat}
            label="Projects"
            items={list}
            idOf={(p) => p.id}
            selection={selection}
            onOpen={(items) => items.forEach(launch)}
            menuFor={menuFor}
            renderItem={(p) => (
              <>
                <Thumb p={p} />
                <span>{p.title}</span>
              </>
            )}
          />
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
        ) : chosen.length ? (
          <Stack thumbs={chosen.map((p) => <Thumb key={p.id} p={p} />)} count={chosen.length} />
        ) : (
          <p className="wa-dim">{list.length} items</p>
        )}
      </div>
      <div className="wa-status">
        <span>{list.length} items</span>
        {chosen.length > 0 && <span>{selectedText(chosen.length)}</span>}
      </div>
    </div>
  );
}
