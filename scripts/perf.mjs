import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { ROUTES } from "../tests/routes.mjs";

const BASE = process.env.PERF_BASE || "http://localhost:3100";
const label = process.argv[2] || "current";

const browser = await chromium.launch();
const rows = [];

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  const types = new Map();
  const bytes = { script: 0, stylesheet: 0, font: 0, image: 0, media: 0, document: 0, other: 0 };
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type.toLowerCase()));
  cdp.on("Network.loadingFinished", (e) => {
    const t = types.get(e.requestId) || "other";
    const key = t in bytes ? t : "other";
    bytes[key] += e.encodedDataLength;
  });
  await page.goto(BASE + route.path, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1000);
  rows.push({ route: route.path, ...Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, Math.round(v / 1024)])) });
  await ctx.close();
}

await browser.close();

const cols = ["route", "document", "script", "stylesheet", "font", "image", "media", "other"];
const md = [
  `| ${cols.join(" | ")} |`,
  `| ${cols.map(() => "---").join(" | ")} |`,
  ...rows.map((r) => `| ${cols.map((c) => r[c]).join(" | ")} |`),
].join("\n");

mkdirSync("perf", { recursive: true });
writeFileSync(`perf/transfer-${label}.json`, JSON.stringify(rows, null, 2));
console.log(`Transferred KB on first load (1366x768, ${BASE})\n\n${md}`);
