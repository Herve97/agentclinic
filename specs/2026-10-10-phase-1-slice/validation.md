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
| 1.1 | `npm run lint`             | Exits 0, zero errors, zero warnings.                                    | ☐   |
| 1.2 | `npm run build`            | Exits 0. `/cases/[id]` listed as dynamic, not static.                   | ☐   |
| 1.3 | `npm run test`             | Exits 0. The Phase 0 smoke test plus the new schema specs, all passing. | ☐   |
| 1.4 | `npm run verify`           | Exits 0. Still means lint → build → test, unchanged from Phase 0.       | ☐   |
| 1.5 | `npm run test:e2e`         | Exits 0. **1 passed** — the intake round trip.                          | ☐   |
| 1.6 | `npm run verify:all`       | Exits 0. Chains `verify` and `test:e2e`.                                | ☐   |
| 1.7 | `npx prettier --check .`   | Exits 0.                                                                | ☐   |
| 1.8 | `npm run db:migrate` twice | First run creates the table; second run is a clean no-op, not an error. | ☐   |

**Blocking:** all eight.

---

## 2. The write path works

| #   | Check             | Expected                                                                                              | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------- | --- |
| 2.1 | Submit            | A valid complaint redirects to `/cases/[id]` with a real id in the URL.                               | ☐   |
| 2.2 | Round trip        | `/cases/[id]` renders the exact text that was typed, and the case number.                             | ☐   |
| 2.3 | Row count         | One submission inserts exactly one row. Two submissions insert two, with different ids.               | ☐   |
| 2.4 | `created_at`      | Populated by the database, not by application code, and non-null.                                     | ☐   |
| 2.5 | Empty complaint   | Re-renders `/intake` with a visible message. **No row is written** — confirmed by querying the table. | ☐   |
| 2.6 | Whitespace only   | `"   "` is rejected exactly as an empty string is (decision D5).                                      | ☐   |
| 2.7 | No console errors | A real browser, on `/intake` and on `/cases/[id]`, reports nothing in the console.                    | ☐   |

**Blocking:** all seven. Row 2.5 is the one that proves validation actually
guards the insert rather than merely rendering a message.

---

## 3. The Playwright spec is real

| #   | Check               | Expected                                                                              | ✓   |
| --- | ------------------- | ------------------------------------------------------------------------------------- | --- |
| 3.1 | Spec exists         | `e2e/intake.spec.ts` navigates to `/intake`, fills, submits, asserts the case number. | ☐   |
| 3.2 | Deliberate failure  | Altering the asserted text fails with a real assertion error, not a config error.     | ☐   |
| 3.3 | Restored            | After reverting, `npm run test:e2e` is green.                                         | ☐   |
| 3.4 | It drives a browser | The spec exercises the real form, not a fetch to the action.                          | ☐   |
| 3.5 | Done-when met       | This spec is the roadmap's done-when condition for Phase 1, and it passes.            | ☐   |

**Blocking:** all five. Row 3.2 is not skippable, for the reason Phase 0's
equivalent row was not.

---

## 4. Bad input to `/cases/[id]`

Decision D6.

| #   | Path            | Expected                   | ✓   |
| --- | --------------- | -------------------------- | --- |
| 4.1 | `/cases/abc`    | 404, not 500.              | ☐   |
| 4.2 | `/cases/-1`     | 404, not 500.              | ☐   |
| 4.3 | `/cases/999999` | 404, not an empty 200.     | ☐   |
| 4.4 | `/cases/1.5`    | 404, not a coerced lookup. | ☐   |

**Blocking:** all four. An empty 200 for a nonexistent case is the specific
failure this section exists to catch.

---

## 5. Version pinning

| #   | Check                  | Expected                                                 | ✓   |
| --- | ---------------------- | -------------------------------------------------------- | --- |
| 5.1 | No ranges              | `grep -E '"[~^]' package.json` returns nothing.          | ☐   |
| 5.2 | Resolved, not recalled | Each version below came from `npm view <pkg> version`.   | ☐   |
| 5.3 | Lockfile settled       | `npm install` on a fresh clone leaves it byte-identical. | ☐   |
| 5.4 | Table filled in        | No blank rows.                                           | ☐   |

