"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SEGMENTS = ["Overview", "Demo", "Architecture", "Design", "Docs & Code"];

const STACK = [
  "React Native (Expo)", "TypeScript", "Expo Router", "Zustand", "expo-video",
  "GraphQL (Apollo)", "Node / Express", "Neon Postgres", "Redis (Upstash)",
  "Cloudflare R2", "Better Auth", "Nginx", "Docker",
];

const HIGHLIGHTS = [
  {
    title: "Global state with Zustand",
    body: "A persisted Zustand store (theme, profile, clips) that all viewable components call the color scheme from. The splash screen is gated on a hydration flag so the persisted theme is loaded based on the users system (if your on dark mode on your phone the app will load in dark mode).",
  },
  {
    title: "A single central mock layer",
    body: "Every screen is powered by one mock (hub sections, people, conversations, messages). This let me build and iterate the entire UI before any backend exists, and each mock maps cleanly onto a future GraphQL query or mutation.",
  },
  {
    title: "Reusable media playback",
    body: "A expo video player (app/player/[id].tsx) is reused across the feed and profile, with a brand overlay chrome and a Jam request bottom sheet.",
  },
  {
    title: "Everything handles its edge states",
    body: "Loading, empty, and error cases are handled across the app. A compression overlay on upload, empty inbox placeholders, failed load fallbacks to give the user a premium custom feel.",
  },
];

const WIREFRAMES = [
  { src: "/assets/images/jam/jam-landing-page.png", label: "Landing" },
  { src: "/assets/images/jam/jam-create-account.png", label: "Create Account" },
  { src: "/assets/images/jam/jam-sign-in-page.png", label: "Sign In" },
  { src: "/assets/images/jam/jam-homepage.png", label: "The Hub" },
  { src: "/assets/images/jam/jam-add-clips.png", label: "Add Post" },
  { src: "/assets/images/jam/jam-messages.png", label: "Messages" },
  { src: "/assets/images/jam/jam-user-page.png", label: "Profile" },
  { src: "/assets/images/jam/jam-video-player.png", label: "Player" },
];


const SCHEMA = [
  {
    group: "Auth: Better Auth",
    managed: true,
    tables: [
      { name: "ba_user", cols: [["id", "text"], ["email", "varchar"], ["email_verified", "bool"], ["name", "varchar"], ["image", "varchar"]] },
      { name: "ba_session", cols: [["id", "text"], ["user_id", "text"], ["token", "varchar"], ["expires_at", "timestamp"]] },
      { name: "ba_account", cols: [["id", "text"], ["user_id", "text"], ["provider_id", "varchar"], ["account_id", "varchar"], ["password", "varchar"]] },
      { name: "ba_verification", cols: [["id", "text"], ["identifier", "varchar"], ["value", "varchar"], ["expires_at", "timestamp"]] },
    ],
  },
  {
    group: "Core",
    tables: [
      { name: "profiles", cols: [["user_id", "text (→ba_user)"], ["username", "varchar"], ["bio", "text"], ["instagram_handle", "varchar?"], ["hub_location", "varchar"], ["intents", "varchar[]"], ["featured_clip_id", "uuid?"], ["spotify_top_artists", "json"], ["deleted_at", "ts?"]] },
      { name: "clips", cols: [["id", "uuid"], ["user_id", "text"], ["video_url", "varchar (R2)"], ["thumbnail_url", "varchar"], ["title", "varchar"], ["description", "text?"], ["tags", "varchar[]"], ["duration", "int"], ["is_featured", "bool"], ["deleted_at", "ts?"]] },
    ],
  },
  {
    group: "Taxonomy — user identity",
    tables: [
      { name: "instruments", cols: [["id", "serial"], ["name", "varchar"]] },
      { name: "genres", cols: [["id", "serial"], ["name", "varchar"]] },
      { name: "user_instruments", cols: [["user_id", "text"], ["instrument_id", "int"]] },
      { name: "user_genres", cols: [["user_id", "text"], ["genre_id", "int"]] },
    ],
  },
  {
    group: "Social",
    tables: [
      { name: "jam_requests", cols: [["id", "uuid"], ["sender_id", "text"], ["receiver_id", "text"], ["clip_id", "uuid?"], ["initial_message", "text"], ["idempotency_key", "uuid"], ["status", "varchar"]] },
      { name: "conversations", cols: [["id", "uuid"], ["jam_request_id", "uuid"], ["user_a_id", "text"], ["user_b_id", "text"], ["deleted_at", "ts?"]] },
      { name: "messages", cols: [["id", "uuid"], ["conversation_id", "uuid"], ["sender_id", "text"], ["body", "text"], ["deleted_at", "ts?"]] },
    ],
  },
  {
    group: "Moderation & System",
    tables: [
      { name: "blocks", cols: [["id", "uuid"], ["blocker_id", "text"], ["blocked_id", "text"]] },
      { name: "reports", cols: [["id", "uuid"], ["reporter_id", "text"], ["reported_id", "text"], ["reason", "varchar"], ["status", "varchar"]] },
      { name: "notifications", cols: [["id", "uuid"], ["recipient_id", "text"], ["actor_id", "text"], ["type", "varchar"], ["entity_id", "uuid"], ["read_at", "ts?"]] },
    ],
  },
];

