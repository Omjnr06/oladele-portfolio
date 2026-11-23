"use client";
import { useEffect, useRef, useState } from "react";

const FUN = /\b(cool|Jamming)\b/;

function useReplay(initial) {
  const [run, setRun] = useState(initial);
  const [n, setN] = useState(0);
  const start = () => {
    if (run || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN((x) => x + 1);
    setRun("hover");
  };
  return { run, n, start, stop: () => setRun(false) };
}

function Shades() {
  return (
    <>
      <svg viewBox="0 0 24 7" shapeRendering="crispEdges" className="shades-px">
        <path d="M0 0h24v1H0zM1 1h9v2H1zM2 3h7v1H2zM3 4h5v1H3zM13 1h9v2h-9zM14 3h7v1h-7zM15 4h5v1h-5zM10 1h3v1h-3z" fill="#0b0b0f" />
        <path d="M2 1h1v1H2zM3 2h1v1H3zM14 1h1v1h-1zM15 2h1v1h-1z" fill="#f5f5f5" />
      </svg>
      <svg viewBox="0 0 48 16" className="shades-ink">
        <path d="M2 3.5c6-.8 14-.9 20 .3 2-.6 4-.6 5.6 0 6-1.2 13.5-1.1 18.6-.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 4.2c.4 5.6 3 9.2 8 9 5-.3 8.3-3.6 8.8-8.6M27.4 4.5c.3 5.3 3.4 8.7 8.4 8.6 5-.2 7.8-3.8 8.2-8.8" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M7 6.5l2.5-1.2M31 6.6l2.4-1.1" stroke="#fffdf8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </>
  );
}

function Cool({ children }) {
  const { run, n, start, stop } = useReplay("load");
  return (
    <span className="cool-word" data-run={run || undefined} onPointerEnter={start}>
      <span key={n} className="cool-head" onAnimationEnd={(e) => e.target === e.currentTarget && stop()}>
        {children}
        <span aria-hidden className="cool-shades">
          <Shades />
        </span>
      </span>
    </span>
  );
}

const OUT = "band-mask";
const IN = "band-solid";

function Body({ x, y, top = 0 }) {
  return (
    <>
      <circle cx={x} cy={y - 16 - top} r="3.2" />
      <path d={`M${x} ${y - 12.8 - top}V${y}`} />
    </>
  );
}

function Drummer() {
  return (
    <svg x="0" width="40" height="48" viewBox="0 0 40 48" className="band-player" style={{ "--d": "0.1s" }}>
      <path d="M5 33h8M6 33l-1 13M12 33l1 13" />
      <g className="band-bob">
        <Body x={10} y={32} />
        <path d="M10 32h7v11" />
      </g>
      <path d="M16.5 32v13M14.5 46l2-1 2 1" />
      <rect x="12.5" y="29" width="8" height="3" rx="1" className={IN} />
      <circle cx="26" cy="37" r="8.5" className={IN} />
      <circle cx="26" cy="37" r="6.4" strokeWidth="0.9" className="band-faint" />
      <rect x="22" y="24.5" width="8" height="4" rx="1.4" className={IN} />
      <path d="M35.5 19v27M33.5 46l2-1 2 1" />
      <path className="band-cymbal" d="M30 19.6l11-1.8" strokeWidth="2" />
      <g className="band-stick-l">
        <path d="M10 19l3 6h3" />
        <path d="M16 25l3.5 3.6" strokeWidth="1.3" />
      </g>
      <g className="band-stick-r">
        <path d="M10 19l5 3 4-2" />
        <path d="M19 20l9-.6" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function Guitarist() {
  return (
    <svg x="40" width="40" height="48" viewBox="0 0 40 48" className="band-player" style={{ "--d": "0.2s" }}>
      <path d="M14 28l-4 17h-2M14 28l4 17h2" />
      <g className="band-bob band-bob-fast">
        <Body x={14} y={28} />
        <g transform="translate(13 24) rotate(-24)">
          <circle cx="0" cy="0" r="5.2" />
          <circle cx="6.6" cy="0" r="3.8" />
          <circle cx="0" cy="0" r="4.3" className={OUT} />
          <circle cx="6.6" cy="0" r="2.9" className={OUT} />
          <circle cx="3.4" cy="0" r="1.3" />
          <path d="M-2.6-1.6v3.2M10.4 0H22" />
          <rect x="22" y="-1.3" width="3.4" height="2.6" rx="0.6" fill="currentColor" />
        </g>
        <path d="M14 15l7 5 6.4-2.6" />
        <path className="band-strum" d="M14 15l-3 5.6 4.6 2.6" />
      </g>
    </svg>
  );
}

function Bassist() {
  return (
    <svg x="80" width="40" height="48" viewBox="0 0 40 48" className="band-player" style={{ "--d": "0.3s" }}>
      <g className="band-sway">
        <path d="M11 29l-3 16h-2M11 29l3 16h2" />
        <Body x={11} y={29} />
        <circle cx="25" cy="36" r="6.4" />
        <circle cx="25" cy="26.6" r="4.9" />
        <circle cx="25" cy="36" r="5.5" className={OUT} />
        <circle cx="25" cy="26.6" r="4" className={OUT} />
        <path d="M22.6 29.6v4.2M27.4 29.6v4.2" strokeWidth="0.9" />
        <path d="M25 21.7V6M25 42.4V46M23.4 8h3.2" />
        <circle cx="25" cy="4.6" r="1.3" />
        <path d="M11 16l5-3.4 7.6-1.4" />
        <path className="band-pluck" d="M11 16l4 7 6 3.6" />
      </g>
    </svg>
  );
}

function Trumpeter() {
  return (
    <svg x="120" width="40" height="48" viewBox="0 0 40 48" className="band-player" style={{ "--d": "0.4s" }}>
      <path d="M12 28l-3 17H7M12 28l3 17h2" />
      <g className="band-blow">
        <Body x={12} y={28} top={2.5} />
        <path d="M15.2 10H26M18 10.2c0 3.4 7.6 3.4 7.6 0M21 10V8.2M22.6 10V8.2M24.2 10V8.2" />
        <path d="M25.6 9.2L32 6.2c.9 2.6.9 5.6 0 8.2l-6.4-3" className={IN} />
        <path d="M12 16l4.6-1.4 4.4-4M12 16.4l5.6 1.4 4.6-5" />
      </g>
      <g className="band-note">
        <circle cx="34" cy="7" r="1.4" fill="currentColor" stroke="none" />
        <path d="M35.3 7V2l2.2 1.2" strokeWidth="1.1" />
      </g>
      <g className="band-note band-note-2">
        <circle cx="30" cy="4" r="1.2" fill="currentColor" stroke="none" />
        <path d="M31.1 4V0" strokeWidth="1" />
      </g>
    </svg>
  );
}

function Band({ closing, onDone }) {
  return (
    <span aria-hidden className="jam-band" data-closing={closing || undefined} onAnimationEnd={(e) => e.animationName === "band-close" && onDone()}>
      <svg viewBox="0 0 160 48" className="band-svg" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Drummer />
        <Guitarist />
        <Bassist />
        <Trumpeter />
      </svg>
    </span>
  );
}

function Jam({ children }) {
  const [run, setRun] = useState(false);
  const [closing, setClosing] = useState(false);
  const line = useRef(null);
  const hover = useRef(false);
  const since = useRef(0);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const lock = (el) => {
    const r = el.getBoundingClientRect();
    const header = el.closest("header");
    const side = header?.lastElementChild?.getBoundingClientRect();
    const edge = side && side.top < r.bottom && side.bottom > r.top ? side.left - 12 : (header?.getBoundingClientRect().right ?? innerWidth) - 4;
    const em = parseFloat(getComputedStyle(el).fontSize);
    el.style.setProperty("--band", `${Math.max(4.5 * em, Math.min(8.2 * em, edge - r.right))}px`);
    el.style.width = `${r.width}px`;
    el.style.whiteSpace = "nowrap";
    line.current = el;
  };

  const close = (wait) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => !hover.current && setClosing(true), wait);
  };

  const enter = (e) => {
    hover.current = true;
    if (run || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget.closest(".tagline-line");
    if (el) lock(el);
    since.current = Date.now();
    setRun(true);
    if (e.pointerType !== "mouse") {
      hover.current = false;
      close(3500);
    }
  };

  const leave = (e) => {
    if (e.pointerType !== "mouse") return;
    hover.current = false;
    if (run && !closing) close(Math.max(0, since.current + 2000 - Date.now()));
  };

  const done = () => {
    if (line.current) {
      line.current.style.width = "";
      line.current.style.whiteSpace = "";
      line.current.style.removeProperty("--band");
      line.current = null;
    }
    setClosing(false);
    setRun(false);
  };

  return (
    <span className="jam-group" data-run={(run && !closing) || undefined} onPointerEnter={enter} onPointerLeave={leave}>
      <span className="jam-word">
        {[...children].map((c, i) => (
          <span key={i} className="jam-letter" style={{ "--i": i }}>
            {c}
          </span>
        ))}
      </span>
      {run && <Band closing={closing} onDone={done} />}
    </span>
  );
}

function Words({ text }) {
  return text.split(FUN).map((part, i) => (i % 2 ? (part === "cool" ? <Cool key={i}>{part}</Cool> : <Jam key={i}>{part}</Jam>) : part));
}

export default function Tagline({ text, em }) {
  return text.split(/\*([^*]+)\*/).map((part, i) =>
    i % 2 ? (
      <span key={i} className={em}>
        <Words text={part} />
      </span>
    ) : (
      <Words key={i} text={part} />
    ),
  );
}
