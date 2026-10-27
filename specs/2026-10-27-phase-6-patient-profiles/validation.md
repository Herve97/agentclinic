# Phase 6 — Patient profiles: Validation

How to know Phase 6 succeeded and can be merged.

The roadmap's done-when condition is that **adding an MDX file publishes a
patient with no code change** (§4 row 4.1), proved by a spec that adds one.

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1); a
`"use server"` module may only export async functions (Phase 2); a value
assertion against a labelled cell must be scoped and exact, or it passes against
the label (Phase 3, confirmed in Phases 4 and 5); and a spec may not depend on
data earlier runs happened to leave behind (Phase 5).

---

## 1. The commands

| #   | Command                  | Expected                                                                 | ✓   |
| --- | ------------------------ | ------------------------------------------------------------------------ | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                     | ☐   |
| 1.2 | `npm run build`          | Exits 0. Six routes. `/patients` and `/patients/[slug]` both **static**. | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test. Seven test files.     | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                                 | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **3 files, 7 tests, 1 worker**, all passing.                    | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                                 | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0, the five charts included.                                       | ☐   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.                   | ☐   |
| 1.9 | `npm view` per package   | Each added version was resolved at install, not copied from a document.  | ☐   |

**Blocking:** all nine. Row 1.2 is the one that proves there is no database on
this path: a dynamic chart route would mean something is reading a request, a
clock or a table this phase forbade.

Row 1.5's count is an expectation, not a measurement. Amend it if the spec files
land differently, as Phase 5 amended its own.

---

## 2. The two pages

| #    | Check                  | Expected                                                                      | ✓   |
| ---- | ---------------------- | ----------------------------------------------------------------------------- | --- |
| 2.1  | The register lists     | Five patients, one row each, in the order `registerOrder` defines.            | ☐   |
| 2.2  | A real table           | `<table>` with a `<thead>` header row and one `<tr>` per patient.             | ☐   |
| 2.3  | The register's columns | Number, name, status, presenting line, most recent contact.                   | ☐   |
| 2.4  | Links through          | The name links to `/patients/[slug]` and navigating lands on that chart.      | ☐   |
| 2.5  | The chart's header     | Number, name, status, intake date, clinician — all from the frontmatter.      | ☐   |
| 2.6  | The history renders    | Every entry, dated, each with its code, in a stable order.                    | ☐   |
| 2.7  | The body renders       | The MDX narrative with its headings, as a document rather than a wall.        | ☐   |
| 2.8  | An unknown slug        | `/patients/not-a-patient` returns 404, not a 500 and not an empty chart.      | ☐   |
| 2.9  | Empty directory        | With no charts, a line in register rather than a broken table.                | ☐   |
| 2.10 | No console errors      | A real browser on both routes reports no errors and no warnings.              | ☐   |
| 2.11 | No client bundle       | The chart page ships no client component for the MDX; it renders with JS off. | ☐   |
| 2.12 | Offline                | Both routes render with the network disabled. Nothing is fetched.             | ☐   |

**Blocking:** all twelve. Row 2.9 is checked against an empty directory, not
reasoned about. Row 2.12 is the mission's demo constraint and is checked, not
assumed, because this is the first phase to add a compiler to the render path.

---

## 3. The schema and the pure functions are tested

**One named test per row.** No test in `src/domain/patient.test.ts` reads the
clock, the disk or the database; the one file that does read the disk is row
3.20's, and it is the exception decision D9 argues for.

