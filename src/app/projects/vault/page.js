"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SEGMENTS = ["Overview", "Problem", "Architecture", "Design", "What's Next", "Docs & Code"];

const STACK = [
  "Next.js", "TypeScript", "Tailwind v4", "FastAPI", "Python", "Neon Postgres",
  "SQLModel", "Alembic", "Better Auth", "Plaid", "Resend",
  "Vercel", "Render",
];

const HIGHLIGHTS = [
  {
    title: "Plaid integration, done securely",
    body: "Real bank connection with access tokens encrypted at rest (Fernet). Every incoming webhook is JWT signature verified before it's trusted, so forged sync requests are rejected. Transaction sync is idempotent via Plaid's cursor model (added / modified / removed) so nothing is ever double counted.",
  },
  {
    title: "Cross language auth across a TS/Python boundary",
    body: "Better Auth (TypeScript/Next.js) writes sessions to Postgres; FastAPI (Python) validates them through a shared database session lookup instead of duplicating auth. Every query is row level scoped to the authenticated user.",
  },
  {
    title: "A Safe to Spend engine in integer cents",
    body: "A single SQL aggregation computes balance minus upcoming bills, goal allocations, and a safety threshold. All money is stored and computed in integer cents, so there are no floating point rounding bugs on financial values.",
  },
  {
    title: "AI ready, grounded in the user's own data",
    body: "A planned ML layer (anomaly detection, spending habit clustering) is exposed to a chatbot through whitelisted function calling, strictly grounded in the authenticated user's data rather than free form model output (aka the chat wont hallunciate if it doesnt know it will say!).",
  },
];

const WIREFRAMES = [
  { src: "/assets/images/financial-dashboard/landing.png", label: "Landing" },
  { src: "/assets/images/financial-dashboard/dashboard-pill.png", label: "Dashboard · Pill Nav" },
  { src: "/assets/images/financial-dashboard/dashboard-rail.png", label: "Dashboard · Icon Rail" },
  { src: "/assets/images/financial-dashboard/transactions.png", label: "Transactions" },
  { src: "/assets/images/financial-dashboard/settings.png", label: "Settings · Bank Connection" },
];

const DESKTOP_SHOT = "/assets/images/financial-dashboard/dashboard-desktop.png";
const REPO = "https://github.com/Omjnr06/ai-financial-dashboard";
const doc = "/assets/financial-dashboard-doc.pdf"

const SCHEMA = [
  {
    group: "Identity",
    managed: true,
    tables: [
      { name: "ba_user", cols: [["id", "text"], ["name", "text"], ["email", "text"], ["emailVerified", "bool"], ["image", "text?"]] },
      { name: "ba_session", cols: [["id", "text"], ["userId", "text"], ["token", "text"], ["expiresAt", "ts"], ["ipAddress", "text"], ["userAgent", "text"]] },
      { name: "ba_account", cols: [["id", "text"], ["userId", "text"], ["accountId", "text"], ["providerId", "text"], ["accessToken", "text?"]] },
      { name: "ba_verification", cols: [["id", "text"], ["identifier", "text"], ["value", "text"], ["expiresAt", "ts"]] },
    ],
  },
  {
    group: "Profile",
    tables: [
      { name: "profiles", cols: [["id", "uuid"], ["userId", "text -> ba_user"], ["timezone", "str"], ["layoutId", "str"], ["themeId", "str"], ["safeToSpendThresholdCent", "int"]] },
    ],
  },
  {
    group: "Plaid & Accounts",
    tables: [
      { name: "plaiditem", cols: [["id", "uuid"], ["userId", "text"], ["accessTokenEncrypted", "str (Fernet)"], ["itemId", "str"], ["instituionName", "str?"], ["status", "enum"], ["cursor", "str?"]] },
      { name: "accounts", cols: [["id", "uuid"], ["userId", "text"], ["plaidItemId", "uuid -> plaiditem"], ["plaidAccountId", "str"], ["name", "str"], ["type", "enum"], ["currentBalanceToCent", "int"]] },
    ],
  },
  {
    group: "Money Movement",
    tables: [
      { name: "transactions", cols: [["id", "uuid"], ["userId", "text"], ["accountId", "uuid -> accounts"], ["plaidTransactionId", "str?"], ["dateOf", "date"], ["amountToCent", "int (+/-)"], ["merchantName", "str?"], ["category", "str?"], ["pending", "bool"], ["isAnomaly", "bool"], ["isManual", "bool"]] },
    ],
  },
  {
    group: "Goals & Bills",
    tables: [
      { name: "bucket", cols: [["id", "uuid"], ["userId", "text"], ["name", "str"], ["targetToCent", "int"], ["currentToCent", "int"], ["targetDate", "date?"]] },
      { name: "bills", cols: [["id", "uuid"], ["userId", "text"], ["name", "str"], ["amountToCent", "int"], ["dueDay", "int (1-31)"], ["isAuto", "bool"], ["active", "bool"]] },
    ],
  },
];

