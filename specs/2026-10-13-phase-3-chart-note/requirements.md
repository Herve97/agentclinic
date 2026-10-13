# Phase 3 — The case file as a chart note: Requirements

**Branch:** `phase-3-chart-note`, branched from `phase-2-intake-form`
**Roadmap phase:** [Phase 3 — The case file as a chart note](../roadmap.md)
**Date:** 2026-10-13

---

## Goal

`/cases/[id]` reads as a genuine clinical document.

Phase 2 proved the six answers round-trip and rendered them as a `<dl>` of
labelled values. That page is a receipt. This phase turns it into a chart note:
a header block, a presenting complaint, a history, an assessment, a plan, and a
follow-up interval, written in the register [mission.md](../mission.md)
requires.

This is the phase where the project's claim is tested. The roadmap's done-when
condition is that **a stranger reading one case file gets the premise with no
other context** — no home page, no explanation, no second case. If the document
does not do that work by itself, the phase is not done, however correct the code
is.

---

## Branch base, and why it is not `main`

Cut from `phase-2-intake-form`, because the chart note renders the five columns
Phase 2 added and `main` has neither them nor Phase 1's table.

**Consequence:** this pull request stacks two deep — Phase 1, then Phase 2, then
this. They merge in that order. If Phase 2's review changes the six fields or
its decision D8, this phase rebases rather than working around it.

---

## Scope

### In

1. **A chart-note layout on `/cases/[id]`**: header block, presenting
   complaint, history, assessment, plan, follow-up interval.
2. **Derived fields as pure functions in `src/domain/`** — chronicity from
   duration, episode history from the prior-episode count, revision burden from
   the revision count, and the follow-up interval from the first two.
3. **Authored clinical copy**, selected by the derived values. One authored
   line per branch, held beside the function that selects it.
4. **Unit tests for every derived function across every input**, including the
   nulls a Phase 1 row carries.
5. **The e2e specs are updated**, because the `<dl>` they assert against is
   replaced — see decision D6.
6. **The intake date in the header block**, so the note states when the case was
   opened.

### Out — forbidden in this phase

- **Diagnosis codes and any coding scheme.** Phase 4. The assessment names a
  pattern in prose; it does not assign a code, a severity, or a score.
- **A print stylesheet.** Phase 8 adds one, Phase 10 makes it consistent. No
  `@media print` here.
- **The design pass.** Phase 10 owns typography, density, rules and tables. This
  phase may use plain Tailwind utilities for document structure and nothing that
  amounts to a visual system. If a change exists to make the page _look_ like
  clinic paperwork rather than to make it _read_ as a chart note, it is
  Phase 10.
- **Any new route**, a case index, or a link on `/`. Phase 5 owns the waiting
  room, Phase 9 owns entry points, and `/` stays byte-identical.
- **Changes to intake.** The form, the action and the schema are Phase 2's. The
  chart note reads what is already stored.
- **A second table, a status column, or discharge.** Phase 8.
- **Anonymisation, length caps, rate limiting.** Phase 11.
- **An LLM.** The assessment and plan lines are authored and committed, not
  generated. See the rejected list in [tech-stack.md](../tech-stack.md).

---

## Decisions

### D1 — The six sections, in this order

| Section              | Holds                                                       |
| -------------------- | ----------------------------------------------------------- |
| Header block         | Case number, intake date, chronicity, episode history       |
| Presenting complaint | The complaint, verbatim                                     |
| History              | Duration, revision count, prior episodes, said versus meant |
| Assessment           | Authored prose selected by the derived values               |
| Plan                 | Authored prose selected by the derived values               |
| Follow-up            | A derived interval, stated as an interval                   |

**Why this order:** it is the order a chart note is written in and the order the
roadmap lists. A reader who skims only the header and the assessment should
still get the premise, so the two strongest pieces of copy sit at the top and in
the middle rather than at the end.

**"What the human said" and "what the human meant" belong to History**, as a
reported-speech pair. They are the two funniest fields on the form, and the
temptation is to give them a section of their own with a heading that frames
them. Framing them is winking. A chart records what was said and what was meant
under history, without comment.

### D2 — Derived values are pure, total functions over the stored row

Four functions in `src/domain/case-note.ts`:

