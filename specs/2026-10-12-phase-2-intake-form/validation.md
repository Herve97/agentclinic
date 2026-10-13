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
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                         | ☐   |
| 1.2 | `npm run build`          | Exits 0. `/cases/[id]` still dynamic, `/intake` present.     | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every branch in §3 has a passing test.              | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                     | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — the round trip and the failure path. | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                     | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                     | ☐   |
| 1.8 | `npm run db:migrate`     | Applies the new migration, then is a no-op on re-run.        | ☐   |

**Blocking:** all eight.

---

## 2. The six fields exist and are asked correctly

| #   | Check             | Expected                                                                                                          | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------- | --- |
| 2.1 | All six present   | Presenting complaint, duration, requirement revisions, prior episodes, what the human said, what the human meant. | ☐   |
| 2.2 | Labels bound      | Every control has a real `<label>` bound to it, including the `<select>`.                                         | ☐   |
| 2.3 | Duration options  | Exactly the five options in decision D1, no blank-but-selectable default that passes validation.                  | ☐   |
| 2.4 | Integer inputs    | Requirement revisions and prior episodes accept `0` and reject `3.5`, `-1`, `abc`, and empty.                     | ☐   |
| 2.5 | Voice of labels   | Each label reads as a clinic's intake form, not an app's. Passes the mission's swap test.                         | ☐   |
| 2.6 | Voice of errors   | Each message reads as a clinician noting an omission (decision D6). No "please", no exclamation marks.            | ☐   |
| 2.7 | Errors are inline | Each message renders next to its own field, not in a summary block.                                               | ☐   |
| 2.8 | No console errors | A real browser on `/intake` and `/cases/[id]` reports no errors and no warnings.                                  | ☐   |

**Blocking:** all except 2.5 and 2.6, which are judgement calls — but if either
is arguable, the copy is wrong and gets rewritten rather than argued for.

---

## 3. Every validation branch has a unit test

The second half of the roadmap's done-when condition. **One named test per row.**
A count of passing tests is the evidence; "the schema is covered" is not.

| #    | Field                 | Branch                                | Expected            | ✓   |
| ---- | --------------------- | ------------------------------------- | ------------------- | --- |
| 3.1  | complaint             | empty string                          | rejected            | ☐   |
| 3.2  | complaint             | whitespace only                       | rejected            | ☐   |
| 3.3  | complaint             | missing key                           | rejected            | ☐   |
| 3.4  | complaint             | valid, surrounded by whitespace       | accepted, trimmed   | ☐   |
| 3.5  | duration              | empty string                          | rejected            | ☐   |
| 3.6  | duration              | value outside the five options        | rejected            | ☐   |
| 3.7  | duration              | each of the five options              | accepted            | ☐   |
| 3.8  | requirement_revisions | empty string                          | rejected            | ☐   |
| 3.9  | requirement_revisions | non-numeric (`"abc"`)                 | rejected            | ☐   |
| 3.10 | requirement_revisions | fractional (`"3.5"`)                  | rejected            | ☐   |
| 3.11 | requirement_revisions | negative (`"-1"`)                     | rejected            | ☐   |
| 3.12 | requirement_revisions | exponent form (`"1e3"`)               | rejected            | ☐   |
| 3.13 | requirement_revisions | `"0"`                                 | accepted as `0`     | ☐   |
| 3.14 | requirement_revisions | `"6"`                                 | accepted as `6`     | ☐   |
| 3.15 | prior_episodes        | empty string                          | rejected            | ☐   |
| 3.16 | prior_episodes        | non-numeric                           | rejected            | ☐   |
| 3.17 | prior_episodes        | fractional                            | rejected            | ☐   |
| 3.18 | prior_episodes        | negative                              | rejected            | ☐   |
| 3.19 | prior_episodes        | `"0"`                                 | accepted as `0`     | ☐   |
| 3.20 | human_said            | empty / whitespace only               | rejected            | ☐   |
| 3.21 | human_said            | valid                                 | accepted, trimmed   | ☐   |
| 3.22 | human_meant           | empty / whitespace only               | rejected            | ☐   |
| 3.23 | human_meant           | valid                                 | accepted, trimmed   | ☐   |
| 3.24 | all six               | every field valid                     | accepted            | ☐   |
| 3.25 | all six               | every field invalid at once           | a message per field | ☐   |
| 3.26 | types                 | integers parse to `number`, not `"6"` | accepted            | ☐   |

**Blocking:** all twenty-six. Row 3.25 is what proves errors are per-field
rather than first-failure-wins.

---

## 4. Each field round-trips to the database

The first half of the done-when condition. Proved from the outside, in a
browser, not by reading the insert statement.

| #   | Check                       | Expected                                                                                                           | ✓   |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ | --- |
| 4.1 | Submit succeeds             | A fully valid submission redirects to `/cases/[id]`.                                                               | ☐   |
| 4.2 | All six render              | Every submitted value appears on the resulting page.                                                               | ☐   |
| 4.3 | Values match                | Each value is the text that was typed, not a truncation or a re-encoding.                                          | ☐   |
| 4.4 | Integers stored as integers | `requirement_revisions` and `prior_episodes` are integers in the row, not text.                                    | ☐   |
| 4.5 | A zero survives             | `0` revisions stores and renders as `0`, not as blank or "Not recorded."                                           | ☐   |
| 4.6 | Markup                      | A `<dl>` with `<dt>`/`<dd>` pairs.                                                                                 | ☐   |
| 4.7 | Phase 1 rows                | A row created before this migration renders, showing "Not recorded." for the five new fields rather than erroring. | ☐   |
| 4.8 | No section headings         | No header block, no "History", "Assessment", "Plan", or follow-up interval. Phase 3 owns those.                    | ☐   |

