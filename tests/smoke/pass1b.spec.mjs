import { test, expect } from "@playwright/test";

test("gallery only loads the current and next photo", async ({ page }) => {
  await page.goto("/");
  const photos = page.locator('img[alt^="Gallery snapshot"]');
  await expect(photos).toHaveCount(2);
  await page.getByRole("button", { name: "Show photo 5" }).click();
  await expect(photos).toHaveCount(4);
});

test("resume left column sticks while scrolling", async ({ page, isMobile }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "sticky column is desktop only");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/resume");
  const col = page.locator("main h1").first();
  await page.mouse.wheel(0, 1600);
  await page.waitForTimeout(600);
  const top = await col.evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThan(0);
  expect(top).toBeLessThan(200);
});

test("resume scrolls whichever side the mouse is over", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "two-column layout is desktop only");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/resume");
  const left = page.locator("main h1").first().locator("xpath=../..");
  const box = await left.boundingBox();

  await page.mouse.move(box.x + box.width / 2, 500);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  const afterLeft = await page.evaluate(() => window.scrollY);
  const leftScrolled = await left.evaluate((el) => el.scrollTop);
  expect(leftScrolled).toBeGreaterThan(0);
  expect(afterLeft).toBe(0);

  await page.mouse.move(1000, 500);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  expect(await left.evaluate((el) => el.scrollTop)).toBe(leftScrolled);

  await page.mouse.move(box.x + box.width / 2, 400);
  await page.mouse.wheel(0, 5000);
  await page.waitForTimeout(600);
  const max = await left.evaluate((el) => el.scrollHeight - el.clientHeight);
  expect(await left.evaluate((el) => el.scrollTop)).toBeGreaterThanOrEqual(max - 2);
  await expect(left.getByText("Microsoft Office Suite", { exact: true })).toBeInViewport();
});

test("spotlight videos pause when scrolled away", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Music", exact: true }).click();
  const video = page.locator("#spotlight video").first();
  await expect(video).toBeAttached();
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
});

test("project image preview opens and closes with Escape", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop interaction");
  await page.goto("/");
  await page.getByRole("button", { name: "DATA SCIENCE", exact: true }).click();
  await page.locator('#projects [style*="flowlytics-ui"]').click();
  await expect(page.getByAltText("Project preview")).toBeVisible();
  expect(await page.evaluate(() => document.body.style.position)).toBe("fixed");
  await page.keyboard.press("Escape");
  await expect(page.getByAltText("Project preview")).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.position)).toBe("");
});

test("case study tabs work with the keyboard", async ({ page }) => {
  await page.goto("/projects/vault");
  const overview = page.getByRole("tab", { name: "Overview" });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Problem" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("vault__problem.tsx")).toBeVisible();
});

test("case study hero is visible before hydration", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/projects/jam");
  await page.waitForTimeout(800);
  const opacity = await page.locator("main h1").evaluate((el) => getComputedStyle(el.closest(".rise-in")).opacity);
  expect(Number(opacity)).toBeGreaterThan(0.9);
  await ctx.close();
});
