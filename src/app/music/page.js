"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

const PianoIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><rect x="2" y="6" width="20" height="13" rx="1.5" /><path d="M2 13.5h20" /><path d="M6 13.5V19M10 13.5V19M14 13.5V19M18 13.5V19" /><path d="M5 6v5M8.5 6v5M15.5 6v5M19 6v5" /></svg>
);
const DrumsIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><ellipse cx="12" cy="17" rx="8" ry="3" /><path d="M4 17V9c0-1.66 3.58-3 8-3s8 1.34 8 3v8" /><ellipse cx="12" cy="9" rx="8" ry="3" /><path d="M7 6.5L5.5 2M17 6.5L18.5 2" /></svg>
);
const GuitarIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><path d="M9.5 17.5a3.5 3.5 0 1 0 5-5L19 8l-3-3-4.5 4.5a3.5 3.5 0 0 0-2 5z" /><path d="M14.5 9.5l-5 5" /><path d="M17 5l2-2M19 5l-2-2" /></svg>
);
const BassIcon = ({ style, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}><path d="M8.5 18.5a3.5 3.5 0 1 0 5-5V4.5" /><path d="M13.5 4.5H17M13.5 7.5H16" /><circle cx="10" cy="18.5" r="0.5" fill="currentColor" /></svg>
);

