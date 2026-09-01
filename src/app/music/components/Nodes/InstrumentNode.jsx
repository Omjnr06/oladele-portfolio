"use client";
import React from "react";
import { INSTRUMENT_ICONS } from "../icons/Instruments";
import { CENTER } from "../../data/boardItems";

export default function InstrumentNode({ item, onOpen }) {
  const Icon = INSTRUMENT_ICONS[item.instrumentId];
  return (
    <button
      id={item.id}
      className="mv-inst"
      style={{ left: CENTER + item.x, top: CENTER + item.y, width: item.size, height: item.size }}
      onClick={() => onOpen(item.categoryId)}
    >
      <span className="mv-inst-glow">
        {Icon ? <Icon className="mv-inst-ico" /> : null}
      </span>
      <span className="mv-inst-label">{item.label}</span>
      <span className="mv-inst-count">{item.clipCount} clips</span>
    </button>
  );
}