"use client";
import FileView, { selectedText, useSelection } from "./FileView";
import { APPS, GAMES } from "../apps";
import WinIcon from "../icons";
import "./apps.css";

const ABOUT = {
  sudoku: "Fill the grid so every row, column and box has 1 to 9. Three difficulties, a fresh puzzle every time.",
  snake: "Eat, grow, don't hit yourself. Arrow keys or WASD. Gets faster as you go.",
};

export default function GamesApp({ open }) {
  const selection = useSelection(GAMES[0]);
  const sel = selection.sel;

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
        <button type="button" className="wa-cmd-btn" disabled={!sel.length} onClick={() => sel.forEach((id) => open(APPS[id].path))}>
          Play
        </button>
      </div>
      <div className="wa-row">
        <div className="wa-main">
          <FileView
            label="Games"
            items={GAMES}
            idOf={(id) => id}
            selection={selection}
            onOpen={(ids) => ids.forEach((id) => open(APPS[id].path))}
            menuFor={(ids) => (ids.length ? [{ label: "Play", strong: true, onSelect: () => ids.forEach((id) => open(APPS[id].path)) }] : [])}
            renderItem={(id) => (
              <>
                <WinIcon name={APPS[id].icon} className="wa-thumb-ico" />
                <span>{APPS[id].title}</span>
              </>
            )}
          />
        </div>
      </div>
      <div className="wa-details">
        {sel.length === 1 ? (
          <>
            <WinIcon name={APPS[sel[0]].icon} className="wa-thumb-ico" />
            <div>
              <h3>{APPS[sel[0]].title}</h3>
              <p>{ABOUT[sel[0]]}</p>
            </div>
          </>
        ) : (
          <p className="wa-dim">{sel.length ? selectedText(sel.length) : `${GAMES.length} items`}</p>
        )}
      </div>
      <div className="wa-status">
        <span>{GAMES.length} items</span>
        {sel.length > 0 && <span>{selectedText(sel.length)}</span>}
      </div>
    </div>
  );
}
