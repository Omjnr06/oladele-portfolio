"use client";
import { useState, useEffect } from "react";

const cache = new Map();

export default function useSpotifyMeta(trackId) {
  const [meta, setMeta] = useState(() => cache.get(trackId) || null);
  useEffect(() => {
    if (!trackId) return;
    if (cache.has(trackId)) { setMeta(cache.get(trackId)); return; }
    let alive = true;
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`)
      .then((r) => r.json())
      .then((d) => {
        const m = { title: d.title || "", thumb: d.thumbnail_url || "" };
        cache.set(trackId, m);
        if (alive) setMeta(m);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [trackId]);
  return meta;
}