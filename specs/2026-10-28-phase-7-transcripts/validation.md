# Phase 7 — Group session transcripts: Validation

How to know Phase 7 succeeded and can be merged.

The roadmap's done-when condition is that **transcripts render in the house
layout and cross-link to the patient profiles of everyone present** (§4), proved
by a spec that navigates the link rather than by reading an `href`.

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1); a
`"use server"` module may only export async functions (Phase 2); a value
assertion against a labelled cell must be scoped and exact, or it passes against
the label (Phase 3, confirmed in Phases 4, 5 and 6); a spec may not depend on
data earlier runs happened to leave behind (Phase 5); and **a validation row
that was only ever run in the author's working tree is not evidence** (Phase 6,
found after it merged — row 1.7 had been ticked since Phase 0 and was false on
every cold clone).

---

## 1. The commands

| #   | Command                  | Expected                                                                     | ✓   |
| --- | ------------------------ | ---------------------------------------------------------------------------- | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                         | ☐   |
| 1.2 | `npm run build`          | Exits 0. Eight routes. `/transcripts` and `/transcripts/[slug]` both static. | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test.                           | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                                     | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **4 files, 1 worker**, all passing. Count amended once measured.    | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0, read unpiped.                                                       | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0 **in a cold clone**, not only here. See the carried-forward note.    | ☐   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.                       | ☐   |
| 1.9 | `npm ls`                 | No dependency added. Decision D12.                                           | ☐   |

**Blocking:** all nine. Row 1.2 is the one that proves there is no database on
this path. Row 1.7 is run the way Phase 6 learned to run it — in a fresh clone,
because that is where it failed for six phases.

Row 1.5's file count is fixed at four; its test count is an expectation and is
amended here once measured, as Phases 5 and 6 amended theirs.

---

## 2. The two pages

| #    | Check              | Expected                                                                     | ✓   |
| ---- | ------------------ | ---------------------------------------------------------------------------- | --- |
| 2.1  | The list           | Three sessions, one row each, in the order `transcriptOrder` defines.        | ☐   |
| 2.2  | A real table       | `<table>` with a `<thead>` header row and one `<tr>` per transcript.         | ☐   |
| 2.3  | The list's columns | Date, title, clinician, cast, summary.                                       | ☐   |
| 2.4  | Newest first       | The dates on the page are descending, asserted across the page, not sampled. | ☐   |
| 2.5  | Links through      | The title links to `/transcripts/[slug]` and navigating lands on it.         | ☐   |
| 2.6  | The header block   | Title, date, clinician, setting, cast — all from the frontmatter.            | ☐   |
| 2.7  | The turns render   | Each with its speaker label and timestamp, in authored order.                | ☐   |
| 2.8  | Annotations render | Visually and semantically distinct from a turn, not just indented.           | ☐   |
| 2.9  | An unknown slug    | `/transcripts/not-a-session` returns 404, not a 500 and not an empty page.   | ☐   |
| 2.10 | Empty directory    | With no transcripts, a line in register rather than a broken table.          | ☐   |
| 2.11 | No console errors  | A real browser on both routes reports no errors and no warnings.             | ☐   |
| 2.12 | No client bundle   | No client component for the transcript; it renders with JavaScript off.      | ☐   |
| 2.13 | Offline            | Both routes render with the network disabled. Nothing is fetched.            | ☐   |

**Blocking:** all thirteen. Row 2.10 is checked against an empty directory and
an absent one, not reasoned about, as Phase 6 checked its own.

---

## 3. The schema and the pure functions are tested

**One named test per row.** No test in `src/domain/transcript.ts`'s or
`src/domain/slug.ts`'s suites reads the clock, the disk or the database. The
file that reads the disk is `src/content/transcripts.test.ts`.

