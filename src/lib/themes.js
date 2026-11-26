export const THEMES = {
  modern: {
    label: "Default",
    variants: [
      { id: "cyan", label: "Cyan", swatch: ["#050505", "#22d3ee", "#8b5cf6"] },
      { id: "midnight", label: "Midnight", swatch: ["#0F1535", "#2CD9FF", "#A78BFA"] },
      { id: "mono", label: "Mono", swatch: ["#141414", "#B8C4D0", "#E8E2D6"] },
      { id: "neon", label: "Neon", swatch: ["#0A0A12", "#00E5FF", "#FF3BD4"] },
      { id: "pink", label: "Pink", swatch: ["#1E1018", "#FF8FB1", "#FFC387"] },
      { id: "daylight", label: "Daylight", light: true, swatch: ["#F7F8FA", "#0E7490", "#7C3AED"] },
      { id: "forest", label: "Forest", swatch: ["#0D1A12", "#3FCF8E", "#EDB95E"] },
      { id: "amber", label: "Amber CRT", swatch: ["#0d0904", "#ffb000", "#ff6a3d"] },
      { id: "obsidian", label: "Obsidian", swatch: ["#000000", "#4F8CFF", "#A78BFA"] },
      { id: "linen", label: "Linen", light: true, swatch: ["#F4F1EA", "#7D6430", "#4A6B7A"] },
    ],
  },
  paper: {
    label: "Paper",
    variants: [
      { id: "cream", label: "Cream ruled", light: true, swatch: ["#F6F1E7", "#1E40AF", "#B42318"] },
      { id: "graph", label: "Graph", light: true, swatch: ["#FAFAF6", "#1D4ED8", "#B45309"] },
      { id: "kraft", label: "Kraft", light: true, swatch: ["#D9C49F", "#1E3A8A", "#8B1D1D"] },
    ],
  },
  windows: {
    label: "Windows",
    desktopOnly: true,
    variants: [{ id: "aero", label: "Aero", light: true, swatch: ["#0D4F8F", "#1F5FBF", "#D9480F"] }],
  },
};

export const PACKS = [
  { id: "modern", label: THEMES.modern.label },
  { id: "paper", label: "Paper" },
  { id: "windows", label: "Windows", blurb: "A Windows 7 desktop with windows you can drag.", desktopOnly: true },
];

export const DEFAULT_THEME = { pack: "modern", variant: "cyan" };

export const PREFS_KEY = "omj-prefs";
export const OVERRIDE_KEY = "omj-theme";
export const PREVIEW_KEY = "omj-preview";

export function packOpen(pack) {
  if (!THEMES[pack]) return false;
  if (!THEMES[pack].preview) return true;
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(PREVIEW_KEY) === pack;
  } catch {
    return false;
  }
}

export const DESKTOP_MIN = 900;

export function packFits(pack) {
  if (!THEMES[pack]?.desktopOnly) return true;
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent;
  const handheld = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return !handheld && window.innerWidth >= DESKTOP_MIN;
}

const variantIds = (pack) => THEMES[pack].variants.map((v) => v.id);

export function resolveTheme(input) {
  const pack = input && packOpen(input.pack) && packFits(input.pack) ? input.pack : DEFAULT_THEME.pack;
  const ids = variantIds(pack);
  const variant = input && ids.includes(input.variant) ? input.variant : ids[0];
  return { pack, variant };
}

export function parseThemeParam(value) {
  if (!value || typeof value !== "string") return null;
  const i = value.indexOf("-");
  const pack = i < 0 ? value : value.slice(0, i);
  if (!packOpen(pack)) return null;
  return resolveTheme({ pack, variant: i < 0 ? "" : value.slice(i + 1) });
}
