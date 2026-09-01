import { musicLibrary } from "./musicLibrary";

export const CANVAS_SIZE = 6000;
export const CENTER = CANVAS_SIZE / 2;

const ICON_KEY = { PIANO: "piano", DRUMS: "drums", GUITAR: "guitar", BASS: "bass" };

const MANUAL = {
};

const BASE_RADIUS = 1750;
const RADIUS_PER_CLIP = 60;

function autoPlace(index, total, clipCount) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = BASE_RADIUS + clipCount * RADIUS_PER_CLIP;
  return { x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) };
}

function clipSlug(id) {
  return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
    size: 640 + Math.min(clipCount, 8) * 28,
    x: pos.x,
    y: pos.y,
  };
});

export const clipItems = musicLibrary.flatMap((cat, ci) => {
  const inst = instrumentItems[ci];
  const n = cat.tracks.length;
  const ringR = 640 + n * 78;
  const offset = (ci * 1.3) % (Math.PI * 2);
  return cat.tracks.map((track, ti) => {
    const angle = offset + (ti / n) * Math.PI * 2;
    const x = Math.round(inst.x + Math.cos(angle) * ringR);
    const y = Math.round(inst.y + Math.sin(angle) * ringR);
    const slug = clipSlug(track.id);
    const audioOnly = !!track.audioOnly;
    return {
      id: `clip-${slug}`,
      type: "clip",
      categoryId: cat.id,
      trackId: track.id,
      title: track.title,
      originalArtist: track.originalArtist,
      date: track.date,
      location: track.location,
      notes: track.notes,
      audioOnly,
      isFeatured: !!track.isFeatured,
      videoUrl: track.videoUrl,
      thumb: audioOnly ? null : `/assets/music/generated/${slug}.jpg`,
      snippet: audioOnly ? null : `/assets/music/generated/${slug}.mp4`,
      size: 460,
      x,
      y,
    };
  });
});

export const boardItems = [...instrumentItems, ...clipItems];

export const NAV_INSTRUMENTS = instrumentItems.map((it) => ({
  instrumentId: it.instrumentId,
  anchorId: it.id,
  label: it.instrumentId.charAt(0).toUpperCase() + it.instrumentId.slice(1),
}));

export function clipsForCategory(categoryId) {
  const cat = musicLibrary.find((c) => c.id === categoryId);
  return cat ? cat.tracks : [];
}

export function clipItemsForCategory(categoryId) {
  return clipItems.filter((c) => c.categoryId === categoryId);
}

export function focusLayout(categoryId) {
  const inst = instrumentItems.find((it) => it.categoryId === categoryId);
  const clips = clipItems.filter((c) => c.categoryId === categoryId);
  const n = clips.length;
  const instSize = inst.size || 700;

  const perRowMax = 5;
  const rows = Math.ceil(n / perRowMax);
  const base = Math.floor(n / rows);
  const extra = n % rows;
  const rowCounts = [];
  for (let r = 0; r < rows; r++) rowCounts.push(base + (r < extra ? 1 : 0));

  const clipSize = clips[0]?.size || 460;
  const gapX = clipSize * 0.28;
  const gapY = clipSize * 0.34;

  const instFocusX = 0;
  const instFocusY = -(instSize / 2) - 640;
  const gridTop = instFocusY + instSize / 2 + 330;

  const slots = [];
  let idx = 0;
  let maxRowW = 0;
  for (let r = 0; r < rows; r++) {
    const rc = rowCounts[r];
    const rowW = rc * clipSize + (rc - 1) * gapX;
    if (rowW > maxRowW) maxRowW = rowW;
    const rowStart = instFocusX - rowW / 2 + clipSize / 2;
    for (let c = 0; c < rc; c++) {
      const clip = clips[idx];
      slots.push({
        id: clip.id,
        x: Math.round(rowStart + c * (clipSize + gapX)),
        y: Math.round(gridTop + r * (clipSize + gapY)),
      });
      idx++;
    }
  }

  const formationTop = instFocusY - instSize / 2;
  const formationH = instSize + 330 + rows * clipSize + (rows - 1) * gapY;

  return {
    categoryId,
    instFocus: { x: instFocusX, y: instFocusY },
    slots,
    bounds: { centerX: instFocusX, top: formationTop, height: formationH, width: Math.max(maxRowW, instSize) },
  };
}