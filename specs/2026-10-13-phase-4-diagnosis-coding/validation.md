# Phase 4 — Diagnosis coding: Validation

How to know Phase 4 succeeded and can be merged.

The roadmap's done-when condition has two halves: **the assignment function is
unit-tested across every code** (§3) and **the fictionality of the scheme is
unmistakable on the page** (§5).

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1); a
`"use server"` module may only export async functions (Phase 2); and a value
assertion against a labelled block must be scoped to the `<dd>` and exact, or it
passes against the label (Phase 3).

---

## 1. The commands

| #   | Command                  | Expected                                                  | ✓   |
| --- | ------------------------ | --------------------------------------------------------- | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                      | ☐   |
| 1.2 | `npm run build`          | Exits 0. Still three routes, `/cases/[id]` still dynamic. | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every code in §3 has a passing named test.       | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                  | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — still two specs.                  | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                  | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                  | ☐   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.    | ☐   |

**Blocking:** all eight. Row 1.8 is decision D6: the code is derived, not
stored.

---

## 2. The table

| #   | Check              | Expected                                                                        | ✓   |
| --- | ------------------ | ------------------------------------------------------------------------------- | --- |
| 2.1 | Twenty codes       | `ACDI-01` to `ACDI-20`, no gap, no duplicate.                                   | ☐   |
| 2.2 | Four groups        | Five codes per group, in the order of decision D3.                              | ☐   |
| 2.3 | Rubrics            | Every code has a non-empty rubric in coding-manual register.                    | ☐   |
| 2.4 | Descriptions       | Every code has the index's own definition, written to a coder.                  | ☐   |
| 2.5 | Citation           | The index is named with its edition and stated to be maintained by this clinic. | ☐   |
| 2.6 | In-repo and static | A plain TypeScript module. No fetch, no database, no generation.                | ☐   |

**Blocking:** all six.

---

## 3. Every code is reachable and tested

**One named test per row.** A count of passing tests is the evidence.

| #    | Code         | Produced by                                                               | ✓   |
| ---- | ------------ | ------------------------------------------------------------------------- | --- |
| 3.1  | `ACDI-01`    | burden none, acute, not established                                       | ☐   |
| 3.2  | `ACDI-02`    | burden none, subacute, not established                                    | ☐   |
| 3.3  | `ACDI-03`    | burden none, chronic, not established                                     | ☐   |
| 3.4  | `ACDI-04`    | burden none, course not determinable, not established                     | ☐   |
| 3.5  | `ACDI-05`    | burden none, established                                                  | ☐   |
| 3.6  | `ACDI-06`    | burden moderate, acute, not established                                   | ☐   |
| 3.7  | `ACDI-07`    | burden moderate, subacute, not established                                | ☐   |
| 3.8  | `ACDI-08`    | burden moderate, chronic, not established                                 | ☐   |
| 3.9  | `ACDI-09`    | burden moderate, course not determinable, not established                 | ☐   |
| 3.10 | `ACDI-10`    | burden moderate, established                                              | ☐   |
| 3.11 | `ACDI-11`    | burden marked, acute, not established                                     | ☐   |
| 3.12 | `ACDI-12`    | burden marked, subacute, not established                                  | ☐   |
| 3.13 | `ACDI-13`    | burden marked, chronic, not established                                   | ☐   |
| 3.14 | `ACDI-14`    | burden marked, course not determinable, not established                   | ☐   |
| 3.15 | `ACDI-15`    | burden marked, established                                                | ☐   |
| 3.16 | `ACDI-16`    | burden not determinable, acute, not established                           | ☐   |
| 3.17 | `ACDI-17`    | burden not determinable, subacute, not established                        | ☐   |
| 3.18 | `ACDI-18`    | burden not determinable, chronic, not established                         | ☐   |
| 3.19 | `ACDI-19`    | burden not determinable, course not determinable                          | ☐   |
| 3.20 | `ACDI-20`    | burden not determinable, established                                      | ☐   |
| 3.21 | Totality     | All 64 combinations return a code. None returns `undefined`.              | ☐   |
| 3.22 | Reachability | The codes returned across the matrix are exactly the twenty in the table. | ☐   |
| 3.23 | Integrity    | Codes unique; every rubric and description non-empty.                     | ☐   |
| 3.24 | Purity       | No test imports the database or a renderer.                               | ☐   |

**Blocking:** all twenty-four. Row 3.22 is the one that catches a code orphaned
by a rule change.

---

## 4. The code reaches the case file