export const musicLibrary = [
  {
    id: "PIANO", 
    label: "Piano Covers", 
    icon: PianoIcon,
    tracks: [
      { 
        id: "piano 01", 
        title: "Liebestraum No. 3 Cover", 
        originalArtist: "Franz Liszt",
        date: "2026.03.11", 
        location: "Talbot College @ Western University", 
        notes: "Really liked the song, best take so far, got to the first 30 seconds. Will update when I learn the full thing.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/liebenstraum-piano.mp4" 
      },
      { 
        id: "piano 02", 
        title: "Sing About Me I'm Dying of Thirst Piano Cover",
        originalArtist: "Kendrick Lamar", 
        date: "2025.02.01", 
        location: "Medway-Sydenham Hall Basement @ Western University", 
        notes: "At a point this was my favourite song so I had to learn it on piano.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/samidot-piano.mp4" 
      },
      { 
        id: "piano 03", 
        title: "Why Try To Change Me Now Cover with Ada",
        originalArtist: "Frank Sinatra", 
        date: "2024.10.29", 
        location: "Medway-Sydenham Hall Basement @ Western University", 
        notes: "Practicing being able to highlight a vocalist when playing piano. Really beautiful son with a great singer!", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/why-try-change-me-now-piano.mp4" 
      },
      { 
        id: "piano 04", 
        title: "One Summer Day Cover",
        originalArtist: "Joe Hisaishi", 
        date: "2025.12.31", 
        location: "The Gate Mall, Qatar", 
        notes: "Was bored in a mall and decided to play a classic.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/studio-ghibli-piano.mp4" 
      } 
    ]
  },
  {
    id: "DRUMS", 
    label: "Percussion", 
    icon: DrumsIcon,
    tracks: [
      { 
        id: "drums 01", 
        title: "Get Lucky — Groove Cover",
        originalArtist: "Daft Punk ft. Pharrell Williams",
        date: "2024.05.29", 
        location: "Gems American Academy", 
        notes: "Testing out Get Lucky with a Reggae Groove. Very Cool and fun to play, ended up performing at Grade 12 Grad.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/get-lucky-drums.MOV" 
      },
      { 
        id: "drums 02", 
        title: "Ironwood Drum Solo - Isn't She Lovely",
        originalArtist: "Stevie Wonder", 
        date: "2023.05.05", 
        location: "The Ironwood Stage and Grill, Calgary", 
        notes: "Last time I performed with this group before I moved from Calgary. Super fun song to play around with and fill to. Miss these guys.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/ironwood-drums.MP4" 
      },
      { 
        id: "drums 03", 
        title: "Sing About Me I'm Dying of Thirst Cover",
        originalArtist: "Kendrick Lamar", 
        date: "2023.03.29", 
        location: "St. Francis Highschool Calgary", 
        notes: "Learnt this song from end to end with my friend and decided to jam to it. First ever jamming video!", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/samidot-drums.mp4" 
      },
      { 
        id: "drums 04", 
        title: "Feeling Good Practice Clip",
        originalArtist: "Michael Bublé", 
        date: "2024.04.24", 
        location: "Gems American Academy", 
        notes: "We had a showcase coming up and this is just a random clip of ideas that we were playing around with that I thought was cool. Shoutout Ghalia(Voice) and Mr. V (Trumpet)", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/feeling-good-drums.mp4" 
      },
      { 
        id: "drums 05", 
        title: "Far Away Jam Session",
        originalArtist: "Yebba", 
        date: "2023.06.07", 
        location: "St. Francis Highschool Calgary", 
        notes: "During our spare, my good friend and I would sometimes just jam out to our favourite tracks. This is prolly the fatest fill I have ever done LOL. Miss jamming out with Vince.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/far-away-drums.MOV" 
      },
      { 
        id: "drums 06", 
        title: "Careless Whisper Practice Session",
        originalArtist: "George Michael", 
        date: "2023.11.14", 
        location: "Gems American Academy", 
        notes: "Unfortunately I placed my phone down to record this so there is no video but this is a clip from when we practicing for a showcase of careless whisper. Joshua killing it on SAX. Tried to keep it like the original track as much as possibile.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/careless-whisper-drums.mp4",
        audioOnly: true
      }
    ]
  },
  { 
    id: "GUITAR", 
    label: "Electric Guitar", 
    icon: GuitarIcon, 
    tracks: [
      { 
        id: "guitar 01", 
        title: "Best Part Cover with Isa",
        originalArtist: "Daniel Caesar ft. H.E.R.", 
        date: "2023.09.27", 
        location: "Gems American Academy", 
        notes: "One of the best guitar covers ive ever done. Played with different voicings of the same chord progression. Isas voice fit perfectly as well", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/best-part-guitar.mov",
        isFeatured: true,
      },
      { 
        id: "guitar 02", 
        title: "Mais Que Nada Cover with Maria",
        originalArtist: "Sérgio Mendes", 
        date: "2023.08.14", 
        location: "Maria's Home Studio", 
        notes: "Played one of my favourite samba brazilian songs (Maria is Brazillian!) Super fun to play, wish it on acoustic. Maria an amazing artist and singer, super talented.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/mais-que-nada-guitar.mp4" 
      },
    ] 
  },
  { 
    id: "BASS",
    label: "Bass Guitar",
    icon: BassIcon,
    tracks: [
      { 
        id: "bass 01", 
        title: "Black Orpheus Cover",
        originalArtist: "Luiz Bonfá", 
        date: "2023.06.25", 
        location: "Aslyum for Art, Calgary", 
        notes: "My first experience of OPEN MIC. Drummer had never played with us before so was cool to bounce off ideas musically mid performance.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/black-orpheus-bass.mp4" 
      },
      { 
        id: "bass 02", 
        title: "Fletchers Song in Club Cover",
        originalArtist: "Justin Hurwitz", 
        date: "2023.05.05", 
        location: "The Ironwood Stage and Grill, Calgary", 
        notes: "Opening song in our setlist from Whiplash Movie. Cool jazz vibes for a stage and grill bar. Was relatively new to playing bass.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/fletchers-song-in-club-bass.mp4" 
      },
      { 
        id: "bass 03", 
        title: "Redbone Jam",
        originalArtist: "Childish Gambino", 
        date: "2024.02.07", 
        location: "Gems American Academy", 
        notes: "No clue why I was in a suit. Looked fly though. Super fun 5 String Bass, allowed for some really cool runs.", 
        videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/redbone-bass.mp4" 
      },
    ] 
  },
];

const NUM_ITEMS    = musicLibrary.length;
const ANGLE_STEP   = 12;                  
const WHEEL_RADIUS = 600;                 
const ITEM_SIZE    = 86;                  
const DRAG_THRESH  = 7;                  

const fmt = (t) => {
  if (!t || isNaN(t)) return "00:00";
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
};

