# The Music Vault — `/music`

An infinite, draggable spatial canvas of My musical clips, experiences, and prefs. Mobile as a tabbed version. Instruments, video clips, photos, Spotify songs, and
decorative music symbols live on one board you can pan, zoom, and focus.

---

## File map

```
music/
├─ page.js                     Entry. Detects desktop vs touch → CanvasBoard or MobileWheel.
├─ layout.js                   Full-viewport (100vh) positioning shell (works around the
│                              global template.js transform that breaks position:fixed).
├─ musicCanvas.css             All styling for the canvas, nodes, modals, and mobile.
├─ README.md                   This file.
│
├─ data/
│  ├─ musicLibrary.js          SSOT for clips. Categories (PIANO/DRUMS/GUITAR/BASS)
│  │                           each with a tracks[] array. Edit this to add/remove clips.
│  └─ boardItems.js            Derives everything the board renders from musicLibrary + the
│                              SONGS / PHOTOS / SYMBOLS arrays. Auto-placement, focus layouts.
│
├─ components/
│  ├─ CanvasBoard.jsx          Desktop board: react-zoom-pan-pinch shell, culling, focus modes,
│  │                           zoom controls, grid backdrop, deep-linking, modal orchestration.
│  ├─ MobileWheel.jsx          Mobile: horizontal tabs (4 instruments + Photos + Playlist) and a
│  │                           2-column scroll grid. Reuses the same player/modals.
│  ├─ PillNav.jsx              Bottom nav (desktop): Photos · Piano · Drums · Home · Guitar · Bass · Playlist.
│  ├─ MusicSidebar.jsx         Left-edge hover-reveal site nav (desktop).
│  ├─ MusicTitle.jsx           Center title with per-letter hover + scan animation.
│  ├─ ClipPlayer.jsx           Custom video player: controls, bar visualizer, fullscreen,
│  │                           prev/next, portrait/landscape adaptive, audio-only pulse.
│  ├─ Nodes/
│  │  ├─ InstrumentNode.jsx    Glowing instrument SVG. Hover nudge; click → focus mode.
│  │  ├─ ClipNode.jsx          Thumbnail node. Hover → muted 5s snippet preview. Click → player.
│  │  ├─ PhotoNode.jsx         Photo node. Click → PhotoModal.
│  │  ├─ SymbolNode.jsx        Decorative music symbol (hover-glow only).
│  │  └─ SongNode.jsx          Spotify song node w/ album art. Click → SongModal.
│  └─ Modals/
│     ├─ SongModal.jsx         "In Oladele's Playlist" + album art + Spotify embed iframe.
│     └─ PhotoModal.jsx        Photo + title + description.
│
├─ hooks/
│  ├─ useCulling.js            Renders only near-viewport nodes (perf). Margin-based.
│  ├─ useDeepLink.js           Reads ?track= / ?clip= → pans to clip + opens player.
│  └─ useSpotifyMeta.js        Fetches album art + title via Spotify oEmbed (cached).
│
└─ icons/
   ├─ instruments.jsx          The 4 approved instrument SVGs (Phosphor + game-icons).
   ├─ symbols.jsx              Decorative symbols (clefs, sheet, vinyl, headphones, etc.).
   └─ LICENSES.md              Icon attribution (Phosphor MIT, MDI Apache-2.0, game-icons CC-BY).
```

Plus, at the repo root: `scripts/gen-media.mjs` — the build-time thumbnail/snippet
generator (see "Adding a clip").

---

## How the board is built (data flow)

