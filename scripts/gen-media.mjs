import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "assets", "music", "generated");
const LIB_PATH = join(ROOT, "src", "app", "music", "data", "musicLibrary.js");

const THUMB_AT = "00:00:01";
const SNIPPET_START = "00:00:02";
const SNIPPET_DUR = "5";
const SNIPPET_HEIGHT = 480;

function haveFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

function loadClips() {
  const src = readFileSync(LIB_PATH, "utf8");
  const clips = [];
  const blockRe = /\{[^{}]*?id:\s*["'`]([^"'`]+)["'`][^{}]*?\}/gs;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[0];
    const id = m[1];
    const urlMatch = block.match(/videoUrl:\s*["'`]([^"'`]*)["'`]/);
    if (!urlMatch) continue;
    const audioOnly = /audioOnly:\s*true/.test(block);
    clips.push({ id, videoUrl: urlMatch[1], audioOnly });
  }
  return clips;
}

function slug(id) {
  return id.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function makeThumb(input, output) {
  execSync(
    `ffmpeg -y -ss ${THUMB_AT} -i "${input}" -frames:v 1 -vf "scale=-2:${SNIPPET_HEIGHT}" -q:v 4 "${output}"`,
    { stdio: "ignore" }
  );
}

function makeSnippet(input, output) {
  execSync(
    `ffmpeg -y -ss ${SNIPPET_START} -i "${input}" -t ${SNIPPET_DUR} -an -vf "scale=-2:${SNIPPET_HEIGHT}" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset veryfast -movflags +faststart "${output}"`,
    { stdio: "ignore" }
  );
}

async function main() {
  if (!haveFfmpeg()) {
    console.error("\n[gen-media] ffmpeg not found on PATH.");
    console.error("[gen-media] install it, then re-run:  winget install ffmpeg  (Windows)\n");
    process.exit(1);
  }
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const clips = loadClips();

  let made = 0, skipped = 0, audioSkipped = 0, failed = 0;

  for (const clip of clips) {
    const id = slug(clip.id);
    const thumb = join(OUT_DIR, `${id}.jpg`);
    const snippet = join(OUT_DIR, `${id}.mp4`);

    if (clip.audioOnly) {
      audioSkipped++;
      continue;
    }
    if (existsSync(thumb) && existsSync(snippet)) {
      skipped++;
      continue;
    }
    if (!clip.videoUrl) {
      console.warn(`[skip] ${clip.id}: no videoUrl`);
      failed++;
      continue;
    }

    const tmp = join(tmpdir(), `mv-${id}-${Date.now()}`);
    try {
      console.log(`[fetch] ${clip.id}`);
      await download(clip.videoUrl, tmp);
      if (!existsSync(thumb)) makeThumb(tmp, thumb);
      if (!existsSync(snippet)) makeSnippet(tmp, snippet);
      made++;
      console.log(`  -> ${id}.jpg + ${id}.mp4`);
    } catch (e) {
      console.warn(`[fail] ${clip.id}: ${e.message}`);
      failed++;
    } finally {
      try { if (existsSync(tmp)) unlinkSync(tmp); } catch {}
    }
  }

  console.log(`\n[gen-media] done. generated ${made}, skipped ${skipped} (already made), audio-only ${audioSkipped}, failed ${failed}.`);
  console.log(`[gen-media] output: public/assets/music/generated/`);
}

main();
