"use client";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { PREVIEW_KEY } from "@/lib/themes";

const ThemeChooser = dynamic(() => import("./ThemeChooser"), { ssr: false });

function readFlag() {
  try {
    const q = new URLSearchParams(window.location.search).get("preview");
    if (q === "packs") sessionStorage.setItem(PREVIEW_KEY, "1");
    if (q === "off") sessionStorage.removeItem(PREVIEW_KEY);
    return sessionStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

const noop = () => () => {};

export default function PreviewGate() {
  const on = useSyncExternalStore(noop, readFlag, () => false);
  return on ? <ThemeChooser /> : null;
}
