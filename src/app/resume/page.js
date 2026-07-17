"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion";

const resumeData = {
  header: {
    name: "Oladele Magbadelo",
    title: "EXPLORER // DEVELOPER",
    status: "BSc. CS, Minor Data Sci @ Western University '28",
  },
  skills: [
    { category: "LANGUAGES & FRAMEWORKS", items: ["Python", "JavaScript", "TypeScript", "PostgreSQL", "Java", "HTML/CSS", "R", "C", "React", "Next.js", "Express.js", "Flask", "Tailwind CSS"] },
    { category: "DEVELOPER TOOLS", items: ["Git", "GitHub", "GitHub Actions (CI/CD)", "Docker", "Nginx", "Supabase", "REST APIs", "MSW", "VS Code", "Figma", "Notion"] },
    { category: "DATA LIBRARIES", items: ["PyTorch", "TensorFlow", "Keras", "NumPy", "Pandas", "Matplotlib", "Seaborn"] },
    { category: "OTHER CAPABILITIES", items: ["Computer Vision", "Sound Engineering", "Event Management", "Arabic", "Microsoft Office Suite"] }
  ],
  experience: [
    {
      id: "EXP_01",
      role: "AI & Software Developer Intern",
      company: "PurelyBiome",
      date: "May 2026 - Present",
      location: "Remote",
      points: [
        "Built a computer vision pipeline to grade acne severity from user facial images, fine-tuning an EfficientNet CNN in PyTorch/TensorFlow with a two-phase transfer-learning strategy to reach 95.5% validation accuracy and 100% accuracy on a held-out set of 50 real customer images.",
        "Engineered the end-to-end customer reporting interface using Next.js and Supabase, building interactive data visualizations that translate complex biological JSON payloads into actionable microbiome insights for active beta testers."
      ]
    },
    {
      id: "EXP_02",
      role: "Software Developer",
      company: "3D Western",
      date: "Jun. 2026 - Present",
      location: "London, ON",
      points: [
        "Built the frontend data and API layer for a 3D-printing lab management dashboard (Next.js, TypeScript, React) launching to production in August 2026, delivering typed contracts and API client wrappers across booking and job-tracking features.",
        "Implemented an equipment booking system spanning ~9 REST endpoints (availability, create, cancel, admin override, capacity, and approval requests) with server-side conflict and capacity handling, plus a job-tracking layer surfacing ETA, pickup, and status history across four job types.",
        "Developed against a Mock Service Worker (MSW) layer to build and test data flows in parallel with the backend team, added unit and end-to-end tests, and wired reusable hooks into the UI to eliminate duplicate fetch logic."
      ]
    },
    {
      id: "EXP_03",
      role: "VP of Projects",
      company: "Western Founders Network",
      date: "Sep. 2025 - Present",
      location: "London, ON",
      points: [
        "Promoted from Projects Director to VP of Projects (Apr. 2026); design and run a technical curriculum (VS Code, Git/GitHub, JavaScript, project architecture) that onboards student builders from setup to a functioning full-stack prototype.",
        "Coordinate a team of directors through a sprint-based build cycle toward Demo Day showcases, providing hands-on mentorship on version control, API integration, and shipping working software."
      ]
    },
    {
      id: "EXP_04",
      role: "Marketing Director",
      company: "Western Engineering AutoPilot",
      date: "Sep. 2025 - Present",
      location: "London, ON",
      points: [
        "Spearheaded digital outreach and cross-functional branding strategies within the communications team, driving a consistent digital presence across messaging platforms to scale engagement and reach over 100+ university students.",
        "Managed design pipelines and user-facing digital assets, utilizing iterative feedback loops and product delivery methodologies to launch marketing campaigns within tight deadline constraints."
      ]
    },
    {
      id: "EXP_05",
      role: "Facilities Asset Management Intern",
      company: "RCCG HOP",
      date: "Jun. 2022 - Aug. 2022",
      location: "Calgary, AB",
      points: [
        "Digitized and inputted detailed data on up to 50 key church assets into the Upkeep CMMS to support accurate maintenance tracking and recordkeeping.",
        "Digitalized and organized church maintenance records, including plumbing, electrical, and audiovisual system maps, using Microsoft Office Suite for streamlined access and documentation."
      ]
    }
  ],
  projects: [
    {
      id: "PRJ_01",
      title: "Internship Alert Pipeline",
      stack: "Python, GitHub Actions, REST APIs",
      date: "Jul. 2026",
      points: [
        "Built an automated job-monitoring pipeline that aggregates ~720 postings per run across 5 sources, normalizes and deduplicates them by URL, and routes new or reopened roles through a 3-tier classifier by target company and location.",
        "Deployed on a 15-minute GitHub Actions cron with committed state for reliable change detection, delivering filtered alerts through push notifications and email with fuzzy company matching to avoid missed or duplicate roles."
      ]
    },
    {
      id: "PRJ_02",
      title: "Distributed URL Shortener",
      stack: "Flask, Docker, Nginx, Redis",
      date: "Apr. 2026",
      points: [
        "Architected a highly available URL shortening web application on DigitalOcean, containerizing an Nginx reverse proxy, Redis cache, and Python backend with Docker to ensure a clean separation of concerns.",
        "Optimized system throughput to support 500 concurrent users by tuning Gunicorn thread workers and implementing PgBouncer connection pooling for PostgreSQL, sustaining 520+ requests per second with a 0% error rate."
      ]
    },
    {
      id: "PRJ_03",
      title: "Mustang Wrapped",
      stack: "Spotify API, Supabase, React, SQL",
      date: "Oct. 2025 - Present",
      points: [
        "Developed a full-stack social analytics web application by integrating the Spotify Web API with a React frontend and Supabase backend, securely normalizing and storing real-time user listening history.",
        "Uncovered community-level music trends by writing complex SQL queries to clean, aggregate, and normalize raw JSON data, successfully processing over 100 top tracks among university club members to deliver personalized comparative dashboards."
      ]
    },
    {
      id: "PRJ_04",
      title: "UofTHacks: Flowlytics",
      stack: "Python, Mesa, TypeScript, React",
      date: "Jan. 2026",
      points: [
        "Built a customer traffic simulation and analytics dashboard by integrating a Python-based Mesa model with a React/TypeScript frontend, providing real-time space utilization metrics for retail environments.",
        "Spearheaded spatial data analysis by writing Python scripts to simulate foot traffic and generate heat maps, processing 10,000+ simulated agent movements to identify store dead zones within a strict 48-hour hackathon window."
      ]
    }
  ],
  education: [
    {
      id: "EDU_01",
      degree: "Bachelor of Science in Computer Science, Minor in Data Science",
      school: "Western University",
      date: "Sep. 2024 - May 2028",
      details: "Recipient of the Carmeta Thelma Hodges Scholarship Award ($6000 CAD) and Western Admission Scholarship ($2500 CAD)."
    },
    {
      id: "EDU_02",
      degree: "High School Diploma",
      school: "Gems American Academy",
      date: "Aug. 2023 - May 2024",
      details: "High Honours, Male Athlete of the Year (Basketball MVP)."
    }
  ]
};

