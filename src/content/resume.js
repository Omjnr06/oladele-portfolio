export const skills = [
  { id: "languages", category: "LANGUAGES & FRAMEWORKS", items: ["Python", "JavaScript", "TypeScript", "PostgreSQL", "Java", "HTML/CSS", "R", "C", "React", "Next.js", "Express.js", "Flask", "FastAPI", "Tailwind CSS"] },
  { id: "tools", category: "DEVELOPER TOOLS", items: ["Git", "GitHub", "GitHub Actions (CI/CD)", "Docker", "Nginx", "Redis", "Supabase", "Neon", "REST APIs", "MSW", "VS Code", "Figma", "Notion", "GitHub Copilot"] },
  { id: "data", category: "DATA LIBRARIES", items: ["PyTorch", "TensorFlow", "Keras", "NumPy", "Pandas", "Matplotlib", "Seaborn", "Transfer Learning", "Monte Carlo Methods"] },
  { id: "concepts", category: "CONCEPTS", items: ["Data Structures & Algorithms", "Real Time Data Pipelines", "API Integration", "Distributed Systems"] },
  { id: "other", category: "OTHER CAPABILITIES", items: ["Computer Vision", "Sound Engineering", "Event Management", "Arabic", "Microsoft Office Suite"] },
];

export const experience = [
  {
    id: "grand-theatre-pm",
    logo: "/assets/logos/grand-theatre-color.png",
    highlight: 1,
    summary: "Leading 6 developers building a carbon tracking platform that replaces a 24 column Excel workflow across 9 departments.",
    role: "Project Manager",
    company: "Grand Theatre",
    date: "Sep. 2026 - Present",
    location: "London, ON",
    points: [
      "Lead product for a carbon tracking platform replacing a 24 column manual Excel workflow spanning 9 departments, 2 facilities, and 300+ line items (150+ tonnes CO2e baseline), defining requirements with leadership and a phased roadmap.",
      "Lead 6 developers building a Next.js, FastAPI, and Neon (PostgreSQL) platform with role based admin and department views, replacing VLOOKUP driven calculations with automated lookups against a 95 item emissions factor library.",
      "Prioritized cost vs. carbon decision support after finding eco alternatives were logged on only 14% of purchases, scoping recommendations for cheaper, lower emission options, carbon offset comparisons, and utility and BAS HVAC data ingestion.",
    ],
  },
  {
    id: "western-music-assistant",
    logo: "/assets/logos/western-color.png",
    role: "Music Production & Recording Assistant",
    company: "Don Wright Faculty of Music, Western University",
    date: "Oct. 2026 - Present",
    location: "London, ON",
    points: [
      "Set up and patch the audio and video systems for live performances across von Kuster Hall, Paul Davenport Theatre, and Moscovich Recital Hall, from stage microphones and cameras to the control room.",
      "Mix live sound on a Yamaha 02R96 digital console for jazz combos, concertos, chamber recitals, and full opera productions.",
      "Direct multi camera concert recordings and livestreams, cutting between angles live on a RODECaster Video switcher, positioning PTZ cameras from a network camera controller, and capturing the program feed in OBS Studio.",
    ],
  },
  {
    id: "purelybiome-intern",
    logo: "/assets/logos/purelybiome-color.png",
    highlight: 2,
    summary: "Built and deployed a computer vision model that grades acne severity at 95.5% validation accuracy.",
    role: "AI & Software Developer Intern",
    company: "PurelyBiome",
    date: "May 2026 - Aug. 2026",
    location: "Remote",
    project: "pimplenet",
    points: [
      "Built and deployed a computer vision model grading acne severity from facial images, fine tuning an Efficient Net CNN in PyTorch/TensorFlow with a two phase transfer learning strategy to reach 95.5% validation accuracy and 100% accuracy on a held-out set of 50 real customer images.",
      "Engineered the end to end reporting interface in Next.js and Supabase, building data pipelines that normalize complex biological JSON into structured, queryable microbiome insights surfaced to users.",
    ],
  },
  {
    id: "3d-western-dev",
    logo: "/assets/logos/3d-western-color.png",
    role: "Software Developer",
    company: "3D Western",
    date: "Jun. 2026 - Sep. 2026",
    location: "London, ON",
    points: [
      "Built the frontend data and API layer for a 3D-printing lab management dashboard (Next.js, TypeScript, React) launching to production in August 2026, delivering typed contracts and API client wrappers across booking and job-tracking features.",
      "Implemented an equipment booking system spanning ~9 REST endpoints (availability, create, cancel, admin override, capacity, and approval requests) with server-side conflict and capacity handling, plus a job-tracking layer surfacing ETA, pickup, and status history across four job types.",
      "Developed against a Mock Service Worker (MSW) layer to build and test data flows in parallel with the backend team, added unit and end-to-end tests, and wired reusable hooks into the UI to eliminate duplicate fetch logic.",
    ],
  },
  {
    id: "wfn-vp-projects",
    logo: "/assets/logos/wfn-color.png",
    highlight: 3,
    summary: "Run a technical curriculum that takes student builders from setup to a working full stack prototype.",
    role: "VP of Projects",
    company: "Western Founders Network",
    date: "Sep. 2025 - Present",
    location: "London, ON",
    points: [
      "Promoted from Projects Director to VP of Projects (Apr. 2026); design and run a technical curriculum (VS Code, Git/GitHub, JavaScript, project architecture) that onboards student builders from setup to a functioning full-stack prototype.",
      "Coordinate a team of directors through a sprint-based build cycle toward Demo Day showcases, providing hands-on mentorship on version control, API integration, and shipping working software.",
    ],
  },
  {
    id: "autopilot-marketing",
    logo: "/assets/logos/autopilot.png",
    role: "Marketing Director",
    company: "Western Engineering AutoPilot",
    date: "Sep. 2025 - Present",
    location: "London, ON",
    points: [
      "Spearheaded digital outreach and cross-functional branding strategies within the communications team, driving a consistent digital presence across messaging platforms to scale engagement and reach over 100+ university students.",
      "Managed design pipelines and user-facing digital assets, utilizing iterative feedback loops and product delivery methodologies to launch marketing campaigns within tight deadline constraints.",
    ],
  },
  {
    id: "rccg-hop-intern",
    logo: "/assets/logos/rccg-hop-color.png",
    role: "Facilities Asset Management Intern",
    company: "RCCG HOP",
    date: "Jun. 2022 - Aug. 2022",
    location: "Calgary, AB",
    points: [
      "Digitized and inputted detailed data on up to 50 key church assets into the Upkeep CMMS to support accurate maintenance tracking and recordkeeping.",
      "Digitalized and organized church maintenance records, including plumbing, electrical, and audiovisual system maps, using Microsoft Office Suite for streamlined access and documentation.",
    ],
  },
];

