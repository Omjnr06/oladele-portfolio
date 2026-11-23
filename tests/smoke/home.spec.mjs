import { test, expect } from "@playwright/test";
import { highlightedProjects } from "../../src/content/projects.js";
import { highlightedExperience } from "../../src/content/resume.js";

const SCREENS = [
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];

for (const theme of ["modern-cyan", "paper-cream"]) {
  for (const [w, h] of SCREENS) {
    test(`recruiter essentials fit within a small scroll: ${theme} ${w}x${h}`, async ({ page }, info) => {
      test.skip(info.project.name !== "smoke-desktop", "laptop and desktop sizes");
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`/?theme=${theme}`);
      await page.waitForLoadState("networkidle");
      const bottoms = await page.evaluate(() =>
        Object.fromEntries(["contact", "experience", "projects", "gallery", "spotlight"].map((id) => [id, document.getElementById(id)?.getBoundingClientRect().bottom ?? Infinity])),
      );
      const fold = Math.max(h, 800);
      for (const [id, bottom] of Object.entries(bottoms)) expect(bottom, id).toBeLessThanOrEqual(fold);
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(fold);
    });
  }
}

test("home shows the highlighted roles, projects, resume and music", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "View resume" })).toHaveAttribute("href", /\.pdf$/);
  const roles = page.locator("#experience li h3");
  await expect(roles).toHaveText(highlightedExperience.map((r) => r.role));
  const cards = page.locator("#projects li h3");
  await expect(cards).toHaveText(highlightedProjects.map((p) => p.title.split(" - ")[0]));
  await expect(page.locator("#spotlight").getByRole("link", { name: "Open the Music Vault" })).toBeVisible();
  await expect(page.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/projects");
});

test("projects page lists every project", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: /Projects and hackathons/i })).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
});

for (const theme of ["modern-cyan", "paper-cream"]) {
  test(`contact opens as a panel from the nav and closes: ${theme}`, async ({ page }) => {
    await page.goto(`/resume?theme=${theme}`);
    await page.locator("[data-site-nav]").getByRole("link", { name: "Contact" }).click();
    const panel = page.getByRole("dialog", { name: "Get in touch" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: /X/ })).toHaveAttribute("href", /x\.com/);
    await expect(panel.getByText("Doha, Qatar")).toBeVisible();
    await expect(panel.getByRole("link", { name: "View resume" })).toHaveAttribute("href", /\.pdf$/);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/\/resume/);
  });
}

test("a #contact link opens the contact panel", async ({ page }) => {
  await page.goto("/projects#contact");
  await expect(page.getByRole("dialog", { name: "Get in touch" })).toBeVisible();
});

test("roles show their logos inline", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experience .company-logo")).toHaveCount(highlightedExperience.filter((r) => r.logo).length);
  await page.goto("/resume");
  await expect(page.locator(".company-logo").first()).toBeVisible();
});

test("names write or type themselves in", async ({ page }) => {
  await page.goto("/resume?theme=modern-cyan");
  await expect(page.getByRole("heading", { level: 1, name: "Oladele Magbadelo" })).toBeVisible();
  await expect(page.locator(".typed").first()).toBeVisible();
  await page.goto("/resume?theme=paper-cream");
  await expect(page.getByRole("heading", { level: 1, name: "Oladele Magbadelo" })).toBeVisible();
  await expect(page.locator(".written-name svg text")).toHaveText("Oladele Magbadelo");
  await page.waitForTimeout(2500);
  await page.locator("h1 .written-name").hover();
  await expect.poll(() => page.evaluate(() => document.querySelector("h1 .written-name").getAnimations({ subtree: true }).some((a) => a.playState === "running"))).toBe(true);
});

test("paper captions never sit under the tape", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "desktop layout");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/?theme=paper-cream");
  for (const id of ["gallery", "spotlight"]) {
    const note = page.getByText(id === "gallery" ? "a snapshot of my life" : "the music side", { exact: false });
    const [n, b] = [await note.boundingBox(), await page.locator(`#${id}`).boundingBox()];
    expect(n.y, id).toBeGreaterThan(b.y + b.height - 1);
  }
});

test("tagline: cool gets sunglasses and jamming opens an inline band", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "hover");
  await page.goto("/?theme=modern-cyan");
  await expect(page.locator(".cool-word")).toHaveText("cool");
  await expect(page.locator(".jam-word")).toHaveText("Jamming");
  await page.locator(".jam-word").hover();
  await expect(page.locator(".jam-band .band-player")).toHaveCount(4);
  await expect(page.locator(".jam-word")).toHaveCSS("color", await page.locator(".cool-word").evaluate((e) => getComputedStyle(e).color));
  await expect(page.locator(".jam-group[data-run] .jam-letter")).toHaveCount(7);
  await page.waitForTimeout(2500);
  await expect(page.locator(".jam-band")).toHaveCount(1);
  await page.mouse.move(5, 5);
  await expect(page.locator(".jam-band")).toHaveCount(0, { timeout: 4000 });
});

test("terminal contact panel shows the ssh randomart seal", async ({ page }) => {
  await page.goto("/?theme=modern-cyan#contact");
  const art = page.locator(".randomart");
  await expect(art).toBeVisible();
  await expect(art).toContainText("[magbadelojr]");
  await expect(art).toContainText("host verified");
  await page.goto("/?theme=paper-cream#contact");
  await expect(page.locator(".randomart")).toBeHidden();
});