1. `musicLibrary.js` defines the clips, grouped by instrument category.
2. `boardItems.js`:
   - Builds `instrumentItems` (one per category, auto-placed in a ring around center,
     pushed further out the more clips it has).
   - Builds `clipItems` (each clip scattered in a ring inside its instrument's circle).
   - Builds `photoItems`, `symbolItems`, `songItems` via `scatterItems()` — a
     collision-aware placer that drops them into empty gaps between existing nodes.
   - Concatenates everything into `boardItems`, which the board maps over.
3. `CanvasBoard.jsx` renders `boardItems` (culled to the viewport), handles pan/zoom,
   and the two focus modes (instrument focus, collection focus).

Positions are world coordinates where **(0,0) = the title center**. Each item's
`x`/`y` is an offset from center. Omit `x`/`y` and it's auto-placed; provide them to
hand-place.

---

## Adding / editing content

### Add a CLIP (video)
1. Add an object to the right category's `tracks[]` in `data/musicLibrary.js`:
   ```js
   {
     id: "guitar 04",                         // unique; becomes the slug guitar-04
     title: "Song Title",
     originalArtist: "Original Artist",
     date: "2026.01.01",
     location: "Where it was recorded",
     notes: "A sentence or two.",
     videoUrl: "https://<supabase>/.../file.mp4",
     isFeatured: true,                         // optional — violet 'featured' tag
     audioOnly: true,                          // optional — shows the OMJ pulse, no thumbnail
   }
   ```
2. Run the media pipeline to generate its thumbnail + hover snippet:
   ```
   npm run gen-media
   ```
   (Skips clips already generated. audioOnly clips are skipped by design.)
3. Commit `public/assets/music/generated/`. The clip auto-places in its instrument's ring.

### Add a PHOTO
1. Drop the image in `public/assets/music/images/`.
2. Add to the `PHOTOS` array in `data/boardItems.js`:
   ```js
   { src: "/assets/music/images/my-photo.jpg", title: "Title", description: "Description." }
   ```
   (Extensions are case-sensitive on Vercel — match exactly, e.g. `.JPG` vs `.jpg`.)
   It auto-scatters into an empty gap. Add optional `x`/`y` to hand-place.

### Add a SONG (Spotify)
1. Get the track's share link → the part after `/track/` and before `?` is the ID.
2. Add to the `SONGS` array in `data/boardItems.js`:
   ```js
   { spotifyTrackId: "7IVukH71OXfAu3KudrrizN" }
   ```
   Album art + title are fetched automatically. Auto-scatters.

### Add a SYMBOL (decorative)
Add to the `SYMBOLS` array in `data/boardItems.js`, e.g. `{ symbol: "vinyl" }`.
Available: `treble`, `bassclef`, `sheet`, `vinyl`, `headphones`, `metronome`, `notes`.

### Add an INSTRUMENT
1. Add a new category object to `musicLibrary.js` (new `id`, `label`, `tracks`).
2. In `data/boardItems.js`, add its icon key to `ICON_KEY` (map its `id` → an icon in
   `icons/instruments.jsx`). Add a new instrument SVG to `instruments.jsx` if needed.
3. It appears in the ring, the pill nav, and a mobile tab automatically.

### Hand-place any item
Give it `x` and `y` (offsets from center). Instruments use the `MANUAL` map at the top
of `boardItems.js`; photos/songs/symbols accept `x`/`y` directly in their array entry.

---

## Focus modes (desktop)

- **Instrument focus** (pill or instrument click): the instrument recenters, its clips
  fly into a grid below it, everything else fades. `focusLayout()` in `boardItems.js`.
- **Collection focus** (Photos / In My Playlist pills): all photos or all songs fly into
  a grid. `focusCollection()` in `boardItems.js`.
- Both are driven by ONE `focusMode` state in `CanvasBoard.jsx` (so they can never
  conflict). Grid uses a top-heavy row distribution (e.g. 7 → [4,3], 9 → [5,4]) and a
  fit-to-viewport scale so everything is visible.

---

## Scaling up — what to change as the board grows

The current defaults are tuned for roughly **~30 total items** (25 clips + a handful of
photos/songs/symbols). 

### ~30 → ~60 items
- Usually fine as-is. If new photos/songs start failing to place (silently missing),
  **widen the scatter band**. In `boardItems.js`, the `scatterItems(...)` calls for
  `photoItems` / `symbolItems` / `songItems` take `minRadius` / `maxRadius`. Raise
  `maxRadius` (e.g. 3200 → 4200) so there's more room.

### ~60 → ~100+ items
- **Scatter radius**: raise `maxRadius` further (e.g. → 5000+) and consider raising
  `minRadius` a little so the center doesn't crowd. Also lower `pad` slightly if you
  want them packed tighter.
- **Culling**: `hooks/useCulling.js` uses a `margin` (default ~2600). With many nodes,
  a smaller margin renders fewer at once (better perf) but pops nodes in sooner. If the
  board ever feels heavy while panning, LOWER the margin (e.g. → 1500). If nodes pop in
  too visibly, raise it. This is the main perf dial once you have lots of nodes.
- **Canvas size**: `CANVAS_SIZE` (default 6000) is the logical board size. If items get
  scattered near the edges at high `maxRadius`, bump `CANVAS_SIZE` (e.g. → 8000) and note
  `CENTER` is derived from it automatically.
- **Instrument ring**: if an instrument reaches ~15+ clips, its scatter ring
  (`ringR = 640 + n * 78` in the `clipItems` builder) grows large; you may want to reduce
  the per-clip factor (78) so the cluster stays compact.
- **Focus grid**: `focusLayout` / `focusCollection` use `perRowMax = 5`. With 15+ items in
  one focus, the grid gets tall and the fit-scale shrinks it a lot. Raise `perRowMax`
  (e.g. → 6 or 7) so it stays wider and more legible.

### If you ever have hundreds of clips
- The generated-media folder grows (one .jpg + one .mp4 per clip). That's fine on
  Vercel's CDN, but keep an eye on repo size. If it gets large, consider hosting the
  generated media on a CDN/bucket instead of committing it (would require pointing the
  thumbnail/snippet paths at that host).

---

## Performance notes

- **Culling** keeps the DOM light — only near-viewport nodes mount. The main dial is the
  `margin` in `useCulling.js`.
- **Hover previews** load a tiny local 5s muted snippet from `public/` (zero Supabase
  egress). Only one plays at a time.
- **Full videos** load from Supabase only on explicit click (the player). That's the
  only time egress happens.
- **Grid backdrop** and **zoom %** update via direct DOM writes in `onTransform`
  (not React state) so panning/zooming stays smooth.
- Mobile never mounts the canvas — it uses the tabbed grid instead.

---

## Deep-linking

`/music?track=<something>` (or `?clip=`) opens the board, pans to that clip, and opens
the player. The value is normalized, so `?track=drums 07`, `?track=drums-07`, or the
clip's title all resolve to the same clip. Works on desktop and mobile. Use this for the
spotlight link on the main page.