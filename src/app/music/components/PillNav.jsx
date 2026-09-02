"use client";
import React from "react";
import { NAV_INSTRUMENTS } from "../data/boardItems";
import { INSTRUMENT_ICONS } from "./icons/Instruments";

const PhotosIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
);
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.8-.87 7.08-.5 9.72 1.11a.62.62 0 0 1 .21.86zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.98-1.16a.78.78 0 1 1-.45-1.49c3.63-1.1 8.14-.57 11.24 1.32a.78.78 0 0 1 .26 1.07zm.1-2.85C14.83 8.98 9.4 8.8 6.3 9.74a.93.93 0 1 1-.54-1.78c3.56-1.08 9.56-.87 13.33 1.37a.93.93 0 1 1-.95 1.6z" /></svg>
);

export default function PillNav({ onFly, onCollection, onHome }) {
  const byId = (id) => NAV_INSTRUMENTS.find((n) => n.instrumentId === id);

  const Pill = ({ id }) => {
    const item = byId(id);
    if (!item) return null;
    const Icon = INSTRUMENT_ICONS[item.instrumentId];
    return (
      <button className="mv-pill" onClick={() => onFly(item.instrumentId)}>
        {Icon ? <Icon className="mv-pill-ico" /> : null}
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="mv-pillnav" aria-label="Board navigation">
      <button className="mv-pill mv-pill--alt" onClick={() => onCollection("photos")}>
        <PhotosIcon /><span>Photos</span>
      </button>
      <Pill id="piano" />
      <Pill id="drums" />

      <button className="mv-home" onClick={onHome} aria-label="Home">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      </button>

      <Pill id="guitar" />
      <Pill id="bass" />
      <button className="mv-pill mv-pill--spotify" onClick={() => onCollection("songs")}>
        <SpotifyIcon /><span>In My Playlist</span>
      </button>
    </nav>
  );
}