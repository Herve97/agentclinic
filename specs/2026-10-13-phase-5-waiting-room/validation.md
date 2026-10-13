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
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                | ☐   |
| 1.2 | `npm run build`          | Exits 0. Four routes, with `ƒ /waiting-room` — dynamic, not static. | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test.                  | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                            | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 files, 3 tests, 1 worker**, all passing.               | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                            | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                            | ☐   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.              | ☐   |

**Blocking:** all eight. Row 1.5 records the worker count because decision D6
is the fix the roadmap asked this phase for.

---

## 2. The list

| #    | Check             | Expected                                                                       | ✓   |
| ---- | ----------------- | ------------------------------------------------------------------------------ | --- |
| 2.1  | Four columns      | Case number, code, truncated complaint, time waiting.                          | ☐   |
| 2.2  | A real table      | `<table>` with a `<thead>` header row and one `<tr>` per case.                 | ☐   |
| 2.3  | Newest first      | Case numbers descend down the page.                                            | ☐   |
| 2.4  | Code and rubric   | Both render in the code cell (decision D7).                                    | ☐   |
| 2.5  | Truncation        | A long complaint is cut at a word boundary with an ellipsis.                   | ☐   |
| 2.6  | Short complaints  | A complaint under the limit renders whole, with no ellipsis.                   | ☐   |
| 2.7  | Waiting time      | A plausible coarse phrase for every row, including the Phase 1 rows.           | ☐   |
| 2.8  | Links through     | The case number links to `/cases/[id]` and navigating lands on that case file. | ☐   |
| 2.9  | Omitted fields    | No duration, no counts, no reported speech anywhere on the page (decision D4). | ☐   |
| 2.10 | Empty state       | With no rows, a line in register rather than a broken table.                   | ☐   |
| 2.11 | No console errors | A real browser on `/waiting-room` reports no errors and no warnings.           | ☐   |

**Blocking:** all eleven. Row 2.10 is checked against an empty database, not
reasoned about.

---

## 3. The pure functions are tested

**One named test per row.**

| #    | Function            | Input                                    | Expected                    | ✓   |
| ---- | ------------------- | ---------------------------------------- | --------------------------- | --- |
| 3.1  | `waitedFor`         | 30 seconds ago                           | under an hour               | ☐   |
| 3.2  | `waitedFor`         | 59 minutes ago                           | under an hour               | ☐   |
| 3.3  | `waitedFor`         | 1 hour ago                               | one hour                    | ☐   |
| 3.4  | `waitedFor`         | 5 hours ago                              | hours, plural               | ☐   |
| 3.5  | `waitedFor`         | 1 day ago                                | one day                     | ☐   |
| 3.6  | `waitedFor`         | 3 days ago                               | days, plural                | ☐   |
| 3.7  | `waitedFor`         | 8 days ago                               | one week                    | ☐   |
| 3.8  | `waitedFor`         | 30 days ago                              | weeks, plural               | ☐   |
| 3.9  | `waitedFor`         | a UTC timestamp, machine not at UTC      | not shifted by the offset   | ☐   |
| 3.10 | `waitedFor`         | a timestamp a few seconds in the future  | under an hour, not negative | ☐   |
| 3.11 | `waitedFor`         | an unparseable timestamp                 | states it, does not throw   | ☐   |
| 3.12 | `truncateComplaint` | text under the limit                     | unchanged, no ellipsis      | ☐   |
| 3.13 | `truncateComplaint` | text over the limit                      | cut at a word boundary      | ☐   |
| 3.14 | `truncateComplaint` | a single word longer than the limit      | cut at the limit            | ☐   |
| 3.15 | `truncateComplaint` | text with multi-byte characters          | no broken character         | ☐   |
| 3.16 | `truncateComplaint` | text exactly at the limit                | unchanged, no ellipsis      | ☐   |
| 3.17 | `paginate`          | page 1 of 23 rows, size 20               | page 1, 2 pages, offset 0   | ☐   |
| 3.18 | `paginate`          | page 2 of 23 rows, size 20               | page 2, 2 pages, offset 20  | ☐   |
| 3.19 | `paginate`          | page 9 of 23 rows                        | clamped to 2                | ☐   |
| 3.20 | `paginate`          | page 0, page −1, `"abc"`, missing        | clamped to 1                | ☐   |
| 3.21 | `paginate`          | 0 rows                                   | page 1, 1 page, offset 0    | ☐   |
| 3.22 | `paginate`          | exactly 20 rows, size 20                 | 1 page, no second page      | ☐   |
| 3.23 | Purity              | No test reads the clock or the database. | holds                       | ☐   |

