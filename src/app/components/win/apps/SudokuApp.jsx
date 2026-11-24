"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { conflicts, makePuzzle, peers } from "./sudoku";
import "./apps.css";
import "./games.css";

const fresh = (level) => {
  const { puzzle, solution } = makePuzzle(level);
  return { level, puzzle, solution, grid: [...puzzle], start: Date.now(), done: 0 };
};

const clock = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function SudokuApp() {
  const [game, setGame] = useState(() => fresh("easy"));
  const [sel, setSel] = useState(() => game.puzzle.findIndex((v) => !v));
  const [now, setNow] = useState(() => Date.now());
  const board = useRef(null);

  const bad = useMemo(() => conflicts(game.grid), [game.grid]);
  const filled = game.grid.filter(Boolean).length;

  useEffect(() => board.current?.focus({ preventScroll: true }), []);

  useEffect(() => {
    if (game.done) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [game.done]);

  const put = (v) => {
    if (game.done || sel < 0 || game.puzzle[sel]) return;
    setGame((g) => {
      const grid = [...g.grid];
      grid[sel] = v;
      const won = grid.every((x, i) => x === g.solution[i]);
      return { ...g, grid, done: won ? Date.now() : 0 };
    });
  };

  const restart = (level = game.level) => {
    const g = fresh(level);
    setGame(g);
    setSel(g.puzzle.findIndex((v) => !v));
    setNow(Date.now());
    board.current?.focus();
  };

  const onKeys = (e) => {
    const move = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (move) {
      e.preventDefault();
      setSel((s) => {
        const from = s < 0 ? 0 : s;
        if (move === -1 && from % 9 === 0) return from + 8;
        if (move === 1 && from % 9 === 8) return from - 8;
        return (from + move + 81) % 81;
      });
    } else if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      put(Number(e.key));
    } else if (["Backspace", "Delete", "0"].includes(e.key)) {
      e.preventDefault();
      put(0);
    }
  };

  const target = sel >= 0 ? game.grid[sel] : 0;
  const elapsed = (game.done || now) - game.start;

  return (
    <div className="wa gm">
      <div className="wa-cmd">
        <button type="button" className="wa-cmd-btn" onClick={() => restart()}>
          New game
        </button>
        <span className="wa-cmd-sep" />
        {["easy", "medium", "hard"].map((l) => (
          <button key={l} type="button" className="wa-cmd-btn" aria-pressed={game.level === l} onClick={() => restart(l)}>
            {l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>
      {game.done > 0 && (
        <div className="wa-info" role="status">
          <span>Solved in {clock(elapsed)}. Nice.</span>
          <button type="button" className="wa-btn" onClick={() => restart()}>
            Play again
          </button>
        </div>
      )}
      <div className="gm-stage">
        <div ref={board} className="sd" role="group" aria-label="Sudoku board" tabIndex={0} onKeyDown={onKeys}>
          {game.grid.map((v, i) => {
            const given = game.puzzle[i] > 0;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                className="sd-cell"
                aria-label={`Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}${v ? `, ${v}` : ", empty"}`}
                aria-current={i === sel || undefined}
                data-given={given || undefined}
                data-peer={(sel >= 0 && i !== sel && peers(i, sel)) || undefined}
                data-same={(target && v === target && i !== sel) || undefined}
                data-bad={bad.has(i) || undefined}
                data-r={Math.floor(i / 9)}
                data-c={i % 9}
                onClick={() => {
                  setSel(i);
                  board.current?.focus();
                }}
              >
                {v || ""}
              </button>
            );
          })}
        </div>
        <div className="sd-pad" aria-label="Number pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} type="button" className="wa-btn sd-key" onClick={() => put(n)}>
              {n}
            </button>
          ))}
          <button type="button" className="wa-btn sd-key sd-erase" onClick={() => put(0)}>
            Erase
          </button>
        </div>
      </div>
      <div className="wa-status">
        <span>{clock(elapsed)}</span>
        <span>
          {filled} of 81 filled
        </span>
        {bad.size > 0 && <span className="gm-warn">{bad.size} clashing</span>}
      </div>
    </div>
  );
}
