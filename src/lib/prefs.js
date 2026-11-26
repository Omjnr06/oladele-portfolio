import { useSyncExternalStore } from "react";
import { DEFAULT_THEME, OVERRIDE_KEY, PREFS_KEY, parseThemeParam, resolveTheme } from "./themes";

const NAV_MODES = ["rail", "pill"];

export const DEFAULT_PREFS = { ...DEFAULT_THEME, navMode: "rail", sound: true };
const SERVER_SNAPSHOT = { ...DEFAULT_PREFS, override: false };

const listeners = new Set();
let cache = null;

function storage(kind) {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function read(kind, key) {
  try {
    return storage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(kind, key, value) {
  try {
    const s = storage(kind);
    if (!s) return;
    if (value == null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {}
}

function sanitize(raw) {
  const p = raw && typeof raw === "object" ? raw : {};
  return {
    ...resolveTheme(p),
    navMode: NAV_MODES.includes(p.navMode) ? p.navMode : DEFAULT_PREFS.navMode,
    sound: typeof p.sound === "boolean" ? p.sound : DEFAULT_PREFS.sound,
  };
}

function readSaved() {
  try {
    return sanitize(JSON.parse(read("localStorage", PREFS_KEY)));
  } catch {
    return sanitize(null);
  }
}

function compute() {
  const saved = readSaved();
  const override = parseThemeParam(read("sessionStorage", OVERRIDE_KEY));
  return override ? { ...saved, ...override, override: true } : { ...saved, override: false };
}

export function applyTheme({ pack, variant, navMode }) {
  const d = document.documentElement;
  if (d.getAttribute("data-pack") !== pack) d.setAttribute("data-pack", pack);
  if (d.getAttribute("data-theme") !== variant) d.setAttribute("data-theme", variant);
  if (pack === "paper") d.setAttribute("data-nav", "tabs");
  else if (d.getAttribute("data-nav") === "tabs") d.setAttribute("data-nav", navMode ?? getPrefs().navMode);
}

function refresh() {
  cache = compute();
  applyTheme(cache);
  listeners.forEach((l) => l());
}

export function getPrefs() {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (!cache) cache = compute();
  return cache;
}

export function savePrefs(patch) {
  write("localStorage", PREFS_KEY, JSON.stringify(sanitize({ ...readSaved(), ...patch })));
  if ("pack" in patch || "variant" in patch) write("sessionStorage", OVERRIDE_KEY, null);
}

export function setPrefs(patch) {
  const next = sanitize({ ...readSaved(), ...patch });
  write("localStorage", PREFS_KEY, JSON.stringify(next));
  if ("pack" in patch || "variant" in patch) write("sessionStorage", OVERRIDE_KEY, null);
  refresh();
}

function onStorage(e) {
  if (e.key === PREFS_KEY || e.key === null) refresh();
}

export function subscribePrefs(listener) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function usePrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs, () => SERVER_SNAPSHOT);
}