const THEMES = {
  midnight: { surface: "#0F1535", surfaceRaised: "#1A1F45", textPrimary: "#FFFFFF", textMuted: "#A0AEC0", accent: "#2CD9FF", borderSubtle: "#2D3561", danger: "#E01E5A", success: "#2EB67D" },
  mono: { surface: "#141414", surfaceRaised: "#1F1F1F", textPrimary: "#F5F5F5", textMuted: "#8A8A8A", accent: "#B8C4D0", borderSubtle: "#333333", danger: "#D45B5B", success: "#6BAF8D" },
  neon: { surface: "#0A0A12", surfaceRaised: "#15121F", textPrimary: "#F0EBFF", textMuted: "#7A7295", accent: "#00E5FF", borderSubtle: "#2A2440", danger: "#FF3B6B", success: "#3BFFB0" },
  pink: { surface: "#1E1018", surfaceRaised: "#2A1622", textPrimary: "#FBEEF4", textMuted: "#B08A9C", accent: "#FF8FB1", borderSubtle: "#3D2230", danger: "#FF5C7A", success: "#5FCF9E" },
  daylight: { surface: "#F7F8FA", surfaceRaised: "#FFFFFF", textPrimary: "#0F1535", textMuted: "#64748B", accent: "#0891B2", borderSubtle: "#E2E8F0", danger: "#DC2626", success: "#16A34A" },
};
const THEME_KEYS = ["midnight", "mono", "neon", "pink", "daylight"];

function SectionTitle({ color, children }) {
  return (
    <h2 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color }}>
      <span className="text-white/30">{">"}</span> {children}
    </h2>
  );
}

function SafeToSpendHero() {
  return (
    <div className="rounded-2xl border border-[var(--accent-cyan)]/20 bg-gradient-to-br from-[#0F1535] to-[#0a0e22] p-6 md:p-8 max-w-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-white/50 tracking-wide">Safe to spend · week</span>
        <div className="flex gap-1 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded text-white/40">Day</span>
          <span className="px-2 py-0.5 rounded bg-[var(--accent-cyan)] text-black">Week</span>
          <span className="px-2 py-0.5 rounded text-white/40">Month</span>
        </div>
      </div>
      <div className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">CA$800.00</div>
      <div className="flex items-center gap-4 text-[13px]">
        <span className="text-white/50">Balance <span className="text-white/80 font-semibold">CA$5,700</span></span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[14%] bg-[var(--accent-cyan)]" />
        </div>
        <span className="text-white/50">Threshold <span className="text-white/80 font-semibold">CA$4,000</span></span>
      </div>
      <div className="font-mono text-[10px] text-white/35 mt-2">14% of your balance is safe to spend</div>
    </div>
  );
}

