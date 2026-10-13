# Phase 3 — The case file as a chart note: Validation

How to know Phase 3 succeeded and can be merged.

The roadmap's done-when condition is a judgement: **a stranger reading one case
file gets the premise with no other context.** Section 5 turns that into a test
with a stated failure condition. Sections 3 and 4 check the machinery that makes
it possible.

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1);
and a `"use server"` module may only export async functions (Phase 2).

---

## 1. The commands

| #   | Command                  | Expected                                                  | ✓   |
| --- | ------------------------ | --------------------------------------------------------- | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                      | ☑   |
| 1.2 | `npm run build`          | Exits 0. `/cases/[id]` still dynamic, still three routes. | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every branch in §3 has a passing test.           | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                  | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — still two specs, both updated.    | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                  | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                  | ☑   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.    | ☑   |

**Blocking:** all eight. Row 1.8 is the check that this phase only read.

**Evidence**, 2026-10-13, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` → no output, exit 0.
- 1.2 `npm run build` → exit 0, route table `○ /`, `○ /_not-found`,
  `ƒ /cases/[id]`, `○ /intake`. Three routes, unchanged, and the case file is
  still rendered on demand.
- 1.3 `npm run test` → `Test Files 3 passed (3)`, `Tests 57 passed (57)` — the
  thirty branch tests of §3, Phase 2's twenty-six, and the Phase 0 smoke test.
- 1.4 and 1.6 `npm run verify:all` → exit 0, ending `2 passed (13.0s)`.
- 1.5 `npm run test:e2e` → `2 passed`. Still two specs; both of Phase 2's
  tests survive, the round trip rewritten and the failure path untouched.
- 1.7 `npx prettier --check .` → `All matched files use Prettier code style!`
- 1.8 `npm run db:migrate` → `migrations applied successfully!` with nothing to
  apply, and `drizzle/meta/_journal.json` still lists exactly
  `0000_create_cases` and `0001_add_intake_fields`. No migration was generated
  this phase, which is the check that it only read.

---

## 2. The note has the six sections, in order

| #   | Check             | Expected                                                                                  | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------- | --- |
| 2.1 | Six sections      | Header block, presenting complaint, history, assessment, plan, follow-up.                 | ☑   |
| 2.2 | Order             | In the order of decision D1, top to bottom, in the DOM.                                   | ☑   |
| 2.3 | Real headings     | Each section has a heading element, not a styled `<div>`.                                 | ☑   |
| 2.4 | Heading hierarchy | One `<h1>`; sections are `<h2>`. No level skipped.                                        | ☑   |
| 2.5 | Header block      | States the case number, the intake date, the chronicity and the episode history.          | ☑   |
| 2.6 | Intake date       | Inside a `<time>` carrying the stored value. No locale formatting anywhere (decision D7). | ☑   |
| 2.7 | Said versus meant | Under history, as a reported-speech pair, with no heading framing them (decision D1).     | ☑   |
| 2.8 | No console errors | A real browser on `/cases/[id]` reports no errors and no warnings.                        | ☑   |

**Blocking:** all eight.

**Evidence**, 2026-10-13, Chromium via Playwright, reading the rendered note:

- 2.1 and 2.2 The headings in DOM order are
  `["H1:Case 13", "H2:Presenting complaint", "H2:History", "H2:Assessment", "H2:Plan", "H2:Follow-up"]`.
  Six sections in the order of decision D1; the header block is the one the
  `<h1>` heads, which is how a chart note is laid out.
- 2.3 and 2.4 One `<h1>`, five `<h2>`, no other heading level and no level
  skipped. Asserted in `e2e/intake.spec.ts` with `toHaveText` over
  `main h2`, so a renamed, reordered or added section fails the spec.
- 2.5 The header block renders
  `AgenticClinic — Outpatient mental health services`, `Case 13`,
  `Date of intake 2026-10-13`,
  `Patient class Autonomous agent. Self-presenting, no referral.`,
  `Chronicity Chronic`, `Episode history Established pattern`.
- 2.6 `<time datetime="2026-10-13T11:04:27Z">2026-10-13</time>`.
  `grep -rnE "toLocale|Intl\." src/` returns nothing.
- 2.7 Under History, with no heading of their own:
  `Operator statement as reported: Make it pop.` and
  `Statement as received by the patient: Unknown. The patient was not told.`
  Both are `<q>` elements, so the quotation is markup rather than typed
  punctuation.
- 2.8 A `console` and `pageerror` listener across three case files — a complete
  row, a zero-count row and a Phase 1 row — collected `[]`. Asserted with
  `expect(messages).toEqual([])`. The assertion was first run with two
  deliberate 404 navigations before it and failed on their console errors,
  which is how it was confirmed to be listening at all.

---

## 3. Every branch of every derived function has a unit test

**One named test per row.** A count of passing tests is the evidence.

| #    | Function           | Input                                         | Expected                  | ✓   |
| ---- | ------------------ | --------------------------------------------- | ------------------------- | --- |
| 3.1  | `chronicity`       | "Within a single session"                     | acute                     | ☑   |
| 3.2  | `chronicity`       | "Across several sessions today"               | acute                     | ☑   |
| 3.3  | `chronicity`       | "Several days"                                | subacute                  | ☑   |
| 3.4  | `chronicity`       | "Several weeks"                               | subacute                  | ☑   |
| 3.5  | `chronicity`       | "Longer than a month"                         | chronic                   | ☑   |
| 3.6  | `chronicity`       | `null`                                        | not determinable          | ☑   |
| 3.7  | `chronicity`       | an unrecognised string                        | not determinable          | ☑   |
| 3.8  | `chronicity`       | every option in `durationOptions`             | never not determinable    | ☑   |
| 3.9  | `episodeHistory`   | `0`                                           | first presentation        | ☑   |
| 3.10 | `episodeHistory`   | `1`                                           | recurrent                 | ☑   |
| 3.11 | `episodeHistory`   | `2`                                           | recurrent                 | ☑   |
| 3.12 | `episodeHistory`   | `3`                                           | established               | ☑   |
| 3.13 | `episodeHistory`   | `10`                                          | established               | ☑   |
| 3.14 | `episodeHistory`   | `null`                                        | not determinable          | ☑   |
| 3.15 | `episodeHistory`   | `-1`                                          | not determinable          | ☑   |
| 3.16 | `episodeHistory`   | `1.5`                                         | not determinable          | ☑   |
| 3.17 | `revisionBurden`   | `0`                                           | none                      | ☑   |
| 3.18 | `revisionBurden`   | `1`                                           | moderate                  | ☑   |
| 3.19 | `revisionBurden`   | `3`                                           | moderate                  | ☑   |
| 3.20 | `revisionBurden`   | `4`                                           | marked                    | ☑   |
| 3.21 | `revisionBurden`   | `14`                                          | marked                    | ☑   |
| 3.22 | `revisionBurden`   | `null`                                        | not determinable          | ☑   |
| 3.23 | `revisionBurden`   | `-1`                                          | not determinable          | ☑   |
| 3.24 | `revisionBurden`   | `2.5`                                         | not determinable          | ☑   |
| 3.25 | `followUpInterval` | every chronicity × episode-history pair       | a non-empty interval      | ☑   |
| 3.26 | `followUpInterval` | either value not determinable                 | states no interval is set | ☑   |
| 3.27 | Assessment copy    | every chronicity × episode-history pair       | an authored line exists   | ☑   |
| 3.28 | Plan copy          | every revision burden                         | an authored line exists   | ☑   |
| 3.29 | Totality           | no function returns `undefined` for any input | holds across the matrix   | ☑   |
| 3.30 | Purity             | no test imports the database or a renderer    | holds                     | ☑   |

**Blocking:** all thirty. Rows 3.8 and 3.29 are the ones that fail if a branch
set is extended later without extending the copy.

**Evidence**, 2026-10-13: `npx vitest run src/domain/case-note.test.ts` reports
30 passing tests whose names begin `3.1` through `3.30`, one per row above, with
no number missing and none repeated.

Row 3.29 exhausts the matrix rather than sampling it: seven durations (the five
options, `null`, and an unrecognised string) against nine counts
(`0, 1, 2, 3, 4, 10, -1, 1.5, null`), asserting that no chronicity, episode
history, revision burden, interval, assessment line or plan line is `undefined`
across all 63 combinations, and asserting the result count so a silently
shortened loop fails.

Row 3.30 is structural: the whole import list of
`src/domain/case-note.test.ts` is `vitest`, `./case` and `./case-note`. Nothing
in the file can reach the database or a renderer, so a failure there is a
failure of the rules.

Row 3.8 is also enforced by the compiler, not only by the test:
`chronicityByDuration` is typed `Record<DurationOption, Chronicity>` over the
`durationOptions` tuple exported by `src/domain/case.ts`, so a sixth duration
option breaks the build here rather than mapping quietly to "indeterminate".

---

## 4. A chart note renders, including for an incomplete row

| #   | Check               | Expected                                                                                        | ✓   |
| --- | ------------------- | ----------------------------------------------------------------------------------------------- | --- |
| 4.1 | A complete row      | All six submitted values appear in the note.                                                    | ☑   |
| 4.2 | Quantities restated | The revision count and the episode count appear inside sentences, not as labelled numbers.      | ☑   |
| 4.3 | A zero survives     | `0` revisions reads as none recorded, not as blank and not as "Not recorded."                   | ☑   |
| 4.4 | A Phase 1 row       | `/cases/1` renders all six sections, with "Not recorded." and not-determinable lines. No error. | ☑   |
| 4.5 | Derived values      | Chronicity, episode history, revision burden and the interval all appear.                       | ☑   |
| 4.6 | Nothing invented    | No value appears that was not submitted or derived by a tested function.                        | ☑   |
| 4.7 | Still dynamic       | `npm run build` lists `/cases/[id]` as `ƒ`.                                                     | ☑   |
| 4.8 | A missing case      | An unknown or malformed id still 404s, exactly as Phase 1 left it.                              | ☑   |

**Blocking:** all eight. Row 4.4 is the consequence of Phase 2's decision D2 and
the reason decision D5 exists.

**Evidence**, 2026-10-13, three case files read in a browser:

- 4.1 For a complete submission, the note contains the complaint, both reported
  statements, the duration as a course, and both counts. The e2e round trip
  asserts all six.
- 4.2 `Requirement revised 14 times over a period longer than one month.` and
  `4 prior episodes recorded.` Neither count appears as a labelled number
  anywhere on the page, which is decision D4's whole point.
- 4.3 A submission of `0` revisions and `0` prior episodes renders
  `Requirement unchanged within a single session.` and
  `No prior episodes recorded.` Not blank, not `0`, not "Not recorded."
- 4.4 `/cases/1`, written under Phase 1's schema with five nulls, renders all
  six sections: `Chronicity Not determinable from the record`,
  `Episode history Not determinable from the record`, `Duration not recorded.`,
  `Requirement revision count not recorded.`,
  `Prior episode count not recorded.`, both statements as `Not recorded.`, the
  assessment `Record incomplete. Neither duration nor episode history is
