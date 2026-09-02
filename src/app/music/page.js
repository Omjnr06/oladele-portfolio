"use client";
import React, { useState, useEffect } from "react";
import CanvasBoard from "./components/CanvasBoard";
import MobileWheel from "./components/MobileWheel";
import "./MusicCanvas.css";

export default function MusicPage() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const decide = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const noHover = window.matchMedia("(hover: none)").matches;
      const tiny = window.innerWidth < 640;
      setMode((coarse && noHover) || tiny ? "mobile" : "desktop");
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  if (mode === null) return <div className="mv-boot" />;
  return mode === "mobile" ? <MobileWheel /> : <CanvasBoard />;
}