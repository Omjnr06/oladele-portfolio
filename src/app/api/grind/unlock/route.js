import { NextResponse } from "next/server";
import { OWNER_COOKIE, cookieOptions, keyMatches, ownerToken } from "../../../grind/lib/auth";

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
  if (!keyMatches(key)) return NextResponse.redirect(grindUrl(request, { unlock: "failed" }), 303);
  const res = NextResponse.redirect(grindUrl(request), 303);
  res.cookies.set(OWNER_COOKIE, ownerToken(), cookieOptions);
  return res;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!keyMatches(body.key)) return NextResponse.json({ error: "That key doesn't match." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, ownerToken(), cookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
