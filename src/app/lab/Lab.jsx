"use client";
import { useState, useSyncExternalStore } from "react";
import { MotionConfig, motion } from "framer-motion";
import { NavShape, DIRECTIONS } from "./NavShapes";
import { THEMES } from "@/lib/themes";
import { VARIANT_TOKENS, contrast } from "@/lib/themeTokens";
import { applyTheme, usePrefs } from "@/lib/prefs";
import { themeTransition } from "@/lib/themeTransition";

const subscribe = () => () => {};
const useMac = () => useSyncExternalStore(subscribe, () => /Mac|iPhone|iPad/.test(navigator.platform || ""), () => false);

function Faux({ offset, top }) {
  return (
    <motion.div initial={false} animate={{ paddingLeft: offset + 24, paddingTop: top }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="h-full pr-6">
      <p className="pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Explorer // Developer</p>
      <p className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-bright">Oladele Magbadelo</p>
      <p className="mt-2 max-w-sm text-sm text-muted">Pursuing Computer Science at Western University. Building cool things.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 rounded-lg border border-line bg-panel" />
        ))}
      </div>
    </motion.div>
  );
}

function Frame({ direction, mode, phone, title }) {
  const [active, setActive] = useState("home");
  const mac = useMac();
  const rail = mode === "rail";
  return (
    <figure>
      <div className={`relative overflow-hidden rounded-xl border border-line-strong bg-ink bg-journal-dots ${phone ? "h-[520px] w-[300px]" : "h-[460px] w-full"}`}>
        {!phone && <Faux offset={rail ? DIRECTIONS[direction].railWidth : 0} top={rail ? 0 : 64} />}
        {phone && (
          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Explorer // Developer</p>
            <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-bright">Oladele Magbadelo</p>
            <div className="mt-6 h-40 rounded-lg border border-line bg-panel" />
          </div>
        )}
        <NavShape direction={direction} mode={mode} phone={phone} active={active} onSelect={setActive} scope={`${direction}-${mode}-${phone ? "p" : "d"}`} mac={mac} />
      </div>
      {title && <figcaption className="mt-2 font-mono text-[11px] text-muted">{title}</figcaption>}
    </figure>
  );
}

