import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 writes an AGENTS.md into the repo root on `next dev` unless this is
  // off. Phase 0's scope list does not include it, and an untracked file
  // regenerating on every dev run would fail the "no artefacts" check in
  // specs/2026-10-09-phase-0-scaffold/validation.md section 5.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
