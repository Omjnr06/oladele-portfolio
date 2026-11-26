import { test, expect } from "@playwright/test";

const TOP = Array.from({ length: 10 }, (_, i) => ({
  id: `track${String(i + 1).padStart(2, "0")}aaaaaaaaaaaaaaa`,
  title: `Song ${i + 1}`,
  artist: `Artist ${i + 1}`,
  thumb: "/assets/music/images/photo-2.jpg",
}));

const mockTop = (page, tracks) =>
  Promise.all([
    page.route("**/api/spotify/top", (r) => r.fulfill({ json: { updated: new Date().toISOString(), range: "4w", tracks } })),
    page.route(/open\.spotify\.com\/oembed/, (r) => r.fulfill({ json: { title: "Static song", thumbnail_url: "/assets/music/images/photo-2.jpg" } })),
  ]);

test("the top tracks route answers without spotify keys", async ({ request }) => {
  const res = await request.get("/api/spotify/top");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toMatchObject({ range: "4w", tracks: null });
});

test("music canvas maps the live top 10 onto the board", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "canvas is desktop only");
  await mockTop(page, TOP);
  await page.goto("/music");
  await expect(page.locator(".mv-song")).toHaveCount(10);
  await page.getByRole("button", { name: "In My Playlist" }).click();
  await expect(page.locator(".mv-song").first()).toContainText("No. 1 this month");
  await page.locator(".mv-song", { hasText: "Song 3" }).click();
  await expect(page.locator(".mv-song-modal")).toContainText("No. 3 this month");
  await expect(page.locator(".mv-song-embed")).toHaveAttribute("src", new RegExp(`/embed/track/${TOP[2].id}`));
});

test("music falls back to the static playlist until spotify is set up", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "canvas is desktop only");
  await mockTop(page, null);
  await page.goto("/music");
  await expect(page.locator(".mv-song")).toHaveCount(5);
  await expect(page.locator(".mv-song").first()).toContainText("In Oladele's Playlist");
});

test("phones list the top 10 in the playlist tab", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone only");
  await mockTop(page, TOP);
  await page.goto("/music");
  await page.getByRole("button", { name: "In My Playlist" }).click();
  await expect(page.locator(".mvm-card--song")).toHaveCount(10);
  await expect(page.locator(".mvm-card--song").first()).toContainText("No. 1 this month");
});

test("home: on repeat opens the top 10", async ({ page }) => {
  await mockTop(page, TOP);
  await page.goto("/");
  await page.getByRole("button", { name: "On repeat" }).click();
  const dlg = page.getByRole("dialog", { name: "On repeat" });
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText("My top 10 on Spotify, last 4 weeks");
  await expect(dlg.getByRole("link")).toHaveCount(10);
  await expect(dlg.getByRole("link").first()).toHaveAttribute("href", `https://open.spotify.com/track/${TOP[0].id}`);
  await page.keyboard.press("Escape");
  await expect(dlg).toHaveCount(0);
  await expect(page.getByRole("button", { name: "On repeat" })).toBeFocused();
});

test("home: on repeat works in paper too", async ({ page }) => {
  await mockTop(page, TOP);
  await page.goto("/?theme=paper-cream");
  await page.getByRole("button", { name: "On repeat" }).click();
  await expect(page.getByRole("dialog", { name: "On repeat" }).getByRole("link")).toHaveCount(10);
});

test("windows music has a top 10 playlist", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "windows is desktop only");
  await mockTop(page, TOP);
  await page.goto("/music?theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  const music = page.locator('.win[aria-label="Music"]');
  await music.getByRole("navigation", { name: "Music folders" }).getByRole("button", { name: "Top 10" }).click();
  const files = music.getByRole("listbox", { name: "Top 10" }).getByRole("option");
  await expect(files).toHaveCount(10);
  await expect(files.first()).toContainText("01. Song 1");
  await expect(music.locator(".wa-details")).toContainText("No. 1 in Oladele's top 10 this month");
});
