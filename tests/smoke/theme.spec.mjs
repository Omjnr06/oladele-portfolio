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

test("theme menu opens from the nav, switches colour and closes with Escape", async ({ page }) => {
  await page.goto("/resume");
  const trigger = page.getByRole("navigation", { name: "Site" }).getByRole("button", { name: "Theme" });
  const dialog = page.getByRole("dialog", { name: "Choose a theme" });
  await expect(async () => {
    if (!(await dialog.count())) await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(dialog.getByRole("radio", { name: "Cyan" })).toHaveAttribute("aria-checked", "true");
  await dialog.getByRole("radio", { name: "Neon" }).click();
  await expect.poll(() => attrs(page)).toEqual({ pack: "modern", theme: "neon" });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("omj-prefs")).variant)).toBe("neon");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.reload();
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "neon" });
});

test("saved nav style is applied before first paint", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("omj-prefs", JSON.stringify({ pack: "modern", variant: "cyan", navMode: "pill" }));
    document.addEventListener("readystatechange", () => {
      if (document.readyState === "interactive") window.__navAtParse = document.documentElement.getAttribute("data-nav");
    });
  });
  await page.goto("/");
  expect(await page.evaluate(() => window.__navAtParse)).toBe("pill");
});

test("variant links apply new colours", async ({ page }) => {
  await page.goto("/?theme=modern-daylight");
  expect(await attrs(page)).toEqual({ pack: "modern", theme: "daylight" });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(247, 248, 250)");
});
