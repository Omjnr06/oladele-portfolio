import { test, expect } from "@playwright/test";

const human = (page) =>
  page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.__boots = 0;
    new MutationObserver((ms) => {
      for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.matches?.(".boot:not([data-auto])")) window.__boots++;
    }).observe(document, { childList: true, subtree: true });
  });
const menu = (page) => page.getByRole("group", { name: "Choose a version" });
const attrs = (page) => page.evaluate(() => ({ ...document.documentElement.dataset }));
const saved = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("omj-prefs") || "null"));

test("first ever home visit: the boot asks for a version, paper plays the notebook and is remembered", async ({ page }) => {
  await human(page);
  await page.goto("/");
  const m = menu(page);
  await expect(m.getByText(/booting default in \d/)).toBeVisible();
  await m.getByRole("button", { name: /paper/ }).hover();
  await expect(m.getByText("press enter to boot")).toBeVisible();
  await m.getByRole("button", { name: /paper/ }).click();
  await expect.poll(() => page.evaluate(() => window.__boots)).toBe(1);
  await expect(page.locator(".boot:not([data-auto])")).toHaveCount(0, { timeout: 8000 });
  expect(await attrs(page)).toMatchObject({ pack: "paper", theme: "cream" });
  expect((await saved(page)).pack).toBe("paper");
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-boot-menu"))).toBe(false);
  expect((await attrs(page)).pack).toBe("paper");
});

test("doing nothing boots default after the countdown", async ({ page }) => {
  await human(page);
  await page.goto("/");
  await expect(menu(page).getByText(/booting default in \d/)).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-boot")), { timeout: 12000 }).toBe(false);
  expect((await saved(page)).pack).toBe("modern");
  expect((await attrs(page)).pack).toBe("modern");
});

test("keys pick a version: arrows and enter, or a number", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "keyboard");
  await human(page);
  await page.goto("/");
  await expect(menu(page).getByText(/booting default in \d/)).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(menu(page).getByText("press enter to boot")).toBeVisible();
  await expect(menu(page).getByRole("button", { name: /paper/ })).toHaveAttribute("data-active");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-boot")), { timeout: 5000 }).toBe(false);
  expect((await saved(page)).pack).toBe("modern");
});

test("pressing 3 boots windows on the desktop", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "windows is desktop only");
  await human(page);
  await page.goto("/");
  await expect(menu(page).getByText(/booting default in \d/)).toBeVisible();
  await page.keyboard.press("3");
  await expect(page.locator(".win-taskbar")).toBeVisible({ timeout: 15000 });
  expect((await attrs(page)).pack).toBe("windows");
});

test("phones see windows as desktop only", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone only");
  await human(page);
  await page.goto("/");
  const w = menu(page).getByRole("button", { name: /windows/ });
  await expect(w).toBeDisabled();
  await expect(w).toContainText("desktop only");
});

test("returning visitors, deep links and theme links get no menu", async ({ page }) => {
  await human(page);
  await page.goto("/resume");
  await expect(menu(page)).toHaveCount(0);
  await page.goto("/");
  await expect(menu(page)).toBeHidden();
  const ctx = await page.context().browser().newContext();
  const fresh = await ctx.newPage();
  await human(fresh);
  await fresh.goto(new URL("/?theme=paper-cream", page.url()).href);
  expect(await fresh.evaluate(() => document.documentElement.hasAttribute("data-boot-menu"))).toBe(false);
  expect((await attrs(fresh)).pack).toBe("paper");
  await ctx.close();
});

test("compare versions from the palette switches without a countdown", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "keyboard palette is desktop only");
  await page.goto("/resume");
  const palette = page.getByRole("dialog", { name: "Search the site" });
  const ask = async () => {
    await expect(async () => {
      if (!(await palette.count())) await page.keyboard.press("Control+k");
      await expect(palette).toBeVisible({ timeout: 1000 });
    }).toPass();
    await page.getByRole("combobox", { name: "Search the site" }).fill("compare versions");
    await expect(palette.getByRole("option", { selected: true })).toContainText("Compare versions");
    await page.keyboard.press("Enter");
  };
  await ask();
  const c = page.getByRole("dialog", { name: "Compare versions" });
  await expect(c).toBeVisible();
  await expect(c.getByRole("button", { name: /^Default/ })).toContainText("Current");
  await page.keyboard.press("Escape");
  await expect(c).toHaveCount(0);
  await ask();
  await c.getByRole("radiogroup", { name: "Paper tones" }).getByRole("radio", { name: "Kraft" }).click();
  await c.getByRole("button", { name: "Paper", exact: true }).click();
  await expect(c).toHaveCount(0);
  await expect.poll(async () => (await attrs(page)).theme).toBe("kraft");
  await expect(page).toHaveURL(/\/resume$/);
});

test("windows is public: a theme link applies it on the desktop", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "windows is desktop only");
  await page.goto("/?theme=windows-aero");
  expect((await attrs(page)).pack).toBe("windows");
  await expect(page.locator(".win-taskbar")).toBeVisible();
});
