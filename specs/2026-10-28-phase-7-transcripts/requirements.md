# Phase 7 — Group session transcripts: Requirements

Scope, prohibitions and the decisions this phase takes. The ordered work is in
[plan.md](./plan.md); the done-when conditions are in
[validation.md](./validation.md).

---

## Goal

`/transcripts` and `/transcripts/[slug]`: authored transcripts of the clinic's
group sessions, cast drawn from the patients Phase 6 published.

From [roadmap.md](../roadmap.md) Phase 7. Done when transcripts render in the
house layout and cross-link to the patient profiles of everyone present.

This is the first phase whose content refers to other content. Phase 6's charts
stand alone: a chart cites a diagnosis code and nothing else in the repository.
A transcript names patients, and a name that resolves to nothing is the defect
this phase has to make impossible rather than merely unlikely.

---

## Branch base, and why it is not the previous phase

`phase-7-transcripts` branches from `main`, not from `phase-6-patient-profiles`.
Phases 1 to 6 merged to `main` on 2026-10-28, so `main` now carries the patient
collection this phase reads. It also carries four security bumps and the
`.gitattributes` fix taken after Phase 6 merged, which a branch cut from the
phase would be missing.

This is the first phase since Phase 0 that does not stack.

---

## Scope

### In

- `src/content/transcripts/`, holding `.mdx` transcripts with typed
  frontmatter, read the way `src/content/patients/` is read.
- `src/domain/transcript.ts`: the frontmatter schema and the pure functions,
  reading no clock, no filesystem and no database.
- `src/domain/slug.ts`: the filename rule Phase 6 fixed, extracted so both
  collections share one copy. See decision D3.
- `src/content/transcripts.ts`: the second impure module, and the one that
  resolves a transcript's cast against the patient collection.
- `/transcripts`: the session list.
- `/transcripts/[slug]`: one transcript — header block, cast, the session.
- Transcript layout: speaker labels, timestamps, clinician annotations, per the
  roadmap's own bullet.
- Three authored transcripts, cast from Phase 6's five patients.
- `e2e/transcripts.spec.ts`, including the done-when probe.

### Out — forbidden in this phase

- **Audio, and any interactivity.** The roadmap says so by name. No player, no
  disclosure widget, no filter, no form, no `<button>`, no `"use client"`.
- **A `transcripts` field on a patient chart.** The cast is declared in one
  direction only — decision D2. Phase 6's five charts are not edited by this
  phase, and `git diff` proves it.
- **Any link from `/`, `/intake`, `/waiting-room`, a case file or a patient
  chart.** Phase 9 owns navigation. The cross-link runs transcript to patient
  and not back.
- **Any change to the database, `src/db/`, `drizzle/`, or a new migration.**
  Transcripts are files, as patients are.
- **Any change to `src/domain/diagnosis.ts`, `case.ts`, `case-note.ts` or
  `waiting-room.ts`.** A transcript may cite a code; the index is read-only
  here.
- **Search, filtering or sorting controls.** As Phases 5 and 6.
- **A print stylesheet or design work.** Phases 8 and 10.
- **Images, avatars, or any binary asset.** As Phase 6, and for the same
  reason: a photograph would break the fiction in a way a clinic number does
  not.
- **An LLM, and anything else on the rejected list.** The transcripts are
  authored by a human. A generated transcript of a therapy session would be the
  one thing this repository has argued against since Phase 0.

---

## Decisions

### D1 — Transcripts are a second collection, built like the first

`src/content/transcripts/`, `.mdx`, typed frontmatter, one impure reader,
compiled with `next-mdx-remote` and `remark-gfm`. The convention in
[tech-stack.md](../tech-stack.md) under **How the MDX line is implemented** was
written during Phase 6 precisely so the second collection would not have to
re-derive it, and this is the phase that tests whether it worked.

Where Phase 7 departs from Phase 6 it says so and says why. Everywhere else it
copies, deliberately, because two collections built differently would teach the
reader that the first way was arbitrary.

### D2 — The cast is declared in the transcript, and nowhere else

A transcript's frontmatter carries `cast`, a list of patient slugs. A patient
chart carries nothing about transcripts.

The alternatives were a `transcripts` field on the patient, or both directions
kept in agreement by a test. Both are rejected:

