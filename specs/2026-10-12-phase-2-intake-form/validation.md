# Phase 2 — The real intake form: Validation

How to know Phase 2 succeeded and can be merged.

The roadmap's done-when condition has two halves: **each field round-trips to
the database** and **every validation branch has a unit test.** Section 3 is
the second half and section 4 is the first.

Every row needs evidence — a command's actual output, a file's actual contents.
"Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0), and `getByRole("alert")` also matches Next's route announcer
(Phase 1). Any console row below needs a real browser; any alert assertion
needs a scoped locator.

---

## 1. The commands

| #   | Command                  | Expected                                                     | ✓   |
| --- | ------------------------ | ------------------------------------------------------------ | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                         | ☑   |
| 1.2 | `npm run build`          | Exits 0. `/cases/[id]` still dynamic, `/intake` present.     | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every branch in §3 has a passing test.              | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                     | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — the round trip and the failure path. | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                     | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                     | ☑   |
| 1.8 | `npm run db:migrate`     | Applies the new migration, then is a no-op on re-run.        | ☑   |

**Blocking:** all eight.

**Evidence**, 2026-10-13, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` → no output, exit 0. One warning appeared during the phase
  (an unused destructured binding in the test helper) and was removed rather
  than tolerated.
- 1.2 `npm run build` → exit 0, route table `○ /`, `○ /_not-found`,
  `ƒ /cases/[id]`, `○ /intake`. `/cases/[id]` is still `ƒ`, so it did not reach
  the database at build time.
- 1.3 `npm run test` → `Test Files 2 passed (2)`, `Tests 27 passed (27)` — the
  twenty-six branch tests of §3 plus the Phase 0 smoke test.
- 1.4 `npm run verify` → exit 0, as the first three stages of the 1.6 run.
- 1.5 `npm run test:e2e` → `2 passed (24.3s)`, the round trip and the failure
  path.
- 1.6 `npm run verify:all` → exit 0, ending `2 passed (20.9s)`.
- 1.7 `npx prettier --check .` → `All matched files use Prettier code style!`
- 1.8 `npm run db:migrate` applied `0001_add_intake_fields`; a second run
  printed `migrations applied successfully!` and changed nothing. A
  `pragma table_info(cases)` after both reads `id`, `complaint`, `created_at`
  all `notnull=1`, and `duration`, `requirement_revisions`, `prior_episodes`,
  `human_said`, `human_meant` all `notnull=0`.

---

## 2. The six fields exist and are asked correctly

| #   | Check             | Expected                                                                                                          | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------- | --- |
| 2.1 | All six present   | Presenting complaint, duration, requirement revisions, prior episodes, what the human said, what the human meant. | ☑   |
| 2.2 | Labels bound      | Every control has a real `<label>` bound to it, including the `<select>`.                                         | ☑   |
| 2.3 | Duration options  | Exactly the five options in decision D1, no blank-but-selectable default that passes validation.                  | ☑   |
| 2.4 | Integer inputs    | Requirement revisions and prior episodes accept `0` and reject `3.5`, `-1`, `abc`, and empty.                     | ☑   |
| 2.5 | Voice of labels   | Each label reads as a clinic's intake form, not an app's. Passes the mission's swap test.                         | ☑   |
| 2.6 | Voice of errors   | Each message reads as a clinician noting an omission (decision D6). No "please", no exclamation marks.            | ☑   |
| 2.7 | Errors are inline | Each message renders next to its own field, not in a summary block.                                               | ☑   |
| 2.8 | No console errors | A real browser on `/intake` and `/cases/[id]` reports no errors and no warnings.                                  | ☑   |

**Blocking:** all except 2.5 and 2.6, which are judgement calls — but if either
is arguable, the copy is wrong and gets rewritten rather than argued for.

**Evidence**, 2026-10-13, Chromium via Playwright:

- 2.1 Six controls, with ids `complaint`, `duration`, `requirementRevisions`,
  `priorEpisodes`, `humanSaid`, `humanMeant`.
- 2.2 `<label for="duration">Duration</label>` resolves to `select id=duration`.
  Every spec locator in `e2e/intake.spec.ts` is `getByLabel`, so all six
  bindings are exercised on every run; an unbound control would fail the spec.
- 2.3 `#duration option` values are `""`, `Within a single session`,
  `Across several sessions today`, `Several days`, `Several weeks`,
  `Longer than a month`. The blank is selectable and does **not** pass
  validation — submitting it returns
  `Duration must be recorded as one of the listed intervals.`
