import { test, expect } from "@playwright/test";

const nav = (page) => page.getByRole("navigation", { name: "Site" });
const attrs = (page) => page.evaluate(() => ({ ...document.documentElement.dataset }));

test("paper stays private without the preview flag", async ({ page }) => {
  await page.goto("/?theme=paper-cream");
  const a = await attrs(page);
  expect(a.pack).toBe("modern");
  expect(a.nav).not.toBe("tabs");
});

test("preview flag turns on paper before paint, with tabs and the report header", async ({ page }) => {
  await page.goto("/?preview=paper&theme=paper-kraft");
  const a = await attrs(page);
  expect(a).toMatchObject({ pack: "paper", theme: "kraft", nav: "tabs" });
  await expect(page.getByText("Page", { exact: false }).filter({ hasText: "of 6" }).first()).toBeVisible();
  await expect(page.getByText(/that's me!/)).toBeVisible();
});

test("modern hides paper extras and never downloads the handwriting font", async ({ page }) => {
  const fonts = [];
  page.on("request", (r) => r.resourceType() === "font" && fonts.push(r.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/that's me!/)).toBeHidden();
  await expect(page.getByText("of 6")).toBeHidden();
  expect(fonts.length).toBeLessThanOrEqual(2);
});

test("notebook tabs sit on the left edge on desktop", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/resume?preview=paper&theme=paper-cream");
  const box = await nav(page).boundingBox();
  expect(box.x).toBeLessThan(1);
  expect(box.width).toBeLessThan(80);
});

test("paper navigation zooms out to the book and turns the page", async ({ page }) => {
  await page.goto("/resume?preview=paper&theme=paper-cream");
  await page.waitForLoadState("networkidle");
  const seen = await page.evaluate(async () => {
    let book = false;
    new MutationObserver(() => {
      if (document.documentElement.hasAttribute("data-book-flip")) book = true;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-book-flip"] });
    const a = [...document.querySelectorAll('nav[aria-label="Site"] a')].find((x) => x.getAttribute("href") === "/#home");
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
    const early = document.documentElement.hasAttribute("data-book-flip");
    for (let i = 0; i < 40 && (document.documentElement.hasAttribute("data-book-flip") || location.pathname !== "/"); i++) await new Promise((r) => setTimeout(r, 100));
    return { early, book, path: location.pathname, still: document.documentElement.hasAttribute("data-book-flip") };
  });
  expect(seen).toEqual({ early: false, book: true, path: "/", still: false });
  await expect(page.locator(".cd-veil")).toHaveCount(0);
});

test("back button in paper falls back to the sheet turn", async ({ page }) => {
  await page.goto("/resume?preview=paper&theme=paper-cream");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    const a = [...document.querySelectorAll('nav[aria-label="Site"] a')].find((x) => x.getAttribute("href") === "/#home");
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
  });
  await expect(page).toHaveURL(/\/#home$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-book-flip"))).toBe(false);
  await page.goBack();
  await expect(page).toHaveURL(/\/resume/);
  await expect(page.locator(".flip-sheet")).toBeAttached();
});

test("paper back-to-top is the handwritten note", async ({ page }) => {
  await page.goto("/resume?preview=paper&theme=paper-cream");
  await page.mouse.wheel(0, 1500);
  await expect(page.getByRole("button", { name: "Back to top" }).getByText("↑ top")).toBeVisible();
});

test("theme menu: paper is in progress without the flag, selectable with it, and switching back restores the nav", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/resume");
  await nav(page).getByRole("button", { name: "Theme" }).click();
  await expect(page.getByRole("button", { name: /Paper/ })).toBeDisabled();
  await page.keyboard.press("Escape");

  await page.goto("/resume?preview=paper");
  await nav(page).getByRole("button", { name: "Theme" }).click();
  await page.getByRole("button", { name: /Paper/ }).click();
  await expect.poll(() => attrs(page)).toMatchObject({ pack: "paper", theme: "cream", nav: "tabs" });
  await expect(page.getByRole("radiogroup", { name: "Navigation style" })).toBeHidden();
  await page.getByRole("button", { name: /Default/ }).click();
  await expect.poll(() => attrs(page)).toMatchObject({ pack: "modern", nav: "rail" });
});
