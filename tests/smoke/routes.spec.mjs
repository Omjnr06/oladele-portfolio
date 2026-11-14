import { test, expect } from "@playwright/test";
import { ROUTES, watchErrors } from "../routes.mjs";

for (const route of ROUTES) {
  test(`${route.name} loads cleanly`, async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(route.path, { waitUntil: "load" });
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}
