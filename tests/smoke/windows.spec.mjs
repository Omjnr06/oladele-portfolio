import { test, expect } from "@playwright/test";

const desktopOnly = (info) => test.skip(info.project.name !== "smoke-desktop", "windows is desktop only");
const rscCounter = (page) => {
  const c = { n: 0 };
  page.on("request", (r) => {
    const h = r.headers();
    if ((h["rsc"] || r.url().includes("_rsc=")) && !h["next-router-prefetch"]) c.n++;
  });
  return c;
};
const win = (page, title) => page.locator(`.win[aria-label="${title}"]`);

test("windows stays private without the preview flag", async ({ page }) => {
  await page.goto("/?theme=windows-aero");
  expect(await page.evaluate(() => document.documentElement.dataset.pack)).toBe("modern");
  await expect(page.locator(".win-taskbar")).toHaveCount(0);
});

test("phones fall back to modern even with the flag", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone only");
  await page.goto("/?preview=windows&theme=windows-aero");
  expect(await page.evaluate(() => document.documentElement.dataset.pack)).toBe("modern");
  await expect(page.locator(".win-taskbar")).toHaveCount(0);
});

test("the landing page opens inside its own window on the desktop", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/resume?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await expect(win(page, "Resume")).toHaveAttribute("data-focused", "");
  await expect(win(page, "Resume").getByRole("heading", { name: "Project Manager" }).first()).toBeVisible();
  await expect(page.locator(".win-icon")).toHaveCount(7);
  await expect(page.getByRole("navigation", { name: "Taskbar" }).getByRole("button", { name: "Resume" })).toBeVisible();
});

test("opening, back and forward move between windows with no server requests", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.waitForLoadState("networkidle");
  const rsc = rscCounter(page);
  await page.locator(".win-icon", { hasText: "Grind" }).dblclick();
  await expect(page).toHaveURL(/\/grind$/);
  await expect(win(page, "Grind")).toHaveAttribute("data-focused", "");
  await page.goBack();
  await expect(page).toHaveURL(/\/\?preview=windows|\/$/);
  await expect(win(page, "About Oladele")).toHaveAttribute("data-focused", "");
  await page.goForward();
  await expect(win(page, "Grind")).toHaveAttribute("data-focused", "");
  await win(page, "Grind").getByRole("button", { name: "Minimize Grind" }).click();
  await expect(win(page, "Grind")).toHaveAttribute("data-min", "");
  await page.getByRole("navigation", { name: "Taskbar" }).getByRole("button", { name: "Grind" }).click();
  await expect(win(page, "Grind")).not.toHaveAttribute("data-min", "");
  expect(rsc.n).toBe(0);
});

test("links inside a window open windows instead of navigating", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.waitForLoadState("networkidle");
  const rsc = rscCounter(page);
  await page.locator("#win-client a[href^='/projects/']").first().click();
  await expect(page).toHaveURL(/\/projects\//);
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", /case study/);
  await expect(win(page, "About Oladele")).toHaveCount(1);
  expect(rsc.n).toBe(0);
});

test("leaving windows hands back the page for the current address", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.locator(".win-icon", { hasText: "Grind" }).dblclick();
  await expect(page).toHaveURL(/\/grind$/);
  await page.getByRole("button", { name: "Leave Windows" }).click();
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.pack)).toBe("modern");
  await expect(page.locator(".win-taskbar")).toHaveCount(0);
});
