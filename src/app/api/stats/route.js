import { rpc, supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-static";
export const revalidate = 600;

function summarize(rows) {
  const sum = (type, key) =>
    Object.fromEntries(
      Object.entries(
        rows
          .filter((r) => r.event_type === type)
          .reduce((acc, r) => ({ ...acc, [r[key]]: (acc[r[key]] ?? 0) + Number(r.d30) }), {}),
      ).sort((a, b) => b[1] - a[1]),
    );
  return {
    packs: sum("pack_selected", "event_name"),
    variants: sum("variant_selected", "event_name"),
    palette: sum("palette_used", "event_name"),
  };
}

export async function GET() {
  const empty = { updated: new Date().toISOString(), window: "30d", packs: {}, variants: {}, palette: {} };
  if (!supabaseConfigured()) return Response.json(empty);
  try {
    const rows = await rpc("site_stats", {}, { cache: "force-cache", next: { revalidate: 600 } });
    return Response.json({ ...empty, ...summarize(rows) });
  } catch {
    return Response.json(empty);
  }
}
