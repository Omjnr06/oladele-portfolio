"use client";
import React, { useEffect } from "react";
import useSpotifyMeta from "../../hooks/useSpotifyMeta";

export default function SongModal({ song, onClose }) {
  const meta = useSpotifyMeta(song.spotifyTrackId);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="mv-song-overlay" onClick={onClose}>
      <div className="mv-song-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mv-song-modal-head">
          {meta?.thumb ? <img src={meta.thumb} alt={meta.title} className="mv-song-modal-art" /> : null}
          <div className="mv-song-modal-meta">
            <span className="mv-song-modal-kicker">In Oladele&apos;s Playlist</span>
            {meta?.title ? <h3 className="mv-song-modal-title">{meta.title}</h3> : null}
          </div>
          <button className="mv-song-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <iframe
          className="mv-song-embed"
          src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}