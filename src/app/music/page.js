"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// INSTRUMENT ICONS
// ─────────────────────────────────────────────────────────────────
const PianoIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <rect x="2" y="6" width="20" height="13" rx="1.5" />
    <path d="M2 13.5h20" />
    <path d="M6 13.5V19M10 13.5V19M14 13.5V19M18 13.5V19" />
    <path d="M5 6v5M8.5 6v5M15.5 6v5M19 6v5" />
  </svg>
);
const DrumsIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <ellipse cx="12" cy="17" rx="8" ry="3" />
    <path d="M4 17V9c0-1.66 3.58-3 8-3s8 1.34 8 3v8" />
    <ellipse cx="12" cy="9" rx="8" ry="3" />
    <path d="M7 6.5L5.5 2M17 6.5L18.5 2" />
  </svg>
);
const GuitarIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M9.5 17.5a3.5 3.5 0 1 0 5-5L19 8l-3-3-4.5 4.5a3.5 3.5 0 0 0-2 5z" />
    <path d="M14.5 9.5l-5 5" />
    <path d="M17 5l2-2M19 5l-2-2" />
  </svg>
);
const BassIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d="M8.5 18.5a3.5 3.5 0 1 0 5-5V4.5" />
    <path d="M13.5 4.5H17M13.5 7.5H16" />
    <circle cx="10" cy="18.5" r="0.5" fill="currentColor" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────
const musicLibrary = [
  {
    id: "PIANO", label: "Keys & Synth", icon: PianoIcon,
    tracks: [
      {
        id: "piano_01", title: "Liebestraum No. 3", date: "2024.11.12", status: "One Take",
        notes: "Classical piece focusing on dynamic control, rubato, and arpeggio fluidity across the upper register.",
        videoUrl: "https://res.cloudinary.com/dqhhyjhqc/video/upload/v1778127578/liebenstraum-piano_azptwb.mp4"
      }
    ]
  },
  {
    id: "DRUMS", label: "Percussion", icon: DrumsIcon,
    tracks: [
      {
        id: "drums_01", title: "Get Lucky — Groove Cover", date: "2024.11.10", status: "Locked In",
        notes: "Focusing on the iconic four-on-the-floor groove and hi-hat syncopation. Tight pocket playing.",
        videoUrl: "https://res.cloudinary.com/dqhhyjhqc/video/upload/v1778127492/get-lucky-drums_gj1ytx.mp4"
      },
      {
        id: "drums_02", title: "Ironwood — Drum Tracking", date: "2024.11.11", status: "Raw Stems",
        notes: "Heavy hitting tracking session. Mapping out kick patterns and fills for the main section.",
        videoUrl: "https://res.cloudinary.com/dqhhyjhqc/video/upload/v1778127560/ironwood-drums_d5dlwv.mp4"
      }
    ]
  },
  { id: "GUITAR", label: "Electric Guitar", icon: GuitarIcon, tracks: [] },
  { id: "BASS",   label: "Bass Guitar",    icon: BassIcon,   tracks: [] },
];

// ─────────────────────────────────────────────────────────────────
// WHEEL CONSTANTS
// ─────────────────────────────────────────────────────────────────
const NUM_ITEMS    = musicLibrary.length; // 4
const ANGLE_STEP   = 360 / NUM_ITEMS;     // 90°
const WHEEL_RADIUS = 268;                 // px — tuned so arc fills the bottom tray nicely
const ITEM_SIZE    = 76;                  // px — icon button footprint
const DRAG_THRESH  = 7;                   // px before a touch is considered a drag

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
const fmt = (t) => {
  if (!t || isNaN(t)) return "00:00";
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
};

