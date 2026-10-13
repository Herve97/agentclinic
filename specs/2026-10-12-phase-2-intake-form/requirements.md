# Phase 2 — The real intake form: Requirements

**Branch:** `phase-2-intake-form`, branched from `phase-1-slice`
**Roadmap phase:** [Phase 2 — The real intake form](../roadmap.md)
**Date:** 2026-10-12

---

## Goal

Intake collects what a clinic would actually ask for.

Phase 1 proved the wiring with one field. This phase makes the form a real
clinical intake: six fields, a validation rule per field with a message written
in the clinic's register, inline errors, and a form that does not throw away
what was typed when a submission fails.

**The form is the feature.** [mission.md](../mission.md) says so directly —
forms, tables, codes and print layouts carry the humour, and this phase is
where that claim first gets tested. The fields are not plumbing; the six
questions _are_ the joke, and the register they are asked in is the whole
point.

---

## Branch base, and why it is not `main`

This branch is cut from `phase-1-slice`, not from `main`, because it alters the
`cases` table that Phase 1 created and `main` does not yet have.

**Consequence:** the pull request for this phase stacks on Phase 1's. Phase 1
merges first, or this PR's diff will read as though it contains Phase 1's work
too. If Phase 1's review changes the schema or decision D3, this phase rebases
rather than working around it.

---

## Scope

### In

1. **Six fields on `/intake`**, per the roadmap:
   - presenting complaint
   - duration
   - frequency of requirement changes
   - prior episodes
   - what the human said
   - what the human meant
2. **One Zod rule per field**, with validation messages in clinical register.
3. **Inline, server-side errors** — each message renders next to its own field.
4. **Form state survives a failed submit** — every field keeps what was typed.
5. **A migration** adding the five new columns.
6. **A unit test per validation branch.** This is half the roadmap's done-when
   condition, so the schema tests are exhaustive rather than representative.
7. **`/cases/[id]` renders all six fields**, plainly, so the round trip is
   observable. This is the other half of the done-when condition.
8. **The Phase 1 Playwright spec is updated**, because it will otherwise fail —
   see decision D7.

### Out — forbidden in this phase

- **Visual design.** The roadmap says so. Labels, fieldsets and error text are
  semantics; spacing systems, type scales and institutional styling are
  Phase 10. If a change exists to make the form look like a clinic form rather
  than to make it work as one, it belongs to Phase 10.
- **Diagnosis logic.** Phase 4. No codes, no scoring, no derivation of severity
  from the answers.
- **A chart-note layout on `/cases/[id]`.** Phase 3. This phase renders the six
  fields as labelled values and stops — see decision D8.
- **Derived fields** (chronicity, episode count interpretation). Phase 3 owns
  `src/domain/` pure functions for those.
- **Length caps, profanity filtering, rate limiting.** Phase 11, as in Phase 1.
  See decision D4.
- **Any new route**, a case index, or a link on `/`. Phase 9 still owns entry
  points, and `/` stays byte-identical.
- **Anonymisation.** Phase 11.
- **CI.** Phase 12.
- **Anything from the rejected list** in [tech-stack.md](../tech-stack.md). In
  particular, no form library — no React Hook Form, no Formik. Server Actions
  plus `useActionState` cover this, and a form library would be a client state
  manager by another name.

---

## Decisions

### D1 — The six fields, their types, and what each one is for

| Field                 | Column                  | Type    | Required | Shape                     |
| --------------------- | ----------------------- | ------- | -------- | ------------------------- |
| Presenting complaint  | `complaint`             | text    | yes      | free text, trimmed        |
| Duration              | `duration`              | text    | yes      | one of five fixed options |
| Requirement revisions | `requirement_revisions` | integer | yes      | integer ≥ 0               |
| Prior episodes        | `prior_episodes`        | integer | yes      | integer ≥ 0               |
| What the human said   | `human_said`            | text    | yes      | free text, trimmed        |
| What the human meant  | `human_meant`           | text    | yes      | free text, trimmed        |

