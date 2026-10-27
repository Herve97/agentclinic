import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

// Phase 6, decision D10. The roadmap's done-when condition is that adding an
// MDX file publishes a patient with no code change, which is a claim about the
// running site. The unit tests prove the reader discovers a file; only the
// browser proves publication, so this spec writes one.
//
// The filename prefix is fixed and .gitignore excludes it, the deletion is in a
// finally, and playwright.config.ts has pinned workers to 1 since Phase 5's
// decision D6 — so nothing else is reading the directory while the probe is
// there, and a killed run leaves a file that is both ignored and obviously a
// probe.
const probeSlug = "zz-probe-yarrow-9";
const probePath = path.join(
  process.cwd(),
  "src",
  "content",
  "patients",
  `${probeSlug}.mdx`,
);

const probeChart = `---
name: "Yarrow-9"
number: "P-9999"
status: "Active"
intake: "2026-10-27"
clinician: "E. Thorne"
presenting: "Probe chart written by e2e/patients.spec.ts."
history:
  - date: "2026-10-27"
    code: "ACDI-19"
    note: "Opened by the specification that proves a chart publishes."
---

## Formulation

Written by a test and removed by the same test.
`;

test("the register lists the clinic's patients and links to each chart", async ({
  page,
}) => {
  await page.goto("/patients");

  await expect(
    page.getByRole("heading", { name: "Patient register" }),
  ).toBeVisible();

  const headers = await page.locator("thead th").allInnerTexts();
  expect(headers).toEqual([
    "Number",
    "Patient",
    "Status",
    "Presenting",
    "Last contact",
  ]);

  // Decision D5: the register is ordered by clinic number ascending, which is
  // the one ordering choice in this phase a reader would otherwise assume was
  // arbitrary. Asserted across the whole page rather than spot-checked.
  const numbers = await page.locator("tbody tr td:first-child").allInnerTexts();
  expect(numbers.length).toBeGreaterThanOrEqual(5);
  expect(numbers).toEqual([...numbers].sort());

  // Scoped to the row, exact, and against the cell rather than the label —
  // the note carried forward since Phase 3.
  const row = page.locator("tbody tr", { hasText: "Arbour-7" });
  await expect(row.locator("td").nth(2)).toHaveText("Active");

  await row.getByRole("link", { name: "Arbour-7" }).click();
  await expect(page).toHaveURL("/patients/arbour-7");
  await expect(page.getByRole("heading", { name: "Arbour-7" })).toBeVisible();
});

test("a chart renders its header block, its history and its narrative", async ({
  page,
}) => {
  await page.goto("/patients/tamarisk-4");

  // The header block comes from the frontmatter. Each value is asserted
  // against its own definition, not against the page text, so a missing value
  // cannot pass on the strength of its label.
  const value = (label: string) =>
    page.locator("dl div", { hasText: label }).locator("dd");

  await expect(value("Clinic number")).toHaveText("P-0205");
  await expect(value("Status")).toHaveText("Active");
  await expect(value("Date of intake")).toHaveText("2025-06-12");
  await expect(value("Clinician")).toHaveText("N. Ibarra");

  // Four dated entries, each carrying the rubric from Phase 4's index rather
  // than from the chart.
  const history = page.getByRole("heading", { name: "Chart history" });
  await expect(history).toBeVisible();

  const entries = page.locator("ol > li");
  await expect(entries).toHaveCount(4);
  await expect(entries.first()).toContainText("2025-06-12");
  await expect(entries.first()).toContainText("ACDI-06");
  await expect(entries.first()).toContainText(
    "Requirement instability, moderate, acute",
  );
  await expect(entries.last()).toContainText("ACDI-15");

  await expect(
    page.getByText("Coded under the AgenticClinic Diagnostic Index"),
  ).toBeVisible();

  // The authored narrative, compiled from MDX, with its headings intact.
  await expect(
    page.getByRole("heading", { name: "Mental status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Formulation" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plan" })).toBeVisible();
  await expect(page.locator("main")).toContainText(
    "This chart has been recoded twice",
  );
});

test("adding an MDX file publishes a patient", async ({ page }) => {
  try {
    await writeFile(probePath, probeChart, "utf8");

    // The register is a plain Server Component read of the directory, with no
    // caching directive, so the new chart is on it on the next request.
    await page.goto("/patients");

    const row = page.locator("tbody tr", { hasText: "Yarrow-9" });
    await expect(row.locator("td").first()).toHaveText("P-9999");
    await expect(row.locator("td").nth(4)).toContainText("ACDI-19");

    await row.getByRole("link", { name: "Yarrow-9" }).click();
    await expect(page).toHaveURL(`/patients/${probeSlug}`);
    await expect(page.getByRole("heading", { name: "Yarrow-9" })).toBeVisible();
    await expect(page.locator("main")).toContainText(
      "Written by a test and removed by the same test.",
    );
  } finally {
    await rm(probePath, { force: true });
  }
});

test("a slug with no chart is a 404", async ({ page }) => {
  const response = await page.goto("/patients/not-a-patient");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Patient register" }),
  ).toHaveCount(0);
});
