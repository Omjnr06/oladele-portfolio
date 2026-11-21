export const CYAN = {
  ink: "#050505",
  panel: "#0b0b0c",
  "panel-2": "#121214",
  line: "rgb(255 255 255 / 0.08)",
  "line-strong": "rgb(255 255 255 / 0.16)",
  fg: "#f4f6f8",
  bright: "#ffffff",
  muted: "#8a94a3",
  accent: "#22d3ee",
  "accent-2": "#8b5cf6",
  "accent-2-100": "#ede9fe",
  "accent-2-200": "#ddd6fe",
  "accent-2-300": "#c4b5fd",
  "accent-2-400": "#a78bfa",
  "accent-2-600": "#7c3aed",
  "accent-2-700": "#6d28d9",
  "accent-2-900": "#4c1d95",
  "on-accent": "#000000",
  scrim: "#020202",
  ok: "oklch(79.2% 0.209 151.711)",
  warn: "oklch(85.2% 0.199 91.936)",
  "warn-soft": "oklch(90.5% 0.182 98.111)",
  err: "oklch(63.7% 0.237 25.331)",
  "err-soft": "oklch(80.8% 0.114 19.571)",
};

export const VARIANT_TOKENS = {
  midnight: { ink: "#0F1535", panel: "#1A1F45", line: "#2D3561", fg: "#FFFFFF", muted: "#A0AEC0", accent: "#2CD9FF", accent2: "#A78BFA", ok: "#2EB67D", warn: "#ECB22E", err: "#E01E5A" },
  mono: { ink: "#141414", panel: "#1F1F1F", line: "#333333", fg: "#F5F5F5", muted: "#9A9A9A", accent: "#B8C4D0", accent2: "#E8E2D6", ok: "#6BAF8D", warn: "#C9A961", err: "#D45B5B" },
  neon: { ink: "#0A0A12", panel: "#15121F", line: "#2A2440", fg: "#F0EBFF", muted: "#8E86AA", accent: "#00E5FF", accent2: "#FF3BD4", ok: "#3BFFB0", warn: "#FFD43B", err: "#FF3B6B" },
  pink: { ink: "#1E1018", panel: "#2A1622", line: "#3D2230", fg: "#FBEEF4", muted: "#B89AA8", accent: "#FF8FB1", accent2: "#FFC387", ok: "#5FCF9E", warn: "#F0B860", err: "#FF5C7A" },
  daylight: { light: true, ink: "#F7F8FA", panel: "#FFFFFF", line: "#E2E8F0", fg: "#0F1535", muted: "#5B6B80", accent: "#0E7490", accent2: "#7C3AED", ok: "#15803D", warn: "#B45309", err: "#DC2626" },
  forest: { ink: "#0D1A12", panel: "#152417", line: "#24382A", fg: "#EAF5EC", muted: "#8AA594", accent: "#3FCF8E", accent2: "#EDB95E", ok: "#46C48A", warn: "#E0A54B", err: "#E5484D" },
  amber: { ink: "#0d0904", panel: "#160f06", line: "#3a2a10", fg: "#ffd58a", muted: "#b8935a", accent: "#ffb000", accent2: "#ff6a3d", ok: "#5FB37A", warn: "#E8C15A", err: "#E5533D" },
  obsidian: { ink: "#000000", panel: "#0D0D0D", line: "#1F1F1F", fg: "#FFFFFF", muted: "#8F8F8F", accent: "#4F8CFF", accent2: "#A78BFA", ok: "#3DD68C", warn: "#FFC94D", err: "#FF4D4D" },
  linen: { light: true, ink: "#F4F1EA", panel: "#FDFBF6", line: "#DDD6C7", fg: "#2A2620", muted: "#5F584D", accent: "#7D6430", accent2: "#4A6B7A", ok: "#3F7A4D", warn: "#9A7425", err: "#B0452F" },
};

export const PAPER_TOKENS = {
  cream: { light: true, ink: "#F6F1E7", panel: "#FBF8F1", line: "#D8CDB8", fg: "#1F2433", muted: "#5C574E", accent: "#1E40AF", accent2: "#B42318", ok: "#2F6B3A", warn: "#8A5A0B", err: "#B42318", rule: "#A9C1E6", margin: "#E07070", grid: "transparent" },
  graph: { light: true, ink: "#FAFAF6", panel: "#FFFFFF", line: "#D6DAE0", fg: "#1A1F29", muted: "#575E6B", accent: "#1D4ED8", accent2: "#B45309", ok: "#2F6B3A", warn: "#8A5A0B", err: "#B42318", rule: "transparent", margin: "transparent", grid: "#C9DCE6" },
  kraft: { light: true, ink: "#D9C49F", panel: "#E4D3B3", line: "#B39B72", fg: "#22180C", muted: "#4A3A22", accent: "#1E3A8A", accent2: "#8B1D1D", ok: "#2E5A28", warn: "#5E4108", err: "#8B1D1D", rule: "transparent", margin: "#9B2C2C", grid: "transparent" },
};

const hex = (h) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};