- 2.4 In a browser, `"3.5"`, `"-1"`, `"abc"` and `""` in requirement revisions
  each returned `Requirement revisions must be recorded as a whole number of
occurrences, including zero.` and stayed on `/intake`. `"-1"` in prior
  episodes returned its own message. `"0"` was accepted and stored as `0` —
  see 4.5.
- 2.5 The six labels are "Presenting complaint", "Duration", "Requirement
  revisions", "Prior episodes", "What the human said", "What the human meant".
  Each is a question a chart would ask; none addresses the visitor.
- 2.6 The six messages are: "A presenting complaint is required.", "Duration
  must be recorded as one of the listed intervals.", "Requirement revisions
  must be recorded as a whole number of occurrences, including zero.", "Prior
  episodes must be recorded as a whole number of occurrences, including zero.",
  "A record of what the human said is required.", "A record of what the human
  meant is required." No "please", no exclamation marks, no second person.
- 2.7 The rendered block for one field, verbatim:
  `<div class="flex w-full flex-col gap-1"><label for="priorEpisodes">Prior episodes</label><input id="priorEpisodes" type="text" inputmode="numeric" class="border p-2" name="priorEpisodes" value="-1" aria-describedby="priorEpisodes-error"><p id="priorEpisodes-error" role="alert">Prior episodes must be recorded as a whole number of occurrences, including zero.</p></div>`
  The message is a sibling of the control it concerns and is referenced by
  `aria-describedby`. There is no summary block anywhere on the page.
- 2.8 A `console` and `pageerror` listener over `/intake` (including three
  failed submits) and `/cases/[id]` collected `[]`. Asserted, not eyeballed:
  `expect(messages).toEqual([])` passed.

---

## 3. Every validation branch has a unit test

The second half of the roadmap's done-when condition. **One named test per row.**
A count of passing tests is the evidence; "the schema is covered" is not.

| #    | Field                 | Branch                                | Expected            | ✓   |
| ---- | --------------------- | ------------------------------------- | ------------------- | --- |
| 3.1  | complaint             | empty string                          | rejected            | ☑   |
| 3.2  | complaint             | whitespace only                       | rejected            | ☑   |
| 3.3  | complaint             | missing key                           | rejected            | ☑   |
| 3.4  | complaint             | valid, surrounded by whitespace       | accepted, trimmed   | ☑   |
| 3.5  | duration              | empty string                          | rejected            | ☑   |
| 3.6  | duration              | value outside the five options        | rejected            | ☑   |
| 3.7  | duration              | each of the five options              | accepted            | ☑   |
| 3.8  | requirement_revisions | empty string                          | rejected            | ☑   |
| 3.9  | requirement_revisions | non-numeric (`"abc"`)                 | rejected            | ☑   |
| 3.10 | requirement_revisions | fractional (`"3.5"`)                  | rejected            | ☑   |
| 3.11 | requirement_revisions | negative (`"-1"`)                     | rejected            | ☑   |
| 3.12 | requirement_revisions | exponent form (`"1e3"`)               | rejected            | ☑   |
| 3.13 | requirement_revisions | `"0"`                                 | accepted as `0`     | ☑   |
| 3.14 | requirement_revisions | `"6"`                                 | accepted as `6`     | ☑   |
| 3.15 | prior_episodes        | empty string                          | rejected            | ☑   |
| 3.16 | prior_episodes        | non-numeric                           | rejected            | ☑   |
| 3.17 | prior_episodes        | fractional                            | rejected            | ☑   |
| 3.18 | prior_episodes        | negative                              | rejected            | ☑   |
| 3.19 | prior_episodes        | `"0"`                                 | accepted as `0`     | ☑   |
| 3.20 | human_said            | empty / whitespace only               | rejected            | ☑   |
| 3.21 | human_said            | valid                                 | accepted, trimmed   | ☑   |
| 3.22 | human_meant           | empty / whitespace only               | rejected            | ☑   |
| 3.23 | human_meant           | valid                                 | accepted, trimmed   | ☑   |
| 3.24 | all six               | every field valid                     | accepted            | ☑   |
| 3.25 | all six               | every field invalid at once           | a message per field | ☑   |
| 3.26 | types                 | integers parse to `number`, not `"6"` | accepted            | ☑   |

