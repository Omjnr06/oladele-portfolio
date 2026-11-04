import { regionsFor, seasonFor } from "./normalize";

const RAW_URL = "https://raw.githubusercontent.com/Omjnr06/Grind/bot-state/open_roles.json";

export async function getFeed() {
  try {
    const res = await fetch(RAW_URL, { next: { revalidate: 900, tags: ["grind-feed"] } });
    if (!res.ok) throw new Error(`The pipeline feed returned HTTP ${res.status}`);
    const data = await res.json();
    const rows = (data.roles || []).map((r) => [
      r.tier, r.track || "swe", r.company, r.title, r.location, regionsFor(r.location), seasonFor(r.season), r.source, r.url,
      r.first_seen ? Date.parse(r.first_seen) : 0,
    ]);
    return { generatedAt: data.generated_at || null, rows, error: null };
  } catch (e) {
    return { generatedAt: null, rows: [], error: e.message || "Couldn't reach the pipeline feed" };
  }
}

