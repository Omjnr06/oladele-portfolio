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
  await expect(page.locator(".win-icon")).toHaveCount(10);
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

test("links inside the page window open windows instead of navigating", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/music?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.waitForLoadState("networkidle");
  const rsc = rscCounter(page);
  await page.locator('#win-client a[href="/resume"]').first().dispatchEvent("click");
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Resume");
  await expect(win(page, "Music")).toHaveCount(1);
  expect(rsc.n).toBe(0);
});

test("shut down hands back the modern page for the current address", async ({ page }, info) => {
  desktopOnly(info);
  await page.goto("/?preview=windows&theme=windows-aero");
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.locator(".win-icon", { hasText: "Grind" }).dblclick();
  await expect(page).toHaveURL(/\/grind$/);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("dialog", { name: "Start menu" }).getByRole("button", { name: "Shut down", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.pack)).toBe("modern");
  await expect(page.locator(".win-taskbar")).toHaveCount(0);
});

const ready = async (page, path = "/") => {
  await page.goto(`${path}${path.includes("?") ? "&" : "?"}preview=windows&theme=windows-aero`);
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
};

test("start menu: headshot, pinned apps, all programs and search", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Start" }).click();
  const menu = page.getByRole("dialog", { name: "Start menu" });
  await expect(menu.getByRole("img", { name: /Oladele/ })).toBeVisible();
  await expect(menu.getByRole("searchbox", { name: "Search programs and files" })).toBeFocused();
  await menu.getByRole("button", { name: "All Programs" }).click();
  await expect(menu.getByRole("button", { name: "The Vault" })).toBeVisible();
  await menu.getByRole("button", { name: "The Vault" }).click();
  await expect(menu).toHaveCount(0);
  await expect(page).toHaveURL(/\/projects\/vault$/);
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "The Vault");
  await page.getByRole("button", { name: "Start" }).click();
  await menu.getByRole("searchbox").fill("grind");
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Search the site" })).toHaveValue("grind");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Start" }).click();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start" })).toBeFocused();
});

test("switch user goes to paper", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "More shut down options" }).click();
  await page.getByRole("menuitem", { name: /Switch user/ }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.pack)).toBe("paper");
  await expect(page.locator(".win-taskbar")).toHaveCount(0);
});

test("desktop view sizes, sort, pinned taskbar and hidden tray icons", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Show desktop" }).click();
  await page.mouse.click(900, 300, { button: "right" });
  await page.getByRole("menuitem", { name: "View" }).hover();
  const view = page.getByRole("menu", { name: "View" });
  await expect(view.getByRole("menuitemradio", { name: "Medium icons" })).toHaveAttribute("aria-checked", "true");
  await view.getByRole("menuitemradio", { name: "Large icons" }).click();
  await expect(page.locator(".win-desktop")).toHaveAttribute("data-size", "lg");
  await page.reload();
  await expect(page.locator(".win-desktop")).toHaveAttribute("data-size", "lg");
  await page.getByRole("button", { name: "Show desktop" }).click();
  await page.mouse.click(900, 300, { button: "right" });
  await page.getByRole("menuitem", { name: "Sort by" }).press("ArrowRight");
  await expect(page.getByRole("menu", { name: "Sort by" }).getByRole("menuitem", { name: "Name" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".win-icon", { hasText: "About Oladele" })).toHaveAttribute("style", /translate\(0px, 0px\)/);
  const bar = page.getByRole("navigation", { name: "Taskbar" });
  const snake = page.locator('[data-task="snake"]');
  await expect(snake).toHaveCount(0);
  await expect(bar.getByRole("button", { name: "Gallery" })).not.toHaveAttribute("data-running", "");
  await bar.getByRole("button", { name: "Gallery" }).click();
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Gallery");
  await expect(bar.getByRole("button", { name: "Gallery" })).toHaveAttribute("aria-pressed", "true");
  await bar.getByRole("button", { name: "Show hidden icons" }).click();
  await page.getByRole("group", { name: "Hidden icons" }).getByRole("button", { name: "Task Manager" }).click();
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Task Manager");
  await expect(page.locator('[data-task="taskmgr"]')).toHaveAttribute("data-running", "");
});

