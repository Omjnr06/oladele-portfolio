"use client";
import React, { useEffect } from "react";
import { clipsForCategory } from "../../data/boardItems";
import { musicLibrary } from "../../data/musicLibrary";

export default function InstrumentModal({ categoryId, onClose }) {
  const cat = musicLibrary.find((c) => c.id === categoryId);
  const clips = clipsForCategory(categoryId);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!cat) return null;

  return (
    <div className="mv-modal-overlay" onClick={onClose}>
      <div className="mv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mv-modal-head">
          <div>
            <div className="mv-modal-kicker">{clips.length} clips</div>
            <h2 className="mv-modal-title">{cat.label}</h2>
          </div>
          <button className="mv-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="mv-modal-list">
          {clips.map((clip) => (
            <div key={clip.id} className="mv-clip-row">
              <div className="mv-clip-thumb" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div className="mv-clip-info">
                <div className="mv-clip-titleline">
                  <span className="mv-clip-title">{clip.title}</span>
                  {clip.isFeatured ? <span className="mv-clip-tag">featured</span> : null}
                </div>
                <div className="mv-clip-sub">{clip.originalArtist}</div>
                <div className="mv-clip-meta">{clip.date} · {clip.location}</div>
                {clip.notes ? <div className="mv-clip-notes">{clip.notes}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}