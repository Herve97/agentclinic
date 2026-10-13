# Phase 4 — Diagnosis coding: Requirements

**Branch:** `phase-4-diagnosis-coding`, branched from `phase-3-chart-note`
**Roadmap phase:** [Phase 4 — Diagnosis coding](../roadmap.md)
**Date:** 2026-10-13

---

## Goal

Every case is assigned a code from a fictional coding system.

Phase 3 made the case file read as a clinical document. A clinical document of
this kind carries a code, and the code is where the apparatus of clinical
documentation is at its most absurd and least winking: a bureaucratic index,
maintained in-house, with a numbered rubric for "the requirement kept changing".

The roadmap's done-when condition has two halves: **the assignment function is
unit-tested across every code**, and **the fictionality of the scheme is
unmistakable on the page.** The second half is a constraint from
[mission.md](../mission.md), not a nicety — parody codes must be visibly
fictional, must not reuse real ICD-10 or DSM-5 codes, and must not describe real
conditions.

---

## Branch base, and why it is not `main`

Cut from `phase-3-chart-note`, because the code is assigned from the derived
values Phase 3 introduced and rendered in the chart note Phase 3 built.

**Consequence:** this pull request stacks three deep — Phase 1, Phase 2,
Phase 3, then this — and they merge in that order.

---

## Scope

### In

1. **A static code table in `src/domain/`** — an invented index, twenty codes,
   each with a code, a rubric and the index's own description.
2. **One pure assignment function**, `assignCode`, rule-based, no LLM.
3. **A `Diagnosis` section on `/cases/[id]`** holding the code, its rubric, its
   description, and the citation that makes the scheme's fictionality legible.
4. **A unit test per code**, proving every code is reachable and that the
   function is total.
5. **The e2e round trip is updated**, because the section list it asserts gains
   a seventh heading.

### Out — forbidden in this phase

- **Multiple or differential diagnoses.** The roadmap says so. One code per
  case, no "rule out", no secondary code, no comorbidity.
- **Severity scoring.** No score, no scale, no numeric rating of the patient.
  See decision D5, which draws the line between a qualifier describing the
  operator's behaviour and a severity rating of the patient.
- **Storing the code.** It is derived on read, like Phase 3's values. No
  migration, no column, no schema change.
- **Any change to intake.** The form, the action and the schema are Phase 2's.
- **A waiting room, a code index page, or any new route.** Phase 5 lists cases;
  this phase adds no route at all, and `/` stays byte-identical.
- **A print stylesheet or design work.** Phases 8 and 10.
- **Real codes.** No ICD-10, no DSM-5, no SNOMED, no real classification
  referenced, cited, or imitated in format.
- **An LLM.** The table and its descriptions are authored and committed.

---

## Decisions

### D1 — The code is assigned from Phase 3's derived values, not from the raw answers

`assignCode` takes a chronicity, an episode history and a revision burden — the
three values `src/domain/case-note.ts` already derives and tests — and returns
one code.

**Why:** Phase 3 left this as an open question, and this is the answer. The
derived values are already total, already unit-tested across every input, and
already the vocabulary the assessment is written in. Re-deriving a code from the
raw columns would mean two ladders of thresholds that could disagree: a note
could read "Requirement unchanged" while the code said the requirement was
unstable. One source of truth for "what the record says" is worth more than the
flexibility of reading the raw row.

**Consequence:** `assignCode` cannot see the free text. A code is never assigned
from what the complaint says, only from the structured answers. That is a
limitation and it is the correct one — keyword-matching a complaint to a
diagnosis is both fragile and the kind of thing this clinic would be sued for.

### D2 — The scheme: the AgenticClinic Diagnostic Index, second edition

Twenty codes of the form `ACDI-01` to `ACDI-20`.

**Why this format:** it carries the index's name inside every code, so a code
quoted anywhere — a case file, the Phase 5 waiting room, a screenshot in a talk
— arrives with its own provenance. It is also structurally unlike the real
classifications: no decimal subdivision, no letter-plus-digits block, no
chapter ranges. A reader who knows ICD-10 or DSM-5 cannot mistake `ACDI-14` for
either, and a reader who does not know them learns from the citation on the page
that this index is maintained by the clinic itself.

**Why a second edition:** because a first edition is implied, and an institution
revising its own diagnostic manual is funnier and more clinical than one that
has always been right. Nothing in the repository describes the first edition.

**The fictionality is carried by the citation, not by a disclaimer.** The
`Diagnosis` section states that the index is maintained by this clinic and is
not equivalent to any external classification. That is a sentence a real coding
section would carry about a local scheme, and it does the work
[mission.md](../mission.md) requires without a parenthetical telling the reader
it is a joke. A disclaimer in a different register would break the voice and
fail the test anyway.

### D3 — Twenty codes: four groups of five, by revision burden

The primary axis is the revision burden, because it is the operator's behaviour
and this clinic's subject matter is what operators do to agents. Within each
group, four codes by course and one for an established pattern.

| Group                      | Burden           | Codes             |
| -------------------------- | ---------------- | ----------------- |
| Instruction deficit        | none             | `ACDI-01` to `05` |
| Requirement instability    | moderate         | `ACDI-06` to `10` |
| Requirement instability    | marked           | `ACDI-11` to `15` |
| Unclassified, record short | not determinable | `ACDI-16` to `20` |

