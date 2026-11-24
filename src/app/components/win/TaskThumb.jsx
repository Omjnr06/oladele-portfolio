"use client";
import { useLayoutEffect, useRef } from "react";
import WinIcon from "./icons";

const BOX_W = 196;
const BOX_H = 116;

function snapshot(id) {
  const src = document.querySelector(`.win[data-win="${CSS.escape(id)}"] > .win-client`);
  if (!src) return null;
  const copy = src.cloneNode(true);
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  copy.querySelectorAll("video, audio, iframe, script").forEach((el) => el.remove());
  const from = src.querySelectorAll("canvas");
  copy.querySelectorAll("canvas").forEach((c, i) => {
    try {
      c.getContext("2d")?.drawImage(from[i], 0, 0);
    } catch {}
  });
  copy.scrollTop = 0;
  return { node: copy, w: src.offsetWidth, h: src.offsetHeight, top: src.scrollTop };
}

export default function TaskThumb({ win, x, actions, onEnter, onLeave, onDone }) {
  const stage = useRef(null);
  const left = Math.min(Math.max(4, x - BOX_W / 2 - 8), innerWidth - BOX_W - 24);

  useLayoutEffect(() => {
    const shot = snapshot(win.id);
    const el = stage.current;
    if (!shot || !el) return;
    const s = Math.min(BOX_W / shot.w, BOX_H / shot.h);
    Object.assign(shot.node.style, {
      display: "block",
      position: "absolute",
      inset: "auto",
      top: "0",
      left: "0",
      width: `${shot.w}px`,
      height: `${shot.h}px`,
      transform: `scale(${s})`,
      transformOrigin: "0 0",
      overflow: "hidden",
    });
    el.style.width = `${Math.round(shot.w * s)}px`;
    el.style.height = `${Math.round(shot.h * s)}px`;
    el.replaceChildren(shot.node);
    shot.node.scrollTop = shot.top;
    return () => el.replaceChildren();
  }, [win.id]);

  return (
    <div
      className="tt"
      style={{ left }}
      onPointerEnter={() => {
        onEnter();
        actions.peek(win.id);
      }}
      onPointerLeave={() => {
        actions.peek(null);
        onLeave();
      }}
    >
      <div className="tt-head">
        <WinIcon name={win.icon} className="tt-ico" />
        <span className="tt-title">{win.title}</span>
        <button
          type="button"
          className="tt-x"
          aria-label={`Close ${win.title}`}
          onClick={() => {
            actions.peek(null);
            onDone();
            actions.close(win.id);
          }}
        >
          <svg viewBox="0 0 10 10" aria-hidden>
            <path d="M2 2l6 6M8 2L2 8" />
          </svg>
        </button>
      </div>
      <button
        type="button"
        className="tt-shot"
        aria-label={`Switch to ${win.title}`}
        onClick={() => {
          actions.peek(null);
          onDone();
          actions.focus(win.id, { restore: true });
        }}
      >
        <span ref={stage} className="tt-stage" inert aria-hidden />
      </button>
    </div>
  );
}
