# Phase 6 — Patient profiles: Requirements

**Branch:** `phase-6-patient-profiles`, branched from `phase-5-waiting-room`
**Roadmap phase:** [Phase 6 — Patient profiles](../roadmap.md)
**Date:** 2026-10-27

---

## Goal

`/patients` and `/patients/[slug]` — authored, recurring patients.

Phases 1 to 5 built the clinic's write path: a visitor submits a complaint and
the clinic documents it. Nothing on the site yet has a history. This phase adds
the other half of a clinic's paperwork — the patients it sees repeatedly, whose
charts are authored rather than submitted, and who become the cast of the group
sessions in Phase 7.

It is also the first phase where **content is a file, not a row**. The roadmap's
done-when condition is that **adding an MDX file publishes a patient with no
code change**, which makes the content directory a public interface and the
frontmatter a schema.

---

## Branch base, and why it is not `main`

Cut from `phase-5-waiting-room`.

Nothing here reads the database, so this phase could technically be cut from
`main`. It is not, for two reasons. `main` contains none of Phases 1 to 5, so a
branch from it would render a site with no intake, no case file and no list, and
the validation rows that compare a file against the previous phase's branch
would have nothing to compare against. The repository is also a teaching
artefact: the phases are meant to read in order, and a branch that skips four of
them reads as a parallel universe rather than as the next chapter.

**Consequence:** this pull request stacks five deep — Phases 1, 2, 3, 4, 5, then
this — and they merge in that order.

---

## Scope

### In

1. **`src/content/patients/`**, holding one `.mdx` file per patient.
2. **Typed frontmatter**, defined as a Zod schema in `src/domain/patient.ts` and
   validated when the file is read. A file that does not satisfy it fails the
   build loudly, with the filename in the message.
3. **Five authored patients**, each with a chart history — see decision D6.
4. **A route `/patients`** — the clinic's register, one row per patient.
5. **A route `/patients/[slug]`** — the patient's chart: the frontmatter as a
   header block, the history as a dated list, and the MDX body as the narrative.
6. **One impure reader module**, `src/content/patients.ts`, the only code in the
   phase that touches the filesystem, taking the directory as a parameter so a
   test can point it elsewhere.
7. **Pure functions in `src/domain/patient.ts`** — the schema, the slug rules,
   the register order — with unit tests.
8. **A third Playwright spec file**, `e2e/patients.spec.ts`, proving the
   done-when condition by adding a file rather than by reasoning about one.
9. **An amendment to [tech-stack.md](../tech-stack.md)** recording which
   packages implement its "MDX files in-repo" line. See decision D2.

### Out — forbidden in this phase

- **Linking patients to submitted cases.** The roadmap says so by name. No
  patient page lists rows from the `cases` table, and no case file names a
  patient. The two populations stay separate until a later phase has a reason to
  join them, and this phase is not it.
- **Transcripts, and any cross-link to a cast.** Phase 7. A chart may record
  that a patient attends group; it may not link to a transcript, because no
  transcript exists.
- **Any link from `/`, `/intake`, `/waiting-room` or a case file.** Phase 9 owns
  navigation. `/` stays byte-identical, as it has since Phase 0.
- **Any change to the database, the schema, a migration, or `src/db/`.**
  Patients are files. If this phase touches `drizzle/`, something has gone
  wrong.
- **Any change to `src/domain/diagnosis.ts`.** The chart histories cite codes
  from Phase 4's index and the schema checks that the cited codes exist, but the
  index itself is read-only here. A patient who needs a code that does not exist
  is an amendment to Phase 4's spec, not a table edit.
- **Search, filtering or sorting controls on the register.** As Phase 5: the
  order is fixed and there is no form on either page.
- **MDX files under `src/app/`, and `@next/mdx`'s `pageExtensions` route
  mechanism.** See decision D2.
- **Images, avatars, or any binary asset.** The offline constraint and Phase
  10's design pass both argue against it, and a photograph of a patient would
  break the fiction in a way a chart number does not.
- **A print stylesheet or design work.** Phases 8 and 10.
- **An LLM, and anything else on the rejected list.** The charts are authored by
  a human. That is what the content directory is for.

---

## Decisions

### D1 — Patients are files, and the filesystem is the record

No table, no migration, no row. `src/content/patients/<slug>.mdx` is the chart.

**Why:** the roadmap's done-when condition is that adding a file publishes a
patient, and [tech-stack.md](../tech-stack.md) already names MDX in-repo as the
mechanism for authored content. A table would mean a migration, a seed script
and a second place to look for the clinic's cast, for content that changes only
when somebody writes prose.

