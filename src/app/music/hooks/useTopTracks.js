"use client";
import { useEffect, useState } from "react";
import { SONGS, TOP_SLOTS } from "../data/songs";
import useSpotifyMeta from "./useSpotifyMeta";

const FALLBACK = { live: false, tracks: SONGS.map((s, rank) => ({ id: s.spotifyTrackId, rank })) };

let cached = null;
let pending = null;

export function loadTopTracks() {
  if (cached) return Promise.resolve(cached);
  pending ??= fetch("/api/spotify/top")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d?.tracks?.length ? { live: true, tracks: d.tracks.slice(0, TOP_SLOTS).map((t, rank) => ({ ...t, rank })) } : FALLBACK))
    .catch(() => FALLBACK)
    .then((v) => (cached = v));
  return pending;
}

export default function useTopTracks(enabled = true) {
  const [state, setState] = useState(cached);
  useEffect(() => {
    if (!enabled || cached) return;
    let alive = true;
    loadTopTracks().then((v) => alive && setState(v));
    return () => {
      alive = false;
    };
  }, [enabled]);
  return state ?? cached;
}

export function useSong(track) {
  const meta = useSpotifyMeta(track && !track.thumb ? track.id : null);
  if (!track) return null;
  return { ...track, title: track.title || meta?.title || "", thumb: track.thumb || meta?.thumb || "" };
}

export const spotifyUrl = (id) => `https://open.spotify.com/track/${id}`;
