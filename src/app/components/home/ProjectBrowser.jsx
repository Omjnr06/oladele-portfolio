"use client";
import { Fragment, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll } from "@/lib/scroll";

const dial = (index, current) => {
  const diff = index - current;
  return {
    x: diff * 160,
    scale: Math.max(0.6, 1 - Math.abs(diff) * 0.15),
    opacity: Math.max(0, 1 - Math.abs(diff) * 0.35),
    zIndex: 50 - Math.abs(diff),
  };
};

const noop = () => () => {};

function ImageModal({ src, onClose }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  useEffect(() => {
    if (!src) return;
    const unlock = lockScroll();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [src, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          data-surface="media"
          className="fixed inset-0 z-[200] overflow-y-auto bg-scrim/90 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={src} alt="Project preview" className="w-full h-auto object-contain rounded-xl border border-accent/20 shadow-[0_0_60px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]" />
              <button aria-label="Close preview" onClick={onClose} className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center rounded-full bg-panel border border-bright/10 text-muted hover:text-bright hover:border-accent transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default function ProjectBrowser({ projects, categories }) {
  const [category, setCategory] = useState("ALL");
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState(null);
  const closePreview = useCallback(() => setPreview(null), []);

  const list = category === "ALL" ? projects : projects.filter((p) => p.categories.includes(category));
  const p = list[current];

  return (
    <div id="projects" className="flex flex-col items-start gap-6 w-full pb-20 scroll-mt-6">
      <div className="flex flex-row items-center gap-3 w-full overflow-x-auto pb-4 scrollbar-hide border-b border-bright/5">
        <span className="hidden md:block font-mono text-[13px] text-muted tracking-widest uppercase mr-2">{"// Filter Projects"}</span>
        {categories.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => {
              setCategory(c);
              setCurrent(0);
            }}
            className={`shrink-0 px-5 py-2 font-mono text-[11px] md:text-xs uppercase tracking-widest transition duration-300 rounded-full border ${
              category === c
                ? "bg-accent/10 text-accent border-accent shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
                : "bg-transparent text-muted border-bright/10 hover:text-bright hover:bg-bright/5 hover:border-bright/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="w-full relative min-h-[550px] md:h-[600px] bg-panel border border-accent/30 rounded-xl overflow-hidden flex flex-col shadow-[0_0_40px_color-mix(in_srgb,var(--color-accent)_10%,transparent)] transition-shadow duration-500 hover:shadow-[0_0_60px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2 md:gap-3">
          {p?.caseStudyHref && (
            <Link href={p.caseStudyHref} className="px-4 py-2 bg-accent-2/20 text-bright border border-accent-2/30 backdrop-blur-md rounded-full text-[11px] uppercase font-mono tracking-widest hover:bg-accent-2/30 transition shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent-2)_20%,transparent)]">
              View More
            </Link>
          )}
          {p?.links.live && (
            <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-accent/20 text-accent border border-accent/30 backdrop-blur-md rounded-full text-[11px] uppercase font-mono tracking-widest hover:bg-accent/30 transition shadow-[0_0_15px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
              Live ↗
            </a>
          )}
          {p?.links.github && (
            <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-scrim/40 text-bright border border-bright/20 backdrop-blur-md rounded-full text-[11px] uppercase font-mono tracking-widest hover:bg-scrim/60 hover:border-bright/40 transition">
              GitHub ↗
            </a>
          )}
        </div>

        <div className="flex-1 p-6 pt-16 md:p-10 md:pt-10 relative z-10 md:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-bright/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-bright/20">
          <AnimatePresence mode="wait">
            {p && (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10 pt-2 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -50 && current < list.length - 1) setCurrent((i) => i + 1);
                  else if (offset.x > 50 && current > 0) setCurrent((i) => i - 1);
                }}
              >
                <div className="flex-1 flex flex-col justify-start w-full pointer-events-none">
                  <div className="font-mono text-[11px] text-accent tracking-widest mb-4 flex items-center gap-3 mt-1 flex-wrap">
                    <span>{p.code}</span>
                    {p.internship && (
                      <>
                        <span className="text-bright/20">{"//"}</span>
                        <span className="text-accent-2 font-bold tracking-widest bg-accent-2/10 px-2 py-0.5 rounded border border-accent-2/20">INTERNSHIP</span>
                      </>
                    )}
                    <span className="text-bright/20">{"//"}</span>
                    {p.categories.map((c, i) => (
                      <Fragment key={c}>
                        {i > 0 && <span className="text-bright/20">{"//"}</span>}
                        <span>{c}</span>
                      </Fragment>
                    ))}
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-bright tracking-tight mb-4 md:mb-6">{p.title}</h3>
                  <p className="text-bright/70 text-sm md:text-base leading-relaxed max-w-2xl font-light mb-6">{p.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {p.stack.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-bright/5 border border-bright/10 rounded font-mono text-[11px] md:text-xs text-accent-2 transition duration-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`${p.media.orientation === "portrait" ? "w-auto h-[380px] md:h-[440px] lg:h-[480px] aspect-[9/19] mx-auto rounded-[2rem]" : "w-full lg:w-[50%] xl:w-[55%] aspect-video rounded-xl"} overflow-hidden border border-accent/20 shadow-[0_0_40px_color-mix(in_srgb,var(--color-accent)_10%,transparent)] relative group shrink-0 bg-ink transition duration-500 hover:shadow-[0_0_60px_color-mix(in_srgb,var(--color-accent)_20%,transparent)] hover:border-accent/40 mt-1 pointer-events-auto`}>
                  {p.media.video ? (
                    <video src={p.media.video} playsInline className="absolute inset-0 w-full h-full object-cover z-10" {...(p.media.orientation === "portrait" ? { autoPlay: true, muted: true, loop: true } : { controls: true, preload: p.media.poster ? "none" : "metadata", poster: p.media.poster })} />
                  ) : p.media.image ? (
                    <div
                      className={`absolute inset-0 w-full h-full bg-center bg-no-repeat z-10 cursor-zoom-in ${p.media.fit === "contain" ? "bg-contain p-6" : "bg-cover"}`}
                      style={{ backgroundImage: `url('${p.media.image}')` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(p.media.image);
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center p-6 text-center border border-dashed border-bright/10 m-4 rounded pointer-events-none">
                      <span className="font-mono text-xs text-muted animate-pulse">AWAITING_MEDIA_PAYLOAD...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-bright)_2%,transparent)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-28 md:h-36 w-full relative flex items-center justify-center overflow-hidden border-t border-bright/5 bg-gradient-to-t from-panel to-transparent shrink-0">
          <div className="absolute w-[2px] h-full bg-accent/20 z-0 pointer-events-none" />
          <div className="relative w-full h-full flex items-center justify-center mt-2">
            {list.map((item, index) => {
              const style = dial(index, current);
              return (
                <motion.div
                  key={item.id}
                  animate={{ x: style.x, scale: style.scale, opacity: style.opacity, zIndex: style.zIndex }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  onClick={() => setCurrent(index)}
                  className={`absolute w-32 h-16 md:w-36 md:h-20 rounded-lg cursor-pointer flex flex-col items-center justify-center p-3 transition-colors duration-300 ${
                    current === index ? "bg-panel border border-accent shadow-[0_0_20px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]" : "bg-panel-2 border border-bright/5 hover:border-bright/20"
                  }`}
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  <span className={`font-mono text-[11px] tracking-widest mb-1 ${current === index ? "text-accent" : "text-muted"}`}>{item.code}</span>
                  <span className={`text-[11px] font-bold text-center line-clamp-2 ${current === index ? "text-bright" : "text-bright/40"}`}>{item.title}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <ImageModal src={preview} onClose={closePreview} />
    </div>
  );
}
