# Site content

Everything the site says lives in this folder. Pages only decide how it looks, so editing a
file here updates every page (and later every theme pack) that shows it.

`npm run check-content` checks every file and runs automatically before each build. If you
break something it fails with a plain message like
`projects[3].stack must be a list`, and the site never deploys broken.

Every item has an `id` (lowercase-with-dashes). Don't change an `id` once it's live: links and
the future Ask Junior citations use it.

Inline formatting in text fields: `*words*` = emphasis, `[label](https://link)` = a link.

## I'm adding… where does it go?

| Adding | File | What to do |
| --- | --- | --- |
| A project or hackathon | `projects.js` | Copy an entry, give it a new `id` and the next `code` |
| A project on the home page (3 slots) | `projects.js` | Add `highlight: 1`, `2` or `3` plus a one line `tagline` |
| A role on the home page (3 slots) | `resume.js` | Add `highlight: 1`, `2` or `3` plus a one line `summary` |
| A job, role or club position | `resume.js` → `experience` | Copy an entry |
| A resume project bullet list | `resume.js` → `resumeProjects` | Copy an entry; `project` links it to `projects.js` |
| A skill | `resume.js` → `skills` | Add to the right `items` list |
| A photo in the home gallery | `gallery.js` | Put the image in `public/assets/images/`, add an entry |
| A social link | `contact.js` | Needs an `icon` the site knows: email, linkedin, github, devpost, instagram, x |
| A case study (e.g. Grand Theatre) | `caseStudies/` | See below |
| A music clip | `src/app/music/data/musicLibrary.js` | Music keeps its own data for now |
| A search synonym (e.g. "llm" should find "OpenAI") | `searchAliases.js` | Add the word to the right group, or add a group |

## Collections

### `profile.js`
Name, title line, status, the two intro lines on home, and the resume PDF.
`now` is the NOW line in the OMJ card (delete it to hide the row).
`musicRole` is the id of a role in `resume.js` shown as "Currently:" in the home music spotlight (delete it to hide the line).

`openTo` and `locations` in `profile.js` fill the Contact panel.

A role's `logo` in `resume.js` is a file in `public/assets/logos/`; it pops up when someone hovers the role. Delete the field to show no logo.
Paper theme only: `course` fills the report header, and `marginNotes` are the handwritten notes
(`home`, `gallery`, `spotlight`, `projects`, `contact`, `resume`). Change the text freely; remove a key to hide that note.

### `projects.js`
```js
{
  id: "flowlytics",                 // unique, never changes
  code: "PROJECT 02",               // label shown on the card
  title: "Flowlytics (UofTHacks)",
  categories: ["DATA SCIENCE"],     // filter buttons are built from these
  stack: ["Python", "React"],
  summary: "One paragraph.",
  internship: true,                 // optional, shows the INTERNSHIP badge
  caseStudy: "pimplenet",           // optional, slug of a file in caseStudies/
  hackathon: true,                  // optional, files it under hackathons/ on /projects
  tag: "live users",                // optional, "shipped" (in production) or "live users" (people use it)
  links: { live: "https://…", github: "https://…" },   // both optional, use {} for none
  media: { image: "/assets/…", video: "/assets/….mp4", fit: "cover" | "contain", orientation: "portrait" },
                                    // big videos on Supabase: add loop (12s, 720p, no audio) for the Spotlight
                                    // and poster (jpg) so the full video only downloads when someone presses play
  highlight: 1,                     // optional, one of the 3 home page project cards (1 shows first)
  tagline: "One line for the home card.", // required when highlight is set
}
```

### `resume.js`
`skills`, `experience`, `resumeProjects`, `education`. Each entry is the fields you see on the
resume page plus an `id`. `project: "the-vault"` (optional) connects a role or resume project
to its entry in `projects.js`.

### `gallery.js`
`{ id, src, caption }`. The caption is what search shows (and finds), plus Ask Junior later.

### `contact.js`
`{ id, label, href, icon }`.

### `searchAliases.js`
`{ id, words: ["llm", "ai", "openai", …] }`. Searching any word in a group also finds the
others, so "llm" finds projects that only say "OpenAI". Lowercase only; a word can only be in
one group. Everything else in these files is searchable automatically (Ctrl K / ⌘K): project
stacks and summaries, case-study tags, resume skills and bullet points, music clips, photo
captions.

## Case studies

One file per case study in `caseStudies/`, added to the list in `caseStudies/index.js`, plus a
page at `src/app/projects/<slug>/page.js` (copy an existing one and change the slug).

```js
export const grandTheatre = {
  id: "grand-theatre",
  slug: "grand-theatre",            // the URL: /projects/grand-theatre
  project: "grand-theatre",         // optional, id in projects.js
  title: "Grand Theatre",
  badge: { label: "Project Manager", color: "accent-2" },
  kicker: "Next.js · FastAPI · Neon",
  summary: "One or two sentences under the title.",
  marginNote: "the one number that matters",  // optional, Paper theme handwritten note by the title
  stage: "In progress · …",         // optional yellow status pill
  actions: [{ label: "Read the report (PDF)", href: "/assets/….pdf", icon: "document", color: "accent" }],  // optional buttons
  modern: { file: "grand", prompt: "omj@server:~$", glow: "accent-2" },  // Modern pack flavour
  sections: [                       // each section is a tab (or one long page with layout: "single")
    { id: "overview", label: "Overview", blocks: [ /* blocks */ ] },
  ],
};
```

`modern.layout: "single"` shows every section on one page (like PimpleNet) instead of tabs.

### Blocks
| type | Fields | Looks like |
| --- | --- | --- |
| `heading` | `text`, `color` | `> Section title` |
| `text` | `body`, `variant?: "lead" \| "light"` | A paragraph. `lead` = muted intro under a heading |
| `tags` | `items: [string]` | Stack chips |
| `points` | `tone: "accent" \| "neutral" \| "warn"`, `items: [{ title, body, later? }]` | Bordered list of decisions / problems / iterations |
| `schema` | `groups: [{ name, note?, tables: [{ name, cols: [["col", "type"]] }] }]` | Database tables |
| `video` | `src`, `caption` | Click-to-expand video |
| `screens` | `items: [{ src, label }]` | Grid of app screens |
| `compare` | `items: [{ src, label }]` | Two images side by side |
| `image` | `src`, `alt`, `size?: "sm"` | One image |
| `figure` | `src`, `alt` | Framed image (graphs, outputs) |
| `flow` | `steps: [{ label, sub?, color }]` (2–5) | Pipeline boxes |
| `note` | `body` | Small grey footnote |
| `link` | `label`, `href` | `View full ERD →` style link |
| `resources` | `items: [{ label, href, meta } or { label, value, suffix?, tone? }]` | Repo / docs rows |
| `themeDemo` | `themes`, `initial` | The Vault's live theme switcher |

Colours: `accent`, `accent-2`, `ok`, `warn`, `err` follow the site theme. A `#rrggbb` hex is a
project's own brand colour and never changes with the theme.

A new **kind** of block = add it to `src/app/components/caseStudy/Blocks.jsx` (Modern), to the
list in `scripts/check-content.mjs`, and to each pack's renderer once packs exist.
