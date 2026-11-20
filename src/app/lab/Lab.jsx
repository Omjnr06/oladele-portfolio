"use client";
import Image from "next/image";
import SiteNav from "../components/SiteNav";
import { PAPER_TOKENS, contrast } from "@/lib/themeTokens";
import { profile } from "@/content/profile";

const TONES = [
  { id: "cream", label: "Cream ruled", note: "The report. Blue ruled lines, red margin, blue pen. The main pages would use this." },
  { id: "graph", label: "Graph", note: "The engineering notebook. Used for projects and case studies in every tone; as a main tone it is the cleanest." },
  { id: "kraft", label: "Kraft", note: "Brown paper with dark ink and a red margin. Warmer and more crafty, no ruled lines." },
];

const TABS = ["Home", "Projects", "Resume", "Music", "Contact"];

function Circled({ children }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg aria-hidden viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+16px)] text-accent-2">
        <path d="M8 22 C 6 8, 40 3, 70 5 S 98 14, 94 26 S 60 39, 30 36 S 4 30, 12 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

function Page({ id }) {
  return (
    <div data-pack="paper" data-theme={id} className="relative">
      <div className="paper-page relative overflow-hidden rounded-sm border border-line text-fg shadow-[0_1px_2px_rgb(0_0_0/.12),0_12px_32px_-12px_rgb(0_0_0/.35)]" style={{ "--rule-top": "160px" }}>
        <div className="py-6 pl-20 pr-14">
          <div className="grid grid-cols-[1fr_auto] border border-line font-mono text-[11px] text-muted">
            <span className="border-b border-r border-line px-2 py-1">NAME <span className="text-fg">{profile.firstName} {profile.lastName}</span></span>
            <span className="border-b border-line px-2 py-1">PAGE <span className="text-fg">1 of 4</span></span>
            <span className="border-r border-line px-2 py-1">COURSE <span className="text-fg">CS @ Western &apos;28</span></span>
            <span className="px-2 py-1">DATE <span className="text-fg">2026.11.19</span></span>
          </div>

          <h3 className="mt-8 text-[2rem] font-extrabold leading-[32px] tracking-[-0.03em]">Oladele&apos;s Portfolio</h3>
          <p className="mt-8 max-w-[34ch] text-[15px] leading-[32px]">
            Pursuing Computer Science at Western University. Building <Circled>cool things</Circled>, jamming along the way.
          </p>

          <div className="mt-8 flex items-start gap-6">
            <figure className="paper-tape w-28 shrink-0 rotate-[-3deg] bg-panel p-1.5 pb-6 shadow-[0_2px_6px_rgb(0_0_0/.18)]">
              <Image src="/assets/images/junior-headshot.JPG" alt="" width={112} height={112} sizes="112px" className="aspect-square w-full object-cover" />
              <figcaption className="mt-1 text-center font-hand text-lg leading-none text-fg/80">me, 2026</figcaption>
            </figure>
            <p className="mt-2 rotate-[-2deg] whitespace-nowrap font-hand text-[22px] leading-tight text-accent-2">
              ← started guitar
              <br />
              before code!
            </p>
          </div>
        </div>

        <nav aria-hidden className="absolute right-0 top-24 flex flex-col gap-1.5">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`translate-x-1 rounded-l-md border border-r-0 px-2 py-2 text-[11px] font-medium [writing-mode:vertical-rl] ${i === 0 ? "-translate-x-0 border-accent/50 bg-panel text-accent" : "border-line bg-[color-mix(in_srgb,var(--color-panel)_70%,var(--color-ink))] text-muted"}`}
            >
              {t}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Stats({ id }) {
  const t = PAPER_TOKENS[id];
  const rows = [
    ["text", contrast(t.fg, t.ink)],
    ["muted", contrast(t.muted, t.ink)],
    ["blue pen", contrast(t.accent, t.ink)],
    ["red pen", contrast(t.accent2, t.ink)],
  ];
  return (
    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
      {rows.map(([k, v]) => (
        <span key={k}>
          {k} <span className="text-fg">{v.toFixed(1)}</span>
        </span>
      ))}
    </p>
  );
}

export default function Lab() {
  return (
    <div className="flex min-h-screen bg-ink font-sans text-fg">
      <SiteNav />
      <main className="min-w-0 flex-1 px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="py-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Pass 3a lab</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-bright">Pick the paper tones</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Each card is a mock title page in one tone: report header, typed text on the lines, a red-pen margin note in handwriting, a circled word, a taped photo, and the notebook tabs on the edge. Numbers are contrast against the paper (4.5 is the floor for text).
            </p>
          </header>
          <div className="grid gap-12 lg:grid-cols-3">
            {TONES.map((tone) => (
              <div key={tone.id}>
                <Page id={tone.id} />
                <h3 className="mt-5 text-sm font-semibold text-fg">{tone.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{tone.note}</p>
                <Stats id={tone.id} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