export const resumeProjects = [
  {
    id: "resume-the-vault",
    project: "the-vault",
    title: "The Vault - AI Financial Dashboard",
    stack: "Python, FastAPI, Plaid, PostgreSQL",
    date: "July 2026 - Present",
    points: [
      "Built a real time financial data pipeline ingesting live bank transactions via Plaid, using cursor based sync and idempotent writes to guarantee no duplicate or lost records across accounts.",
      "Designed a Monte Carlo forecasting engine that models spending volatility from real transaction history to produce probabilistic savings projections with confidence ranges rather than single-point estimates.",
      "Architected secure multi user infrastructure (encrypted token storage, row level isolation) and led a 3 person team from design through deployment.",
    ],
  },
  {
    id: "resume-jam",
    project: "jam",
    title: "JAM",
    stack: "React Native, Expo, GraphQL (Apollo), Better Auth, PostgreSQL",
    date: "June 2026 - Present",
    points: [
      "Built a cross-platform musician discovery app with React Native and Expo, engineering a typed data-access layer with a mock/live toggle to enable parallel frontend and backend development.",
      "Architected the backend with an Apollo GraphQL server, Better Auth, and Neon Postgres, wiring authentication, Google OAuth, and email flows for a musician-matching platform.",
    ],
  },
  {
    id: "resume-url-shortener",
    project: "distributed-url-shortener",
    title: "Distributed URL Shortener",
    stack: "Flask, Docker, Nginx, Redis",
    date: "Apr. 2026",
    points: [
      "Architected a highly available URL shortening web application on DigitalOcean, containerizing an Nginx reverse proxy, Redis cache, and Python backend with Docker to ensure a clean separation of concerns.",
      "Optimized system throughput to support 500 concurrent users by tuning Gunicorn thread workers and implementing PgBouncer connection pooling for PostgreSQL, sustaining 520+ requests per second with a 0% error rate.",
    ],
  },
  {
    id: "resume-mustang-wrapped",
    project: "mustang-wrapped",
    title: "Mustang Wrapped",
    stack: "Spotify API, Supabase, React, SQL",
    date: "Oct. 2025 - April 2026",
    points: [
      "Developed a full-stack social analytics web application by integrating the Spotify Web API with a React frontend and Supabase backend, securely normalizing and storing real-time user listening history.",
      "Uncovered community-level music trends by writing complex SQL queries to clean, aggregate, and normalize raw JSON data, successfully processing over 100 top tracks among university club members to deliver personalized comparative dashboards.",
    ],
  },
  {
    id: "resume-internship-pipeline",
    project: "internship-alert-pipeline",
    title: "Internship Alert Pipeline",
    stack: "Python, GitHub Actions, REST APIs",
    date: "Jul. 2026",
    points: [
      "Built an automated job-monitoring pipeline that aggregates ~720 postings per run across 5 sources, normalizes and deduplicates them by URL, and routes new or reopened roles through a 3-tier classifier by target company and location.",
      "Deployed on a 15-minute GitHub Actions cron with committed state for reliable change detection, delivering filtered alerts through push notifications and email with fuzzy company matching to avoid missed or duplicate roles.",
    ],
  },
  {
    id: "resume-flowlytics",
    project: "flowlytics",
    title: "UofTHacks: Flowlytics",
    stack: "Python, Mesa, TypeScript, React",
    date: "Jan. 2026",
    points: [
      "Built a customer traffic simulation and analytics dashboard by integrating a Python-based Mesa model with a React/TypeScript frontend, providing real-time space utilization metrics for retail environments.",
      "Spearheaded spatial data analysis by writing Python scripts to simulate foot traffic and generate heat maps, processing 10,000+ simulated agent movements to identify store dead zones within a strict 48-hour hackathon window.",
    ],
  },
];

export const education = [
  {
    id: "western-bsc",
    degree: "Bachelor of Science in Computer Science, Minor in Data Science",
    school: "Western University",
    date: "Sep. 2024 - May 2028",
    details: "Recipient of the Carmeta Thelma Hodges Scholarship Award ($6000 CAD) and Western Admission Scholarship ($2500 CAD).",
  },
  {
    id: "gems-diploma",
    degree: "High School Diploma",
    school: "Gems American Academy",
    date: "Aug. 2023 - May 2024",
    details: "High Honours, Male Athlete of the Year (Basketball MVP).",
  },
];

export const highlightedExperience = experience.filter((e) => e.highlight).sort((a, b) => a.highlight - b.highlight);