**Blocking:** all twenty-six. Row 3.25 is what proves errors are per-field
rather than first-failure-wins.

**Evidence**, 2026-10-13: `npx vitest run src/domain/case.test.ts` reports 26
passing tests whose names begin `3.1` through `3.26`, one per row above, with no
number missing and none repeated. The branch numbers are in the test names
precisely so this count is checkable rather than asserted.

No test in `src/domain/case.test.ts` imports `@/db/client` or `drizzle-orm`; the
file imports only `vitest` and `./case`.

Row 3.25 passes by comparing the keys of the returned error map against the
exported field list, so it fails if the action ever reports only the first
failing field.

---

## 4. Each field round-trips to the database

The first half of the done-when condition. Proved from the outside, in a
browser, not by reading the insert statement.

| #   | Check                       | Expected                                                                                                           | ✓   |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ | --- |
| 4.1 | Submit succeeds             | A fully valid submission redirects to `/cases/[id]`.                                                               | ☑   |
| 4.2 | All six render              | Every submitted value appears on the resulting page.                                                               | ☑   |
| 4.3 | Values match                | Each value is the text that was typed, not a truncation or a re-encoding.                                          | ☑   |
| 4.4 | Integers stored as integers | `requirement_revisions` and `prior_episodes` are integers in the row, not text.                                    | ☑   |
| 4.5 | A zero survives             | `0` revisions stores and renders as `0`, not as blank or "Not recorded."                                           | ☑   |
| 4.6 | Markup                      | A `<dl>` with `<dt>`/`<dd>` pairs.                                                                                 | ☑   |
| 4.7 | Phase 1 rows                | A row created before this migration renders, showing "Not recorded." for the five new fields rather than erroring. | ☑   |
| 4.8 | No section headings         | No header block, no "History", "Assessment", "Plan", or follow-up interval. Phase 3 owns those.                    | ☑   |

**Blocking:** all eight. Row 4.5 is the one that catches `Number()` coercion
treating a legitimate zero as absent. Row 4.7 is the consequence of decision D2
and is checked deliberately rather than discovered.

**Evidence**, 2026-10-13, observed in Chromium:

- 4.1 A valid submission redirects to a numeric case URL, and the local table
  now holds ids 1 to 7. The spec asserts
  `toHaveURL(/\/cases\/\d+$/)`.
- 4.2 and 4.3 `e2e/intake.spec.ts` asserts all six values, each scoped to the
  `<div>` that contains its own `<dt>`, so a value is never satisfied by the
  label next to it. The assertions were proved to bite: changing the expected
  prior-episodes value to `"999"` produced
  `Expected substring: "999"` / `Received string: "Prior episodes2"` rather
  than passing vacuously.
- 4.4 `select typeof(requirement_revisions), typeof(prior_episodes)` on the
  submitted row returns `integer` and `integer`, with values `0` and `0`.
- 4.5 A submission of `0` revisions and `0` prior episodes renders the block
  `Requirement revisions` / `0`. Not blank, not "Not recorded."
- 4.6 The markup is `<dl class="mt-8"><div class="mt-4"><dt>Presenting
complaint</dt><dd class="whitespace-pre-wrap">…</dd>` and so on for six
  pairs.
- 4.7 `/cases/1`, created under Phase 1's schema, renders
  `Presenting complaint | My human asked me to fix it without saying what was
broken. | Duration | Not recorded. | Requirement revisions | Not recorded. |
Prior episodes | Not recorded. | What the human said | Not recorded. | What
the human meant | Not recorded.` It renders rather than erroring, which is
  what decision D2 traded for keeping the migration additive.
- 4.8 The page contains one `<h1>` (`Case 1`) and one `<dl>`. Grepping
  `src/app/cases/[id]/page.tsx` for `<h2`, "History", "Assessment", "Plan" and
  "follow-up" returns a single line, and it is the comment recording that
  Phase 3 owns all of them.

