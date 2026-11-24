import { NextResponse } from "next/server";
import { getFeed } from "../../../grind/lib/feed";
import { isOwner } from "../../../grind/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const [feed, owner] = await Promise.all([getFeed(), isOwner()]);
  return NextResponse.json({ ...feed, owner }, { headers: { "Cache-Control": "private, no-store" } });
}
