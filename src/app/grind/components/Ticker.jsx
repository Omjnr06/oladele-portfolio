"use client";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export function Ticker({ value, format = (v) => Math.round(v).toLocaleString() }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, format);
  useEffect(() => {
    const c = animate(mv, value, { type: "spring", stiffness: 200, damping: 30 });
    return c.stop;
  }, [value, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}