**Blocking:** all eight. Row 4.5 is the one that catches `Number()` coercion
treating a legitimate zero as absent. Row 4.7 is the consequence of decision D2
and is checked deliberately rather than discovered.

---

## 5. Form state survives a failed submit

| #   | Check                              | Expected                                                           | ✓   |
| --- | ---------------------------------- | ------------------------------------------------------------------ | --- |
| 5.1 | One field omitted                  | That field's message appears; the other five keep what was typed.  | ☐   |
| 5.2 | The `<select>` keeps its selection | Duration is still selected after a failed submit.                  | ☐   |
| 5.3 | Long text survives                 | Both free-text answers keep their full content, not a truncation.  | ☐   |
| 5.4 | No row written                     | Confirmed by querying the table before and after.                  | ☐   |
| 5.5 | URL unchanged                      | Still `/intake`; no redirect on failure.                           | ☐   |
| 5.6 | Proved by a spec                   | Row 5.1–5.3 are asserted by an e2e spec, not checked by hand once. | ☐   |

**Blocking:** all six. This section is the roadmap's "form state survives a
failed submit" and row 5.2 is the part most easily missed.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                                   | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                         | Phase 9    | ☐   |
| 6.2  | Any route beyond `/`, `/intake`, `/cases/[id]`                                   | Phases 3–9 | ☐   |
| 6.3  | Diagnosis codes or any scoring of the answers                                    | Phase 4    | ☐   |
| 6.4  | Chart-note sections or narrative prose on `/cases/[id]`                          | Phase 3    | ☐   |
| 6.5  | Derived fields — chronicity, severity, episode interpretation                    | Phase 3    | ☐   |
| 6.6  | Length caps, profanity filtering, rate limiting                                  | Phase 11   | ☐   |
| 6.7  | Design work: custom colours, fonts, spacing scale, type scale, component classes | Phase 10   | ☐   |
| 6.8  | A form library — React Hook Form, Formik, or any client state manager            | Never      | ☐   |
| 6.9  | Any CI workflow                                                                  | Phase 12   | ☐   |
| 6.10 | A tracked `.db`, `.env`, or Playwright report                                    | Never      | ☐   |
| 6.11 | `src/content/` created empty                                                     | Phase 6    | ☐   |
| 6.12 | A backfill that invents values for Phase 1 rows                                  | Never      | ☐   |

**Blocking:** all twelve. Row 6.1 is checked with
`git diff phase-1-slice -- src/app/page.tsx src/app/layout.tsx` returning
nothing. Row 6.12 is decision D2's hard edge.

---

## 7. The migration is safe

| #   | Check              | Expected                                                              | ✓   |
| --- | ------------------ | --------------------------------------------------------------------- | --- |
| 7.1 | Additive only      | Five `ALTER TABLE ... ADD COLUMN` statements. No table recreation.    | ☐   |
| 7.2 | Data preserved     | Rows created under Phase 1's schema still exist after migrating.      | ☐   |
| 7.3 | Nullable           | The five new columns permit null (decision D2).                       | ☐   |
| 7.4 | Idempotent         | A second `db:migrate` is a clean no-op.                               | ☐   |
| 7.5 | Read before commit | The generated SQL was read, not just generated. Say what it contains. | ☐   |
| 7.6 | Journal committed  | `drizzle/meta/_journal.json` lists both migrations.                   | ☐   |

**Blocking:** all six. Row 7.1 matters because `drizzle-kit` will rebuild a
SQLite table for some changes, and a rebuild here would be a silent data path.

---

## 8. Carried-over constraints

| #   | Check                      | Expected                                                                           | ✓   |
| --- | -------------------------- | ---------------------------------------------------------------------------------- | --- |
| 8.1 | `/` unchanged              | Byte-identical to `phase-1-slice`, still no links.                                 | ☐   |
| 8.2 | `agentRules: false`        | Still set; no `AGENTS.md` reappeared.                                              | ☐   |
| 8.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                                                | ☐   |
| 8.4 | `strict: true`             | Still in `tsconfig.json`.                                                          | ☐   |
| 8.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                                    | ☐   |
| 8.6 | Clean tree                 | `git status` clean after dev, build, test, and e2e.                                | ☐   |
| 8.7 | Cold clone                 | Clone, install, dev, submit all six fields. No credentials, no hand-run migration. | ☐   |

**Blocking:** all seven.

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

## Explicitly not validated here

- Whether a case file reads as a clinical document — Phase 3. This phase
  renders labelled values and that is correct.
- Any derived clinical judgement from the six answers — Phase 3 and Phase 4.
- Visual design, print layout, or accessibility beyond labels, bound controls
  and associated error messages — Phase 10 runs the axe audit.
- Abuse, length caps, rate limiting, and the enumerable-id problem inherited
  from Phase 1's decision D3 — Phase 11.
- Anything about production or Turso — Phase 12.
