import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "media-out");
const CACHE = join(OUT, ".src");
const SOURCES = ["src/app/music/data/musicLibrary.js", "src/content/projects.js"];
const KEEP_RATIO = 0.8;

const args = process.argv.slice(2);
const fromIdx = args.indexOf("--from");
const FROM = fromIdx >= 0 ? args[fromIdx + 1] : null;
const ONLY = args.filter((a, i) => !a.startsWith("--") && (fromIdx < 0 || i !== fromIdx + 1));

if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  console.error("ffmpeg not found. Install it with: winget install ffmpeg");
  process.exit(1);
}

const urls = [...new Set(SOURCES.flatMap((f) => readFileSync(join(ROOT, f), "utf8").match(/https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^"'`\s]+/g) ?? []))];
const files = urls.map((url) => ({ url, name: decodeURIComponent(basename(url)) })).filter((f) => !ONLY.length || ONLY.includes(f.name));

mkdirSync(CACHE, { recursive: true });
const local = FROM && existsSync(FROM) ? new Map(readdirSync(FROM).map((n) => [n.toLowerCase(), join(FROM, n)])) : new Map();
const mb = (b) => (b / 1048576).toFixed(1);

async function source(f) {
  const hit = local.get(f.name.toLowerCase());
  if (hit) return hit;
  const cached = join(CACHE, f.name);
  if (existsSync(cached)) return cached;
  console.log(`  downloading ${f.name}`);
  const res = await fetch(f.url);
  if (!res.ok) throw new Error(`download failed (HTTP ${res.status})`);
  writeFileSync(cached, Buffer.from(await res.arrayBuffer()));
  return cached;
}

function encode(input, output, mov) {
  const r = spawnSync("ffmpeg", [
    "-v", "error", "-y", "-i", input,
    "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", "scale='if(gt(iw,ih),-2,min(1080,iw))':'if(gt(iw,ih),min(1080,ih),-2)'",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    "-f", mov ? "mov" : "mp4",
    output,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg failed");
}

const rows = [];
let before = 0;
let after = 0;
for (const f of files) {
  console.log(f.name);
  try {
    const input = await source(f);
    const output = join(OUT, f.name);
    const tmp = join(OUT, `.tmp-${f.name}`);
    encode(input, tmp, /\.mov$/i.test(f.name));
    const a = statSync(input).size;
    const b = statSync(tmp).size;
    const upload = b <= a * KEEP_RATIO;
    if (upload) copyFileSync(tmp, output);
    spawnSync(process.platform === "win32" ? "cmd" : "rm", process.platform === "win32" ? ["/c", "del", "/q", tmp] : ["-f", tmp]);
    before += a;
    after += upload ? b : a;
    rows.push({ file: f.name, before: mb(a), after: upload ? mb(b) : mb(a), upload: upload ? "yes" : "no (already small)" });
  } catch (e) {
    rows.push({ file: f.name, before: "-", after: "-", upload: `failed: ${e.message}` });
  }
}

console.table(rows);
console.log(`total ${mb(before)} MB -> ${mb(after)} MB`);
console.log(`upload the files in media-out/ (not media-out/.src) to the portfolio-media bucket, replacing the old ones with the same names`);
