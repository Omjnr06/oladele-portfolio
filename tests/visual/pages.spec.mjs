import { test, expect } from "@playwright/test";
import { ROUTES, SIZES } from "../routes.mjs";

const VIEWPORT_ONLY = new Set(["music", "grind"]);
const NOISY = new Set(["music", "grind"]);
const STRICT = !!process.env.VISUAL_STRICT;

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    for (const route of ROUTES) {
      test(route.name, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "load" });
        await page.waitForTimeout(route.name === "music" ? 3000 : 2000);
        const mask = [page.locator('[aria-label="About Oladele"]'), page.locator("video"), page.locator('img[alt^="Gallery snapshot"]'), page.locator('#spotlight [style*="background-image"]')];
        if (route.name === "grind") mask.push(page.locator("main ul, main ol, time"));
        if (process.env.MASK_NAV) mask.push(page.locator("[data-site-nav]"));
        await expect(page).toHaveScreenshot(`${route.name}-${size.name}.png`, {
          fullPage: !VIEWPORT_ONLY.has(route.name),
          animations: "disabled",
          caret: "hide",
          mask,
          maxDiffPixelRatio: route.name === "grind" ? 0.05 : STRICT && !NOISY.has(route.name) ? 0.0005 : 0.01,
          threshold: STRICT && !NOISY.has(route.name) ? 0.05 : 0.2,
        });
      });
    }
  });
}