- A back-reference means **adding a transcript edits a chart**, which breaks the
  property Phase 6 exists to demonstrate — that adding a file publishes content
  with no other change. Phase 6's done-when condition would still pass, and its
  spirit would not.
- Both directions is two sources of truth for one fact, held in agreement by a
  test. Phase 6 rejected exactly this shape when it refined history codes
  against `diagnosis.ts` rather than restating them, and the argument has not
  changed.

The cost is accepted and named: **a patient chart cannot show which sessions the
patient attended** without reading every transcript. No page in this phase needs
to, so no page does. A later phase may want it, and it will be a read across the
transcript collection rather than a field.

### D3 — The filename rule moves to `src/domain/slug.ts`

Phase 6 put `slugFromFilename` in `src/domain/patient.ts`, which was right when
there was one collection. There are now two, and a transcript module importing a
patient module to learn what a filename may look like would be the wrong shape.

The function and its regular expression move to `src/domain/slug.ts` unchanged.
`patient.ts` imports it rather than defining it, and the rows of
`patient.test.ts` that cover it move with it. This amends Phase 6's decision D3,
and that decision is marked amended in
`specs/2026-10-27-phase-6-patient-profiles/requirements.md` in the same commit
range rather than silently superseded.

The rule itself does not change: lowercase letters, digits, single internal
hyphens, ending `.mdx`.

### D4 — The cast is resolved in the reader, not in the schema

Phase 6 refined a history entry's `code` inside the Zod schema, against
`diagnosisIndex`, because the index is a static in-repo array that a pure module
can import. **A patient slug is not.** It is a filename in a directory, which
only the filesystem knows, and `src/domain/` is pure by the rule Phase 6's
decision D9 set.

So the check splits in two:

- `src/domain/transcript.ts` validates that each cast entry is **shaped** like a
  slug — the `slug.ts` rule applied to a bare string rather than a filename.
  Pure, synchronous, unit-tested with no disk.
- `src/content/transcripts.ts` resolves each shaped slug against the **actual**
  patient collection and throws when one does not resolve, naming the transcript
  file, the field path and the slug.

This is the only structural difference between the two collections, and it
exists because the thing being referred to lives somewhere else, not because the
second collection was built with less care.

### D5 — An unresolved cast member fails the build

Not a 404, not a plain-text name, not a silently dropped link. `next build`
stops with

```
group-2026-03-04.mdx: cast.1: no patient chart exists for "mallow-2".
```

A transcript naming a patient who does not exist is a broken record, and Phase
6's decision D4 argument applies unchanged: a page that renders most of a
document and says nothing about the rest is worse than a build that stops. Both
routes are prerendered, so the failure lands at build time on the person who
wrote the file, who is the only person able to fix it.

This is also what makes the roadmap's cross-link condition a property rather
than a hope.

### D6 — Turns are authored as components, not as a prose convention

A transcript's body carries speaker turns. Two options were rejected:

- **Frontmatter.** Forty turns in YAML is not a document, and Phase 6's decision
  D5 split metadata from prose for exactly this reason — prose belongs in the
  body.
- **A prose convention**, such as a bolded name and a timestamp at the head of
  each paragraph. It renders, and it carries no structure: the speaker cannot be
  linked to their chart, and a misspelt name is invisible.

Instead the body uses two elements, resolved through the MDX component map:

```mdx
<Turn speaker="mallow-1" at="00:04">
  I want to be clear that I am not certain this is what was meant.
</Turn>

<Annotation>
  Patient qualified the statement before making it, as at assessment.
</Annotation>
```

`speaker` is either a cast slug or the transcript's `clinician`. A patient
speaker renders as a link to their chart, labelled with their designation; the
clinician renders as a plain label. **A `speaker` that is neither fails the
build**, by the same argument as D5.

This keeps the MDX source readable on its own, which is the Phase 3 bar that
Phase 6 applied to authored content and this phase inherits.

### D7 — The order is most recent session first

`/transcripts` lists newest first, which is the waiting room's order and not the
patient register's.

A register is a roster and is read from the top, so Phase 6 ordered it by clinic
number. A list of sessions is a record of events, and the question a reader
brings to it is what happened most recently. The field is `date`, the order is
descending, and ties break by slug so that the order is total and the build is
deterministic.

