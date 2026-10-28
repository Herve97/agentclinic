# Phase 7 — Group session transcripts: Plan

Task groups are numbered and ordered. Each leaves the repo in a committable
state. Do not start a group until the previous one's check passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The shared filename rule comes first, because both collections depend on it and
moving it under a half-built second collection would mean moving it twice. The
schema comes before the reader, the reader before the content, and the content
before the routes — the Phase 6 order, which worked.

---

## 1. The rule both collections share

1.1 Create `src/domain/slug.ts`. Move `slugFromFilename` and its regular
expression out of `src/domain/patient.ts` unchanged, with the comment that
explains the rule.

1.2 Add `slugShape` to the same module: the same rule applied to a bare string
rather than a filename, which is what a cast entry is. One regular expression,
two callers, no second definition.

1.3 `src/domain/patient.ts` imports `slugFromFilename` instead of defining it.
Nothing else in that file changes, and nothing that imports it changes either —
if a caller has to be edited, the move was not a move.

1.4 Move the `slugFromFilename` rows of `src/domain/patient.test.ts` into
`src/domain/slug.test.ts`, keeping their names, and add rows for `slugShape`.

1.5 Amend Phase 6's decision D3 in
[../2026-10-27-phase-6-patient-profiles/requirements.md](../2026-10-27-phase-6-patient-profiles/requirements.md):
mark it amended, dated, with the reason and a pointer to decision D3 here. Mark
it, do not rewrite it — the superseded text is the teaching material.

**Check:** `npm run verify` passes, `git diff` on `src/domain/patient.ts` shows
only the removal and the import, and the Phase 6 validation rows that covered
the filename rule still have a passing test under their original names.

---

## 2. The schema and the pure functions

2.1 Create `src/domain/transcript.ts`.

2.2 Write the frontmatter schema per decision D8: `title`, `date`, `clinician`,
`setting`, `cast`, `summary`. Strict object, clinically-worded messages, as
Phase 2's intake schema and Phase 6's chart schema have.

2.3 `cast` is a non-empty array of strings, each refined by `slugShape` and the
whole array refined for duplicates. A patient listed twice in one cast is an
authoring error, not a patient who attended twice.

2.4 Reuse Phase 6's date handling — the shaped-and-real check, not a regular
expression alone. If that means lifting `clinicalDate` out of `patient.ts`
alongside the slug rule, lift it; a second copy of a date validator is the
second source of truth decision D3 just removed.

2.5 `transcriptOrder(transcripts)` per decision D7 — date descending, ties
broken by slug. Record in a comment why it is the opposite of the register's
order, because a reader who has just read Phase 6 will otherwise assume one of
the two is a mistake.

2.6 Write the unit tests: one named test per row of the table in
[validation.md](./validation.md) §3.

**Check:** `npm run test` passes, every §3 schema row has a named test, and no
test in this file reads the clock, the disk or the database.

---

## 3. The reader, and the cross-collection check

3.1 Create `src/content/transcripts.ts`, with the same top comment
`patients.ts` carries: this is an impure module, and it says so.

3.2 `listTranscripts(dir, patientsDir)` — read the directory, keep `.mdx`,
derive each slug, parse and validate each file's frontmatter, return them in
transcript order. Both directories are parameters with the real paths as
defaults, as Phase 6's decision D9 has it.

3.3 Resolve the cast per decisions D4 and D5. Read the patient collection once
per call, not once per transcript, and throw on the first unresolved slug with
the transcript's filename, the field path and the slug that did not resolve.

3.4 `readTranscript(slug, dir, patientsDir)` — one transcript, compiled, with
its cast resolved to designations. A slug that does not resolve returns nothing
rather than throwing, so the route can call `notFound()`.

3.5 Build the per-transcript component map per decision D6, in this module and
nowhere else, and comment why it cannot be the constant Phase 6's is. `<Turn>`
resolves `speaker` against the resolved cast plus the transcript's clinician,
and throws naming the file and the speaker when it is neither.

3.6 Write the content-integrity test: every authored transcript validates, every
cast member resolves to a real chart, every speaker resolves. It reads the real
directories, and the file's top comment says why this one is allowed to.

**Check:** `npm run test` passes. Temporarily point one cast entry at a patient
who does not exist and confirm the failure names the file, the field path and
the slug, then restore it.

---

## 4. The transcripts

4.1 Write three transcripts into `src/content/transcripts/`, per decision D9:
three patients present, then two, then one attending for the first time.

4.2 Each body carries the session — turns with timestamps, clinician
annotations, and the short sections a group record has around them. Headings
only; no styling.