All six are required. A clinic intake form that accepts a blank history is not
an intake form, and optional fields would mean Phase 3's chart note has to
render "not recorded" for most of its body.

**Why `duration` is a fixed set rather than free text:** a duration typed as
prose cannot be compared across cases, and Phase 3 derives chronicity from it.
The options are clinical intervals, not a design choice:

```
Within a single session
Across several sessions today
Several days
Several weeks
Longer than a month
```

**Why two integer counts:** [mission.md](../mission.md) instructs that absurd
things be quantified precisely — "Requirement revised 6 times within a single
session." A number is the form of that joke. Free text would let someone write
"loads", which is funny in a different register and not this one.

**Naming:** the roadmap says "frequency of requirement changes". The column is
`requirement_revisions` and the label is "Requirement revisions", because what
is actually collected is a count, not a frequency. Recorded as a deliberate
wording change rather than a silent one.

### D2 — New columns are nullable in the database and required at the Zod boundary

The migration adds five columns that permit null. The Zod schema requires all
six fields.

**Why:** SQLite cannot add a `NOT NULL` column to a populated table without a
default, and Phase 1 rows genuinely have no values for these fields. The
alternatives are worse:

- A backfill default would invent clinical content for existing records. In a
  repository whose subject matter is clinical documentation, fabricating case
  data to satisfy a constraint is the wrong instinct even in a dev database.
- Dropping the table loses the additive-migration property that Phase 12 needs
  for Turso, where the database is not disposable.

**Cost accepted:** the database type and the application type diverge — reads
return `string | null` while writes are always complete. `/cases/[id]` must
therefore handle a missing value, which decision D8 covers. The constraint
lives in one place (the schema in `src/domain/`) rather than two, which is
where [tech-stack.md](../tech-stack.md) says it belongs.

### D3 — Errors are keyed by field, and the action returns the submitted values

The action returns `{ errors: Record<field, string>, values: Record<field, string> }`.
Each field renders its own message; the form repopulates from `values`.

**Why:** the roadmap requires both inline errors and that form state survives a
failed submit. Returning a flat error string could not place a message next to
the right field, and returning no values would clear the form — which for a
six-field form with two long free-text answers is the difference between a
usable form and an insulting one.

**Why not `zod`'s `flatten()` verbatim:** it returns `string[]` per field, and
rendering an array of one message per field is more machinery than six fields
need. The first message per field is taken. If Phase 11 adds a second rule per
field, this is the decision to revisit.

**This supersedes Phase 1's open question**, which asked whether the action
should return a plain object or use `useActionState`. It returns a plain object
_through_ `useActionState`, which is what Phase 1 already did with one field.

### D4 — Still no length caps, and this is now a real exposure

Validation is shape and presence only. No maximum length on any text field.

**Why:** length caps are named in Phase 11, and pulling them forward means
writing Phase 11's abuse tests here.

**Why this is worth restating rather than inheriting quietly:** Phase 1 had one
unbounded text field on a local database. This phase has three, and the form is
closer to something a visitor could actually fill in. The exposure is still
zero until Phase 12 deploys, but the gap between "flagged" and "shipped" has
narrowed. If Phase 12 is brought forward for any reason, Phase 11's length caps
come with it.

### D5 — Integer fields are validated as integers, not coerced

`requirement_revisions` and `prior_episodes` are parsed from the form as
strings and must match an integer pattern before conversion. `"3.5"`, `"-1"`,
`"abc"`, `""` and `"1e3"` are all rejected with a message.

**Why:** `Number("")` is `0` and `Number(" 3 ")` is `3`. Coercion would silently
record a blank field as zero revisions, which is both wrong and — for a form
whose point is precise quantification — the exact failure the field exists to
avoid. An `<input type="number">` does not help: browsers submit whatever the
user typed when the field is invalid, and a server must not trust the client's
validation anyway.