// Shortest-path rotation (normalises delta into [-180, 180])
const shortestPath = (from, toRaw) => {
  const delta = ((toRaw - from) % 360 + 540) % 360 - 180;
  return from + delta;
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function MusicVault() {
  // ── Category / Track ──────────────────────────────────────────
  const [activeCatIdx,   setActiveCatIdx]   = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);

  // ── Sidebar ───────────────────────────────────────────────────
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // ── Video ─────────────────────────────────────────────────────
  const videoRef    = useRef(null);
  const bgVideoRef  = useRef(null);
  const seekRef     = useRef(null);
  const ctrlTimer   = useRef(null);

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [curTime,    setCurTime]    = useState("00:00");
  const [dur,        setDur]        = useState("00:00");
  const [muted,      setMuted]      = useState(false);
  const [ctrlVis,    setCtrlVis]    = useState(true);

  // ── Wheel motion value (single source of truth for rotation) ──
  const wheelMV     = useMotionValue(0);
  const wheelRotRef = useRef(0);          // mirrors wheelMV but readable synchronously

  // Counter-rotation applied to every icon so they stay upright as the wheel spins
  const counterRot  = useTransform(wheelMV, (r) => -r);

  // Drag bookkeeping (all refs — no state — to avoid re-renders during drag)
  const isDragging     = useRef(false);
  const dragDist       = useRef(0);
  const [wheelCursor, setWheelCursor] = useState(false); // purely for CSS cursor

  // ── Derived ───────────────────────────────────────────────────
  const activeCat   = musicLibrary[activeCatIdx];
  const activeTrack = activeCat.tracks[activeTrackIdx] ?? null;

  // ─────────────────────────────────────────────────────────────
  // WHEEL — rotate to a given index (shortest path, spring anim)
  // ─────────────────────────────────────────────────────────────
  const rotateTo = useCallback((index) => {
    const idx    = ((index % NUM_ITEMS) + NUM_ITEMS) % NUM_ITEMS;
    const target = shortestPath(wheelRotRef.current, -(idx * ANGLE_STEP));
    if (Math.abs(target - wheelRotRef.current) < 0.5) return; // already there
    wheelRotRef.current = target;
    animate(wheelMV, target, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });
  }, [wheelMV]);

  // When activeCatIdx changes from anywhere, keep wheel in sync
  useEffect(() => { rotateTo(activeCatIdx); }, [activeCatIdx, rotateTo]);

  // ─────────────────────────────────────────────────────────────
  // WHEEL — click handler (on instrument buttons)
  // ─────────────────────────────────────────────────────────────
  const handleInstrumentClick = useCallback((i) => {
    if (isDragging.current || dragDist.current > DRAG_THRESH) return;
    setActiveCatIdx(i);
    setActiveTrackIdx(0);
    // rotateTo is called via the useEffect above
  }, []);

  // ─────────────────────────────────────────────────────────────
  // WHEEL — drag (pointer events on the container div)
  // Attaches document-level listeners to avoid losing capture on fast moves.
  // dragDist.current is checked by instrument onClick to block accidental clicks.
  // ─────────────────────────────────────────────────────────────
  const handleWheelPointerDown = useCallback((e) => {
    // Ignore right-click / middle-click
    if (e.button !== 0) return;

    const startX   = e.clientX;
    const startRot = wheelRotRef.current;
    let   dist     = 0;

    dragDist.current = 0;
    isDragging.current = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      dist = Math.abs(dx);
      dragDist.current = dist;

      if (dist > DRAG_THRESH) {
        isDragging.current = true;
        setWheelCursor(true);
        // Direct set (no spring) for tight 1:1 feel while dragging
        const newRot = startRot + dx * 0.42;
        wheelRotRef.current = newRot;
        wheelMV.set(newRot);
      }
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup",   onUp);
      setWheelCursor(false);

      if (!isDragging.current) {
        // Tiny movement = click; let button's onClick fire naturally
        isDragging.current = false;
        dragDist.current   = 0;
        return;
      }

      // Snap to nearest instrument
      const nearest = Math.round(-wheelRotRef.current / ANGLE_STEP);
      const newIdx  = ((nearest % NUM_ITEMS) + NUM_ITEMS) % NUM_ITEMS;

      // Immediately spring-animate to snap position
      const snapTarget = shortestPath(wheelRotRef.current, -(newIdx * ANGLE_STEP));
      wheelRotRef.current = snapTarget;
      animate(wheelMV, snapTarget, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });

      setActiveCatIdx(newIdx);
      setActiveTrackIdx(0);

      // Brief delay before clearing drag flag so onClick is suppressed
      setTimeout(() => {
        isDragging.current = false;
        dragDist.current   = 0;
      }, 60);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
  }, [wheelMV]);

  // Touch fallback (passive-safe)
  const handleWheelTouchStart = useCallback((e) => {
    const startX   = e.touches[0].clientX;
    const startRot = wheelRotRef.current;
    dragDist.current = 0;

    const onMove = (ev) => {
      const dx = ev.touches[0].clientX - startX;
      dragDist.current = Math.abs(dx);
      if (dragDist.current > DRAG_THRESH) {
        isDragging.current = true;
        wheelRotRef.current = startRot + dx * 0.42;
        wheelMV.set(wheelRotRef.current);
      }
    };
    const onEnd = () => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onEnd);
      if (dragDist.current > DRAG_THRESH) {
        const nearest = Math.round(-wheelRotRef.current / ANGLE_STEP);
        const newIdx  = ((nearest % NUM_ITEMS) + NUM_ITEMS) % NUM_ITEMS;
        const snap    = shortestPath(wheelRotRef.current, -(newIdx * ANGLE_STEP));
        wheelRotRef.current = snap;
        animate(wheelMV, snap, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });
        setActiveCatIdx(newIdx);
        setActiveTrackIdx(0);
      }
      setTimeout(() => { isDragging.current = false; dragDist.current = 0; }, 60);
    };
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend",  onEnd);
  }, [wheelMV]);

  // ─────────────────────────────────────────────────────────────
  // VIDEO HELPERS
  // ─────────────────────────────────────────────────────────────
  const syncBg = () => {
    if (bgVideoRef.current && videoRef.current)
      bgVideoRef.current.currentTime = videoRef.current.currentTime;
  };

  const doPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => {
        setIsPlaying(true);
        bgVideoRef.current?.play().catch(() => {});
      })
      .catch((e) => { if (e.name !== "AbortError") setIsPlaying(false); });
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      bgVideoRef.current?.pause();
      setIsPlaying(false);
    } else {
      doPlay();
    }
  }, [isPlaying, doPlay]);

  const handleSeek = useCallback((e) => {
    const v = videoRef.current;
    if (!v || !seekRef.current) return;
    const r   = seekRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    v.currentTime = pos * v.duration;
    syncBg();
  }, []);

  const nudgeControls = useCallback(() => {
    setCtrlVis(true);
    clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => setCtrlVis(false), 2800);
  }, []);

  const nextTrack = () => { if (activeTrackIdx < activeCat.tracks.length - 1) setActiveTrackIdx((i) => i + 1); };
  const prevTrack = () => { if (activeTrackIdx > 0) setActiveTrackIdx((i) => i - 1); };

  // Reset track index when category changes
  useEffect(() => { setActiveTrackIdx(0); }, [activeCatIdx]);

  // Load + autoplay when video URL changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    bgVideoRef.current?.load();
    setProgress(0); setCurTime("00:00"); setDur("00:00");
    if (activeTrack) doPlay();
    else setIsPlaying(false);
  }, [activeTrack?.videoUrl]); // eslint-disable-line

  // Show controls whenever video is paused
  useEffect(() => {
    if (!isPlaying) setCtrlVis(true);
  }, [isPlaying]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <main
      className="h-screen w-full flex flex-col bg-[#020202] overflow-hidden relative"
      style={{ fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace" }}
    >
      {/* ── Global style overrides ── */}
      <style>{`
        *, *::before, *::after {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(34,211,238,0.18) 1px, transparent 0)",
          backgroundSize: "30px 30px",
          opacity: 0.12,
        }}
      />

      {/* ════════════════════════════════════════════
          LEFT GHOST ZONE + SIDEBAR
          ════════════════════════════════════════════ */}
      <div
        className="absolute left-0 top-0 w-8 h-full z-50"
        onMouseEnter={() => setLeftOpen(true)}
      />
      <AnimatePresence>
        {leftOpen && (
          <motion.nav
            key="left-nav"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            onMouseLeave={() => setLeftOpen(false)}
            className="absolute left-0 top-0 h-full w-[52px] z-50 flex flex-col items-center justify-center gap-9"
            style={{
              background: "rgba(5,5,5,0.97)",
              backdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(34,211,238,0.1)",
              boxShadow: "6px 0 48px rgba(0,0,0,0.85), inset -1px 0 0 rgba(34,211,238,0.05)",
            }}
          >
            {/* Status dot */}
            <div
              className="absolute top-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22d3ee", boxShadow: "0 0 8px rgba(34,211,238,0.7)" }}
            />

            {[
              { label: "Home",     href: "/#home" },
              { label: "Projects", href: "/#projects" },
              { label: "Music",    href: "/music" },
              { label: "Resume",   href: "/resume" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors duration-200"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: 8,
                  letterSpacing: "0.45em",
                  textTransform: "uppercase",
                  color: label === "Music" ? "#22d3ee" : "rgba(255,255,255,0.32)",
                }}
              >
                {label}
              </Link>
            ))}

            <div
              className="absolute bottom-5 w-px h-7"
              style={{ background: "linear-gradient(to bottom, rgba(34,211,238,0.3), transparent)" }}
            />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          RIGHT GHOST ZONE + LIBRARY / METADATA PANEL
          ════════════════════════════════════════════ */}
      <div
        className="absolute right-0 top-0 w-8 h-full z-50"
        onMouseEnter={() => setRightOpen(true)}
      />
      <AnimatePresence>
        {rightOpen && (
          <motion.div
            key="right-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            onMouseLeave={() => setRightOpen(false)}
            className="absolute right-0 top-0 h-full w-72 z-50 flex flex-col"
            style={{
              background: "rgba(5,5,5,0.97)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(34,211,238,0.1)",
              boxShadow: "-6px 0 48px rgba(0,0,0,0.85)",
            }}
          >
            {/* ── Track Library ── */}
            <div className="flex-1 p-6 overflow-y-auto border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5 mb-5">
                <span style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(34,211,238,0.6)" }}>
                  Library
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.12)" }} />
                <span style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)", fontFamily: "inherit" }}>
                  {activeCat.id}
                </span>
              </div>

              <div className="space-y-0.5">
                {activeCat.tracks.length > 0
                  ? activeCat.tracks.map((track, idx) => (
                    <button
                      key={track.id}
                      onClick={() => setActiveTrackIdx(idx)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded transition-all duration-150"
                      style={{
                        fontSize: 10,
                        fontFamily: "inherit",
                        color: idx === activeTrackIdx ? "#22d3ee" : "rgba(255,255,255,0.35)",
                        background: idx === activeTrackIdx ? "rgba(34,211,238,0.07)" : "transparent",
                        border: `1px solid ${idx === activeTrackIdx ? "rgba(34,211,238,0.2)" : "transparent"}`,
                      }}
                    >
                      <span style={{ opacity: idx === activeTrackIdx ? 1 : 0, fontSize: 7 }}>▶</span>
                      <span className="truncate">{track.title}</span>
                    </button>
                  ))
                  : <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontFamily: "inherit", fontStyle: "italic" }}>// no_media_found</p>
                }
              </div>
            </div>

            {/* ── Metadata ── */}
            <div className="h-[46%] p-6 overflow-y-auto">
              <div className="flex items-center gap-2.5 mb-5">
                <span style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
                  Metadata
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              {activeTrack ? (
                <div className="space-y-4">
                  {[
                    ["title",  activeTrack.title],
                    ["date",   activeTrack.date],
                    ["status", activeTrack.status],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="block mb-0.5" style={{ fontSize: 7, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)" }}>{k}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)" }}>{v}</span>
                    </div>
                  ))}
                  <div>
                    <span className="block mb-1" style={{ fontSize: 7, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)" }}>notes</span>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{activeTrack.notes}</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontFamily: "inherit", fontStyle: "italic" }}>// select_a_track</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          CINEMATIC VIDEO THEATER  (top 65vh)
          ════════════════════════════════════════════ */}
      <div
        className="relative flex-none flex items-center justify-center overflow-hidden"
        style={{ height: "65vh" }}
        onMouseMove={nudgeControls}
      >
        {/* Ambient blur background (portrait videos get colour-matched halo) */}
        {activeTrack && (
          <video
            ref={bgVideoRef}
            className="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none"
            style={{ filter: "blur(80px)", opacity: 0.3 }}
            muted
            playsInline
          >
            <source src={activeTrack.videoUrl} type="video/mp4" />
          </video>
        )}

        {/* Radial vignette + bottom fade */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 35%, rgba(2,2,2,0.75) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, #020202 0%, transparent 100%)" }}
        />

        {/* ── Main player ── */}
        <div className="relative z-20 h-full flex items-center justify-center w-full px-6">
          {/* 16:9 box — shrinks gracefully at any viewport */}
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0"
            style={{
              height: "100%",
              aspectRatio: "16 / 9",
              maxWidth: "100%",
              border: "1px solid rgba(34,211,238,0.1)",
              boxShadow: "0 0 80px rgba(0,0,0,0.98), 0 0 200px rgba(34,211,238,0.025)",
            }}
            onClick={togglePlay}
          >
            {activeTrack ? (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  playsInline
                  muted={muted}
                  onTimeUpdate={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    setProgress(((v.currentTime / v.duration) * 100) || 0);
                    setCurTime(fmt(v.currentTime));
                  }}
                  onLoadedMetadata={() => setDur(fmt(videoRef.current?.duration))}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={activeTrack.videoUrl} type="video/mp4" />
                </video>

                {/* Track info — top-right overlay */}
                <motion.div
                  className="absolute top-4 right-5 z-30 text-right pointer-events-none"
                  animate={{ opacity: ctrlVis ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)", marginBottom: 2 }}>
                    {activeCat.label}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.3 }}>
                    {activeTrack.title}
                  </div>
                  {activeTrack.status && (
                    <div style={{ fontSize: 8, color: "rgba(34,211,238,0.4)", marginTop: 4 }}>
                      [ {activeTrack.status} ]
                    </div>
                  )}
                </motion.div>

                {/* Play / Pause overlay button */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      key="play-overlay"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                    >
                      <div
                        style={{
                          width: 76, height: 76, borderRadius: "50%",
                          background: "rgba(2,2,2,0.62)",
                          border: "1px solid rgba(34,211,238,0.32)",
                          boxShadow: "0 0 40px rgba(34,211,238,0.1)",
                          backdropFilter: "blur(10px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          paddingLeft: 4,
                        }}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#22d3ee">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Custom controls bar ── */}
                <motion.div
                  className="absolute bottom-0 left-0 w-full z-30"
                  animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }}
                  transition={{ duration: 0.28 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "linear-gradient(to top, rgba(2,2,2,0.92) 0%, transparent 100%)",
                    paddingTop: 52,
                  }}
                >
                  {/* Seek bar */}
                  <div
                    ref={seekRef}
                    onClick={handleSeek}
                    className="group relative mx-4 mb-3 cursor-pointer"
                    style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                  >
                    <div
                      style={{
                        position: "absolute", top: 0, left: 0, height: "100%",
                        width: `${progress}%`, borderRadius: 2,
                        background: "#22d3ee",
                        boxShadow: "0 0 8px rgba(34,211,238,0.7)",
                        pointerEvents: "none",
                        transition: "width 0.08s linear",
                      }}
                    />
                    {/* Thumb appears on hover */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: `${progress}%`,
                        transform: "translate(-50%, -50%)",
                        background: "#22d3ee",
                        boxShadow: "0 0 10px rgba(34,211,238,0.6)",
                        border: "2px solid #020202",
                      }}
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center gap-3 px-4 pb-4">
                    {/* Play/pause */}
                    <button
                      onClick={togglePlay}
                      className="transition-colors"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      {isPlaying
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      }
                    </button>

                    {/* Mute */}
                    <button
                      onClick={() => { const m = !muted; setMuted(m); if (videoRef.current) videoRef.current.muted = m; }}
                      className="transition-colors"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {muted
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                      }
                    </button>

                    {/* Time */}
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "inherit" }}>
                      {curTime} / {dur}
                    </span>

                    <div className="flex-1" />

                    {/* ── On-screen track switcher ── */}
                    {activeCat.tracks.length > 1 && (
                      <div
                        className="flex items-center gap-2"
                        style={{
                          fontSize: 9, fontFamily: "inherit",
                          padding: "5px 10px", borderRadius: 999,
                          background: "rgba(34,211,238,0.04)",
                          border: "1px solid rgba(34,211,238,0.12)",
                        }}
                      >
                        <button
                          onClick={prevTrack}
                          disabled={activeTrackIdx === 0}
                          style={{
                            color: activeTrackIdx === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)",
                            cursor: activeTrackIdx === 0 ? "not-allowed" : "pointer",
                            transition: "color 0.15s",
                          }}
                        >
                          &lt;
                        </button>
                        <span style={{ color: "rgba(34,211,238,0.65)", minWidth: 76, textAlign: "center" }}>
                          TRK {String(activeTrackIdx + 1).padStart(2, "0")} /{" "}
                          {String(activeCat.tracks.length).padStart(2, "0")}
                        </span>
                        <button
                          onClick={nextTrack}
                          disabled={activeTrackIdx === activeCat.tracks.length - 1}
                          style={{
                            color: activeTrackIdx === activeCat.tracks.length - 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)",
                            cursor: activeTrackIdx === activeCat.tracks.length - 1 ? "not-allowed" : "pointer",
                            transition: "color 0.15s",
                          }}
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              /* No tracks state */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <activeCat.icon style={{ width: 56, height: 56, color: "rgba(34,211,238,0.08)" }} />
                <span
                  className="animate-pulse"
                  style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.14)", fontFamily: "inherit" }}
                >
                  {activeCat.id} // NO SIGNAL
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          EXTERNAL TRACK SWITCHER  ([ < ] TRK 01/02 [ > ])
          ════════════════════════════════════════════ */}
      <div
        className="flex-none flex items-center justify-center gap-5 relative z-20"
        style={{ height: 36 }}
      >
        {activeCat.tracks.length > 0 ? (
          <>
            <button
              onClick={prevTrack}
              disabled={activeTrackIdx === 0}
              style={{
                fontSize: 9, fontFamily: "inherit",
                color: activeTrackIdx === 0 ? "rgba(255,255,255,0.1)" : "rgba(34,211,238,0.45)",
                cursor: activeTrackIdx === 0 ? "not-allowed" : "pointer",
                transition: "color 0.15s",
              }}
            >
              [ &lt; ]
            </button>

            <span style={{ fontSize: 9, fontFamily: "inherit", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}>
              {activeTrack?.title ?? "—"}
              <span style={{ color: "rgba(255,255,255,0.1)", margin: "0 8px" }}>·</span>
              {String(activeTrackIdx + 1).padStart(2, "0")} of {String(activeCat.tracks.length).padStart(2, "0")}
            </span>

            <button
              onClick={nextTrack}
              disabled={activeTrackIdx === activeCat.tracks.length - 1}
              style={{
                fontSize: 9, fontFamily: "inherit",
                color: activeTrackIdx === activeCat.tracks.length - 1 ? "rgba(255,255,255,0.1)" : "rgba(34,211,238,0.45)",
                cursor: activeTrackIdx === activeCat.tracks.length - 1 ? "not-allowed" : "pointer",
                transition: "color 0.15s",
              }}
            >
              [ &gt; ]
            </button>
          </>
        ) : (
          <span style={{ fontSize: 9, fontFamily: "inherit", color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
            // no_tracks_available
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════════
          ROTARY INSTRUMENT DIAL  (remaining height)

          Architecture:
          • Wheel div is WHEEL_RADIUS×2 square, positioned so its
            centre sits at the bottom edge of this container.
          • overflow:visible lets the lower arc extend out of view
            naturally (viewport clips it).
          • Each item is placed at its arc position using trig, then
            counter-rotated via a shared useTransform so icons always
            face upward regardless of wheel spin.
          • Pointer events on the container handle drag; item buttons
            handle clicks — separated by dragDist.current threshold.
          ════════════════════════════════════════════ */}
      <div
        className="flex-1 relative select-none"
        style={{
          overflow: "visible",
          cursor: wheelCursor ? "grabbing" : "grab",
          // Prevent touch-scroll from hijacking horizontal swipe
          touchAction: "pan-y",
        }}
        onPointerDown={handleWheelPointerDown}
        onTouchStart={handleWheelTouchStart}
      >
        {/* Top fade — blends wheel into the track-switcher row */}
        <div
          className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
          style={{
            height: 32,
            background: "linear-gradient(to bottom, #020202, transparent)",
          }}
        />

        {/* 12-o'clock indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div style={{ width: 1, height: 24, background: "linear-gradient(to bottom, rgba(34,211,238,0.55), transparent)" }} />
          <div
            style={{
              width: 5, height: 5, borderRadius: "50%", marginTop: 2,
              background: "#22d3ee",
              boxShadow: "0 0 10px rgba(34,211,238,0.9)",
            }}
          />
        </div>

        {/* ── THE WHEEL ── */}
        <motion.div
          style={{
            position: "absolute",
            width:  WHEEL_RADIUS * 2,
            height: WHEEL_RADIUS * 2,
            // Horizontal centre
            left: "50%",
            marginLeft: -WHEEL_RADIUS,
            // Vertical: element top at container bottom, then shift up by radius
            // so the wheel's centre sits exactly at the container's bottom edge.
            top: "100%",
            marginTop: -WHEEL_RADIUS,
            // Rotation driven by motion value
            rotate: wheelMV,
            borderRadius: "50%",
            border: "1px solid rgba(34,211,238,0.06)",
            background: "radial-gradient(circle at center, rgba(34,211,238,0.012) 0%, transparent 60%)",
          }}
        >
          {/* Spoke lines (decorative) */}
          {musicLibrary.map((_, i) => (
            <div
              key={`spoke-${i}`}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                width: WHEEL_RADIUS - 4,
                height: 1,
                marginTop: -0.5,
                transformOrigin: "0 50%",
                transform: `rotate(${i * ANGLE_STEP}deg)`,
                background: "linear-gradient(to right, transparent 15%, rgba(34,211,238,0.06) 100%)",
              }}
            />
          ))}

          {/* ── Instrument items ── */}
          {musicLibrary.map((cat, i) => {
            const angleDeg = i * ANGLE_STEP;
            const angleRad = (angleDeg * Math.PI) / 180;
            const half     = ITEM_SIZE / 2;

            // Arc position using trig — item centre placed on circumference
            const cx = WHEEL_RADIUS + WHEEL_RADIUS * Math.sin(angleRad) - half;
            const cy = WHEEL_RADIUS - WHEEL_RADIUS * Math.cos(angleRad) - half;

            const isActive = activeCatIdx === i;
            const Icon     = cat.icon;

            return (
              <div
                key={cat.id}
                style={{
                  position: "absolute",
                  left: cx, top: cy,
                  width: ITEM_SIZE, height: ITEM_SIZE,
                }}
              >
                {/*
                  Counter-rotate so icon faces upward always.
                  counterRot = useTransform(wheelMV, r => -r)
                  This perfectly cancels the wheel's rotation for the icon content.
                */}
                <motion.div
                  style={{
                    rotate: counterRot,
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <button
                    onClick={() => handleInstrumentClick(i)}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 5,
                      background: "transparent", border: "none",
                      cursor: "pointer", padding: 0,
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      style={{
                        width: 50, height: 50, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isActive ? "rgba(34,211,238,0.1)" : "rgba(8,8,8,0.9)",
                        border: `1px solid ${isActive ? "rgba(34,211,238,0.45)" : "rgba(255,255,255,0.07)"}`,
                        boxShadow: isActive
                          ? "0 0 22px rgba(34,211,238,0.18), inset 0 0 16px rgba(34,211,238,0.05)"
                          : "none",
                        transform: isActive ? "scale(1.14)" : "scale(1)",
                        transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    >
                      <Icon
                        style={{
                          width: 20, height: 20,
                          color: isActive ? "#22d3ee" : "rgba(255,255,255,0.28)",
                          transition: "color 0.4s",
                        }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        fontSize: 7,
                        letterSpacing: "0.38em",
                        textTransform: "uppercase",
                        fontFamily: "inherit",
                        color: isActive ? "rgba(34,211,238,0.75)" : "rgba(255,255,255,0.22)",
                        transition: "color 0.4s, opacity 0.4s",
                        lineHeight: 1,
                        display: "block",
                      }}
                    >
                      {cat.id}
                    </span>
                  </button>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </main>
  );
}