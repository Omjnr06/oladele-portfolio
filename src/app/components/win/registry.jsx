"use client";
import dynamic from "next/dynamic";

const loading = () => <div className="wa-loading">Loading…</div>;
const lazy = (load) => dynamic(load, { ssr: false, loading });

const Resume = lazy(() => import("./apps/ResumeApp"));
const Projects = lazy(() => import("./apps/ProjectsApp"));
const Gallery = lazy(() => import("./apps/GalleryApp"));
const Contact = lazy(() => import("./apps/ContactApp"));
const About = lazy(() => import("./apps/AboutApp"));
const Personalize = lazy(() => import("./apps/PersonalizeApp"));
const CaseStudy = lazy(() => import("./apps/CaseStudyApp"));

const NATIVE = new Set(["resume", "projects", "gallery", "contact", "home", "personalize"]);

export const hasNative = (id) => id.startsWith("case-") || NATIVE.has(id);

export function AppView({ win, open, fallback }) {
  if (win.id.startsWith("case-")) return <CaseStudy win={win} open={open} />;
  switch (win.id) {
    case "resume":
      return <Resume win={win} open={open} />;
    case "projects":
      return <Projects win={win} open={open} />;
    case "gallery":
      return <Gallery win={win} open={open} />;
    case "contact":
      return <Contact win={win} open={open} />;
    case "home":
      return <About win={win} open={open} />;
    case "personalize":
      return <Personalize win={win} open={open} />;
    default:
      return fallback;
  }
}