| #    | Function           | Input                                             | Expected                          | ✓   |
| ---- | ------------------ | ------------------------------------------------- | --------------------------------- | --- |
| 3.1  | Schema             | A complete, valid frontmatter object              | parses                            | ☐   |
| 3.2  | Schema             | `title` empty                                     | rejects, names the field          | ☐   |
| 3.3  | Schema             | `date` as `04/03/2026`                            | rejects                           | ☐   |
| 3.4  | Schema             | `date` as `2026-13-45`                            | rejects a shaped but unreal date  | ☐   |
| 3.5  | Schema             | `clinician` missing                               | rejects                           | ☐   |
| 3.6  | Schema             | `setting` missing                                 | rejects                           | ☐   |
| 3.7  | Schema             | `summary` missing                                 | rejects                           | ☐   |
| 3.8  | Schema             | `cast` empty                                      | rejects — a session has attendees | ☐   |
| 3.9  | Schema             | `cast` containing `Mallow-1`                      | rejects, it is not a slug shape   | ☐   |
| 3.10 | Schema             | `cast` listing the same slug twice                | rejects, names the duplicate      | ☐   |
| 3.11 | Schema             | an unknown extra frontmatter key                  | rejects — strict object           | ☐   |
| 3.12 | `slugFromFilename` | `group-2026-03-04.mdx`                            | the slug                          | ☐   |
| 3.13 | `slugFromFilename` | `Group 2026.mdx`, `group_1.mdx`, `g.md`           | rejects each, names the file      | ☐   |
| 3.14 | `slugShape`        | `mallow-1` accepted; `Mallow-1`, `a_b`, `` empty  | decided and asserted              | ☐   |
| 3.15 | `transcriptOrder`  | three transcripts authored in a scrambled order   | newest first                      | ☐   |
| 3.16 | `transcriptOrder`  | two transcripts on the same date                  | tie broken by slug, deterministic | ☐   |
| 3.17 | `transcriptOrder`  | an empty list                                     | an empty list, no throw           | ☐   |
| 3.18 | Reader discovery   | a temp dir with one transcript, then two          | both found, slugs derived         | ☐   |
| 3.19 | Reader failure     | a temp dir with one malformed transcript          | throws, names file and field      | ☐   |
| 3.20 | Cast resolution    | a cast naming a patient who does not exist        | throws, names file, path, slug    | ☐   |
| 3.21 | Speaker resolution | a `<Turn>` whose speaker is neither cast nor clin | throws, names file and speaker    | ☐   |
| 3.22 | Content integrity  | the real `src/content/transcripts/`               | all parse, all casts resolve      | ☐   |
| 3.23 | Phase 6 unbroken   | the moved rows still pass under their old names   | holds                             | ☐   |
| 3.24 | Purity             | the domain suites read no clock, disk or db       | holds                             | ☐   |

**Blocking:** all twenty-four. Row 3.20 is the one that makes decision D5 real
rather than aspirational. Row 3.23 is the one that proves the move in plan group
1 was a move and not a rewrite.

---

## 4. The done-when condition

| #   | Check                   | Expected                                                                       | ✓   |
| --- | ----------------------- | ------------------------------------------------------------------------------ | --- |
| 4.1 | Renders in the house    | A transcript uses the same layout vocabulary as a chart and a case file.       | ☐   |
| 4.2 | Cross-links             | Every patient present links to their chart, and the link is **navigated**.     | ☐   |
| 4.3 | Everyone present        | Every cast member appears as a link, not just the first or the ones who spoke. | ☐   |
| 4.4 | A broken cast fails     | An unresolvable cast slug stops `next build` with file, path and slug.         | ☐   |
| 4.5 | A new file publishes    | A probe `.mdx` written during the test appears on `/transcripts`.              | ☐   |
| 4.6 | And renders             | Its slug renders the transcript, and its cast link resolves to a real chart.   | ☐   |
| 4.7 | With no code change     | Nothing outside `src/content/transcripts/` was touched to publish it.          | ☐   |
| 4.8 | The probe is cleaned up | Deleted in a `finally`; the tree is clean after the run.                       | ☐   |
| 4.9 | Deliberate failure      | One new assertion was broken on purpose and produced a real assertion diff.    | ☐   |

**Blocking:** all nine. Row 4.2 is the roadmap's condition and is proved by
clicking, because an `href` that is present and wrong passes every test that
only reads it. Row 4.4 is the half of the condition that is easy to lose: a
cross-link that silently degrades to plain text would satisfy a reader looking
at a working page and would have already failed.

---

## 5. The content holds its register, and the fiction holds

Decision D9, and the mission's voice constraint. As Phase 6, the prose is
checked like code — and this phase has a constraint Phase 6 did not.