test("desktop right-click menu and drag-to-select", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Show desktop" }).click();
  await page.mouse.click(900, 300, { button: "right" });
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("menuitem")).toHaveText(["View", "Sort by", "Refresh", "Personalize", "About Oladele"]);
  await menu.getByRole("menuitem", { name: "Personalize" }).click();
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Personalize");
  await page.getByRole("button", { name: "Show desktop" }).click();
  await page.mouse.move(4, 4);
  await page.mouse.down();
  await page.mouse.move(60, 190, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator(".win-icon[data-selected]")).toHaveCount(2);
});

test("first windows visit plays the OMJ OS boot once per session", async ({ page }, info) => {
  desktopOnly(info);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    new MutationObserver(() => {
      if (document.querySelector(".wb .wb-caption")) window.__booted = document.querySelector(".wb .wb-caption").textContent;
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/?preview=windows&theme=windows-aero");
  await expect.poll(() => page.evaluate(() => window.__booted ?? null)).toBe("Starting OMJ OS");
  await expect(page.locator(".wb")).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator("html")).not.toHaveAttribute("data-win-boot", "");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-win-ready", "");
  await page.waitForTimeout(400);
  await expect(page.locator(".wb")).toHaveCount(0);
});

test("sound toggle in the tray saves the preference", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Mute sounds" }).click();
  await expect(page.getByRole("button", { name: "Turn sounds on" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("omj-prefs")).sound)).toBe(false);
});

test("pages with a native app open as that app, not the web page", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  const resume = win(page, "Resume");
  await expect(resume.getByRole("navigation", { name: "Resume sections" })).toBeVisible();
  await expect(resume.getByRole("link", { name: "Open PDF" })).toHaveAttribute("target", "_blank");
  await expect(page.locator("#win-page")).toBeHidden();
});

test("projects explorer opens case studies as their own windows", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=projects");
  const explorer = win(page, "Projects");
  await explorer.getByRole("button", { name: "Case studies" }).click();
  const files = explorer.getByRole("option");
  await expect(files).toHaveCount(3);
  await files.filter({ hasText: "JAM" }).dblclick();
  await expect(page).toHaveURL(/\/projects\/jam$/);
  const study = win(page, "JAM");
  await expect(study).toHaveAttribute("data-focused", "");
  await study.getByRole("tab", { name: "Design" }).click();
  await expect(study.getByRole("tab", { name: "Design" })).toHaveAttribute("aria-selected", "true");
});

test("gallery steps through photos and contact composes a reply", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=gallery");
  const viewer = win(page, "Gallery");
  await expect(viewer.getByText(/^1 of \d+$/)).toBeVisible();
  await viewer.getByRole("button", { name: "Next photo" }).click();
  await expect(viewer.getByText(/^2 of \d+$/)).toBeVisible();
  await page.locator(".win-icon", { hasText: "Contact" }).dblclick();
  const mail = win(page, "Contact");
  await expect(mail.getByRole("heading", { name: "Thanks for stopping by" })).toBeVisible();
  await mail.getByRole("button", { name: "Reply" }).click();
  await expect(mail.getByRole("textbox", { name: "Subject" })).toBeVisible();
  await expect(mail.getByRole("button", { name: "Send" })).toBeVisible();
});

test("personalize lists every pack and can leave windows", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=personalize");
  const panel = win(page, "Personalize");
  await expect(panel.getByRole("button", { name: "Aero" })).toHaveAttribute("aria-pressed", "true");
  await panel.getByRole("button", { name: "Kraft" }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.pack)).toBe("paper");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("kraft");
});

test("double-clicking a project without a case study opens its live site", async ({ page, context }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=projects");
  const explorer = win(page, "Projects");
  await expect(explorer.locator(".wa-file-badge")).toHaveCount(0);
  const popup = context.waitForEvent("page");
  await explorer.getByRole("option").filter({ hasText: "Distributed URL Shortener" }).dblclick();
  expect((await popup).url()).toContain("urlshortener");
  await explorer.getByRole("option").filter({ hasText: "Internship Alert Pipeline" }).dblclick();
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Grind");
});

