import { createHash } from "node:crypto";
import { THEMES, PACKS } from "@/lib/themes";
import { rpc, supabaseConfigured } from "@/lib/supabase";

const PACK_IDS = PACKS.map((p) => p.id);
const VARIANT_IDS = Object.values(THEMES).flatMap((t) => t.variants.map((v) => v.id));
const PALETTE_TYPES = ["page", "section", "project", "experience", "skill", "clip", "photo", "link", "action"];
const SLUG = /^[a-z0-9-]{1,32}$/;

const NAMES = {
  pack_selected: (n) => PACK_IDS.includes(n),
  variant_selected: (n) => VARIANT_IDS.includes(n),
  palette_used: (n) => PALETTE_TYPES.includes(n),
  boot_skipped: (n) => PACK_IDS.includes(n),
  window_opened: (n) => SLUG.test(n),
};

const done = (status = 204) => new Response(null, { status });

function sameOrigin(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function visitorKey(request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}|${day}|${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request) {
  if (!sameOrigin(request)) return done(403);
  const raw = await request.text();
  if (raw.length > 512) return done(413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return done(400);
  }
  const { type, name, pack, variant, path } = body ?? {};
  if (typeof type !== "string" || typeof name !== "string" || !NAMES[type]?.(name)) return done(400);
  if (!supabaseConfigured()) return done();

  const p = THEMES[pack] ? pack : null;
  const v = p && THEMES[p].variants.some((x) => x.id === variant) ? variant : null;
  const route = typeof path === "string" && /^\/[a-z0-9\-/]{0,63}$/i.test(path) ? path : null;

  try {
    await rpc("log_event", { p_key: visitorKey(request), p_type: type, p_name: name, p_pack: p, p_variant: v, p_path: route });
  } catch {}
  return done();
}
