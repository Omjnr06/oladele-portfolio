"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { musicLibrary } from "./music/data/musicLibrary";
import Image from 'next/image';

export default function Home() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL"); 

  const [activeSection, setActiveSection] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const savedScrollY = useRef(0);
  const [portalMounted, setPortalMounted] = useState(false);
  useEffect(() => setPortalMounted(true), []);

  const galleryImages = [
    { src: "/assets/images/junior-headshot.JPG" },
    { src: "/assets/images/junior-statue.jpeg" },
    { src: "/assets/images/junior-food.jpeg" },
    { src: "/assets/images/junior-basketball.jpg" },
    { src: "/assets/images/junior-guitar.jpeg" },
    { src: "/assets/images/junior-boat.jpeg" },
    { src: "/assets/images/junior-soccer.JPG" },
  ];

  const projects = [
    {
      id: "PROJECT 00",
      title: "Mustang Wrapped",
      category: "FULL STACK",
      stack: ["Spotify API", "Supabase","Express.js", "React", "SQL"],
      description: "Data driven social platform integrating the Spotify Web API with a Supabase backend. Shows Univeristy community-level music trends and insights by complex SQL aggregation.",
      liveUrl: "", 
      githubUrl: "https://github.com/tudor-filimon/mustangs-wrapped",
      videoUrl: "https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/mustang-demo.mp4",
      imageUrl: "",
      imageDisplay: "cover",
      isFeatured: false,
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
      imageUrl: "/assets/images/distributed-shortener-diagram.jpg",
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
      imageUrl: "/assets/images/flowlytics-ui.png",
      imageDisplay: "cover" 
    },
    {
      id: "PROJECT 03",
      title: "SpaceFinder AI",
      category: "MACHINE LEARNING",
      stack: ["YOLOv8", "Flask", "OpenCV", "Bootstrap", "Python"],
      description: "A full stack web application developed in a team of 4 that detects parking space availability from uploaded images. Key contributions included fine tuning a custom YOLOv8 model using test time augmentation for maximum detection recall, designing the responsive Bootstrap UI, and building the Flask backend with OpenCV for real time inference and server side image processing.",
      liveUrl: "",
      githubUrl: "https://github.com/Omjnr06/SpaceFinder",
      videoUrl: "",
      imageUrl: "/assets/images/SpacefinderAI-output.jpg",
      imageDisplay: "cover" 
    },
    {
      id: "PROJECT 04",
      title: "PimpleNet",
      category: "MACHINE LEARNING",
      isInternship: true,
      stack: ["Python", "CNNs", "EfficientNetB0", "Transfer Learning"],
      description: "Developed a deep learning acne severity classifier to enhance microbiome based skincare personalization. Fine tuned an EfficientNetB0 model achieving 95.5% validation accuracy on real world customer images.",
      caseStudyUrl: "/projects/pimplenet",
      videoUrl: "",
      imageUrl: "/assets/images/pimplenetthumbnail.png",
      imageDisplay: "cover",
      isFeatured: true,
      featuredRank: 1,
    },
    {
      id: "PROJECT 05",
      title: "JAM",
      category: ["FULL STACK", "SYSTEM INFRASTRUCTURE"],
      stack: ["React Native", "Expo", "TypeScript", "GraphQL", "Node.js", "Better Auth"],
      description: "A location based discovery app connecting university and local musicians. Users post short video clips as a living portfolio, get surfaced to others nearby, and send contextual jam requests that open a direct chat. Frontend built and running on a mock data layer, with the GraphQL/Postgres backend in progress.",
      caseStudyUrl: "/projects/jam",
      videoUrl: "/assets/jam-frontend-video.mp4",
      imageUrl: "/assets/images/jam/jam-homepage.png",
      imageDisplay: "contain",
      mediaOrientation: "portrait",
    },
    {
      id: "PROJECT 06",
      title: "Internship Alert Pipeline",
      category: "SYSTEM INFRASTRUCTURE",
      stack: ["Python", "GitHub Actions", "REST APIs", "ntfy", "Resend", "Notion"],
      description: "Automated job monitoring pipeline aggregating ~720 postings per run across 5 sources. Dedupes by URL and routes new or reopened roles through a 3-tier classifier by target company and location, delivering filtered push and email alerts on a 15 minute GitHub Actions cron. A one tap action logs applied roles to a Notion tracker, and a companion job auto enriches a LeetCode question tracker with the companies that ask each leetcode problem.",
      githubUrl: "https://github.com/Omjnr06/Grind",
      videoUrl: "",
      imageUrl: "/assets/images/grind-pipeline.png",
      imageDisplay: "cover",
      liveUrl: "/grind"
    },
      {
      id: "PROJECT 07",
      title: "The Vault - AI Financial Dashboard",
      category: ["FULL STACK", "DATA SCIENCE"],
      stack: ["Next.js","TypeScript", "Python", "FAST API", "Plaid", "BetterAuth", "Neon", "Resend", "SQLModel"],
      description: "Personal finance dashboard with real bank sync (Plaid), a forward looking budgeting engine, and cross language auth between Next.js and FastAPI. In active development.",
      githubUrl: "https://github.com/Omjnr06/ai-financial-dashboard",
      videoUrl: "",
      imageUrl: "/assets/images/financial-dashboard/dashboard-desktop.png",
      imageDisplay: "cover",
      caseStudyUrl: "/projects/vault",
      isFeatured: true,
      featuredRank: 2,
    },
  ];

  const asCats = (c) => Array.isArray(c) ? c : [c];
  const categories = ["ALL", ...new Set(projects.flatMap((p) => asCats(p.category)))];
  const filteredProjects = activeCategory === "ALL" 
    ? projects 
    : projects.filter((p) => asCats(p.category).includes(activeCategory));
  
  const handlePrevPhoto = () => setCurrentPhotoIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  const handleNextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length);

  useEffect(() => {
    if (isPaused) return; 
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [isPaused, galleryImages.length]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

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

  const [spotlightMode, setSpotlightMode] = useState("TECH"); 
  const [featuredTechIndex, setFeaturedTechIndex] = useState(0);
  const [featuredMusicIndex, setFeaturedMusicIndex] = useState(0);
  const [isSpotlightHovered, setIsSpotlightHovered] = useState(false);

  // Featured projects ordered by featuredRank (lower = first; unranked fall to the end)
  const featuredProjects = projects.filter(p => p.isFeatured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  
  const rawFeaturedMusic = musicLibrary.flatMap(category => category.tracks).filter(track => track.isFeatured);
  const featuredMusicTracks = rawFeaturedMusic.length > 0 ? rawFeaturedMusic : [musicLibrary[0].tracks[0]];
  const hasMultipleSpotlights = spotlightMode === "TECH" ? featuredProjects.length > 1 : featuredMusicTracks.length > 1;

  useEffect(() => {
    if (isSpotlightHovered) return;
    
    const length = spotlightMode === "TECH" ? featuredProjects.length : featuredMusicTracks.length;
    if (length <= 1) return;
    
    const timer = setInterval(() => {
      if (spotlightMode === "TECH") {
        setFeaturedTechIndex((prev) => (prev + 1) % length);
      } else {
        setFeaturedMusicIndex((prev) => (prev + 1) % length);
      }
    }, 12000); 
    
    return () => clearInterval(timer);
  }, [spotlightMode, featuredProjects.length, featuredMusicTracks.length, isSpotlightHovered]);

  const handleNextSpotlight = (e) => {
    e.stopPropagation();
    if (spotlightMode === "TECH") {
      setFeaturedTechIndex(prev => (prev + 1) % featuredProjects.length);
    } else {
      setFeaturedMusicIndex(prev => (prev + 1) % featuredMusicTracks.length);
    }
  };

  const handlePrevSpotlight = (e) => {
    e.stopPropagation();
    if (spotlightMode === "TECH") {
      setFeaturedTechIndex(prev => prev === 0 ? featuredProjects.length - 1 : prev - 1);
    } else {
      setFeaturedMusicIndex(prev => prev === 0 ? featuredMusicTracks.length - 1 : prev - 1);
    }
  };

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
      
      <nav className="sticky top-0 h-screen w-12 md:w-20 shrink-0 flex flex-col items-center justify-center bg-[var(--bg-surface)] border-r border-white/5 z-50">
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-[var(--text-muted)]">
          <a href="#home" onClick={(e) => handleScroll(e, 'home')} className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'home' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} style={{ writingMode: 'vertical-rl' }}>Home</a>
          <a href="#projects" onClick={(e) => handleScroll(e, 'projects')} className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'projects' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} style={{ writingMode: 'vertical-rl' }}>Projects</a>
          <Link href="/resume" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Resume</Link>
          <Link href="/music" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Music</Link>
          <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className={`uppercase cursor-pointer rotate-180 block transition-colors ${activeSection === 'contact' ? 'text-[var(--accent-cyan)] border-l-2 border-[var(--accent-cyan)] pr-2' : 'hover:text-white'}`} style={{ writingMode: 'vertical-rl' }}>Contact</a>
        </div>
      </nav>

      <div className="flex-1 min-w-0 bg-journal-dots bg-[#050505] relative overflow-x-hidden">
        
        <div className="absolute left-10 h-full w-[1px] bg-[var(--accent-cyan)] opacity-20 pointer-events-none hidden md:block z-0" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-cyan)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="px-6 md:px-16 lg:px-24 w-full z-10 py-16 md:py-24 max-w-7xl mx-auto flex flex-col">
          
          <div id="home" className="mb-16 scroll-mt-24">
            <h1 className="text-[2.8rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[7rem] font-extrabold mb-8 md:mb-10 tracking-tight flex flex-wrap gap-x-3 md:gap-x-5 overflow-visible pl-1 md:pl-2">
              <div className="flex">
                {"Oladele".split("").map((letter, index) => (
                  <span key={`first-${index}`} className="hover-letter animate-scan" style={{ animationDelay: `${index * 0.06}s` }}>
                    {letter}
                  </span>
                ))}
              </div>
              <div className="flex">
                {"Magbadelo".split("").map((letter, index) => (
                  <span key={`last-${index}`} className="hover-letter animate-scan" style={{ animationDelay: `${(index + 8) * 0.06}s` }}>
                    {letter}
                  </span>
                ))}
              </div>
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

          <motion.div 
            className="mb-32 relative w-full h-[450px] md:h-[550px] border border-white/10 bg-[#050505] rounded-xl overflow-hidden group shadow-2xl cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              const swipeThreshold = 50;
              if (offset.x < -swipeThreshold) handleNextPhoto();
              else if (offset.x > swipeThreshold) handlePrevPhoto();
            }}
          >
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${currentPhotoIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <Image
                  src={image.src}
                  alt={`Gallery snapshot ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0} 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1200px"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] z-20 pointer-events-none" />
            
            <button onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }} className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }} className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isPaused ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-end justify-center pb-6 pointer-events-none">
              <div className="flex gap-2">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-500 pointer-events-auto ${currentPhotoIndex === idx ? 'w-8 md:w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>


          {/* --- SPOTLIGHT SECTION --- */}
          <div className="w-full flex flex-col mb-32 scroll-mt-24" id="spotlight">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6] animate-pulse" />
                <h2 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-white uppercase">Spotlight</h2>
              </div>

              <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-full p-1 shadow-lg w-full md:w-auto">
                <button 
                  onClick={() => setSpotlightMode("TECH")}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    spotlightMode === "TECH" 
                      ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Tech
                </button>
                <button 
                  onClick={() => setSpotlightMode("MUSIC")}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    spotlightMode === "MUSIC" 
                      ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Music
                </button>
              </div>
            </div>

            {/* Spotlight Display */}
            <div 
              className="w-full h-[500px] md:h-[600px] bg-[#050505] border border-white/10 rounded-2xl overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.8)] group"
              onMouseEnter={() => setIsSpotlightHovered(true)}
              onMouseLeave={() => setIsSpotlightHovered(false)}
            >
              
              {/* Navigation Arrows (Only show if there are multiple items) */}
              {hasMultipleSpotlights && (
                <>
                  <button onClick={handlePrevSpotlight} className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isSpotlightHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button onClick={handleNextSpotlight} className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/70 hover:scale-110 ${isSpotlightHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </>
              )}

              <AnimatePresence mode="wait">
                
                {/* --- TECH SPOTLIGHT --- */}
                {spotlightMode === "TECH" && featuredProjects.length > 0 && (
                  <motion.div 
                    key={`tech-${featuredTechIndex}`}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <div className="absolute inset-0 z-0">
                      {featuredProjects[featuredTechIndex].mediaOrientation === 'portrait' ? (
                        <div 
                          className="w-full h-full bg-cover bg-center blur-2xl scale-125 opacity-30"
                          style={{ backgroundImage: `url('${featuredProjects[featuredTechIndex].imageUrl}')` }}
                        />
                      ) : featuredProjects[featuredTechIndex].videoUrl ? (
                        <video 
                          src={featuredProjects[featuredTechIndex].videoUrl}
                          preload="metadata"
                          autoPlay muted loop playsInline 
                          className="w-full h-full object-cover opacity-40"
                        />
                      ) : (
                        <div 
                          className="w-full h-full bg-cover bg-center opacity-30"
                          style={{ backgroundImage: `url('${featuredProjects[featuredTechIndex].imageUrl}')` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/50 to-transparent" />
                      {featuredProjects[featuredTechIndex].mediaOrientation === 'portrait' && (
                        <div className="hidden md:block absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 h-[380px] lg:h-[440px] aspect-[9/19] rounded-[2rem] overflow-hidden border border-[var(--accent-cyan)]/20 shadow-[0_0_50px_rgba(34,211,238,0.15)] bg-[#050505] z-[5] pointer-events-none">
                          {featuredProjects[featuredTechIndex].videoUrl ? (
                            <video src={featuredProjects[featuredTechIndex].videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${featuredProjects[featuredTechIndex].imageUrl}')` }} />
                          )}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12">
                      <div className={`max-w-3xl ${featuredProjects[featuredTechIndex].mediaOrientation === 'portrait' ? 'md:max-w-[52%] lg:max-w-[55%]' : ''}`}>
                        <div className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-widest mb-4 flex items-center gap-3 flex-wrap">
                          {featuredProjects[featuredTechIndex].isInternship && (
                            <>
                              <span className="text-[#8b5cf6] font-bold tracking-widest bg-[#8b5cf6]/10 px-2 py-0.5 rounded border border-[#8b5cf6]/20">INTERNSHIP</span>
                              <span className="text-white/20">//</span>
                            </>
                          )}
                          {asCats(featuredProjects[featuredTechIndex].category).map((c, i) => (
                            <React.Fragment key={c}>
                              {i > 0 && <span className="text-white/20">//</span>}
                              <span>{c}</span>
                            </React.Fragment>
                          ))}
                        </div>
                        
                        <h3 className="text-3xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
                          {featuredProjects[featuredTechIndex].title}
                        </h3>
                        
                        <p className="text-white/70 text-sm md:text-lg leading-relaxed font-light mb-8 line-clamp-3 md:line-clamp-none">
                          {featuredProjects[featuredTechIndex].description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 md:gap-4 pb-8 md:pb-0">
                          {featuredProjects[featuredTechIndex].caseStudyUrl && (
                            <Link href={featuredProjects[featuredTechIndex].caseStudyUrl} className="px-5 py-2.5 md:px-6 md:py-3 bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30 backdrop-blur-md rounded shadow-[0_0_15px_rgba(139,92,246,0.2)] text-[9px] md:text-xs uppercase font-mono tracking-widest hover:bg-[#8b5cf6]/30 hover:-translate-y-1 transition-all">
                              Read Case Study ↗
                            </Link>
                          )}

                          {featuredProjects[featuredTechIndex].liveUrl ? (
                            <a href={featuredProjects[featuredTechIndex].liveUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 md:px-6 md:py-3 bg-white/5 text-white border border-white/20 backdrop-blur-md rounded text-[9px] md:text-xs uppercase font-mono tracking-widest hover:bg-white/10 hover:-translate-y-1 transition-all">
                              Live ↗
                            </a>
                          ) : featuredProjects[featuredTechIndex].githubUrl ? (
                            <a href={featuredProjects[featuredTechIndex].githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 md:px-6 md:py-3 bg-white/5 text-white border border-white/20 backdrop-blur-md rounded text-[9px] md:text-xs uppercase font-mono tracking-widest hover:bg-white/10 hover:-translate-y-1 transition-all">
                              View Source ↗
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {featuredProjects.length > 1 && (
                      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
                        {featuredProjects.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setFeaturedTechIndex(idx); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              featuredTechIndex === idx ? 'w-8 bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]' : 'w-2 bg-white/20 hover:bg-white/50 cursor-pointer'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* --- MUSIC SPOTLIGHT --- */}
                {spotlightMode === "MUSIC" && featuredMusicTracks.length > 0 && (
                  <motion.div 
                    key={`music-${featuredMusicIndex}`}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <div className="absolute inset-0 z-0">
                      <video 
                        src={featuredMusicTracks[featuredMusicIndex].videoUrl}
                        preload="metadata" 
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover opacity-50 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-[#020202]/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/60 to-transparent" />
                    </div>

                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12">
                      <div className="max-w-3xl">
                        <div className="font-mono text-[10px] text-[#8b5cf6] tracking-widest mb-4 flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span>LIVE SESSION</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-6xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
                          {featuredMusicTracks[featuredMusicIndex].title}
                        </h3>
                        
                        <p className="text-[#8b5cf6] font-mono text-[10px] md:text-sm tracking-widest uppercase mb-6">
                          Original By // {featuredMusicTracks[featuredMusicIndex].originalArtist}
                        </p>

                        <p className="text-white/70 text-sm md:text-base leading-relaxed font-light mb-8 italic border-l border-white/20 pl-4 hidden md:block">
                          "{featuredMusicTracks[featuredMusicIndex].notes}"
                        </p>
                        
                        <Link href={`/music?track=${featuredMusicTracks[featuredMusicIndex].id}`} className="inline-flex px-5 py-2.5 md:px-6 md:py-3 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 backdrop-blur-md rounded shadow-[0_0_15px_rgba(34,211,238,0.2)] text-[9px] md:text-xs uppercase font-mono tracking-widest hover:bg-[var(--accent-cyan)]/30 hover:-translate-y-1 transition-all mb-4 md:mb-0">
                          View in Music Vault ↗
                        </Link>
                      </div>
                    </div>
                    
                    {featuredMusicTracks.length > 1 && (
                      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex gap-2">
                        {featuredMusicTracks.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setFeaturedMusicIndex(idx); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              featuredMusicIndex === idx ? 'w-8 bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]' : 'w-2 bg-white/20 hover:bg-white/50 cursor-pointer'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
  

          <div className="flex items-center gap-4 mb-8 md:mb-12">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
            <h1 className="font-mono text-xl md:text-2xl tracking-[0.3em] text-white uppercase">PROJECTS AND HACKATHONS</h1>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div id="projects" className="flex flex-col items-start gap-6 w-full pb-20 scroll-mt-6">
            <div className="flex flex-row items-center gap-3 w-full overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
              <span className="hidden md:block font-mono text-[13px] text-[var(--text-muted)] tracking-widest uppercase mr-2">// Filter Projects</span>
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

            <div className="w-full relative h-[550px] md:h-[600px] bg-[#0a0a0a] border border-[var(--accent-cyan)]/30 rounded-xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.2)]">
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex gap-2 md:gap-3">
                {filteredProjects.length > 0 && filteredProjects[currentProjectIndex].caseStudyUrl && (
                  <Link href={filteredProjects[currentProjectIndex].caseStudyUrl} className="px-4 py-2 bg-[#8b5cf6]/20 text-[#fdfdfd] border border-[#8b5cf6]/30 backdrop-blur-md rounded-full text-[9px] md:text-[10px] uppercase font-mono tracking-widest hover:bg-[#8b5cf6]/30 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    View More 
                  </Link>
                )}
                {filteredProjects.length > 0 && filteredProjects[currentProjectIndex].liveUrl && (
                  <a href={filteredProjects[currentProjectIndex].liveUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 backdrop-blur-md rounded-full text-[9px] md:text-[10px] uppercase font-mono tracking-widest hover:bg-[var(--accent-cyan)]/30 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    Live ↗
                  </a>
                )}
                {filteredProjects.length > 0 && filteredProjects[currentProjectIndex].githubUrl && (
                  <a href={filteredProjects[currentProjectIndex].githubUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-black/40 text-white border border-white/20 backdrop-blur-md rounded-full text-[9px] md:text-[10px] uppercase font-mono tracking-widest hover:bg-black/60 hover:border-white/40 transition-all">
                    GitHub ↗
                  </a>
                )}
              </div>

              <div className="flex-1 p-6 pt-16 md:p-10 md:pt-10 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                <AnimatePresence mode="wait">
                  {filteredProjects.length > 0 && (
                    <motion.div
                      key={filteredProjects[currentProjectIndex].id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10 pt-2 cursor-grab active:cursor-grabbing"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(e, { offset }) => {
                        const swipeThreshold = 50;
                        if (offset.x < -swipeThreshold) {
                          if (currentProjectIndex < filteredProjects.length - 1) setCurrentProjectIndex(prev => prev + 1);
                        } else if (offset.x > swipeThreshold) {
                          if (currentProjectIndex > 0) setCurrentProjectIndex(prev => prev - 1);
                        }
                      }}
                    >
                      <div className="flex-1 flex flex-col justify-start w-full pointer-events-none">
                        <div className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-widest mb-4 flex items-center gap-3 mt-1 flex-wrap">
                          <span>{filteredProjects[currentProjectIndex].id}</span>
                          {filteredProjects[currentProjectIndex].isInternship && (
                            <>
                              <span className="text-white/20">//</span>
                              <span className="text-[#8b5cf6] font-bold tracking-widest bg-[#8b5cf6]/10 px-2 py-0.5 rounded border border-[#8b5cf6]/20">INTERNSHIP</span>
                            </>
                          )}
                          <span className="text-white/20">//</span>
                          {asCats(filteredProjects[currentProjectIndex].category).map((c, i) => (
                            <React.Fragment key={c}>
                              {i > 0 && <span className="text-white/20">//</span>}
                              <span>{c}</span>
                            </React.Fragment>
                          ))}
                        </div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 md:mb-6">
                          {filteredProjects[currentProjectIndex].title}
                        </h3>
                        <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl font-light mb-6">
                          {filteredProjects[currentProjectIndex].description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {filteredProjects[currentProjectIndex].stack.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] md:text-xs text-[var(--accent-violet)] transition-all duration-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={`${filteredProjects[currentProjectIndex].mediaOrientation === 'portrait' ? 'w-auto h-[380px] md:h-[440px] lg:h-[480px] aspect-[9/19] mx-auto rounded-[2rem]' : 'w-full lg:w-[50%] xl:w-[55%] aspect-video rounded-xl'} overflow-hidden border border-[var(--accent-cyan)]/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative group shrink-0 bg-[#050505] transition-all duration-500 hover:shadow-[0_0_60px_rgba(34,211,238,0.2)] hover:border-[var(--accent-cyan)]/40 mt-1 pointer-events-auto`}>
                        {filteredProjects[currentProjectIndex].videoUrl ? (
                          <video src={filteredProjects[currentProjectIndex].videoUrl} playsInline className="absolute inset-0 w-full h-full object-cover z-10" {...(filteredProjects[currentProjectIndex].mediaOrientation === 'portrait' ? { autoPlay: true, muted: true, loop: true } : { controls: true, preload: "metadata" })} />
                        ) : filteredProjects[currentProjectIndex].imageUrl ? (
                          <div 
                            className={`absolute inset-0 w-full h-full bg-center bg-no-repeat z-10 cursor-zoom-in ${filteredProjects[currentProjectIndex].imageDisplay === 'contain' ? 'bg-contain p-6' : 'bg-cover'}`}
                            style={{ backgroundImage: `url('${filteredProjects[currentProjectIndex].imageUrl}')` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(filteredProjects[currentProjectIndex].imageUrl);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/10 m-4 rounded pointer-events-none">
                            <span className="font-mono text-xs text-[var(--text-muted)] animate-pulse">AWAITING_MEDIA_PAYLOAD...</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                        <span className={`font-mono text-[9px] md:text-[10px] tracking-widest mb-1 ${currentProjectIndex === index ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>{project.id}</span>
                        <span className={`text-[9px] md:text-[10px] font-bold text-center line-clamp-2 ${currentProjectIndex === index ? 'text-white' : 'text-white/40'}`}>{project.title}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div id="contact" className="w-full flex flex-col items-center justify-center pb-32 pt-20 border-t border-white/5 scroll-mt-24 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50" />
             <span className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase mb-4">// Lets Work Together</span>
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 tracking-tight">Contact Information</h2>

             <div className="flex flex-wrap justify-center gap-6 md:gap-10 max-w-[280px] sm:max-w-[400px] md:max-w-none mx-auto">
               <a href="mailto:oj.magbadelo@gmail.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Email</span>
               </a>
               <a href="https://www.linkedin.com/in/oladele-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">LinkedIn</span>
               </a>
               <a href="https://github.com/Omjnr06" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">GitHub</span>
               </a>
               <a href="https://devpost.com/oj-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"></polygon></svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Devpost</span>
               </a>
               <a href="https://www.instagram.com/magbadelojr/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden">
                   <svg className="w-8 h-8 md:w-10 md:h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-cyan)] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                 </div>
                 <span className="font-mono text-[9px] md:text-[10px] text-[var(--text-muted)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">Instagram</span>
               </a>
             </div>
          </div>
        </div>

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
                    <img src={selectedImage} alt="Project preview" className="w-full h-auto object-contain rounded-xl border border-[var(--accent-cyan)]/20 shadow-[0_0_60px_rgba(34,211,238,0.15)]" />
                    <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] border border-white/10 text-[var(--text-muted)] hover:text-white hover:border-[var(--accent-cyan)] transition-all">
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