### D6 — Validation messages are chart register, not UI register

Each message reads as a clinician noting an omission, not as an app scolding a
user. "A presenting complaint is required." rather than "This field is
required" or "Please enter your complaint!".

**Why:** [mission.md](../mission.md) names the deadpan clinical voice as the
single most important constraint and says every piece of copy obeys it. Error
messages are copy. They are also the copy a visitor is most likely to read
carefully, because something just went wrong. The voice test applies: could
this line appear in a real clinic's form validation with the subject matter
swapped?

### D7 — The Phase 1 Playwright spec is updated, not replaced

`e2e/intake.spec.ts` keeps its name and its assertion, and gains the five new
fields.

**Why:** the spec fills one textarea and submits. With six required fields it
would now fail validation, stay on `/intake`, and never reach a case number —
so leaving it alone is not an option, and the roadmap's Phase 1 done-when
condition would start reporting a false failure. Updating it keeps that
condition true and keeps Phase 12's promise ("the Phase 1 Playwright spec
passes against the production URL") meaningful.

**A second spec is added** for the failure path: a submission missing one field
must show that field's message, keep what was typed in the others, and write no
row. That is the roadmap's "form state survives a failed submit", and it is not
provable by a unit test.

### D8 — `/cases/[id]` renders the six fields as a `<dl>`, and nothing more

Labelled term/description pairs, with a missing value rendered as
"Not recorded." No header block, no sections, no narrative.

**Why:** the roadmap's done-when condition requires that each field round-trips
to the database, which is only observable if the page shows them. A `<dl>` is
the correct semantics for label/value pairs and costs nothing — the same
reasoning as Phase 0's decision D7 for the home page facts list.

**The Phase 3 boundary:** Phase 3 turns this page into a chart note with a
header block, presenting complaint, history, assessment, plan and follow-up
interval, in deadpan clinical prose. This phase adds no section headings and no
derived values. If a change to `/cases/[id]` would make it read as a _document_
rather than as a record of what was submitted, it is Phase 3.

### D9 — Versions are pinned exactly, resolved at install time

As Phase 0's D6 and Phase 1's D10. This phase expects to add no dependencies at
all; if it does, they are resolved with `npm view` and pinned.

### D10 — The labels and the blank form live beside the field list, not beside the action

Added 2026-10-13, during implementation. `src/domain/case.ts` exports
`intakeFieldLabels` and `emptyIntakeValues` alongside `intakeFields` and
`durationOptions`.

**Why the labels:** `/intake` asks the six questions and `/cases/[id]` lists the
six answers, so the same six strings are needed in two places. Two copies drift,
and the drift would be invisible — a label renamed on the form while the case
file keeps the old wording still renders. `src/content/` is where authored copy
will live, but Phase 6 owns that directory and validation §6 row 6.11 forbids
creating it empty here.

**Why the blank form:** a `"use server"` module may only export async
functions. The first implementation put the initial `useActionState` value next
to the action, which type-checked, built, and then threw
`Cannot read properties of undefined (reading 'complaint')` in the browser on
first render. The constant moved to `src/domain/case.ts`; the state's _type_
stays with the action, because types are erased and exporting one is allowed.

Recorded rather than fixed quietly: the failure mode is specific to Server
Actions, survives a clean `lint` and `build`, and is only caught by something
that renders the page.

### D11 — The `<select>` is remounted by key so a failed submit keeps its selection

Added 2026-10-13, during implementation. The duration `<select>` carries
`key={state.values.duration}` as well as `defaultValue`.

**Why:** React resets the form after an action completes. For an `<input>` or
`<textarea>` this is harmless, because React keeps the element's `defaultValue`
attribute in step with the prop and the reset restores the element to it. A
`<select>` is different: React applies `defaultValue` to the option's
`defaultSelected` on mount only, so a reset restores the selection the control
was _mounted_ with — the blank one. The first implementation of this form lost
the duration on every failed submit while keeping all five other answers.

