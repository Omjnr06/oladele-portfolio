"use client";
import { useState } from "react";
import { readme } from "@/content/desktop";
import { APPS } from "../apps";
import { useShell } from "../context";
import Menubar from "./Menubar";
import "./apps.css";
import "./notepad.css";

const LINK = /\[([^\]]+)\]/;
const TARGETS = { "recruiter.exe": APPS.recruiter.path };

function Text({ open }) {
  return readme.split(LINK).map((part, i) =>
    i % 2 && TARGETS[part] ? (
      <button key={i} type="button" className="np-link" onClick={() => open(TARGETS[part])}>
        {part}
      </button>
    ) : (
      part
    ),
  );
}

export default function NotepadApp({ win, open }) {
  const { actions } = useShell();
  const [wrap, setWrap] = useState(true);
  const [zoom, setZoom] = useState(100);

  const menus = {
    File: [{ label: "Exit", run: () => actions?.close(win.id) }],
    Format: [{ label: "Word Wrap", checked: wrap, run: () => setWrap((w) => !w) }],
    View: [
      { label: "Zoom In", run: () => setZoom((z) => Math.min(200, z + 10)) },
      { label: "Zoom Out", run: () => setZoom((z) => Math.max(60, z - 10)) },
      { label: "Restore Default Zoom", run: () => setZoom(100) },
    ],
    Help: [{ label: "About Oladele", run: () => open(APPS.home.path) }],
  };

  return (
    <div className="wa np">
      <Menubar label="Notepad menu" menus={menus} />
      <div className="np-page" tabIndex={0} aria-label="readme.txt" data-wrap={wrap || undefined} style={{ fontSize: `${(13 * zoom) / 100}px` }}>
        <Text open={open} />
      </div>
      <div className="wa-status np-status">
        <span>{zoom}%</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
