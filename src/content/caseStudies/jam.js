export const jam = {
  id: "jam",
  slug: "jam",
  project: "jam",
  title: "JAM",
  badge: { label: "Personal Project", color: "accent-2" },
  kicker: "Mobile · React Native · GraphQL",
  summary: "A location-based discovery app that connects university and local musicians. Find bandmates and jam partners who share your instruments, taste, and goals.",
  marginNote: "musicians, meet each other",
  stage: "Frontend complete · Mock data · Backend in progress",
  modern: { file: "jam", prompt: "omj@server:~$", glow: "accent-2" },
  sections: [
    {
      id: "overview",
      label: "Overview",
      blocks: [
        { type: "heading", text: "The Directive", color: "accent" },
        { type: "text", body: "From experience, finding people to make music with is a genuinely unorganized, annoying experience. The process is scattered across social media group chats, cold reach outs,  paper flyers, and word of mouth. JAM simplifies it. Musicians post short video clips as a living portfolio, get surfaced to others in their area, and send a contextual \"Jam Request\" tied to a specific clip or profile. Accepted requests open a direct conversation." },
        { type: "text", body: "I designed and built the frontend. Onboarding, the discovery Hub, a fullscreen video player, the upload flow, profiles, and a three-state inbox. It all runs  on a mock data layer while the backend is built in parallel." },
        { type: "heading", text: "Stack", color: "accent-2" },
        { type: "tags", items: ["React Native (Expo)", "TypeScript", "Expo Router", "Zustand", "expo-video", "GraphQL (Apollo)", "Node / Express", "Neon Postgres", "Redis (Upstash)", "Cloudflare R2", "Better Auth", "Nginx", "Docker"] },
      ],
    },
    {
      id: "demo",
      label: "Demo",
      blocks: [
        { type: "heading", text: "Live Walkthrough", color: "#4ade80" },
        { type: "text", variant: "lead", body: "A 57-second run through the current build. The Hub, fullscreen player, jam requests, and the inbox. Running on mock data." },
        { type: "video", src: "/assets/jam-frontend-video.mp4", caption: "JAM frontend walkthrough", expandable: true },
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
            { title: "Global state with Zustand.", body: "A persisted Zustand store (theme, profile, clips) that all viewable components call the color scheme from. The splash screen is gated on a hydration flag so the persisted theme is loaded based on the users system (if your on dark mode on your phone the app will load in dark mode)." },
            { title: "A single central mock layer.", body: "Every screen is powered by one mock (hub sections, people, conversations, messages). This let me build and iterate the entire UI before any backend exists, and each mock maps cleanly onto a future GraphQL query or mutation." },
            { title: "Reusable media playback.", body: "A expo video player (app/player/[id].tsx) is reused across the feed and profile, with a brand overlay chrome and a Jam request bottom sheet." },
            { title: "Everything handles its edge states.", body: "Loading, empty, and error cases are handled across the app. A compression overlay on upload, empty inbox placeholders, failed load fallbacks to give the user a premium custom feel." },
          ],
        },
        { type: "heading", text: "Data Model", color: "accent-2" },
        { type: "text", variant: "lead", body: "Postgres (Neon) with Better Auth as Auth manager. Instruments, genres, and intents are user level junction tables so discovery can filter on them cleanly." },
        {
          type: "schema",
          groups: [
            {
              name: "Auth: Better Auth",
              note: "not seeded",
              tables: [
                { name: "ba_user", cols: [["id", "text"], ["email", "varchar"], ["email_verified", "bool"], ["name", "varchar"], ["image", "varchar"]] },
                { name: "ba_session", cols: [["id", "text"], ["user_id", "text"], ["token", "varchar"], ["expires_at", "timestamp"]] },
                { name: "ba_account", cols: [["id", "text"], ["user_id", "text"], ["provider_id", "varchar"], ["account_id", "varchar"], ["password", "varchar"]] },
                { name: "ba_verification", cols: [["id", "text"], ["identifier", "varchar"], ["value", "varchar"], ["expires_at", "timestamp"]] },
              ],
            },
            {
              name: "Core",
              tables: [
                { name: "profiles", cols: [["user_id", "text (→ba_user)"], ["username", "varchar"], ["bio", "text"], ["instagram_handle", "varchar?"], ["hub_location", "varchar"], ["intents", "varchar[]"], ["featured_clip_id", "uuid?"], ["spotify_top_artists", "json"], ["deleted_at", "ts?"]] },
                { name: "clips", cols: [["id", "uuid"], ["user_id", "text"], ["video_url", "varchar (R2)"], ["thumbnail_url", "varchar"], ["title", "varchar"], ["description", "text?"], ["tags", "varchar[]"], ["duration", "int"], ["is_featured", "bool"], ["deleted_at", "ts?"]] },
              ],
            },
            {
              name: "Taxonomy — user identity",
              tables: [
                { name: "instruments", cols: [["id", "serial"], ["name", "varchar"]] },
                { name: "genres", cols: [["id", "serial"], ["name", "varchar"]] },
                { name: "user_instruments", cols: [["user_id", "text"], ["instrument_id", "int"]] },
                { name: "user_genres", cols: [["user_id", "text"], ["genre_id", "int"]] },
              ],
            },
            {
              name: "Social",
              tables: [
                { name: "jam_requests", cols: [["id", "uuid"], ["sender_id", "text"], ["receiver_id", "text"], ["clip_id", "uuid?"], ["initial_message", "text"], ["idempotency_key", "uuid"], ["status", "varchar"]] },
                { name: "conversations", cols: [["id", "uuid"], ["jam_request_id", "uuid"], ["user_a_id", "text"], ["user_b_id", "text"], ["deleted_at", "ts?"]] },
                { name: "messages", cols: [["id", "uuid"], ["conversation_id", "uuid"], ["sender_id", "text"], ["body", "text"], ["deleted_at", "ts?"]] },
              ],
            },
            {
              name: "Moderation & System",
              tables: [
                { name: "blocks", cols: [["id", "uuid"], ["blocker_id", "text"], ["blocked_id", "text"]] },
                { name: "reports", cols: [["id", "uuid"], ["reporter_id", "text"], ["reported_id", "text"], ["reason", "varchar"], ["status", "varchar"]] },
                { name: "notifications", cols: [["id", "uuid"], ["recipient_id", "text"], ["actor_id", "text"], ["type", "varchar"], ["entity_id", "uuid"], ["read_at", "ts?"]] },
              ],
            },
          ],
        },
        { type: "link", label: "View full ERD →", href: "/assets/images/jam/JamAppERD.png" },
      ],
    },
    {
      id: "design",
      label: "Design",
      blocks: [
        { type: "heading", text: "Wireframes", color: "accent" },
        { type: "text", variant: "lead", body: "High fidelity screens mapped in Figma based off of rough sketches (linked at the bottom) before a line of code was written (Direction was important for this build). I designed the cream on black / dark brown, Bitcount font that gives off a social, easygoing and creatvie type of vibe." },
        {
          type: "screens",
          items: [
            { src: "/assets/images/jam/jam-landing-page.png", label: "Landing" },
            { src: "/assets/images/jam/jam-create-account.png", label: "Create Account" },
            { src: "/assets/images/jam/jam-sign-in-page.png", label: "Sign In" },
            { src: "/assets/images/jam/jam-homepage.png", label: "The Hub" },
            { src: "/assets/images/jam/jam-add-clips.png", label: "Add Post" },
            { src: "/assets/images/jam/jam-messages.png", label: "Messages" },
            { src: "/assets/images/jam/jam-user-page.png", label: "Profile" },
            { src: "/assets/images/jam/jam-video-player.png", label: "Player" },
          ],
        },
        { type: "heading", text: "Color System", color: "accent-2" },
        { type: "image", src: "/assets/images/jam/Color-Scheme-Jam-App.png", alt: "JAM color scheme", size: "sm" },
        { type: "link", label: "See the original sketches (PDF) →", href: "/assets/Jam-App-Design-Drawings.pdf" },
      ],
    },
    {
      id: "docs",
      label: "Docs & Code",
      blocks: [
        { type: "heading", text: "Docs & Code", color: "#4ade80" },
        { type: "text", variant: "lead", body: "The repo houses the app and the schema source of truth (schema.dbml). A full master design + architecture document to keep organized and keep me on track with the build." },
        {
          type: "resources",
          items: [
            { label: "GitHub Repository", href: "https://github.com/Omjnr06/Jam", meta: "github.com/Omjnr06/Jam →" },
            { label: "Schema source of truth: ", value: "schema.dbml", suffix: " (in repo)" },
          ],
        },
      ],
    },
  ],
};