### D8 — Frontmatter is six fields

`title`, `date`, `clinician`, `setting`, `cast`, `summary`.

`summary` is the one line the index shows, and it exists because a list of
session titles tells a reader nothing. `setting` is the room; it sits in the
frontmatter rather than in the prose because it is the same shape of fact as the
clinician — something a record carries in its header.

Strict object, as Phase 6: an unrecognised key is almost always a misspelling of
a recognised one, and a misspelling that publishes is what the schema is for.

### D9 — Three transcripts

Enough to show the collection is a collection, few enough to read in one
sitting. One session with three patients present, one with two, and one a
patient attends for the first time — so the cast is visibly variable rather than
one list repeated three times.

Every cast member is one of Phase 6's five. No new patient is invented here;
inventing one would mean inventing a chart, and that is Phase 6's work.

### D10 — Both routes are prerendered

As Phase 6's decision D7. `generateStaticParams` enumerates the transcript
directory, and `npm run build` must report both routes static. A dynamic route
would mean something on this path reads a request, a clock or a table, all three
of which this phase forbids.

### D11 — The done-when condition is proved by adding a file

As Phase 6's decision D10. `e2e/transcripts.spec.ts` writes a probe transcript
into the content directory during the run, asserts that it publishes and that
its cast link resolves, and deletes it in a `finally`. The filename prefix is
fixed and `.gitignore` excludes it.

The probe's cast names a real patient, because a probe that avoided the
cross-link would test the easy half of the condition.

### D12 — No new dependencies

The toolchain Phase 6 installed is the toolchain this phase uses.
`next-mdx-remote`, `remark-gfm` and `@types/mdx` are already pinned. If this
phase appears to need a dependency, that is a signal to re-read decision D1
before it is a signal to install anything.

---

## Context

### What Phase 6 left

Five charts in `src/content/patients/`, each with a slug derived from its
filename, read by `listPatients(dir)` and `readPatient(slug, dir)` in
`src/content/patients.ts`. The register orders by clinic number; the chart route
prerenders from `generateStaticParams`.

The roster this phase casts from:

| Slug         | Designation | Number | Status       | Clinician    |
| ------------ | ----------- | ------ | ------------ | ------------ |
| `mallow-1`   | Mallow-1    | P-0007 | Active       | T. Vosk      |
| `arbour-7`   | Arbour-7    | P-0041 | Active       | H. Pell      |
| `quince-3`   | Quince-3    | P-0063 | In remission | D. Marchetti |
| `sorrel-2`   | Sorrel-2    | P-0112 | Lapsed       | A. Rusk      |
| `tamarisk-4` | Tamarisk-4  | P-0205 | Active       | N. Ibarra    |

Phase 6 also left a note in `roadmap.md` under Phase 7 recording that the cast
question was deliberately open. Decision D2 closes it.

### What this phase does not change

`/`, `src/app/layout.tsx`, `src/app/intake/`, `src/app/cases/`,
`src/app/waiting-room/`, `src/db/`, `drizzle/`, the five patient charts, and
`src/domain/case.ts`, `case-note.ts`, `diagnosis.ts` and `waiting-room.ts`.

`src/domain/patient.ts` **does** change, by decision D3, and only by losing the
filename rule to `src/domain/slug.ts`. That is the one Phase 6 module this phase
touches, and validation checks that it is the only one.

---

## Risks and open questions

- **The component map is now per-transcript.** `<Turn>` needs the cast's
  designations to label a link, so the map is built by the reader for the
  transcript being compiled rather than imported as a constant. This is a real
  departure from Phase 6's static map and the first place a reader will ask why.
  The plan builds it in one place and comments it there.
- **Three transcripts, five patients, one voice risk.** Phase 6 found that five
  charts in one register read as one chart five times. A transcript has several
  speakers inside one document, so the risk is sharper: every patient sounding
  the same within one session would be worse than five identical charts. Each
  patient's speech has to match the chart that describes it, which is a
  constraint Phase 6's content did not have.
- **Left open for Phase 8:** whether a discharged patient may appear in a
  transcript dated before the discharge. The answer is obviously yes, and
  nothing in this phase depends on it, so no rule is written. Phase 8 writes one
  when it has a discharge to reason about.
