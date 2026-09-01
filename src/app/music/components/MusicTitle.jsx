"use client";
import React from "react";

const LINES = ["Oladele's", "Music Portfolio"];

export default function MusicTitle() {
  return (
    <div id="mv-home" className="mv-title">
      {LINES.map((line, li) => (
        <div key={li} className="mv-title-line">
          {line.split("").map((ch, ci) => (
            <span
              key={ci}
              className="hover-letter animate-scan mv-title-letter"
              style={{ animationDelay: `${(li * 40 + ci) * 0.12}s` }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}