---

## 5. Form state survives a failed submit

| #   | Check                              | Expected                                                           | ✓   |
| --- | ---------------------------------- | ------------------------------------------------------------------ | --- |
| 5.1 | One field omitted                  | That field's message appears; the other five keep what was typed.  | ☑   |
| 5.2 | The `<select>` keeps its selection | Duration is still selected after a failed submit.                  | ☑   |
| 5.3 | Long text survives                 | Both free-text answers keep their full content, not a truncation.  | ☑   |
| 5.4 | No row written                     | Confirmed by querying the table before and after.                  | ☑   |
| 5.5 | URL unchanged                      | Still `/intake`; no redirect on failure.                           | ☑   |
| 5.6 | Proved by a spec                   | Row 5.1–5.3 are asserted by an e2e spec, not checked by hand once. | ☑   |

**Blocking:** all six. This section is the roadmap's "form state survives a
failed submit" and row 5.2 is the part most easily missed.

**Evidence**, 2026-10-13: the second spec in `e2e/intake.spec.ts`.

- 5.1 With the presenting complaint omitted, `#complaint-error` reads
  `A presenting complaint is required.` and `p[role="alert"]` has count 1 — one
  message, against one field.
- 5.2 `getByLabel("Duration")` still reads `Several weeks` after the failed
  submit. **This row failed first.** The initial implementation lost the
  selection on every failed submit while keeping all five other answers:
  `Expected: "Several weeks"` / `Received: ""`. The cause and the fix are
  decision D11 — React restores a `<select>` to the selection it was mounted
  with, so the control is remounted by key. The row called this "the part most
  easily missed" before the code existed.
- 5.3 The long answer is 668 characters and is asserted with `toHaveValue`
  against the whole string, so a truncation at any length fails.
- 5.4 `select count(*) from cases` taken before the submit and after the
  assertions returns the same number. The spec reads the same `local.db` the
  dev server writes to.
- 5.5 `toHaveURL(/\/intake$/)` after the failed submit.
- 5.6 All of 5.1–5.3 are assertions in the committed spec, run by
  `npm run test:e2e`, not a one-time manual check. The five value assertions
  are soft, so one run reports every field that lost its answer.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                                   | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                         | Phase 9    | ☑   |
| 6.2  | Any route beyond `/`, `/intake`, `/cases/[id]`                                   | Phases 3–9 | ☑   |
| 6.3  | Diagnosis codes or any scoring of the answers                                    | Phase 4    | ☑   |
| 6.4  | Chart-note sections or narrative prose on `/cases/[id]`                          | Phase 3    | ☑   |
| 6.5  | Derived fields — chronicity, severity, episode interpretation                    | Phase 3    | ☑   |
| 6.6  | Length caps, profanity filtering, rate limiting                                  | Phase 11   | ☑   |
| 6.7  | Design work: custom colours, fonts, spacing scale, type scale, component classes | Phase 10   | ☑   |
| 6.8  | A form library — React Hook Form, Formik, or any client state manager            | Never      | ☑   |
| 6.9  | Any CI workflow                                                                  | Phase 12   | ☑   |
| 6.10 | A tracked `.db`, `.env`, or Playwright report                                    | Never      | ☑   |
| 6.11 | `src/content/` created empty                                                     | Phase 6    | ☑   |
| 6.12 | A backfill that invents values for Phase 1 rows                                  | Never      | ☑   |

**Blocking:** all twelve. Row 6.1 is checked with
`git diff phase-1-slice -- src/app/page.tsx src/app/layout.tsx` returning
nothing. Row 6.12 is decision D2's hard edge.

**Evidence**, 2026-10-13:

- 6.1 `git diff phase-1-slice -- src/app/page.tsx src/app/layout.tsx` → no
  output.
- 6.2 `find src/app -name page.tsx` → `src/app/cases/[id]/page.tsx`,
  `src/app/intake/page.tsx`, `src/app/page.tsx`. Three routes, as before.
- 6.3 No code table, no scoring, no mapping from answers to anything. The six
  values are stored and rendered unchanged.
- 6.4 and 6.5 `src/app/cases/[id]/page.tsx` is 51 lines: an id guard, one
  query, and a `<dl>` built from the exported field list. No derived value and
  no narrative. `src/domain/case.ts` exports a schema, three constants and one
  error helper — no clinical judgement.