### Resolved versions

Fill in during plan group 1. **Leave no row blank at merge time.**

| Package            | Resolved version |
| ------------------ | ---------------- |
| `@libsql/client`   |                  |
| `drizzle-orm`      |                  |
| `drizzle-kit`      |                  |
| `zod`              |                  |
| `@playwright/test` |                  |

Amendments made: _(none / list them)_

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                                  | Owned by     | ✓   |
| ---- | ------------------------------------------------------------------------------- | ------------ | --- |
| 6.1  | Any link on `/`, or any change to `src/app/page.tsx` at all                     | Phase 9      | ☐   |
| 6.2  | Any route other than `/`, `/intake`, `/cases/[id]`                              | Phases 2–9   | ☐   |
| 6.3  | A case index or listing of any kind                                             | Phase 5      | ☐   |
| 6.4  | Diagnosis codes                                                                 | Phase 4      | ☐   |
| 6.5  | Validation beyond non-empty — no length cap, no content rules, no rate limiting | Phases 2, 11 | ☐   |
| 6.6  | A chart-note layout on `/cases/[id]` — header block, history, assessment, plan  | Phase 3      | ☐   |
| 6.7  | Design work: custom colours, fonts, spacing scale, or component classes         | Phase 10     | ☐   |
| 6.8  | Anonymisation                                                                   | Phase 11     | ☐   |
| 6.9  | Any CI workflow                                                                 | Phase 12     | ☐   |
| 6.10 | Anything from the rejected list in [tech-stack.md](../tech-stack.md)            | Never        | ☐   |
| 6.11 | A tracked `.db` file, `.env` file, or Playwright report                         | Never        | ☐   |
| 6.12 | `src/content/` created empty                                                    | Phase 6      | ☐   |

**Blocking:** all twelve. Row 6.1 is the hard stop that keeps Phase 9 intact,
and the cheapest way to check it is `git diff main -- src/app/page.tsx`
returning nothing.

---

## 7. Carried-over constraints

| #   | Check                       | Expected                                                 | ✓   |
| --- | --------------------------- | -------------------------------------------------------- | --- |
| 7.1 | `/` unchanged               | Still the Phase 0 home page, still no links.             | ☐   |
| 7.2 | `agentRules: false`         | Still in `next.config.ts`; no `AGENTS.md` reappeared.    | ☐   |
| 7.3 | `suppressHydrationWarning`  | Still on `<body>`, with its comment intact.              | ☐   |
| 7.4 | `strict: true`              | Still in `tsconfig.json`.                                | ☐   |
| 7.5 | No artefacts tracked        | `git status` clean after dev, build, test, and e2e runs. | ☐   |
| 7.6 | `src/content/` still absent | Phase 6 creates it.                                      | ☐   |

**Blocking:** all six.

---

## 8. Cold clone

Decision D1 and D2. The booth constraint still applies.

| #   | Check                  | Expected                                                                             | ✓   |
| --- | ---------------------- | ------------------------------------------------------------------------------------ | --- |
| 8.1 | Steps to a running `/` | `git clone` → `npm install` → `npm run dev`. Still three commands.                   | ☐   |
| 8.2 | No credentials         | No `.env` file exists and none is needed. `DATABASE_URL` is unset and the app works. | ☐   |
| 8.3 | `/intake` works        | On a fresh clone, submitting a complaint succeeds without a hand-run migration.      | ☐   |
| 8.4 | `/` with no database   | `/` renders even with `local.db` deleted. It is static and touches nothing.          | ☐   |
| 8.5 | README sufficiency     | A reader using only the README gets to a submitted complaint.                        | ☐   |

### Recorded run

| Measure                                 | Value        |
| --------------------------------------- | ------------ |
| Commands from clone to a submitted case |              |
| Elapsed time, `npm install`             |              |
| Credentials required                    | 0 (expected) |
| Hand-run migrations required            | 0 (expected) |

**Blocking:** all five rows. Row 8.3 is the point of decision D2.

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
