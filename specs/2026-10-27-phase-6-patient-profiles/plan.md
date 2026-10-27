# Phase 6 — Patient profiles: Plan

Task groups are numbered and ordered. Each leaves the repo in a committable
state. Do not start a group until the previous one's check passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The toolchain comes first and the charts come before the routes, because a route
rendering content that does not exist yet cannot be looked at, and a chart whose
frontmatter the schema has not seen is a guess about the schema.

---

## 1. The toolchain, and the spec it amends

1.1 Amend [tech-stack.md](../tech-stack.md): its table says "MDX files in-repo"
without naming a toolchain. Record `next-mdx-remote` with `remark-gfm`, and the
reasoning from decision D2, including why `@next/mdx`'s `pageExtensions` route
mechanism was rejected. This is the amendment `CLAUDE.md` asks for and it
belongs in the same commit range as the code, not after it.

1.2 Install `next-mdx-remote` and `remark-gfm`, and `@types/mdx` as a dev
dependency. Resolve each version with `npm view <pkg> version` and pin it
exactly — no `^`, no `~`.

1.3 Confirm nothing on the rejected list arrived as a transitive peer that the
project is now expected to import directly. A transitive dependency is not a
decision; a new import is.

1.4 Add the e2e probe filename prefix to `.gitignore`, per decision D10.

**Check:** `npm run verify` passes with the new dependencies installed and
nothing else changed, `grep -E '"[~^]' package.json` returns nothing, and
`specs/tech-stack.md` names the toolchain.

---

## 2. The schema and the pure functions

2.1 Create `src/domain/patient.ts`.

2.2 Write the frontmatter schema per decision D4: `name`, `number`, `status`,
`intake`, `clinician`, `presenting`, `history`. Clinically-worded messages, as
Phase 2's intake schema has.

2.3 Refine each history entry's `code` against the keys of
`src/domain/diagnosis.ts`. Import the index; do not restate the codes. A second
list of codes would be a second source of truth.

2.4 `slugFromFilename(filename)` per decision D3 — validate the shape, return
the slug, and reject with the filename in the message.

2.5 `registerOrder(patients)` — the order the register renders in. Decide it and
record why in a comment: it is the one piece of this phase a reader will
otherwise assume is arbitrary.

2.6 `mostRecentContact(patient)` — the last history entry by date, which is what
the register's final column shows. It must not assume the entries are authored
in order.

2.7 Write the unit tests: one named test per row of the table in
[validation.md](./validation.md) §3.

**Check:** `npm run test` passes, every row of §3 has a named test, and no test
in this file reads the clock, the disk or the database.

---

## 3. The reader

3.1 Create `src/content/patients.ts`. This is the only module in the phase that
touches the filesystem, and it says so in a comment at the top.

3.2 `listPatients(dir)` — read the directory, keep `.mdx` files, derive each
slug, parse and validate each file's frontmatter, and return them in register
order. The directory is a parameter with the real path as its default, per
decision D9.

3.3 Throw on the first invalid file, with the filename, the field path and the
reason. A page that renders four of five charts and says nothing about the fifth
is worse than a build that stops.

3.4 Check `number` uniqueness across the directory and fail with both filenames
when it is violated.

3.5 `readPatient(slug, dir)` — one chart, compiled. Return the validated
frontmatter and the compiled body. A slug that does not resolve returns nothing
rather than throwing, so the route can call `notFound()` per decision D8.

3.6 Write the content-integrity test per decision D9: every authored chart
validates, the numbers are unique, every cited code is in the index. It reads
the real directory, and the file's top comment says why this one is allowed to.

**Check:** `npm run test` passes. Temporarily break one chart's frontmatter and
confirm the failure names the file and the field, then restore it.

---

## 4. The charts

4.1 Write five patients into `src/content/patients/`, per decision D6: one for
each of Phase 4's four code groups, and a fifth whose history crosses two.

4.2 Each chart's body carries the narrative sections — mental status,
formulation, the human's contribution, the plan. Headings only; no component,
no styling.

4.3 Apply the mission's swap test to each chart as it is written, not afterwards.
Could this appear verbatim in a real chart with the subject matter swapped? If
not, rewrite it. No exclamation marks, no winking, no joke about the joke.

4.4 Keep the designations invented, on the one pattern decision D6 fixes. No
real vendor, model or person, and no real condition or treatment.

4.5 Vary the prose. Five charts in one voice is one chart five times; a clinic
has several clinicians and the `clinician` field says so.

**Check:** the content-integrity test passes against all five, and reading one
chart's MDX source gets the premise with no other context — which is the Phase 3
bar applied to authored content.

---

## 5. The routes

5.1 Create `src/app/patients/page.tsx` as a Server Component: the register, a
`<table>` with a header row and one row per patient — number, name, status,
presenting line, most recent contact.

5.2 The name links to `/patients/[slug]` with `next/link`.

5.3 Give the register the clinic's own framing line, in register, as
`/waiting-room` has. One line, no second person, no explanation.

5.4 Create `src/app/patients/[slug]/page.tsx`: the header block from the
frontmatter, the history as a dated list with each code, and the compiled body.

5.5 `generateStaticParams` on the chart route, enumerating the directory, per
decision D7.

5.6 An unresolved slug calls `notFound()`, per decision D8.

5.7 The MDX component map per decision D11 — semantic elements, existing
utilities, nothing new.

5.8 Handle an empty content directory with a line in register rather than an
empty table, as Phase 5's step 3.7 did for the waiting room. There is no state
of the repository where this page should look broken.

**Check:** `/patients` lists five patients, each link lands on its chart, and
`npm run build` reports both routes as static, not `ƒ`.

---

## 6. The spec

6.1 Create `e2e/patients.spec.ts`.

6.2 One test for the register and a chart: five rows, a link followed, the
chart's header block and its history assertions scoped and exact — not matched
against a label, per the note carried forward since Phase 3.

6.3 The done-when test per decision D10: write the probe `.mdx`, load
`/patients`, assert the new patient is on the register, load its slug, assert
the chart renders, and delete the file in a `finally`.

6.4 Assert an unknown slug is a 404.

6.5 Break one new assertion deliberately and confirm a real assertion diff.

6.6 Confirm the tree is clean after the run, and that a deliberately killed run
leaves nothing but an ignored probe file.

**Check:** `npm run test:e2e` reports three files, one worker, all passing, and
`git status --porcelain` is empty afterwards.

---

## 7. Review against the spec

7.1 Walk [validation.md](./validation.md) and tick every row with evidence.

7.2 Re-read the Out list. Confirm no case-to-patient link, no transcript, no
link from `/`, no schema change, no migration, no search, no filter, no sort, no
image, no design system.

7.3 Confirm `/`, `src/app/layout.tsx`, `src/app/intake/`, `src/app/cases/`,
`src/app/waiting-room/`, `src/db/`, `drizzle/` and the four existing
`src/domain/` modules are byte-identical to `phase-5-waiting-room`.

7.4 Confirm [roadmap.md](../roadmap.md) Phase 6 still matches what was built,
and record against Phase 7 anything this phase learned that it needs — the cast
question in particular.

7.5 If reality diverged from the spec anywhere, amend the spec in the same
commit range and say why.

7.6 Commit, push, open a pull request against `main`, stating the Phase 1 to
Phase 6 merge order.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the stacking is stated.
