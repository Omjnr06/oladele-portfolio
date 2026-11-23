"use client";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

export default function ProjectMedia({ p, sizes, className = "", priority = false, full = false }) {
  const reduce = useReducedMotion();
  const { media } = p;
  const portrait = media.orientation === "portrait";
  const fit = media.fit === "contain" || portrait ? "object-contain" : "object-cover object-top";
  const still = media.image ?? media.poster;
  const box = `absolute inset-0 h-full w-full ${fit} ${className}`;
  if (media.video && portrait && !reduce) {
    return <video key={p.id} src={media.video} poster={media.image} autoPlay muted loop playsInline preload="metadata" className={box} />;
  }
  if (media.video && full) {
    return <video key={p.id} src={media.video} poster={media.poster ?? media.image} controls playsInline preload="none" className={`${box} bg-black`} />;
  }
  if (media.loop && !reduce) {
    return <video key={p.id} src={media.loop} poster={media.poster} autoPlay muted loop playsInline preload="metadata" className={box} />;
  }
  if (!still) return null;
  return <Image key={p.id} src={still} alt="" fill sizes={sizes} priority={priority} className={`${fit} ${className}`} />;
}