| #    | Function            | Input                                        | Expected                         | ✓   |
| ---- | ------------------- | -------------------------------------------- | -------------------------------- | --- |
| 3.1  | Schema              | A complete, valid frontmatter object         | parses                           | ☐   |
| 3.2  | Schema              | `name` empty                                 | rejects, names the field         | ☐   |
| 3.3  | Schema              | `number` as `0041`, `P-41`, `p-0041`         | rejects each                     | ☐   |
| 3.4  | Schema              | `status` not in the set                      | rejects, lists the set           | ☐   |
| 3.5  | Schema              | `intake` as `13/10/2026`                     | rejects                          | ☐   |
| 3.6  | Schema              | `intake` as `2026-13-45`                     | rejects a shaped but unreal date | ☐   |
| 3.7  | Schema              | `clinician` missing                          | rejects                          | ☐   |
| 3.8  | Schema              | `presenting` missing                         | rejects                          | ☐   |
| 3.9  | Schema              | `history` empty                              | rejects — a chart has a history  | ☐   |
| 3.10 | Schema              | a history entry citing `ACDI-99`             | rejects, says it is not indexed  | ☐   |
| 3.11 | Schema              | a history entry citing a real indexed code   | parses                           | ☐   |
| 3.12 | Schema              | an unknown extra frontmatter key             | decided and asserted either way  | ☐   |
| 3.13 | `slugFromFilename`  | `arbour-7.mdx`                               | `arbour-7`                       | ☐   |
| 3.14 | `slugFromFilename`  | `Arbour 7.mdx`, `arbour_7.mdx`, `a.md`       | rejects each, names the file     | ☐   |
| 3.15 | `registerOrder`     | five patients, authored in a scrambled order | the order the comment states     | ☐   |
| 3.16 | `registerOrder`     | an empty list                                | an empty list, no throw          | ☐   |
| 3.17 | `mostRecentContact` | entries authored newest-first                | the newest                       | ☐   |
| 3.18 | `mostRecentContact` | entries authored oldest-first                | the newest — order-independent   | ☐   |
| 3.19 | `mostRecentContact` | two entries on the same date                 | decided and asserted             | ☐   |
| 3.20 | Content integrity   | the real `src/content/patients/`             | all parse, numbers unique        | ☐   |
| 3.21 | Reader discovery    | a temp dir with one file, then two           | both found, slugs derived        | ☐   |
| 3.22 | Reader failure      | a temp dir with one malformed file           | throws, names file and field     | ☐   |
| 3.23 | Reader uniqueness   | a temp dir with two files sharing a `number` | throws, names both files         | ☐   |
| 3.24 | Purity              | `patient.test.ts` reads no clock, disk or db | holds                            | ☐   |

**Blocking:** all twenty-four. Row 3.10 is the one that keeps the authored
content honest about Phase 4's index. Row 3.6 is the one that catches a date
regex mistaken for date validation.

---

## 4. The done-when condition

| #   | Check                   | Expected                                                                    | ✓   |
| --- | ----------------------- | --------------------------------------------------------------------------- | --- |
| 4.1 | A new file publishes    | A probe `.mdx` written during the test appears on `/patients`.              | ☐   |
| 4.2 | And renders             | Its slug renders its chart — header block, history and body.                | ☐   |
| 4.3 | With no code change     | Nothing outside `src/content/patients/` was touched to publish it.          | ☐   |
| 4.4 | Proved by a spec        | `e2e/patients.spec.ts`, not checked by hand once.                           | ☐   |
| 4.5 | The probe is cleaned up | Deleted in a `finally`; the tree is clean after the run.                    | ☐   |
| 4.6 | A killed run is safe    | Killing the run mid-test leaves at most an ignored, obviously-named probe.  | ☐   |
| 4.7 | Deliberate failure      | One new assertion was broken on purpose and produced a real assertion diff. | ☐   |

**Blocking:** all seven. Row 4.1 is the roadmap's condition. Row 4.3 is the half
of it that is easy to lose: a page that needed a new import to show the sixth
patient would have failed the condition while appearing to pass it.

---

## 5. The content holds its register, and the fiction holds

Decision D6, and the mission's voice constraint. This is the first phase whose
deliverable is mostly prose, so the prose is checked like code.