test("readme opens in notepad and its link runs recruiter.exe", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("button", { name: "Show desktop" }).click();
  await page.locator(".win-icon", { hasText: "readme.txt" }).dblclick();
  const pad = win(page, "readme.txt - Notepad");
  await expect(pad.getByText(/all my friends call me Junior/)).toBeVisible();
  await expect(pad.getByText("Oladele (Junior)")).toBeVisible();
  await pad.getByRole("menuitem", { name: "Format" }).click();
  await expect(pad.getByRole("menuitemcheckbox", { name: "Word Wrap" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await pad.getByRole("button", { name: "recruiter.exe" }).click();
  await expect(page).toHaveURL(/\?app=recruiter/);
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "recruiter.exe");
});

test("recruiter.exe shows the resume, contact and the three highlighted projects", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=recruiter");
  const rx = win(page, "recruiter.exe");
  await expect(rx.getByRole("heading", { name: "Oladele Magbadelo" })).toBeVisible();
  await expect(rx.locator(".rx-project")).toHaveCount(3);
  await expect(rx.locator(".rx-role")).toHaveCount(3);
  await expect(rx.getByRole("button", { name: "Copy email" })).toBeVisible();
  await expect(rx.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("target", "_blank");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("dialog", { name: "Start menu" }).locator(".sm-item").first()).toHaveText("recruiter.exe");
  await page.keyboard.press("Escape");
  await rx.getByRole("button", { name: "View resume" }).click();
  await expect(page.locator(".win[data-focused]")).toHaveAttribute("aria-label", "Resume");
});

test("task manager opens from the taskbar, lists windows and ends tasks", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.getByRole("navigation", { name: "Taskbar" }).click({ button: "right", position: { x: 600, y: 20 } });
  await page.getByRole("menuitem", { name: "Start Task Manager" }).click();
  const tm = win(page, "Task Manager");
  await expect(tm).toHaveAttribute("data-focused", "");
  const list = tm.getByRole("listbox", { name: "Running applications" });
  await list.getByRole("option", { name: /Resume/ }).click();
  await tm.getByRole("button", { name: "End Task" }).click();
  await expect(win(page, "Resume")).toHaveCount(0);
  await tm.getByRole("tab", { name: "Performance" }).click();
  await expect(tm.getByRole("meter", { name: "CPU usage" })).toBeVisible();
  await tm.getByRole("tab", { name: "Networking" }).click();
  await expect(tm.getByRole("heading", { name: "Looks picked" })).toBeVisible();
});

test("sudoku fills a cell and snake runs into the wall", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/?app=games");
  await win(page, "Games").getByRole("option", { name: "Sudoku" }).dblclick();
  const sd = win(page, "Sudoku");
  const cells = sd.locator(".sd-cell");
  await expect(cells).toHaveCount(81);
  const empty = sd.locator(".sd-cell:not([data-given])").first();
  await empty.click();
  await page.keyboard.press("5");
  await expect(sd.locator('.sd-cell[aria-current="true"]')).toHaveText("5");
  await page.keyboard.press("Backspace");
  await expect(sd.locator('.sd-cell[aria-current="true"]')).toHaveText("");
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("dialog", { name: "Start menu" }).getByRole("button", { name: "All Programs" }).click();
  await page.getByRole("dialog", { name: "Start menu" }).getByRole("button", { name: "Snake" }).click();
  const sn = win(page, "Snake");
  await expect(sn.getByText("Arrow keys or WASD. Space pauses.")).toBeVisible();
  await sn.getByRole("application").focus();
  await page.keyboard.press("ArrowRight");
  await expect(sn.locator(".sn-overlay")).toHaveCount(0);
  await expect(sn.getByText("Game over")).toBeVisible({ timeout: 8000 });
});

test("the clock opens a calendar", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/resume");
  await page.locator(".win-clock").click();
  const cal = page.getByRole("dialog", { name: "Date and time" });
  await expect(cal.locator('[aria-current="date"]')).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(cal).toHaveCount(0);
});

test("grind opens as a native list with filters", async ({ page }, info) => {
  desktopOnly(info);
  await ready(page, "/grind");
  const g = win(page, "Grind");
  await expect(page.locator("#win-page")).toBeHidden();
  const list = g.getByRole("listbox", { name: "Open roles" });
  const failed = g.getByText(/feed didn't load/);
  await expect(list.or(failed)).toBeVisible();
  if (await failed.isVisible()) return;
  await g.getByRole("button", { name: /^PM/ }).click();
  await expect(g.getByRole("button", { name: /^PM/ })).toHaveAttribute("aria-pressed", "true");
  const first = list.getByRole("option").first();
  if (await first.count()) {
    await first.click();
    await expect(g.getByRole("button", { name: "Open posting" })).toBeVisible();
  }
});
