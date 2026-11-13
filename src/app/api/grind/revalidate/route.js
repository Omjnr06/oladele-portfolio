import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { FEED_TAG, getFeed } from "../../../grind/lib/feed";

export const dynamic = "force-dynamic";

function authorized(request) {
  const secret = process.env.GRIND_REVALIDATE_SECRET;
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!secret || !given) return false;
  const h = (s) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(given), h(secret));
}

// Called by the Grind bot right after it publishes a new open_roles.json.
export async function POST(request) {
  if (!process.env.GRIND_REVALIDATE_SECRET) {
    return Response.json({ error: "GRIND_REVALIDATE_SECRET is not set in Vercel" }, { status: 500 });
  }
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  // expire: 0 = drop the cached feed now, so the next fetch is a real one (not stale-while-revalidate).
  revalidateTag(FEED_TAG, { expire: 0 });
  // Warm the cache so the next visitor gets the new data instantly.
  const feed = await getFeed();
  return Response.json({
    revalidated: true,
    generatedAt: feed.generatedAt,
    roles: feed.rows.length,
    error: feed.error,
  });
}
