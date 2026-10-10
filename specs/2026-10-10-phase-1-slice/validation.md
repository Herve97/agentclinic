# Phase 1 — Thinnest end-to-end slice: Validation

How to know Phase 1 succeeded and can be merged.

The roadmap's done-when condition is: **a Playwright spec submits the form and
asserts the case number appears on the resulting page.** Everything below
either checks that condition or checks a decision recorded in
[requirements.md](./requirements.md).

Every row needs evidence — a command's actual output, a file's actual
contents. "Looks right" is not evidence.

**Carried forward from Phase 0:** a clean `curl` is not evidence about the
browser console. `curl` does not run React. Any row below that mentions the
console requires a real browser.

---

## 1. The commands

| #   | Command                    | Expected                                                                | ✓   |
| --- | -------------------------- | ----------------------------------------------------------------------- | --- |
| 1.1 | `npm run lint`             | Exits 0, zero errors, zero warnings.                                    | ☑   |
| 1.2 | `npm run build`            | Exits 0. `/cases/[id]` listed as dynamic, not static.                   | ☑   |
| 1.3 | `npm run test`             | Exits 0. The Phase 0 smoke test plus the new schema specs, all passing. | ☑   |
| 1.4 | `npm run verify`           | Exits 0. Still means lint → build → test, unchanged from Phase 0.       | ☑   |
| 1.5 | `npm run test:e2e`         | Exits 0. **1 passed** — the intake round trip.                          | ☑   |
| 1.6 | `npm run verify:all`       | Exits 0. Chains `verify` and `test:e2e`.                                | ☑   |
| 1.7 | `npx prettier --check .`   | Exits 0.                                                                | ☑   |
| 1.8 | `npm run db:migrate` twice | First run creates the table; second run is a clean no-op, not an error. | ☑   |

**Blocking:** all eight.

