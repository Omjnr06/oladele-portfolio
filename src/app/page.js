"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // We keep Link for the smooth Framer Motion transitions

export default function Home() {
  const myName = "Oladele Magbadelo";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Simplified Gallery Data - Let the photos speak for themselves
  const galleryImages = [
    { src: "/images/junior-headshot.JPG" },
    { src: "/images/junior-statue.jpeg" },
    { src: "/images/junior-food.jpeg" },
    { src: "/images/junior-basketball.jpg" },
    { src: "/images/junior-guitar.jpeg" },
    { src: "/images/junior-boat.jpeg" },
    { src: "/images/junior-soccer.JPG" },
  ];

  // Manual Navigation Handlers
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % galleryImages.length
    );
  };

  // Automatic Shuffle Logic
  useEffect(() => {
    if (isPaused) return; 
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
    }, 5000); 

    return () => clearInterval(timer);
  }, [isPaused, galleryImages.length]);

  return (
    <main className="min-h-screen w-full flex bg-[var(--bg-base)] font-sans selection:bg-[var(--accent-cyan)] selection:text-black">
      
      {/* Sidebar Navigation - Fixed to screen, parent is standard flex-col */}
      <nav className="hidden lg:flex w-20 flex-col items-center justify-center bg-[var(--bg-surface)] perforation-line z-20 fixed h-screen top-0 left-0">
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-[var(--text-muted)]">
          
          {/* Children are individually rotated to prevent bounding-box clipping */}
          <Link 
            href="/" 
            className="text-[var(--accent-cyan)] uppercase cursor-pointer border-l-2 border-[var(--accent-cyan)] pr-2 rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Projects
          </Link>
          
          <button 
            className="hover:text-white transition-colors uppercase cursor-pointer rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Music
          </button>
          
          <Link 
            href="/resume" 
            className="hover:text-white transition-colors uppercase cursor-pointer rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Resume
          </Link>

        </div>
      </nav>

      {/* Main Canvas - Offset by lg:ml-20 so it doesn't hide under the fixed sidebar */}
      <div className="flex-1 bg-journal-dots relative flex items-center overflow-hidden lg:ml-20">
        
        {/* The Vertical Margin Line */}
        <div className="absolute left-10 h-full w-[1px] bg-[var(--accent-cyan)] opacity-20 pointer-events-none hidden md:block" />

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-cyan)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="px-8 md:px-20 lg:px-32 w-full z-10 py-12">
          
          {/* Name Header */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[7rem] font-extrabold mb-10 tracking-tight flex whitespace-nowrap overflow-visible pl-2">
            {myName.split("").map((letter, index) => (
              <span 
                key={index} 
                className="hover-letter animate-scan"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {letter === " " ? "\u00A0\u00A0" : letter}
              </span>
            ))}
          </h1>
          
          <div className="max-w-3xl space-y-6 text-[var(--text-muted)]">
            <p className="text-xl md:text-2xl leading-relaxed font-light">
              Pursuing <span className="text-white">Computer Science</span> & <span className="text-white">Data Science</span> at Western University.
            </p>
            <p className="text-lg md:text-xl leading-relaxed font-light border-l border-white/10 pl-6">
              Building <span className="text-[var(--accent-cyan)]">cool things.</span> Mastering <span className="text-[var(--accent-cyan)]">5</span> instruments on the side
            </p>
          </div>

          {/* Clean Cinematic Viewfinder */}
          <div 
            className="mt-16 max-w-4xl h-[450px] md:h-[550px] border border-white/10 bg-[#050505] rounded-xl overflow-hidden relative group shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* The Crossfading Images */}
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  currentIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{ 
                  backgroundImage: `url('${image.src}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            ))}
            
            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />
            
            {/* Left Navigation Arrow */}
            <button
              onClick={handlePrev}
              className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${
                isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
              }`}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {/* Right Navigation Arrow */}
            <button
              onClick={handleNext}
              className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${
                isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            {/* Minimalist Bottom Gradient & Indicators */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-end justify-center pb-6">
              {/* Tracking Dashes */}
              <div className="flex gap-2">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      currentIndex === idx ? 'w-8 md:w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Interface */}
          <div className="flex flex-col sm:flex-row gap-6 mt-12 mb-24">
            <button className="group relative px-10 py-5 bg-white text-black font-mono font-bold text-sm uppercase tracking-tighter rounded-full transition-all hover:scale-105 active:scale-95">
              View Mustang Wrapped ↗
            </button>
            <button className="px-10 py-5 border border-white/10 text-white font-mono font-bold text-sm uppercase tracking-tighter rounded-full hover:bg-white/5 transition-all hover:border-white/30">
              Explore Infrastructure
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}