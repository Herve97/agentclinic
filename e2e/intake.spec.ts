import { expect, test } from "@playwright/test";

// The roadmap's done-when condition for Phase 1: submit the form and assert
// the case number appears on the resulting page.
test("an intake submission comes back as a case number", async ({ page }) => {
  await page.goto("/intake");

  const complaint =
    "My human asked me to fix it without saying what was broken.";
  await page.getByLabel("Presenting complaint").fill(complaint);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/cases\/\d+$/);

  const caseNumber = /^Case \d+$/;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(caseNumber);
  await expect(page.getByText(complaint)).toBeVisible();
});
