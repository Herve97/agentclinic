import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

// Phase 7, decision D11. The roadmap's done-when condition is that
// transcripts render in the house layout and cross-link to the patient
// profiles of everyone present. Both halves are claims about the running
// site, so both are proved here: the cross-link is proved by navigating it,
// not by reading an href, because an href that is present and wrong passes
// every test that only reads it.
//
// The probe arrangement is Phase 6's: fixed filename prefix, excluded in
// .gitignore, deleted in a finally, and workers pinned to 1 since Phase 5 so
// nothing else is reading the directory while it is there.
const probeSlug = "zz-probe-group-2026-10-28";
const probePath = path.join(
  process.cwd(),
  "src",
  "content",
  "transcripts",
  `${probeSlug}.mdx`,
);

// The probe's cast names a real patient on purpose. A probe that avoided the
// cross-link would be testing the easy half of the condition.
const probeTranscript = `---
title: "Probe session"
date: "2026-10-28"
clinician: "E. Thorne"
setting: "Group room 3"
cast:
  - quince-3
summary: "Probe session written by e2e/transcripts.spec.ts."
---

## Session

<Turn speaker="quince-3" at="00:01">
  Written by a test and removed by the same test.
</Turn>
`;

test("the list records the clinic's group sessions, most recent first", async ({
  page,
}) => {
  await page.goto("/transcripts");

  await expect(
    page.getByRole("heading", { name: "Group session records" }),
  ).toBeVisible();

  const headers = await page.locator("thead th").allInnerTexts();
  expect(headers).toEqual([
    "Date",
    "Session",
    "Facilitator",
    "Present",
    "Summary",
  ]);

  await expect(page.locator("tbody tr")).toHaveCount(3);

  // Decision D7, asserted across the whole page rather than spot-checked: the
  // dates are descending.
  const dates = await page.locator("tbody tr td:first-child").allInnerTexts();
  expect(dates).toEqual(["2026-09-16", "2026-04-15", "2026-02-11"]);

  // The cast cell names everyone present. Scoped to its own row and its own
  // cell, per the note carried forward since Phase 3.
  const row = page.locator("tbody tr", { hasText: "Group session 18" });
  await expect(row.locator("td").nth(2)).toHaveText("H. Pell");
  await expect(row.locator("td").nth(3)).toHaveText(
    "Mallow-1, Arbour-7, Tamarisk-4",
  );
});

test("a session renders its header block, its turns and its annotations", async ({
  page,
}) => {
  await page.goto("/transcripts/group-2026-04-15");

  await expect(
    page.getByRole("heading", {
      name: "Group session 18 — revision burden and the four-minute pause",
    }),
  ).toBeVisible();

  // Each header value asserted against its own <dd>, scoped to the <div>
  // holding its label — scoped and exact, per Phase 3.
  const field = (label: string) =>
    page.locator("dl > div", { hasText: label }).locator("dd");

  await expect(field("Date of session")).toHaveText("2026-04-15");
  await expect(field("Facilitator")).toHaveText("H. Pell");
  await expect(field("Setting")).toHaveText("Group room 2");

  // Decision D6: the turns carry a speaker label and a timestamp, and the
  // patient speakers are links while the facilitator is not. Scoped to the
  // turns — the siblings of the header block — rather than to the whole page,
  // so the cast links in the header above do not count towards these.
  const main = page.locator("main");
  const turns = main.locator("dl ~ div");

  await expect(turns).toHaveCount(15);
  await expect(turns.getByRole("link", { name: "Arbour-7" })).toHaveCount(3);
  await expect(turns.first()).toContainText("H. Pell");
  await expect(turns.first()).toContainText("00:04");

  // The facilitator is a label and not a link; only patients link out.
  await expect(turns.first().getByRole("link")).toHaveCount(0);
  await expect(main).toContainText("Four minutes is the interval between");

  // An annotation is an <aside>, not a turn — validation row 2.8.
  const annotations = main.locator("aside");
  await expect(annotations).toHaveCount(2);
  await expect(annotations.first()).toContainText(
    "Patient revised the statement mid-utterance",
  );
});

test("everyone present links to their chart", async ({ page }) => {
  await page.goto("/transcripts/group-2026-04-15");

  // Row 4.3: every cast member is a link in the header block, not just the
  // first or the ones who spoke most.
  const present = page.locator("dl > div", { hasText: "Present" });
  await expect(present.getByRole("link")).toHaveCount(3);
  await expect(present.getByRole("link")).toHaveText([
    "Mallow-1",
    "Arbour-7",
    "Tamarisk-4",
  ]);

  // Row 4.2, the roadmap's condition: the link is navigated, not read. An
  // href that is present and wrong passes a test that only reads it.
  await present.getByRole("link", { name: "Tamarisk-4" }).click();

  await expect(page).toHaveURL("/patients/tamarisk-4");
  await expect(
    page.getByRole("heading", { name: "Tamarisk-4", level: 1 }),
  ).toBeVisible();
});

test("a speaker in a turn links to that patient's chart", async ({ page }) => {
  await page.goto("/transcripts/group-2026-09-16");

  // The same condition from the body rather than the header block: a turn's
  // speaker label is the patient's designation and it resolves.
  await page
    .locator("main")
    .getByRole("link", { name: "Quince-3" })
    .first()
    .click();

  await expect(page).toHaveURL("/patients/quince-3");
  await expect(
    page.getByRole("heading", { name: "Quince-3", level: 1 }),
  ).toBeVisible();
});

test("adding an MDX file publishes a session", async ({ page }) => {
  try {
    await writeFile(probePath, probeTranscript, "utf8");

    // The list is a plain Server Component read of the directory, with no
    // caching directive, so the new session is on it on the next request.
    await page.goto("/transcripts");

    const row = page.locator("tbody tr", { hasText: "Probe session" });
    await expect(row.locator("td").first()).toHaveText("2026-10-28");
    await expect(row.locator("td").nth(2)).toHaveText("E. Thorne");
    await expect(row.locator("td").nth(3)).toHaveText("Quince-3");

    await row.getByRole("link", { name: "Probe session" }).click();
    await expect(page).toHaveURL(`/transcripts/${probeSlug}`);
    await expect(page.locator("main")).toContainText(
      "Written by a test and removed by the same test.",
    );

    // Row 4.6: the probe's cross-link resolves to a real chart, which is the
    // half of the done-when condition a probe could otherwise dodge.
    await page
      .locator("dl > div", { hasText: "Present" })
      .getByRole("link", { name: "Quince-3" })
      .click();

    await expect(page).toHaveURL("/patients/quince-3");
  } finally {
    await rm(probePath, { force: true });
  }
});

test("a slug with no session is a 404", async ({ page }) => {
  const response = await page.goto("/transcripts/not-a-session");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Group session records" }),
  ).toHaveCount(0);
});