Changing the key when the submitted duration changes remounts the control, and
the remount re-applies `defaultValue`. A repeated failure with the same
selection does not remount and does not need to: the last mount already set
that selection as the one a reset restores.

**Rejected alternatives:** `selected` on the matching `<option>` (React logs a
warning, which validation §2 row 2.8 forbids) and a controlled `<select>` with
`useState` (client state for a value the server already returned, and one step
toward the form library the Out list forbids).

Validation §5 row 5.2 called this "the part most easily missed" before the code
was written. It was missed, and the spec's own row caught it.

---

## Context

### What Phase 1 left

`cases` has three columns and one migration. `src/domain/case.ts` holds a
one-field Zod schema. `/intake` is a Server Component wrapping a client form
that calls one Server Action. `/cases/[id]` renders an `<h1>` and a `<p>`.
`verify` is lint → build → test; `verify:all` adds the e2e spec.

Two notes from Phase 1's validation that this phase will touch:

- `getByRole("alert")` matches both our `<p role="alert">` and Next's
  `__next-route-announcer__`. With six fields and six messages, use
  `p[role="alert"]` or scope by field.
- Playwright's `expect` timeout is raised to 30s in config because Next's
  on-demand dev compile of a route measured 9.1s. Adding routes does not change
  that; adding fields does not either.

### What this phase does not change

`/`, `src/app/layout.tsx`, `next.config.ts`, `agentRules: false`,
`suppressHydrationWarning`, and the absence of `src/content/`.

---

## Risks and open questions

| Risk                                                                                                                                                 | Mitigation                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Phase 1 e2e spec breaks the moment the new fields become required, and a stale spec reports a false failure for the roadmap's Phase 1 condition. | D7 makes updating it part of the phase rather than a follow-up. Group 5 of the plan does it in the same change as the form.                                                 |
| SQLite cannot add `NOT NULL` columns to a populated table, and the obvious fix is to invent default values.                                          | D2 makes the columns nullable and keeps the requirement in Zod. No clinical content is fabricated to satisfy a constraint.                                                  |
| `Number()` coercion silently turns an empty integer field into `0`.                                                                                  | D5 validates the string shape before conversion, and the unit tests cover `""`, `"3.5"`, `"-1"`, `"abc"` and `"1e3"` explicitly.                                            |
| "Every validation branch has a unit test" is easy to claim and hard to check.                                                                        | Validation §3 enumerates the branches as a table and requires one named test per row. A count is evidence; "covered" is not.                                                |
| `useActionState` repopulating six fields pulls the whole form into client state, one step from wanting a form library.                               | D3 keeps it to two plain objects returned from the action. The Out list forbids a form library by name, and `tech-stack.md` already rejects client state managers.          |
| The form grows a fieldset, a legend, helper text, and starts becoming Phase 10's design pass.                                                        | Labels and error text are in; everything cosmetic is out. Validation §6 fails the phase on a custom spacing scale, type scale, or component class.                          |
| `/cases/[id]` starts acquiring section headings and becomes Phase 3 early.                                                                           | D8 is the boundary, and validation §6 checks for section headings by name.                                                                                                  |
| Existing Phase 1 rows render as mostly "Not recorded.", which looks like a bug rather than a decision.                                               | It is a consequence of D2 and is checked deliberately in validation §4 rather than discovered. Phase 3 may choose to hide incomplete cases; this phase shows them honestly. |

**Open question for Phase 3, not this one:** whether `duration` should be
stored as the label or as a sortable key. Phase 3 derives chronicity from it and
will know which it needs; storing the label is reversible with one migration
and storing a key now would be guessing at Phase 3's requirements.

**Open question for Phase 11, not this one:** whether a second validation rule
per field (a length cap) means errors become `string[]` per field. D3 records
that this is where to revisit it.