| Function           | From                       | To                                                              |
| ------------------ | -------------------------- | --------------------------------------------------------------- |
| `chronicity`       | `duration`                 | acute / subacute / chronic / not determinable                   |
| `episodeHistory`   | `priorEpisodes`            | first presentation / recurrent / established / not determinable |
| `revisionBurden`   | `requirementRevisions`     | none / moderate / marked / not determinable                     |
| `followUpInterval` | chronicity, episodeHistory | an interval, in words                                           |

Each takes `string | null` or `number | null` and returns a value for every
input, including `null`. **No function may throw and none may return
`undefined`.** A Phase 1 row has five nulls and must render a chart note rather
than an error page: Phase 2's decision D2 bought that property with a nullable
column, and this phase has to honour it.

**Each of the first three has a fourth, "not determinable" member**, and it is
not only for `null`. The columns are plain nullable text and integers, so an
unrecognised duration, a negative count or a fractional count can exist in the
database even though the Zod schema cannot produce one. A function that handled
only the values the form can submit would be total in theory and throw in
production.

**Why pure and why in `src/domain/`:** [tech-stack.md](../tech-stack.md) says
pure logic stays out of components so it can be unit-tested without a renderer.
These functions are the phase's only logic, and the roadmap names them.

**Why a new file rather than extending `case.ts`:** `case.ts` is the write
boundary — the schema, the field list, the labels. This is the read side. Two
files keep each test file honest about which side it is testing.

### D3 — The copy is authored per branch, not composed from fragments

Each assessment and plan line is one complete authored sentence held in a record
keyed by the derived value. The page selects a line; it never builds one.

**Why:** a template that interpolates derived values into a sentence skeleton
produces grammatically correct text with no voice. The joke is the register, and
register does not survive string concatenation. Authoring one line per branch
costs a few dozen lines of copy and is the actual product —
[mission.md](../mission.md) says content is the product.

**The shape of the copy, and why it is not one big product:**

| Copy          | Keyed by                                                  | Lines |
| ------------- | --------------------------------------------------------- | ----- |
| Assessment    | chronicity × episode history                              | 16    |
| Plan          | revision burden                                           | 4     |
| Follow-up     | chronicity × episode history                              | 16    |
| History lines | written once, with the count interpolated per decision D4 | 6     |

The assessment is the one piece of copy that needs both axes: how long it has
been going on and whether it has happened before is exactly what an assessment
turns into a sentence. The plan follows from the revision burden alone, because
what the clinic can actually advise depends on how often the human moves the
target, not on how long the patient has been enduring it. Keying the plan on
both axes would mean sixty-four lines, most of them paraphrases of each other —
the point where authored copy becomes generated copy with extra steps.

**Consequence:** the branch sets stay small, because the copy cost is what
limits them. A fifth chronicity value would mean four more assessment lines and
four more intervals, and that cost is the right thing to weigh it against.

### D4 — Quantities are restated precisely, in the body of the note

The history does not read "Requirement revisions: 6". It reads "Requirement
revised 6 times within a single session."

**Why:** [mission.md](../mission.md) instructs that absurd things be quantified
precisely and gives almost this sentence as its example. A labelled number is
data; the same number inside a clinical sentence is the joke. This is the
highest-value copy in the phase.

**The zero case is explicit:** "No prior episodes recorded." rather than an
omitted line or a bare "0". Phase 2 fought to keep a legitimate zero
distinguishable from a missing value, and the chart note is where that
distinction becomes visible to a reader.

### D5 — A missing value is stated as missing, in register

A null renders as "Not recorded." where a value would be, and the derived line
for that section says it cannot be determined from the record. Every section
still renders.

**Why:** a chart with a gap in it says so. Hiding the section would be tidier
and would also be the one thing a real record would never do — an omission is
itself information. This also keeps Phase 1's two rows readable instead of
turning them into a special case, and it is the only honest way to render a row
that predates the questions.

### D6 — The e2e specs are updated, not replaced

`e2e/intake.spec.ts` keeps both of its tests. The round-trip assertions move
from `dl > div` to the chart note's own structure.

**Why:** Phase 2's round trip asserts each value inside the `<div>` holding its
`<dt>`. This phase deletes that markup, so the spec would fail against a page
that is working correctly. The roadmap's Phase 1 and Phase 2 done-when
conditions both run through this spec, so it is updated in the same change as
the page, exactly as Phase 2's decision D7 did.

