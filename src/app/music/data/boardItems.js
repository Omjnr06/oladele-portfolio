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

function gridSlots(items, size, topY) {
  const n = items.length;
  const perRowMax = 5;
  const rows = Math.ceil(n / perRowMax);
  const base = Math.floor(n / rows);
  const extra = n % rows;
  const rowCounts = [];
  for (let r = 0; r < rows; r++) rowCounts.push(base + (r < extra ? 1 : 0));
  const gapX = size * 0.28;
  const gapY = size * 0.34;
  const slots = [];
  let idx = 0, maxRowW = 0;
  for (let r = 0; r < rows; r++) {
    const rc = rowCounts[r];
    const rowW = rc * size + (rc - 1) * gapX;
    if (rowW > maxRowW) maxRowW = rowW;
    const rowStart = -rowW / 2 + size / 2;
    for (let c = 0; c < rc; c++) {
      slots.push({ id: items[idx].id, x: Math.round(rowStart + c * (size + gapX)), y: Math.round(topY + r * (size + gapY)) });
      idx++;
    }
  }
  const gridH = rows * size + (rows - 1) * gapY;
  return { slots, gridH, maxRowW };
}

export function focusLayout(categoryId) {
  const inst = instrumentItems.find((it) => it.categoryId === categoryId);
  const clips = clipItems.filter((c) => c.categoryId === categoryId);
  const instSize = inst.size || 700;
  const size = clips[0]?.size || 460;
  const instFocusY = -(instSize / 2) - 640;
  const gridTop = instFocusY + instSize / 2 + 330;
  const g = gridSlots(clips, size, gridTop);
  const formationTop = instFocusY - instSize / 2;
  const formationH = instSize + 330 + g.gridH;
  return {
    kind: "instrument",
    categoryId,
    headerId: inst.id,
    instFocus: { x: 0, y: instFocusY },
    memberIds: clips.map((c) => c.id),
    slots: g.slots,
    bounds: { top: formationTop, height: formationH, width: Math.max(g.maxRowW, instSize) },
  };
}

export const SONGS = [
  { spotifyTrackId: "7IVukH71OXfAu3KudrrizN" },
  { spotifyTrackId: "7FwgafuJFYX2M5CrEVfN4M" },
  { spotifyTrackId: "7IAzRTQQz6Aoywj0R1Qce5" },
  { spotifyTrackId: "24f3lQnwL9vL2GUu8sdoBP" },
  { spotifyTrackId: "1Vk4yRsz0iBzDiZEoFMQyv" },
];

export const SYMBOLS = [
  { symbol: "treble" }, { symbol: "bassclef" }, { symbol: "sheet" }, { symbol: "vinyl" },
  { symbol: "headphones" }, { symbol: "metronome" }, { symbol: "notes" }, { symbol: "treble" },
  { symbol: "vinyl" }, { symbol: "headphones" },
];

export const PHOTOS = [
  { src: "/assets/music/images/photo-1.JPG", title: "Chrysalis Choir 2022", description: "Grew up in the church worshipping with this group. Performance at church carol." },
  { src: "/assets/music/images/photo-2.jpg", title: "Covid Church Playing", description: "All to the Glory of God." },
  { src: "/assets/music/images/photo-3.jpeg", title: "Music Boys 2018", description: "Grew up learning instruments and jamming out in school with these Guys." },
  { src: "/assets/music/images/photo-5.JPG", title: "Charlie + Junior Jazz Combo @ St Francis", description: "Played for sponsors coming to the school. Hung on the wall at St. Francis in Calgary" },
  { src: "/assets/music/images/photo-6.WEBP", title: "MME Performance", description: "This is on the wall @ Gems Music Academy in Dubai!" },
];

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function scatterItems(defs, existing, opts) {
  const rand = seededRandom(opts.seed || 12345);
  const occupied = existing.map((it) => ({ x: it.x, y: it.y, r: (it.size || 300) / 2 }));
  const results = [];
  for (const def of defs) {
    if (def.x !== undefined && def.y !== undefined) {
      results.push({ ...def, x: def.x, y: def.y });
      occupied.push({ x: def.x, y: def.y, r: opts.size / 2 });
      continue;
    }
    let best = null;
    for (let attempt = 0; attempt < 400; attempt++) {
      const ang = rand() * Math.PI * 2;
      const rad = opts.minRadius + rand() * (opts.maxRadius - opts.minRadius);
      const x = Math.round(Math.cos(ang) * rad);
      const y = Math.round(Math.sin(ang) * rad);
      const half = opts.size / 2 + opts.pad;
      let ok = true;
      for (const o of occupied) {
        if (Math.hypot(x - o.x, y - o.y) < half + o.r) { ok = false; break; }
      }
      if (ok) { best = { x, y }; break; }
    }
    if (best) {
      results.push({ ...def, x: best.x, y: best.y });
      occupied.push({ x: best.x, y: best.y, r: opts.size / 2 });
    }
  }
  return results;
}