**Consequence worth stating plainly:** the clinic now has two kinds of patient
with nothing in common — the anonymous submitter who gets a case number from the
database, and the named recurring patient who gets a chart from a file. They are
not reconciled here, and the Out list forbids reconciling them.

### D2 — MDX is compiled from `src/content/`, not routed from `src/app/`

The reader reads the file with `node:fs/promises` and compiles it through
`next-mdx-remote`'s React Server Components entry point. Frontmatter is parsed
by the same call and handed to the Zod schema.

**Why not `@next/mdx` with `pageExtensions`:** that mechanism makes each MDX
file a route by putting it in `src/app/`. It is less code for a
one-page-per-file site, and it is wrong here on three counts. It puts content in
the route tree, contradicting the `src/content/` convention in
[tech-stack.md](../tech-stack.md). It gives the register nothing to read,
because there is no list of MDX modules to enumerate without a second
mechanism. And frontmatter under it is a module export rather than data, so a
typo is a type error in the best case and a missing heading on a published page
in the worst.

**Why not `@mdx-js/mdx` plus `gray-matter` directly:** that is what
`next-mdx-remote` is — a thin wrapper over exactly those two with the RSC
plumbing already written. Two dependencies and forty lines of our own, against
one dependency and none, for identical output.

**Why this does not break the offline constraint:** compilation happens at build
time, from files in the repository. Nothing is fetched. `remark-gfm` is included
so a chart can hold a table, and it too runs locally.

**This decision amends [tech-stack.md](../tech-stack.md)** rather than sitting
only here: its table says "MDX files in-repo" without naming a toolchain, and
the next person to add a content type should not have to re-derive this. Plan
step 1.1 makes that amendment inside this phase's commit range, per `CLAUDE.md`.

### D3 — The slug is the filename, and the filename is validated

`arbour-7.mdx` publishes at `/patients/arbour-7`. There is no `slug` field in
the frontmatter.

**Why:** the done-when condition is about adding a file, so the file's name is
what the author chose and what the URL should reflect. A `slug` field would let
the two disagree, and the rule resolving that disagreement is one nobody wants
to look up.

**The filename shape is checked** — lowercase letters, digits and hyphens, then
`.mdx`. A file called `Arbour 7.mdx` is rejected with its name in the message
rather than published at a URL that needs escaping.

### D4 — Frontmatter is a Zod schema, and a bad file fails the build

One schema in `src/domain/patient.ts`, per the repository's convention that
there is one Zod schema per entity and it lives in `src/domain/`:

| Field        | Type                     | Notes                                      |
| ------------ | ------------------------ | ------------------------------------------ |
| `name`       | non-empty string         | The designation the clinic uses.           |
| `number`     | `P-` and four digits     | Clinic-assigned, unique across the folder. |
| `status`     | one of a fixed set       | Active, in remission, lapsed, discharged.  |
| `intake`     | `YYYY-MM-DD`             | Date of first contact.                     |
| `clinician`  | non-empty string         | Who holds the chart.                       |
| `presenting` | one sentence             | The register's one-line summary.           |
| `history`    | at least one dated entry | A date, a code, and a one-line note.       |

**Why validation fails rather than warns:** "adding an MDX file publishes a
patient with no code change" cuts both ways. If a typo publishes a chart with a
blank status, the no-code-change property has become a liability. A build that
stops with `arbour-7.mdx: history.0.code: ACDI-99 is not in the index` is what a
schema is for.

**Why the cited codes are checked against `src/domain/diagnosis.ts`:** Phase 4
built a twenty-code index, and the unmistakable fictionality of that scheme is
one of its done-when conditions. An authored chart citing `ACDI-21` would
quietly contradict it. The schema refines against the index's own keys, so the
check cannot drift from the index.

**Uniqueness of `number` is checked across the directory**, not per file, which
is the one check a per-file schema cannot make. It lives in the reader.

### D5 — The chart is structured metadata plus authored prose, and the split is deliberate

Frontmatter carries what a register can tabulate. The MDX body carries what only
prose can say: mental status, formulation, the human's contribution, the plan.

**Why not put the history in the body as well:** the register needs the most
recent contact and the current code for every patient, and parsing those back
out of rendered prose is the kind of cleverness that works until a chart is
written slightly differently. Dated entries are data.

