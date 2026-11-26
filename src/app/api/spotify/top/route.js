export const dynamic = "force-static";
export const revalidate = 86400;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const TOP_URL = "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10";

function configured() {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN);
}

async function accessToken() {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return (await res.json()).access_token;
}

function art(images = []) {
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= 300) ?? sorted.at(-1))?.url ?? null;
}

export async function GET() {
  const empty = { updated: new Date().toISOString(), range: "4w", tracks: null };
  if (!configured()) return Response.json(empty);
  try {
    const token = await accessToken();
    const res = await fetch(TOP_URL, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) throw new Error(`top ${res.status}`);
    const { items = [] } = await res.json();
    const tracks = items
      .filter((t) => t?.id)
      .map((t) => ({
        id: t.id,
        title: t.name,
        artist: (t.artists ?? []).map((a) => a.name).join(", "),
        thumb: art(t.album?.images),
      }));
    return Response.json({ ...empty, tracks: tracks.length ? tracks : null });
  } catch {
    return Response.json(empty);
  }
}
