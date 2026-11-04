import { NextResponse } from "next/server";
import { OWNER_COOKIE, cookieOptions, keyMatches, ownerToken, secretConfigured } from "../../../grind/lib/auth";

const UNCONFIGURED = "The server has no DASHBOARD_SECRET. Add it in Vercel (Settings → Environment Variables, Production) and redeploy.";

export const dynamic = "force-dynamic";

function grindUrl(request, extra) {
  const url = new URL("/grind", request.url);
  const incoming = new URL(request.url).searchParams;
  incoming.forEach((v, k) => { if (k !== "key") url.searchParams.set(k, v); });
  if (extra) Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
}

export async function GET(request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!secretConfigured()) return NextResponse.redirect(grindUrl(request, { unlock: "unconfigured" }), 303);
  if (!keyMatches(key)) return NextResponse.redirect(grindUrl(request, { unlock: "failed" }), 303);
  const res = NextResponse.redirect(grindUrl(request), 303);
  res.cookies.set(OWNER_COOKIE, ownerToken(), cookieOptions);
  return res;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!secretConfigured()) return NextResponse.json({ error: UNCONFIGURED, code: "unconfigured" }, { status: 503 });
  if (!keyMatches(typeof body.key === "string" ? body.key.trim() : body.key)) return NextResponse.json({ error: "That key doesn't match." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, ownerToken(), cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
