export const THEMES = {
  modern: {
    label: "Modern",
    blurb: "Dark and technical. The site as you know it.",
    variants: [{ id: "cyan", label: "Cyan", swatch: ["#050505", "#22d3ee", "#8b5cf6"] }],
  },
};

export const PACKS = [
  { id: "modern", label: "Modern", blurb: THEMES.modern.blurb },
  { id: "paper", label: "Paper", blurb: "Ruled report pages and an engineering notebook." },
  { id: "windows", label: "Windows", blurb: "A Vista-era desktop with windows you can drag.", desktopOnly: true },
];

export const DEFAULT_THEME = { pack: "modern", variant: "cyan" };

export const PREFS_KEY = "omj-prefs";
export const OVERRIDE_KEY = "omj-theme";
export const PREVIEW_KEY = "omj-preview";

const variantIds = (pack) => THEMES[pack].variants.map((v) => v.id);

export function resolveTheme(input) {
  const pack = input && THEMES[input.pack] ? input.pack : DEFAULT_THEME.pack;
  const ids = variantIds(pack);
  const variant = input && ids.includes(input.variant) ? input.variant : ids[0];
  return { pack, variant };
}

export function parseThemeParam(value) {
  if (!value || typeof value !== "string") return null;
  const i = value.indexOf("-");
  const pack = i < 0 ? value : value.slice(0, i);
  if (!THEMES[pack]) return null;
  return resolveTheme({ pack, variant: i < 0 ? "" : value.slice(i + 1) });
}

const MAP = Object.fromEntries(Object.keys(THEMES).map((k) => [k, variantIds(k)]));

export const NO_FLASH_SCRIPT = `(function(){var d=document.documentElement;try{var T=${JSON.stringify(MAP)},p={},q=null;try{p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)}))||{}}catch(e){}try{var u=new URLSearchParams(location.search).get("theme");if(u&&T[u.split("-")[0]]){sessionStorage.setItem(${JSON.stringify(OVERRIDE_KEY)},u);q=u}else{q=sessionStorage.getItem(${JSON.stringify(OVERRIDE_KEY)})}}catch(e){}if(q){var i=q.indexOf("-"),k=i<0?q:q.slice(0,i);if(T[k])p={pack:k,variant:i<0?"":q.slice(i+1)}}var pk=T[p.pack]?p.pack:${JSON.stringify(DEFAULT_THEME.pack)},vs=T[pk],vr=vs.indexOf(p.variant)<0?vs[0]:p.variant;d.setAttribute("data-pack",pk);d.setAttribute("data-theme",vr)}catch(e){}})();`;
