"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gallery } from "@/content/gallery";
import "./apps.css";
import "./gallery.css";

export default function GalleryApp() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const strip = useRef(null);
  const n = gallery.length;
  const go = (d) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 3200);
    return () => clearInterval(t);
  }, [playing, n]);

  useEffect(() => {
    strip.current?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i]);

  const onKeys = (e) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === " ") setPlaying((p) => !p);
    else return;
    e.preventDefault();
  };

  const photo = gallery[i];

  return (
    <div className="wa wg" tabIndex={0} onKeyDown={onKeys} aria-label="Photo viewer">
      <div className="wg-stage">
        <Image key={photo.id} src={photo.src} alt={photo.caption} fill sizes="(max-width: 1400px) 80vw, 1100px" className="wg-img" priority={i === 0} />
      </div>
      <div ref={strip} className="wg-strip" role="listbox" aria-label="Photos">
        {gallery.map((g, k) => (
          <button key={g.id} type="button" role="option" data-i={k} aria-selected={k === i} aria-label={g.caption} className="wg-thumb" onClick={() => setI(k)}>
            <Image src={g.src} alt="" width={72} height={54} sizes="72px" className="wg-thumb-img" />
          </button>
        ))}
      </div>
      <div className="wg-bar">
        <span className="wg-caption">{photo.caption}</span>
        <div className="wg-controls">
          <button type="button" className="wg-ctl" aria-label="Previous photo" onClick={() => go(-1)}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className="wg-ctl wg-ctl--play" aria-label={playing ? "Pause slide show" : "Play slide show"} onClick={() => setPlaying((p) => !p)}>
            <svg viewBox="0 0 24 24" aria-hidden>{playing ? <path d="M8 5v14M16 5v14" /> : <path d="M8 5l11 7-11 7z" />}</svg>
          </button>
          <button type="button" className="wg-ctl" aria-label="Next photo" onClick={() => go(1)}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <span className="wg-count">
          {i + 1} of {n}
        </span>
      </div>
    </div>
  );
}
