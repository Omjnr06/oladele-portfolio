"use client";
import React from "react";
import Link from "next/link";

export default function MusicSidebar() {
  return (
    <div className="mv-sidebar-dock group">
      <div className="mv-sidebar-edge" aria-hidden="true" />
      <nav
        aria-label="Site navigation"
        className="mv-sidebar absolute left-0 top-0 h-screen w-12 md:w-20 shrink-0 flex flex-col items-center justify-center bg-(--bg-surface) border-r border-white/5"
      >
        <div className="flex flex-col items-center gap-16 text-[10px] font-mono font-bold tracking-[0.3em] text-(--text-muted)">
          <Link href="/#home" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: "vertical-rl" }}>Home</Link>
          <Link href="/#projects" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: "vertical-rl" }}>Projects</Link>
          <Link href="/resume" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: "vertical-rl" }}>Resume</Link>
          <Link href="/music" className="uppercase cursor-pointer rotate-180 block text-(--accent-cyan) border-l-2 border-(--accent-cyan) pr-2" style={{ writingMode: "vertical-rl" }}>Music</Link>
          <Link href="/#contact" className="hover:text-white transition-colors uppercase cursor-pointer rotate-180 block" style={{ writingMode: "vertical-rl" }}>Contact</Link>
        </div>
      </nav>
    </div>
  );
}