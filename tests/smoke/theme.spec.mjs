import { test, expect } from "@playwright/test";

const attrs = (page) =>
  page.evaluate(() => ({
    pack: document.documentElement.getAttribute("data-pack"),
    theme: document.documentElement.getAttribute("data-theme"),
  }));

test("defaults to modern cyan", async ({ page }) => {
  await page.goto("/");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "cyan" });
});

test("theme is set before any app script runs", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("omj-prefs", JSON.stringify({ pack: "modern", variant: "cyan" }));
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "interactive") window.__themeAtParse = document.documentElement.getAttribute("data-theme");
    });
  });
  await page.goto("/resume");
  expect(await page.evaluate(() => window.__themeAtParse)).toBe("cyan");
});

test("bad saved prefs fall back safely", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("omj-prefs", "{not json"));
  await page.goto("/");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "cyan" });
  await page.addInitScript(() => localStorage.setItem("omj-prefs", JSON.stringify({ pack: "nope", variant: "nope" })));
  await page.goto("/projects/jam");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "cyan" });
});

test("?theme= link applies for the tab and ignores unknown values", async ({ page }) => {
  await page.goto("/?theme=modern-cyan");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "cyan" });
  expect(await page.evaluate(() => sessionStorage.getItem("omj-theme"))).toBe("modern-cyan");
  await page.goto("/?theme=zzz");
  expect(await page.evaluate(() => sessionStorage.getItem("omj-theme"))).toBe("modern-cyan");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "cyan" });
});

test("theme chooser only appears in preview", async ({ page }) => {
  await page.goto("/resume");
  await page.waitForTimeout(500);
  await expect(page.getByRole("button", { name: "Theme" })).toHaveCount(0);

  await page.goto("/resume?preview=packs");
  const trigger = page.getByRole("button", { name: "Theme" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Choose a theme" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Cyan" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.goto("/resume?preview=off");
  await page.waitForTimeout(500);
  await expect(page.getByRole("button", { name: "Theme" })).toHaveCount(0);
});
