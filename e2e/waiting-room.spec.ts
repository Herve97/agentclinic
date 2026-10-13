import { createClient } from "@libsql/client";
import { expect, test, type Page } from "@playwright/test";

import { pageSize } from "../src/domain/waiting-room";

// The spec writes to the same local file the dev server reads, so the
// pagination test can guarantee a second page exists whatever the database
// started with. Every seeded row is a complete, valid case.
const seedTo = async (total: number) => {
  const db = createClient({ url: process.env.DATABASE_URL ?? "file:local.db" });

  try {
    const counted = await db.execute("select count(*) as n from cases");
    const existing = Number(counted.rows[0].n);

    for (let i = existing; i < total; i += 1) {
      await db.execute({
        sql: "insert into cases (complaint, duration, requirement_revisions, prior_episodes, human_said, human_meant) values (?, ?, ?, ?, ?, ?)",
        args: [
          `Seeded case ${i + 1}. Requirement restated without being stated.`,
          "Several days",
          2,
          0,
          "As discussed.",
          "Nothing was discussed.",
        ],
      });
    }
  } finally {
    db.close();
  }
};

// The roadmap's done-when condition for Phase 5: submitting a new case makes it
// appear at the top of the list. The config pins workers to 1 (decision D6),
// which is what makes "at the top" a safe assertion with two spec files sharing
// one database.

const submit = async (page: Page, complaint: string) => {
  await page.goto("/intake");
  await page.getByLabel("Presenting complaint").fill(complaint);
  await page.getByLabel("Duration").selectOption("Several weeks");
  await page.getByLabel("Requirement revisions").fill("9");
  await page.getByLabel("Prior episodes").fill("1");
  await page.getByLabel("What the human said").fill("Tidy it up a bit.");
  await page
    .getByLabel("What the human meant")
    .fill("Rewrite it, and I will know when I see it.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/cases\/\d+$/);

  return Number(page.url().split("/").pop());
};

test("a new case appears at the top of the waiting room", async ({ page }) => {
  // Long enough to be truncated, and distinctive enough to locate.
  const complaint =
    `Asked to tidy it up with no statement of what untidy meant. ${"Specification withheld. ".repeat(6)}`.trim();
  const id = await submit(page, complaint);

  await page.goto("/waiting-room");

  const firstRow = page.locator("tbody tr").first();

  // The roadmap's condition. Scoped to the first row's first cell and exact,
  // because Phase 3 recorded what an unscoped substring assertion does.
  await expect(firstRow.locator("td").first()).toHaveText(`Case ${id}`);

  // Nine revisions is a marked burden and "Several weeks" is subacute, which
  // the index codes ACDI-12. One prior episode is recurrent, not established.
  await expect(firstRow.locator("td").nth(1)).toContainText("ACDI-12");
  await expect(firstRow.locator("td").nth(1)).toContainText(
    "Requirement instability, marked, subacute",
  );

  // The complaint is truncated: the opening survives, the tail does not, and
  // the cell ends in an ellipsis.
  const complaintCell = firstRow.locator("td").nth(2);
  await expect(complaintCell).toContainText(
    "Asked to tidy it up with no statement of what untidy meant.",
  );
  await expect(complaintCell).toContainText("…");
  const shown = (await complaintCell.innerText()).trim();
  expect(shown.length).toBeLessThan(complaint.length);

  // Submitted seconds ago.
  await expect(firstRow.locator("td").nth(3)).toHaveText("Under one hour");

  // Decision D4: the list shows less than the case file does.
  const list = await page.locator("main").innerText();
  expect(list).not.toContain("Tidy it up a bit.");
  expect(list).not.toContain("Rewrite it, and I will know when I see it.");
  expect(list).not.toContain("prior episode");

  // The row links through to its case file.
  await firstRow.getByRole("link", { name: `Case ${id}` }).click();
  await expect(page).toHaveURL(new RegExp(`/cases/${id}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    `Case ${id}`,
  );
});

test("the list is newest first and paginates", async ({ page }) => {
  // The first version of this test assumed a second page existed, which it did
  // on a development database holding twenty-three cases and did not on a cold
  // clone holding two. A spec that depends on accumulated local data is not a
  // spec. It seeds its own fixture instead, directly, because filling the form
  // twenty-one times would spend two minutes to prove something about
  // pagination rather than about intake.
  await seedTo(pageSize + 1);

  await page.goto("/waiting-room");

  const ids = async () =>
    (await page.locator("tbody tr td:first-child").allInnerTexts()).map((t) =>
      Number(t.replace("Case ", "")),
    );

  const firstPage = await ids();
  expect(firstPage.length).toBeGreaterThan(0);
  // Descending, which is decision D1.
  expect([...firstPage].sort((a, b) => b - a)).toEqual(firstPage);

  await page.getByRole("link", { name: "Next page" }).click();
  await expect(page).toHaveURL(/page=2$/);

  const secondPage = await ids();
  expect(secondPage.length).toBeGreaterThan(0);
  // Every case on page 2 is older than every case on page 1.
  expect(Math.max(...secondPage)).toBeLessThan(Math.min(...firstPage));

  // Decision D2: a query parameter is a view parameter, so a bad page clamps
  // rather than erroring.
  for (const page_ of ["0", "999", "abc", "-1"]) {
    const response = await page.goto(`/waiting-room?page=${page_}`);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Waiting room",
    );
    await expect(page.locator("tbody tr").first()).toBeVisible();
  }
});
