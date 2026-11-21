const CYAN = "#2CD9FF";
const GREEN = "#2EB67D";
const RED = "#E01E5A";

export const vault = {
  id: "vault",
  slug: "vault",
  project: "the-vault",
  title: "The Vault",
  badge: { label: "Team Project · Led by me", color: CYAN },
  kicker: "Next.js · FastAPI · Plaid",
  summary: "A personal finance dashboard that connects to real bank accounts and answers one question the others don't: how much is actually safe to spend today, after bills, savings goals, and a buffer are already accounted for.",
  marginNote: "the one number that matters",
  stage: "In active development · Plaid integration built · production bank connections rolling out",
  showcase: "vault-safe-to-spend",
  brand: { primary: CYAN, success: GREEN, danger: RED },
  modern: { file: "vault", prompt: "omj@vault:~$", glow: "accent" },
  sections: [
    {
      id: "overview",
      label: "Overview",
      blocks: [
        { type: "heading", text: "The Directive", color: "accent" },
        { type: "text", body: "Most budgeting apps are backward looking calculators. They tell you that you overspent after the money is already gone. The Vault flips that: it connects to your bank/banks, subtracts what's already committed — bills, savings goals, a safety buffer — and shows a single \"Safe to Spend\" number." },
        { type: "text", body: "I led the build with two teammates, owning the backend and the core engineering such as the Plaid pipeline, the cross language auth between Next.js and FastAPI, and the Safe to Spend aggregation." },
        { type: "heading", text: "Stack", color: CYAN },
        { type: "tags", items: ["Next.js", "TypeScript", "Tailwind v4", "FastAPI", "Python", "Neon Postgres", "SQLModel", "Alembic", "Better Auth", "Plaid", "Resend", "Vercel", "Render"] },
      ],
    },
    {
      id: "problem",
      label: "Problem",
      blocks: [
        { type: "heading", text: "Why existing budgeting apps have low usage rates.", color: "accent" },
        {
          type: "points",
          tone: "neutral",
          items: [
            { title: "They report whats already happened.", body: "Traditional apps categorize what you already spent. This feature is useful, however by the time you see \"you overspent on dining,\" the money's gone.." },
            { title: "A raw balance is misleading.", body: "Your account might show CA$5,700, but rent, subscriptions, and a savings goal are all coming out of it. Spending against the raw number is how people end up short at the end of the month." },
            { title: "Many Banks, hard to keep track", body: "Nowadays, most people have multiple bank accounts, multiple credit cards, multiple savings accounts. It becomes hard to track and stay on top of everything and get a big picture of idea of how your doing financially." },
            { title: "Manual entry doesn't survive contact with real life.", body: "Apps that need you to log all your transactions leave room for users to miss a log or to stop using the app entirely. The Vault syncs automatically through Plaid, so the data stays the same with minimal effort." },
          ],
        },
      ],
    },
    {
      id: "architecture",
      label: "Architecture",
      blocks: [
        { type: "heading", text: "Engineering Decisions", color: "accent" },
        {
          type: "points",
          tone: "accent",
          items: [
            { title: "Plaid integration, done securely.", body: "Real bank connection with access tokens encrypted at rest (Fernet). Every incoming webhook is JWT signature verified before it's trusted, so forged sync requests are rejected. Transaction sync is idempotent via Plaid's cursor model (added / modified / removed) so nothing is ever double counted." },
            { title: "Cross language auth across a TS/Python boundary.", body: "Better Auth (TypeScript/Next.js) writes sessions to Postgres; FastAPI (Python) validates them through a shared database session lookup instead of duplicating auth. Every query is row level scoped to the authenticated user." },
            { title: "A Safe to Spend engine in integer cents.", body: "A single SQL aggregation computes balance minus upcoming bills, goal allocations, and a safety threshold. All money is stored and computed in integer cents, so there are no floating point rounding bugs on financial values." },
            { title: "AI ready, grounded in the user's own data.", body: "A planned ML layer (anomaly detection, spending habit clustering) is exposed to a chatbot through whitelisted function calling, strictly grounded in the authenticated user's data rather than free form model output (aka the chat wont hallunciate if it doesnt know it will say!)." },
          ],
        },
        { type: "heading", text: "Plaid Sync Pipeline", color: CYAN },
        { type: "text", variant: "lead", body: "A webhook is never trusted on arrival. It's verified, then the cursor drives an idempotent diff." },
        {
          type: "flow",
          steps: [
            { label: "Plaid Link", sub: "user connects bank", color: CYAN },
            { label: "Webhook", sub: "sync event", color: CYAN },
            { label: "JWT verify", sub: "reject forged", color: RED },
            { label: "Cursor sync", sub: "added/mod/removed", color: GREEN },
            { label: "Recompute", sub: "Safe to Spend", color: CYAN },
          ],
        },
        { type: "note", body: "Cursor persistence on the plaiditem means each sync only pulls the delta, and redelivered webhooks never double count." },
        { type: "heading", text: "Cross Language Auth", color: CYAN },
        { type: "text", variant: "lead", body: "One session store, two languages. Better Auth issues; FastAPI verifies via the shared DB." },
        {
          type: "flow",
          steps: [
            { label: "Better Auth", sub: "TS / Next.js", color: CYAN },
            { label: "ba_session", sub: "token in Postgres", color: GREEN },
            { label: "FastAPI", sub: "shared-DB lookup", color: CYAN },
            { label: "Row scoping", sub: "userId on every query", color: GREEN },
          ],
        },
        { type: "heading", text: "Data Model", color: CYAN },
        { type: "text", variant: "lead", body: "Neon Postgres via SQLModel + Alembic. Better Auth owns the identity tables (managed, not seeded). All money is stored in integer cents." },
        {
          type: "schema",
          groups: [
            {
              name: "Identity",
              note: "Better Auth · not seeded",
              tables: [
                { name: "ba_user", cols: [["id", "text"], ["name", "text"], ["email", "text"], ["emailVerified", "bool"], ["image", "text?"]] },
                { name: "ba_session", cols: [["id", "text"], ["userId", "text"], ["token", "text"], ["expiresAt", "ts"], ["ipAddress", "text"], ["userAgent", "text"]] },
                { name: "ba_account", cols: [["id", "text"], ["userId", "text"], ["accountId", "text"], ["providerId", "text"], ["accessToken", "text?"]] },
                { name: "ba_verification", cols: [["id", "text"], ["identifier", "text"], ["value", "text"], ["expiresAt", "ts"]] },
              ],
            },
            {
              name: "Profile",
              tables: [
                { name: "profiles", cols: [["id", "uuid"], ["userId", "text -> ba_user"], ["timezone", "str"], ["layoutId", "str"], ["themeId", "str"], ["safeToSpendThresholdCent", "int"]] },
              ],
            },
            {
              name: "Plaid & Accounts",
              tables: [
                { name: "plaiditem", cols: [["id", "uuid"], ["userId", "text"], ["accessTokenEncrypted", "str (Fernet)"], ["itemId", "str"], ["instituionName", "str?"], ["status", "enum"], ["cursor", "str?"]] },
                { name: "accounts", cols: [["id", "uuid"], ["userId", "text"], ["plaidItemId", "uuid -> plaiditem"], ["plaidAccountId", "str"], ["name", "str"], ["type", "enum"], ["currentBalanceToCent", "int"]] },
              ],
            },
            {
              name: "Money Movement",
              tables: [
                { name: "transactions", cols: [["id", "uuid"], ["userId", "text"], ["accountId", "uuid -> accounts"], ["plaidTransactionId", "str?"], ["dateOf", "date"], ["amountToCent", "int (+/-)"], ["merchantName", "str?"], ["category", "str?"], ["pending", "bool"], ["isAnomaly", "bool"], ["isManual", "bool"]] },
              ],
            },
            {
              name: "Goals & Bills",
              tables: [
                { name: "bucket", cols: [["id", "uuid"], ["userId", "text"], ["name", "str"], ["targetToCent", "int"], ["currentToCent", "int"], ["targetDate", "date?"]] },
                { name: "bills", cols: [["id", "uuid"], ["userId", "text"], ["name", "str"], ["amountToCent", "int"], ["dueDay", "int (1-31)"], ["isAuto", "bool"], ["active", "bool"]] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "design",
      label: "Design",
      blocks: [
        { type: "heading", text: "The Dashboard", color: "accent" },
        { type: "text", variant: "lead", body: "A bento grid anchored by the dominant Safe to Spend tile, dark navy with a cyan accent. Kumar One Outline wordmark, Inter for data." },
        { type: "image", src: "/assets/images/financial-dashboard/dashboard-desktop.png", alt: "The Vault desktop dashboard" },
        { type: "heading", text: "Dual Layout, User-Switchable", color: CYAN },
        { type: "text", variant: "lead", body: "Reimagining the \"boring bank sidebar.\" The same dashboard renders as a horizontal pill nav or a vertical icon rail — the user picks, and it's persisted on their profile (layoutId)." },
        {
          type: "compare",
          items: [
            { src: "/assets/images/financial-dashboard/dashboard-pill.png", label: "Horizontal pill nav" },
            { src: "/assets/images/financial-dashboard/dashboard-rail.png", label: "Vertical icon rail" },
          ],
        },
        { type: "heading", text: "Theme System", color: CYAN },
        { type: "text", variant: "lead", body: "Five themes driven by CSS variables and semantic tokens (surface, accent, danger, success…) — not hardcoded colors. Persisted per user as themeId. Try them:" },
        {
          type: "themeDemo",
          initial: "midnight",
          themes: {
            midnight: { surface: "#0F1535", surfaceRaised: "#1A1F45", textPrimary: "#FFFFFF", textMuted: "#A0AEC0", accent: "#2CD9FF", borderSubtle: "#2D3561", danger: "#E01E5A", success: "#2EB67D" },
            mono: { surface: "#141414", surfaceRaised: "#1F1F1F", textPrimary: "#F5F5F5", textMuted: "#8A8A8A", accent: "#B8C4D0", borderSubtle: "#333333", danger: "#D45B5B", success: "#6BAF8D" },
            neon: { surface: "#0A0A12", surfaceRaised: "#15121F", textPrimary: "#F0EBFF", textMuted: "#7A7295", accent: "#00E5FF", borderSubtle: "#2A2440", danger: "#FF3B6B", success: "#3BFFB0" },
            pink: { surface: "#1E1018", surfaceRaised: "#2A1622", textPrimary: "#FBEEF4", textMuted: "#B08A9C", accent: "#FF8FB1", borderSubtle: "#3D2230", danger: "#FF5C7A", success: "#5FCF9E" },
            daylight: { surface: "#F7F8FA", surfaceRaised: "#FFFFFF", textPrimary: "#0F1535", textMuted: "#64748B", accent: "#0891B2", borderSubtle: "#E2E8F0", danger: "#DC2626", success: "#16A34A" },
          },
        },
      ],
    },
    {
      id: "next",
      label: "What's Next",
      blocks: [
        { type: "heading", text: "Roadmap", color: "accent" },
        {
          type: "points",
          tone: "accent",
          items: [
            { title: "Production bank connections.", body: "Moving Plaid from sandbox to live institutions — the security layer (encrypted tokens, JWT-verified webhooks, idempotent cursor sync) is already built for it." },
            { title: "ML insights layer.", body: "Scikit-Learn for transaction anomaly detection (the isAnomaly flag is already in the schema) and spending-habit clustering, surfaced as plain-language insights." },
            { title: "Grounded chatbot.", body: "A conversational layer over the user's finances via whitelisted function-calling — it can only answer from the user's own data, never invent numbers." },
            { title: "Docker + CI.", body: "Containerizing the FastAPI service and adding a CI pipeline for the move toward a production deployment.", later: true },
          ],
        },
      ],
    },
    {
      id: "docs",
      label: "Docs & Code",
      blocks: [
        { type: "heading", text: "Docs & Code", color: GREEN },
        { type: "text", variant: "lead", body: "Next.js + Tailwind v4 frontend on Vercel; FastAPI backend on Render; Neon Postgres with SQLModel + Alembic migrations." },
        {
          type: "resources",
          items: [
            { label: "GitHub Repository", href: "https://github.com/Omjnr06/ai-financial-dashboard", meta: "github.com/Omjnr06/ai-financial-dashboard →" },
            { label: "Live demo: ", value: "coming soon", tone: "warn" },
            { label: "Planning Document", href: "/assets/financial-dashboard-doc.pdf", meta: "Click to read the planning doc" },
          ],
        },
      ],
    },
  ],
};