- 6.6 No `max`, no length check, no rate limit, no word list anywhere in `src/`.
  Decision D4 restates why, and Phase 11 still owns it.
- 6.7 The only class attributes added are Tailwind defaults for layout and
  borders. No custom colours, no font declarations, no spacing or type scale,
  no `@apply`, no component class.
- 6.8 `package.json` is unchanged this phase: no dependency was added or
  removed. No form library, no state manager.
- 6.9 No `.github/` directory exists.
- 6.10 `git status` is clean after `dev`, `build`, `test` and `test:e2e`;
  `local.db`, `.env*`, `/test-results` and `/playwright-report` are all
  ignored, and `git ls-files` lists none of them.
- 6.11 `src/content/` does not exist.
- 6.12 The migration is five `ADD COLUMN` statements with no `UPDATE` and no
  `DEFAULT`. The two Phase 1 rows hold nulls, not invented answers.

---

## 7. The migration is safe

| #   | Check              | Expected                                                              | ✓   |
| --- | ------------------ | --------------------------------------------------------------------- | --- |
| 7.1 | Additive only      | Five `ALTER TABLE ... ADD COLUMN` statements. No table recreation.    | ☑   |
| 7.2 | Data preserved     | Rows created under Phase 1's schema still exist after migrating.      | ☑   |
| 7.3 | Nullable           | The five new columns permit null (decision D2).                       | ☑   |
| 7.4 | Idempotent         | A second `db:migrate` is a clean no-op.                               | ☑   |
| 7.5 | Read before commit | The generated SQL was read, not just generated. Say what it contains. | ☑   |
| 7.6 | Journal committed  | `drizzle/meta/_journal.json` lists both migrations.                   | ☑   |

**Blocking:** all six. Row 7.1 matters because `drizzle-kit` will rebuild a
SQLite table for some changes, and a rebuild here would be a silent data path.

**Evidence**, 2026-10-13:

- 7.1 and 7.5 `drizzle/0001_add_intake_fields.sql` was read before it was
  committed. It contains exactly five statements, each separated by
  `--> statement-breakpoint`:

  ```sql
  ALTER TABLE `cases` ADD `duration` text;
  ALTER TABLE `cases` ADD `requirement_revisions` integer;
  ALTER TABLE `cases` ADD `prior_episodes` integer;
  ALTER TABLE `cases` ADD `human_said` text;
  ALTER TABLE `cases` ADD `human_meant` text;
  ```

  There is no `CREATE TABLE`, no `__new_cases`, no `INSERT INTO ... SELECT` and
  no `DROP TABLE` — so no rebuild, and no silent data path.

- 7.2 The two Phase 1 rows (ids 1 and 2) are present and readable after the
  migration, with their original `complaint` and `created_at` values.
- 7.3 `pragma table_info(cases)` reports `notnull=0` for all five new columns.
- 7.4 A second `npm run db:migrate` reported success and changed nothing; a
  reapplied `ADD COLUMN` would have failed with a duplicate-column error.
- 7.6 `drizzle/meta/_journal.json` lists `0000_create_cases` and
  `0001_add_intake_fields`, in that order.

---

## 8. Carried-over constraints

| #   | Check                      | Expected                                                                           | ✓   |
| --- | -------------------------- | ---------------------------------------------------------------------------------- | --- |
| 8.1 | `/` unchanged              | Byte-identical to `phase-1-slice`, still no links.                                 | ☑   |
| 8.2 | `agentRules: false`        | Still set; no `AGENTS.md` reappeared.                                              | ☑   |
| 8.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                                                | ☑   |
| 8.4 | `strict: true`             | Still in `tsconfig.json`.                                                          | ☑   |
| 8.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                                    | ☑   |
| 8.6 | Clean tree                 | `git status` clean after dev, build, test, and e2e.                                | ☑   |
| 8.7 | Cold clone                 | Clone, install, dev, submit all six fields. No credentials, no hand-run migration. | ☑   |

**Blocking:** all seven.

**Evidence**, 2026-10-13:

- 8.1 `git diff phase-1-slice -- src/app/page.tsx` → no output. `/` has no
  links.
