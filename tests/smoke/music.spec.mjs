import { test, expect } from "@playwright/test";

test("deep link opens the clip player on the canvas", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "canvas is desktop only");
  await page.goto("/music?track=piano 01");
  await expect(page.locator(".mv-cp-overlay")).toBeVisible();
  await expect(page.locator(".mv-cp-media")).toHaveCount(1);
});

test("phones get the mobile wheel, not the canvas", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone only");
  await page.goto("/music");
  await expect(page.locator(".mvm-card").first()).toBeVisible();
  await expect(page.locator(".mv-canvas")).toHaveCount(0);
});

test("deep link opens the clip player on phones", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone only");
  await page.goto("/music?track=piano-01");
  await expect(page.locator(".mv-cp-overlay")).toBeVisible();
});