const scatterBase = [...instrumentItems, ...clipItems];

export const photoItems = scatterItems(PHOTOS, scatterBase, {
  seed: 7001, size: 380, pad: 160, minRadius: 900, maxRadius: 3200,
}).map((p, i) => ({ id: `photo-${i + 1}`, type: "photo", size: 380, ...p }));

export const symbolItems = scatterItems(SYMBOLS, [...scatterBase, ...photoItems], {
  seed: 4202, size: 220, pad: 200, minRadius: 800, maxRadius: 3400,
}).map((s, i) => ({ id: `symbol-${i + 1}`, type: "symbol", size: 220, ...s }));

export const songItems = scatterItems(SONGS, [...scatterBase, ...photoItems, ...symbolItems], {
  seed: 9303, size: 300, pad: 180, minRadius: 950, maxRadius: 3000,
}).map((s, i) => ({ id: `song-${i + 1}`, type: "song", size: 300, ...s }));

boardItems.push(...photoItems, ...symbolItems, ...songItems);

export function focusCollection(kind) {
  const items = kind === "photos" ? photoItems : songItems;
  const n = items.length;
  const perRowMax = 5;
  const rows = Math.ceil(n / perRowMax);
  const base = Math.floor(n / rows);
  const extra = n % rows;
  const rowCounts = [];
  for (let r = 0; r < rows; r++) rowCounts.push(base + (r < extra ? 1 : 0));

  const cellSize = items[0]?.size || 320;
  const gapX = cellSize * 0.3;
  const gapY = cellSize * 0.34;
  const headerH = 240;
  const gridTop = -(rows * cellSize + (rows - 1) * gapY) / 2 + headerH / 2;

  const slots = [];
  let idx = 0;
  let maxRowW = 0;
  for (let r = 0; r < rows; r++) {
    const rc = rowCounts[r];
    const rowW = rc * cellSize + (rc - 1) * gapX;
    if (rowW > maxRowW) maxRowW = rowW;
    const rowStart = -rowW / 2 + cellSize / 2;
    for (let c = 0; c < rc; c++) {
      const it = items[idx];
      slots.push({ id: it.id, x: Math.round(rowStart + c * (cellSize + gapX)), y: Math.round(gridTop + r * (cellSize + gapY)) });
      idx++;
    }
  }
  const height = rows * cellSize + (rows - 1) * gapY + headerH;
  return { kind, label: kind === "photos" ? "Photos" : "In My Playlist", slots, bounds: { top: gridTop - headerH, height, width: Math.max(maxRowW, 800) } };
}

export const contentBounds = (() => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const it of boardItems) {
    const half = (it.size || 300) / 2;
    if (it.x - half < minX) minX = it.x - half;
    if (it.y - half < minY) minY = it.y - half;
    if (it.x + half > maxX) maxX = it.x + half;
    if (it.y + half > maxY) maxY = it.y + half;
  }
  if (!isFinite(minX)) { minX = minY = -500; maxX = maxY = 500; }
  return { minX, minY, maxX, maxY };
})();

export const CONTENT_BOUNDS = (() => {
  const pad = 900;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const it of boardItems) {
    const half = (it.size || 300) / 2;
    if (it.x - half < minX) minX = it.x - half;
    if (it.x + half > maxX) maxX = it.x + half;
    if (it.y - half < minY) minY = it.y - half;
    if (it.y + half > maxY) maxY = it.y + half;
  }
  return {
    minX: minX - pad,
    maxX: maxX + pad,
    minY: minY - pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
})();