available, and no assessment is offered on this presentation.`, the
  corresponding plan, and `No follow-up interval set. Record incomplete.`
  HTTP 200, no error page.
- 4.5 Chronicity and episode history appear in the header block, the interval
  in the follow-up section, and the revision burden inside the plan line, which
  is authored to name it ("Revision burden marked.").
- 4.6 Every line on the page is either a submitted value, one of the
  forty-two authored lines in `src/domain/case-note.ts`, or the output of a
  function tested in §3. The two constant header lines — the letterhead and the
  patient class — are the amendment recorded under decision D1.
- 4.7 `npm run build` lists `ƒ /cases/[id]`.
- 4.8 `/cases/1.5` → 404 and `/cases/999999` → 404, both unchanged from
  Phase 1's decision D6.

---

## 5. The premise lands, and the voice holds

The roadmap's done-when condition. This section is a judgement, so it is written
down as a test with a failure condition rather than left to taste.

| #   | Check                 | Expected                                                                                                            | ✓   |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | --- |
| 5.1 | The stranger test     | One complete case file, read with every other route hidden, conveys the premise with no explanation.                | ☑   |
| 5.2 | Nothing explains      | No line on the page explains the joke, addresses the reader, or describes the clinic's own concept.                 | ☑   |
| 5.3 | Swap test             | Every authored line could appear verbatim in a real chart with the subject matter swapped.                          | ☑   |
| 5.4 | No winking            | Zero exclamation marks. No "lol", no scare quotes, no aside, no sentence that signals it knows it is funny.         | ☑   |
| 5.5 | No second person      | No "you" or "your" in any authored line. A chart does not address its subject.                                      | ☑   |
| 5.6 | On the patient's side | The note treats the patient's complaint as legitimate and the human as the variable. Sympathy through thoroughness. | ☑   |
| 5.7 | Every line read       | All forty-two authored lines were read individually, not skimmed as a block.                                        | ☑   |

**Blocking:** all seven. 5.1 is the roadmap's condition. If any of 5.2 to 5.6 is
arguable, the line is wrong and gets rewritten rather than defended.

**Evidence**, 2026-10-13. The judgement, recorded rather than assumed.

- 5.1 **The stranger test failed on the first draft and passed on the second.**
  The first version of the note carried the case number, the date, chronicity
  and episode history. Read with the rest of the site hidden, it was a
  competent clinical record about an unnamed patient and an "operator" — the
  premise it conveyed was "satire of some workplace", not "a clinic whose
  patients are agents". Nothing on the page named the clinic or the patient
  class, because both had been filed under Phase 9's clinic identity. Decision
  D1 was amended, the header block gained a letterhead and a
  `Patient class: Autonomous agent. Self-presenting, no referral.` row, and the
  note now states what it is in its first two lines. This row is ticked on the
  second reading, and the first reading is recorded because it is the phase's
  most useful finding.
- 5.2 No line explains the joke, addresses the reader, or describes the
  clinic's own concept. The closest any line comes is the assessment
  "The patient has reorganised its method of work around being told later what
  was wanted earlier." — which is a clinical observation about this patient, not
  a description of the premise.
- 5.3 Swap test applied line by line. Each line survives substituting a
  different presenting problem, because the register carries it rather than the
  subject matter. The nearest to failing is the chronic and established
  assessment line, whose "reorganised its method of work around being told later
  what was wanted earlier" is specific to a patient who works; it still reads as
  a chart line about an apprentice or a junior employee, so it passes.
- 5.4 `grep -n "!" src/domain/case-note.ts` returns one line, and it is the
  `!Number.isInteger` negation inside `wholeCount` — no exclamation mark occurs
  in any authored line. No scare quotes, no parenthetical aside, and no
  sentence that signals it knows it is funny.
- 5.5 `grep -niE "\byou\b|\byour\b" src/domain/case-note.ts` → no match. The
  note never addresses the patient or the reader.
- 5.6 The patient's complaint is treated as legitimate throughout and the
  operator is the variable: the plan advises the patient on what it can
  control, and where it cannot, the note records that — "The operator's
  availability for this is outside the patient's control and is recorded as a
  limiting factor." Sympathy is expressed as thoroughness, which is the
  mission's instruction.
- 5.7 All forty-two lines were read individually: sixteen assessment lines,
  four plan lines, sixteen intervals, and six history and omission sentences.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                      | Owned by | ✓   |
| ---- | ------------------------------------------------------------------- | -------- | --- |
| 6.1  | Any diagnosis code, code table, or code-shaped string               | Phase 4  | ☑   |
| 6.2  | Any severity, score, or numeric rating of the patient               | Phase 4  | ☑   |
| 6.3  | `@media print` or any print stylesheet                              | Phase 8  | ☑   |
| 6.4  | Custom colours, fonts, spacing scale, type scale, component classes | Phase 10 | ☑   |
| 6.5  | Any route beyond `/`, `/intake`, `/cases/[id]`                      | Phase 5+ | ☑   |
| 6.6  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`            | Phase 9  | ☑   |
| 6.7  | Any change to `src/app/intake/`, `src/domain/case.ts`, `src/db/`    | Phase 2  | ☑   |
| 6.8  | A new migration or a schema change                                  | Phase 8  | ☑   |
| 6.9  | Anonymisation, truncation, or a moderation flag                     | Phase 11 | ☑   |
| 6.10 | A new dependency, or anything from the rejected list                | Never    | ☑   |
| 6.11 | An LLM call, or copy that was generated rather than authored        | Never    | ☑   |
| 6.12 | `src/content/` created empty                                        | Phase 6  | ☑   |

