"use client";
import React from "react";
import { SYMBOL_ICONS } from "../icons/Symbols";
import { CENTER } from "../../data/boardItems";

export default function SymbolNode({ item }) {
  const Icon = SYMBOL_ICONS[item.symbol];
  if (!Icon) return null;
  const baseLeft = CENTER + item.x - item.size / 2;
  const baseTop = CENTER + item.y - item.size / 2;
  return (
    <div className="mv-symbol" style={{ left: baseLeft, top: baseTop, width: item.size, height: item.size }} aria-hidden="true">
      <Icon className="mv-symbol-ico" />
    </div>
  );
}