**Why "instruction deficit" for a burden of none:** a requirement that was never
revised and still produced a presenting complaint was not unstable — it was
never adequate. That is a different diagnosis, not a milder one, and giving it
its own group rather than a lower number is the distinction the scheme exists to
make.

### D4 — An established pattern takes precedence over the course

If the episode history is `established`, the code is the group's
established-pattern code regardless of chronicity.

**Why:** an index codes the pattern it recognises. Once a presentation is
established, the duration of the present episode stops being the thing worth
recording — the recurrence is. This also keeps the table at twenty codes rather
than forty-eight, and it is the only rule in the scheme with precedence, which
makes it the only rule a reader has to hold in mind.

**Consequence:** four codes (`ACDI-04`, `09`, `14`, `19`) are reachable only
when the episode history is not established, and four (`ACDI-05`, `10`, `15`,
`20`) only when it is. Validation §3 tests all twenty, so an unreachable code
would show up as an untestable row rather than as a passing suite.

### D5 — A qualifier is not a severity score

"Moderate" and "marked" describe the recorded revision burden — how often the
operator changed the requirement. They are not a severity rating of the patient,
and nothing in this phase scores, scales or ranks the patient.

**Why stated as a decision:** the roadmap puts severity scoring in Phase 4's Out
list, and a code table with the words "moderate" and "marked" in it looks like
severity scoring at a glance. The difference is what is being measured. A
severity score would say how unwell the patient is; these qualifiers say what
was done to it. Validation §6 checks that no number, scale or rating of the
patient appears anywhere.

### D6 — The code is derived on read and never stored

No column, no migration, no schema change. `/cases/[id]` computes the code when
it renders.

**Why:** the code is a function of the answers, so storing it would create two
truths that drift the moment the table changes. A stored code would also make a
table edit a data migration, and the point of an in-repo table is that it can be
edited in a pull request.

**When this gets revisited:** Phase 5 lists the code in the waiting room and
Phase 8 produces a discharge summary. If either needs to sort or filter by code,
or if a discharged case must keep the code it was given rather than the code the
current table would assign, that is the moment to store it. Not before.

### D7 — The `Diagnosis` section sits between Assessment and Plan

A seventh section on the case file, after `Assessment` and before `Plan`.

**Why there:** it is where a chart note puts it. The assessment reasons, the
diagnosis names, the plan follows from the name. Appending it at the end would
be easier and would read as an afterthought.

**Consequence:** Phase 3's six-section list becomes seven, and the e2e spec's
heading assertion is updated in the same change. Phase 3's decision D1 is
amended rather than contradicted — see the amendment note in that phase's
requirements.

### D8 — Versions are pinned exactly, resolved at install time

As Phase 0's D6 and every phase since. This phase expects to add no
dependencies.

---

## Context

### What Phase 3 left

`src/domain/case-note.ts` exports `chronicity`, `episodeHistory`,
`revisionBurden` and `followUpInterval`, their label records, and the authored
assessment and plan lines. `/cases/[id]` renders six sections from them.
`e2e/intake.spec.ts` asserts the five `<h2>` headings by name and one derived
value scoped to its `<dd>`. 57 unit tests pass across three files.

Three notes this phase inherits:

- A `<dd>` assertion must be scoped and exact. Phase 3 recorded that
  `toContainText("Chronic")` passes against a block whose `<dt>` reads
  "Chronicity", and the same trap is waiting for any code assertion against a
  block labelled "Diagnosis".
- The derived functions are total, including for the two Phase 1 rows with five
  nulls. `assignCode` inherits that requirement: every case gets a code, and an
  incomplete record gets the `ACDI-16` to `20` group rather than no code.
- Playwright runs separate spec files in parallel workers. This phase adds no
  spec file, so the problem stays Phase 5's.

### What this phase does not change

`/`, `src/app/layout.tsx`, `next.config.ts`, the intake form and action, the
schema, the migrations, `src/domain/case.ts`, and the absence of
`src/content/`.

---

## Risks and open questions

| Risk                                                                                                  | Mitigation                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A code or rubric accidentally resembles a real ICD-10 or DSM-5 code or condition.                     | D2 fixes a format none of them use. Validation §5 greps for real code shapes and reads all twenty rubrics against the mission's non-goal.              |
| The scheme reads as a severity scale, which the roadmap forbids.                                      | D5 states what the qualifiers measure. Validation §6 fails the phase on any score, scale or rating of the patient.                                     |
| A code becomes unreachable when the rules change, and the suite still passes.                         | Validation §3 requires a named test per code, so an unreachable code is a failing row rather than an absent one.                                       |
| The fictionality line drifts into a disclaimer and breaks the voice.                                  | D2 puts it in the citation, in register. Validation §5 applies the mission's swap test to it like any other line.                                      |
| The table grows a twenty-first code for a case the author happened to think of, and the rules sprawl. | D3 and D4 fix the shape at four groups of five. A new code means a new group or a new axis, both of which are spec amendments rather than table edits. |
| Deriving on read means a case's code changes when the table changes.                                  | D6 accepts this while every case is open and names Phase 5 and Phase 8 as the places to revisit it.                                                    |

**Open question for Phase 5, not this one:** whether the waiting room shows the
code, the rubric, or both. The roadmap's Phase 5 line says "code", and the
rubric is the part that is funny without context, so Phase 5 should decide with
the list in front of it.

**Open question for Phase 8, not this one:** whether a discharge summary freezes
the code. See decision D6.
