"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CENTER } from "../../data/boardItems";

const spring = { type: "spring", stiffness: 240, damping: 28 };

export default function ClipNode({ item, hoveredId, onHover, onOpen, focusX, focusY, dimmed, delay = 0 }) {
  const active = hoveredId === item.id;
  const timer = useRef(null);
  const [ready, setReady] = useState(false);

  const enter = useCallback(() => {
    if (item.audioOnly || dimmed) return;
    timer.current = setTimeout(() => onHover(item.id), 160);
  }, [item.id, item.audioOnly, dimmed, onHover]);

  const leave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setReady(false);
    if (active) onHover(null);
  }, [active, onHover]);

  const baseLeft = CENTER + item.x - item.size / 2;
  const baseTop = CENTER + item.y - item.size / 2;

  return (
    <motion.div
      className="mv-node-pos"
      style={{ left: baseLeft, top: baseTop, width: item.size, height: item.size, zIndex: dimmed ? 0 : active ? 6 : 3 }}
      initial={false}
      animate={{ x: focusX - item.x, y: focusY - item.y, opacity: dimmed ? 0 : 1 }}
      transition={{ ...spring, delay }}
    >
      <button
        className={`mv-clip-node${item.isFeatured ? " mv-clip-featured" : ""}`}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onClick={() => onOpen(item)}
        style={{ pointerEvents: dimmed ? "none" : "auto" }}
      >
        {item.audioOnly ? (
          <div className="mv-clip-audio">
            <svg viewBox="0 0 100 100" className="mv-clip-audio-svg">
              <text x="50" y="44" textAnchor="middle" fontFamily="monospace" fontSize="34" fontWeight="900" fill="#8b5cf6">OMJ</text>
              <text x="50" y="88" textAnchor="middle" fontFamily="monospace" fontSize="34" fontWeight="900" fill="#22d3ee">{">_"}</text>
            </svg>
          </div>
        ) : (
          <>
            <img src={item.thumb} alt={item.title} className="mv-clip-img" style={{ opacity: active && ready ? 0 : 1 }} draggable="false" />
            {active ? (
              <video src={item.snippet} className="mv-clip-video" autoPlay muted loop playsInline preload="none" onCanPlay={() => setReady(true)} />
            ) : null}
            {active && ready ? (
              <span className="mv-clip-live"><span className="mv-clip-live-dot" />preview</span>
            ) : null}
          </>
        )}
        <div className="mv-clip-name">{item.title}</div>
      </button>
    </motion.div>
  );
}