function FlowBox({ label, sub, color }) {
  return (
    <div className="rounded-lg border bg-black/40 px-3 py-2 text-center" style={{ borderColor: `${color}55` }}>
      <div className="font-mono text-[11px]" style={{ color }}>{label}</div>
      {sub && <div className="font-mono text-[9px] text-white/35 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function VaultCaseStudy() {
  const [active, setActive] = useState("Overview");
  const [theme, setTheme] = useState("midnight");
  const t = THEMES[theme];

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[var(--accent-cyan)] selection:text-black relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-journal-dots opacity-80" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12 font-mono text-[10px] uppercase tracking-widest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Projects
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="font-mono text-[10px] text-[#2CD9FF] tracking-[0.3em] uppercase bg-[#2CD9FF]/10 px-3 py-1 rounded border border-[#2CD9FF]/20">
              Team Project · Led by me
            </span>
            <span className="font-mono text-[10px] text-[var(--accent-cyan)] tracking-[0.3em] uppercase">
              // Next.js · FastAPI · Plaid
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">The Vault</h1>
          <p className="text-xl text-white/60 font-light leading-relaxed max-w-2xl">
            A personal finance dashboard that connects to real bank accounts and answers one question the others don&apos;t: how much is actually safe to spend today, after bills, savings goals, and a buffer are already accounted for.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-wide px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            CURRENT STAGE: In active development · Plaid integration built · production bank connections rolling out
          </div>

          <div className="mt-8">
            <SafeToSpendHero />
          </div>
        </motion.div>

        {/* Pill switcher */}
        <div className="mb-8 flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#0a0a0a] border border-white/10 w-fit">
          {SEGMENTS.map((seg) => (
            <button key={seg} onClick={() => setActive(seg)}
              className={`relative px-4 py-2 rounded-lg font-mono text-xs tracking-wide transition-colors ${active === seg ? "text-black" : "text-white/50 hover:text-white/80"}`}>
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
              vault__{active.toLowerCase().replace(/[^a-z]/g, "_")}.tsx
            </span>
          </div>

          <div className="p-6 md:p-10 font-mono text-sm leading-relaxed text-white/80 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

                {active === "Overview" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">The Directive</SectionTitle>
                    <p className="mb-4">
                      Most budgeting apps are backward looking calculators. They tell you that you overspent after the money is already gone. The Vault flips that: it connects to your bank/banks, subtracts what&apos;s already committed &mdash; bills, savings goals, a safety buffer &mdash; and shows a single &quot;Safe to Spend&quot; number.
                    </p>
                    <p className="mb-8">
                      I led the build with two teammates, owning the backend and the core engineering such as the Plaid pipeline, the cross language auth between Next.js and FastAPI, and the Safe to Spend aggregation.
                    </p>
                    <SectionTitle color="#2CD9FF">Stack</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {STACK.map((s) => (
                        <span key={s} className="font-mono text-[11px] px-3 py-1 rounded border border-white/10 bg-white/[0.03] text-white/70 transition-colors cursor-default hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)]">{s}</span>
                      ))}
                    </div>
                  </section>
                )}

                {active === "Problem" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">Why existing budgeting apps have low usage rates.</SectionTitle>
                    <ul className="space-y-4 list-none">
                      <li className="pl-4 border-l-2 border-white/10">
                        <span className="text-white font-bold">They report whats already happened.</span><br />
                        <span className="text-white/70">Traditional apps categorize what you already spent. This feature is useful, however by the time you see &quot;you overspent on dining,&quot; the money&apos;s gone..</span>
                      </li>
                      <li className="pl-4 border-l-2 border-white/10">
                        <span className="text-white font-bold">A raw balance is misleading.</span><br />
                        <span className="text-white/70">Your account might show CA$5,700, but rent, subscriptions, and a savings goal are all coming out of it. Spending against the raw number is how people end up short at the end of the month.</span>
                      </li>
                        <li className="pl-4 border-l-2 border-white/10">
                        <span className="text-white font-bold">Many Banks, hard to keep track</span><br />
                        <span className="text-white/70">Nowadays, most people have multiple bank accounts, multiple credit cards, multiple savings accounts. It becomes hard to track and stay on top of everything and get a big picture of idea of how your doing financially.</span>
                      </li>
                      <li className="pl-4 border-l-2 border-white/10">
                        <span className="text-white font-bold">Manual entry doesn&apos;t survive contact with real life.</span><br />
                        <span className="text-white/70">Apps that need you to log all your transactions leave room for users to miss a log or to stop using the app entirely. The Vault syncs automatically through Plaid, so the data stays the same with minimal effort.</span>
                      </li>
                    </ul>
                  </section>
                )}

                {active === "Architecture" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">Engineering Decisions</SectionTitle>
                    <ul className="space-y-5 list-none mb-10">
                      {HIGHLIGHTS.map((h) => (
                        <li key={h.title} className="pl-4 border-l-2 border-[var(--accent-cyan)]/30">
                          <span className="text-white font-bold">{h.title}.</span><br />
                          <span className="text-white/70">{h.body}</span>
                        </li>
                      ))}
                    </ul>

                    <SectionTitle color="#2CD9FF">Plaid Sync Pipeline</SectionTitle>
                    <p className="mb-4 text-white/60">A webhook is never trusted on arrival. It&apos;s verified, then the cursor drives an idempotent diff.</p>
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 mb-3 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                      <FlowBox label="Plaid Link" sub="user connects bank" color="#2CD9FF" />
                      <FlowBox label="Webhook" sub="sync event" color="#2CD9FF" />
                      <FlowBox label="JWT verify" sub="reject forged" color="#E01E5A" />
                      <FlowBox label="Cursor sync" sub="added/mod/removed" color="#2EB67D" />
                      <FlowBox label="Recompute" sub="Safe to Spend" color="#2CD9FF" />
                    </div>
                    <p className="mb-10 text-white/40 text-[12px]">Cursor persistence on the plaiditem means each sync only pulls the delta, and redelivered webhooks never double count.</p>

                    <SectionTitle color="#2CD9FF">Cross Language Auth</SectionTitle>
                    <p className="mb-4 text-white/60">One session store, two languages. Better Auth issues; FastAPI verifies via the shared DB.</p>
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 mb-10 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                      <FlowBox label="Better Auth" sub="TS / Next.js" color="#2CD9FF" />
                      <FlowBox label="ba_session" sub="token in Postgres" color="#2EB67D" />
                      <FlowBox label="FastAPI" sub="shared-DB lookup" color="#2CD9FF" />
                      <FlowBox label="Row scoping" sub="userId on every query" color="#2EB67D" />
                    </div>

                    <SectionTitle color="#2CD9FF">Data Model</SectionTitle>
                    <p className="mb-6 text-white/60">
                      Neon Postgres via SQLModel + Alembic. Better Auth owns the identity tables (managed, not seeded). All money is stored in integer cents.
                    </p>
                    <div className="space-y-8">
                      {SCHEMA.map((grp) => (
                        <div key={grp.group}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{grp.group}</span>
                            {grp.managed && <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-yellow-400/30 text-yellow-300/80">Better Auth · not seeded</span>}
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {grp.tables.map((tb) => (
                              <div key={tb.name} className="rounded-lg border border-white/10 bg-black/40 overflow-hidden transition-colors hover:border-[var(--accent-cyan)]/40">
                                <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/10 font-mono text-[12px] text-[var(--accent-cyan)]">{tb.name}</div>
                                <div className="p-3 space-y-1">
                                  {tb.cols.map(([c, ty]) => (
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
                  </section>
                )}

                {active === "Design" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">The Dashboard</SectionTitle>
                    <p className="mb-4 text-white/60">A bento grid anchored by the dominant Safe to Spend tile, dark navy with a cyan accent. Kumar One Outline wordmark, Inter for data.</p>
                    <div className="rounded-lg overflow-hidden border border-white/10 mb-10 transition-colors hover:border-[var(--accent-cyan)]/40">
                      <img src={DESKTOP_SHOT} alt="The Vault desktop dashboard" className="w-full block" />
                    </div>

                    <SectionTitle color="#2CD9FF">Dual Layout, User-Switchable</SectionTitle>
                    <p className="mb-4 text-white/60">Reimagining the &quot;boring bank sidebar.&quot; The same dashboard renders as a horizontal pill nav or a vertical icon rail &mdash; the user picks, and it&apos;s persisted on their profile (layoutId).</p>
                    <div className="grid grid-cols-2 gap-3 mb-10">
                      {[["/assets/images/financial-dashboard/dashboard-pill.png", "Horizontal pill nav"], ["/assets/images/financial-dashboard/dashboard-rail.png", "Vertical icon rail"]].map(([src, label]) => (
                        <div key={src} className="rounded-lg overflow-hidden border border-white/10 bg-black/40 transition-colors hover:border-[var(--accent-cyan)]/40">
                          <img src={src} alt={label} className="w-full block" />
                          <div className="px-2 py-1.5 font-mono text-[10px] text-white/40 text-center border-t border-white/5">{label}</div>
                        </div>
                      ))}
                    </div>

                    <SectionTitle color="#2CD9FF">Theme System</SectionTitle>
                    <p className="mb-4 text-white/60">Five themes driven by CSS variables and semantic tokens (surface, accent, danger, success&hellip;) &mdash; not hardcoded colors. Persisted per user as themeId. Try them:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {THEME_KEYS.map((k) => (
                        <button key={k} onClick={() => setTheme(k)}
                          className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors capitalize ${theme === k ? "text-black" : "text-white/60 hover:text-white/90 border-white/10"}`}
                          style={theme === k ? { background: THEMES[k].accent, borderColor: THEMES[k].accent } : {}}>
                          {k}
                        </button>
                      ))}
                    </div>
                    {/* live theme preview */}
                    <div className="rounded-xl p-5 border transition-colors" style={{ background: t.surface, borderColor: t.borderSubtle }}>
                      <div className="rounded-lg p-4" style={{ background: t.surfaceRaised }}>
                        <div className="text-[11px] mb-1" style={{ color: t.textMuted }}>Safe to spend · week</div>
                        <div className="text-3xl font-bold mb-3" style={{ color: t.textPrimary }}>CA$800.00</div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span style={{ color: t.textMuted }}>Balance</span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: t.borderSubtle }}>
                            <div className="h-full w-[14%]" style={{ background: t.accent }} />
                          </div>
                          <span style={{ color: t.success }}>on track</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <span className="text-[10px] px-2 py-1 rounded" style={{ background: t.accent, color: t.surface }}>Primary</span>
                          <span className="text-[10px] px-2 py-1 rounded border" style={{ borderColor: t.danger, color: t.danger }}>Over budget</span>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {active === "What's Next" && (
                  <section>
                    <SectionTitle color="var(--accent-cyan)">Roadmap</SectionTitle>
                    <ul className="space-y-5 list-none">
                      <li className="pl-4 border-l-2 border-[var(--accent-cyan)]/30">
                        <span className="text-white font-bold">Production bank connections.</span><br />
                        <span className="text-white/70">Moving Plaid from sandbox to live institutions &mdash; the security layer (encrypted tokens, JWT-verified webhooks, idempotent cursor sync) is already built for it.</span>
                      </li>
                      <li className="pl-4 border-l-2 border-[var(--accent-cyan)]/30">
                        <span className="text-white font-bold">ML insights layer.</span><br />
                        <span className="text-white/70">Scikit-Learn for transaction anomaly detection (the isAnomaly flag is already in the schema) and spending-habit clustering, surfaced as plain-language insights.</span>
                      </li>
                      <li className="pl-4 border-l-2 border-[var(--accent-cyan)]/30">
                        <span className="text-white font-bold">Grounded chatbot.</span><br />
                        <span className="text-white/70">A conversational layer over the user&apos;s finances via whitelisted function-calling &mdash; it can only answer from the user&apos;s own data, never invent numbers.</span>
                      </li>
                      <li className="pl-4 border-l-2 border-white/10">
                        <span className="text-white font-bold">Docker + CI.</span><br />
                        <span className="text-white/70">Containerizing the FastAPI service and adding a CI pipeline for the move toward a production deployment.</span>
                      </li>
                    </ul>
                  </section>
                )}

                {active === "Docs & Code" && (
                  <section>
                    <SectionTitle color="#2EB67D">Docs & Code</SectionTitle>
                    <p className="mb-6 text-white/60">Next.js + Tailwind v4 frontend on Vercel; FastAPI backend on Render; Neon Postgres with SQLModel + Alembic migrations.</p>
                    <div className="space-y-3">
                      <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded border border-white/10 bg-white/[0.03] hover:border-[var(--accent-cyan)]/50 transition-colors">
                        <span className="font-mono text-xs text-white/80">GitHub Repository</span>
                        <span className="font-mono text-[11px] text-white/40 ml-auto">github.com/Omjnr06/ai-financial-dashboard →</span>
                      </a>
                      <div className="px-5 py-3 rounded border border-white/10 bg-white/[0.03]">
                        <span className="font-mono text-xs text-white/60">Live demo: </span>
                        <span className="font-mono text-xs text-yellow-300/80">coming soon</span>
                      </div>
                    <a href= {doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded border border-white/10 bg-white/[0.03] hover:border-[var(--accent-cyan)]/50 transition-colors">
                        <span className="font-mono text-xs text-white/80">Planning Document</span>
                        <span className="font-mono text-[11px] text-white/40 ml-auto">Click to read the planning doc</span>
                      </a>
                    </div>
                  </section>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-2 text-white/40 font-mono text-sm">
          <span>omj@vault:~$</span>
          <span className="animate-pulse bg-white/60 w-2 h-4 inline-block" />
        </div>
      </div>
    </main>
  );
}