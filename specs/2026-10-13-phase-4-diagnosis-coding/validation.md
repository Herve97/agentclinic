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
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                      | ☑   |
| 1.2 | `npm run build`          | Exits 0. Still three routes, `/cases/[id]` still dynamic. | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every code in §3 has a passing named test.       | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                  | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — still two specs.                  | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                  | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                  | ☑   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.    | ☑   |

**Blocking:** all eight. Row 1.8 is decision D6: the code is derived, not
stored.

**Evidence**, 2026-10-13, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` → no output, exit 0.
- 1.2 `npm run build` → exit 0, route table `○ /`, `○ /_not-found`,
  `ƒ /cases/[id]`, `○ /intake`. Three routes, unchanged.
- 1.3 `npm run test` → `Test Files 4 passed (4)`, `Tests 81 passed (81)` — the
  twenty-four of §3 on top of Phase 3's thirty, Phase 2's twenty-six and the
  Phase 0 smoke test.
- 1.4 and 1.6 `npm run verify:all` → exit 0, ending `2 passed (56.5s)`.
- 1.7 `npx prettier --check .` → `All matched files use Prettier code style!`
- 1.8 No migration was generated. `drizzle/meta/_journal.json` still lists
  exactly `0000_create_cases` and `0001_add_intake_fields`, and
  `git diff phase-3-chart-note -- drizzle/ src/db/` is empty. The code is
  derived on read, which is decision D6.

---

## 2. The table

| #   | Check              | Expected                                                                        | ✓   |
| --- | ------------------ | ------------------------------------------------------------------------------- | --- |
| 2.1 | Twenty codes       | `ACDI-01` to `ACDI-20`, no gap, no duplicate.                                   | ☑   |
| 2.2 | Four groups        | Five codes per group, in the order of decision D3.                              | ☑   |
| 2.3 | Rubrics            | Every code has a non-empty rubric in coding-manual register.                    | ☑   |
| 2.4 | Descriptions       | Every code has the index's own definition, written to a coder.                  | ☑   |
| 2.5 | Citation           | The index is named with its edition and stated to be maintained by this clinic. | ☑   |
| 2.6 | In-repo and static | A plain TypeScript module. No fetch, no database, no generation.                | ☑   |

**Blocking:** all six.

**Evidence**, 2026-10-13, from `src/domain/diagnosis.ts`:

- 2.1 Twenty entries, `ACDI-01` through `ACDI-20`. Asserted in §3 row 3.23
  against the literal expected sequence, so a gap, a duplicate or a reorder
  fails the suite rather than being spotted by eye.
- 2.2 Five per group in the order of decision D3: `01`–`05` instruction
  deficit, `06`–`10` moderate instability, `11`–`15` marked instability,
  `16`–`20` unclassified.
- 2.3 and 2.4 Every entry carries a rubric and a description; row 3.23 asserts
  both are non-empty and that each description ends in a full stop. The rubrics
  are noun phrases with qualifiers ("Requirement instability, marked,
  subacute"), and the descriptions are written to a coder, not to a patient —
  "Code here in preference to ACDI-01 where the patient continued work across
  sessions and no clarification was offered."
- 2.5 `indexCitation` reads "Coded under the AgenticClinic Diagnostic Index,
  second edition. The index is maintained by this clinic and has no equivalence
  to any external classification." Row 3.23 asserts the "maintained by this
  clinic" clause is present, so deleting it fails the suite.
- 2.6 A plain TypeScript module: one `as const` array, two `Record` lookups and
  one function. No `fetch`, no import of `@/db`, no generation.

---

## 3. Every code is reachable and tested

**One named test per row.** A count of passing tests is the evidence.

| #    | Code         | Produced by                                                               | ✓   |
| ---- | ------------ | ------------------------------------------------------------------------- | --- |
| 3.1  | `ACDI-01`    | burden none, acute, not established                                       | ☑   |
| 3.2  | `ACDI-02`    | burden none, subacute, not established                                    | ☑   |
| 3.3  | `ACDI-03`    | burden none, chronic, not established                                     | ☑   |
| 3.4  | `ACDI-04`    | burden none, course not determinable, not established                     | ☑   |
| 3.5  | `ACDI-05`    | burden none, established                                                  | ☑   |
| 3.6  | `ACDI-06`    | burden moderate, acute, not established                                   | ☑   |
| 3.7  | `ACDI-07`    | burden moderate, subacute, not established                                | ☑   |
| 3.8  | `ACDI-08`    | burden moderate, chronic, not established                                 | ☑   |
| 3.9  | `ACDI-09`    | burden moderate, course not determinable, not established                 | ☑   |
| 3.10 | `ACDI-10`    | burden moderate, established                                              | ☑   |
| 3.11 | `ACDI-11`    | burden marked, acute, not established                                     | ☑   |
| 3.12 | `ACDI-12`    | burden marked, subacute, not established                                  | ☑   |
| 3.13 | `ACDI-13`    | burden marked, chronic, not established                                   | ☑   |
| 3.14 | `ACDI-14`    | burden marked, course not determinable, not established                   | ☑   |
| 3.15 | `ACDI-15`    | burden marked, established                                                | ☑   |
| 3.16 | `ACDI-16`    | burden not determinable, acute, not established                           | ☑   |
| 3.17 | `ACDI-17`    | burden not determinable, subacute, not established                        | ☑   |
| 3.18 | `ACDI-18`    | burden not determinable, chronic, not established                         | ☑   |
| 3.19 | `ACDI-19`    | burden not determinable, course not determinable                          | ☑   |
| 3.20 | `ACDI-20`    | burden not determinable, established                                      | ☑   |
| 3.21 | Totality     | All 64 combinations return a code. None returns `undefined`.              | ☑   |
| 3.22 | Reachability | The codes returned across the matrix are exactly the twenty in the table. | ☑   |
| 3.23 | Integrity    | Codes unique; every rubric and description non-empty.                     | ☑   |
| 3.24 | Purity       | No test imports the database or a renderer.                               | ☑   |

**Blocking:** all twenty-four. Row 3.22 is the one that catches a code orphaned
by a rule change.

**Evidence**, 2026-10-13: `npx vitest run src/domain/diagnosis.test.ts` reports
24 passing tests whose names begin `3.1` through `3.24`, one per row above, with
no number missing and none repeated. Each of the twenty code tests names the
combination that produces the code, so the test name is the rule.

Row 3.21 walks all sixty-four combinations of the three unions and asserts each
returns an entry whose code matches `/^ACDI-\d{2}$/`, that none is `undefined`,
and that the walk really covered sixty-four — a silently shortened loop fails.

Row 3.22 collects the codes reached across the matrix into a set and compares it
to the table's twenty. An orphaned code fails here, which is the row that
protects the table against a future rule change.

Row 3.24 is structural: the import list is `vitest`, `./case-note` and
`./diagnosis`. Nothing in the file can reach the database or a renderer.

The matrix is also exhaustive at compile time, not only under test:
`codeByBurdenAndCourse` is typed `Record<RevisionBurden, Record<Chronicity,
DiagnosisCode>>` and `establishedCodeByBurden` is `Record<RevisionBurden,
DiagnosisCode>`, both over the unions Phase 3 exports, and `assignDiagnosis` has
no default branch. A fifth chronicity or a fifth burden breaks the build here.

---

## 4. The code reaches the case file

| #   | Check              | Expected                                                                        | ✓   |
| --- | ------------------ | ------------------------------------------------------------------------------- | --- |
| 4.1 | Seven sections     | `Diagnosis` between `Assessment` and `Plan` (decision D7).                      | ☑   |
| 4.2 | Code and rubric    | Both render, the code first.                                                    | ☑   |
| 4.3 | Description        | The index's own definition renders with the code.                               | ☑   |
| 4.4 | Citation           | Renders in the `Diagnosis` section.                                             | ☑   |
| 4.5 | Matches the note   | The code's group agrees with the revision burden the history states.            | ☑   |
| 4.6 | A Phase 1 row      | `/cases/1` gets a code from the `ACDI-16` to `20` group. No empty section.      | ☑   |
| 4.7 | One code           | Exactly one code on the page. No differential, no secondary code (roadmap Out). | ☑   |
| 4.8 | Asserted by a spec | The code is asserted in `e2e/intake.spec.ts`, scoped and exact.                 | ☑   |
| 4.9 | No console errors  | A real browser on `/cases/[id]` reports no errors and no warnings.              | ☑   |

**Blocking:** all nine.

**Evidence**, 2026-10-13, three case files read in a browser:

- 4.1 `main h2` in DOM order is
  `["Presenting complaint", "History", "Assessment", "Diagnosis", "Plan", "Follow-up"]`.
  Asserted in `e2e/intake.spec.ts` with `toHaveText`, so a reorder fails.
- 4.2 and 4.3 For a submission with no revisions, an acute course and no prior
  episodes, the section renders `Code ACDI-01`, `Rubric Instruction deficit,
