import { test, expect } from "@playwright/test";

const human = (page) =>
  page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    try {
      if (!localStorage.getItem("omj-prefs")) localStorage.setItem("omj-prefs", JSON.stringify({ pack: "modern", variant: "cyan" }));
    } catch {}
    new MutationObserver(() => {
      if (document.documentElement.hasAttribute("data-boot")) window.__sawBoot = true;
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-boot"] });
  });
const booting = (page) => page.evaluate(() => document.documentElement.hasAttribute("data-boot"));
const overlay = (page) => page.locator(".boot[data-auto]");

test("first home visit of a session boots once, then hands back the page", async ({ page }) => {
  await human(page);
  await page.goto("/");
  expect(await page.evaluate(() => window.__sawBoot === true)).toBe(true);
  await expect.poll(() => booting(page), { timeout: 5000 }).toBe(false);
  await expect(overlay(page)).toHaveCount(0);
  await page.reload();
  expect(await booting(page)).toBe(false);
});

test("no boot when the session starts on a deep link", async ({ page }) => {
  await human(page);
  await page.goto("/resume");
  await page.goto("/");
  expect(await booting(page)).toBe(false);
  await expect(overlay(page)).toBeHidden();
});

test("no boot on theme links", async ({ page }) => {
  await human(page);
  await page.goto("/?theme=modern-neon");
  expect(await booting(page)).toBe(false);
});

test("no boot with reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await human(page);
  await page.goto("/");
  expect(await booting(page)).toBe(false);
  await ctx.close();
});

test("OMJ card opens without a replay boot button", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "the mark lives in the desktop rail");
  await page.goto("/resume");
  const mark = page.getByRole("navigation", { name: "Site" }).getByRole("button", { name: "About Oladele" });
  const card = page.getByRole("dialog", { name: "About Oladele" });
  await expect(async () => {
    if (!(await card.count())) await mark.click();
    await expect(card).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(card.getByRole("button", { name: "Replay boot" })).toHaveCount(0);
  await expect(card.getByRole("link", { name: "Open resume" })).toBeVisible();
});
