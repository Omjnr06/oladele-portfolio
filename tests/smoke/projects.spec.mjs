import { test, expect } from "@playwright/test";
import { projects } from "../../src/content/projects.js";

const desktop = (info) => test.skip(info.project.name !== "smoke-desktop", "desktop layout");

test("terminal tree lists every project and selecting one previews it", async ({ page }, info) => {
  desktop(info);
  await page.goto("/projects?theme=modern-cyan");
  for (const p of projects) await expect(page.locator(`[data-leaf="${p.id}"]`).first()).toBeAttached();
  await page.locator('[data-leaf="pimplenet"]').click();
  await expect(page.locator('[data-preview="pimplenet"]').last()).toBeVisible();
  await expect(page).toHaveURL(/\?(.*&)?p=pimplenet/);
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-leaf][aria-current="true"]')).not.toHaveAttribute("data-leaf", "pimplenet");
});

test("a ?p= link opens straight to that project", async ({ page }) => {
  await page.goto("/projects?theme=modern-cyan&p=jam");
  await expect(page.locator('[data-leaf="jam"][aria-current="true"]')).toBeAttached();
});

test("graph view searches the bst for the selected project", async ({ page }, info) => {
  desktop(info);
  await page.goto("/projects?theme=modern-cyan");
  await page.getByRole("radio", { name: "--graph" }).click();
  await page.getByRole("button", { name: /^JAM$/ }).click();
  await expect(page.getByRole("button", { name: /^JAM$/ })).toHaveAttribute("aria-current", "true");
  await expect(page.locator('[data-preview="jam"]').last()).toBeVisible();
});

test("the preview links to the case study", async ({ page }, info) => {
  desktop(info);
  await page.goto("/projects?theme=modern-cyan&p=the-vault");
  await page.locator('[data-preview="the-vault"]').last().getByRole("link", { name: "Read case study" }).click();
  await expect(page).toHaveURL(/\/projects\/vault$/);
});

test("paper sketchbook swipes to the picked page", async ({ page }, info) => {
  desktop(info);
  await page.goto("/projects?theme=paper-cream");
  const contents = page.getByRole("navigation", { name: "Contents" });
  await expect(contents.getByRole("button")).toHaveCount(projects.length);
  await contents.getByRole("button", { name: /PimpleNet/ }).click();
  await expect(page.locator("[data-entry]")).toHaveCount(1);
  await expect(page.locator("[data-entry]")).toHaveAttribute("data-entry", "pimplenet");
  await expect(contents.locator('[aria-current="page"]')).toContainText("PimpleNet");
});

test("phones get one index card per project in paper", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-phone", "phone layout");
  await page.goto("/projects?theme=paper-cream");
  await expect(page.locator(".index-card")).toHaveCount(projects.length);
});

test("projects are filed into case studies, side projects and hackathons", async ({ page }, info) => {
  desktop(info);
  await page.goto("/projects?theme=modern-cyan");
  const tree = page.getByRole("list", { name: "Projects" });
  await expect(tree).toContainText("case-studies/");
  await expect(tree).toContainText("side-projects/");
  await expect(tree).toContainText("hackathons/");
  for (const p of projects) await expect(page.locator(`[data-leaf="${p.id}"]`)).toHaveCount(1);
  await expect(page.locator('[data-leaf="internship-alert-pipeline"]')).toContainText("live users");
});
