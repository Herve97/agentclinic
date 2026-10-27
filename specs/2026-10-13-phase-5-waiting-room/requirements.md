# Phase 5 — The waiting room: Requirements

**Branch:** `phase-5-waiting-room`, branched from `phase-4-diagnosis-coding`
**Roadmap phase:** [Phase 5 — The waiting room](../roadmap.md)
**Date:** 2026-10-13

---

## Goal

`/waiting-room` lists recent cases.

Four phases have built one case at a time. This is the first screen that shows
the clinic as an institution with a caseload: a list, newest first, with a code
against each entry and a column for how long each patient has been waiting.

The roadmap's done-when condition is that **submitting a new case makes it
appear at the top of the list**, proved by a spec rather than by looking.

---

## Branch base, and why it is not `main`

Cut from `phase-4-diagnosis-coding`, because each row in the list carries the
code Phase 4 assigns, which is derived from the values Phase 3 computes over the
columns Phase 2 added to the table Phase 1 created.

**Consequence:** this pull request stacks four deep — Phases 1, 2, 3, 4, then
this — and they merge in that order.

---

## Scope

### In

1. **A new route `/waiting-room`**, a Server Component, reading the database.
2. **Four columns per roadmap:** case number, code, truncated complaint, time
   waiting.
3. **Newest first, paginated**, with a page size and a page query parameter.
4. **A link from each row to its case file.**
5. **Pure functions in `src/domain/`** for the waiting time, the truncation and
   the pagination arithmetic, with unit tests.
6. **A second Playwright spec file**, `e2e/waiting-room.spec.ts`, proving the
   done-when condition.
7. **The worker-parallelism fix** the roadmap records against this phase — see
   decision D6.

### Out — forbidden in this phase

- **Search, filtering and sorting controls.** The roadmap says so. The order is
  fixed and there is no form on this page.
- **Moderation, a cleared flag, or unlisting.** Phase 11. See decision D5, which
  records that this phase creates the exposure Phase 11 closes.
- **Anonymisation beyond what decision D4 defines.** This phase truncates and
  omits; it does not redact, hash or rewrite stored text.
- **A link on `/`, or any navigation between routes other than the row links.**
  Phase 9 owns entry points. `/` stays byte-identical, and nothing links back
  from a case file to the list.
- **Any change to intake, the schema, or a migration.** Phases 2 and 8.
- **Storing the code or the waiting time.** Both are derived on read, as
  Phase 4's decision D6 has it.
- **A print stylesheet or design work.** Phases 8 and 10. A `<table>` with a
  header row is semantics, not design.
- **An LLM, and anything else on the rejected list.**

---

## Decisions

### D1 — Ordered by `id` descending, not by `created_at`

**Why:** `created_at` is SQLite's `current_timestamp`, which has one-second
granularity. Two cases submitted in the same second would order arbitrarily, and
the roadmap's done-when condition is specifically that a new case appears **at
the top** — a condition that must hold for the demo where someone submits two
cases in ten seconds in front of an audience. `id` is monotonic and unique, so
"newest first" is exactly `order by id desc`.

**Consequence:** the sort key and the displayed waiting time come from different
columns. They cannot disagree in practice, because both increase with the same
insert, but the list is honest about which it sorts on by showing the case
number in the first column.

### D2 — Pagination is an offset and a page number, twenty rows to a page

`?page=2` selects the second twenty. A missing, non-numeric, zero, negative or
out-of-range page clamps to the nearest valid page rather than erroring.

**Why clamping rather than a 404:** Phase 1's decision D6 made a malformed
`/cases/[id]` a 404, and that is still right — a path segment names a resource,
and a resource that cannot exist is absent. A query parameter is a view
parameter on a resource that does exist. `?page=0` is a request for the waiting
room, badly phrased, and a clinic noticeboard does not refuse to be read.

**Why offset rather than a cursor:** a cursor is the right answer for a list
that grows without bound, and this one will hold tens of rows for the
foreseeable future. Offset pagination costs one extra `count(*)` and no
state. Revisit when the table is large enough for the offset scan to matter,
which Phase 12 is the first phase with any reason to measure.

