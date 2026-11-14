import { test, expect } from "@playwright/test";

test("filters in the URL are applied", async ({ page }) => {
  await page.goto("/grind?track=pm&q=google");
  const track = page.getByRole("radiogroup", { name: "Track" });
  await expect(track.locator('[data-value="pm"]')).toHaveAttribute("aria-checked", "true");
  await expect(page.getByPlaceholder("Company, role or city")).toHaveValue("google");
});

test("slash focuses the search", async ({ page }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "keyboard shortcut is a desktop feature");
  await page.goto("/grind");
  await page.waitForTimeout(800);
  await page.keyboard.press("/");
  await expect(page.getByPlaceholder("Company, role or city")).toBeFocused();
});

test("changing a filter updates the URL", async ({ page }) => {
  await page.goto("/grind");
  await page.getByRole("radiogroup", { name: "Track" }).locator('[data-value="swe"]').click();
  await expect(page).toHaveURL(/track=swe/);
});