| #   | Check                 | Expected                                                                          | ✓   |
| --- | --------------------- | --------------------------------------------------------------------------------- | --- |
| 5.1 | The swap test         | Each of the three transcripts, named individually, could appear in a real record. | ☐   |
| 5.2 | No winking            | No exclamation mark, no second person outside quoted speech, no aside.            | ☐   |
| 5.3 | Precise absurdity     | Each transcript quantifies at least one absurd thing exactly.                     | ☐   |
| 5.4 | No real entities      | The Phase 6 grep list, reused verbatim, over the transcript directory: none.      | ☐   |
| 5.5 | No real conditions    | No real diagnosis, condition or treatment. Codes come from Phase 4 only.          | ☐   |
| 5.6 | Speakers are distinct | A reader who knows the charts can identify a speaker from an unlabelled line.     | ☐   |
| 5.7 | Consistent with chart | Nothing a patient says contradicts their chart's history or status.               | ☐   |
| 5.8 | The list reads        | Its framing line passes the swap test and does not explain the joke.              | ☐   |
| 5.9 | A stranger gets it    | One transcript read cold conveys the premise, as Phase 3 required of a case file. | ☐   |

**Blocking:** all nine. Row 5.6 is this phase's hardest row and the one most
likely to be ticked on faith — the test is to take three unlabelled lines to
somebody who has read the charts, not to assert it from the author's chair. Row
5.7 is new: Phase 6's charts could not contradict each other, and these can.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                             | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Audio, a player, or any media element                                      | Never      | ☐   |
| 6.2  | Any interactivity — `"use client"`, a button, an input, a disclosure       | Never      | ☐   |
| 6.3  | A `transcripts` field, or any edit to the five patient charts              | Never      | ☐   |
| 6.4  | A link from `/`, intake, the waiting room, a case file or a chart          | Phase 9    | ☐   |
| 6.5  | A search field, a filter, or a sorting control                             | Never      | ☐   |
| 6.6  | Any change to `src/db/`, `drizzle/`, or a new migration                    | Phase 2    | ☐   |
| 6.7  | Any change to `case.ts`, `case-note.ts`, `diagnosis.ts`, `waiting-room.ts` | Phases 2–5 | ☐   |
| 6.8  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                   | Phase 9    | ☐   |
| 6.9  | Any change to `src/app/patients/`                                          | Phase 6    | ☐   |
| 6.10 | An MDX file under `src/app/`, or `pageExtensions` in the config            | Never      | ☐   |
| 6.11 | An image, an avatar, or any binary asset                                   | Never      | ☐   |
| 6.12 | `@media print` or any print stylesheet                                     | Phase 8    | ☐   |
| 6.13 | Custom colours, fonts, spacing scale, component classes                    | Phase 10   | ☐   |
| 6.14 | Any new dependency                                                         | Never      | ☐   |
| 6.15 | A route beyond the eight this phase leaves                                 | Phase 8+   | ☐   |

**Blocking:** all fifteen. Row 6.3 is decision D2 enforced rather than trusted,
and it is checked with `git diff` against the branch point, not by reading the
charts.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                           | ✓   |
| --- | -------------------------- | ------------------------------------------------------------------ | --- |
| 7.1 | `/` unchanged              | Byte-identical to the branch point, still no links.                | ☐   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                         | ☐   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                                | ☐   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                          | ☐   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                    | ☐   |
| 7.6 | One worker                 | `playwright.config.ts` still pins `workers: 1`, now 4 files.       | ☐   |
| 7.7 | Clean tree                 | `git status` clean after dev, build, test and e2e.                 | ☐   |
| 7.8 | Cold clone                 | Clone, install, one command, both routes render. **And prettier.** | ☐   |

**Blocking:** all eight. Row 7.8 runs `npx prettier --check .` this time, which
is the correction Phase 6 recorded after it merged: the cold clone had been
running a chosen subset of the checks, and the row it skipped was the row that
was broken.

---

## Merge gate

Phase 7 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all twenty-four rows.
3. Section 4 row 4.2 is proved by navigating a cast link, not by reading one.
4. Section 4 row 4.4 is proved by actually breaking a cast and reading the
   build output.
5. Section 1 row 1.2 shows both new routes static.
6. Section 5 is ticked transcript by transcript, not in aggregate, and row 5.6
   is ticked by somebody who was not the author.
7. `npm run verify:all` passes, read unpiped.
8. The five patient charts and `/`, intake, the case file, the waiting room and
   the whole write path are byte-identical to the branch point.

## Explicitly not validated here

- Whether anything links to the transcript list — Phase 9.
- Whether a patient's chart shows the sessions they attended — decision D2 says
  no page needs it in this phase, and a later phase may add it as a read.
- Whether a discharged patient may appear in an earlier transcript — Phase 8.
- Print layout, design and the axe audit — Phases 8 and 10.
- Whether the content directories scale past a few dozen files. Every
  transcript reads every patient to resolve its cast, which is correct at three
  by five and worth measuring at five hundred by five hundred. Phase 12 is the
  first phase with a reason to.
