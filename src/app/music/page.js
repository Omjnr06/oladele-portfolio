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
// WHEEL MATH (FLAWLESS ARC POSITIONING)
// ─────────────────────────────────────────────────────────────────
const NUM_ITEMS    = musicLibrary.length;
const ANGLE_STEP   = 26;                  // Tighter angle guarantees NO instruments fall below the screen
const WHEEL_RADIUS = 240;                 // Perfectly sized so the top never hits the video player
const ITEM_SIZE    = 86;                  // Large, highly visible buttons
const DRAG_THRESH  = 7;                   

const fmt = (t) => {
  if (!t || isNaN(t)) return "00:00";
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
};

export default function TheMusicVault() {
  const [activeCatIdx,   setActiveCatIdx]   = useState(0);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Video & Fullscreen Refs
  const playerContainerRef = useRef(null);
  const videoRef    = useRef(null);
  const bgVideoRef  = useRef(null);
  const seekRef     = useRef(null);
  const ctrlTimer   = useRef(null);

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [curTime,    setCurTime]    = useState("00:00");
  const [dur,        setDur]        = useState("00:00");
  const [muted,      setMuted]      = useState(false);
  const [ctrlVis,    setCtrlVis]    = useState(true);

  const wheelMV     = useMotionValue(0);
  const wheelRotRef = useRef(0);          
  const counterRot  = useTransform(wheelMV, (r) => -r);

  const isDragging     = useRef(false);
  const dragDist       = useRef(0);
  const [wheelCursor, setWheelCursor] = useState(false);

  const activeCat   = musicLibrary[activeCatIdx];
  const activeTrack = activeCat.tracks[activeTrackIdx] ?? null;

  // ── FULLSCREEN HANDLER ──
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // ── CLAMPED ROTATION ──
  const rotateTo = useCallback((index) => {
    const target = -(index * ANGLE_STEP);
    if (Math.abs(target - wheelRotRef.current) < 0.5) return; 
    wheelRotRef.current = target;
    animate(wheelMV, target, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });
  }, [wheelMV]);

  useEffect(() => { rotateTo(activeCatIdx); }, [activeCatIdx, rotateTo]);

  const handleInstrumentClick = useCallback((i) => {
    if (isDragging.current || dragDist.current > DRAG_THRESH) return;
    setActiveCatIdx(i);
    setActiveTrackIdx(0);
  }, []);

  // ── DRAG HANDLERS (MOUSE & TOUCH) ──
  const handleWheelPointerDown = useCallback((e) => {
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
        isDragging.current = false;
        dragDist.current   = 0;
        return;
      }
      
      let nearest = Math.round(-wheelRotRef.current / ANGLE_STEP);
      nearest = Math.max(0, Math.min(NUM_ITEMS - 1, nearest)); 
      
      const snapTarget = -(nearest * ANGLE_STEP);
      wheelRotRef.current = snapTarget;
      animate(wheelMV, snapTarget, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });
      
      setActiveCatIdx(nearest);
      setActiveTrackIdx(0);
      setTimeout(() => { isDragging.current = false; dragDist.current = 0; }, 60);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
  }, [wheelMV]);

  const handleWheelTouchStart = useCallback((e) => {
    const startX   = e.touches[0].clientX;
    const startRot = wheelRotRef.current;
    dragDist.current = 0;

    const onMove = (ev) => {
      const dx = ev.touches[0].clientX - startX;
      dragDist.current = Math.abs(dx);
      if (dragDist.current > DRAG_THRESH) {
        isDragging.current = true;
        const newRot = startRot + dx * 0.42;
        wheelRotRef.current = newRot;
        wheelMV.set(newRot);
      }
    };

    const onEnd = () => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onEnd);
      
      if (!isDragging.current) {
        isDragging.current = false;
        dragDist.current   = 0;
        return;
      }

      let nearest = Math.round(-wheelRotRef.current / ANGLE_STEP);
      nearest = Math.max(0, Math.min(NUM_ITEMS - 1, nearest)); 
      
      const snapTarget = -(nearest * ANGLE_STEP);
      wheelRotRef.current = snapTarget;
      animate(wheelMV, snapTarget, { type: "spring", stiffness: 82, damping: 17, mass: 1.1 });
      
      setActiveCatIdx(nearest);
      setActiveTrackIdx(0);
      setTimeout(() => { isDragging.current = false; dragDist.current = 0; }, 60);
    };

    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend",  onEnd);
  }, [wheelMV]);


  const syncBg = () => {
    if (bgVideoRef.current && videoRef.current) bgVideoRef.current.currentTime = videoRef.current.currentTime;
  };

  const doPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => { setIsPlaying(true); bgVideoRef.current?.play().catch(() => {}); })
      .catch((e) => { if (e.name !== "AbortError") setIsPlaying(false); });
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause(); bgVideoRef.current?.pause(); setIsPlaying(false);
    } else doPlay();
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

  useEffect(() => { setActiveTrackIdx(0); }, [activeCatIdx]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load(); bgVideoRef.current?.load();
    setProgress(0); setCurTime("00:00"); setDur("00:00");
    if (activeTrack) doPlay();
    else setIsPlaying(false);
  }, [activeTrack?.videoUrl]); 

  useEffect(() => { if (!isPlaying) setCtrlVis(true); }, [isPlaying]);

  return (
    <main className="h-screen w-full flex flex-col bg-[#020202] overflow-hidden relative" style={{ fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace" }}>
      <style>{`*, *::before, *::after { scrollbar-width: none; -ms-overflow-style: none; } ::-webkit-scrollbar { display: none; }`}</style>

      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(34,211,238,0.18) 1px, transparent 0)", backgroundSize: "30px 30px", opacity: 0.12 }} />

      {/* ── LEFT GHOST SIDEBAR ── */}
      <div className="absolute left-0 top-0 w-8 h-full z-50" onMouseEnter={() => setLeftOpen(true)} />
      <AnimatePresence>
        {leftOpen && (
          <motion.nav initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }} onMouseLeave={() => setLeftOpen(false)} className="absolute left-0 top-0 h-full w-[52px] z-50 flex flex-col items-center justify-center gap-9" style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(34,211,238,0.1)", boxShadow: "6px 0 48px rgba(0,0,0,0.85), inset -1px 0 0 rgba(34,211,238,0.05)" }}>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22d3ee", boxShadow: "0 0 8px rgba(34,211,238,0.7)" }} />
            {[ { label: "Home", href: "/#home" }, { label: "Projects", href: "/#projects" }, { label: "Music", href: "/music" }, { label: "Resume", href: "/resume" } ].map(({ label, href }) => (
              <Link key={label} href={href} className="transition-colors duration-200 hover:text-[var(--accent-cyan)]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, letterSpacing: "0.45em", textTransform: "uppercase", color: label === "Music" ? "#22d3ee" : "rgba(255,255,255,0.32)" }}>{label}</Link>
            ))}
            <div className="absolute bottom-5 w-px h-7" style={{ background: "linear-gradient(to bottom, rgba(34,211,238,0.3), transparent)" }} />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── RIGHT GHOST SIDEBAR ── */}
      <div className="absolute right-0 top-0 w-8 h-full z-50" onMouseEnter={() => setRightOpen(true)} />
      <AnimatePresence>
        {rightOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }} onMouseLeave={() => setRightOpen(false)} className="absolute right-0 top-0 h-full w-72 z-50 flex flex-col" style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(24px)", borderLeft: "1px solid rgba(34,211,238,0.1)", boxShadow: "-6px 0 48px rgba(0,0,0,0.85)" }}>
            <div className="flex-1 p-6 overflow-y-auto border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5 mb-5">
                <span style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(34,211,238,0.6)" }}>Library</span>
                <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.12)" }} />
                <span style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)", fontFamily: "inherit" }}>{activeCat.id}</span>
              </div>
              <div className="space-y-0.5">
                {activeCat.tracks.length > 0 ? activeCat.tracks.map((track, idx) => (
                  <button key={track.id} onClick={() => setActiveTrackIdx(idx)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded transition-all duration-150" style={{ fontSize: 10, fontFamily: "inherit", color: idx === activeTrackIdx ? "#22d3ee" : "rgba(255,255,255,0.35)", background: idx === activeTrackIdx ? "rgba(34,211,238,0.07)" : "transparent", border: `1px solid ${idx === activeTrackIdx ? "rgba(34,211,238,0.2)" : "transparent"}` }}>
                    <span style={{ opacity: idx === activeTrackIdx ? 1 : 0, fontSize: 7 }}>▶</span>
                    <span className="truncate">{track.title}</span>
                  </button>
                )) : <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>// no_media_found</p>}
              </div>
            </div>
            <div className="h-[46%] p-6 overflow-y-auto">
              <div className="flex items-center gap-2.5 mb-5">
                <span style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>Metadata</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              {activeTrack ? (
                <div className="space-y-4">
                  {[ ["title", activeTrack.title], ["date", activeTrack.date], ["status", activeTrack.status] ].map(([k, v]) => (
                    <div key={k}><span className="block mb-0.5" style={{ fontSize: 7, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)" }}>{k}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)" }}>{v}</span></div>
                  ))}
                  <div><span className="block mb-1" style={{ fontSize: 7, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)" }}>notes</span><p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{activeTrack.notes}</p></div>
                </div>
              ) : <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>// select_a_track</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP: CINEMATIC VIDEO THEATER ── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden z-20 pb-4 pt-4" onMouseMove={nudgeControls}>
        {activeTrack && <video ref={bgVideoRef} className="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none" style={{ filter: "blur(80px)", opacity: 0.3 }} muted playsInline><source src={activeTrack.videoUrl} type="video/mp4" /></video>}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 35%, rgba(2,2,2,0.75) 100%)" }} />

        {/* FULLSCREEN WRAPPER */}
        <div ref={playerContainerRef} className={`relative z-20 flex items-center justify-center w-full px-6 transition-all duration-300 ${isFullscreen ? "bg-[#020202] h-full" : "h-full"}`}>
          <div className={`relative overflow-hidden cursor-pointer flex-shrink-0 ${isFullscreen ? "w-full h-full rounded-none border-none" : "rounded-2xl border border-[var(--accent-cyan)]/20 shadow-[0_0_80px_rgba(0,0,0,0.98),_0_0_200px_rgba(34,211,238,0.03)]"}`} style={{ height: "100%", aspectRatio: isFullscreen ? "auto" : "16 / 9", maxWidth: "100%" }} onClick={togglePlay}>
            {activeTrack ? (
              <>
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain bg-black" playsInline muted={muted} onTimeUpdate={() => { const v = videoRef.current; if (!v) return; setProgress(((v.currentTime / v.duration) * 100) || 0); setCurTime(fmt(v.currentTime)); }} onLoadedMetadata={() => setDur(fmt(videoRef.current?.duration))} onEnded={() => setIsPlaying(false)}>
                  <source src={activeTrack.videoUrl} type="video/mp4" />
                </video>

                <motion.div className="absolute top-4 right-5 z-30 text-right pointer-events-none" animate={{ opacity: ctrlVis ? 1 : 0 }} transition={{ duration: 0.35 }}>
                  <div style={{ fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)", marginBottom: 2 }}>{activeCat.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.3 }}>{activeTrack.title}</div>
                </motion.div>

                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div key="play-overlay" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(2,2,2,0.62)", border: "1px solid rgba(34,211,238,0.32)", boxShadow: "0 0 40px rgba(34,211,238,0.1)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 4 }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#22d3ee"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div className="absolute bottom-0 left-0 w-full z-30" animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }} transition={{ duration: 0.28 }} onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(to top, rgba(2,2,2,0.92) 0%, transparent 100%)", paddingTop: 52 }}>
                  <div ref={seekRef} onClick={handleSeek} className="group relative mx-4 mb-3 cursor-pointer" style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progress}%`, borderRadius: 2, background: "#22d3ee", boxShadow: "0 0 8px rgba(34,211,238,0.7)", pointerEvents: "none", transition: "width 0.08s linear" }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progress}%`, transform: "translate(-50%, -50%)", background: "#22d3ee", boxShadow: "0 0 10px rgba(34,211,238,0.6)", border: "2px solid #020202" }} />
                  </div>
                  <div className="flex items-center gap-4 px-4 pb-4">
                    <button onClick={togglePlay} className="transition-colors hover:text-[var(--accent-cyan)]" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {isPlaying ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <button onClick={() => { const m = !muted; setMuted(m); if (videoRef.current) videoRef.current.muted = m; }} className="transition-colors hover:text-[var(--accent-cyan)]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {muted ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>}
                    </button>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "inherit" }}>{curTime} / {dur}</span>
                    <div className="flex-1" />

                    {activeCat.tracks.length > 1 && (
                      <div className="flex items-center gap-3 mr-2" style={{ fontSize: 9, fontFamily: "inherit", padding: "5px 12px", borderRadius: 999, background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)" }}>
                        <button onClick={prevTrack} disabled={activeTrackIdx === 0} style={{ color: activeTrackIdx === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)", cursor: activeTrackIdx === 0 ? "not-allowed" : "pointer", transition: "color 0.15s" }} className="hover:text-[var(--accent-cyan)]">&lt;</button>
                        <span style={{ color: "rgba(34,211,238,0.8)", minWidth: 76, textAlign: "center" }}>TRK {String(activeTrackIdx + 1).padStart(2, "0")} / {String(activeCat.tracks.length).padStart(2, "0")}</span>
                        <button onClick={nextTrack} disabled={activeTrackIdx === activeCat.tracks.length - 1} style={{ color: activeTrackIdx === activeCat.tracks.length - 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.45)", cursor: activeTrackIdx === activeCat.tracks.length - 1 ? "not-allowed" : "pointer", transition: "color 0.15s" }} className="hover:text-[var(--accent-cyan)]">&gt;</button>
                      </div>
                    )}

                    <button onClick={toggleFullScreen} className="transition-colors hover:text-[var(--accent-cyan)] ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {isFullscreen ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505]"><activeCat.icon style={{ width: 56, height: 56, color: "rgba(34,211,238,0.08)" }} /><span className="animate-pulse" style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.14)", fontFamily: "inherit" }}>{activeCat.id} // NO SIGNAL</span></div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: THE CLAMPED SPEEDOMETER DIAL ── */}
      <div className="h-[280px] sm:h-[300px] w-full shrink-0 relative z-40 bg-[#020202] overflow-visible" style={{ cursor: wheelCursor ? "grabbing" : "grab", touchAction: "pan-y" }} onPointerDown={handleWheelPointerDown} onTouchStart={handleWheelTouchStart}>
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ height: 40, background: "linear-gradient(to bottom, #020202, transparent)" }} />
        
        {/* The Blue Indicator Needle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div style={{ width: 2, height: 20, background: "linear-gradient(to bottom, rgba(34,211,238,0.8), transparent)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 2, background: "#22d3ee", boxShadow: "0 0 15px rgba(34,211,238,1)" }} />
        </div>

        {/* The Wheel Container (Centered exactly at the bottom edge) */}
        <motion.div
          style={{
            position: "absolute",
            width:  WHEEL_RADIUS * 2,
            height: WHEEL_RADIUS * 2,
            left: "50%",
            marginLeft: -WHEEL_RADIUS,
            top: "100%",
            marginTop: -WHEEL_RADIUS, 
            rotate: wheelMV,
            borderRadius: "50%",
            borderTop: "1px solid rgba(34,211,238,0.15)",
            background: "radial-gradient(circle at center, rgba(34,211,238,0.02) 0%, transparent 70%)",
          }}
        >
          {musicLibrary.map((cat, i) => {
            const angleDeg = i * ANGLE_STEP;
            const angleRad = (angleDeg * Math.PI) / 180;
            const half     = ITEM_SIZE / 2;
            const cx = WHEEL_RADIUS + WHEEL_RADIUS * Math.sin(angleRad) - half;
            const cy = WHEEL_RADIUS - WHEEL_RADIUS * Math.cos(angleRad) - half;
            const isActive = activeCatIdx === i;
            const Icon     = cat.icon;

            return (
              <div key={cat.id} style={{ position: "absolute", left: cx, top: cy, width: ITEM_SIZE, height: ITEM_SIZE }}>
                <motion.div style={{ rotate: counterRot, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <button onClick={() => handleInstrumentClick(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    
                    {/* VISIBLE BUTTONS NO MATTER WHAT */}
                    <div style={{ width: 76, height: 76, borderRadius: "50%", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", background: isActive ? "rgba(34,211,238,0.1)" : "rgba(8,8,8,0.9)", border: `1px solid ${isActive ? "rgba(34,211,238,0.6)" : "rgba(255,255,255,0.1)"}`, boxShadow: isActive ? "0 0 30px rgba(34,211,238,0.25), inset 0 0 20px rgba(34,211,238,0.1)" : "none", transform: isActive ? "scale(1.15)" : "scale(0.9)", transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)" }}>
                      <Icon style={{ width: 30, height: 30, color: isActive ? "#22d3ee" : "rgba(255,255,255,0.4)", transition: "color 0.4s" }} />
                    </div>

                    <span style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "inherit", color: isActive ? "rgba(34,211,238,1)" : "rgba(255,255,255,0.3)", transition: "color 0.4s", lineHeight: 1, display: "block", textShadow: isActive ? "0 0 10px rgba(34,211,238,0.5)" : "none" }}>
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