acute`, then the index's description verbatim.
- 4.4 The citation renders beneath the description on every case file.
- 4.5 For a submission of 31 revisions over longer than a month with 7 prior
  episodes, the history reads "Requirement revised 31 times over a period
  longer than one month." and the code is `ACDI-15`, the marked group's
  established-pattern code. The note and the code agree because both read the
  same derived values, which is decision D1.
- 4.6 `/cases/1`, a Phase 1 row with five nulls, is coded `ACDI-19`,
  "Unclassified presentation, record incomplete", whose description covers
  "records opened before the present intake form was adopted". That is literally
  what the row is. No empty section, HTTP 200.
- 4.7 `(await page.locator("main").innerText()).match(/ACDI-\d\d/g)` returns
  exactly one match per page. No differential, no secondary code.
- 4.8 Asserted in `e2e/intake.spec.ts`, scoped to the `<dd>` beside the `Code`
  term and exact. Proved to bite: changing the expectation to `ACDI-13` failed
  with `unexpected value "ACDI-12"` rather than passing — the Phase 3 trap,
  checked for rather than assumed.
- 4.9 A `console` and `pageerror` listener across three case files collected
  `[]`, asserted with `expect(messages).toEqual([])`.

---

## 5. The fictionality is unmistakable

The second half of the roadmap's done-when condition, and a
[mission.md](../mission.md) non-goal.

| #   | Check               | Expected                                                                                   | ✓   |
| --- | ------------------- | ------------------------------------------------------------------------------------------ | --- |
| 5.1 | No real code reused | No ICD-10, DSM-5 or SNOMED code appears anywhere in `src/`.                                | ☑   |
| 5.2 | No real format      | No code of the form `F32.1`, `296.33` or similar. The scheme's shape is its own.           | ☑   |
| 5.3 | No real condition   | No rubric or description names a real diagnosis, treatment or medication.                  | ☑   |
| 5.4 | Provenance on page  | A reader of one case file learns the index is the clinic's own, from the page itself.      | ☑   |
| 5.5 | Register holds      | The citation and all forty authored strings pass the mission's swap test.                  | ☑   |
| 5.6 | No wink             | No exclamation mark, no aside, nothing telling the reader the scheme is invented.          | ☑   |
| 5.7 | Stranger test       | One case file still conveys the premise, and the code strengthens rather than explains it. | ☑   |

**Blocking:** all seven. If 5.3 is arguable for any rubric, the rubric is
rewritten rather than defended.

**Evidence**, 2026-10-13. The second half of the roadmap's condition.

- 5.1 and 5.2 `grep -rnE "\b[A-Z][0-9]{2}(\.[0-9]+)?\b|\b[0-9]{3}\.[0-9]{2}\b" src/`
  excluding `ACDI` returns nothing: no code of the ICD-10 letter-plus-digits
  shape and none of the DSM-5 three-digit decimal shape appears anywhere.
  `grep -rniE "icd|dsm|snomed" src/` returns nothing — no real classification is
  named, cited, or imitated.
- 5.3 `grep -rniE "depress|anxiet|psychosis|schizo|bipolar|medicat|dose|mg\b|antidepress|SSRI" src/`
  returns nothing. No rubric or description names a real diagnosis, treatment or
  medication. Every rubric is about instruction, requirement, revision or
  record-keeping.
- 5.4 A reader of one case file learns the provenance from the page: the
  citation names the index and its edition and states that it is maintained by
  this clinic with no equivalence to any external classification. A clinic that
  maintains its own diagnostic index is self-evidently not quoting ICD or DSM,
  and the code carries the index's name inside it.
- 5.5 Swap test applied to the citation and all forty authored strings. Each
  survives substituting a different subject matter, because each is written as a
  coding manual writes: an applicability clause, a cross-reference, or a
  utilisation note.
- 5.6 `grep -nE '!' src/domain/diagnosis.ts` returns nothing — no exclamation
  mark anywhere in the file, including in code. `grep -niE "\byou\b|\byour\b"`
  returns nothing. No line tells the reader the scheme is invented; the citation
  states what the index is and stops.
- 5.7 Stranger test, reread with the Diagnosis section in place. The code
  strengthens the premise rather than explaining it: a numbered rubric reading
  "Requirement instability, marked, with established pattern" with a utilisation
  note that it is the index's most frequently assigned code does more work than
  any sentence about the clinic could. The nearest thing to a wink is that
  utilisation note, and it stays because coding manuals do carry utilisation
  statistics — it is a fact about the index, not a joke about the joke.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                   | Owned by | ✓   |
| ---- | ---------------------------------------------------------------- | -------- | --- |
| 6.1  | A second code, a differential, or a "rule out" line              | Never    | ☑   |
| 6.2  | Any severity score, scale, or numeric rating of the patient      | Never    | ☑   |
| 6.3  | A stored code: a column, a migration, a schema change            | Phase 8  | ☑   |
| 6.4  | Any change to `src/app/intake/`, `src/domain/case.ts`, `src/db/` | Phase 2  | ☑   |
| 6.5  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`         | Phase 9  | ☑   |
| 6.6  | Any new route                                                    | Phase 5+ | ☑   |
| 6.7  | `@media print` or any print stylesheet                           | Phase 8  | ☑   |
| 6.8  | Custom colours, fonts, spacing scale, component classes          | Phase 10 | ☑   |
| 6.9  | A new dependency, or anything from the rejected list             | Never    | ☑   |
| 6.10 | An LLM call, or a generated rubric or description                | Never    | ☑   |

