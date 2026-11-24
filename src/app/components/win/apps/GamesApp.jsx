"use client";
import { useState } from "react";
import { APPS, GAMES } from "../apps";
import WinIcon from "../icons";
import "./apps.css";

const ABOUT = {
  sudoku: "Fill the grid so every row, column and box has 1 to 9. Three difficulties, a fresh puzzle every time.",
  snake: "Eat, grow, don't hit yourself. Arrow keys or WASD. Gets faster as you go.",
};

export default function GamesApp({ open }) {
  const [sel, setSel] = useState(GAMES[0]);

  const onKeys = (e) => {
    const i = GAMES.indexOf(sel);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      const next = GAMES[(i + step + GAMES.length) % GAMES.length];
      setSel(next);
      e.currentTarget.querySelector(`[data-file="${next}"]`)?.focus();
    }
    if (e.key === "Enter") open(APPS[sel].path);
  };

  return (
    <div className="wa">
      <div className="wa-addr">
        <WinIcon name="games" className="wa-nav-ico" />
        <div className="wa-crumbs" aria-label="Location">
          <span className="wa-crumb">Oladele</span>
          <span className="wa-crumb-sep">›</span>
          <span className="wa-crumb">Games</span>
        </div>
      </div>
      <div className="wa-cmd">
        <button type="button" className="wa-cmd-btn" onClick={() => open(APPS[sel].path)}>
          Play
        </button>
      </div>
      <div className="wa-row">
        <div className="wa-main">
          <div className="wa-files" role="listbox" aria-label="Games" onKeyDown={onKeys}>
            {GAMES.map((id) => (
              <button
                key={id}
                type="button"
                role="option"
                data-file={id}
                aria-selected={sel === id}
                className="wa-file"
                onClick={() => setSel(id)}
                onDoubleClick={() => open(APPS[id].path)}
              >
                <WinIcon name={APPS[id].icon} className="wa-thumb-ico" />
                <span>{APPS[id].title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="wa-details">
        <WinIcon name={APPS[sel].icon} className="wa-thumb-ico" />
        <div>
          <h3>{APPS[sel].title}</h3>
          <p>{ABOUT[sel]}</p>
        </div>
      </div>
      <div className="wa-status">
        <span>{GAMES.length} items</span>
      </div>
    </div>
  );
}
