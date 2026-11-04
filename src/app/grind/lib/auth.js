import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const OWNER_COOKIE = "grind_owner";

export function ownerToken() {
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("grind-owner-v1").digest("hex");
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function keyMatches(key) {
  return safeEqual(key, process.env.DASHBOARD_SECRET);
}

export function tokenMatches(token) {
  return safeEqual(token, ownerToken());
}

export async function isOwner() {
  const store = await cookies();
  return tokenMatches(store.get(OWNER_COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
