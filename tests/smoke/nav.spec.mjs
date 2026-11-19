import { test, expect } from "@playwright/test";

const nav = (page) => page.getByRole("navigation", { name: "Site" });

for (const path of ["/", "/resume", "/projects/vault", "/projects/jam", "/projects/pimplenet", "/grind"]) {
  test(`nav is on ${path} and links work`, async ({ page }) => {
    await page.goto(path);
    await expect(nav(page)).toBeVisible();
    for (const label of ["Home", "Projects", "Resume", "Music", "Contact"]) await expect(nav(page).getByRole("link", { name: label })).toBeAttached();
    await expect(nav(page).getByRole("button", { name: "Search" })).toBeVisible();
    await expect(nav(page).getByRole("button", { name: "Theme" })).toBeVisible();
  });
}

test("rail is the default on desktop and sits on the left", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/resume");
  await page.waitForTimeout(800);
  const box = await nav(page).boundingBox();
  expect(Math.abs(box.x)).toBeLessThan(1);
  expect(Math.round(box.width)).toBe(80);
  await expect(nav(page).getByRole("link", { name: "Resume" })).toHaveAttribute("aria-current", "page");
});

test("phones get the bottom pill", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone layout");
  await page.goto("/");
  const box = await nav(page).boundingBox();
  const vh = page.viewportSize().height;
  expect(box.y + box.height).toBeGreaterThan(vh - 20);
  expect(box.y).toBeGreaterThan(vh - 90);
});

test("switching to the top bar morphs the nav and persists", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/");
  await page.waitForTimeout(800);
  await nav(page).getByRole("button", { name: "Theme" }).click();
  await page.getByRole("radio", { name: "Top bar" }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.nav)).toBe("pill");
  await page.waitForTimeout(900);
  const box = await nav(page).boundingBox();
  expect(box.y).toBeLessThan(40);
  expect(box.x).toBeGreaterThan(200);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.nav)).toBe("pill");
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(500);
  expect((await nav(page).boundingBox()).y).toBeLessThan(40);
});

test("music rail stays hidden until the left edge is hovered", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "canvas is desktop only");
  await page.goto("/music");
  const rail = nav(page);
  await expect(rail).toBeAttached();
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  expect((await rail.boundingBox()).x).toBeLessThan(-60);
  await page.mouse.move(3, 400);
  await page.waitForTimeout(600);
  expect((await rail.boundingBox()).x).toBe(0);
  await expect(rail.getByRole("link", { name: "Music" })).toHaveAttribute("aria-current", "page");
  await page.mouse.move(700, 400);
  await page.waitForTimeout(600);
  expect((await rail.boundingBox()).x).toBeLessThan(-60);
});

test("music follows the top bar setting and reveals it from the top edge", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "canvas is desktop only");
  await page.addInitScript(() => localStorage.setItem("omj-prefs", JSON.stringify({ pack: "modern", variant: "cyan", navMode: "pill" })));
  await page.goto("/music");
  const bar = nav(page);
  await expect(bar).toBeAttached();
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  expect((await bar.boundingBox()).y).toBeLessThan(-20);
  await page.mouse.move(683, 3);
  await page.waitForTimeout(600);
  const box = await bar.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.width).toBeLessThan(600);
  expect(box.height).toBeLessThan(80);
});

test("OMJ opens the about card", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "the mark lives in the desktop rail");
  await page.goto("/resume");
  const mark = nav(page).getByRole("button", { name: "About Oladele" });
  const card = page.getByRole("dialog", { name: "About Oladele" });
  await expect(async () => {
    if (!(await card.count())) await mark.click();
    await expect(card).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(card.getByRole("link", { name: "Open resume" })).toBeVisible();
  await expect(card).toContainText(/ago|just now/);
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
  await expect(mark).toBeFocused();
});

test("search button opens the palette", async ({ page }) => {
  await page.goto("/resume");
  const dialog = page.getByRole("dialog", { name: "Search the site" });
  await expect(async () => {
    if (!(await dialog.count())) await nav(page).getByRole("button", { name: "Search" }).click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
});

test("light variants keep media dark", async ({ page }) => {
  await page.goto("/?theme=modern-linen");
  const bg = await page.locator("#gallery").evaluate((el) => getComputedStyle(el).getPropertyValue("--color-ink").trim());
  expect(bg).toBe("#050505");
});
