import { regionsFor, seasonFor } from "./normalize";

export const FEED_TAG = "grind-feed";

// The GitHub API serves the bot-state file fresh. raw.githubusercontent.com sits behind a
// ~5-minute CDN cache, so it's only the fallback (e.g. if the API rate-limits us).
const API_URL = "https://api.github.com/repos/Omjnr06/Grind/contents/open_roles.json?ref=bot-state";
const RAW_URL = "https://raw.githubusercontent.com/Omjnr06/Grind/bot-state/open_roles.json";

// Backstop only: the bot calls /api/grind/revalidate after every run, which expires this immediately.
const CACHE = { next: { revalidate: 900, tags: [FEED_TAG] } };

async function fetchFeedJson() {
  const headers = { Accept: "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" };
  const token = process.env.GITHUB_FEED_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(API_URL, { ...CACHE, headers });
    if (res.ok) return await res.json();
    console.warn(`[grind feed] GitHub API returned HTTP ${res.status}; falling back to raw`);
  } catch (e) {
    console.warn(`[grind feed] GitHub API failed (${e.message}); falling back to raw`);
  }
  const res = await fetch(RAW_URL, CACHE);
  if (!res.ok) throw new Error(`The pipeline feed returned HTTP ${res.status}`);
  return res.json();
}

export async function getFeed() {
  try {
    const data = await fetchFeedJson();
    const rows = (data.roles || []).map((r) => [
      r.tier, r.track || "swe", r.company, r.title, r.location, regionsFor(r.location), seasonFor(r.season), r.source, r.url,
      r.first_seen ? Date.parse(r.first_seen) : 0,
    ]);
    return { generatedAt: data.generated_at || null, rows, error: null };
  } catch (e) {
    return { generatedAt: null, rows: [], error: e.message || "Couldn't reach the pipeline feed" };
  }
}
