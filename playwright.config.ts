import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // One spec in this phase. No parallelism to configure, no retries to hide a
  // flake behind.
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  // Next compiles each route on demand in dev, and a cold compile of
  // /cases/[id] measured 9.1s on this machine — well past the 5s default.
  // The generous ceiling is about dev-mode compilation, not about waiting for
  // a flaky app: the action itself ran in 116ms.
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // A port of its own, so an already-running `npm run dev` on 3000 neither
    // shadows the spec nor gets killed by it. `predev` migrates first.
    // localhost rather than 127.0.0.1: Next allows it as a dev origin by
    // default, so the HMR channel is not blocked and next.config.ts does not
    // need an allowedDevOrigins entry for a test-only concern.
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
