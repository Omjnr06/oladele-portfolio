"use client";
import React, { useState, useEffect } from "react";
import CanvasBoard from "./components/CanvasBoard";
import MobileWheel from "./components/MobileWheel";
import "./MusicCanvas.css";

export default function MusicPage() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const handheld =
      navigator.userAgentData?.mobile === true ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const decide = () => setMode(handheld || window.innerWidth < 640 ? "mobile" : "desktop");
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  if (mode === null) return <div className="mv-boot" />;
  return mode === "mobile" ? <MobileWheel /> : <CanvasBoard />;
}