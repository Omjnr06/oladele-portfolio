"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const myName = "Oladele Magbadelo";
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL"); 

  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const savedScrollY = useRef(0);
  // FIX: gate createPortal behind a mounted flag — document is undefined during SSR
  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => setPortalMounted(true), []);

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
  // AS projects come just add more objects of this
  const projects = [
    {
      id: "PROJECT 00",
      title: "Mustang Wrapped",
      category: "FULL STACK",
      stack: ["Spotify API", "Supabase","Express.js", "React", "SQL"],
      description: "Data-driven social platform integrating the Spotify Web API with a Supabase backend. Shows Univeristy community-level music trends and insights by complex SQL aggregation.",
      liveUrl: "", 
      githubUrl: "https://github.com/tudor-filimon/mustangs-wrapped",
      videoUrl: "/mustang-demo.mp4",
      imageUrl: "",
      imageDisplay: "cover"
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
      imageUrl: "/images/distributed-shortener-diagram.jpg",
      imageDisplay: "contain" 
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
      imageUrl: "/images/flowlytics-ui.png",
      imageDisplay: "cover" 
    },
    {
      id: "PROJECT 03",
      title: "SpaceFinder AI",
      category: "MACHINE LEARNING",
      stack: ["YOLOv8", "Flask", "OpenCV", "Bootstrap", "Python"],
      description: "A full-stack web application developed in a team of 4 that detects parking space availability from uploaded images. Key contributions included fine-tuning a custom YOLOv8 model using test-time augmentation for maximum detection recall, designing the responsive Bootstrap UI, and building the Flask backend with OpenCV for real-time inference and server-side image processing.",
      liveUrl: "",
      githubUrl: "https://github.com/Omjnr06/SpaceFinder",
      videoUrl: "",
      imageUrl: "/images/SpacefinderAI-output.jpg",
      imageDisplay: "cover" 
    }
  ];

  // Porject Filters
  const categories = ["ALL", ...new Set(projects.map((p) => p.category))];
  const filteredProjects = activeCategory === "ALL" 
    ? projects 
    : projects.filter((p) => p.category === activeCategory);
  

  // Math controls for gallery length
  const handlePrevPhoto = () => setCurrentPhotoIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  const handleNextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length);

  // Automatic Scroll math for pictures
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

