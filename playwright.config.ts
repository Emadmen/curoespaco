import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build using a dedicated,
 * disposable database (E2E_DATABASE_URL), reset and seeded on startup.
 *
 *   docker compose up -d && npm run test:e2e
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "mysql://cora:cora_dev_password@localhost:3307/cora_e2e";

export const E2E_ADMIN = { email: "e2e-admin@example.com", password: "e2e-admin-password-123" };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true },
      testMatch: /(booking|mobile)\.spec/,
    },
  ],
  webServer: {
    command: `node e2e/prepare-db.mjs && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "ignore",
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      ADMIN_EMAIL: E2E_ADMIN.email,
      ADMIN_PASSWORD: E2E_ADMIN.password,
      BOOKING_RATE_LIMIT: "1000",
      BOOKING_MIN_FILL_MS: "300",
    },
  },
});
