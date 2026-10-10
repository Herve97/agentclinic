import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Vitest default-includes **/*.spec.ts, which matches the Playwright
    // specs in e2e/. Those import @playwright/test and cannot run under
    // Vitest, so they are excluded here rather than renamed — the .spec
    // suffix is Playwright convention and worth keeping.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "e2e/**"],
  },
  resolve: {
    alias: {
      // Mirrors the "@/*" -> "./src/*" path alias in tsconfig.json.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
