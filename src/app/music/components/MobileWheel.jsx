"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { instrumentItems, clipItemsForCategory, photoItems, songItems } from "../data/boardItems";
import { INSTRUMENT_ICONS } from "./icons/Instruments";
import ClipPlayer from "./ClipPlayer";
import SongModal from "./Modals/SongModal";
import PhotoModal from "./Modals/PhotoModal";
import useSpotifyMeta from "../hooks/useSpotifyMeta";

const TABS = [
  ...instrumentItems.map((it) => ({ key: it.categoryId, kind: "instrument", label: it.label, instrumentId: it.instrumentId })),
  { key: "PHOTOS", kind: "photos", label: "Photos" },
  { key: "SONGS", kind: "songs", label: "In My Playlist" },
];

function SongCard({ item, onOpen }) {
  const meta = useSpotifyMeta(item.spotifyTrackId);
  return (
    <button className="mvm-card mvm-card--song" onClick={() => onOpen(item)}>
      {meta?.thumb ? <img src={meta.thumb} alt={meta.title} className="mvm-card-img" /> : <div className="mvm-card-img mvm-card-song-fallback" />}
      <div className="mvm-card-cap">
        <span className="mvm-card-kicker">In Playlist</span>
        {meta?.title ? <span className="mvm-card-title">{meta.title}</span> : null}
      </div>
    </button>
  );
}

export default function MobileWheel() {
  const [tab, setTab] = useState(TABS[0].key);
  const [drawer, setDrawer] = useState(false);
  const [clip, setClip] = useState(null);
  const [song, setSong] = useState(null);
  const [photo, setPhoto] = useState(null);
  const tabRefs = useRef({});

  const active = TABS.find((t) => t.key === tab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("track") || params.get("clip");
    if (!raw) return;
    const key = raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    for (const cat of instrumentItems) {
      const clips = clipItemsForCategory(cat.categoryId);
      const match = clips.find((c) => c.trackId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") === key || c.id === `clip-${key}`);
      if (match) { setTab(cat.categoryId); setTimeout(() => setClip(match), 400); break; }
    }
  }, []);

  useEffect(() => {
    const el = tabRefs.current[tab];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [tab]);

  const clips = useMemo(() => (active?.kind === "instrument" ? clipItemsForCategory(active.key) : []), [active]);

  return (
    <main className="mvm">
      <style>{`.mvm ::-webkit-scrollbar { display: none; } .mvm { scrollbar-width: none; }`}</style>

      <div className="mvm-dots" />

      <header className="mvm-head">
        <span className="mvm-brand">Oladeles Music Portfolio</span>
        <button className="mvm-menu" onClick={() => setDrawer(true)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="4" height="4" rx="1"/><rect x="10" y="4" width="4" height="4" rx="1"/><rect x="16" y="4" width="4" height="4" rx="1"/><rect x="4" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="16" y="10" width="4" height="4" rx="1"/><rect x="4" y="16" width="4" height="4" rx="1"/><rect x="10" y="16" width="4" height="4" rx="1"/><rect x="16" y="16" width="4" height="4" rx="1"/></svg>
        </button>
      </header>

      <nav className="mvm-tabs">
        {TABS.map((t) => {
          const Icon = t.kind === "instrument" ? INSTRUMENT_ICONS[t.instrumentId] : null;
          return (
            <button
              key={t.key}
              ref={(el) => (tabRefs.current[t.key] = el)}
              className={`mvm-tab${tab === t.key ? " mvm-tab--on" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {Icon ? <Icon className="mvm-tab-ico" /> : (
                <svg viewBox="0 0 24 24" className="mvm-tab-ico" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {t.kind === "photos"
                    ? <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>
                    : <><circle cx="12" cy="12" r="10"/><path d="M8 14c3-1 5-1 8 0M8 11c3-1 6-1 9 0M8 8c2-.5 4-.5 6 0"/></>}
                </svg>
              )}
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mvm-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mvm-grid"
          >
            {active?.kind === "instrument" && clips.map((c) => (
              <button key={c.id} className="mvm-card" onClick={() => setClip(c)}>
                {c.audioOnly ? (
                  <div className="mvm-card-img mvm-card-audio">
                    <svg viewBox="0 0 100 100" className="mvm-card-audio-svg"><text x="50" y="44" textAnchor="middle" fontFamily="monospace" fontSize="34" fontWeight="900" fill="#8b5cf6">OMJ</text><text x="50" y="88" textAnchor="middle" fontFamily="monospace" fontSize="34" fontWeight="900" fill="#22d3ee">{">_"}</text></svg>
                  </div>
                ) : (
                  <img src={c.thumb} alt={c.title} className="mvm-card-img" />
                )}
                <div className="mvm-card-cap">
                  {c.isFeatured ? <span className="mvm-card-tag">featured</span> : null}
                  <span className="mvm-card-title">{c.title}</span>
                  <span className="mvm-card-sub">{c.originalArtist}</span>
                </div>
              </button>
            ))}

            {active?.kind === "photos" && photoItems.map((p) => (
              <button key={p.id} className="mvm-card" onClick={() => setPhoto(p)}>
                <img src={p.src} alt={p.title} className="mvm-card-img" />
                <div className="mvm-card-cap"><span className="mvm-card-title">{p.title}</span></div>
              </button>
            ))}

            {active?.kind === "songs" && songItems.map((sg) => (
              <SongCard key={sg.id} item={sg} onOpen={setSong} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="mvm-drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.div className="mvm-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset }) => { if (offset.x > 60) setDrawer(false); }}>
              <span className="mvm-drawer-kicker">Navigation</span>
              <Link href="/#home" className="mvm-drawer-link">Home</Link>
              <Link href="/#projects" className="mvm-drawer-link">Projects</Link>
              <Link href="/resume" className="mvm-drawer-link">Resume</Link>
              <Link href="/music" className="mvm-drawer-link mvm-drawer-link--on">Music</Link>
              <Link href="/#contact" className="mvm-drawer-link">Contact</Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {clip ? <ClipPlayer clip={clip} onClose={() => setClip(null)} /> : null}
      {song ? <SongModal song={song} onClose={() => setSong(null)} /> : null}
      {photo ? <PhotoModal photo={photo} onClose={() => setPhoto(null)} /> : null}
    </main>
  );
}