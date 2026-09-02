"use client";
import React, { useEffect } from "react";

export default function PhotoModal({ photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="mv-photo-overlay" onClick={onClose}>
      <div className="mv-photo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mv-photo-modal-x" onClick={onClose} aria-label="Close">✕</button>
        <img src={photo.src} alt={photo.title} className="mv-photo-modal-img" />
        <div className="mv-photo-modal-info">
          <h3 className="mv-photo-modal-title">{photo.title}</h3>
          {photo.description ? <p className="mv-photo-modal-desc">{photo.description}</p> : null}
        </div>
      </div>
    </div>
  );
}