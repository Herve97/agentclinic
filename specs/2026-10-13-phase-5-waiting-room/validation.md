# Phase 5 — The waiting room: Validation

How to know Phase 5 succeeded and can be merged.

The roadmap's done-when condition is that **submitting a new case makes it
appear at the top of the list** (§4 row 4.1), proved by a spec.

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1); a
`"use server"` module may only export async functions (Phase 2); and a value
assertion against a labelled cell must be scoped and exact, or it passes against
the label (Phase 3, confirmed in Phase 4).

---

## 1. The commands

| #   | Command                  | Expected                                                            | ✓   |
| --- | ------------------------ | ------------------------------------------------------------------- | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                | ☑   |
| 1.2 | `npm run build`          | Exits 0. Four routes, with `ƒ /waiting-room` — dynamic, not static. | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test.                  | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                            | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 files, 4 tests, 1 worker**, all passing.               | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                            | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                            | ☑   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.              | ☑   |

**Blocking:** all eight. Row 1.5 records the worker count because decision D6
is the fix the roadmap asked this phase for.

**Evidence**, 2026-10-13, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` → no output, exit 0.
- 1.2 `npm run build` → exit 0, route table `○ /`, `○ /_not-found`,
  `ƒ /cases/[id]`, `○ /intake`, `ƒ /waiting-room`. Four routes, and the new one
  is dynamic — a static waiting room would freeze every waiting time at build
  time.
- 1.3 `npm run test` → `Test Files 5 passed (5)`, `Tests 104 passed (104)` —
  the twenty-three of §3 on top of Phase 4's twenty-four, Phase 3's thirty,
  Phase 2's twenty-six and the Phase 0 smoke test.
- 1.4 and 1.6 `npm run verify:all` → exit 0.
- 1.5 `npm run test:e2e` → `Running 4 tests using 1 worker`, then
  `4 passed (1.8m)`. Two files. **One worker**, which is decision D6 and the
  fix the roadmap asked this phase for.
- 1.7 `npx prettier --check .` → `All matched files use Prettier code style!`
- 1.8 No migration was generated. `drizzle/meta/_journal.json` still lists
  exactly `0000_create_cases` and `0001_add_intake_fields`, and
  `git diff phase-4-diagnosis-coding -- drizzle/ src/db/` is empty.

One run of `npx vitest run` failed with `Failed to start forks worker` on every
file and reported `Tests no tests` with `5 errors`. It was machine contention,
not the suite: fifty-three node processes were alive at the time, from this
session's Playwright runs and an unrelated project's vitest watcher. The same
command passed on the next run and every run since. Recorded because "no tests"
is exactly the output that must not be mistaken for a green suite.

**Environment note, 2026-10-27.** `next build` and the Playwright `webServer`
both now abort on a Next.js security advisory for 16.4.0 — `SecurityFatalError`
with "This command stopped to show the upgrade recommendation. Retry the same
command to continue." It fires periodically rather than once, it exits non-zero,
and under Playwright it takes the dev server down with it, so all four e2e tests
fail with `ERR_CONNECTION_REFUSED` and nothing in the application is at fault.
Re-running the same command passes. Every row above was re-confirmed on
2026-10-27 after a retry: `npm run verify` → `Tests 104 passed (104)` with the
same four-route table, and `npm run test:e2e` → `Running 4 tests using 1 worker`
then `4 passed (26.6s)`. The advisory is a tech-stack decision — `next` is
pinned at `16.4.0` and the rejected list and the pinning rule both live in
`specs/tech-stack.md` — so the upgrade is not taken here on this phase's
authority. Recorded because a red suite that is really a red toolchain is the
other output that must not be mistaken for a verdict on the code.

---

## 2. The list

| #    | Check             | Expected                                                                       | ✓   |
| ---- | ----------------- | ------------------------------------------------------------------------------ | --- |
| 2.1  | Four columns      | Case number, code, truncated complaint, time waiting.                          | ☑   |
| 2.2  | A real table      | `<table>` with a `<thead>` header row and one `<tr>` per case.                 | ☑   |
| 2.3  | Newest first      | Case numbers descend down the page.                                            | ☑   |
| 2.4  | Code and rubric   | Both render in the code cell (decision D7).                                    | ☑   |
| 2.5  | Truncation        | A long complaint is cut at a word boundary with an ellipsis.                   | ☑   |
| 2.6  | Short complaints  | A complaint under the limit renders whole, with no ellipsis.                   | ☑   |
| 2.7  | Waiting time      | A plausible coarse phrase for every row, including the Phase 1 rows.           | ☑   |
| 2.8  | Links through     | The case number links to `/cases/[id]` and navigating lands on that case file. | ☑   |
| 2.9  | Omitted fields    | No duration, no counts, no reported speech anywhere on the page (decision D4). | ☑   |
| 2.10 | Empty state       | With no rows, a line in register rather than a broken table.                   | ☑   |
| 2.11 | No console errors | A real browser on `/waiting-room` reports no errors and no warnings.           | ☑   |

**Blocking:** all eleven. Row 2.10 is checked against an empty database, not
reasoned about.

**Evidence**, 2026-10-13, Chromium via Playwright, reading `/waiting-room`:

- 2.1 `thead th` reads `["Case", "Code", "Presenting complaint", "Time waiting"]`
  — the roadmap's four columns, in that order.
- 2.2 `<table><thead><tr><th scope="col">Case</th>…` with one `<tr>` per case
  in `<tbody>`. Twenty rows on page 1, which is the page size.
- 2.3 The first eight case numbers read 26, 25, 24, 23, 22, 21, 20, 19 —
  descending. The spec asserts the whole page's ids are sorted descending
  rather than spot-checking the first two.
- 2.4 A code cell reads `ACDI-12` with
  `Requirement instability, marked, subacute` beneath it (decision D7).
- 2.5 `Asked to tidy it up with no statement of what untidy meant.
Specification withheld. Specification withheld.…` — cut after a whole word,
  with an ellipsis.
- 2.6 `Make it pop. Again.` and `Console probe.` render whole, with no
  ellipsis.
- 2.7 Waiting times across the two pages read `Under one hour`, `4 hours`,
  `9 hours` and `3 days`. The `3 days` rows are cases 1 and 2, the Phase 1
  rows, which is correct for a database seeded on 2026-10-10.
- 2.8 The first three row links are `/cases/26`, `/cases/25`, `/cases/24`, and
  the spec clicks one and asserts the case file's `<h1>`.
- 2.9 Decision D4, checked by regex over the whole page text: duration phrases
  `false`, counts `false`, reported speech `false`. None of the six fields the
  list omits appears anywhere on it.
- 2.10 Against a database with no rows — a throwaway `DATABASE_URL` the dev
  server migrated from nothing — the page returns 200, renders
  `No cases are awaiting review.` and `Page 1 of 1.`, and contains zero
  `<table>` elements. Checked against an empty database rather than reasoned
  about.
- 2.11 A `console` and `pageerror` listener over the list, page 2 and the empty
  state collected `[]`, asserted with `expect(messages).toEqual([])`.

---

## 3. The pure functions are tested

**One named test per row.**

| #    | Function            | Input                                    | Expected                    | ✓   |
| ---- | ------------------- | ---------------------------------------- | --------------------------- | --- |
| 3.1  | `waitedFor`         | 30 seconds ago                           | under an hour               | ☑   |
| 3.2  | `waitedFor`         | 59 minutes ago                           | under an hour               | ☑   |
| 3.3  | `waitedFor`         | 1 hour ago                               | one hour                    | ☑   |
| 3.4  | `waitedFor`         | 5 hours ago                              | hours, plural               | ☑   |
| 3.5  | `waitedFor`         | 1 day ago                                | one day                     | ☑   |
| 3.6  | `waitedFor`         | 3 days ago                               | days, plural                | ☑   |
| 3.7  | `waitedFor`         | 8 days ago                               | one week                    | ☑   |
| 3.8  | `waitedFor`         | 30 days ago                              | weeks, plural               | ☑   |
| 3.9  | `waitedFor`         | a UTC timestamp, machine not at UTC      | not shifted by the offset   | ☑   |
| 3.10 | `waitedFor`         | a timestamp a few seconds in the future  | under an hour, not negative | ☑   |
| 3.11 | `waitedFor`         | an unparseable timestamp                 | states it, does not throw   | ☑   |
| 3.12 | `truncateComplaint` | text under the limit                     | unchanged, no ellipsis      | ☑   |
| 3.13 | `truncateComplaint` | text over the limit                      | cut at a word boundary      | ☑   |
| 3.14 | `truncateComplaint` | a single word longer than the limit      | cut at the limit            | ☑   |
| 3.15 | `truncateComplaint` | text with multi-byte characters          | no broken character         | ☑   |
| 3.16 | `truncateComplaint` | text exactly at the limit                | unchanged, no ellipsis      | ☑   |
| 3.17 | `paginate`          | page 1 of 23 rows, size 20               | page 1, 2 pages, offset 0   | ☑   |
| 3.18 | `paginate`          | page 2 of 23 rows, size 20               | page 2, 2 pages, offset 20  | ☑   |
| 3.19 | `paginate`          | page 9 of 23 rows                        | clamped to 2                | ☑   |
| 3.20 | `paginate`          | page 0, page −1, `"abc"`, missing        | clamped to 1                | ☑   |
| 3.21 | `paginate`          | 0 rows                                   | page 1, 1 page, offset 0    | ☑   |
| 3.22 | `paginate`          | exactly 20 rows, size 20                 | 1 page, no second page      | ☑   |
| 3.23 | Purity              | No test reads the clock or the database. | holds                       | ☑   |

**Blocking:** all twenty-three. Row 3.9 is the one that catches the local-time
parse, which is silent and wrong by hours.

**Evidence**, 2026-10-13: `npx vitest run src/domain/waiting-room.test.ts`
reports 23 passing tests whose names begin `3.1` through `3.23`, one per row
above, with no number missing and none repeated.

Row 3.9 is the one that matters most, and it is not vacuous on this machine:
`Intl.DateTimeFormat().resolvedOptions().timeZone` is `Africa/Kinshasa`, UTC+1.
A local parse of `"2026-10-13 08:00:00"` would be `07:00Z`, which against a
`now` of `12:00:00Z` reads `5 hours` rather than `4 hours`, so the assertion
fails if the UTC conversion is removed. The file also passes under
`TZ=Asia/Tokyo` (UTC+9) and `TZ=America/Denver` (UTC−6), both run explicitly —
`23 passed` in each.

Row 3.15 asserts on code points rather than UTF-16 units: truncating 200 emoji
to 10 yields eleven code points, all ten of them whole emoji plus the ellipsis,
and no `U+FFFD` replacement character.

Row 3.23 is structural: the import list is `vitest` and `./waiting-room`, and
every waiting-time case is measured against a `now` declared in the file. The
suite reads neither the clock nor the database, so it is deterministic.

---

## 4. The done-when condition

| #   | Check               | Expected                                                                      | ✓   |
| --- | ------------------- | ----------------------------------------------------------------------------- | --- |
| 4.1 | New case at the top | Submit through `/intake`, then the first row of `/waiting-room` is that case. | ☑   |
| 4.2 | Proved by a spec    | `e2e/waiting-room.spec.ts`, not checked by hand once.                         | ☑   |
| 4.3 | The row is complete | That row carries its code and its truncated complaint.                        | ☑   |
| 4.4 | The link works      | Clicking the case number lands on `/cases/[id]` for that id.                  | ☑   |
| 4.5 | Page 2 renders      | `?page=2` returns a page of rows, all with lower case numbers than page 1.    | ☑   |
| 4.6 | Clamping observable | `?page=0` and `?page=999` both render a valid page rather than an error.      | ☑   |
| 4.7 | Deliberate failure  | One new assertion was broken on purpose and produced a real assertion diff.   | ☑   |

**Blocking:** all seven. Row 4.1 is the roadmap's condition.

**Evidence**, 2026-10-13, from `e2e/waiting-room.spec.ts`:

- 4.1 and 4.2 The first test submits a case through `/intake`, takes the id
  from the redirect URL, loads `/waiting-room`, and asserts
  `tbody tr:first-child td:first-child` has text `Case <id>` exactly. That is
  the roadmap's done-when condition, proved from the outside.
- 4.3 The same row's code cell contains `ACDI-12` and
  `Requirement instability, marked, subacute` — nine revisions is a marked
  burden and "Several weeks" is subacute — and its complaint cell contains the
  opening of the submitted text, an ellipsis, and fewer characters than were
  submitted.
- 4.4 The spec clicks the row's `Case <id>` link, asserts the URL is
  `/cases/<id>`, and asserts the case file's `<h1>` reads `Case <id>`.
- 4.5 The second test seeds the table to one more than a page (decision D8),
  reads every case number on page 1, asserts the list is sorted descending,
  follows the `Next page` link, and asserts that the highest case number on
  page 2 is lower than the lowest on page 1. It seeds because the first
  version assumed a second page and failed on a cold clone — see the
  divergence note under the merge gate.
- 4.6 `?page=0`, `?page=999`, `?page=abc` and `?page=-1` each return HTTP 200
  with the `Waiting room` heading and a visible first row.
- 4.7 Deliberate failure: changing the waiting-time expectation from
  `Under one hour` to `3 days` failed with `unexpected value "Under one hour"`
  rather than passing. Restored afterwards.

---

## 5. The exposure is stated, not discovered

Decision D5. This section exists because this is the first screen that shows one
visitor's text to another.

| #   | Check              | Expected                                                                           | ✓   |
| --- | ------------------ | ---------------------------------------------------------------------------------- | --- |
| 5.1 | Less than the file | The list shows strictly less of each case than `/cases/[id]` does.                 | ☑   |
| 5.2 | Stated in the spec | Decision D5 records the exposure and ties Phase 11 to Phase 12.                    | ☑   |
| 5.3 | Roadmap agrees     | Phase 11 still owns unlisting, and its line still makes sense now the list exists. | ☑   |
| 5.4 | Nothing pulled in  | No moderation, no cleared flag, no filter was added here to paper over it.         | ☑   |
| 5.5 | Register holds     | Every authored string on the page passes the mission's swap test.                  | ☑   |

**Blocking:** all five.

**Evidence**, 2026-10-13:

- 5.1 The list shows four fields; the case file shows the complaint in full,
  the duration, both counts, both reported-speech fields, the four derived
  values, the code with its description, and the citation. The regex check in
  §2 row 2.9 confirms the omissions are absent from the list rather than
  merely unstyled.
- 5.2 Decision D5 is in `requirements.md` and states the exposure in terms of
  the mission's demo constraint, with the sentence tying Phase 11 to Phase 12
  in bold rather than buried.
- 5.3 The roadmap's Phase 11 line — "Cases stay unlisted from the waiting room
  until cleared" — now refers to a page that exists, which is the order the
  roadmap chose. It still owns the fix and nothing here pre-empts it.
- 5.4 `grep -rniE "moderation|moderated|unlist|\bcleared\b|\bflagged\b|\bapproved\b" src/`
  returns nothing. No flag, no column, no filter was added to paper over the
  exposure. (A looser grep for `moderat` matches "moderate", which is Phase 3's
  revision-burden qualifier and not a moderation state.)
- 5.5 The page's authored strings are the letterhead, `Waiting room`,
  `Cases awaiting review. Most recent first.`, the four column headers,
  `No cases are awaiting review.`, `Page N of M.`, `Previous page` and
  `Next page`. Each is what a clinic's noticeboard says. No exclamation mark,
  no second person, nothing that explains the premise.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                | Owned by   | ✓   |
| ---- | ------------------------------------------------------------- | ---------- | --- |
| 6.1  | A search field, a filter, or a sorting control                | Never      | ☑   |
| 6.2  | Any form, button, or `<input>` on `/waiting-room`             | Never      | ☑   |
| 6.3  | A link on `/`, or a link from a case file back to the list    | Phase 9    | ☑   |
| 6.4  | A moderation flag, a cleared column, or unlisting             | Phase 11   | ☑   |
| 6.5  | Any change to `src/app/intake/`, `src/db/`, or a migration    | Phase 2    | ☑   |
| 6.6  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`      | Phase 9    | ☑   |
| 6.7  | Any change to `case.ts`, `case-note.ts` or `diagnosis.ts`     | Phases 2–4 | ☑   |
| 6.8  | `@media print` or any print stylesheet                        | Phase 8    | ☑   |
| 6.9  | Custom colours, fonts, spacing scale, component classes       | Phase 10   | ☑   |
| 6.10 | A new dependency, or anything from the rejected list          | Never      | ☑   |
| 6.11 | A route beyond `/`, `/intake`, `/cases/[id]`, `/waiting-room` | Phase 6+   | ☑   |

