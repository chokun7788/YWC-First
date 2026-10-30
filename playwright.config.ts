import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: { command: process.env.E2E_PRODUCTION === "1" ? "npm run start -- --hostname 127.0.0.1" : "npm run dev -- --hostname 127.0.0.1", url: "http://127.0.0.1:3000/api/health", reuseExistingServer: !process.env.CI, timeout: 120000 },
});
