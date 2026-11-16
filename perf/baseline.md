# Performance baseline — before theme packs (Nov 14 2026, `main` @ 8231d0f)

## Vercel Speed Insights (real users, desktop, P75, last 7 days)

| Scope | RES | Visits |
| --- | --- | --- |
| Overall | 95 | — |
| `/` | 100 | 63 |
| `/grind` | 88 | 210 |
| `/music` | 82 | 13 |

Per-metric values need Vercel Plus.

## Lighthouse (live site, single run each, Lighthouse 12.8.2, headless Chromium)

| Page | Device | Perf | FCP | LCP | TBT | CLS | Speed Index | LCP element |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Mobile | 36 | 1.0s | 8.7s | 7,890ms | 0 | 9.7s | hero letter span |
| `/` | Desktop | 77 | 0.3s | 2.2s | 270ms | 0 | 1.5s | hero letter span |
| `/projects/jam` | Mobile | 64 | 1.2s | 3.6s | 1,200ms | 0 | 4.2s | intro paragraph |
| `/projects/jam` | Desktop | 68 | 0.3s | 1.0s | 1,050ms | 0 | 1.6s | paragraph |

## Build (`next build`, Next 16.2.4 Turbopack)

All pages static (`○`) except `/grind` (`ƒ`, reads the owner cookie on every request) and the API routes.

## Transferred KB on first load (`npm run perf`, local `next start`, 1366×768)

| route | document | script | stylesheet | font | image | media | other |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 9 | 260 | 19 | 52 | 1953 | 0 | 8 |
| /resume | 10 | 260 | 19 | 52 | 1 | 0 | 10 |
| /projects/jam | 5 | 224 | 15 | 52 | 1 | 0 | 4 |
| /projects/pimplenet | 7 | 222 | 15 | 52 | 60 | 0 | 4 |
| /projects/vault | 5 | 226 | 15 | 52 | 1 | 0 | 4 |
| /music | 3 | 225 | 19 | 52 | 1633 | 0 | 4 |
| /grind | 139 | 282 | 15 | 52 | 1 | 0 | 4 |

## What's slow today (to fix inside the planned passes)

1. **`template.js` hides every page until hydration.** It server-renders `opacity: 0` + `blur(15px)`,
   so LCP waits for ~260KB of JS to download, parse and hydrate. Main cause of the 8.7s mobile LCP.
   Fixed in pass 1a (CSS keyframe, see below).
2. **Home loads all 12 gallery photos (~1.9MB) at once.** They're stacked in the same box, so
   lazy loading never kicks in. Load the current + next photo only (pass 1b).
3. **Every page is one big client component** (home 850 lines + all of `musicLibrary`); TBT
   1–8s on mobile. Thin server pages + small client islands (pass 1b).
4. **Ghost-scan animates `text-shadow`/`color` on 16 letters forever** → constant repaints.
   Revisit with the Modern boot hand-off (pass 2).
5. **`/grind` is dynamic only because of the owner cookie.** Public board could be static/ISR,
   with owner data fetched client-side — likely lifts its 88 RES. Candidate follow-up.
6. `/music` thumbnails ~1.6MB on first load — check sizes/formats in pass 4.
7. `metadataBase` not set (build warning) — set it in pass 1b so OG image URLs are absolute.

## After pass 1a (Nov 16 2026, local `next start`, Lighthouse mobile, 2 runs each)

| Page | Before (score / LCP) | After (score / LCP) |
| --- | --- | --- |
| `/` | 44–49 / 8.9–9.0s | 49–71 / 7.9–8.6s |
| `/projects/jam` | 73–75 / 3.6–3.9s | 73–93 / 3.1–3.5s |
| `/resume` | — | 95–96 / 2.8–2.9s |

- `template.js` is now a server component with a CSS keyframe. Pages paint at first paint
  instead of after hydration. Real-browser LCP on home (4× CPU throttle) went from ~1.3–1.7s
  (live site) to ~0.5–0.9s, and now lands before the JS finishes.
- The keyframe starts at `opacity: 0.001`, not 0. Chrome skips LCP for anything painted at
  exactly 0, which pushed LCP to the first paint after hydration. 0.001 looks identical.
- Home's lab LCP is now the first gallery photo, which competes with all 12 photos loading at
  once (item 2 below, pass 1b).
- Scripts +3KB per route (prefs store + preview gate). The theme chooser is a lazy chunk that
  only loads with `?preview=packs`.
- Lighthouse TBT swings a lot run to run on this machine; compare LCP and the real-browser
  numbers, not single scores.

## How to re-measure

```
npm run build
npm run test:smoke            # 30 checks, desktop 1366×600 + phone 390×700
npm run test:visual           # compares 7 routes × 5 sizes to the local baseline
VISUAL_STRICT=1 npm run test:visual   # near pixel-exact (music/grind keep normal tolerance)
npx next start -p 3100 & npm run perf <label>
```
Lighthouse: `npx lighthouse@12.8.2 <url> --only-categories=performance [--preset=desktop]`.
Visual baseline images are local only (`tests/visual/.baseline/`, gitignored). Regenerate them
from `main` with `npm run test:visual:baseline` before a pass if they're missing.
