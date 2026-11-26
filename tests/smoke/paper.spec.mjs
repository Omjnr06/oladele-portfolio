import { test, expect } from "@playwright/test";
import { profile } from "../../src/content/profile.js";

const nav = (page) => page.getByRole("navigation", { name: "Site" });
const attrs = (page) => page.evaluate(() => ({ ...document.documentElement.dataset }));

test("paper is public: a theme link applies it with no preview flag", async ({ page }) => {
  await page.goto("/?theme=paper-cream");
  expect(await attrs(page)).toMatchObject({ pack: "paper", theme: "cream", nav: "tabs" });
});

test("preview flag turns on paper before paint, with tabs and the report header", async ({ page }) => {
  await page.goto("/?preview=paper&theme=paper-kraft");
  const a = await attrs(page);
  expect(a).toMatchObject({ pack: "paper", theme: "kraft", nav: "tabs" });
  await expect(page.getByText(profile.marginNotes.home, { exact: true })).toBeVisible();
});

test("modern hides paper extras and never downloads the handwriting font", async ({ page }) => {
  const fonts = [];
  page.on("request", (r) => r.resourceType() === "font" && fonts.push(r.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(profile.marginNotes.home, { exact: true })).toBeHidden();
  await expect(page.locator(".written-name").first()).toBeHidden();
  expect(fonts.length).toBeLessThanOrEqual(2);
});

test("notebook tabs sit on the left edge on desktop", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/resume?preview=paper&theme=paper-cream");
  await expect.poll(async () => (await nav(page).boundingBox()).x).toBeLessThan(1);
  const box = await nav(page).boundingBox();
  expect(box.width).toBeLessThanOrEqual(88);
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

test("back button in paper returns without the old sheet turn", async ({ page }) => {
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
  await expect(page.locator(".flip-sheet")).toHaveCount(0);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("inner pages in paper turn a single page, only home gets the notebook", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop tabs");
  await page.goto("/resume?theme=paper-cream");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    window.__seen = [];
    new MutationObserver(() => {
      const d = document.documentElement;
      if (d.hasAttribute("data-book-flip")) window.__seen.push("book");
      if (d.hasAttribute("data-page-turn")) window.__seen.push(`turn-${d.dataset.pageTurn}`);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-book-flip", "data-page-turn"] });
  });
  expect(await page.evaluate(() => window.__omjBookGo?.("/projects"))).toBe(true);
  await expect(page).toHaveURL(/\/projects$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-page-turn"))).toBe(false);
  expect(await page.evaluate(() => [...new Set(window.__seen)])).toEqual(["turn-prev"]);
  await expect(page.locator(".book-stage")).toBeHidden();
  await page.evaluate(() => (window.__seen = []));
  await nav(page).getByRole("link", { name: "Resume" }).click();
  await expect(page).toHaveURL(/\/resume(\?|$)/);
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-page-turn"))).toBe(false);
  expect(await page.evaluate(() => [...new Set(window.__seen)])).toEqual(["turn-next"]);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().filter((x) => x.effect?.pseudoElement).length)).toBe(0);
});

test("paper back-to-top is the handwritten note", async ({ page }) => {
  await page.goto("/resume?preview=paper&theme=paper-cream");
  await page.mouse.wheel(0, 1500);
  await expect(page.getByRole("button", { name: "Back to top" }).getByText("↑ top")).toBeVisible();
});

test("theme menu: paper is selectable and switching back restores the nav", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.goto("/resume");
  await nav(page).getByRole("button", { name: "Theme" }).click();
  await expect(page.getByRole("button", { name: /Paper/ })).toBeEnabled();
  await page.getByRole("button", { name: /Paper/ }).click();
  await expect.poll(() => attrs(page)).toMatchObject({ pack: "paper", theme: "cream", nav: "tabs" });
  await expect(page.getByRole("radiogroup", { name: "Navigation style" })).toBeHidden();
  await page.getByRole("button", { name: /Default/ }).click();
  await expect.poll(() => attrs(page)).toMatchObject({ pack: "modern", nav: "rail" });
});

test("case studies become lab notebook pages in paper only", async ({ page }) => {
  await page.goto("/projects/pimplenet?theme=paper-cream");
  await expect(page.getByText("PimpleNet lab notebook")).toBeVisible();
  await expect(page.getByText(/^Fig\. 1/)).toBeVisible();
  await expect(page.getByText("end of notes, O.M.")).toBeVisible();
  await expect(page.locator(".written-name")).toBeVisible();
  await page.goto("/projects/pimplenet?theme=modern-cyan");
  await expect(page.getByText("PimpleNet lab notebook")).toBeHidden();
  await expect(page.getByText(/^Fig\. 1/)).toBeHidden();
  await expect(page.getByText("omj@server:~$")).toBeVisible();
});

test("paper first visit opens the notebook cover, then hands back the page", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    try {
      localStorage.setItem("omj-prefs", JSON.stringify({ pack: "paper", variant: "cream" }));
    } catch {}
    new MutationObserver(() => {
      if (document.documentElement.hasAttribute("data-boot-open")) window.__opened = true;
      const t = document.querySelector(".boot .book-title");
      if (t && !window.__title) window.__title = t.textContent;
    }).observe(document, { attributes: true, childList: true, subtree: true });
  });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => window.__title)).toBe("Oladele's Portfolio");
  await expect.poll(() => page.evaluate(() => window.__opened === true), { timeout: 10000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-boot") || document.documentElement.hasAttribute("data-boot-open")), { timeout: 10000 }).toBe(false);
  await expect(page.locator(".boot")).toHaveCount(0);
});

