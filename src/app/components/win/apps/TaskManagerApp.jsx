"use client";
import { useEffect, useRef, useState } from "react";
import { useShell } from "../context";
import WinIcon from "../icons";
import DetailsList from "./DetailsList";
import "./apps.css";
import "./taskmgr.css";

const TABS = ["Applications", "Performance", "Networking"];
const POINTS = 60;

function useLoad(open) {
  const [hist, setHist] = useState(() => ({ cpu: Array(POINTS).fill(0), mem: Array(POINTS).fill(0), n: 0, up: 0 }));
  const busy = useRef(0);
  const cpu = useRef(6);

  useEffect(() => {
    const bump = () => (busy.current += 1);
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("keydown", bump);
    const t = setInterval(() => {
      const activity = Math.min(45, busy.current * 0.6);
      busy.current = 0;
      const target = 4 + open * 3 + activity + Math.random() * 6;
      cpu.current += (target - cpu.current) * 0.55;
      const heap = performance.memory?.usedJSHeapSize;
      const mem = heap ? 22 + Math.min(60, heap / 2 ** 20 / 6) : 30 + open * 4 + Math.random() * 1.5;
      const up = Math.floor(performance.now() / 1000);
      setHist((h) => ({ cpu: [...h.cpu.slice(1), Math.min(100, cpu.current)], mem: [...h.mem.slice(1), Math.min(100, mem)], n: h.n + 1, up }));
    }, 1000);
    return () => {
      clearInterval(t);
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [open]);

  return hist;
}

function Graph({ data, n, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== w * dpr || c.height !== h * dpr) {
      c.width = w * dpr;
      c.height = h * dpr;
    }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#0b5d22";
    ctx.lineWidth = 1;
    const cell = 12;
    const shift = (n * 3) % cell;
    ctx.beginPath();
    for (let x = cell - shift; x < w; x += cell) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = cell; y < h; y += cell) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();
    ctx.strokeStyle = "#5bff6a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / 100) * (h - 2) - 1;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }, [data, n]);
  return <canvas ref={ref} className="tm-graph" role="img" aria-label={label} />;
}

function Meter({ value, label, unit = "%" }) {
  const bars = 20;
  const lit = Math.round((value / 100) * bars);
  return (
    <div className="tm-meter" role="meter" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="tm-meter-bars" aria-hidden>
        {Array.from({ length: bars }, (_, i) => (
          <span key={i} data-on={bars - i <= lit || undefined} />
        ))}
      </div>
      <span className="tm-meter-val">
        {Math.round(value)} {unit}
      </span>
    </div>
  );
}

function uptime(s) {
  const p = (n) => String(n).padStart(2, "0");
  return `${Math.floor(s / 86400)}:${p(Math.floor(s / 3600) % 24)}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

function Performance({ hist, open }) {
  const cpu = hist.cpu.at(-1);
  const mem = hist.mem.at(-1);
  return (
    <div className="tm-perf">
      <fieldset className="tm-box">
        <legend>CPU Usage</legend>
        <Meter value={cpu} label="CPU usage" />
      </fieldset>
      <fieldset className="tm-box tm-wide">
        <legend>CPU Usage History</legend>
        <Graph data={hist.cpu} n={hist.n} label={`CPU usage history, now ${Math.round(cpu)} percent`} />
      </fieldset>
      <fieldset className="tm-box">
        <legend>Memory</legend>
        <Meter value={mem} label="Memory in use" />
      </fieldset>
      <fieldset className="tm-box tm-wide">
        <legend>Physical Memory Usage History</legend>
        <Graph data={hist.mem} n={hist.n} label={`Memory usage history, now ${Math.round(mem)} percent`} />
      </fieldset>
      <fieldset className="tm-box tm-full">
        <legend>System</legend>
        <dl className="tm-sys">
          <dt>Windows open</dt>
          <dd>{open}</dd>
          <dt>Up Time</dt>
          <dd>{uptime(hist.up)}</dd>
          <dt>Cups of coffee</dt>
          <dd>{2 + Math.floor(hist.up / 1800)}</dd>
          <dt>Ideas in queue</dt>
          <dd>Too many</dd>
        </dl>
      </fieldset>
    </div>
  );
}

const nice = (k) => k.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Bars({ title, data }) {
  const rows = Object.entries(data ?? {}).slice(0, 6);
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="tm-stat">
      <h3>{title}</h3>
      {rows.length ? (
        <ul>
          {rows.map(([k, n]) => (
            <li key={k}>
              <span className="tm-stat-name">{nice(k)}</span>
              <span className="tm-stat-bar" aria-hidden>
                <span style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="tm-stat-n">{n.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="wa-dim">Nothing logged yet.</p>
      )}
    </section>
  );
}

const getStats = () =>
  fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => ({ data, error: false }))
    .catch(() => ({ data: null, error: true }));

function Networking() {
  const [state, setState] = useState({ data: null, error: false });
  useEffect(() => {
    let on = true;
    getStats().then((s) => on && setState(s));
    return () => {
      on = false;
    };
  }, []);
  const load = () => {
    setState({ data: null, error: false });
    getStats().then(setState);
  };

  if (state.error)
    return (
      <div className="tm-net tm-center">
        <p>Couldn&apos;t reach the stats service.</p>
        <button type="button" className="wa-btn" onClick={load}>
          Try again
        </button>
      </div>
    );
  if (!state.data) return <div className="tm-net tm-center wa-dim">Loading…</div>;
  return (
    <div className="tm-net">
      <p className="wa-dim">What visitors picked in the last 30 days. Refreshed every 10 minutes.</p>
      <Bars title="Looks picked" data={state.data.packs} />
      <Bars title="Tones picked" data={state.data.variants} />
      <Bars title="Palette commands" data={state.data.palette} />
    </div>
  );
}

const COLUMNS = [
  {
    key: "title",
    label: "Task",
    render: (w) => (
      <>
        <WinIcon name={w.icon} className="wl-ico" />
        <span>{w.title}</span>
      </>
    ),
  },
  { key: "status", label: "Status", width: "110px", render: (w) => (w.min ? "Minimized" : "Running") },
];

export default function TaskManagerApp({ open }) {
  const { wins, actions } = useShell();
  const [tab, setTab] = useState("Applications");
  const running = wins.filter((w) => !w.closed);
  const [sel, setSel] = useState(null);
  const hist = useLoad(running.length);
  const picked = running.find((w) => w.id === sel) ?? null;

  return (
    <div className="wa tm">
      <div className="wa-tabs" role="tablist" aria-label="Task Manager">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" className="wa-tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="tm-panel" role="tabpanel" aria-label={tab}>
        {tab === "Applications" && (
          <>
            <DetailsList label="Running applications" columns={COLUMNS} rows={running} rowKey={(w) => w.id} selected={picked?.id ?? null} onSelect={setSel} onOpen={(w) => actions.focus(w.id, { restore: true })}
              menuFor={(w) => [
                { label: "Switch To", strong: true, onSelect: () => actions.focus(w.id, { restore: true }) },
                { label: w.max ? "Restore" : "Maximize", onSelect: () => actions.toggleMax(w.id) },
                "sep",
                { label: "End Task", onSelect: () => actions.close(w.id) },
              ]}
            />
            <div className="tm-actions">
              <button type="button" className="wa-btn" disabled={!picked} onClick={() => actions.close(picked.id)}>
                End Task
              </button>
              <button type="button" className="wa-btn" disabled={!picked} onClick={() => actions.focus(picked.id, { restore: true })}>
                Switch To
              </button>
              <button type="button" className="wa-btn" onClick={() => open("/?app=games")}>
                New Task…
              </button>
            </div>
          </>
        )}
        {tab === "Performance" && <Performance hist={hist} open={running.length} />}
        {tab === "Networking" && <Networking />}
      </div>
      <div className="wa-status tm-status">
        <span>Windows: {running.length}</span>
        <span>CPU Usage: {Math.round(hist.cpu.at(-1))}%</span>
        <span>Physical Memory: {Math.round(hist.mem.at(-1))}%</span>
      </div>
    </div>
  );
}
