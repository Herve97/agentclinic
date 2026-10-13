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

// Decision D7: this is Phase 1's spec, updated rather than replaced. The case
// number assertion is the roadmap's Phase 1 done-when condition and keeps
// passing; the five new fields are Phase 2's round trip.
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

  // Each submitted value round-trips through the database and back onto the
  // case file. Scoped to the <dd> that follows each <dt>, so a value matching
  // its own label is not what satisfies the assertion.
  for (const [label, value] of [
    ["Presenting complaint", submission.complaint],
    ["Duration", submission.duration],
    ["Requirement revisions", submission.requirementRevisions],
    ["Prior episodes", submission.priorEpisodes],
    ["What the human said", submission.humanSaid],
    ["What the human meant", submission.humanMeant],
  ]) {
    await expect(
      page.locator("dl > div", { has: page.locator(`dt:text-is("${label}")`) }),
    ).toContainText(value);
  }
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
