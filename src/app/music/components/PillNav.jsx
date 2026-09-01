"use client";
import React from "react";
import { NAV_INSTRUMENTS } from "../data/boardItems";
import { INSTRUMENT_ICONS } from "./icons/Instruments";

export default function PillNav({ onFly, onHome }) {
  const left = NAV_INSTRUMENTS.slice(0, 2);
  const right = NAV_INSTRUMENTS.slice(2);

  const Pill = ({ item }) => {
    const Icon = INSTRUMENT_ICONS[item.instrumentId];
    return (
      <button className="mv-pill" onClick={() => onFly(item.instrumentId)}>
        {Icon ? <Icon className="mv-pill-ico" /> : null}
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="mv-pillnav" aria-label="Jump to instrument">
      {left.map((it) => <Pill key={it.instrumentId} item={it} />)}
      <button className="mv-home" onClick={onHome} aria-label="Home">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      </button>
      {right.map((it) => <Pill key={it.instrumentId} item={it} />)}
    </nav>
  );
}