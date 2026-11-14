import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/.results",
  snapshotPathTemplate: "{testDir}/.baseline/{arg}{ext}",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: "smoke-desktop",
      testDir: "./tests/smoke",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 600 } },
    },
    {
      name: "smoke-phone",
      testDir: "./tests/smoke",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 700 } },
    },
    {
      name: "visual",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
