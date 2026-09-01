"use client";
import { useEffect } from "react";
import { clipItems } from "../data/boardItems";

function norm(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function useDeepLink(onClip) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("track") || params.get("clip");
    if (!raw) return;
    const key = norm(raw);
    const match = clipItems.find(
      (c) => norm(c.trackId) === key || c.id === `clip-${key}` || norm(c.title) === key
    );
    if (match) {
      const t = setTimeout(() => onClip(match), 500);
      return () => clearTimeout(t);
    }
  }, [onClip]);
}