function Section({ id, title, children, note }) {
  return (
    <section id={id} className="border-t border-line py-16">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-bright">{title}</h2>
      {note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Morph() {
  const [direction, setDirection] = useState("dock");
  const [mode, setMode] = useState("rail");
  const [active, setActive] = useState("projects");
  const mac = useMac();
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.entries(DIRECTIONS).map(([id, d]) => (
          <button key={id} type="button" aria-pressed={direction === id} onClick={() => setDirection(id)} className={`h-10 rounded-full border px-4 text-sm transition-colors duration-150 ${direction === id ? "border-accent/40 bg-accent/10 text-accent" : "border-line text-muted hover:text-fg"}`}>
            {d.label}
          </button>
        ))}
        <button type="button" onClick={() => setMode((m) => (m === "rail" ? "pill" : "rail"))} className="ml-auto h-10 rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-transform duration-150 active:scale-[0.97]">
          Switch to {mode === "rail" ? "pill" : "rail"}
        </button>
      </div>
      <div className="relative h-[460px] overflow-hidden rounded-xl border border-line-strong bg-ink bg-journal-dots">
        <Faux offset={mode === "rail" ? DIRECTIONS[direction].railWidth : 0} top={mode === "rail" ? 0 : 64} />
        <NavShape key={direction} direction={direction} mode={mode} active={active} onSelect={setActive} scope="morph" mac={mac} />
      </div>
    </div>
  );
}

function VariantCard({ variant, current, onTry }) {
  const t = VARIANT_TOKENS[variant.id];
  const ratios = t
    ? [
        ["text", contrast(t.fg, t.ink)],
        ["muted", contrast(t.muted, t.ink)],
        ["accent", contrast(t.accent, t.ink)],
      ]
    : null;
  return (
    <div data-theme={variant.id} className="overflow-hidden rounded-xl border border-line-strong bg-ink text-fg">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">{`// ${variant.label}`}</p>
          {variant.light && <span className="rounded border border-line px-1.5 font-mono text-[11px] text-muted">light</span>}
        </div>
        <p className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-bright">Oladele Magbadelo</p>
        <p className="mt-1 text-sm text-muted">Building cool things. Jamming along the way.</p>
        <div className="mt-4 rounded-lg border border-line bg-panel p-3">
          <p className="text-sm font-semibold text-fg">The Vault</p>
          <p className="mt-0.5 text-xs text-muted">Next.js · FastAPI · Plaid</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">Python</span>
            <span className="rounded-full border border-accent-2/30 bg-accent-2/10 px-2 py-0.5 text-[11px] text-accent-2">Featured</span>
            <span className="rounded-full bg-ok/10 px-2 py-0.5 text-[11px] text-ok">live</span>
            <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[11px] text-warn">beta</span>
            <span className="rounded-full bg-err/10 px-2 py-0.5 text-[11px] text-err">closed</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={(e) => onTry(e, variant.id)} className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-on-accent transition-transform duration-150 active:scale-[0.97]">
            {current ? "Showing on page" : "Try on whole page"}
          </button>
          <span className="flex h-10 items-center rounded-md border border-line-strong px-3 text-sm text-fg/80">Secondary</span>
        </div>
      </div>
      <div className="flex gap-4 border-t border-line bg-panel px-5 py-2 font-mono text-[11px] text-muted">
        {ratios ? ratios.map(([k, r]) => <span key={k}>{k} {r.toFixed(1)}:1</span>) : <span>today&apos;s colours</span>}
      </div>
    </div>
  );
}

export default function Lab() {
  const prefs = usePrefs();
  const [tried, setTried] = useState(null);
  const tryOn = (e, id) => {
    setTried(id);
    themeTransition(e, () => applyTheme({ pack: "modern", variant: id }));
  };
  const reset = (e) => {
    setTried(null);
    themeTransition(e, () => applyTheme(prefs));
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-ink px-6 pb-24 font-sans text-fg md:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="py-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">Pass 2a lab</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-bright">Pick a rail, check the morph, check the colours</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Nothing here is on the real site yet. Click the nav items in every frame, switch rail and pill in the morph, and try each colour on this whole page. Tell me which rail direction to build and anything that feels off.
            </p>
            {tried && (
              <button type="button" onClick={reset} className="mt-6 h-10 rounded-full border border-line-strong px-4 text-sm text-fg transition-colors hover:border-accent/40">
                Back to my saved colours
              </button>
            )}
          </header>

          <Section id="rails" title="1. Rail directions" note="All three drop the rotated book-spine labels (that motif is Paper's now). Each has search (Ctrl K) and the theme button built in.">
            <div className="grid gap-8 lg:grid-cols-3">
              {Object.entries(DIRECTIONS).map(([id, d]) => (
                <div key={id}>
                  <Frame direction={id} mode="rail" />
                  <h3 className="mt-4 text-sm font-semibold text-fg">{d.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{d.note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="pills" title="2. The pill version of each" note="Top of the page on desktop, bottom on phones (except /music, which keeps its own bottom pill).">
            <div className="grid gap-8">
              {Object.keys(DIRECTIONS).map((id) => (
                <Frame key={id} direction={id} mode="pill" title={DIRECTIONS[id].label} />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              {Object.keys(DIRECTIONS).map((id) => (
                <Frame key={id} direction={id} mode="pill" phone title={`${DIRECTIONS[id].label} (phone)`} />
              ))}
            </div>
          </Section>

          <Section id="morph" title="3. Rail ↔ pill morph" note="Pick a direction, then switch. The nav reshapes and the page slides to make room. With reduced motion on, it swaps instantly.">
            <Morph />
          </Section>

          <Section id="colours" title="4. Colours" note="Cyan is today's site. The second accent (purple tag) is my proposal for each Vault theme. Daylight and Linen are light; photos and videos stay dark on them. Numbers are contrast against the background (4.5 is the floor for text).">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {THEMES.modern.variants.map((v) => (
                <VariantCard key={v.id} variant={v} current={tried === v.id} onTry={tryOn} />
              ))}
            </div>
          </Section>
        </div>
      </main>
    </MotionConfig>
  );
}