test("grind gets the written name in paper", async ({ page }) => {
  await page.goto("/grind?theme=paper-cream");
  await expect(page.locator(".written-name")).toBeVisible();
});

test("paper text sits on the ruled lines, modern is untouched", async ({ page }) => {
  await page.goto("/resume?theme=paper-cream");
  await page.waitForLoadState("networkidle");
  const offsets = await page.evaluate(() => {
    const pg = document.querySelector(".paper-page").getBoundingClientRect().top;
    return [...document.querySelectorAll(".paper-page li")].filter((li) => li.getClientRects().length).slice(0, 8).map((li) => {
      const cs = getComputedStyle(li);
      return { lh: cs.lineHeight, mod: Math.round(((li.lastElementChild.getBoundingClientRect().top - pg) % 32) + 32) % 32 };
    });
  });
  expect(offsets.length).toBeGreaterThan(3);
  expect(new Set(offsets.map((o) => o.lh))).toEqual(new Set(["32px"]));
  expect(new Set(offsets.map((o) => o.mod)).size).toBe(1);
  await page.goto("/resume?theme=modern-cyan");
  await page.waitForLoadState("networkidle");
  expect(await page.locator("[data-snapped]").count()).toBe(0);
});

test("music becomes a sketchbook in paper and stays dark in modern", async ({ page }) => {
  const look = () =>
    page.evaluate(() => {
      const bg = document.querySelector(".mv-grid-bg, .mvm-dots");
      const card = document.querySelector(".mv-clip-node, .mvm-card");
      return { bg: getComputedStyle(bg).backgroundColor, frame: getComputedStyle(card).borderTopColor };
    });
  await page.goto("/music?theme=paper-cream");
  await expect(page.locator(".mv-clip-node, .mvm-card").first()).toBeVisible();
  expect(await look()).toEqual({ bg: "rgb(246, 241, 231)", frame: "rgb(251, 249, 243)" });
  await page.goto("/music?theme=modern-cyan");
  await expect(page.locator(".mv-clip-node, .mvm-card").first()).toBeVisible();
  expect((await look()).bg).not.toBe("rgb(246, 241, 231)");
});

test("switching to a pack plays its boot once per session", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop theme menu");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__boots = 0;
    new MutationObserver((ms) => {
      for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.matches?.(".boot")) window.__boots++;
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/resume");
  await page.waitForLoadState("networkidle");
  const menu = async () => page.getByRole("navigation", { name: "Site" }).getByRole("button", { name: "Theme" }).click();
  await menu();
  await page.getByRole("button", { name: /^Paper/ }).click();
  await expect.poll(() => page.evaluate(() => window.__boots)).toBe(1);
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 8000 });
  expect(await page.evaluate(() => document.documentElement.dataset.pack)).toBe("paper");
  await menu();
  await page.getByRole("button", { name: /^Default/ }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.pack)).toBe("modern");
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__boots)).toBe(1);
});
