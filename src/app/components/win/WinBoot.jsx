"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { Orb } from "./icons";
import { play } from "./sound";

export const WIN_BOOT_MS = 2100;

const TRAILS = [
  { d: "M-40 70 C 90 60, 140 150, 200 200", c: "#59c6ff" },
  { d: "M440 90 C 320 70, 260 150, 200 200", c: "#9be7ff" },
  { d: "M-30 350 C 90 340, 150 260, 200 200", c: "#ffffff" },
  { d: "M430 330 C 320 350, 250 270, 200 200", c: "#b9a4ff" },
];

export default function WinBoot({ onDone }) {
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-win-busy", "");
    const sound = setTimeout(() => play("startup"), 1500);
    const enter = setTimeout(() => {
      root.setAttribute("data-win-enter", "");
      setTimeout(() => root.removeAttribute("data-win-enter"), 900);
    }, 1600);
    const end = setTimeout(() => {
      root.removeAttribute("data-win-busy");
      done.current?.();
    }, WIN_BOOT_MS);
    return () => {
      clearTimeout(sound);
      clearTimeout(enter);
      clearTimeout(end);
      root.removeAttribute("data-win-busy");
    };
  }, []);

  return (
    <div className="wb" aria-hidden>
      <div className="wb-start">
        <svg viewBox="0 0 400 400" className="wb-trails">
          <defs>
            <filter id="wb-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {TRAILS.map((t, i) => (
            <g key={i} style={{ "--i": i }}>
              <path className="wb-trail wb-trail-glow" d={t.d} pathLength="1" stroke={t.c} filter="url(#wb-glow)" />
              <path className="wb-trail" d={t.d} pathLength="1" stroke={t.c} />
            </g>
          ))}
        </svg>
        <div className="wb-orb">
          <Orb className="wb-orb-img" />
        </div>
        <p className="wb-caption">Starting OMJ OS</p>
      </div>
      <div className="wb-welcome">
        <figure className="wb-tile">
          <Image src="/assets/images/junior-headshot.JPG" alt="" width={180} height={180} sizes="180px" loading="eager" className="wb-tile-img" />
        </figure>
        <p className="wb-hello">Welcome</p>
        <p className="wb-name">
          {profile.firstName} {profile.lastName}
        </p>
        <span className="wb-ring" />
      </div>
    </div>
  );
}
