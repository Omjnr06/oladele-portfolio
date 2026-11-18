import { test, expect } from "@playwright/test";

const desktop = (info) => test.skip(info.project.name !== "smoke-desktop", "keyboard palette is desktop only");
const palette = (page) => page.getByRole("dialog", { name: "Search the site" });
const input = (page) => page.getByRole("combobox", { name: "Search the site" });

async function open(page) {
  await expect(async () => {
    if (!(await palette(page).count())) await page.keyboard.press("Control+k");
    await expect(palette(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(palette(page).getByRole("option").first()).toBeVisible();
}

test("Ctrl K opens the palette and Enter goes to a case study", async ({ page }, info) => {
  desktop(info);
  await page.goto("/resume");
  await open(page);
  await input(page).fill("vault financial");
  await expect(palette(page).getByRole("option").first()).toContainText("The Vault");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/vault$/);
  await expect(palette(page)).toHaveCount(0);
});

test("searching a skill finds every project that uses it", async ({ page }, info) => {
  desktop(info);
  await page.goto("/");
  await open(page);
  await input(page).fill("python");
  const projects = palette(page).getByRole("group", { name: "Projects" });
  await expect(projects.getByRole("option", { name: /PimpleNet/ })).toContainText("uses Python");
  await expect(projects.getByRole("option", { name: /SpaceFinder AI/ })).toBeVisible();
  await input(page).fill("pyhton");
  await expect(palette(page).getByRole("group", { name: "Skills" }).getByRole("option").first()).toContainText("Python");
  await input(page).fill("llm");
  await expect(projects.getByRole("option", { name: /Flowlytics/ })).toContainText("uses Gemini API");
});

test("cd /music and clip results deep link into the music page", async ({ page }, info) => {
  desktop(info);
  await page.goto("/");
  await open(page);
  await input(page).fill("cd /music");
  await expect(palette(page).getByRole("option").first()).toContainText("Music Vault");
  await expect(palette(page).getByRole("group", { name: "Music" })).toHaveCount(0);
  await input(page).fill("liebestraum");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/music\?track=piano%2001$/);
});

test("photo results jump to that photo in the gallery", async ({ page }, info) => {
  desktop(info);
  await page.goto("/");
  await open(page);
  await input(page).fill("guitar");
  await palette(page).getByRole("group", { name: "Photos" }).getByRole("option").first().click();
  await expect(palette(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show photo 9" })).toHaveClass(/w-8/);
});

test("Escape closes only the palette on /grind, and / still focuses grind search", async ({ page }, info) => {
  desktop(info);
  await page.goto("/grind");
  const search = page.getByPlaceholder("Company, role or city");
  await page.waitForTimeout(800);
  await page.keyboard.press("/");
  await expect(search).toBeFocused();
  await search.press("Escape");
  await open(page);
  await expect(search).not.toBeFocused();
  await page.keyboard.press("j");
  await page.keyboard.press("Escape");
  await expect(palette(page)).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement?.closest("[data-nav]"))).toBeNull();
});

test("palette restores scroll and focus when closed", async ({ page }, info) => {
  desktop(info);
  await page.goto("/");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  const y = await page.evaluate(() => window.scrollY);
  await open(page);
  expect(await page.evaluate(() => document.body.style.position)).toBe("fixed");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => document.body.style.position)).toBe("");
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
});

test("event endpoint validates input and no-ops without Supabase", async ({ request }) => {
  expect((await request.post("/api/event", { data: "not json", headers: { "content-type": "text/plain" } })).status()).toBe(400);
  expect((await request.post("/api/event", { data: JSON.stringify({ type: "hack", name: "x" }), headers: { "content-type": "text/plain" } })).status()).toBe(400);
  expect((await request.post("/api/event", { data: JSON.stringify({ type: "pack_selected", name: "nope" }), headers: { "content-type": "text/plain" } })).status()).toBe(400);
  expect((await request.post("/api/event", { data: JSON.stringify({ type: "palette_used", name: "project", path: "/" }), headers: { "content-type": "text/plain", origin: "https://evil.example" } })).status()).toBe(403);
  expect((await request.post("/api/event", { data: JSON.stringify({ type: "palette_used", name: "project", path: "/" }), headers: { "content-type": "text/plain" } })).status()).toBe(204);
});

test("stats route returns aggregates and the owner page is hidden", async ({ request }) => {
  const stats = await (await request.get("/api/stats")).json();
  expect(stats).toMatchObject({ packs: {}, variants: {}, palette: {} });
  expect((await request.get("/stats")).status()).toBe(404);
});

test("palette index is static and covers every content type", async ({ request }) => {
  const res = await request.get("/palette-index.json");
  expect(res.ok()).toBe(true);
  const { items, chips } = await res.json();
  const types = new Set(items.map((i) => i.type));
  for (const t of ["page", "project", "experience", "skill", "clip", "photo", "link", "action"]) expect(types).toContain(t);
  expect(chips.length).toBeGreaterThan(2);
});
