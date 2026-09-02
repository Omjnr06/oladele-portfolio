"use client";
import React from "react";
import { motion } from "framer-motion";
import { CENTER } from "../../data/boardItems";
import useSpotifyMeta from "../../hooks/useSpotifyMeta";

const spring = { type: "spring", stiffness: 240, damping: 28 };

export default function SongNode({ item, onOpen, focusX, focusY, dimmed, delay = 0 }) {
  const meta = useSpotifyMeta(item.spotifyTrackId);
  const fx = focusX ?? item.x;
  const fy = focusY ?? item.y;
  const baseLeft = CENTER + item.x - item.size / 2;
  const baseTop = CENTER + item.y - item.size / 2;
  return (
    <motion.div
      className="mv-node-pos"
      style={{ left: baseLeft, top: baseTop, width: item.size, height: item.size, zIndex: dimmed ? 0 : 3 }}
      initial={false}
      animate={{ x: fx - item.x, y: fy - item.y, opacity: dimmed ? 0 : 1 }}
      transition={{ ...spring, delay }}
    >
      <button className="mv-song" onClick={() => onOpen(item)} style={{ pointerEvents: dimmed ? "none" : "auto" }}>
        {meta?.thumb ? <img src={meta.thumb} alt={meta.title} className="mv-song-art" draggable="false" /> : null}
        <div className="mv-song-badge">
          <svg viewBox="0 0 24 24" className="mv-song-logo" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.11a.62.62 0 0 1 .21.86zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.98-1.16a.78.78 0 1 1-.45-1.49c3.63-1.1 8.14-.57 11.24 1.32a.78.78 0 0 1 .26 1.07zm.1-2.85C14.83 8.98 9.4 8.8 6.3 9.74a.93.93 0 1 1-.54-1.78c3.56-1.08 9.56-.87 13.33 1.37a.93.93 0 1 1-.95 1.6z" /></svg>
        </div>
        <div className="mv-song-name">
          <span className="mv-song-kicker">In Oladele&apos;s Playlist</span>
          {meta?.title ? <span className="mv-song-track">{meta.title}</span> : null}
        </div>
      </button>
    </motion.div>
  );
}