**Blocking:** all eleven.

**Evidence**, 2026-10-13:

- 6.1 and 6.2 On `/waiting-room`: `forms: 0`, `inputs: 0`, `buttons: 0`,
  counted in the browser. The only interactive elements are 21 links — twenty
  case numbers and one `Next page`.
- 6.3 `git diff phase-4-diagnosis-coding -- src/app/page.tsx` → no output, and
  `src/app/cases/[id]/page.tsx` is untouched, so nothing links back from a
  case file to the list.
- 6.4 `grep -rniE "moderation|moderated|unlist|\bcleared\b|\bflagged\b|\bapproved\b" src/`
  returns nothing.
- 6.5 `git diff phase-4-diagnosis-coding -- src/app/intake/ src/db/ drizzle/`
  → no output.
- 6.6 `git diff phase-4-diagnosis-coding -- src/app/page.tsx
src/app/layout.tsx` → no output.
- 6.7 `git diff phase-4-diagnosis-coding -- src/domain/case.ts
src/domain/case-note.ts src/domain/diagnosis.ts` → no output. The list reads
  them and changes none of them.
- 6.8 `grep -rniE "@media print|window\.print" src/` returns nothing.
- 6.9 The page uses the same utilities as the rest of the site: margins,
  `text-sm`, `border-t`, `whitespace-nowrap`. No custom colour, font, spacing
  scale or component class.
