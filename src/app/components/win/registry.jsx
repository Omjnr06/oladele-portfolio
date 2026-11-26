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
const Recruiter = lazy(() => import("./apps/RecruiterApp"));
const Notepad = lazy(() => import("./apps/NotepadApp"));
const TaskManager = lazy(() => import("./apps/TaskManagerApp"));
const Games = lazy(() => import("./apps/GamesApp"));
const Sudoku = lazy(() => import("./apps/SudokuApp"));
const Snake = lazy(() => import("./apps/SnakeApp"));
const Grind = lazy(() => import("./apps/GrindApp"));
const Music = lazy(() => import("./apps/MusicApp"));
const Player = lazy(() => import("./apps/PlayerApp"));
const Spotify = lazy(() => import("./apps/SpotifyApp"));

const NATIVE = new Set(["resume", "projects", "gallery", "contact", "home", "personalize", "recruiter", "readme", "taskmgr", "games", "sudoku", "snake", "grind", "music", "player", "spotify"]);

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
    case "recruiter":
      return <Recruiter win={win} open={open} />;
    case "readme":
      return <Notepad win={win} open={open} />;
    case "taskmgr":
      return <TaskManager win={win} open={open} />;
    case "games":
      return <Games win={win} open={open} />;
    case "sudoku":
      return <Sudoku win={win} open={open} />;
    case "snake":
      return <Snake win={win} open={open} />;
    case "grind":
      return <Grind win={win} open={open} />;
    case "music":
      return <Music win={win} open={open} />;
    case "player":
      return <Player win={win} open={open} />;
    case "spotify":
      return <Spotify />;
    default:
      return fallback;
  }
}
