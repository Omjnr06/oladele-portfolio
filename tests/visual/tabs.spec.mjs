import { test, expect } from "@playwright/test";

const STRICT = !!process.env.VISUAL_STRICT;
const opts = (extra = {}) => ({
  fullPage: true,
  animations: "disabled",
  caret: "hide",
  maxDiffPixelRatio: STRICT ? 0.0005 : 0.01,
  threshold: STRICT ? 0.05 : 0.2,
  ...extra,
});

const TABS = {
  jam: { path: "/projects/jam", tabs: ["Overview", "Demo", "Architecture", "Design", "Docs & Code"] },
  vault: { path: "/projects/vault", tabs: ["Overview", "Problem", "Architecture", "Design", "What's Next", "Docs & Code"] },
};

const SIZES = [
  { name: "desk", width: 1366, height: 768 },
  { name: "phone", width: 390, height: 700 },
];

const media = (page) => [page.locator("video"), page.locator('[style*="background-image"]')];

for (const size of SIZES) {
  test.describe(size.name, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    for (const [name, { path, tabs }] of Object.entries(TABS)) {
      for (const tab of tabs) {
        test(`${name} ${tab}`, async ({ page }) => {
          await page.goto(path, { waitUntil: "load" });
          await page.waitForTimeout(1200);
          await page.locator("button").filter({ hasText: tab }).filter({ hasNotText: "Click" }).first().click();
          await page.waitForTimeout(900);
          await expect(page).toHaveScreenshot(`tab-${name}-${tab.replace(/[^a-z]/gi, "_")}-${size.name}.png`, opts({ mask: [page.locator("video")] }));
        });
      }
    }

    test("home music spotlight", async ({ page }) => {
      await page.goto("/", { waitUntil: "load" });
      await page.waitForTimeout(1200);
      await expect(page.locator("#spotlight")).toHaveScreenshot(`spotlight-music-${size.name}.png`, opts({ fullPage: undefined, mask: media(page) }));
    });

    test("projects page explorer", async ({ page }) => {
      await page.goto("/projects", { waitUntil: "load" });
      await page.waitForTimeout(1200);
      const projects = page.locator("#projects");
      await projects.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await expect(projects).toHaveScreenshot(`projects-${size.name}.png`, opts({ fullPage: undefined, mask: media(page) }));
      const graph = page.getByRole("radio", { name: "--graph" });
      if (await graph.isVisible()) {
        await graph.click();
        await page.waitForTimeout(600);
        await expect(projects).toHaveScreenshot(`projects-graph-${size.name}.png`, opts({ fullPage: undefined, mask: media(page) }));
      }
    });
  });
}