**Why not put the formulation in the frontmatter:** it is three paragraphs of
clinical register, and YAML is a bad place to write prose. The body is MDX
precisely so the narrative can have headings.

### D6 — Five patients, and why five

One for each of Phase 4's four code groups, and a fifth whose history crosses
two of them.

**Why not four:** a register where every patient sits in a different group reads
as a demonstration of the code table rather than as a caseload. The fifth
patient is the one whose chart shows the clinic revising its own assessment,
which is what a chart history is for.

**Why not six:** the roadmap says four to six, and each patient is several
hundred words of clinical prose that has to pass the mission's swap test. Five is
the number that can be written well in this phase rather than drafted in it.

**Patients are fictional agents, and the fiction is checked.**
[mission.md](../mission.md) forbids naming real vendors, models or individuals
as patients. The designations are invented on one pattern — a plant name and a
number, which reads as institutional and belongs to nobody. Validation §5 greps
the content directory for real vendor and model names and expects nothing.

### D7 — Both routes are prerendered, and that is the proof there is no database

`generateStaticParams` enumerates the content directory, so the route table
shows `/patients` and `/patients/[slug]` as static.

**Why this is worth a validation row:** Phase 5's row 1.2 required
`ƒ /waiting-room`, because a static waiting room would freeze every waiting time
at build time. This phase requires the opposite, for the opposite reason:
authored content has no per-request input, so anything dynamic here means
something is reading a request, a clock, or a database this phase forbade.

**Consequence:** a new MDX file needs a build to appear in production, and
appears immediately in development, where the directory is read per request.
That is correct for authored content, and it is what Phase 12 deploys.

### D8 — An unknown slug is a 404

`notFound()`, as Phase 1's decision D6 had it for `/cases/[id]`: a path segment
names a resource, and a resource that does not exist is absent. The register is
the list of what exists.

### D9 — One test reads the filesystem, and that is the point

The unit tests for the schema and the pure helpers read neither the clock nor
the disk, as every phase since Phase 2. **One** test file reads the content
directory: it loads every authored chart and asserts that each validates, that
the numbers are unique, and that every cited code is in the index.

**Why the exception is correct:** the content directory is this phase's public
interface. A suite that validates a hand-written fixture and never the five real
charts would pass while the site was broken. The test is deterministic — the
files are in the repository — and it fails for exactly the reason a reader
wants: somebody wrote a chart wrong.

**The reader takes its directory as a parameter**, so the discovery tests can
point it at a temporary directory. That is also how the done-when condition gets
a unit-level proof alongside its browser one.

### D10 — The done-when condition is proved by adding a file during the test

`e2e/patients.spec.ts` writes one probe `.mdx` file into
`src/content/patients/`, loads `/patients`, asserts the new patient is on the
register and that its slug renders, and deletes the file in a `finally` block.

**Why from the outside:** "publishes a patient with no code change" is a claim
about the running site. A unit test over the reader proves discovery; only the
browser proves publication.

**Why this is safe to run against the repository:** Playwright has been pinned
to one worker since Phase 5's decision D6, so nothing else is reading the
directory at the time. The probe filename is fixed and prefixed, `.gitignore`
excludes that prefix, and the deletion is in a `finally` — so a crashed run
leaves a file that is both ignored and obviously a probe.

**The risk this accepts:** the probe is only observable if Next re-reads the
directory per request in development. If it caches, the register assertion is
the fallback — a plain Server Component read with no caching directive — and the
risk table records what to do if neither holds.

### D11 — The MDX component map is semantic, not decorative

A small map passed to the compiler, giving the elements a chart actually uses —
headings, paragraphs, lists, tables — the same spacing utilities the case note
and the register already use. No new colour, no new font, no component class.

**Why a map at all:** unstyled MDX output inherits nothing and renders as a wall
of undifferentiated text, which fails the mission's "a stranger reading one
chart gets the premise" bar for reasons that have nothing to do with design.
Phase 10 still owns the design system. This is the minimum that makes a document
read as a document.

### D12 — Versions are pinned exactly, resolved at install time

As every phase since Phase 0. This phase adds dependencies —
`next-mdx-remote`, `remark-gfm`, and `@types/mdx` as a dev dependency — and each
is resolved with `npm view <pkg> version` at install and written without a
range. No version number in this document is authoritative, decision D2
included.

---

## Context

### What Phase 5 left