export default function ResumePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };

    window.addEventListener('scroll', handleScrollEvent);
    handleScrollEvent();
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen w-full flex flex-row bg-[#050505] font-sans selection:bg-[#22d3ee] selection:text-black relative">
      
      <nav className="sticky top-0 h-screen w-12 md:w-20 shrink-0 flex flex-col items-center justify-center bg-[#0a0a0a] border-r border-white/5 z-50">
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-[#666666]">
          <Link href="/#home" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Home</Link>
          <Link href="/#projects" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Projects</Link>
          <Link href="/resume" className="text-[#22d3ee] uppercase cursor-pointer border-l-2 border-[#22d3ee] pr-2 rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Resume</Link>
          <Link href="/music" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Music</Link>
          <Link href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: 'vertical-rl' }}>Contact</Link>
        </div>
      </nav>

      <div className="flex-1 min-w-0 bg-[#050505] relative overflow-x-hidden">
        <div className="px-6 md:px-16 lg:px-24 py-16 md:py-24 max-w-7xl mx-auto w-full z-10 flex flex-col lg:flex-row gap-16">
          
          <div className="w-full lg:w-1/3 space-y-12 lg:sticky lg:top-24 h-fit">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">{resumeData.header.name}</h1>
              <p className="font-mono text-xs tracking-widest text-[#22d3ee] mb-4">{resumeData.header.title}</p>
              <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] text-[#666666]">{resumeData.header.status}</div>
            </div>

            <a href="/Oladele_Magbadelo_Resume.pdf" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-[#0c0c0c] border border-white/10 text-white font-mono text-sm px-6 py-4 w-full block transition-all hover:border-[#22d3ee] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-md">
              <span className="relative z-10 flex items-center justify-between">
                <span>{`> EXPORT_PDF`}</span>
                <span className="text-[#666666] text-xs">99_KB</span>
              </span>
              <div className="absolute top-0 left-0 h-full bg-[#22d3ee] w-0 group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-10" />
            </a>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] text-[#666666]">SKILLS</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <div className="space-y-6">
                {resumeData.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h3 className="font-mono text-[10px] tracking-widest text-[#8b5cf6] mb-3 uppercase">[{skillGroup.category}]</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 text-white text-xs rounded-full hover:bg-white/10 transition-colors cursor-default">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 lg:pl-10 lg:border-l border-white/5 space-y-16 pb-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">EXPERIENCE</h2>
              </div>
              <div className="space-y-12 relative border-l border-white/10 ml-1">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[#666666] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[#22d3ee]" />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{exp.role}</h3>
                      <span className="font-mono text-[10px] text-[#666666] whitespace-nowrap">{exp.date}</span>
                    </div>
                    <div className="font-mono text-xs text-[#22d3ee] mb-4">{exp.company} // {exp.location}</div>
                    <ul className="space-y-3">
                      {exp.points.map((point, i) => (
                        <li key={i} className="text-white/75 leading-relaxed flex items-start text-sm">
                          <span className="text-[#8b5cf6] mr-3 font-mono mt-0.5">{`>`}</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">PROJECTS</h2>
              </div>
              <div className="space-y-12 relative border-l border-white/10 ml-1">
                {resumeData.projects.map((prj) => (
                  <div key={prj.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[#666666] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[#22d3ee]" />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{prj.title}</h3>
                      <span className="font-mono text-[10px] text-[#666666] whitespace-nowrap">{prj.date}</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#666666] mb-4 flex flex-wrap gap-2">STACK: <span className="text-[#8b5cf6]">{prj.stack}</span></div>
                    <ul className="space-y-3">
                      {prj.points.map((point, i) => (
                        <li key={i} className="text-white/75 leading-relaxed flex items-start text-sm">
                          <span className="text-[#8b5cf6] mr-3 font-mono mt-0.5">{`>`}</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">EDUCATION</h2>
              </div>
              <div className="space-y-10 relative border-l border-white/10 ml-1">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[#666666] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[#8b5cf6]" />
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-lg font-bold text-white tracking-tight">{edu.degree}</h3>
                      <span className="font-mono text-[10px] text-[#666666] whitespace-nowrap">{edu.date}</span>
                    </div>
                    <div className="font-mono text-xs text-[#8b5cf6] mb-2">{edu.school}</div>
                    <p className="text-white/75 leading-relaxed text-sm">{edu.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="contact" className="w-full flex flex-col items-center justify-center pb-32 pt-20 border-t border-white/5 scroll-mt-24 relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50" />
           <span className="font-mono text-[10px] text-[#22d3ee] tracking-[0.3em] uppercase mb-4">// Lets Work Together</span>
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 tracking-tight">Contact Information</h2>
           <div className="flex flex-wrap justify-center gap-6 md:gap-10">
             <a href="mailto:oj.magbadelo@gmail.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#22d3ee] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                 <svg className="w-8 h-8 md:w-10 md:h-10 text-[#666666] group-hover:text-[#22d3ee] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               </div>
               <span className="font-mono text-[9px] md:text-[10px] text-[#666666] tracking-widest uppercase group-hover:text-[#22d3ee] transition-colors">Email</span>
             </a>
             <a href="https://www.linkedin.com/in/oladele-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#22d3ee] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                 <svg className="w-8 h-8 md:w-10 md:h-10 text-[#666666] group-hover:text-[#22d3ee] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
               </div>
               <span className="font-mono text-[9px] md:text-[10px] text-[#666666] tracking-widest uppercase group-hover:text-[#22d3ee] transition-colors">LinkedIn</span>
             </a>
             <a href="https://github.com/Omjnr06" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#22d3ee] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                 <svg className="w-8 h-8 md:w-10 md:h-10 text-[#666666] group-hover:text-[#22d3ee] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
               </div>
               <span className="font-mono text-[9px] md:text-[10px] text-[#666666] tracking-widest uppercase group-hover:text-[#22d3ee] transition-colors">GitHub</span>
             </a>
             <a href="https://devpost.com/oj-magbadelo" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#22d3ee] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                 <svg className="w-8 h-8 md:w-10 md:h-10 text-[#666666] group-hover:text-[#22d3ee] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"></polygon></svg>
               </div>
               <span className="font-mono text-[9px] md:text-[10px] text-[#666666] tracking-widest uppercase group-hover:text-[#22d3ee] transition-colors">Devpost</span>
             </a>
             <a href="https://www.instagram.com/magbadelojr/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#22d3ee] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                 <svg className="w-8 h-8 md:w-10 md:h-10 text-[#666666] group-hover:text-[#22d3ee] group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               </div>
               <span className="font-mono text-[9px] md:text-[10px] text-[#666666] tracking-widest uppercase group-hover:text-[#22d3ee] transition-colors">Instagram</span>
             </a>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={scrollToTop} className="group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center p-3 md:p-4 rounded-full bg-black/60 border border-white/10 text-[#22d3ee] shadow-lg backdrop-blur-md hover:bg-black hover:border-[#22d3ee] transition-all overflow-hidden" aria-label="Back to top">
            <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-[max-width,opacity,margin] duration-500 ease-in-out font-mono text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:ml-2">Back to Top</span>
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}