"use client";
import { useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import Boot from "../components/boot/Boot";

const CUTS = [
  { ms: 1600, label: "1.6s cut", note: "Quick. The lines land almost together, the collapse is about half a second." },
  { ms: 2200, label: "2.2s cut", note: "Each line gets a beat, and the collapse into OMJ is slower and easier to follow." },
];

function Mock({ markRef }) {
  return (
    <div className="absolute inset-0 flex">
      <div className="flex w-14 shrink-0 flex-col items-center border-r border-line bg-panel py-3">
        <div ref={markRef} className="flex size-8 items-center justify-center rounded-lg border border-line font-mono text-[11px] font-bold text-fg/80">
          OMJ
        </div>
        <div className="mt-auto mb-auto flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`size-4 rounded ${i === 0 ? "bg-accent/40" : "bg-bright/10"}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Explorer // Developer</p>
        <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-bright">Oladele Magbadelo</p>
        <div className="mt-6 h-28 rounded-lg border border-line bg-panel" />
      </div>
    </div>
  );
}

function Cut({ ms, label, note, onFull }) {
  const markRef = useRef(null);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setRun((r) => r + 1);
    setPlaying(true);
  };
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line-strong bg-ink">
        <Mock markRef={markRef} />
        {playing && <Boot key={run} contained duration={ms} target={markRef} onDone={() => setPlaying(false)} />}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-sm font-semibold text-fg">{label}</h3>
        <button type="button" onClick={play} disabled={playing} className="h-10 rounded-full border border-line-strong px-4 text-sm text-fg transition-[border-color,transform,opacity] duration-150 hover:border-accent/40 active:scale-[0.97] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Play in frame
        </button>
        <button type="button" onClick={() => onFull(ms)} className="h-10 rounded-full bg-accent px-4 text-sm font-medium text-on-accent transition-transform duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Play full screen
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p>
    </div>
  );
}

export default function Lab() {
  const [full, setFull] = useState(null);
  return (
    <div className="flex min-h-screen bg-ink font-sans text-fg">
      <SiteNav />
      <main className="min-w-0 flex-1 px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <header className="py-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Pass 2b lab</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-bright">Pick a boot length</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Both cuts print real data (your status, theme, build and NOW line) and collapse into the OMJ mark. Full screen is exactly what a first-time visitor sees on the home page. In the top bar and on phones it collapses into the nav pill instead.
            </p>
          </header>
          <div className="grid gap-10 md:grid-cols-2">
            {CUTS.map((c) => (
              <Cut key={c.ms} {...c} onFull={setFull} />
            ))}
          </div>
        </div>
      </main>
      {full && <Boot key={full} duration={full} onDone={() => setFull(null)} />}
    </div>
  );
}