- 6.10 `package.json` is byte-identical to Phase 4's. No dependency added.
- 6.11 `find src/app -name page.tsx` returns four files: `/`, `/intake`,
  `/cases/[id]`, `/waiting-room`.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                      | ✓   |
| --- | -------------------------- | ------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-4-diagnosis-coding`, still no links. | ☑   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                    | ☑   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                           | ☑   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                     | ☑   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.               | ☑   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.            | ☑   |
| 7.7 | Cold clone                 | Clone, install, one command, the list renders. No credential. | ☑   |

**Blocking:** all seven.

**Evidence**, 2026-10-13:

- 7.1 `git diff phase-4-diagnosis-coding -- src/app/page.tsx` → no output.
- 7.2 `next.config.ts` still sets `agentRules: false`; no `AGENTS.md` exists.
- 7.3 `src/app/layout.tsx` is unchanged, `<body suppressHydrationWarning>`
  included.
- 7.4 `tsconfig.json` still has `"strict": true`.
- 7.5 `grep -E '"[~^]' package.json` → no output.
- 7.6 `git status --porcelain` → no output after dev, build, test and e2e. The
  throwaway probe databases used for rows 2.10 and 7.7 were deleted, and
  `*.db` is ignored in any case.
- 7.7 Cold clone outside the repository: `git clone`, `npm ci`,
  `npm run test:e2e`. No `.env*` and no `local.db` in the clone; `predev`
  created and migrated the database unattended.

  **The first cold clone failed, and that is the finding.** Three tests passed
  and the pagination test failed at `getByRole("link", { name: "Next page" })`:
  the clone held two cases, so there was no second page and no link to click.
  The test had only ever passed because this machine had accumulated
  twenty-three cases over five phases. Decision D8 records the fix — the test
  seeds its own fixture.

  **The fix was verified against the condition that broke, not against a
  second clone.** A second cold clone was attempted and its `npm ci` was still
  running after ten minutes — this machine was carrying fifty-plus node
  processes from unrelated work, and one dev-server boot also exceeded
  Playwright's 120s `webServer` timeout. So the fix was proved two ways
  instead: the seeding function was run against an empty database in isolation
  (0 rows in, exactly 21 out, and a re-run inserts nothing), and
  `e2e/waiting-room.spec.ts` was then run in full against a fresh
  `DATABASE_URL` that the dev server migrated from nothing — `2 passed`, which
  is the empty-database condition the clone failed on. The row is ticked on
  that evidence, and the discrepancy is stated rather than papered over.

---

## Merge gate

Phase 5 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all twenty-three rows.
3. Section 4 row 4.1 is proved by `e2e/waiting-room.spec.ts`.
4. Section 1 row 1.5 records one worker.
5. `npm run verify:all` passes.
6. `/` and the whole write path are byte-identical to
   `phase-4-diagnosis-coding`.
7. **Phases 1 to 4 have merged**, or this pull request is explicitly marked as
   stacked on them, in that order.

**Status**, 2026-10-14: gates 1 to 6 are met, with the evidence recorded under
each section above. Gate 3 — the roadmap's done-when condition — is proved by
`e2e/waiting-room.spec.ts`, and gate 4 records one worker, which is the fix the
roadmap asked this phase for.

Gate 7 is open and not this phase's to close. `origin/main` is at `5aa2241`,
which contains none of Phases 1 to 4, so this pull request stacks four deep:
Phases 1, 2, 3, 4, then this.

### Recorded divergences from the spec as written

Five, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **The pagination test seeds its own fixture, which decision D8 records.**
   The first version followed the `Next page` link and only ever passed because
   this machine had accumulated twenty-three cases over five phases. The cold
   clone held two, and the test failed. This is the phase's real finding and the
   clearest demonstration so far of what the cold-clone row is for.
2. **Row 1.5 expected three tests and there are four.** Plan step 4.4 asked for
   the clamping behaviour to be asserted, and it reads better as a second test
   beside the ordering and pagination assertions than as a tail on the
   done-when test. The row is amended to four.
3. **Row 7.7 is ticked on a substitute for a second cold clone.** The clone that
   found the defect ran in full; the clone meant to confirm the fix had its
   `npm ci` still running after ten minutes and then timed out booting the dev
   server, on a machine carrying fifty-plus node processes from unrelated work.
   The fix was proved instead against the condition that broke — an empty
   database — in two independent ways, which §7 row 7.7 sets out. Stated rather
   than smoothed over, because "the cold clone passed" would not have been true.
4. **A temporary third Playwright spec gathered the browser evidence for §2,
   and was deleted rather than committed.** Row 1.5 fixes the file and test
   count. What it proved is recorded above.
5. **No pull request was opened, though plan step 5.7 calls for one.** The
   branch is pushed as `origin/phase-5-waiting-room` — on 2026-10-27, not on
   2026-10-14 as this row first claimed; the earlier `git push` had no upstream
   and did nothing, and the row was written from the intent rather than from the
   output. Corrected here, because a push that did not happen is the same class
   of untrue as a cold clone that did not pass. No GitHub client or credential
   exists in this environment — `gh` is not installed and no token is set. As in
   Phase 0's step 11.5 and every phase since, the step is recorded rather than
   silently skipped; the pull request is opened by hand against `main`, stating
   the Phase 1 to Phase 5 merge order.

One further note for later phases, recorded because it cost time here: a run of
`npx vitest run` reported `Tests no tests` with five
`Failed to start forks worker` errors under machine contention. It is not a
failing suite and it is not a passing one. §1 records it.

## Explicitly not validated here

- Whether anything links to the waiting room — Phase 9.
- Whether unmoderated text can reach it — Phase 11, which decision D5 ties to
  Phase 12.
- Print layout, design and the axe audit — Phases 8 and 10.
- Offset pagination's cost at scale — Phase 12 is the first phase with a reason
  to measure it.
