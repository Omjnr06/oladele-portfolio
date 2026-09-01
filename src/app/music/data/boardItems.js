import { musicLibrary } from "./musicLibrary";

export const CANVAS_SIZE = 6000;
export const CENTER = CANVAS_SIZE / 2;

const ICON_KEY = { PIANO: "piano", DRUMS: "drums", GUITAR: "guitar", BASS: "bass" };

const MANUAL = {
};

const BASE_RADIUS = 1150;
const RADIUS_PER_CLIP = 55;

function autoPlace(index, total, clipCount) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = BASE_RADIUS + clipCount * RADIUS_PER_CLIP;
  return { x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) };
}

export const instrumentItems = musicLibrary.map((cat, i) => {
  const clipCount = cat.tracks.length;
  const manual = MANUAL[cat.id];
  const pos = manual || autoPlace(i, musicLibrary.length, clipCount);
  return {
    id: `inst-${cat.id.toLowerCase()}`,
    type: "instrument",
    categoryId: cat.id,
    instrumentId: ICON_KEY[cat.id] || "piano",
    label: cat.label,
    clipCount,
    size: 340 + Math.min(clipCount, 8) * 14,
    x: pos.x,
    y: pos.y,
  };
});

export const boardItems = [...instrumentItems];

export const NAV_INSTRUMENTS = instrumentItems.map((it) => ({
  instrumentId: it.instrumentId,
  anchorId: it.id,
  label: it.instrumentId.charAt(0).toUpperCase() + it.instrumentId.slice(1),
}));

export function clipsForCategory(categoryId) {
  const cat = musicLibrary.find((c) => c.id === categoryId);
  return cat ? cat.tracks : [];
}