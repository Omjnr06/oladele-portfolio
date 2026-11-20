import { VARIANT_TOKENS, PAPER_TOKENS, contrast, onAccent } from "../src/lib/themeTokens.js";

const RULES = [
  ["fg", "ink", 7],
  ["fg", "panel", 7],
  ["muted", "ink", 4.5],
  ["muted", "panel", 4.5],
  ["accent", "ink", 4.5],
  ["accent", "panel", 4.5],
  ["accent2", "ink", 4.5],
  ["ok", "ink", 3],
  ["warn", "ink", 3],
  ["err", "ink", 3],
];

const errors = [];
const rows = [];
for (const [id, t] of Object.entries({ ...VARIANT_TOKENS, ...PAPER_TOKENS })) {
  const cells = RULES.map(([a, b, min]) => {
    const r = contrast(t[a], t[b]);
    if (r < min) errors.push(`${id}: ${a} on ${b} is ${r.toFixed(2)}, needs ${min}`);
    return r.toFixed(1);
  });
  const oa = contrast(onAccent(t.accent), t.accent);
  if (oa < 4.5) errors.push(`${id}: text on accent is ${oa.toFixed(2)}, needs 4.5`);
  rows.push([id, ...cells, oa.toFixed(1)]);
}

if (process.argv.includes("--table")) {
  console.log(["variant", ...RULES.map(([a, b]) => `${a}/${b}`), "on-accent"].join("\t"));
  rows.forEach((r) => console.log(r.join("\t")));
}

if (errors.length) {
  console.error(`\ncheck-contrast found ${errors.length} problem${errors.length === 1 ? "" : "s"}:\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`check-contrast: OK (${rows.length} variants)`);
