"use client";
import React from "react";
import { useRouter } from "next/navigation";

// ==============================================================================
// DATA LAYER: Update this object when your resume changes.
// ==============================================================================
const resumeData = {
  header: {
    name: "Oladele Magbadelo",
    title: "EXPLORER // SYSTEMS_ENGINEER",
    status: "STATUS: BSc. CS @ Western University '28",
  },
  skills: [
    { category: "LANGUAGES_&_FRAMEWORKS", items: ["Python", "JavaScript", "PostgreSQL", "Java", "C", "React.js", "Express.js", "Flask"] },
    { category: "DEVELOPER_TOOLS", items: ["Git", "Docker", "Nginx", "Oracle Cloud", "Figma", "Notion"] },
    { category: "DATA_LIBRARIES", items: ["NumPy", "Matplotlib", "Seaborn"] },
    { category: "OTHER_CAPABILITIES", items: ["Sound Engineering", "Event Management", "Arabic"] }
  ],
  experience: [
    {
      id: "EXP_04",
      role: "Facilities Asset Management Intern",
      company: "RCCG HOP",
      date: "Jun. 2022 - Aug. 2022",
      location: "Calgary, AB",
      points: [
        "Digitized and inputted detailed data on up to 50 key church assets into the Upkeep CMMS to support accurate maintenance tracking and recordkeeping.",
        "Digitalized and organized church maintenance records, including plumbing, electrical, and audiovisual system maps, using Microsoft Office Suite for streamlined access and documentation."
      ]
    },
    {
      id: "EXP_02",
      role: "Projects Director",
      company: "Western Founders Network",
      date: "Sep. 2025 - Present",
      location: "London, ON",
      points: [
        "Collaborated on developing full stack applications using technologies such as Node, React, Express, Supabase, and GitHub, applying real-world practices such as API Integration, version control, and feature deployment."
      ]
    },
    {
      id: "EXP_03",
      role: "Marketing Director",
      company: "Western Engineering AutoPilot",
      date: "Sep. 2025 - Present",
      location: "London, ON",
      points: [
        "Worked in WEAP's Communications Team to ensure a clear, consistent, and engaging brand voice across all digital platforms while spearheading design and social outreach initiatives for effective promotion."
      ]
    },
    {
      id: "EXP_01",
      role: "Technical Co-Founder",
      company: "Ableo Solutions",
      date: "Jan. 2026 - Present",
      location: "London, ON",
      points: [
        "Architected a multi-page agency web app using React.js, Vite, and React Router to market AI solutions.",
        "Integrated the Chatbase REST API via asynchronous fetch for real-time, interactive AI product demos.",
        "Managed CI/CD and deployment via GitHub and Vercel, configuring custom DNS and SSL certification."
      ]
    }
  ],
  projects: [
    {
      id: "PRJ_01",
      title: "Distributed URL Shortener (MLH Hackathon)",
      stack: "Flask, Docker, Nginx, Oracle Cloud, Neon",
      date: "Apr. 2026",
      points: [
        "Architected a highly available web application on DigitalOcean, containerizing an Nginx reverse proxy, Redis cache, and Python backend with Docker to ensure clean separation of concerns.",
        "Optimized system throughput to support 500 concurrent users by tuning Gunicorn thread workers and implementing PgBouncer connection pooling for PostgreSQL, sustaining 520+ requests per second with a 0% error rate."
      ]
    },
    {
      id: "PRJ_02",
      title: "UofTHacks: Flowlytics",
      stack: "Python, Mesa, TypeScript, React, Gemini API",
      date: "Jan. 2026",
      points: [
        "Conducted data analysis using Python to simulate customer traffic and generate heat maps, successfully identifying densely populated areas and store 'dead zones'."
      ]
    },
    {
      id: "PRJ_03",
      title: "Mustang Wrapped",
      stack: "Spotify API, Supabase, React, SQL, Figma",
      date: "Oct. 2025 - Present",
      points: [
        "Worked in a team of 4 to develop a full stack data driven social platform web app by integrating the Spotify Web API with a Supabase backend to normalize and store real-time user listening history.",
        "Developed comparative analytics by writing complex SQL queries to clean, aggregate, and normalize raw real-time user data from the Spotify API. Uncovered community-level music trends and insights, allowing users to visualize and compare their tastes."
      ]
    }
  ],
  education: [
    {
      id: "EDU_01",
      degree: "BSc Computer Science, Minor in Data Science",
      school: "Western University",
      date: "Sep. 2024 - May 2028",
      details: "Recipient of the Carmeta Thelma Hodges Scholarship Award ($6000 CAD) and Western Admission Scholarship ($2500 CAD)."
    },
    {
      id: "EDU_02",
      degree: "High School Diploma",
      school: "Gems American Academy (Doha, Qatar)",
      date: "Aug. 2023 - May 2024",
      details: "High Honours, Male Athlete of the Year (Basketball MVP)."
    }
  ]
};