// For a href linking
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

  // FIX: lock body scroll without losing position — save scrollY, pin body with negative top offset
  useEffect(() => {
    if (selectedImage) {
      savedScrollY.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY.current);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [selectedImage]);

// Smooth Scroll Helper to go from section to section within same page
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
      
      {/* Always visibile Sidebar Nav */}
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

          <Link href="/resume" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>
            Resume
          </Link>

          <button className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>
            Music
          </button>


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

      {/* Main Content Area DIV*/}
      <div className="flex-1 min-w-0 bg-journal-dots bg-[#050505] relative overflow-x-hidden">
        
        {/* Ambient Glows LINES */}
        <div className="absolute left-10 h-full w-[1px] bg-[var(--accent-cyan)] opacity-20 pointer-events-none hidden md:block z-0" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-cyan)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="px-6 md:px-16 lg:px-24 w-full z-10 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">
          
          {/* Top Section: STATEMENT & BIO */}
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
                Building <span className="text-[var(--accent-cyan)]">cool things.</span> Jamming <span className="text-[var(--accent-cyan)]">along the way.</span>
              </p>
            </div>
          </div>

          {/* Section #2: THIS is the code for the Photo Gallery */}
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

          {/* Section Divider Lines */}
          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
            <h1 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-white uppercase">PROJECTS AND HACKATHONS</h1>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* Dashboard Layout */}
          <div id="projects" className="flex flex-col items-start gap-6 w-full pb-20 scroll-mt-6">
            
            {/* Filtering Map based on category*/}
            <div className="flex flex-row items-center gap-3 w-full overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
              <span className="hidden md:block font-mono text-[13px] text-[var(--text-muted)] tracking-widest uppercase mr-2">
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
                  className={`shrink-0 px-5 py-2 font-mono text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 rounded-full border ${
                    activeCategory === category
                      ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)] shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'bg-transparent text-[var(--text-muted)] border-white/10 hover:text-white hover:bg-white/5 hover:border-white/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/*  Terminal Container FOR Projects and Project Media */}
            <div className="w-full relative h-[550px] md:h-[600px] bg-[#0a0a0a] border border-[var(--accent-cyan)]/30 rounded-xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.2)]">
              
              {/* View Live and Github Redirect Buttons */}
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
                      className="min-h-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10 pt-2"
                    >
                      
                      <div className="flex-1 flex flex-col justify-start w-full">
                        <div className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-widest mb-4 flex items-center gap-3 mt-1">
                          <span>{filteredProjects[currentProjectIndex].id}</span>
                          <span className="text-white/20">//</span>
                          <span>{filteredProjects[currentProjectIndex].category}</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 md:mb-6">
                          {filteredProjects[currentProjectIndex].title}
                        </h3>
                        
                        <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl font-light mb-6">
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

                      {/* Media (Video or Photo) */}
                      <div className="w-full lg:w-[50%] xl:w-[55%] aspect-video rounded-xl overflow-hidden border border-[var(--accent-cyan)]/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative group shrink-0 bg-[#050505] transition-all duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.2)] hover:border-[var(--accent-cyan)]/40 mt-1">
                        
                        {filteredProjects[currentProjectIndex].videoUrl ? (
                          <video 
                            src={filteredProjects[currentProjectIndex].videoUrl} 
                            playsInline 
                            controls
                            className="absolute inset-0 w-full h-full object-cover z-10"
                          />
                        ) : filteredProjects[currentProjectIndex].imageUrl ? (
                          
                          <div 
                            className={`absolute inset-0 w-full h-full bg-center bg-no-repeat z-10 cursor-zoom-in ${filteredProjects[currentProjectIndex].imageDisplay === 'contain' ? 'bg-contain p-2' : 'bg-cover'}`}
                            style={{ backgroundImage: `url('${filteredProjects[currentProjectIndex].imageUrl}')` }}
                            onClick={() => setSelectedImage(filteredProjects[currentProjectIndex].imageUrl)}
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

              {/*  Scroll Wheel Dial */}
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
                          currentProjectIndex === index ? 'bg-[#0a0a0a] border border-[var(--accent-cyan)] shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-[#111] border border-white/5 hover:border-white/20'
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

          {/* (Contact Section) */}
          <div id="contact" className="w-full flex flex-col items-center justify-center pb-32 pt-20 border-t border-white/5 scroll-mt-24 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50" />
             
             <span className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase mb-4">
               // Lets Work Together
             </span>
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 tracking-tight">Contact Information</h2>

             <div className="flex flex-wrap justify-center gap-6 md:gap-10">
               
               {/* EMAIL */}
               <a href="mailto:oj.magbadelo@gmail.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                     <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                     <polyline points="22,6 12,13 2,6"></polyline>
                   </svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Email</span>
               </a>

               {/* LINKEDIN */}
               <a href="https://www.linkedin.com/in/oladele-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                     <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                     <rect x="2" y="9" width="4" height="12"></rect>
                     <circle cx="4" cy="4" r="2"></circle>
                   </svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">LinkedIn</span>
               </a>

               {/* GITHUB */}
               <a href="https://github.com/Omjnr06" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                     <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                   </svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">GitHub</span>
               </a>

               {/* DEVPOST */}
               <a href="https://devpost.com/oj-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                     <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"></polygon>
                   </svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Devpost</span>
               </a>

               {/* INSTAGRAM */}
               <a href="https://www.instagram.com/magbadelojr/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                     <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                   </svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Instagram</span>
               </a>

             </div>
          </div>

        </div>

        {/* Back to Top Button */}
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

        {/* Code for Modal for images that are in projects*/}
        {portalMounted && createPortal(
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 backdrop-blur-md"
                onClick={() => setSelectedImage(null)}
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
                    <img
                      src={selectedImage}
                      alt="Project preview"
                      className="w-full h-auto object-contain rounded-xl border border-[var(--accent-cyan)]/20 shadow-[0_0_60px_rgba(34,211,238,0.15)]"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] border border-white/10 text-[var(--text-muted)] hover:text-white hover:border-[var(--accent-cyan)] transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      </div>

    </main>
  );
}