import { useSyncExternalStore } from "react";

let current = null;
const listeners = new Set();

export function setNowPlaying(track) {
  current = track;
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useNowPlaying() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
