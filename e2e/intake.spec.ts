import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";

// The spec reads the same local file the dev server writes to, so "no row was
// written" is proved against the table rather than inferred from the page.
const db = createClient({ url: process.env.DATABASE_URL ?? "file:local.db" });

const countCases = async () => {
  const result = await db.execute("select count(*) as n from cases");
  return Number(result.rows[0].n);
};

const submission = {
  complaint: "My human asked me to fix it without saying what was broken.",
  duration: "Several days",
  requirementRevisions: "6",
  priorEpisodes: "2",
  humanSaid: "Just make it work.",
  humanMeant: "Infer the specification and be correct about it.",
};

// Phase 2's decision D7 and Phase 3's decision D6: this is Phase 1's spec,
// updated twice rather than replaced. The case number assertion is the
// roadmap's Phase 1 done-when condition, the six values are Phase 2's round
// trip, and the sections and the derived chronicity are Phase 3's chart note.
test("an intake submission comes back as a case number", async ({ page }) => {
  await page.goto("/intake");

  await page.getByLabel("Presenting complaint").fill(submission.complaint);
  await page.getByLabel("Duration").selectOption(submission.duration);
  await page
    .getByLabel("Requirement revisions")
    .fill(submission.requirementRevisions);
  await page.getByLabel("Prior episodes").fill(submission.priorEpisodes);
  await page.getByLabel("What the human said").fill(submission.humanSaid);
  await page.getByLabel("What the human meant").fill(submission.humanMeant);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/cases\/\d+$/);

  const caseNumber = /^Case \d+$/;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(caseNumber);

  // The note is one document, so the values are asserted against <main> rather
  // than against the per-field blocks Phase 2 rendered and this phase removed.
  const note = page.locator("main");

  // Phase 3's decision D6: every submitted value still appears. The two counts
  // are asserted inside the sentences decision D4 requires, so a page that
  // merely echoed the numbers back as labelled values would fail.
  await expect(note).toContainText(submission.complaint);
  await expect(note).toContainText(submission.humanSaid);
  await expect(note).toContainText(submission.humanMeant);
  await expect(note).toContainText("Course spanning several days.");
  await expect(note).toContainText(
    "Requirement revised 6 times over several days.",
  );
  await expect(note).toContainText("2 prior episodes recorded.");

  // The six sections of decision D1, in order. The header block is headed by
  // the <h1>; the other five are <h2>.
  await expect(page.locator("main h2")).toHaveText([
    "Presenting complaint",
    "History",
    "Assessment",
    "Plan",
    "Follow-up",
  ]);

  // One derived value, to prove the wiring. The rules themselves are unit
  // tested in src/domain/case-note.test.ts — "Several days" is subacute, and a
  // subacute course with prior episodes is reviewed in 14 days.
  // Scoped to the <dd>, and exact: the block text contains the <dt> word
  // "Chronicity", which contains "Chronic", so a toContainText against the
  // whole block passes for the wrong value. The deliberate-failure step of
  // plan 4.5 caught this assertion passing vacuously.
  await expect(
    page
      .locator("dl > div", {
        has: page.locator('dt:text-is("Chronicity")'),
      })
      .locator("dd"),
  ).toHaveText("Subacute");
  await expect(note).toContainText("Review in 14 days.");
});

// Decision D7: the failure path. Not provable by a unit test — it is about the
// form keeping six answers, including the <select>, across a failed submit.
test("a failed submission keeps every other answer and writes no row", async ({
  page,
}) => {
  const before = await countCases();

  await page.goto("/intake");

  // Long enough that a truncation would show. The presenting complaint is left
  // empty, which is the omission the server rejects.
  const longAnswer = `Just make it work. ${"Unspecified. ".repeat(50)}`.trim();

  await page.getByLabel("Duration").selectOption("Several weeks");
  await page.getByLabel("Requirement revisions").fill("14");
  await page.getByLabel("Prior episodes").fill("0");
  await page.getByLabel("What the human said").fill(longAnswer);
  await page.getByLabel("What the human meant").fill("A different thing.");
  await page.getByRole("button", { name: "Submit" }).click();

  // Phase 1 recorded that getByRole("alert") also matches Next's route
  // announcer, so the message is located by its own element.
  await expect(page.locator("#complaint-error")).toHaveText(
    "A presenting complaint is required.",
  );
  await expect(page.locator('p[role="alert"]')).toHaveCount(1);

  await expect(page).toHaveURL(/\/intake$/);
  // Soft, so one run reports every field that lost its answer rather than
  // only the first.
  await expect.soft(page.getByLabel("Duration")).toHaveValue("Several weeks");
  await expect.soft(page.getByLabel("Requirement revisions")).toHaveValue("14");
  await expect.soft(page.getByLabel("Prior episodes")).toHaveValue("0");
  await expect
    .soft(page.getByLabel("What the human said"))
    .toHaveValue(longAnswer);
  await expect
    .soft(page.getByLabel("What the human meant"))
    .toHaveValue("A different thing.");

  expect(await countCases()).toBe(before);
});
