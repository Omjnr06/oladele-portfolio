"use client";
import { useState, useEffect } from "react";

const cache = new Map();

export default function useSpotifyMeta(trackId) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!trackId || cache.has(trackId)) return;
    let alive = true;
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`)
      .then((r) => r.json())
      .then((d) => {
        const m = { title: d.title || "", thumb: d.thumbnail_url || "" };
        cache.set(trackId, m);
        if (alive) setTick((n) => n + 1);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [trackId]);
  return cache.get(trackId) || null;
}