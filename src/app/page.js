import React from "react";

export default function Home() {
  const myName = "Oladele Magbadelo";

  return (
    <main className="min-h-screen w-full flex bg-[var(--bg-base)] font-sans selection:bg-[var(--accent-cyan)] selection:text-black">
      
      {/* Sidebar Navigation */}
      <nav className="hidden lg:flex w-20 flex-col items-center py-12 border-r border-white/5 bg-[var(--bg-surface)] z-20">
        <div className="flex flex-col gap-16 text-[10px] font-bold tracking-[0.3em] text-[var(--text-muted)] rotate-180" style={{ writingMode: 'vertical-rl' }}>
          <button className="hover:text-white transition-colors uppercase cursor-pointer">Resume</button>
          <button className="hover:text-white transition-colors uppercase cursor-pointer">Music</button>
          <button className="text-white uppercase cursor-pointer border-l-2 border-[var(--accent-cyan)] pr-2">Projects</button>
        </div>
      </nav>

      <div className="flex-1 bg-premium-grid relative flex items-center overflow-hidden">
        <div className="px-8 md:px-20 lg:px-32 w-full z-10">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-[var(--accent-cyan)]" />
            <h2 className="text-[var(--accent-cyan)] tracking-[0.2em] text-xs md:text-sm font-bold uppercase">
              System Architecture & Sound Engineering
            </h2>
          </div>

          {/* Name Header - 4s Wave */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[7rem] font-extrabold mb-10 tracking-tight flex whitespace-nowrap overflow-visible pl-2">
            {myName.split("").map((letter, index) => (
              <span 
                key={index} 
                className="hover-letter animate-scan"
                style={{ 
                  animationDelay: `${index * 0.06}s` 
                }}
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
              Engineering <span className="text-[var(--accent-cyan)]">scalable applications</span> and mastering 5 instruments.
            </p>
          </div>
          
          {/* Action Interface */}
          <div className="flex flex-col sm:flex-row gap-6 mt-16">
            <button className="group relative px-10 py-5 bg-white text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95">
              View Mustang Wrapped ↗
            </button>
            <button className="px-10 py-5 border border-white/10 text-white font-bold rounded-full hover:bg-white/5 transition-all hover:border-white/30">
              Explore Infrastructure
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}