**What is asserted afterwards:** the case number, every submitted value
somewhere in the note, the six section headings, and the derived chronicity for
one known duration. The rules are unit-tested; the spec asserts one derived
value to prove the wiring, not the rules.

### D7 — The intake date is rendered with `<time>` and no locale formatting

`created_at` is SQLite's `current_timestamp`: UTC, `YYYY-MM-DD HH:MM:SS`. The
header renders the date part inside a `<time>` element carrying the stored
value.

**Why no `toLocaleDateString`:** Phase 0 recorded a hydration mismatch on `/`
and ruled out every divergence source in our own code before blaming an
extension. Locale formatting is exactly such a source — the server's locale and
the visitor's need not agree — and a chart note has no reason to localise a
date.

### D8 — `/` and the whole write path are untouched

No change to `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/intake/`,
`src/domain/case.ts`, `src/db/schema.ts`, or any migration.

**Why stated as a decision:** this is the first phase that only reads. A change
to the write path during it would mean the chart note needs data the form does
not collect, which is a Phase 2 amendment rather than a Phase 3 edit.

### D9 — Versions are pinned exactly, resolved at install time

As Phase 0's D6, Phase 1's D10 and Phase 2's D9. This phase expects to add no
dependencies.

---

## Context

### What Phase 2 left

`cases` has eight columns, five of which permit null. `src/domain/case.ts`
exports the six-field schema, `intakeFields`, `durationOptions`,
`intakeFieldLabels`, `emptyIntakeValues` and `firstErrorPerField`.
`/cases/[id]` guards the id shape, runs one query and renders a `<dl>` built
from `intakeFields`. `e2e/intake.spec.ts` holds two tests. `verify` is
lint → build → test; `verify:all` adds the e2e run.

Three notes from Phase 2 that this phase inherits:

- A `"use server"` module may only export async functions (Phase 2's D10). This
  phase adds no action, but that rule is why shared constants live in
  `src/domain/`.
- `getByRole("alert")` also matches Next's route announcer (Phase 1).
- The local database holds two Phase 1 rows with five nulls each. They are the
  fixture for decision D5, not an inconvenience.

### What this phase does not change

`/`, `src/app/layout.tsx`, `next.config.ts`, the intake form and action, the
schema, the migrations, and the absence of `src/content/`.

---

## Risks and open questions

| Risk                                                                                                     | Mitigation                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The assessment starts naming a condition, and the phase builds Phase 4's coding scheme in prose.         | The Out list forbids codes, severities and scores. Validation §6 checks for a code-shaped string and for any numeric score on the page.                         |
| Authored copy drifts into winking — an aside, a joke about the joke, an exclamation mark.                | Validation §5 applies the mission's swap test line by line, and the phase fails on a single arguable line rather than arguing for it.                           |
| A derived function throws or returns `undefined` on a Phase 1 row, and `/cases/1` returns a 500.         | D2 makes totality a requirement, validation §3 tests every function against `null` explicitly, and §4 renders `/cases/1` in a browser.                          |
| The page acquires a visual system and becomes Phase 10 early.                                            | The Out list draws the line at document structure. Validation §6 fails the phase on a custom colour, font, spacing scale or component class.                    |
| The e2e specs are left asserting Phase 2's `<dl>` and report a false failure for two roadmap conditions. | D6 makes updating them part of the phase, in the same task group as the page.                                                                                   |
| Forty-two authored lines become content sprawl that nobody reviews.                                      | D3 keys the plan on one axis rather than two, which is the difference between forty-two lines and ninety. Validation §5 requires every line to be read once.    |
| "A stranger gets the premise" is unfalsifiable, so the phase passes itself.                              | Validation §5 turns it into a stated test with a named failure condition: the note is read with the rest of the site hidden, and anything explaining it is cut. |

**Open question for Phase 4, not this one:** whether the coding scheme derives
its code from these four values or from the raw answers. If it uses these,
`case-note.ts` is where it reads them; if it uses the raw answers, these
functions stay presentation-only. Phase 4 decides, and this phase does not
guess.

**Open question for Phase 8, not this one:** whether the follow-up interval
becomes a stored date once a case can be discharged. Deriving it on read is
correct while every case is open.