const ERD_PDF = "/assets/images/jam/JamAppERD.png";
const SKETCHES_PDF = "/assets/Jam-App-Design-Drawings.pdf";
const COLOR_IMG = "/assets/images/jam/Color-Scheme-Jam-App.png";
const DEMO_VIDEO = "/assets/jam-frontend-video.mp4";
const REPO = "https://github.com/Omjnr06/Jam";

function SectionTitle({ color, children }) {
  return (
    <h2 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color }}>
      <span className="text-white/30">{">"}</span> {children}
    </h2>
  );
}

export default function JamCaseStudy() {
  const [active, setActive] = useState("Overview");
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[var(--accent-cyan)] selection:text-black relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-journal-dots opacity-80" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-violet)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Back nav */}
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12 font-mono text-[10px] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Projects
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="font-mono text-[10px] text-[#8b5cf6] tracking-[0.3em] uppercase bg-[#8b5cf6]/10 px-3 py-1 rounded border border-[#8b5cf6]/20">
              Personal Project
            </span>
            <span className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase">
              // Mobile · React Native · GraphQL
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">JAM</h1>
          <p className="text-xl text-white/60 font-light leading-relaxed max-w-2xl">
            A location-based discovery app that connects university and local musicians. Find bandmates and jam partners who share your instruments, taste, and goals.
          </p>

          {/* Current Stage badge */}
          <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-wide px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            CURRENT STAGE: Frontend complete · Mock data · Backend in progress
          </div>
        </motion.div>

        {/* Pill switcher */}
        <div className="mb-8 flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#0a0a0a] border border-white/10 w-fit">
          {SEGMENTS.map((seg) => (
            <button
              key={seg}
              onClick={() => setActive(seg)}
              className={`relative px-4 py-2 rounded-lg font-mono text-xs tracking-wide transition-colors ${active === seg ? "text-black" : "text-white/50 hover:text-white/80"}`}
            >
              {active === seg && (
                <motion.span layoutId="activePill" className="absolute inset-0 rounded-lg bg-[var(--accent-cyan)]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{seg}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-10 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 font-mono text-[10px] text-white/30 tracking-widest">
              jam__{active.toLowerCase().replace(/[^a-z]/g, "_")}.tsx
            </span>
          </div>

          <div className="p-6 md:p-10 font-mono text-sm leading-relaxed text-white/80 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {active === "Overview" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">The Directive</SectionTitle>
                    <p className="mb-4">
                      From experience, finding people to make music with is a genuinely unorganized, annoying experience. The process is scattered across social media group chats, cold reach outs,  paper flyers, and word of mouth. JAM simplifies it. Musicians post short video clips as a living portfolio, get surfaced to others in their area, and send a contextual "Jam Request" tied to a specific clip or profile. Accepted requests open a direct conversation.
                    </p>
                    <p className="mb-8">
                      I designed and built the frontend. Onboarding, the discovery Hub, a fullscreen video player, the upload flow, profiles, and a three-state inbox. It all runs  on a mock data layer while the backend is built in parallel.
                    </p>
                    <SectionTitle color="#8b5cf6">Stack</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {STACK.map((s) => (
                        <span key={s} className="font-mono text-[11px] px-3 py-1 rounded border border-white/10 bg-white/[0.03] text-white/70 transition-colors cursor-default hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)]">{s}</span>
                      ))}
                    </div>
                  </section>
                )}

                {active === "Demo" && (
                  <section>
                    <SectionTitle color="#4ade80">Live Walkthrough</SectionTitle>
                    <p className="mb-6 text-white/60">A 57-second run through the current build. The Hub, fullscreen player, jam requests, and the inbox. Running on mock data.</p>
                    <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 max-w-sm mx-auto" onClick={() => setExpanded(true)}>
                      <video src={DEMO_VIDEO} autoPlay muted loop playsInline className="w-full block" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] tracking-widest uppercase bg-black/60 px-3 py-1.5 rounded border border-white/20">
                          Click to expand
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {active === "Architecture" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">Engineering Decisions</SectionTitle>
                    <ul className="space-y-5 list-none mb-10">
                      {HIGHLIGHTS.map((h) => (
                        <li key={h.title} className="pl-4 border-l-2 border-[var(--accent-cyan)]/30">
                          <span className="text-white font-bold">{h.title}.</span>
                          <br />
                          <span className="text-white/70">{h.body}</span>
                        </li>
                      ))}
                    </ul>

                    <SectionTitle color="#8b5cf6">Data Model</SectionTitle>
                    <p className="mb-6 text-white/60">
                      Postgres (Neon) with Better Auth as Auth manager. Instruments, genres, and intents are user level junction tables so discovery can filter on them cleanly.
                    </p>
                    <div className="space-y-8">
                      {SCHEMA.map((grp) => (
                        <div key={grp.group}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{grp.group}</span>
                            {grp.managed && <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-yellow-400/30 text-yellow-300/80">not seeded</span>}
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {grp.tables.map((t) => (
                              <div key={t.name} className="rounded-lg border border-white/10 bg-black/40 overflow-hidden transition-colors hover:border-[var(--accent-cyan)]/40">
                                <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/10 font-mono text-[12px] text-[var(--accent-cyan)]">{t.name}</div>
                                <div className="p-3 space-y-1">
                                  {t.cols.map(([c, ty]) => (
                                    <div key={c} className="flex justify-between gap-3 font-mono text-[11px]">
                                      <span className="text-white/70">{c}</span>
                                      <span className="text-white/35">{ty}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <a href={ERD_PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-8 font-mono text-[11px] uppercase tracking-widest text-[var(--accent-cyan)] hover:underline">
                      View full ERD →
                    </a>
                  </section>
                )}

                {active === "Design" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">Wireframes</SectionTitle>
                    <p className="mb-6 text-white/60">High fidelity screens mapped in Figma based off of rough sketches (linked at the bottom) before a line of code was written (Direction was important for this build). I designed the cream on black / dark brown, Bitcount font that gives off a social, easygoing and creatvie type of vibe.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                      {WIREFRAMES.map((w) => (
                        <div key={w.src} className="group rounded-lg overflow-hidden border border-white/10 bg-black/40 transition-colors hover:border-[var(--accent-cyan)]/50">
                          <img src={w.src} alt={w.label} className="w-full block" />
                          <div className="px-2 py-1.5 font-mono text-[10px] text-white/40 text-center border-t border-white/5 transition-colors group-hover:text-[var(--accent-cyan)]">{w.label}</div>
                        </div>
                      ))}
                    </div>

                    <SectionTitle color="#8b5cf6">Color System</SectionTitle>
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-8 max-w-md">
                      <img src={COLOR_IMG} alt="JAM color scheme" className="w-full block" />
                    </div>

                    <a href={SKETCHES_PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--accent-cyan)] hover:underline">
                      See the original sketches (PDF) →
                    </a>
                  </section>
                )}

                {active === "Docs & Code" && (
                  <section>
                    <SectionTitle color="#4ade80">Docs & Code</SectionTitle>
                    <p className="mb-6 text-white/60">The repo houses the app and the schema source of truth (schema.dbml). A full master design + architecture document to keep organized and keep me on track with the build.</p>
                    <div className="space-y-3">
                      <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded border border-white/10 bg-white/[0.03] hover:border-[var(--accent-cyan)]/50 transition-colors">
                        <span className="font-mono text-xs text-white/80">GitHub Repository</span>
                        <span className="font-mono text-[11px] text-white/40 ml-auto">github.com/Omjnr06/Jam →</span>
                      </a>
                      <div className="px-5 py-3 rounded border border-white/10 bg-white/[0.03] transition-colors hover:border-[var(--accent-cyan)]/50">
                        <span className="font-mono text-xs text-white/60">Schema source of truth: </span>
                        <span className="font-mono text-xs text-[var(--accent-cyan)]">schema.dbml</span>
                        <span className="font-mono text-xs text-white/40"> (in repo)</span>
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Terminal exit line */}
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-2 text-white/40 font-mono text-sm">
          <span>omj@server:~$</span>
          <span className="animate-pulse bg-white/60 w-2 h-4 inline-block" />
        </div>
      </div>

      {/* Expanded video modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setExpanded(false)}
          >
            <motion.video
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={DEMO_VIDEO} autoPlay muted loop playsInline controls
              className="max-h-[90vh] max-w-full rounded-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white border border-white/20 rounded px-3 py-1.5" onClick={() => setExpanded(false)}>
              Close ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}