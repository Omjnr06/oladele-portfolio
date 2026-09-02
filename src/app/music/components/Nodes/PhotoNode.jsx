"use client";
import React from "react";
import { motion } from "framer-motion";
import { CENTER } from "../../data/boardItems";

const spring = { type: "spring", stiffness: 240, damping: 28 };

export default function PhotoNode({ item, onOpen, focusX, focusY, dimmed, delay = 0 }) {
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
      <button className="mv-photo" onClick={() => onOpen(item)} style={{ pointerEvents: dimmed ? "none" : "auto" }}>
        <img src={item.src} alt={item.title} className="mv-photo-img" draggable="false" />
        <div className="mv-photo-name">{item.title}</div>
      </button>
    </motion.div>
  );
}