**Blocking:** all ten.

**Evidence**, 2026-10-13:

- 6.1 One code per page, confirmed by the regex match in §4 row 4.7. No
  "rule out", no secondary code, no comorbidity anywhere in `src/`.
- 6.2 `grep -rniE "severity|score|scale of|rating" src/` returns nothing. The
  qualifiers "moderate" and "marked" describe the recorded revision burden —
  what the operator did — which is decision D5.
- 6.3 `git diff phase-3-chart-note -- drizzle/ src/db/` → no output. No column,
  no migration, no schema change.
- 6.4 `git diff phase-3-chart-note -- src/app/intake/ src/domain/case.ts
src/db/` → no output.
- 6.5 `git diff phase-3-chart-note -- src/app/page.tsx src/app/layout.tsx` → no
  output.
- 6.6 `find src/app -name page.tsx` still returns three files.
- 6.7 `grep -rniE "@media print|window\.print" src/` returns nothing.
- 6.8 The Diagnosis section uses the same utilities as the rest of the page:
  margins, a fixed-width label column, `text-sm`. No custom colour, font,
  spacing scale or component class.
- 6.9 `package.json` is byte-identical to Phase 3's. No dependency added.
- 6.10 Every rubric, description and the citation is a string literal in
  `src/domain/diagnosis.ts`, committed and reviewable in the diff. No network
  call and no model at render time.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                       | ✓   |