### D3 — The waiting time is a pure function of the stored timestamp and an injected `now`

`waitedFor(createdAt, now)` returns a coarse phrase: under an hour, hours, days
or weeks.

**Why injected `now`:** a function that reads the clock itself cannot be unit
tested without mocking time, and the repository's convention is that pure logic
is testable without a renderer or a mock. The page passes `new Date()` once, so
every row on one render is measured against the same instant.

**Why coarse:** "4 days" is what a waiting-list column says. A precise interval
would be a different joke — the mission's instruction to quantify absurd things
precisely applies to the revision count, not to how long a queue is.

**The timestamp is parsed as UTC explicitly.** SQLite stores
`YYYY-MM-DD HH:MM:SS` with no zone, and `new Date("2026-10-10 19:49:52")` is
parsed as **local** time by JavaScript. On any machine not at UTC that silently
shifts every waiting time by the offset, and west of UTC it produces negative
intervals for recent cases. Phase 3 already had to handle this for the `<time>`
attribute. The function converts to `...T...Z` before parsing, and a unit test
asserts a known timestamp against a known `now`.

### D4 — What "anonymised" means here, and what it does not

The roadmap's Phase 5 line says the list is anonymised. Concretely: the list
shows the case number, the code, a truncated complaint and the waiting time, and
**omits the duration, both counts, and both reported-speech fields.** The
complaint is truncated to 120 characters at a word boundary.

**Why this is worth defining rather than assuming:** intake collects no
identity, so there is nothing to anonymise in the usual sense. What the list
actually does is limit exposure — it shows less of each case than the case file
does. Calling that anonymisation without saying what it means would let a later
phase believe the problem is solved.

**What it does not do:** truncation is not redaction. A visitor who types
something identifying into the first 120 characters of a presenting complaint
will see it on this page. That is decision D5.

### D5 — This phase creates the exposure Phase 11 closes, and that is accepted deliberately

`/waiting-room` is the first screen that shows one visitor's text to another
visitor.

**Why it ships anyway:** nothing is deployed until Phase 12, so the exposure is
zero in practice today. The roadmap's Phase 11 line already owns the fix —
"Cases stay unlisted from the waiting room until cleared" — and that sentence
only makes sense once a waiting room exists. Building the list first and the
gate second is the order the roadmap chose.

**Why it is restated here rather than inherited quietly:** this is the same
escalation Phase 2's decision D4 recorded for length caps, one step further
along. [mission.md](../mission.md) makes "every screen must be safe to project"
a demo-blocking requirement, and this is the first screen where an unreviewed
submission from one person can reach another person's screen. **If Phase 12 is
brought forward for any reason, Phase 11 comes with it, and this page is the
reason.**

### D6 — `workers: 1` is pinned in the Playwright config

