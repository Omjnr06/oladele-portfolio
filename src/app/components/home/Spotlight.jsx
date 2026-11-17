"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function useOffscreenPause(ref, reduce) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => {
      el.querySelectorAll("video").forEach((v) => {
        if (!entry.isIntersecting) v.pause();
        else if (!reduce) v.play().catch(() => {});
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, reduce]);
}

function BgVideo({ src, className, reduce }) {
  return reduce ? (
    <video src={`${src}#t=0.1`} preload="metadata" muted playsInline className={className} />
  ) : (
    <video src={src} preload="metadata" autoPlay muted loop playsInline className={className} />
  );
}

const Arrow = ({ d }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

export default function Spotlight({ projects, tracks }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("TECH");
  const [techIndex, setTechIndex] = useState(0);
  const [musicIndex, setMusicIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const boxRef = useRef(null);
  useOffscreenPause(boxRef, reduce);

  const length = mode === "TECH" ? projects.length : tracks.length;
  const setIndex = mode === "TECH" ? setTechIndex : setMusicIndex;

  useEffect(() => {
    if (hovered || length <= 1) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % length), 12000);
    return () => clearInterval(t);
  }, [mode, length, hovered, setIndex]);

  const next = (e) => {
    e.stopPropagation();
    setIndex((p) => (p + 1) % length);
  };
  const prev = (e) => {
    e.stopPropagation();
    setIndex((p) => (p === 0 ? length - 1 : p - 1));
  };

  const p = projects[techIndex];
  const t = tracks[musicIndex];

  return (
    <div className="w-full flex flex-col mb-32 scroll-mt-24" id="spotlight">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent-2 shadow-[0_0_10px_var(--color-accent-2)] animate-pulse" />
          <h2 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-bright uppercase">Spotlight</h2>
        </div>

        <div className="flex items-center bg-panel border border-bright/10 rounded-full p-1 shadow-lg w-full md:w-auto">
          <button
            onClick={() => setMode("TECH")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition duration-300 ${
              mode === "TECH"
                ? "bg-accent/20 text-accent border border-accent/30 shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
                : "text-bright/40 hover:text-bright"
            }`}
          >
            Tech
          </button>
          <button
            onClick={() => setMode("MUSIC")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition duration-300 ${
              mode === "MUSIC"
                ? "bg-accent-2/20 text-accent-2 border border-accent-2/30 shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent-2)_20%,transparent)]"
                : "text-bright/40 hover:text-bright"
            }`}
          >
            Music
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className="w-full h-[500px] md:h-[clamp(500px,calc(100svh-6rem),600px)] bg-ink border border-bright/10 rounded-2xl overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.8)] group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {length > 1 && (
          <>
            <button aria-label="Previous" onClick={prev} className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-scrim/40 text-bright backdrop-blur-md border border-bright/10 transition duration-300 hover:bg-scrim/70 hover:scale-110 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
              <Arrow d="M15 18l-6-6 6-6" />
            </button>
            <button aria-label="Next" onClick={next} className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-scrim/40 text-bright backdrop-blur-md border border-bright/10 transition duration-300 hover:bg-scrim/70 hover:scale-110 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}>
              <Arrow d="M9 18l6-6-6-6" />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          {mode === "TECH" && p && (
            <motion.div
              key={`tech-${techIndex}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 z-0">
                {p.media.orientation === "portrait" ? (
                  <div className="w-full h-full bg-cover bg-center blur-2xl scale-125 opacity-50" style={{ backgroundImage: `url('${p.media.image}')` }} />
                ) : p.media.video ? (
                  <BgVideo src={p.media.video} reduce={reduce} className="w-full h-full object-cover opacity-70" />
                ) : (
                  <div className="w-full h-full bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${p.media.image}')` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-scrim/90 via-scrim/40 to-transparent" />
                {p.media.orientation === "portrait" && (
                  <div className="hidden md:block absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 h-[380px] lg:h-[440px] aspect-[9/19] rounded-[2rem] overflow-hidden border border-accent/20 shadow-[0_0_50px_color-mix(in_srgb,var(--color-accent)_15%,transparent)] bg-ink z-[5] pointer-events-none">
                    {p.media.video ? (
                      <BgVideo src={p.media.video} reduce={reduce} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${p.media.image}')` }} />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-bright)_2%,transparent)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12">
                <div className={`max-w-3xl ${p.media.orientation === "portrait" ? "md:max-w-[52%] lg:max-w-[55%]" : ""}`}>
                  <div className="font-mono text-[11px] text-accent tracking-widest mb-4 flex items-center gap-3 flex-wrap">
                    {p.internship && (
                      <>
                        <span className="text-accent-2 font-bold tracking-widest bg-accent-2/10 px-2 py-0.5 rounded border border-accent-2/20">INTERNSHIP</span>
                        <span className="text-bright/20">{"//"}</span>
                      </>
                    )}
                    {p.categories.map((c, i) => (
                      <Fragment key={c}>
                        {i > 0 && <span className="text-bright/20">{"//"}</span>}
                        <span>{c}</span>
                      </Fragment>
                    ))}
                  </div>

                  <h3 className="text-3xl md:text-6xl font-bold text-bright tracking-tight mb-4 drop-shadow-lg">{p.title}</h3>

                  <p className="text-bright/70 text-sm md:text-lg leading-relaxed font-light mb-8 line-clamp-3 md:line-clamp-none">{p.summary}</p>

                  <div className="flex flex-wrap gap-3 md:gap-4 pb-8 md:pb-0">
                    {p.caseStudyHref && (
                      <Link href={p.caseStudyHref} className="px-5 py-2.5 md:px-6 md:py-3 bg-accent-2/20 text-accent-2 border border-accent-2/30 backdrop-blur-md rounded shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent-2)_20%,transparent)] text-[11px] md:text-xs uppercase font-mono tracking-widest hover:bg-accent-2/30 hover:-translate-y-1 transition">
                        Read Case Study ↗
                      </Link>
                    )}
                    {p.links.live ? (
                      <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 md:px-6 md:py-3 bg-bright/5 text-bright border border-bright/20 backdrop-blur-md rounded text-[11px] md:text-xs uppercase font-mono tracking-widest hover:bg-bright/10 hover:-translate-y-1 transition">
                        Live ↗
                      </a>
                    ) : p.links.github ? (
                      <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 md:px-6 md:py-3 bg-bright/5 text-bright border border-bright/20 backdrop-blur-md rounded text-[11px] md:text-xs uppercase font-mono tracking-widest hover:bg-bright/10 hover:-translate-y-1 transition">
                        View Source ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {projects.length > 1 && (
                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
                  {projects.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); setTechIndex(idx); }}
                      className={`h-1.5 rounded-full transition duration-300 ${techIndex === idx ? "w-8 bg-accent shadow-[0_0_10px_var(--color-accent)]" : "w-2 bg-bright/20 hover:bg-bright/50 cursor-pointer"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {mode === "MUSIC" && t && (
            <motion.div
              key={`music-${musicIndex}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 z-0">
                <BgVideo src={t.videoUrl} reduce={reduce} className="w-full h-full object-cover opacity-80 blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-scrim/90 via-scrim/40 to-transparent" />
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12">
                <div className="max-w-3xl">
                  <div className="font-mono text-[11px] text-accent-2 tracking-widest mb-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-err animate-pulse" />
                    <span>LIVE SESSION</span>
                  </div>

                  <h3 className="text-3xl md:text-6xl font-bold text-bright tracking-tight mb-2 drop-shadow-lg">{t.title}</h3>

                  <p className="text-accent-2 font-mono text-[11px] md:text-sm tracking-widest uppercase mb-6">Original By {"//"} {t.originalArtist}</p>

                  <p className="text-bright/70 text-sm md:text-base leading-relaxed font-light mb-8 italic border-l border-bright/20 pl-4 hidden md:block">&quot;{t.notes}&quot;</p>

                  <Link href={`/music?track=${t.id}`} className="inline-flex px-5 py-2.5 md:px-6 md:py-3 bg-accent/20 text-accent border border-accent/30 backdrop-blur-md rounded shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[11px] md:text-xs uppercase font-mono tracking-widest hover:bg-accent/30 hover:-translate-y-1 transition mb-4 md:mb-0">
                    View in Music Vault ↗
                  </Link>
                </div>
              </div>

              {tracks.length > 1 && (
                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
                  {tracks.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); setMusicIndex(idx); }}
                      className={`h-1.5 rounded-full transition duration-300 ${musicIndex === idx ? "w-8 bg-accent-2 shadow-[0_0_10px_var(--color-accent-2)]" : "w-2 bg-bright/20 hover:bg-bright/50 cursor-pointer"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