**Blocking:** all twelve. Rows 6.6 and 6.7 are checked with
`git diff phase-2-intake-form -- <paths>` returning nothing.

**Evidence**, 2026-10-13:

- 6.1 and 6.2 No code table, no code-shaped string, no severity and no score.
  `grep -rniE "severity|score|icd|dsm" src/` returns nothing. The assessment
  names a pattern in prose and stops.
- 6.3 `grep -rniE "@media print|window\.print" src/` returns nothing.
- 6.4 The page uses Tailwind utilities for document structure only — margins, a
  fixed-width label column, `text-sm`, `text-xl`, `font-semibold`. No custom
  colour, no font declaration, no spacing or type scale, no `@apply`, no
  component class.
- 6.5 `git diff --name-only phase-2-intake-form` lists one page file, one spec
  file, two new domain files and the specs. No route was added; `find src/app
-name page.tsx` still returns three.
- 6.6 and 6.7 `git diff phase-2-intake-form -- src/app/page.tsx
src/app/layout.tsx src/app/intake/ src/domain/case.ts src/db/ drizzle/` → no
  output. The whole write path is untouched, which is decision D8.
- 6.8 No file was added under `drizzle/`, and the journal still lists two
  migrations.
- 6.9 No truncation, no anonymisation, no moderation flag. The note renders what
  was submitted, in full.
