"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import "./apps.css";
import "./games.css";

const COLS = 24;
const ROWS = 18;
const BEST_KEY = "omj-snake-best";
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function spawn(body) {
  const taken = new Set(body.map(([x, y]) => `${x}:${y}`));
  const free = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!taken.has(`${x}:${y}`)) free.push([x, y]);
  return free[Math.floor(Math.random() * free.length)];
}

function start() {
  const body = [
    [8, 9],
    [7, 9],
    [6, 9],
  ];
  return { body, dir: [1, 0], queue: [], food: spawn(body), score: 0, speed: 130 };
}

export default function SnakeApp() {
  const canvas = useRef(null);
  const box = useRef(null);
  const game = useRef(start());
  const [mode, setMode] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [cell, setCell] = useState(18);

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = devicePixelRatio || 1;
    const s = cell;
    if (c.width !== COLS * s * dpr) {
      c.width = COLS * s * dpr;
      c.height = ROWS * s * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#123a1f";
    ctx.fillRect(0, 0, COLS * s, ROWS * s);
    ctx.fillStyle = "#16452a";
    for (let y = 0; y < ROWS; y++) for (let x = (y % 2); x < COLS; x += 2) ctx.fillRect(x * s, y * s, s, s);
    const { body, food, dir } = game.current;
    const [fx, fy] = food;
    ctx.fillStyle = "#ffd25a";
    ctx.beginPath();
    ctx.arc(fx * s + s / 2, fy * s + s / 2, s * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e0601c";
    ctx.fillRect(fx * s + s / 2 - 1, fy * s + s * 0.08, 2, s * 0.2);
    body.forEach(([x, y], i) => {
      const t = i / Math.max(1, body.length - 1);
      ctx.fillStyle = `rgb(${Math.round(150 - 60 * t)} ${Math.round(235 - 70 * t)} ${Math.round(110 - 40 * t)})`;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(x * s + pad, y * s + pad, s - pad * 2, s - pad * 2, s * 0.3);
      ctx.fill();
    });
    const [hx, hy] = body[0];
    const [dx, dy] = dir;
    ctx.fillStyle = "#0c1a12";
    for (const side of [-1, 1]) {
      const ex = hx * s + s / 2 + dx * s * 0.18 + -dy * side * s * 0.2;
      const ey = hy * s + s / 2 + dy * s * 0.18 + dx * side * s * 0.2;
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(1.5, s * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }
  }, [cell]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setCell(Math.max(10, Math.floor(Math.min(width / COLS, height / ROWS))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(draw, [draw]);

  useEffect(() => {
    canvas.current?.parentElement?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (mode !== "playing") return;
    let timer = 0;
    const tick = () => {
      const g = game.current;
      if (g.queue.length) g.dir = g.queue.shift();
      const [hx, hy] = g.body[0];
      const head = [hx + g.dir[0], hy + g.dir[1]];
      const eat = head[0] === g.food[0] && head[1] === g.food[1];
      const body = eat ? g.body : g.body.slice(0, -1);
      const out = head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS;
      if (out || body.some(([x, y]) => x === head[0] && y === head[1])) {
        setMode("over");
        setBest((b) => {
          if (g.score <= b) return b;
          try {
            localStorage.setItem(BEST_KEY, String(g.score));
          } catch {}
          return g.score;
        });
        return;
      }
      g.body = [head, ...body];
      if (eat) {
        g.score += 10;
        g.speed = Math.max(60, g.speed - 3);
        g.food = spawn(g.body);
        setScore(g.score);
      }
      draw();
      timer = setTimeout(tick, g.speed);
    };
    timer = setTimeout(tick, game.current.speed);
    return () => clearTimeout(timer);
  }, [mode, draw]);

  const focusBoard = () => canvas.current?.parentElement?.focus({ preventScroll: true });

  const play = () => {
    game.current = start();
    setScore(0);
    draw();
    setMode("playing");
    focusBoard();
  };

  const toggle = () => {
    setMode((m) => (m === "paused" ? "playing" : "paused"));
    focusBoard();
  };

  const onKeys = (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const d = DIRS[key];
    if (d || key === " " || key === "p" || key === "Enter") e.preventDefault();
    if (mode === "ready" || mode === "over") {
      if (d || key === " " || key === "Enter") {
        play();
        if (d && !(d[0] === -1 && d[1] === 0)) game.current.queue.push(d);
      }
      return;
    }
    if (key === " " || key === "p") {
      toggle();
      return;
    }
    if (!d || mode !== "playing") return;
    const g = game.current;
    const last = g.queue[g.queue.length - 1] ?? g.dir;
    if ((d[0] === -last[0] && d[1] === -last[1]) || (d[0] === last[0] && d[1] === last[1]) || g.queue.length > 2) return;
    g.queue.push(d);
  };

  return (
    <div className="wa gm">
      <div className="wa-cmd">
        <button type="button" className="wa-cmd-btn" onClick={play}>
          New game
        </button>
        <button type="button" className="wa-cmd-btn" disabled={mode !== "playing" && mode !== "paused"} onMouseDown={(e) => e.preventDefault()} onClick={toggle}>
          {mode === "paused" ? "Resume" : "Pause"}
        </button>
      </div>
      <div ref={box} className="gm-stage sn-stage">
        <div
          className="sn-board"
          tabIndex={0}
          role="application"
          aria-label="Snake. Arrow keys or WASD to move, Space to pause."
          onKeyDown={onKeys}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setMode((m) => (m === "playing" ? "paused" : m))}
          style={{ width: COLS * cell, height: ROWS * cell }}
        >
          <canvas ref={canvas} style={{ width: COLS * cell, height: ROWS * cell }} />
          {mode !== "playing" && (
            <div className="sn-overlay">
              {mode === "over" && <p className="sn-big">Game over</p>}
              {mode === "paused" && <p className="sn-big">Paused</p>}
              {mode === "over" && <p>Score {score}</p>}
              <button type="button" className="wa-btn wa-btn--default" onClick={() => (mode === "paused" ? toggle() : play())}>
                {mode === "paused" ? "Resume" : mode === "over" ? "Play again" : "Start"}
              </button>
              <p className="sn-hint">{mode === "paused" ? "Space resumes" : "Arrow keys or WASD. Space pauses."}</p>
            </div>
          )}
        </div>
      </div>
      <div className="wa-status">
        <span>Score {score}</span>
        <span>Best {best}</span>
        <span>Length {3 + score / 10}</span>
      </div>
    </div>
  );
}