// ==============================================================================
// PRESENTATION LAYER: The UI / Blueprint Engine
// ==============================================================================
export default function ResumePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full flex bg-[var(--bg-base)] font-sans selection:bg-[var(--accent-cyan)] selection:text-black">
      
      {/* Sidebar Nav*/}
      <nav className="hidden lg:flex w-20 flex-col items-center justify-center bg-[var(--bg-surface)] perforation-line z-20 fixed h-screen top-0 left-0">
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-[var(--text-muted)]">
          <button 
            onClick={() => router.push('/')} 
            className="hover:text-white transition-colors uppercase cursor-pointer rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Projects
          </button>
          
          <button 
            className="hover:text-white transition-colors uppercase cursor-pointer rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Music
          </button>
          
          <button 
            onClick={() => router.push('/resume')} 
            className="text-[var(--accent-cyan)] uppercase cursor-pointer border-l-2 border-[var(--accent-cyan)] pr-2 rotate-180" 
            style={{ writingMode: 'vertical-rl' }}
          >
            Resume
          </button>
        </div>
      </nav>

      {/* Main Canvas - Offset by lg:ml-20 to account for fixed sidebar */}
      <div className="flex-1 bg-journal-dots relative overflow-y-auto overflow-x-hidden ml-0 lg:ml-20">
        
        {/* Ambient Glows */}
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none fixed" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[var(--accent-cyan)] opacity-[0.02] rounded-full blur-[120px] pointer-events-none fixed" />

        <div className="px-6 md:px-16 lg:px-24 py-16 md:py-24 max-w-7xl mx-auto w-full z-10 flex flex-col lg:flex-row gap-16">
          
          {/* LEFT COLUMN: System Status & Skills (Sticky) */}
          <div className="w-full lg:w-1/3 space-y-12 lg:sticky lg:top-24 h-fit">
            
            {/* Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                {resumeData.header.name}
              </h1>
              <p className="font-mono text-xs tracking-widest text-[var(--accent-cyan)] mb-4">
                {resumeData.header.title}
              </p>
              <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] text-[var(--text-muted)]">
                {resumeData.header.status}
              </div>
            </div>

            {/* The Export Button - Now an active link to your PDF */}
            <a 
              href="/Oladele_Magbadelo_Resume.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative overflow-hidden bg-[#0c0c0c] border border-white/10 text-white font-mono text-sm px-6 py-4 w-full block transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-md"
            >
              <span className="relative z-10 flex items-center justify-between">
                <span>{`> EXPORT_PDF`}</span>
                <span className="text-[var(--text-muted)] text-xs">142_KB</span>
              </span>
              <div className="absolute top-0 left-0 h-full bg-[var(--accent-cyan)] w-0 group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-10" />
            </a>

            {/* Skills Engine */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] text-[var(--text-muted)]">SYS_CAPABILITIES</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              
              <div className="space-y-6">
                {resumeData.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h3 className="font-mono text-[10px] tracking-widest text-[var(--accent-violet)] mb-3 uppercase">
                      [{skillGroup.category}]
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 text-[var(--text-main)] text-xs rounded-full hover:bg-white/10 transition-colors cursor-default">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Execution Logs */}
          <div className="w-full lg:w-2/3 lg:pl-10 lg:border-l border-white/5 space-y-16 pb-24">
            
            {/* Experience Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">EXECUTION_LOGS</h2>
              </div>

              <div className="space-y-12 relative border-l border-white/10 ml-1">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[var(--text-muted)] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[var(--accent-cyan)]" />
                    
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{exp.role}</h3>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] whitespace-nowrap">{exp.date}</span>
                    </div>
                    
                    <div className="font-mono text-xs text-[var(--accent-cyan)] mb-4">
                      {exp.company} // {exp.location}
                    </div>

                    <ul className="space-y-3">
                      {exp.points.map((point, i) => (
                        <li key={i} className="text-[var(--text-muted)] font-light leading-relaxed flex items-start text-sm">
                          <span className="text-[var(--accent-violet)] mr-3 font-mono mt-0.5">{`>`}</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">SYS_PROJECTS</h2>
              </div>

              <div className="space-y-12 relative border-l border-white/10 ml-1">
                {resumeData.projects.map((prj) => (
                  <div key={prj.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[var(--text-muted)] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[var(--accent-cyan)]" />
                    
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{prj.title}</h3>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] whitespace-nowrap">{prj.date}</span>
                    </div>
                    
                    <div className="font-mono text-[10px] text-[var(--text-muted)] mb-4 flex flex-wrap gap-2">
                       STACK: <span className="text-[var(--accent-violet)]">{prj.stack}</span>
                    </div>

                    <ul className="space-y-3">
                      {prj.points.map((point, i) => (
                        <li key={i} className="text-[var(--text-muted)] font-light leading-relaxed flex items-start text-sm">
                          <span className="text-[var(--accent-violet)] mr-3 font-mono mt-0.5">{`>`}</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-violet)] shadow-[0_0_10px_var(--accent-violet)]" />
                <h2 className="font-mono text-sm tracking-[0.2em] text-white">BASE_ARCHITECTURE</h2>
              </div>

              <div className="space-y-10 relative border-l border-white/10 ml-1">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="relative pl-8">
                    <div className="absolute w-3 h-3 bg-[#0a0a0a] border-2 border-[var(--text-muted)] rounded-full -left-[6.5px] top-1.5 transition-colors hover:border-[var(--accent-violet)]" />
                    
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="text-lg font-bold text-white tracking-tight">{edu.degree}</h3>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] whitespace-nowrap">{edu.date}</span>
                    </div>
                    
                    <div className="font-mono text-xs text-[var(--accent-violet)] mb-2">
                      {edu.school}
                    </div>

                    <p className="text-[var(--text-muted)] font-light leading-relaxed text-sm">
                      {edu.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}