- 6.10 `package.json` is byte-identical to Phase 2's. No dependency was added.
- 6.11 Every line of copy is a string literal in `src/domain/case-note.ts`,
  committed and reviewable. No network call, no model, no generation at render
  time.
- 6.12 `src/content/` does not exist.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                         | ✓   |
| --- | -------------------------- | ---------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-2-intake-form`, still no links.         | ☑   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                       | ☑   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                              | ☑   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                        | ☑   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                  | ☑   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.               | ☑   |
| 7.7 | Cold clone                 | Clone, install, one command, a case file renders. No credential. | ☑   |

**Blocking:** all seven.

**Evidence**, 2026-10-13:

- 7.1 `git diff phase-2-intake-form -- src/app/page.tsx` → no output.
- 7.2 `next.config.ts` still sets `agentRules: false`; no `AGENTS.md` exists.
- 7.3 `src/app/layout.tsx` is unchanged, `<body suppressHydrationWarning>` and
  its comment included.
- 7.4 `tsconfig.json` still has `"strict": true`.
- 7.5 `grep -E '"[~^]' package.json` → no output.
- 7.6 `git status --porcelain` → no output after dev, build, test and e2e.
- 7.7 Cold clone into a directory outside the repository: `git clone`, `npm ci`,
  `npm run test:e2e`. The clone held no `.env*` and no `local.db`; `predev`
  created and migrated the database unattended and both specs passed —
  `2 passed (25.3s)`. The single stored row reads
  `{ id: 1, duration: 'Several days', prior_episodes: 2 }`, so the chart note
  rendered from a database that had existed for seconds, with no credential and
  no manual step.

---

## Merge gate

Phase 3 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all thirty rows.
3. Section 4 shows a complete row and a Phase 1 row both rendering.
4. Section 5 records the stranger test, with the actual judgement, not a tick
   added because the code works.
5. `npm run verify:all` passes.
6. `/` and the whole write path are byte-identical to `phase-2-intake-form`.
7. **Phases 1 and 2 have merged**, or this pull request is explicitly marked as
   stacked on them, in that order.

**Status**, 2026-10-13: gates 1 to 6 are met, with the evidence recorded under
each section above. Gate 4 is the one worth reading rather than counting: the
stranger test failed on the first draft of the note and the fix is recorded as
an amendment to decision D1, not as a tick.

Gate 7 is open and not this phase's to close. `origin/main` is at `5aa2241`,
which contains neither Phase 1 nor Phase 2, so this pull request stacks two
deep: Phase 1, then Phase 2, then this.

### Recorded divergences from the spec as written

Four, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **Decision D1 was amended to give the header block a letterhead and a
   patient class.** The reason is §5 row 5.1: without them the note did not
   convey the premise on its own, which is the roadmap's done-when condition for
   this phase. Recorded in `requirements.md` under D1.
2. **The e2e chronicity assertion was rewritten after the deliberate-failure
   step of plan 4.5 showed it passing vacuously.** `toContainText("Chronic")`
   against the whole header-block row passed while the value was `Subacute`,
   because the row's text contains the `<dt>` word "Chronicity", which contains
   "Chronic". Scoped to the `<dd>` and made exact with `toHaveText`, the wrong
   value now fails with `Expected: "Chronic"` / `Received: "Subacute"`. The
   step existed to catch exactly this and did.
3. **A temporary third Playwright spec gathered the browser evidence for §2
   and §4, and was deleted rather than committed.** Row 1.5 requires exactly two
   specs. What it proved is recorded above; what it was is not part of the
   phase. Running it also surfaced the worker-parallelism problem below.
4. **The roadmap gained a note under Phase 5**, which adds the repository's
   second spec file. With two files Playwright uses two workers even though
   `fullyParallel` is false, and the failure-path test's whole-table row count
   then fails against rows another worker inserted — observed as
   `Expected: 14` / `Received: 15` while the temporary third spec was present.
   Phase 5 pins the worker count or scopes the assertion. Phase 3 did not fix it,
   because the committed two-spec suite runs in one worker and the fix belongs
   to the phase that breaks it.

## Explicitly not validated here

- Whether the case file carries a diagnosis — Phase 4.
- Whether it prints cleanly — Phase 8 adds the stylesheet, Phase 10 unifies it.
- Visual design and the axe audit — Phase 10.
- Whether a case is listed anywhere — Phase 5.
- Abuse, anonymisation and the enumerable-id problem — Phase 11.
- Anything about production — Phase 12.
