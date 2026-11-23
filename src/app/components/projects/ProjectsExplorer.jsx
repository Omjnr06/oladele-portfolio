"use client";
import { useEffect, useMemo, useState } from "react";
import { projects, highlightedProjects } from "@/content/projects";
import { buildBst, groupProjects } from "@/lib/projectTree";
import TerminalTree from "./TerminalTree";
import ProjectPreview from "./ProjectPreview";
import Sketchbook from "./Sketchbook";

const FIRST = highlightedProjects[0]?.id ?? projects[0].id;

export default function ProjectsExplorer() {
  const [selected, setSelected] = useState(FIRST);
  const [mode, setMode] = useState("tree");

  const groups = useMemo(() => groupProjects(projects), []);
  const ordered = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const bst = useMemo(() => buildBst(projects), []);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get("p");
    if (!id || !projects.some((p) => p.id === id)) return;
    const t = setTimeout(() => setSelected(id), 0);
    return () => clearTimeout(t);
  }, []);

  const select = (id) => {
    setSelected(id);
    const url = new URL(location.href);
    url.searchParams.set("p", id);
    history.replaceState(history.state, "", url);
  };

  const current = projects.find((p) => p.id === selected) ?? projects[0];

  return (
    <section id="projects" aria-label="Projects" className="min-h-0 flex-1">
      <div className="grid h-full min-h-0 gap-6 paper:hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <TerminalTree groups={groups} selected={selected} onSelect={select} mode={mode} setMode={setMode} bst={bst} />
        <div className="hidden min-h-0 lg:block">
          <ProjectPreview p={current} />
        </div>
      </div>
      <div className="hidden h-full min-h-0 paper:block">
        <Sketchbook ordered={ordered} groups={groups} selected={selected} onSelect={select} />
      </div>
    </section>
  );
}