**Why:** this phase adds the repository's second spec file. `fullyParallel:
false` orders tests within a file but still lets Playwright run separate files
in parallel workers, and every spec shares one `local.db` and one dev server.
Phase 3 observed the consequence while a temporary third spec existed: the
failure-path test's `select count(*)` before-and-after assertion failed with
`Expected: 14` / `Received: 15` against rows another worker had inserted. This
phase's own spec is worse off still — it asserts that a case is **at the top** of
the list, which a concurrent insert from another file would break.

One line fixes the class of problem, and it makes the comment already in the
config true rather than aspirational. The alternative the roadmap offered —
scoping each assertion to a marker value — is more code in more places and
leaves the shared dev server and the shared database as they were.

### D7 — The code and its rubric share one cell

This answers the open question Phase 4 left: the waiting room shows the code,
with the rubric beneath it in the same cell.

**Why both:** the roadmap says "code", and a bare `ACDI-12` in a column is
institutionally correct and completely opaque. The rubric is the part that is
funny without context, which is exactly what a list skimmed by a stranger
needs. Keeping both in one cell honours the roadmap's four columns rather than
adding a fifth.

### D8 — The pagination test seeds its own fixture

Added 2026-10-13, during implementation. `e2e/waiting-room.spec.ts` inserts
cases directly until the table holds more than one page, then asserts the
pagination behaviour.

**Why:** the first version of the test followed the `Next page` link. That
passed against the development database, which had accumulated twenty-three
cases over five phases, and failed on a cold clone, which had two — no second
page, no link, no test. The cold-clone row in validation §7 is what caught it,
which is the row's whole purpose.

**Why a direct insert rather than twenty-one form submissions:** filling the
intake form twenty-one times would take about two minutes and would be
exercising intake, which `e2e/intake.spec.ts` already covers, in order to
prove something about pagination. The seeded rows are complete and valid — the
same shape the form produces.

**Why this is not a schema dependency to worry about:** the spec already reads
`cases` directly for the failure-path row count (Phase 2's decision D7), so the
e2e suite is already coupled to the table. Writing to it is the same coupling
in the same file.

**The general lesson, recorded for later phases:** a spec that depends on data
accumulated by earlier runs is not a spec. Phase 8's discharge summary and
Phase 11's abuse paths will both want fixtures, and this is the pattern.

### D9 — Versions are pinned exactly, resolved at install time

As every phase since Phase 0. This phase expects to add no dependencies.

---

## Context

### What Phase 4 left

`cases` has eight columns and two migrations. `src/domain/case-note.ts` derives
chronicity, episode history, revision burden and the follow-up interval;
`src/domain/diagnosis.ts` holds the twenty-code index and `assignDiagnosis`.
`/cases/[id]` renders seven sections. `e2e/intake.spec.ts` holds two tests.
81 unit tests pass across four files. Three routes exist and none links to
another.

Notes this phase inherits:

- A value assertion against a labelled cell must be scoped and exact, or it
  passes against the label (Phase 3, confirmed again in Phase 4).
- Playwright's `expect` timeout is 30s because Next compiles routes on demand in
  dev. A new route means a new cold compile, so the first navigation to
  `/waiting-room` in a spec run is the slow one.
- The two Phase 1 rows have five nulls and are coded `ACDI-19`. They will appear
  in the list, near the bottom, with the oldest waiting times.

### What this phase does not change

`/`, `src/app/layout.tsx`, `next.config.ts`, the intake form and action, the
schema, the migrations, `src/domain/case.ts`, `case-note.ts`, `diagnosis.ts`,
and the absence of `src/content/`.

---

## Risks and open questions

| Risk                                                                                                   | Mitigation                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| The waiting time is computed from a locally-parsed timestamp and is wrong by the machine's UTC offset. | D3 converts to UTC before parsing, and validation §3 asserts a known timestamp against a known `now`, including a case recorded seconds ago.     |
| Two spec files race on one database, and the "at the top" assertion fails intermittently.              | D6 pins `workers: 1`. Validation §1 records the worker count the run actually used.                                                              |
| The page is prerendered at build time and every waiting time freezes.                                  | Validation §1 row 1.2 requires `ƒ /waiting-room` in the route table, not `○`.                                                                    |
| Pagination arithmetic is off by one at the boundaries and nobody notices with 23 rows.                 | D2's clamping is a pure function, and validation §3 tests the boundaries explicitly rather than at the current row count.                        |
| A truncated complaint cuts mid-word or mid-entity and renders as mojibake.                             | Truncation is at a word boundary, and validation §3 tests a multi-byte string.                                                                   |
| The list shows unmoderated text, and the demo constraint in `mission.md` is quietly broken.            | D5 states the exposure, accepts it only until Phase 12, and ties Phase 11 to Phase 12 explicitly rather than leaving it as a later nice-to-have. |
| The page acquires a sorting control because a table header looks clickable.                            | The Out list forbids it by name. Validation §6 checks for any form, button or link other than the row links and the page links.                  |

**Open question for Phase 9, not this one:** whether `/` links to
`/waiting-room` as an entry point, and whether a case file links back to the
list. Phase 9 owns navigation and will have every route in front of it.

**Open question for Phase 11, not this one:** whether unlisting a case hides it
from the list only, or also from `/cases/[id]`. The roadmap's Phase 11 already
records that unlisting alone does not hide an enumerable id.