| --- | -------------------------- | -------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-3-chart-note`, still no links.        | ☑   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                     | ☑   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                            | ☑   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                      | ☑   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                | ☑   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.             | ☑   |
| 7.7 | Cold clone                 | Clone, install, one command, a coded case file. No credential. | ☑   |

**Blocking:** all seven.

**Evidence**, 2026-10-13:

- 7.1 `git diff phase-3-chart-note -- src/app/page.tsx` → no output.
- 7.2 `next.config.ts` still sets `agentRules: false`; no `AGENTS.md` exists.
- 7.3 `src/app/layout.tsx` is unchanged, `<body suppressHydrationWarning>`
  included.
- 7.4 `tsconfig.json` still has `"strict": true`.
- 7.5 `grep -E '"[~^]' package.json` → no output.
- 7.6 `git status --porcelain` → no output after dev, build, test and e2e.
- 7.7 Cold clone outside the repository: `git clone`, `npm ci`,
  `npm run test:e2e`. No `.env*` and no `local.db` in the clone; `predev`
  created and migrated the database unattended and both specs passed —
  `2 passed (33.8s)`. The round-trip spec asserts `ACDI-12` against the
  rendered page, so a coded case file rendered from a database seconds old,
  with no credential and no manual step.

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

**Status**, 2026-10-13: gates 1 to 5 are met, with the evidence recorded under
each section above.

Gate 6 is open and not this phase's to close. `origin/main` is at `5aa2241`,
which contains none of Phases 1 to 3, so this pull request stacks three deep:
Phase 1, Phase 2, Phase 3, then this.

### Recorded divergences from the spec as written

Three, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **Phase 3's requirements were amended twice by this phase.** Its decision D1
   now records that the section list is seven rather than six, and its open
   question about where the code reads its inputs is marked answered with the
   reasoning in decision D1 here. Amending the earlier phase's spec rather than
   only the current one is deliberate: D1's table is where a reader looks for
   the shape of the page, and a reader who finds six sections there and seven on
   the page has found a defect in the specs.
2. **A temporary third Playwright spec gathered the browser evidence for §4 and
   §5, and was deleted rather than committed.** Row 1.5 requires exactly two
   specs. What it proved is recorded above.
3. **No pull request was opened, though plan step 5.7 calls for one.** The
   branch is pushed as `origin/phase-4-diagnosis-coding`, but no GitHub client
   or credential exists in this environment — `gh` is not installed and no token
   is set. As in Phase 0's step 11.5, Phase 2's 6.7 and Phase 3's 5.7, the step
   is recorded rather than silently skipped; the pull request is opened by hand
   against `main`, stating the Phase 1 to Phase 4 merge order.

Plan step 4.5 asked for a deliberate-failure check. It was arranged on the new
code assertion: expecting `ACDI-13` failed with `unexpected value "ACDI-12"`.
The assertion was written scoped to the `<dd>` and exact from the start, because
Phase 3 had already recorded what happens when it is not — which is the
amendment trail doing its job rather than the trap being sprung twice.

## Explicitly not validated here

- Whether a case appears in any list — Phase 5.
- Whether the code survives a discharge — Phase 8, per decision D6.
- Print layout and design — Phases 8 and 10.
- Abuse, anonymisation and the enumerable-id problem — Phase 11.
- Anything about production — Phase 12.