4.3 Apply the mission's swap test to each as it is written, not afterwards.
Could this appear verbatim in a real group session record with the subject
matter swapped? If not, rewrite it.

4.4 **Each patient speaks as their chart describes them.** Mallow-1 qualifies
every statement; Arbour-7 revises mid-sentence; Quince-3 is in remission and
sounds it; Sorrel-2 cannot account for the original instruction; Tamarisk-4
addresses the service rather than the room. A reader who has read the charts
should be able to identify a speaker from an unlabelled line. This is the
voice risk in requirements.md, handled while writing rather than after.

4.5 No real vendor, model or person, and no real condition or treatment. The
Phase 6 grep list is written down in that phase's validation §5 and is reused
rather than improvised.

**Check:** the content-integrity test passes against all three, and reading one
transcript's MDX source gets the premise with no other context.

---

## 5. The routes

5.1 Create `src/app/transcripts/page.tsx` as a Server Component: a `<table>`
with a header row and one row per transcript — date, title, clinician, cast,
summary.

5.2 The title links to `/transcripts/[slug]`. The cast cell names everyone
present; whether those names link here as well as on the transcript is a layout
call, and whichever way it goes, validation §2 asserts what was chosen.

5.3 Give the list the clinic's own framing line, in register, as `/patients`
and `/waiting-room` have. One line, no second person, no explanation.

5.4 Create `src/app/transcripts/[slug]/page.tsx`: the header block from the
frontmatter, the cast as links to charts, then the compiled body.

5.5 `generateStaticParams` on the transcript route, enumerating the directory,
per decision D10.

5.6 An unresolved slug calls `notFound()`.

5.7 Extend the MDX element map for the elements a transcript body uses.
Semantic elements, existing utilities, nothing new — Phase 6's decision D11,
which this phase does not reopen.

5.8 Handle an empty content directory with a line in register rather than an
empty table, as Phases 5 and 6 did. There is no state of the repository where
this page should look broken.

**Check:** `/transcripts` lists three sessions, each link lands on its
transcript, every cast link lands on a chart, and `npm run build` reports both
new routes as static, not `ƒ`.

---

## 6. The spec

6.1 Create `e2e/transcripts.spec.ts`.

6.2 One test for the list and one for a transcript: three rows, a link
followed, the header block, the turns with their timestamps and speaker labels,
and an annotation. Assertions scoped and exact, not matched against a label,
per the note carried forward since Phase 3.

6.3 A test that follows a cast link from a transcript to the patient chart and
asserts it is the right chart. This is the roadmap's cross-link condition and it
is proved by navigating, not by reading an `href`.

6.4 The done-when test per decision D11: write the probe `.mdx` with a real
patient in its cast, load `/transcripts`, assert the session is listed, load its
slug, assert the transcript renders and its cast link resolves, and delete the
file in a `finally`.

6.5 Assert an unknown slug is a 404.

6.6 Break one new assertion deliberately and confirm a real assertion diff.

6.7 Confirm the tree is clean after the run, and that a deliberately killed run
leaves nothing but an ignored probe file. Add the probe prefix to `.gitignore`
before the first run, not after.

**Check:** `npm run test:e2e` reports four files, one worker, all passing, and
`git status --porcelain` is empty afterwards.

---

## 7. Review against the spec

7.1 Walk [validation.md](./validation.md) and tick every row with evidence.

7.2 Re-read the Out list. Confirm no audio, no interactivity, no `transcripts`
field on a chart, no link from `/` or from a patient chart, no schema change, no
migration, no search, no filter, no sort, no image, no design system.

7.3 Confirm `/`, `src/app/layout.tsx`, `src/app/intake/`, `src/app/cases/`,
`src/app/waiting-room/`, `src/app/patients/`, `src/db/`, `drizzle/`, the five
patient charts and the four untouched `src/domain/` modules are byte-identical
to `main` at the branch point. `src/domain/patient.ts` is the one permitted
exception and its diff is the move and nothing else.

7.4 Confirm [roadmap.md](../roadmap.md) Phase 7 still matches what was built,
record a `Resolved` note, and record against Phase 8 anything this phase learned
that it needs.

7.5 If reality diverged from the spec anywhere, amend the spec in the same
commit range and say why.

7.6 Run `npx prettier --check .` and `npm run verify:all`, unpiped, and read the
exit codes directly.

7.7 Commit, push, and open a pull request against `main`. No credential exists
in this environment, so record that rather than skipping it, as every phase
since Phase 0 has.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the branch is pushed and verified on the remote.