- 8.2 `next.config.ts` line 8 is `agentRules: false`; no `AGENTS.md` exists.
- 8.3 `src/app/layout.tsx` still has `<body suppressHydrationWarning>` with the
  comment above it explaining the browser-extension cause.
- 8.4 `tsconfig.json` line 7 is `"strict": true`.
- 8.5 `grep -E '"[~^]' package.json` → no output.
- 8.6 `git status --porcelain` → no output after `dev`, `build`, `test` and
  `test:e2e`.
- 8.7 Cold clone, into a directory outside the repository: `git clone`, then
  `npm ci`, then `npm run test:e2e`. The clone contained no `.env*` and no
  `local.db`. `predev` created and migrated `local.db` unattended, the dev
  server came up, and both specs passed — `2 passed (38.8s)`. The stored row
  reads `duration: 'Several days'`, `requirement_revisions: 6`,
  `prior_episodes: 2`, `human_said: 'Just make it work.'`,
  `human_meant: 'Infer the specification and be correct about it.'` — all six
  fields submitted and stored on a machine state that had never run this code.
  No credential and no manual step.

---

## Merge gate

Phase 2 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all twenty-six branches.
3. Section 4 shows all six fields round-tripping, observed in a browser.
4. Section 5 shows a failed submit preserving every field including the
   `<select>`.
5. `npm run verify:all` passes.
6. `/` is byte-identical to `phase-1-slice`.
7. **Phase 1's PR has merged**, or this PR is explicitly marked as stacked on
   it. The branch base is recorded at the top of `requirements.md`.

**Status**, 2026-10-13: gates 1 to 6 are met, with the evidence recorded under
each section above. Gate 7 is open and not this phase's to close: `origin/main`
is still at `5aa2241`, which does not contain Phase 1, so Phase 1's pull request
has not merged. This phase's pull request is marked as stacked on it.

### Recorded divergences from the spec as written

Four, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **Decisions D10 and D11 were added during implementation.** Neither changes
   the phase's scope. D10 moves the labels and the blank form into
   `src/domain/case.ts`, because a `"use server"` module may only export async
   functions and because two routes need the same six label strings. D11
   remounts the `<select>` by key, because React restores a select to the
   selection it was mounted with after an action completes.
2. **The README's one-line description of `/intake` named a single presenting
   complaint.** It now names the six fields. Not listed in the plan, but a
   README that describes the previous phase is the drift this repository exists
   to demonstrate against.
3. **Two temporary Playwright specs were written to gather the evidence for
   rows 2.4, 2.7, 2.8, 4.4 to 4.7, and were deleted rather than committed.**
   Row 1.5 requires exactly two specs, and the plan does not provide for
   evidence-only specs. What they proved is recorded above; what they were is
   not part of the phase.

4. **No pull request was opened, though plan step 6.7 calls for one.** The
   branch is pushed as `origin/phase-2-intake-form` and the diff against
   `phase-1-slice` is the phase's work, but no GitHub client or credential is
   available in the environment this phase was built in — `gh` is not
   installed and no token is set. As in Phase 0's step 11.5, the step is
   recorded rather than silently skipped: the pull request is opened by hand
   against `main`, stating that it stacks on Phase 1's and that Phase 1 merges
   first. The spec review the step exists for happened anyway, as step 6.1
   to 6.6.

Plan step 5.5 asked for a deliberate-failure check on a new assertion. Two were
observed without being arranged: the round trip failed at
`getByLabel("Presenting complaint")` while `emptyIntakeState` was arriving as
`undefined` from the server module, and the failure path failed on
`toHaveValue("Several weeks")` against the `<select>`. A third was arranged, on
the prior-episodes round trip, and is recorded in §4.

## Explicitly not validated here

- Whether a case file reads as a clinical document — Phase 3. This phase
  renders labelled values and that is correct.
- Any derived clinical judgement from the six answers — Phase 3 and Phase 4.
- Visual design, print layout, or accessibility beyond labels, bound controls
  and associated error messages — Phase 10 runs the axe audit.
- Abuse, length caps, rate limiting, and the enumerable-id problem inherited
  from Phase 1's decision D3 — Phase 11.
- Anything about production or Turso — Phase 12.