**Blocking:** all twenty-three. Row 3.9 is the one that catches the local-time
parse, which is silent and wrong by hours.

---

## 4. The done-when condition

| #   | Check               | Expected                                                                      | ✓   |
| --- | ------------------- | ----------------------------------------------------------------------------- | --- |
| 4.1 | New case at the top | Submit through `/intake`, then the first row of `/waiting-room` is that case. | ☐   |
| 4.2 | Proved by a spec    | `e2e/waiting-room.spec.ts`, not checked by hand once.                         | ☐   |
| 4.3 | The row is complete | That row carries its code and its truncated complaint.                        | ☐   |
| 4.4 | The link works      | Clicking the case number lands on `/cases/[id]` for that id.                  | ☐   |
| 4.5 | Page 2 renders      | `?page=2` returns a page of rows, all with lower case numbers than page 1.    | ☐   |
| 4.6 | Clamping observable | `?page=0` and `?page=999` both render a valid page rather than an error.      | ☐   |
| 4.7 | Deliberate failure  | One new assertion was broken on purpose and produced a real assertion diff.   | ☐   |

**Blocking:** all seven. Row 4.1 is the roadmap's condition.

---

## 5. The exposure is stated, not discovered

Decision D5. This section exists because this is the first screen that shows one
visitor's text to another.

| #   | Check              | Expected                                                                           | ✓   |
| --- | ------------------ | ---------------------------------------------------------------------------------- | --- |
| 5.1 | Less than the file | The list shows strictly less of each case than `/cases/[id]` does.                 | ☐   |
| 5.2 | Stated in the spec | Decision D5 records the exposure and ties Phase 11 to Phase 12.                    | ☐   |
| 5.3 | Roadmap agrees     | Phase 11 still owns unlisting, and its line still makes sense now the list exists. | ☐   |
| 5.4 | Nothing pulled in  | No moderation, no cleared flag, no filter was added here to paper over it.         | ☐   |
| 5.5 | Register holds     | Every authored string on the page passes the mission's swap test.                  | ☐   |

**Blocking:** all five.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                | Owned by   | ✓   |
| ---- | ------------------------------------------------------------- | ---------- | --- |
| 6.1  | A search field, a filter, or a sorting control                | Never      | ☐   |
| 6.2  | Any form, button, or `<input>` on `/waiting-room`             | Never      | ☐   |
| 6.3  | A link on `/`, or a link from a case file back to the list    | Phase 9    | ☐   |
| 6.4  | A moderation flag, a cleared column, or unlisting             | Phase 11   | ☐   |
| 6.5  | Any change to `src/app/intake/`, `src/db/`, or a migration    | Phase 2    | ☐   |
| 6.6  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`      | Phase 9    | ☐   |
| 6.7  | Any change to `case.ts`, `case-note.ts` or `diagnosis.ts`     | Phases 2–4 | ☐   |
| 6.8  | `@media print` or any print stylesheet                        | Phase 8    | ☐   |
| 6.9  | Custom colours, fonts, spacing scale, component classes       | Phase 10   | ☐   |
| 6.10 | A new dependency, or anything from the rejected list          | Never      | ☐   |
| 6.11 | A route beyond `/`, `/intake`, `/cases/[id]`, `/waiting-room` | Phase 6+   | ☐   |

**Blocking:** all eleven.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                      | ✓   |
| --- | -------------------------- | ------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-4-diagnosis-coding`, still no links. | ☐   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                    | ☐   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                           | ☐   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                     | ☐   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.               | ☐   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.            | ☐   |
| 7.7 | Cold clone                 | Clone, install, one command, the list renders. No credential. | ☐   |

**Blocking:** all seven.

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

## Explicitly not validated here

- Whether anything links to the waiting room — Phase 9.
- Whether unmoderated text can reach it — Phase 11, which decision D5 ties to
  Phase 12.
- Print layout, design and the axe audit — Phases 8 and 10.
- Offset pagination's cost at scale — Phase 12 is the first phase with a reason
  to measure it.
