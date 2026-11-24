"use client";
import { useEffect, useRef, useState } from "react";
import { readme } from "@/content/desktop";
import { APPS } from "../apps";
import { useShell } from "../context";
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
  const [menu, setMenu] = useState(null);
  const bar = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e) => !bar.current?.contains(e.target) && setMenu(null);
    const onKey = (e) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

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
      <div ref={bar} className="np-menubar" role="menubar" aria-label="Notepad menu">
        {Object.entries(menus).map(([name, items]) => (
          <div key={name} className="np-menu">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={menu === name}
              className="np-top"
              onClick={() => setMenu((m) => (m === name ? null : name))}
              onPointerEnter={() => menu && setMenu(name)}
            >
              {name}
            </button>
            {menu === name && (
              <div className="cm np-drop" role="menu" aria-label={name}>
                {items.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    role={it.checked === undefined ? "menuitem" : "menuitemcheckbox"}
                    aria-checked={it.checked}
                    className="cm-item"
                    onClick={() => {
                      setMenu(null);
                      it.run();
                    }}
                  >
                    {it.checked && <span aria-hidden className="np-check">✓</span>}
                    {it.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