| #   | Check              | Expected                                                                        | ✓   |
| --- | ------------------ | ------------------------------------------------------------------------------- | --- |
| 4.1 | Seven sections     | `Diagnosis` between `Assessment` and `Plan` (decision D7).                      | ☐   |
| 4.2 | Code and rubric    | Both render, the code first.                                                    | ☐   |
| 4.3 | Description        | The index's own definition renders with the code.                               | ☐   |
| 4.4 | Citation           | Renders in the `Diagnosis` section.                                             | ☐   |
| 4.5 | Matches the note   | The code's group agrees with the revision burden the history states.            | ☐   |
| 4.6 | A Phase 1 row      | `/cases/1` gets a code from the `ACDI-16` to `20` group. No empty section.      | ☐   |
| 4.7 | One code           | Exactly one code on the page. No differential, no secondary code (roadmap Out). | ☐   |
| 4.8 | Asserted by a spec | The code is asserted in `e2e/intake.spec.ts`, scoped and exact.                 | ☐   |
| 4.9 | No console errors  | A real browser on `/cases/[id]` reports no errors and no warnings.              | ☐   |

**Blocking:** all nine.

---

## 5. The fictionality is unmistakable

The second half of the roadmap's done-when condition, and a
[mission.md](../mission.md) non-goal.

| #   | Check               | Expected                                                                                   | ✓   |
| --- | ------------------- | ------------------------------------------------------------------------------------------ | --- |
| 5.1 | No real code reused | No ICD-10, DSM-5 or SNOMED code appears anywhere in `src/`.                                | ☐   |
| 5.2 | No real format      | No code of the form `F32.1`, `296.33` or similar. The scheme's shape is its own.           | ☐   |
| 5.3 | No real condition   | No rubric or description names a real diagnosis, treatment or medication.                  | ☐   |
| 5.4 | Provenance on page  | A reader of one case file learns the index is the clinic's own, from the page itself.      | ☐   |
| 5.5 | Register holds      | The citation and all forty authored strings pass the mission's swap test.                  | ☐   |
| 5.6 | No wink             | No exclamation mark, no aside, nothing telling the reader the scheme is invented.          | ☐   |
| 5.7 | Stranger test       | One case file still conveys the premise, and the code strengthens rather than explains it. | ☐   |

**Blocking:** all seven. If 5.3 is arguable for any rubric, the rubric is
rewritten rather than defended.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                   | Owned by | ✓   |
| ---- | ---------------------------------------------------------------- | -------- | --- |
| 6.1  | A second code, a differential, or a "rule out" line              | Never    | ☐   |
| 6.2  | Any severity score, scale, or numeric rating of the patient      | Never    | ☐   |
| 6.3  | A stored code: a column, a migration, a schema change            | Phase 8  | ☐   |
| 6.4  | Any change to `src/app/intake/`, `src/domain/case.ts`, `src/db/` | Phase 2  | ☐   |
| 6.5  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`         | Phase 9  | ☐   |
| 6.6  | Any new route                                                    | Phase 5+ | ☐   |
| 6.7  | `@media print` or any print stylesheet                           | Phase 8  | ☐   |
| 6.8  | Custom colours, fonts, spacing scale, component classes          | Phase 10 | ☐   |
| 6.9  | A new dependency, or anything from the rejected list             | Never    | ☐   |
| 6.10 | An LLM call, or a generated rubric or description                | Never    | ☐   |

**Blocking:** all ten.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                       | ✓   |
| --- | -------------------------- | -------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-3-chart-note`, still no links.        | ☐   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                     | ☐   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                            | ☐   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                      | ☐   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                | ☐   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.             | ☐   |
| 7.7 | Cold clone                 | Clone, install, one command, a coded case file. No credential. | ☐   |

**Blocking:** all seven.

---

## Merge gate

Phase 4 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all twenty codes, plus the four
   property rows.
3. Section 5 records the fictionality judgement, with the greps that back it.
4. `npm run verify:all` passes.
5. `/` and the whole write path are byte-identical to `phase-3-chart-note`.
6. **Phases 1, 2 and 3 have merged**, or this pull request is explicitly marked
   as stacked on them, in that order.

## Explicitly not validated here

- Whether a case appears in any list — Phase 5.
- Whether the code survives a discharge — Phase 8, per decision D6.
- Print layout and design — Phases 8 and 10.
- Abuse, anonymisation and the enumerable-id problem — Phase 11.
- Anything about production — Phase 12.
