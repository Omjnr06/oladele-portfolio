"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { clipItemsForCategory } from "../data/boardItems";

export default function ClipPlayer({ clip, onClose }) {
  const list = useMemo(() => clipItemsForCategory(clip.categoryId), [clip.categoryId]);
  const [idx, setIdx] = useState(() => Math.max(0, list.findIndex((c) => c.id === clip.id)));
  const current = list[idx] || clip;

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const ctrlTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ctrlVis, setCtrlVis] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dur, setDur] = useState(0);
  const [cur, setCur] = useState(0);
  const [ratio, setRatio] = useState(16 / 9);

  const go = useCallback((d) => setIdx((i) => (i + d + list.length) % list.length), [list.length]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { setupAudio(); v.play().catch(() => {}); } else v.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen().catch(() => {});
      else if (videoRef.current?.webkitEnterFullscreen) videoRef.current.webkitEnterFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, go, togglePlay]);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    const v = videoRef.current;
    const onBegin = () => setIsFullscreen(true);
    const onEnd = () => setIsFullscreen(false);
    if (v) {
      v.addEventListener("webkitbeginfullscreen", onBegin);
      v.addEventListener("webkitendfullscreen", onEnd);
    }
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      if (v) {
        v.removeEventListener("webkitbeginfullscreen", onBegin);
        v.removeEventListener("webkitendfullscreen", onEnd);
      }
    };
  }, [idx]);

  const setupAudio = useCallback(() => {
    if (current.audioOnly || !videoRef.current) return;
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 128;
      }
      if (!sourceRef.current) {
        sourceRef.current = audioCtxRef.current.createMediaElementSource(videoRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioCtxRef.current.destination);
      }
      if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    } catch (e) {}
    startVisualizer();
  }, [current.audioOnly]);

  const startVisualizer = useCallback(() => {
    if (rafRef.current || !analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let timePhase = 0;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const c = canvasRef.current;
      if (!c) return;
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
      const ctx = c.getContext("2d");
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const isCorsBlocked = sum === 0;
      ctx.clearRect(0, 0, w, h);
      const barWidth = (w / bufferLength) * 1.5;
      let x = 0;
      timePhase += 0.1;
      const playing = videoRef.current && !videoRef.current.paused;
      for (let i = 0; i < bufferLength; i++) {
        let barHeight = 2;
        if (playing) {
          if (isCorsBlocked) {
            const mathWave = Math.sin(i * 0.1 + timePhase) * Math.cos(i * 0.05 - timePhase) * 100;
            barHeight = Math.abs(mathWave + Math.random() * 20) * (h / 150);
          } else {
            barHeight = (dataArray[i] / 255) * (h * 0.85);
          }
        }
        const g = ctx.createLinearGradient(0, h, 0, h - barHeight);
        g.addColorStop(0, "rgba(34, 211, 238, 0.6)");
        g.addColorStop(1, "rgba(34, 211, 238, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, h - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const onMeta = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
    setDur(v.duration || 0);
  };
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCur(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };
  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };
  const showControls = () => {
    setCtrlVis(true);
    if (ctrlTimer.current) clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => { if (isPlaying) setCtrlVis(false); }, 2600);
  };
  const fmt = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isPortrait = ratio < 1;
  const stageStyle = isFullscreen
    ? { width: "100vw", height: "100vh" }
    : {};

  return (
    <div className="mv-cp-overlay" onClick={onClose}>
      <div className={`mv-cp${isPortrait ? " mv-cp--portrait" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button className="mv-cp-x" onClick={onClose} aria-label="Close">✕</button>

        <div
          ref={containerRef}
          className="mv-cp-stage"
          style={stageStyle}
          onMouseMove={showControls}
          onClick={togglePlay}
        >
          {current.audioOnly ? (
            <div className="mv-cp-audio">
              <video ref={videoRef} src={current.videoUrl} className="mv-cp-media"
                onPlay={() => { setIsPlaying(true); setupAudio(); }} onPause={() => setIsPlaying(false)}
                onTimeUpdate={onTimeUpdate} onLoadedMetadata={onMeta} autoPlay playsInline />
              <div className="mv-cp-audio-overlay">
                <svg viewBox="0 0 100 100" className="mv-cp-audio-svg">
                  <text x="50" y="44" textAnchor="middle" fontFamily="monospace" fontSize="44" fontWeight="900" fill="#8b5cf6">OMJ</text>
                  <text x="50" y="90" textAnchor="middle" fontFamily="monospace" fontSize="44" fontWeight="900" fill="#22d3ee">{">_"}</text>
                </svg>
                <span className="mv-cp-audio-label">Audio Only</span>
              </div>
            </div>
          ) : (
            <video ref={videoRef} src={current.videoUrl} className="mv-cp-media" crossOrigin="anonymous"
              onPlay={() => { setIsPlaying(true); setupAudio(); }} onPause={() => setIsPlaying(false)}
              onTimeUpdate={onTimeUpdate} onLoadedMetadata={onMeta} autoPlay playsInline />
          )}

          <canvas ref={canvasRef} className="mv-cp-viz" />

          {isFullscreen && (
            <motion.div className="mv-cp-fs-info" animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }} transition={{ duration: 0.28 }}>
              <span className="mv-cp-fs-kicker">Info</span>
              <div className="mv-cp-fs-field"><span>Title</span><p>{current.title}</p></div>
              {current.originalArtist && <div className="mv-cp-fs-field"><span>Original By</span><p>{current.originalArtist}</p></div>}
              {current.location && <div className="mv-cp-fs-field"><span>Location</span><p>{current.location}</p></div>}
              {current.notes && <div className="mv-cp-fs-field"><span>Analysis</span><p className="mv-cp-fs-notes">{current.notes}</p></div>}
            </motion.div>
          )}

          {list.length > 1 && (
            <motion.div className="mv-cp-arrows" animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }} transition={{ duration: 0.28 }}>
              <button className="mv-cp-arrow" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className="mv-cp-arrow" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </motion.div>
          )}

          <motion.div className="mv-cp-bar" animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }} transition={{ duration: 0.28 }} onClick={(e) => e.stopPropagation()}>
            <button className="mv-cp-play" onClick={togglePlay} aria-label="Play/Pause">
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <span className="mv-cp-time">{fmt(cur)} / {fmt(dur)}</span>
            <div className="mv-cp-track" onClick={seek}>
              <div className="mv-cp-fill" style={{ width: `${progress}%` }} />
            </div>
            <button className="mv-cp-fs" onClick={toggleFullscreen} aria-label="Fullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
            </button>
          </motion.div>
        </div>

        {!isFullscreen && (
          <div className="mv-cp-info">
            <div className="mv-cp-titleline">
              <h3 className="mv-cp-title">{current.title}</h3>
              {current.isFeatured ? <span className="mv-clip-tag">featured</span> : null}
            </div>
            <div className="mv-cp-artist">{current.originalArtist}</div>
            <div className="mv-cp-meta">{current.date} · {current.location}</div>
            {current.notes ? <p className="mv-cp-notes">{current.notes}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}