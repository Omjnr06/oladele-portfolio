"use client";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Analog({ now }) {
  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const hand = (deg, len, w, cls) => <line x1="50" y1="50" x2="50" y2={50 - len} strokeWidth={w} className={cls} transform={`rotate(${deg} 50 50)`} />;
  return (
    <svg viewBox="0 0 100 100" className="cf-analog" aria-hidden>
      <circle cx="50" cy="50" r="46" className="cf-face" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1="9" x2="50" y2={i % 3 ? 13 : 16} strokeWidth={i % 3 ? 1.4 : 2.6} className="cf-tick" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      {hand(h * 30, 24, 4, "cf-hand")}
      {hand(m * 6, 34, 2.6, "cf-hand")}
      {hand(s * 6, 37, 1.2, "cf-sec")}
      <circle cx="50" cy="50" r="2.6" className="cf-pin" />
    </svg>
  );
}

export default function ClockFlyout({ onClose }) {
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const ref = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const onDown = (e) => !ref.current?.contains(e.target) && !e.target.closest?.(".win-clock") && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(t);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const first = new Date(view.y, view.m, 1);
  const start = new Date(view.y, view.m, 1 - first.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const step = (d) => setView(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const today = (d) => d.toDateString() === now.toDateString();

  return (
    <div ref={ref} className="cf" role="dialog" aria-label="Date and time">
      <p className="cf-long">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
      <div className="cf-body">
        <div className="cf-cal">
          <div className="cf-head">
            <button type="button" className="cf-arrow" aria-label="Previous month" onClick={() => step(-1)}>
              <svg viewBox="0 0 10 10" aria-hidden><path d="M6.5 2L3.5 5l3 3" /></svg>
            </button>
            <span>{first.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
            <button type="button" className="cf-arrow" aria-label="Next month" onClick={() => step(1)}>
              <svg viewBox="0 0 10 10" aria-hidden><path d="M3.5 2l3 3-3 3" /></svg>
            </button>
          </div>
          <div className="cf-grid" role="grid" aria-label={first.toLocaleDateString([], { month: "long", year: "numeric" })}>
            {DAYS.map((d) => (
              <span key={d} className="cf-dow">
                {d}
              </span>
            ))}
            {cells.map((d) => (
              <span key={d.toISOString()} className="cf-day" data-out={d.getMonth() !== view.m || undefined} aria-current={today(d) ? "date" : undefined}>
                {d.getDate()}
              </span>
            ))}
          </div>
        </div>
        <div className="cf-clock">
          <Analog now={now} />
          <p>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}</p>
        </div>
      </div>
    </div>
  );
}
