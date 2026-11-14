import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("track rejects a wrong secret", async ({ request }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "run once");
  const res = await request.get("/api/track?company=smoke-test&secret=wrong");
  expect(res.status()).toBe(401);
});

test("applied is owner only", async ({ request }, info) => {
  test.skip(info.project.name !== "smoke-desktop", "run once");
  const res = await request.get("/api/applied");
  expect(res.status()).toBe(401);
});
