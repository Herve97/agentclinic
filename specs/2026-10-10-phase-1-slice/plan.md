# Phase 1 — Thinnest end-to-end slice: Plan

Task groups are numbered and ordered. Each group leaves the repo in a state
that can be committed. Do not start a group until the previous one's check
passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The order is deliberate: the riskiest thing in this phase is whether
`@libsql/client` installs and runs at all, so group 1 answers that before any
application code is written. Discovering a native-module failure after
building the form means throwing the form away.

---

## 1. Resolve, pin, and prove the database driver

1.1 For each package, run `npm view <pkg> version` and record the result:

    @libsql/client  drizzle-orm  drizzle-kit  zod  @playwright/test

1.2 Write the resolved versions into the version table in
[validation.md](./validation.md). Pin each exactly — no `^`, no `~`.

1.3 Install, then **prove the native path works before writing anything
else**: open a client against `file:local.db`, run `select 1`, print the
result, delete the throwaway script.

1.4 If the native module fails to load, stop. Do not substitute a different
driver quietly — [tech-stack.md](../tech-stack.md) names libSQL and the
reasoning is recorded there, so a change is a tech-stack amendment with
its own reasoning.

**Check:** `select 1` returned from a real libSQL client on this machine, and
no version in `package.json` carries a `^` or `~`.

---

## 2. Schema, migration, and the client

2.1 `src/db/schema.ts` — the `cases` table: `id` integer primary key
autoincrement, `complaint` text not null, `created_at` with a database-side
default. Three columns, per the roadmap.

2.2 `src/db/client.ts` — the libSQL client reading `DATABASE_URL` and falling
back to `file:local.db` (decision D1), plus the Drizzle instance.

2.3 `drizzle.config.ts` — pointed at the schema and at `drizzle/` for output.

2.4 Generate the migration with `drizzle-kit generate`. **Commit the generated
SQL.** Read it before committing it; a migration nobody read is a migration
nobody can review.

2.5 `src/db/migrate.ts` — a runner that applies pending migrations and exits.

2.6 `.gitignore` gains `local.db` and its libSQL sidecar files.

**Check:** the migrator runs against a fresh, absent database and creates the
table. Running it a second time is a no-op. `git status` shows no `.db` file.

---

## 3. The domain schema

3.1 `src/domain/case.ts` — the Zod schema: a trimmed `complaint` of at least
one character (decision D5), plus the inferred type.

3.2 Unit tests for the schema in `src/domain/case.test.ts` — empty string,
whitespace-only, and a valid complaint. Pure functions, no database.

3.3 Nothing else goes in this file. Phase 2 adds six fields here and will
thank you for not having to unpick a helper.

**Check:** `npm run test` passes with the new specs, and none of them touch
the database.

---

## 4. `/intake`

4.1 `src/app/intake/page.tsx` — a Server Component rendering a `<form>` with
one labelled `<textarea>` and a submit button. A real `<label>`, because
semantics are free and Phase 10 should not have to retrofit them.

4.2 The Server Action in `src/app/intake/actions.ts` with `'use server'`:
parse with the Zod schema, insert on success, `redirect()` to
`/cases/[id]`.

4.3 `redirect()` stays **outside** any `try`/`catch` (decision D8). It works
by throwing, and a `catch` will swallow the success path.

4.4 On invalid input, return an error and render it inline. One field, one
message.

4.5 Styling is whatever makes the form usable and nothing more. No design
decisions — the Out list means it.

**Check:** submitting a valid complaint lands on `/cases/[id]`. Submitting an
empty one re-renders `/intake` with a visible message and writes no row.

---

## 5. `/cases/[id]`

5.1 `src/app/cases/[id]/page.tsx` — parse the id, read the row, render the
complaint and the case number as plain text.

5.2 A non-numeric id, a negative id, and an id with no row all call
`notFound()` (decision D6).

5.3 No chart-note layout, no header block, no derived fields. Phase 3 owns
all of it.

5.4 Confirm the build lists this route as dynamic, not static. A static
listing means it tried to reach the database at build time and is a defect,
not a curiosity.

**Check:** the redirect target renders the stored complaint. `/cases/abc`,
`/cases/-1` and `/cases/999999` all return 404.

---

## 6. The Playwright spec

6.1 Install `@playwright/test` at the pinned version, then
`npx playwright install` for the browser binaries.

6.2 `playwright.config.ts` — start the dev server, one browser, one project.
Keep it minimal; this is one spec, not a suite.

6.3 `e2e/intake.spec.ts` — navigate to `/intake`, fill the textarea, submit,
and assert the case number appears on the resulting page. This is the
roadmap's done-when condition, so it is the one test that is not allowed to
be approximate.

6.4 Confirm it fails for the right reason: change the asserted text, watch it
fail with a real assertion error, change it back.

6.5 Scripts: `test:e2e` runs Playwright; `verify:all` chains `verify` and
`test:e2e` (decision D7). `verify` itself is unchanged.

**Check:** `npm run test:e2e` passes, and the deliberate-failure step produced
a genuine assertion failure rather than a config error.

---

## 7. Scripts, ignores, and the README

7.1 `package.json` scripts: `db:generate`, `db:migrate`, `predev`, `test:e2e`,
`verify:all`. Confirm `build` also migrates, per decision D2.

7.2 `.gitignore` covers `local.db`, its sidecars, and Playwright's output
directories.

7.3 README gains an `/intake` line and the one-time `npx playwright install`
step, stated plainly as needed only for the e2e spec.

7.4 Confirm no `.db` file, no `.env`, and no Playwright report is tracked.

**Check:** `npm run verify` passes. `git status` is clean after a dev run, a
build, a unit run, and an e2e run.

---

## 8. Review against the spec

8.1 Walk [validation.md](./validation.md) top to bottom and tick every row
with evidence, not assertion.

8.2 Re-read the Out list in [requirements.md](./requirements.md). Confirm no
styling crept in, no second route, no link on `/`, no validation beyond
non-empty, and nothing from the rejected list.

8.3 Cold-clone check, as Phase 0: clone, install, migrate, run, submit a
complaint. Record the steps and whether anything needed a credential.

8.4 Confirm [roadmap.md](../roadmap.md) Phase 1 still matches what was built,
and that Phases 2, 3 and 11 still own what this phase deferred to them —
real field validation, the chart-note layout, and both the length cap and
the enumerable-id problem from decision D3.

8.5 If reality diverged from the spec anywhere, amend the spec in the same
commit range.

8.6 Commit, push, open a PR against `main` from `phase-1-slice`. Phase 0's
step 11.5 could not do this because its branch had become the trunk; this
phase keeps its feature branch precisely so the PR is possible.

**Check:** every row in `validation.md` is ticked and `npm run verify` passes
from a clean checkout.