Four routes: `/`, `/intake`, `/cases/[id]`, `/waiting-room`. One table, eight
columns, two migrations. `src/domain/` holds `case.ts`, `case-note.ts`,
`diagnosis.ts` and `waiting-room.ts`, and 104 unit tests pass across five files.
`e2e/` holds two spec files and four tests, and `playwright.config.ts` pins
`workers: 1`. `src/content/` does not exist yet.

Notes this phase inherits:

- A value assertion against a labelled cell must be scoped and exact, or it
  passes against the label (Phase 3, confirmed in Phases 4 and 5).
- A spec may not depend on data that earlier runs happened to leave behind
  (Phase 5's decision D8). This phase's probe file is a fixture in that
  tradition, and the `finally` block is the part Phase 5's cold clone argued
  for.
- `getByRole("alert")` also matches Next's route announcer (Phase 1).
- Playwright's `expect` timeout is 30s because Next compiles each route on
  demand in dev. Two new routes means two cold compiles in a spec run.

**One environment note, carried from Phase 5's validation §1.** Next 16.4.0 is
affected by a published security advisory, and `next build` and Playwright's
`webServer` both abort non-zero on it periodically — which fails the whole e2e
suite with `ERR_CONNECTION_REFUSED` and nothing wrong in the application. The
fix is a patch bump to 16.4.3, taken on 2026-10-27 on its own branch,
`next-security-upgrade`, under the policy now recorded in
[tech-stack.md](../tech-stack.md): an advisory patch or minor is taken on sight
on a branch of its own, and a major is a phase. That branch is not merged. This
phase is cut from `phase-5-waiting-room` and so still carries 16.4.0 and still
needs the occasional retry; when the upgrade merges, this note is what says why
the pin moved.

### What this phase does not change

`/`, `src/app/layout.tsx`, `src/app/intake/`, `src/app/cases/[id]/`,
`src/app/waiting-room/`, `src/db/`, `drizzle/`, `src/domain/case.ts`,
`case-note.ts`, `diagnosis.ts`, `waiting-room.ts`, and `playwright.config.ts` —
Phase 5's worker pin is already exactly what this phase's third spec file needs.

---

## Risks and open questions

| Risk                                                                                                | Mitigation                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A malformed MDX file publishes a half-rendered chart instead of failing.                            | D4 validates every file against the schema at read time and fails with the filename. Validation §3 feeds the schema a bad value per field.                  |
| An authored chart cites a diagnosis code that does not exist, quietly contradicting Phase 4.        | D4 refines against `src/domain/diagnosis.ts`'s own keys, and §3 asserts the refinement rejects an invented code.                                            |
| The probe file from the e2e spec is left behind by a crashed run and gets committed.                | D10 puts the deletion in a `finally`, fixes the filename prefix, and adds that prefix to `.gitignore`. Validation §7 checks the tree is clean after a run.  |
| Next caches the directory read in development, and the done-when test can never observe a new file. | D10 names the register as the fallback assertion. If neither path observes it, the finding is recorded and the condition is proved against a build instead. |
| `next-mdx-remote` turns out to need a network fetch or a client bundle, breaking the offline rule.  | D2 states the compile is local and at build time. Validation §2 checks a chart page ships no client component for the MDX and renders with no network.      |
| The register grows a sorting control because it is a table with headers.                            | The Out list forbids it by name, and §6 counts forms, inputs and buttons on both routes, as Phase 5 did.                                                    |
| A patient's designation reads as a real vendor's model name, breaching a mission non-goal.          | D6 fixes one naming pattern, and §5 greps the content directory for real vendor and model names.                                                            |
| Five charts of authored prose drift out of register, because prose is harder to check than a table. | §5 applies the mission's swap test to each chart individually, by name, rather than asserting that the charts are fine.                                     |
| The charts read well and the register reads as a spreadsheet, so the roster is the weak page.       | §2 requires the register to carry the clinic's own framing line, and holds it to the same swap test as the charts.                                          |

**Open question for Phase 7, not this one:** whether a transcript's cast is
declared in the transcript's frontmatter, in each patient's, or in both. Phase 7
owns the cross-link and will have the five charts in front of it. This phase
deliberately adds no `transcripts` field to the patient schema, because a field
with no reader is a guess.

**Open question for Phase 8, not this one:** whether an authored patient can be
discharged, given that discharge is a status on the `cases` table while `status`
here is frontmatter. D1's two populations meet for the first time there, and this
phase's Out list keeps it out of the question.

**Open question for Phase 9, not this one:** whether the register is an entry
point from `/`, and what it is called there. The clinic's own word for the page
is "register"; the roadmap's word is "patients". Phase 9 picks one.
