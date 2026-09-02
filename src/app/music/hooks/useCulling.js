"use client";
import { useMemo } from "react";
import { CENTER } from "../data/boardItems";

export default function useCulling(items, view, viewport, margin = 2600) {
  const { scale, x, y } = view;
  const { w, h } = viewport;

  return useMemo(() => {
    if (!w || !h) return items;
    return items.filter((it) => {
      const half = ((it.size || 300) * scale) / 2;
      const sx = x + (CENTER + it.x) * scale;
      const sy = y + (CENTER + it.y) * scale;
      return (
        sx + half > -margin &&
        sx - half < w + margin &&
        sy + half > -margin &&
        sy - half < h + margin
      );
    });
  }, [items, scale, x, y, w, h, margin]);
}