export const luminance = (h) => {
  const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const onAccent = (accent) => (contrast(accent, "#000000") >= contrast(accent, "#ffffff") ? "#000000" : "#ffffff");

const block = (sel, vars) => `${sel}{${Object.entries(vars).map(([k, v]) => `--color-${k}:${v}`).join(";")}}`;

const mix = (a, pct, b) => `color-mix(in oklab,var(--color-${a}) ${pct}%,${b})`;

const SHARED = {
  "panel-2": mix("panel", 94, "var(--color-fg)"),
  "line-strong": mix("line", 70, "var(--color-fg)"),
  bright: "var(--color-fg)",
  "accent-2-100": mix("accent-2", 18, "white"),
  "accent-2-200": mix("accent-2", 32, "white"),
  "accent-2-300": mix("accent-2", 55, "white"),
  "accent-2-400": mix("accent-2", 80, "white"),
  "accent-2-600": mix("accent-2", 85, "black"),
  "accent-2-700": mix("accent-2", 70, "black"),
  "accent-2-900": mix("accent-2", 45, "black"),
  "warn-soft": mix("warn", 65, "white"),
  "err-soft": mix("err", 60, "white"),
};

const LIGHT = {
  "panel-2": mix("panel", 96, "var(--color-fg)"),
  "warn-soft": mix("warn", 80, "black"),
  "err-soft": mix("err", 80, "black"),
  scrim: "#0b0b0c",
};

const PAPER_RAMP = {
  "accent-2-100": mix("accent-2", 55, "black"),
  "accent-2-200": mix("accent-2", 70, "black"),
  "accent-2-300": mix("accent-2", 85, "black"),
  "accent-2-400": mix("accent-2", 92, "black"),
  "accent-2-600": mix("accent-2", 75, "white"),
  "accent-2-700": mix("accent-2", 50, "white"),
  "accent-2-900": mix("accent-2", 22, "white"),
};

const DERIVED_OTHER = "--grid-dot:color-mix(in srgb,var(--color-accent) 25%,transparent);--grid-line:color-mix(in srgb,var(--color-bright) 3%,transparent);--scrollbar-thumb:color-mix(in srgb,var(--color-accent) 30%,transparent);--scrollbar-thumb-hover:color-mix(in srgb,var(--color-accent) 55%,transparent);--scrollbar-thumb-ff:color-mix(in srgb,var(--color-accent) 40%,transparent)";

const both = (ids) => ids.flatMap((id) => [`:root[data-theme="${id}"]`, `[data-theme="${id}"]`]).join(",");

export function themeCss() {
  const all = { ...VARIANT_TOKENS, ...PAPER_TOKENS };
  const ids = Object.keys(all);
  const lights = ids.filter((id) => all[id].light);
  const stage = Object.fromEntries(Object.entries(CYAN).filter(([k]) => !["accent", "accent-2", "on-accent"].includes(k)));
  const out = [
    block(':root[data-theme="cyan"],[data-theme="cyan"],[data-colors="fixed"]', CYAN),
    `${both(ids)}{color-scheme:dark;${DERIVED_OTHER};${Object.entries(SHARED).map(([k, v]) => `--color-${k}:${v}`).join(";")}}`,
  ];
  for (const id of ids) {
    const t = all[id];
    out.push(
      block(both([id]), {
        ink: t.ink,
        panel: t.panel,
        line: t.line,
        fg: t.fg,
        muted: t.muted,
        accent: t.accent,
        "accent-2": t.accent2,
        "on-accent": onAccent(t.accent),
        ...(t.light ? {} : { scrim: `color-mix(in oklab,${t.ink} 60%,black)` }),
        ok: t.ok,
        warn: t.warn,
        err: t.err,
      }),
    );
  }
  for (const [id, t] of Object.entries(PAPER_TOKENS)) out.push(`${both([id])}{--paper-rule:${t.rule};--paper-margin:${t.margin};--paper-grid:${t.grid}}`);
  out.push(block(both(Object.keys(PAPER_TOKENS)), PAPER_RAMP));
  if (lights.length) {
    out.push(`${block(both(lights), LIGHT).slice(0, -1)};color-scheme:light;--texture:none;--grid-line:color-mix(in srgb,var(--color-bright) 6%,transparent);--grid-dot:color-mix(in srgb,var(--color-accent) 35%,transparent)}`);
    const stageSel = lights.flatMap((id) => [...(PAPER_TOKENS[id] ? [] : [`:root[data-theme="${id}"] [data-surface="stage"]`]), `:root[data-theme="${id}"] [data-surface="media"]`]).join(",");
    out.push(`${block(stageSel, { ...stage, "on-accent": "#000000" }).slice(0, -1)};color-scheme:dark;--texture:url("/assets/textures/carbon-fibre.png")}`);
    for (const id of lights) {
      const sel = [...(PAPER_TOKENS[id] ? [] : [`:root[data-theme="${id}"] [data-surface="stage"]`]), `:root[data-theme="${id}"] [data-surface="media"]`].join(",");
      out.push(block(sel, { accent: `color-mix(in oklab,${all[id].accent} 55%,white)`, "accent-2": `color-mix(in oklab,${all[id].accent2} 70%,white)` }));
    }
  }
  return out.join("\n") + "\n";
}