export default function TheMusicVault() {
  let defaultCatIdx = 1;
  let defaultTrackIdx = 0;
  
  musicLibrary.forEach((cat, cIdx) => {
    cat.tracks.forEach((track, tIdx) => {
      if (track.isFeatured) {
        defaultCatIdx = cIdx;
        defaultTrackIdx = tIdx;
      }
    });
  });

  const [activeCatIdx,   setActiveCatIdx]   = useState(defaultCatIdx);
  const [activeTrackIdx, setActiveTrackIdx] = useState(defaultTrackIdx);
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); 

  const playerContainerRef = useRef(null);
  const videoRef    = useRef(null);
  const seekRef     = useRef(null);
  const ctrlTimer   = useRef(null);

  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const [isPlaying,  setIsPlaying]  = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [curTime,    setCurTime]    = useState("00:00");
  const [dur,        setDur]        = useState("00:00");
  const [muted,      setMuted]      = useState(false);
  const [ctrlVis,    setCtrlVis]    = useState(true);

  const wheelMV     = useMotionValue(-(defaultCatIdx * ANGLE_STEP));
  const wheelRotRef = useRef(-(defaultCatIdx * ANGLE_STEP));          
  const counterRot  = useTransform(wheelMV, (r) => -r);

  const isDragging     = useRef(false);
  const dragDist       = useRef(0);
  const [wheelCursor, setWheelCursor] = useState(false);

  const activeCat   = musicLibrary[activeCatIdx];
  const activeTrack = activeCat.tracks[activeTrackIdx] ?? null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get("track");
      if (trackId) {
        for (let i = 0; i < musicLibrary.length; i++) {
          const tIdx = musicLibrary[i].tracks.findIndex(t => t.id === trackId);
          if (tIdx !== -1) {
            setActiveCatIdx(i);
            setActiveTrackIdx(tIdx);
            wheelRotRef.current = -(i * ANGLE_STEP);
            wheelMV.set(-(i * ANGLE_STEP));
            break;
          }
        }
      }
    }
  }, [wheelMV]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen(); 
      }
    } else {
      document.exitFullscreen();
    }
  };

  const initVisualizer = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; 
      
      if (videoRef.current && !sourceRef.current) {
        try {
          sourceRef.current = audioCtxRef.current.createMediaElementSource(videoRef.current);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioCtxRef.current.destination);
        } catch (e) {}
      }
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    drawVisualizer();
  }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let timePhase = 0; 
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const isCorsBlocked = sum === 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      
      timePhase += 0.1;
      const isVideoActuallyPlaying = videoRef.current && !videoRef.current.paused;
      
      for (let i = 0; i < bufferLength; i++) {
        let barHeight = 0;
        
        if (isVideoActuallyPlaying) {
          if (isCorsBlocked) {
            const mathWave = Math.sin(i * 0.1 + timePhase) * Math.cos(i * 0.05 - timePhase) * 100;
            const noise = Math.random() * 20;
            barHeight = Math.abs(mathWave + noise) * (canvas.height / 150);
          } else {
            barHeight = (dataArray[i] / 255) * (canvas.height * 0.8);
          }
        } else {
          barHeight = 2;
        }
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, "rgba(34, 211, 238, 0.6)"); 
        gradient.addColorStop(1, "rgba(34, 211, 238, 0)");   
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 2;
      }
    };
    draw();
  };

  useEffect(() => {
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

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

  const doPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    initVisualizer();
    v.play()
      .then(() => setIsPlaying(true))
      .catch((e) => { if (e.name !== "AbortError") setIsPlaying(false); });
  }, [initVisualizer]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause(); setIsPlaying(false);
    } else doPlay();
  }, [isPlaying, doPlay]);

  const handleSeek = useCallback((e) => {
    const v = videoRef.current;
    if (!v || !seekRef.current) return;
    const r   = seekRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    v.currentTime = pos * v.duration;
  }, []);

  const nudgeControls = useCallback(() => {
    setCtrlVis(true);
    clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => setCtrlVis(false), 2800);
  }, []);

  const nextTrack = () => { if (activeTrackIdx < activeCat.tracks.length - 1) setActiveTrackIdx((i) => i + 1); };
  const prevTrack = () => { if (activeTrackIdx > 0) setActiveTrackIdx((i) => i - 1); };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load(); 
    setProgress(0); setCurTime("00:00"); setDur("00:00");
    if (activeTrack) doPlay();
    else setIsPlaying(false);
  }, [activeTrack?.videoUrl, doPlay]); 

  useEffect(() => { if (!isPlaying) setCtrlVis(true); }, [isPlaying]);

  return (
    <main className="h-[100dvh] lg:h-screen w-full flex flex-col bg-[#020202] overflow-hidden relative" style={{ fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace" }}>
      <style>{`*, *::before, *::after { scrollbar-width: none; -ms-overflow-style: none; } ::-webkit-scrollbar { display: none; }`}</style>

      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(34,211,238,0.18) 1px, transparent 0)", backgroundSize: "30px 30px", opacity: 0.12 }} />

      <div className="absolute top-6 left-16 z-50 pointer-events-none hidden lg:block">
        <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-[0.3em] opacity-60">THE MUSIC VAULT</span>
      </div>

      <motion.nav 
        onMouseEnter={() => setLeftOpen(true)} 
        onMouseLeave={() => setLeftOpen(false)} 
        animate={{ 
          background: leftOpen ? "rgba(5,5,5,0.97)" : "rgba(5,5,5,0)", 
          backdropFilter: leftOpen ? "blur(24px)" : "blur(0px)", 
          borderRight: leftOpen ? "1px solid rgba(34,211,238,0.1)" : "1px solid rgba(34,211,238,0)", 
          boxShadow: leftOpen ? "6px 0 48px rgba(0,0,0,0.85), inset -1px 0 0 rgba(34,211,238,0.05)" : "none", 
          opacity: leftOpen ? 1 : 0.4, 
          x: leftOpen ? 0 : -8 
        }} 
        transition={{ type: "spring", stiffness: 420, damping: 40 }} 
        className="absolute left-0 top-0 h-full w-[44px] lg:w-[52px] z-50 flex flex-col items-center justify-center gap-9 cursor-pointer"
      >
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22d3ee", boxShadow: "0 0 8px rgba(34,211,238,0.7)" }} />
        {[ { label: "Home", href: "/#home" }, { label: "Projects", href: "/#projects" }, { label: "Music", href: "/music" }, { label: "Resume", href: "/resume" } ].map(({ label, href }) => (
          <Link key={label} href={href} className="transition-colors duration-200 hover:text-[var(--accent-cyan)]" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, letterSpacing: "0.45em", textTransform: "uppercase", color: label === "Music" ? "#22d3ee" : "rgba(255,255,255,0.5)" }}>{label}</Link>
        ))}
        <div className="absolute bottom-5 w-px h-7" style={{ background: "linear-gradient(to bottom, rgba(34,211,238,0.3), transparent)" }} />
      </motion.nav>

      {!drawerOpen && (
        <button 
          onClick={() => setDrawerOpen(true)} 
          className="fixed top-6 right-0 w-12 h-12 bg-[#050505]/80 border-y border-l border-[var(--accent-cyan)]/20 rounded-l-xl flex lg:hidden items-center justify-center text-[var(--accent-cyan)] backdrop-blur-md z-50 hover:bg-[#0a0a0a] shadow-[-5px_0_15px_rgba(0,0,0,0.5)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
             <rect x="4" y="4" width="4" height="4" rx="1" />
             <rect x="10" y="4" width="4" height="4" rx="1" />
             <rect x="16" y="4" width="4" height="4" rx="1" />
             <rect x="4" y="10" width="4" height="4" rx="1" />
             <rect x="10" y="10" width="4" height="4" rx="1" />
             <rect x="16" y="10" width="4" height="4" rx="1" />
             <rect x="4" y="16" width="4" height="4" rx="1" />
             <rect x="10" y="16" width="4" height="4" rx="1" />
             <rect x="16" y="16" width="4" height="4" rx="1" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              if (offset.x > 50) setDrawerOpen(false);
            }}
            className="fixed top-0 right-0 w-[280px] h-[100dvh] bg-[#050505]/95 backdrop-blur-2xl border-l border-[var(--accent-cyan)]/20 z-[60] flex flex-col lg:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
          >
            <button onClick={() => setDrawerOpen(false)} className="absolute top-1/2 -left-12 -translate-y-1/2 w-12 h-16 bg-[#050505]/95 border-y border-l border-[var(--accent-cyan)]/20 rounded-l-xl flex items-center justify-center text-[var(--accent-cyan)] backdrop-blur-xl shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="4" height="4" rx="1" />
                  <rect x="10" y="4" width="4" height="4" rx="1" />
                  <rect x="16" y="4" width="4" height="4" rx="1" />
                  <rect x="4" y="10" width="4" height="4" rx="1" />
                  <rect x="10" y="10" width="4" height="4" rx="1" />
                  <rect x="16" y="10" width="4" height="4" rx="1" />
                  <rect x="4" y="16" width="4" height="4" rx="1" />
                  <rect x="10" y="16" width="4" height="4" rx="1" />
                  <rect x="16" y="16" width="4" height="4" rx="1" />
               </svg>
            </button>

            <div className="flex flex-col h-1/2 border-b border-[var(--accent-cyan)]/10">
               <div className="p-5 border-b border-white/5">
                  <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Queue // {activeCat.id}</span>
                  <div className="h-px w-full bg-[var(--accent-cyan)]/20" />
               </div>
               <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {activeCat.tracks.length > 0 ? activeCat.tracks.map((track, idx) => (
                    <button 
                      key={track.id} 
                      onClick={() => setActiveTrackIdx(idx)} 
                      className={`group w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        idx === activeTrackIdx 
                          ? "bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                          : "bg-transparent border border-transparent hover:bg-white/5 hover:border-[var(--accent-cyan)]/20"
                      }`}
                    >
                      <span className={`text-[8px] transition-colors duration-300 ${
                        idx === activeTrackIdx ? 'text-[var(--accent-cyan)] drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-white/20 group-hover:text-[var(--accent-cyan)]/60'
                      }`}>▶</span>
                      <span className={`text-xs truncate transition-colors duration-300 ${
                        idx === activeTrackIdx ? 'text-[var(--accent-cyan)] font-bold' : 'text-white/50 group-hover:text-white'
                      }`}>{track.title}</span>
                    </button>
                  )) : <p className="text-xs text-white/30 italic p-2">// empty_queue</p>}
               </div>
            </div>

            <div className="flex flex-col h-1/2">
               <div className="p-5 border-b border-white/5">
                  <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Info</span>
                  <div className="h-px w-full bg-[var(--accent-cyan)]/20" />
               </div>
               <div className="flex-1 p-5 space-y-5 overflow-y-auto flex flex-col">
                  {activeTrack ? (
                    <>
                      <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Title</span><span className="text-sm text-white/80">{activeTrack.title}</span></div>
                      {activeTrack.originalArtist && <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Original By</span><span className="text-sm text-white/60">{activeTrack.originalArtist}</span></div>}
                      {activeTrack.location && <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Location</span><span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">{activeTrack.location}</span></div>}
                      <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Analysis</span><p className="text-xs text-white/40 leading-relaxed">{activeTrack.notes}</p></div>
                    </>
                  ) : <p className="text-xs text-white/30 italic">// offline</p>}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 flex flex-row items-center justify-center gap-4 lg:gap-6 z-40 pt-6 lg:pt-8 pl-[52px] pr-4 lg:px-12" onMouseMove={nudgeControls} onTouchStart={nudgeControls}>
        
        <div className="hidden lg:flex flex-col w-64 h-[60vh] bg-[#050505]/80 backdrop-blur-md border border-[var(--accent-cyan)]/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden shrink-0">
          <div className="p-6 border-b border-white/5">
            <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Queue // {activeCat.id}</span>
            <div className="h-px w-full bg-[var(--accent-cyan)]/20" />
          </div>
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {activeCat.tracks.length > 0 ? activeCat.tracks.map((track, idx) => (
              <button 
                key={track.id} 
                onClick={() => setActiveTrackIdx(idx)} 
                className={`group w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  idx === activeTrackIdx 
                    ? "bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                    : "bg-transparent border border-transparent hover:bg-white/5 hover:border-[var(--accent-cyan)]/20"
                }`}
              >
                <span className={`text-[8px] transition-colors duration-300 ${
                  idx === activeTrackIdx ? 'text-[var(--accent-cyan)] drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-white/20 group-hover:text-[var(--accent-cyan)]/60'
                }`}>▶</span>
                <span className={`text-xs truncate transition-colors duration-300 ${
                  idx === activeTrackIdx ? 'text-[var(--accent-cyan)] font-bold' : 'text-white/50 group-hover:text-white'
                }`}>{track.title}</span>
              </button>
            )) : <p className="text-xs text-white/30 italic p-2">// empty_queue</p>}
          </div>
        </div>

        <div ref={playerContainerRef} className={`relative flex-1 flex items-center justify-center transition-all duration-300 ${isFullscreen ? "bg-[#020202] h-[100dvh] lg:h-screen w-screen fixed inset-0 z-50 p-0" : "h-[45vh] lg:h-[60vh] max-w-4xl mb-12 lg:mb-0"}`}>
          <div className={`relative overflow-hidden cursor-pointer w-full h-full flex-shrink-0 ${isFullscreen ? "rounded-none border-none" : "rounded-2xl border border-[var(--accent-cyan)]/20 shadow-[0_0_80px_rgba(0,0,0,0.8),_0_0_200px_rgba(34,211,238,0.04)]"}`} onClick={togglePlay}>
            {activeTrack ? (
              <>
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain bg-black" playsInline preload="metadata"crossOrigin="anonymous" muted={muted} onTimeUpdate={() => { const v = videoRef.current; if (!v) return; setProgress(((v.currentTime / v.duration) * 100) || 0); setCurTime(fmt(v.currentTime)); }} onLoadedMetadata={() => setDur(fmt(videoRef.current?.duration))} onEnded={() => { if (activeTrackIdx < activeCat.tracks.length - 1) { setActiveTrackIdx(prev => prev + 1); } else { setIsPlaying(false); } }}>
                  <source src={activeTrack.videoUrl} type="video/mp4" />
                </video>

                {activeTrack.audioOnly && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none">
                    <div className="flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        <text x="50" y="44" textAnchor="middle" fontFamily="monospace, sans-serif" fontSize="50" fontWeight="900" fill="#8b5cf6">OMJ</text>
                        <text x="50" y="94" textAnchor="middle" fontFamily="monospace, sans-serif" fontSize="50" fontWeight="900" fill="#22d3ee">{`>_`}</text>
                      </svg>
                    </div>
                    <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-[0.4em] animate-pulse">Audio Only</span>
                  </div>
                )}

                {isFullscreen && (
                  <motion.div
                    className="absolute top-8 left-8 z-40 w-72 bg-black/50 backdrop-blur-md border border-[var(--accent-cyan)]/20 rounded-2xl p-6 shadow-2xl pointer-events-none hidden lg:block"
                    animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    <span className="text-[9px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-4 border-b border-white/10 pb-2">Info</span>
                    <div className="space-y-4">
                      <div><span className="text-[7px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Title</span><span className="text-xs text-white/90 font-medium">{activeTrack.title}</span></div>
                      {activeTrack.originalArtist && <div><span className="text-[7px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Original By</span><span className="text-[10px] text-white/70">{activeTrack.originalArtist}</span></div>}
                      {activeTrack.location && <div><span className="text-[7px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Location</span><span className="text-[9px] text-white/60 bg-white/10 px-2 py-0.5 rounded">{activeTrack.location}</span></div>}
                      <div><span className="text-[7px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Analysis</span><p className="text-[9px] text-white/50 leading-relaxed">{activeTrack.notes}</p></div>
                    </div>
                  </motion.div>
                )}

                {isFullscreen && activeCat.tracks.length > 1 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 right-0 z-30 pointer-events-none flex items-center justify-between px-4 lg:px-8"
                    animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                      disabled={activeTrackIdx === 0}
                      className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center bg-black/50 border border-white/10 text-white/50 backdrop-blur-md transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/50 hover:bg-black/80 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                      disabled={activeTrackIdx === activeCat.tracks.length - 1}
                      className="pointer-events-auto w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center bg-black/50 border border-white/10 text-white/50 backdrop-blur-md transition-all hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/50 hover:bg-black/80 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </motion.div>
                )}

                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div key="play-overlay" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-black/60 border border-[var(--accent-cyan)]/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-md flex items-center justify-center pl-1 text-[var(--accent-cyan)]">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div className="absolute bottom-0 left-0 w-full z-40 pt-12 pb-2 lg:pb-4 px-3 lg:px-4" animate={{ opacity: ctrlVis || !isPlaying ? 1 : 0 }} transition={{ duration: 0.28 }} onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(to top, rgba(2,2,2,0.95) 0%, transparent 100%)" }}>
                  <div ref={seekRef} onClick={handleSeek} className="group relative mb-3 lg:mb-4 cursor-pointer h-1.5 bg-white/10 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-[var(--accent-cyan)] rounded-full pointer-events-none transition-all duration-75" style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(34,211,238,0.5)" }} />
                  </div>
                  <div className="flex items-center gap-3 lg:gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-[var(--accent-cyan)] transition-colors">
                      {isPlaying ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <span className="text-[10px] lg:text-xs text-white/50 w-20 lg:w-24">{curTime} / {dur}</span>
                    <div className="flex-1" />
                    
                    <button onClick={toggleFullScreen} className="text-white/50 hover:text-[var(--accent-cyan)] transition-colors ml-2 lg:ml-4">
                      {isFullscreen ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050505]">
                <activeCat.icon className="w-16 h-16 text-[var(--accent-cyan)]/20" />
                <span className="animate-pulse text-[10px] tracking-[0.5em] text-white/20 uppercase">Awaiting Signal</span>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col w-64 h-[60vh] bg-[#050505]/80 backdrop-blur-md border border-[var(--accent-cyan)]/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden shrink-0">
          <div className="p-6 border-b border-white/5">
            <span className="text-[10px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Info</span>
            <div className="h-px w-full bg-[var(--accent-cyan)]/20" />
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col">
            {activeTrack ? (
              <>
                <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Title</span><span className="text-sm text-white/80">{activeTrack.title}</span></div>
                
                {activeTrack.originalArtist && (
                  <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Original By</span><span className="text-sm text-white/60">{activeTrack.originalArtist}</span></div>
                )}
                
                {activeTrack.location && (
                  <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-1">Location</span><span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">{activeTrack.location}</span></div>
                )}

                <div><span className="text-[8px] text-[var(--accent-cyan)] uppercase tracking-widest block mb-2">Analysis</span><p className="text-xs text-white/40 leading-relaxed">{activeTrack.notes}</p></div>
              </>
            ) : <p className="text-xs text-white/30 italic">// offline</p>}
          </div>
        </div>

      </div>

      <div className="h-[220px] lg:h-[280px] w-full shrink-0 relative z-20 bg-transparent overflow-visible" style={{ cursor: wheelCursor ? "grabbing" : "grab", touchAction: "pan-y" }} onPointerDown={handleWheelPointerDown} onTouchStart={handleWheelTouchStart}>
        
        <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-full z-0 pointer-events-none opacity-40" />

        <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none" style={{ height: 60, background: "linear-gradient(to bottom, #020202 20%, transparent)" }} />
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div style={{ width: 2, height: 20, background: "linear-gradient(to bottom, rgba(34,211,238,0.8), transparent)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 2, background: "#22d3ee", boxShadow: "0 0 15px rgba(34,211,238,1)" }} />
        </div>

        <motion.div
          style={{
            position: "absolute",
            width:  WHEEL_RADIUS * 2,
            height: WHEEL_RADIUS * 2,
            left: "50%",
            marginLeft: -WHEEL_RADIUS,
            top: "100%",
            marginTop: -220, 
            rotate: wheelMV,
            borderRadius: "50%",
            borderTop: "1px solid rgba(34,211,238,0.3)",
            background: "radial-gradient(circle at center, rgba(34,211,238,0.03) 0%, transparent 60%)",
            zIndex: 10
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
                  <button 
                    onClick={() => handleInstrumentClick(i)} 
                    className="group flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-0"
                  >
                    <div 
                      className={`w-[55px] h-[55px] lg:w-[70px] lg:h-[70px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        isActive 
                          ? "bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/60 shadow-[0_0_30px_rgba(34,211,238,0.25),inset_0_0_20px_rgba(34,211,238,0.1)] scale-[1.15]" 
                          : "bg-[#080808]/90 border border-white/10 group-hover:border-[var(--accent-cyan)]/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] group-hover:bg-[#0a0a0a] scale-100"
                      }`}
                    >
                      <Icon 
                        className={`w-6 h-6 lg:w-7 lg:h-7 transition-colors duration-400 ${
                          isActive ? "text-[var(--accent-cyan)]" : "text-white/40 group-hover:text-[var(--accent-cyan)]"
                        }`} 
                      />
                    </div>
                    <span 
                      className={`text-[9px] lg:text-[10px] tracking-[0.4em] uppercase font-inherit transition-all duration-400 block ${
                        isActive 
                          ? "text-[var(--accent-cyan)] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                          : "text-white/30 group-hover:text-white/90"
                      }`}
                      style={{ lineHeight: 1 }}
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