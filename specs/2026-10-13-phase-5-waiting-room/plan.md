# Phase 5 — The waiting room: Plan

Task groups are numbered and ordered. Each leaves the repo in a committable
state. Do not start a group until the previous one's check passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The config fix comes first, because the phase's own spec is the thing it
protects and fixing it afterwards would mean not knowing whether a passing run
was luck.

---

## 1. The worker fix

1.1 Pin `workers: 1` in `playwright.config.ts` per decision D6, with a comment
saying what it protects: one database, one dev server, and a spec that asserts
a row is at the top of a list.

1.2 Update the comment already in the config that says there is "one spec in
this phase" — there are two files from now on.

1.3 Run the existing suite and record the worker count the output reports.

**Check:** `npm run test:e2e` reports `Running 2 tests using 1 worker` and both
pass.

---

## 2. The pure functions

2.1 Create `src/domain/waiting-room.ts`.

2.2 `waitedFor(createdAt, now)` per decision D3. Convert the stored
`YYYY-MM-DD HH:MM:SS` to UTC before parsing. Return a coarse phrase.

2.3 Decide and record what the function returns for a timestamp in the future
or an unparseable one. A clock skew of a few seconds between SQLite's
`current_timestamp` and `new Date()` is not hypothetical.

2.4 `truncateComplaint(text, limit)` — cut at a word boundary, append an
ellipsis only when something was removed.

2.5 `paginate({ total, pageSize, requested })` returning the clamped page, the
page count and the offset. A total of zero still yields a valid page.

2.6 Write the unit tests: one named test per row of the table in
[validation.md](./validation.md) §3.

**Check:** `npm run test` passes, every row of §3 has a named test, and no test
reads the clock or the database.

---

## 3. The route

3.1 Create `src/app/waiting-room/page.tsx` as a Server Component.

3.2 Read the page parameter from `searchParams`, which is a Promise in this
version of Next, and clamp it with `paginate`.

3.3 Two queries: one `count(*)`, one page of rows ordered by `id desc` with
`limit` and `offset`. Select only the columns the list and the code need.

3.4 Render a `<table>`: a header row, then one row per case with the four
columns of decision D4, the code and rubric sharing a cell per decision D7.

3.5 The case number links to `/cases/[id]` with `next/link`.

3.6 Render the pagination links. Omit a link that would point outside the range
rather than rendering it disabled.

3.7 Handle an empty list with a line in register rather than an empty table.
There is no state of the database where this page should look broken.

**Check:** `/waiting-room` lists cases newest first, the links work, and
`npm run build` reports `ƒ /waiting-room`.

---

## 4. The spec

4.1 Create `e2e/waiting-room.spec.ts`.

4.2 The done-when condition: submit a case through `/intake`, capture the id
from the redirect, then load `/waiting-room` and assert the first row is that
case.

4.3 Assert the row carries its code and the truncated complaint, and that the
case-number link navigates to the case file.

4.4 Assert the page renders at all for page 2 and for an out-of-range page,
because clamping is only observable from the outside.

4.5 Break one new assertion deliberately and confirm a real assertion diff.

**Check:** `npm run test:e2e` reports two files, three tests, one worker, all
passing.

---

## 5. Review against the spec

5.1 Walk [validation.md](./validation.md) and tick every row with evidence.

5.2 Re-read the Out list. Confirm no search, no filter, no sort control, no
moderation, no link on `/`, no schema change, no design system.

5.3 Confirm `/`, `src/app/layout.tsx`, `src/app/intake/`, `src/db/`,
`src/domain/case.ts`, `case-note.ts` and `diagnosis.ts` are byte-identical to
`phase-4-diagnosis-coding`.

5.4 Record the answer to Phase 4's open question about the code and the rubric
in Phase 4's requirements, as this phase's decision D7 decided it.

5.5 Confirm [roadmap.md](../roadmap.md) Phase 5 still matches what was built,
and that the worker note recorded against this phase is now resolved and says
so.

5.6 If reality diverged from the spec anywhere, amend the spec in the same
commit range.

5.7 Commit, push, open a pull request against `main`, stating the Phase 1 to
Phase 5 merge order.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the stacking is stated.