| #   | Check                | Expected                                                                         | ✓   |
| --- | -------------------- | -------------------------------------------------------------------------------- | --- |
| 5.1 | The swap test        | Each of the five charts, named individually, could appear verbatim in a chart.   | ☐   |
| 5.2 | No winking           | No exclamation mark, no second person, no aside about the premise, in any chart. | ☐   |
| 5.3 | Precise absurdity    | Each chart quantifies at least one absurd thing exactly, per the mission.        | ☐   |
| 5.4 | No real entities     | A grep of the content directory for real vendor, model and person names: none.   | ☐   |
| 5.5 | No real conditions   | No real diagnosis, condition or treatment named. Codes come from Phase 4 only.   | ☐   |
| 5.6 | Five distinct voices | The charts are not one chart five times; the `clinician` field means something.  | ☐   |
| 5.7 | The register reads   | Its framing line passes the swap test too, and does not explain the joke.        | ☐   |
| 5.8 | A stranger gets it   | One chart read cold conveys the premise, as Phase 3 required of the case file.   | ☐   |

**Blocking:** all eight. Row 5.4's grep list is written down in the evidence,
not improvised, so the next content phase can reuse it.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                             | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Any read of the `cases` table from a patient route                         | Never      | ☐   |
| 6.2  | Any patient named on a case file, or any case named on a chart             | Never      | ☐   |
| 6.3  | A transcript, a cast list, or a `transcripts` frontmatter field            | Phase 7    | ☐   |
| 6.4  | A search field, a filter, or a sorting control                             | Never      | ☐   |
| 6.5  | Any form, button, or `<input>` on either new route                         | Never      | ☐   |
| 6.6  | A link on `/`, or from intake, the waiting room or a case file             | Phase 9    | ☐   |
| 6.7  | Any change to `src/db/`, `drizzle/`, or a new migration                    | Phase 2    | ☐   |
| 6.8  | Any change to `case.ts`, `case-note.ts`, `diagnosis.ts`, `waiting-room.ts` | Phases 2–5 | ☐   |
| 6.9  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                   | Phase 9    | ☐   |
| 6.10 | An MDX file under `src/app/`, or `pageExtensions` in the config            | Never      | ☐   |
| 6.11 | An image, an avatar, or any binary asset                                   | Never      | ☐   |
| 6.12 | `@media print` or any print stylesheet                                     | Phase 8    | ☐   |
| 6.13 | Custom colours, fonts, spacing scale, component classes                    | Phase 10   | ☐   |
| 6.14 | Anything from the rejected list, or a dependency beyond decision D12       | Never      | ☐   |
| 6.15 | A route beyond the six this phase leaves                                   | Phase 7+   | ☐   |

**Blocking:** all fifteen. Row 6.1 is the roadmap's own Out item and the one a
later reader is most likely to assume was done anyway.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                        | ✓   |
| --- | -------------------------- | --------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-5-waiting-room`, still no links.       | ☐   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                      | ☐   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                             | ☐   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                       | ☐   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                 | ☐   |
| 7.6 | One worker                 | `playwright.config.ts` still pins `workers: 1`, now 3 files.    | ☐   |
| 7.7 | Clean tree                 | `git status` clean after dev, build, test and e2e.              | ☐   |
| 7.8 | Cold clone                 | Clone, install, one command, both routes render. No credential. | ☐   |

**Blocking:** all eight. Row 7.8 is the row that found Phase 5's real defect,
and this phase's content is in the repository rather than in a database, so it
is the row most likely to pass trivially and most worth running anyway.

---

## Merge gate

Phase 6 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all twenty-four rows.
3. Section 4 row 4.1 is proved by `e2e/patients.spec.ts`, by adding a file.
4. Section 1 row 1.2 shows both new routes static.
5. Section 5 is ticked chart by chart, not in aggregate.
6. `npm run verify:all` passes.
7. `/`, intake, the case file, the waiting room and the whole write path are
   byte-identical to `phase-5-waiting-room`.
8. **Phases 1 to 5 have merged**, or this pull request is explicitly marked as
   stacked on them, in that order.

## Explicitly not validated here

- Whether anything links to the register — Phase 9.
- Whether a patient appears in a transcript — Phase 7.
- Whether an authored patient can be discharged — Phase 8.
- Print layout, design and the axe audit — Phases 8 and 10.
- Whether the content directory scales past a few dozen charts. Every chart is
  read to render the register, which is correct at five and worth measuring at
  five hundred. Phase 12 is the first phase with a reason to.
