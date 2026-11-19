import { test, expect } from "@playwright/test";

const nav = (page) => page.getByRole("navigation", { name: "Site" });

test("navigating shows the cd veil, first load does not", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.locator(".cd-veil")).toHaveCount(0);
  await expect(page.locator(".page-enter")).toHaveCount(1);
  await nav(page).getByRole("link", { name: "Music" }).click();
  await expect(page.locator(".cd-veil")).toContainText("cd /music");
  await expect(page.locator(".cd-veil")).toContainText("opening music vault");
  await expect(page.locator(".cd-veil")).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator(".page-enter")).toHaveCount(0);
});

test("the nav stays above the veil", async ({ page }) => {
  await page.goto("/projects/vault");
  await nav(page).getByRole("link", { name: "Resume" }).click();
  await expect(page.locator(".cd-veil")).toBeVisible();
  const z = await page.evaluate(() => getComputedStyle(document.querySelector("[data-site-nav]")).zIndex);
  expect(Number(z)).toBeGreaterThan(70);
});

test("reduced motion keeps the plain page enter", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/resume");
  await nav(page).getByRole("link", { name: "Music" }).click();
  await expect(page).toHaveURL(/\/music/);
  await expect(page.locator(".cd-veil")).toHaveCount(0);
  await ctx.close();
});
