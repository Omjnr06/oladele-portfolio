"use client";
import React from "react";
import { motion } from "framer-motion";
import { INSTRUMENT_ICONS } from "../icons/Instruments";
import { CENTER } from "../../data/boardItems";

const spring = { type: "spring", stiffness: 240, damping: 28 };

export default function InstrumentNode({ item, onOpen, focusX, focusY, dimmed }) {
  const Icon = INSTRUMENT_ICONS[item.instrumentId];
  const baseLeft = CENTER + item.x - item.size / 2;
  const baseTop = CENTER + item.y - item.size / 2;
  return (
    <motion.div
      className="mv-node-pos"
      style={{ left: baseLeft, top: baseTop, width: item.size, height: item.size, zIndex: dimmed ? 0 : 2 }}
      initial={false}
      animate={{ x: focusX - item.x, y: focusY - item.y, opacity: dimmed ? 0 : 1 }}
      transition={spring}
    >
      <button
        id={item.id}
        className="mv-inst"
        onClick={() => onOpen(item.categoryId)}
        style={{ pointerEvents: dimmed ? "none" : "auto" }}
      >
        <span className="mv-inst-glow">{Icon ? <Icon className="mv-inst-ico" /> : null}</span>
        <span className="mv-inst-label">{item.label}</span>
        <span className="mv-inst-count">{item.clipCount} clips</span>
      </button>
    </motion.div>
  );
}