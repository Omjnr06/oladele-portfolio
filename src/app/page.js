"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const myName = "Oladele Magbadelo";
  
  // ==============================================================================
  // STATE MANAGEMENT
  // ==============================================================================
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL"); 

  // Navigation state
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Image Array for slide show
  const galleryImages = [
    { src: "/images/junior-headshot.JPG" },
    { src: "/images/junior-statue.jpeg" },
    { src: "/images/junior-food.jpeg" },
    { src: "/images/junior-basketball.jpg" },
    { src: "/images/junior-guitar.jpeg" },
    { src: "/images/junior-boat.jpeg" },
    { src: "/images/junior-soccer.JPG" },
  ];

  // Project Data 
  const projects = [
    {
      id: "PROJECT 00",
      title: "Mustang Wrapped",
      category: "FULL STACK DATA",
      stack: ["Spotify API", "Supabase","Express.js", "React", "SQL"],
      description: "Data-driven social platform integrating the Spotify Web API with a Supabase backend. Shows Univeristy community-level music trends and insights by complex SQL aggregation.",
      liveUrl: "", 
      githubUrl: "https://github.com/tudor-filimon/mustangs-wrapped",
      videoUrl: "/mustang-demo.mp4",
      imageUrl: "" 
    },
    {
      id: "PROJECT 01",
      title: "Distributed URL Shortener",
      category: "SYSTEM INFRASTRUCTURE",
      stack: ["Flask", "Docker", "Nginx", "PostgreSQL"],
      description: "Highly available web application on DigitalOcean. Containerized an Nginx reverse proxy, Redis cache, and Python backend to support 500 concurrent users at 520+ req/sec.",
      liveUrl: "http://short.urlshortener-mlh.xyz/",
      githubUrl: "https://github.com/kathyjydong/PE-Hackathon-Template-2026", 
      videoUrl: "", 
      imageUrl: "" 
    },
    {
      id: "PROJECT 02",
      title: "Flowlytics (UofTHacks)",
      category: "DATA SCIENCE",
      stack: ["Python", "Mesa", "TypeScript", "React", "Gemini API"],
      description: "Customer traffic simulation and heat map generator. Identified densely populated areas and store 'dead zones' using complex data analysis algorithms.",
      liveUrl: "https://devpost.com/software/phygital-4exqp8",
      githubUrl: "https://github.com/h3692/flowlytics", 
      videoUrl: "",
      imageUrl: "/images/flowlytics-ui.png" 
    }
  ];

  const categories = ["ALL", ...new Set(projects.map((p) => p.category))];
  const filteredProjects = activeCategory === "ALL" 
    ? projects 
    : projects.filter((p) => p.category === activeCategory);
  
  // ==============================================================================
  // LOGIC & MATH FUNCTIONS
  // ==============================================================================
  const handlePrevPhoto = () => setCurrentPhotoIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  const handleNextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length);

  // Photo Carousel Timer
  useEffect(() => {
    if (isPaused) return; 
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [isPaused, galleryImages.length]);

  // Scroll Tracking for Active Nav Link & Back to Top Button
  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);

      const projectsSection = document.getElementById('projects');
      const contactSection = document.getElementById('contact');
      
      if (contactSection && contactSection.getBoundingClientRect().top <= 300) {
        setActiveSection('contact');
      } else if (projectsSection && projectsSection.getBoundingClientRect().top <= 300) {
        setActiveSection('projects');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScrollEvent);
    handleScrollEvent();
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  // Smooth Scroll Helper
  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getDialStyle = (index) => {
    const diff = index - currentProjectIndex;
    const xOffset = diff * 160; 
    const scale = Math.max(0.6, 1 - Math.abs(diff) * 0.15); 
    const opacity = Math.max(0, 1 - Math.abs(diff) * 0.35); 
    const zIndex = 50 - Math.abs(diff); 
    return { x: xOffset, scale, opacity, zIndex };
  };

  return (
    <main className="min-h-screen w-full flex flex-row bg-[var(--bg-base)] font-sans selection:bg-[var(--accent-cyan)] selection:text-black relative">
      
      {/* ALWAYS VISIBLE Sidebar Navigation */}
      <nav className="sticky top-0 h-screen w-12 md:w-20 shrink-0 flex flex-col items-center justify-center bg-[var(--bg-surface)] border-r border-white/5 z-50">
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-[var(--text-muted)]">
          
          <a 
            href="#home" 
            onClick={(e) => handleScroll(e, 'home')} 
            className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'home' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} 
            style={{ writingMode: 'vertical-rl' }}
          >
            Home
          </a>

          <a 
            href="#projects" 
            onClick={(e) => handleScroll(e, 'projects')} 
            className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'projects' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} 
            style={{ writingMode: 'vertical-rl' }}
          >
            Projects
          </a>

          <button className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>
            Music
          </button>

          <Link href="/resume" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>
            Resume
          </Link>

          <a 
            href="#contact" 
            onClick={(e) => handleScroll(e, 'contact')} 
            className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'contact' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} 
            style={{ writingMode: 'vertical-rl' }}
          >
            Contact
          </a>

        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-journal-dots relative overflow-x-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute left-10 h-full w-[1px] bg-[var(--accent-cyan)] opacity-20 pointer-events-none hidden md:block z-0" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-cyan)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="px-6 md:px-16 lg:px-24 w-full z-10 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">
          
          {/* SECTION 1: HERO & BIO */}
          <div id="home" className="mb-16 scroll-mt-24">
            <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] xl:text-[7rem] font-extrabold mb-10 tracking-tight flex whitespace-nowrap overflow-visible pl-2">
              {myName.split("").map((letter, index) => (
                <span key={index} className="hover-letter animate-scan" style={{ animationDelay: `${index * 0.06}s` }}>
                  {letter === " " ? "\u00A0\u00A0" : letter}
                </span>
              ))}
            </h1>
            <div className="max-w-3xl space-y-6 text-[var(--text-muted)]">
              <p className="text-xl md:text-2xl leading-relaxed font-light">
                Pursuing <span className="text-white">Computer Science</span> & <span className="text-white">Data Science</span> at Western University.
              </p>
              <p className="text-lg md:text-xl leading-relaxed font-light border-l border-white/10 pl-6">
                Building <span className="text-[var(--accent-cyan)]">cool things.</span> Mastering <span className="text-[var(--accent-cyan)]">5</span> instruments on the side.
              </p>
            </div>
          </div>

          {/* SECTION 2: CINEMATIC VIEWFINDER (PHOTOS) */}
          <div 
            className="mb-32 relative w-full h-[450px] md:h-[550px] border border-white/10 bg-[#050505] rounded-xl overflow-hidden group shadow-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentPhotoIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                style={{ backgroundImage: `url('${image.src}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />
            <button onClick={handlePrevPhoto} className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={handleNextPhoto} className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-end justify-center pb-6">
              <div className="flex gap-2">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${currentPhotoIndex === idx ? 'w-8 md:w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION DIVIDER (Removed the ID from here!) */}
          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
            <h1 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-white uppercase">PROJECTS AND HACKATHONS</h1>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* DASHBOARD LAYOUT (Added the ID here! This brings the scroll wheel into perfect view) */}
          <div id="projects" className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 w-full pb-20 scroll-mt-6">
            
            {/* LEFT COLUMN: Vertical Category Filter */}
            <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-56 shrink-0 overflow-x-auto lg:overflow-x-hidden pb-4 lg:pb-0 pt-2 scrollbar-hide border-b lg:border-b-0 border-white/5 lg:border-l lg:pl-6">
              <span className="hidden lg:block font-mono text-[9px] text-[var(--text-muted)] tracking-widest mb-4 uppercase">
                // Filter Projects
              </span>
              {categories.map((category) => (
                <button
                  key={category}
                  title={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentProjectIndex(0); 
                  }}
                  className={`px-4 py-3 font-mono text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 text-left truncate rounded-r-lg ${
                    activeCategory === category
                      ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] shadow-[inset_15px_0_15px_-15px_rgba(34,211,238,0.2)]'
                      : 'bg-transparent text-[var(--text-muted)] border-l-2 border-transparent hover:text-white hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* RIGHT COLUMN: Terminal Container */}
            <div className="flex-1 flex flex-col w-full min-w-0">
              
              <div className="relative w-full h-[550px] md:h-[600px] bg-[#050505] border border-[var(--accent-cyan)]/20 rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(34,211,238,0.05)] transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]">
                
                {/* ABSOLUTE TOP-RIGHT BUTTONS */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2 md:gap-3">
                  {filteredProjects.length > 0 && filteredProjects[currentProjectIndex].liveUrl && (
                    <a 
                      href={filteredProjects[currentProjectIndex].liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 backdrop-blur-md rounded-full text-[9px] md:text-[10px] uppercase font-mono tracking-widest hover:bg-[var(--accent-cyan)]/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                      Live ↗
                    </a>
                  )}

                  {filteredProjects.length > 0 && filteredProjects[currentProjectIndex].githubUrl && (
                    <a 
                      href={filteredProjects[currentProjectIndex].githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-black/40 text-white border border-white/20 backdrop-blur-md rounded-full text-[9px] md:text-[10px] uppercase font-mono tracking-widest hover:bg-black/60 hover:border-white/40 transition-all"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 pt-16 md:p-10 md:pt-10 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                  <AnimatePresence mode="wait">
                    {filteredProjects.length > 0 && (
                      <motion.div
                        key={filteredProjects[currentProjectIndex].id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10"
                      >
                        
                        <div className="flex-1 flex flex-col justify-center w-full">
                          <div className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-widest mb-4 flex items-center gap-3">
                            <span>{filteredProjects[currentProjectIndex].id}</span>
                            <span className="text-white/20">//</span>
                            <span>{filteredProjects[currentProjectIndex].category}</span>
                          </div>
                          
                          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 md:mb-6">
                            {filteredProjects[currentProjectIndex].title}
                          </h3>
                          
                          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl font-light mb-6">
                            {filteredProjects[currentProjectIndex].description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {filteredProjects[currentProjectIndex].stack.map((tech, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] md:text-xs text-[var(--accent-violet)] hover:border-[var(--accent-violet)]/50 hover:bg-[var(--accent-violet)]/10 transition-all duration-300 cursor-default">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Media Terminal */}
                        <div className="w-full lg:w-[45%] xl:w-[50%] aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.15)] relative group shrink-0 bg-[#050505] transition-all duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.25)] hover:border-white/20">
                          
                          {filteredProjects[currentProjectIndex].videoUrl ? (
                            <video 
                              src={filteredProjects[currentProjectIndex].videoUrl} 
                              playsInline 
                              controls
                              className="absolute inset-0 w-full h-full object-cover z-10"
                            />
                          ) : filteredProjects[currentProjectIndex].imageUrl ? (
                            <div 
                              className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
                              style={{ backgroundImage: `url('${filteredProjects[currentProjectIndex].imageUrl}')` }}
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/10 m-4 rounded">
                              <span className="font-mono text-xs text-[var(--text-muted)] animate-pulse">
                                  AWAITING_MEDIA_PAYLOAD...
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BOTTOM: Scroll Wheel Dial */}
                <div className="h-28 md:h-36 w-full relative flex items-center justify-center overflow-hidden border-t border-white/5 bg-gradient-to-t from-[#0a0a0a] to-transparent shrink-0">
                  <div className="absolute w-[2px] h-full bg-[var(--accent-cyan)]/20 z-0 pointer-events-none" />
                  <div className="relative w-full h-full flex items-center justify-center mt-2">
                    {filteredProjects.map((project, index) => {
                      const style = getDialStyle(index);
                      return (
                        <motion.div
                          key={project.id}
                          animate={{ x: style.x, scale: style.scale, opacity: style.opacity, zIndex: style.zIndex }}
                          transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          onClick={() => setCurrentProjectIndex(index)}
                          className={`absolute w-32 h-16 md:w-36 md:h-20 rounded-lg cursor-pointer flex flex-col items-center justify-center p-3 transition-colors duration-300 ${
                            currentProjectIndex === index ? 'bg-black border border-[var(--accent-cyan)] shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'bg-[#111] border border-white/5 hover:border-white/20'
                          }`}
                          style={{ originX: 0.5, originY: 0.5 }}
                        >
                          <span className={`font-mono text-[9px] md:text-[10px] tracking-widest mb-1 ${currentProjectIndex === index ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                            {project.id}
                          </span>
                          <span className={`text-[9px] md:text-[10px] font-bold text-center line-clamp-2 ${currentProjectIndex === index ? 'text-white' : 'text-white/40'}`}>
                            {project.title}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="w-full flex flex-col items-center justify-center pb-32 pt-10 text-center border-t border-white/5 scroll-mt-24">
           <span className="font-mono text-xs text-[var(--accent-cyan)] tracking-widest uppercase mb-2">// INIT_CONNECTION</span>
           <span className="text-[var(--text-muted)] text-sm">Contact Module Standby.</span>
        </div>

      </div>

      {/* Floating Back to Top Button (With Hover Expansion) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => handleScroll(e, 'home')}
            className="group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center p-3 md:p-4 rounded-full bg-black/60 border border-white/10 text-[var(--accent-cyan)] shadow-lg backdrop-blur-md hover:bg-black hover:border-[var(--accent-cyan)] transition-all overflow-hidden"
            aria-label="Back to top"
          >
            <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-[max-width,opacity,margin] duration-500 ease-in-out font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">
              Back to Home
            </span>
          </motion.button>
        )}
      </AnimatePresence>

    </main>
  );
}