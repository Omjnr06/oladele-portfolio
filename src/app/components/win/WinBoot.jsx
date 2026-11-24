"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { Orb } from "./icons";
import { play } from "./sound";

export const WIN_BOOT_MS = 2100;

const TRAILS = [
  { d: "M-40 60 C 140 -20, 330 70, 250 170 S 180 230, 200 200", c: "#ff5a36" },
  { d: "M440 60 C 420 220, 260 330, 170 250 S 230 170, 200 200", c: "#7ad13a" },
  { d: "M-30 350 C 40 170, 230 90, 260 210 S 190 230, 200 200", c: "#2fa4ff" },
  { d: "M430 340 C 250 430, 90 300, 150 190 S 220 180, 200 200", c: "#ffc43a" },
];

export function WinLeave({ text, sound, done }) {
  const fn = useRef(done);

  useEffect(() => {
    fn.current = done;
  });

  useEffect(() => {
    const quick = navigator.webdriver || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sound && !quick) play(sound);
    const t = setTimeout(() => fn.current?.(), quick ? 0 : 1500);
    return () => clearTimeout(t);
  }, [sound]);

  return (
    <div className="wb wb--leave" role="status">
      <div className="wb-welcome wb-logon">
        <span className="wb-ring" />
        <p className="wb-hello">{text}</p>
        <p className="wb-brand" aria-hidden>
          OMJ OS <span>7</span>
        </p>
      </div>
    </div>
  );
}

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
        <p className="wb-copy">© {new Date().getFullYear()} {profile.firstName} {profile.lastName}</p>
      </div>
      <div className="wb-welcome wb-logon">
        <figure className="wb-tile">
          <Image src="/assets/images/junior-headshot.JPG" alt="" width={180} height={180} sizes="180px" loading="eager" className="wb-tile-img" />
        </figure>
        <p className="wb-hello">Welcome</p>
        <p className="wb-name">
          {profile.firstName} {profile.lastName}
        </p>
        <span className="wb-ring" />
        <p className="wb-brand">
          OMJ OS <span>7</span>
        </p>
      </div>
    </div>
  );
}