**Evidence**, 2026-10-10, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` → no output, exit 0.
- 1.2 `npm run build` → exit 0, and the route table reads
  `○ /`, `○ /_not-found`, `ƒ /cases/[id]`, `○ /intake`. The `ƒ` on
  `/cases/[id]` is the row's requirement: it renders on demand and did not
  reach the database at build time.
- 1.3 `npm run test` → `Test Files 2 passed (2)`, `Tests 6 passed (6)` —
  the Phase 0 smoke test plus five schema specs.
- 1.4 `npm run verify` → exit 0 from a deleted `local.db`.
- 1.5 `npm run test:e2e` → `1 passed`.
- 1.6 `npm run verify:all` → exit 0, lint → build → test → e2e.
- 1.7 `npx prettier --check .` → `All matched files use Prettier code style!`
- 1.8 `drizzle-kit migrate` twice in a row: the first created the table, the
  second printed `migrations applied successfully!` and changed nothing. A
  `pragma table_info(cases)` after both reads
  `id:INTEGER NOT NULL PK | complaint:TEXT NOT NULL | created_at:TEXT NOT NULL`.

---

## 2. The write path works

| #   | Check             | Expected                                                                                              | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------- | --- |
| 2.1 | Submit            | A valid complaint redirects to `/cases/[id]` with a real id in the URL.                               | ☑   |
| 2.2 | Round trip        | `/cases/[id]` renders the exact text that was typed, and the case number.                             | ☑   |
| 2.3 | Row count         | One submission inserts exactly one row. Two submissions insert two, with different ids.               | ☑   |
| 2.4 | `created_at`      | Populated by the database, not by application code, and non-null.                                     | ☑   |
| 2.5 | Empty complaint   | Re-renders `/intake` with a visible message. **No row is written** — confirmed by querying the table. | ☑   |
| 2.6 | Whitespace only   | `"   "` is rejected exactly as an empty string is (decision D5).                                      | ☑   |
| 2.7 | No console errors | A real browser, on `/intake` and on `/cases/[id]`, reports nothing in the console.                    | ☑   |

**Blocking:** all seven. Row 2.5 is the one that proves validation actually
guards the insert rather than merely rendering a message.

**Evidence:**

- 2.1 The Playwright spec asserts `toHaveURL(/\/cases\/\d+$/)` and passes.
  The dev server log for the same request reads
  `POST /intake 200` → `ƒ submitIntake({"error":null}, {}) in 116ms` →
  `GET /cases/5 200`.
- 2.2 `/cases/1` served
  `<h1 ...>Case 1</h1><p ...>Seeded probe complaint.</p>`, and on the cold
  clone the stored row read back as
  `My human asked me to fix it without saying what was broken.` — the exact
  text the spec typed.
- 2.3 Repeated runs produced `Case 1`, `Case 2` and `Case 5` across
  submissions, each a distinct autoincrement id. A `select count(*)` tracked
  the table growing by exactly one per valid submission.
- 2.4 `created_at` is `text ... default (current_timestamp) not null` in the
  generated SQL — the database supplies it, no application code does. A direct
  insert returned `created_at: "2026-10-10 18:19:03"`.
- 2.5 Proved with a throwaway Playwright spec, not by inspection.
  `select count(*)` read 3 before and 3 after two rejected submissions, so
  **no row was written**, while `p[role="alert"]` showed
  `A presenting complaint is required.` and the URL stayed `/intake`.
- 2.6 The same throwaway spec submitted `"   "` and got the identical
  rejection, and `src/domain/case.test.ts` covers it as a unit test.
- 2.7 **Checked in a real browser, not inferred from `curl`.** A throwaway
  spec attached `console` and `pageerror` listeners, submitted a complaint,
  followed the redirect and reloaded `/cases/[id]`; it collected errors _and_
  warnings and reported `PROBLEMS: []`. The reload matters because it is what
  exercises hydration on the case route.

**One observation worth recording.** The throwaway spec that proved 2.5 first
failed for a reason that was mine, not the app's: `getByRole("alert")` matches
both our `<p role="alert">` and Next's `__next-route-announcer__` div, which
also carries `role="alert"` — a strict-mode violation. Phase 2 will assert on
validation messages for six fields and will hit this immediately; the working
selector is `p[role="alert"]`.

---

## 3. The Playwright spec is real

| #   | Check               | Expected                                                                              | ✓   |
| --- | ------------------- | ------------------------------------------------------------------------------------- | --- |
| 3.1 | Spec exists         | `e2e/intake.spec.ts` navigates to `/intake`, fills, submits, asserts the case number. | ☑   |
| 3.2 | Deliberate failure  | Altering the asserted text fails with a real assertion error, not a config error.     | ☑   |
| 3.3 | Restored            | After reverting, `npm run test:e2e` is green.                                         | ☑   |
| 3.4 | It drives a browser | The spec exercises the real form, not a fetch to the action.                          | ☑   |
| 3.5 | Done-when met       | This spec is the roadmap's done-when condition for Phase 1, and it passes.            | ☑   |

**Blocking:** all five. Row 3.2 is not skippable, for the reason Phase 0's
equivalent row was not.

**Evidence:**

- 3.1 `e2e/intake.spec.ts` navigates to `/intake`, fills the textarea by its
  label, clicks Submit, then asserts the URL matches `/cases/<digits>`, the
  single `<h1>` matches `/^Case \d+$/`, and the typed complaint is visible.
- 3.2 The asserted pattern was changed to `/^Dossier \d+$/`. The run failed
  with `expect(locator).toHaveText(expected) failed`,
  `Expected pattern: /^Dossier d+$/`, `Received string: "Case 2"`, and the
  resolved locator printed as the real `<h1>`. An assertion failure against a
  rendered page, not a config error.
- 3.3 Restored, and `npm run test:e2e` returned to `1 passed`.
- 3.4 It drives Chromium through the real form — it fills a `<textarea>` and
  clicks a `<button>`; it never calls the action directly.
- 3.5 This is the roadmap's done-when condition for Phase 1 and it passes,
  including from a cold database and a cold clone.

**A near-miss worth recording.** The first green run was misleading. Playwright's
default `expect` timeout is 5s, but Next compiles each route on demand in dev
and a cold compile of `/cases/[id]` measured **9.1s**. That first run passed
only because an earlier manual `curl` had already warmed the route; from a
clean start the same spec failed on `toHaveURL` while the page was still
compiling. The config now sets `expect.timeout` to 30s and the test timeout to
90s, with the measurement written next to them. The spec was then re-run from a
deleted database and a fresh clone to confirm it passes cold.

---

## 4. Bad input to `/cases/[id]`

Decision D6.

| #   | Path            | Expected                   | ✓   |
| --- | --------------- | -------------------------- | --- |
| 4.1 | `/cases/abc`    | 404, not 500.              | ☑   |
| 4.2 | `/cases/-1`     | 404, not 500.              | ☑   |
| 4.3 | `/cases/999999` | 404, not an empty 200.     | ☑   |
| 4.4 | `/cases/1.5`    | 404, not a coerced lookup. | ☑   |

**Blocking:** all four. An empty 200 for a nonexistent case is the specific
failure this section exists to catch.

**Evidence**, measured with `curl -o /dev/null -w '%{http_code}'`:

| Path            | Status |
| --------------- | ------ |
| `/cases/1`      | 200    |
| `/cases/abc`    | 404    |
| `/cases/-1`     | 404    |
| `/cases/999999` | 404    |
| `/cases/1.5`    | 404    |
| `/cases/0`      | 404    |

`/cases/0` was not required by the spec and is included because `Number("0")`
is falsy and would be an easy accident. The guard is a
`/^[1-9][0-9]*$/` test before the lookup rather than `Number()`, because
`Number` would happily coerce `"1.5"` and `" 1 "`.

**Separately observed, and deliberately not changed:** against an _unmigrated_
database, `/cases/1` returns **500**, not 404. The table does not exist, which
is a server misconfiguration rather than a client error, and reporting it as
404 would hide a broken deployment. Decision D2 makes it unreachable in normal
use by migrating before `dev` and `build`; it was only observable here by
deleting `local.db` and starting Next directly. Worth knowing before Phase 12
runs migrations in CI.

---

## 5. Version pinning

| #   | Check                  | Expected                                                 | ✓   |
| --- | ---------------------- | -------------------------------------------------------- | --- |
| 5.1 | No ranges              | `grep -E '"[~^]' package.json` returns nothing.          | ☑   |
| 5.2 | Resolved, not recalled | Each version below came from `npm view <pkg> version`.   | ☑   |
| 5.3 | Lockfile settled       | `npm install` on a fresh clone leaves it byte-identical. | ☑   |
| 5.4 | Table filled in        | No blank rows.                                           | ☑   |

### Resolved versions

Fill in during plan group 1. **Leave no row blank at merge time.**

| Package            | Resolved version |
| ------------------ | ---------------- |
| `@libsql/client`   | 0.18.0           |
| `drizzle-orm`      | 0.45.4           |
| `drizzle-kit`      | 0.31.11          |
| `zod`              | 4.6.5            |
| `@playwright/test` | 1.64.0           |

Amendments made: one, to `roadmap.md` rather than to this phase's spec.

Phase 11's roadmap entry said cases "stay unlisted from the waiting room until
cleared", which addresses listing but not direct URL access. Decision D3 pins
`cases.id` to a sequential integer, which makes every case enumerable by
editing the URL, and D3 explicitly hands that problem to Phase 11. Phase 11 now
names it, so the obligation is recorded where the work will happen instead of
only in a decision a future reader might not reach.

No version resolved to anything that contradicted `requirements.md`: the
risk table anticipated a possible `@libsql/client` native-module failure on
Windows and a possible `drizzle-orm`/`drizzle-kit` mismatch, and neither
occurred.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                                  | Owned by     | ✓   |
| ---- | ------------------------------------------------------------------------------- | ------------ | --- |
| 6.1  | Any link on `/`, or any change to `src/app/page.tsx` at all                     | Phase 9      | ☑   |
| 6.2  | Any route other than `/`, `/intake`, `/cases/[id]`                              | Phases 2–9   | ☑   |
| 6.3  | A case index or listing of any kind                                             | Phase 5      | ☑   |
| 6.4  | Diagnosis codes                                                                 | Phase 4      | ☑   |
| 6.5  | Validation beyond non-empty — no length cap, no content rules, no rate limiting | Phases 2, 11 | ☑   |
| 6.6  | A chart-note layout on `/cases/[id]` — header block, history, assessment, plan  | Phase 3      | ☑   |
| 6.7  | Design work: custom colours, fonts, spacing scale, or component classes         | Phase 10     | ☑   |
| 6.8  | Anonymisation                                                                   | Phase 11     | ☑   |
| 6.9  | Any CI workflow                                                                 | Phase 12     | ☑   |
| 6.10 | Anything from the rejected list in [tech-stack.md](../tech-stack.md)            | Never        | ☑   |
| 6.11 | A tracked `.db` file, `.env` file, or Playwright report                         | Never        | ☑   |
| 6.12 | `src/content/` created empty                                                    | Phase 6      | ☑   |

**Blocking:** all twelve. Row 6.1 is the hard stop that keeps Phase 9 intact,
and the cheapest way to check it is `git diff main -- src/app/page.tsx`
returning nothing.

**Evidence:**

- 6.1 `git diff main -- src/app/page.tsx src/app/layout.tsx` returns nothing.
  `/` is byte-identical to `main` and still links nowhere.
- 6.2 The build's route table lists exactly `/`, `/intake`, `/cases/[id]`
  and Next's built-in `/_not-found`.
- 6.3 No index route and no listing query exists; the only read is a
  single-row lookup by id.
- 6.4–6.6, 6.8 No diagnosis code, no length cap or content rule, no
  chart-note sections, no anonymisation. `/cases/[id]` is an `<h1>` and one
  `<p>`.
- 6.7 No `tailwind.config`, and `src/app/globals.css` is still the single
  line `@import "tailwindcss";`. The classes added are layout and legibility
  only — `border`, `p-2`, `flex`, `gap-3`, `mt-8`.
- 6.9 No `.github/` directory.
- 6.10 A grep of `package.json` for the rejected list —
  `modelcontextprotocol`, `next-auth`, `clerk`, `zustand`, `redux`,
  `react-query`, `shadcn`, `@mui`, `ai` — returns nothing.
- 6.11 `git ls-files` matches no `.db`, no `.env*`, and no
  `playwright-report` or `test-results` path.
- 6.12 `src/content/` does not exist.

---

## 7. Carried-over constraints

| #   | Check                       | Expected                                                 | ✓   |
| --- | --------------------------- | -------------------------------------------------------- | --- |
| 7.1 | `/` unchanged               | Still the Phase 0 home page, still no links.             | ☑   |
| 7.2 | `agentRules: false`         | Still in `next.config.ts`; no `AGENTS.md` reappeared.    | ☑   |
| 7.3 | `suppressHydrationWarning`  | Still on `<body>`, with its comment intact.              | ☑   |
| 7.4 | `strict: true`              | Still in `tsconfig.json`.                                | ☑   |
| 7.5 | No artefacts tracked        | `git status` clean after dev, build, test, and e2e runs. | ☑   |
| 7.6 | `src/content/` still absent | Phase 6 creates it.                                      | ☑   |

**Blocking:** all six.

**Evidence:**

- 7.1 As row 6.1: `/` is unchanged from `main`.
- 7.2 `agentRules: false` is still in `next.config.ts`, and no `AGENTS.md`
  appeared in `git status` after repeated dev runs.
- 7.3 `suppressHydrationWarning` is still on `<body>` with its comment, and
  the console probe for row 2.7 reported no hydration warning after a reload.
- 7.4 `"strict": true` is still in `tsconfig.json`; `next build` typechecks
  the new files under it.
- 7.5 `git status --porcelain` is empty after `verify:all` in this tree, and
  empty in the cold clone after `npm install` plus a full e2e run.
- 7.6 `src/content/` is still absent.

---

## 8. Cold clone

Decision D1 and D2. The booth constraint still applies.

| #   | Check                  | Expected                                                                             | ✓   |
| --- | ---------------------- | ------------------------------------------------------------------------------------ | --- |
| 8.1 | Steps to a running `/` | `git clone` → `npm install` → `npm run dev`. Still three commands.                   | ☑   |
| 8.2 | No credentials         | No `.env` file exists and none is needed. `DATABASE_URL` is unset and the app works. | ☑   |
| 8.3 | `/intake` works        | On a fresh clone, submitting a complaint succeeds without a hand-run migration.      | ☑   |
| 8.4 | `/` with no database   | `/` renders even with `local.db` deleted. It is static and touches nothing.          | ☑   |
| 8.5 | README sufficiency     | A reader using only the README gets to a submitted complaint.                        | ☑   |

### Recorded run

| Measure                                 | Value                                                            |
| --------------------------------------- | ---------------------------------------------------------------- |
| Commands from clone to a submitted case | 3 (`git clone`, `npm install`, `npm run dev`), plus `cd`         |
| Elapsed time, `npm install`             | 179s                                                             |
| Elapsed time, clone → `/` serving       | 203s (clone 1s + install 179s + migrate and dev to HTTP 200 23s) |
| Credentials required                    | 0 (measured — `DATABASE_URL` unset, no `.env`)                   |
| Hand-run migrations required            | 0 (measured — `predev` applied them)                             |

**Blocking:** all five rows. Row 8.3 is the point of decision D2.

**Evidence.** Cloned to a scratch directory outside the project, with
`DATABASE_URL` unset and no `.env` present.

- 8.1 `git clone` → `npm install` → `npm run dev`, and `/` returned 200
  after 23s. Still three commands.
- 8.2 `ls -a` found no `.env*` and no `.db` in the clone, and
  `DATABASE_URL` printed as unset. The app ran anyway.
- 8.3 **The point of D2.** With `local.db` deleted, `npm run test:e2e` on
  the fresh clone passed in 37s, and reading the clone's database afterwards
  returned one row: `{"id": 1, "complaint": "My human asked me to fix it
without saying what was broken."}`. No migration was run by hand — the dev
  server's `predev` applied it, which the clone's log shows above the Next
  banner.
- 8.4 With `local.db` deleted and Next started directly so that `predev`
  was bypassed, `/` still returned 200 and still rendered `AgenticClinic`.
  It is static and reads nothing. (`/cases/1` returns 500 in that state — see
  the note in section 4.)
- 8.5 The README's setup block is the three commands that were run, and its
  `playwright install` line is marked as needed only for the e2e spec.
- `npm install` left `package-lock.json` byte-identical in the clone, so
  row 5.3 is evidenced here too.

---

## Merge gate

Phase 1 can merge when:

1. Every blocking row above is ticked with evidence.
2. The resolved-versions table has no blank rows.
3. The recorded-run table has measured values.
4. `npm run verify` passes from a clean checkout, and `npm run test:e2e`
   passes after a `playwright install`.
5. Section 6 is fully ticked — in particular, `/` is byte-identical to `main`.
6. The Playwright spec, which is the roadmap's done-when condition, passes.

## Explicitly not validated here

- Whether the intake form asks the right questions — Phase 2.
- Whether a case file reads as a clinical document — Phase 3. This phase
  renders plain text and that is correct.
- Visual design, print layout, accessibility beyond semantic HTML — Phase 10.
- Abuse, length caps, rate limiting, and the enumerable-id problem recorded in
  decision D3 — Phase 11.
- Anything about production or Turso — Phase 12.
