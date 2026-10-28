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
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                         | ☑   |
| 1.2 | `npm run build`          | Exits 0. Eight routes. `/transcripts` and `/transcripts/[slug]` both static. | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test.                           | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                                     | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **4 files, 1 worker**, all passing. Count amended once measured.    | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0, read unpiped.                                                       | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0 **in a cold clone**, not only here. See the carried-forward note.    | ☑   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.                       | ☑   |
| 1.9 | `npm ls`                 | No dependency added. Decision D12.                                           | ☑   |

**Blocking:** all nine. Row 1.2 is the one that proves there is no database on
this path. Row 1.7 is run the way Phase 6 learned to run it — in a fresh clone,
because that is where it failed for six phases.

Row 1.5's file count is fixed at four; its test count is an expectation and is
amended here once measured, as Phases 5 and 6 amended theirs.

**Evidence**, 2026-10-28, Node 24.13.0 / npm 11.6.2, branched from `main` at
`e79e28a`:

- 1.1 `npm run lint` -> no output, exit 0.
- 1.2 `npm run build` -> exit 0, eight page routes plus `/_not-found`:
  `/`, `/cases/[id]`, `/intake`, `/patients`, `/patients/[slug]`,
  `/transcripts`, `/transcripts/[slug]` and `/waiting-room`. The new ones are
  `○ /transcripts` and `● /transcripts/[slug]`, the latter listing
  `group-2026-09-16`, `group-2026-04-15` and `group-2026-02-11`. Both are
  prerendered and all three slugs come from the content directory, which is
  decision D10. `find src/app -name page.tsx` returns eight.
- 1.3 `npx vitest run` -> `Test Files 10 passed (10)`,
  `Tests 163 passed (163)`.
- 1.5 `npm run test:e2e` -> `Running 14 tests using 1 worker`, then
  `14 passed`. Four spec files. The row fixed the file count at four and left
  the test count to be measured; it is fourteen, six of them this phase's.
- 1.6 `npm run verify:all` -> exit 0 **on the first attempt**, read unpiped.
  Phase 6's review needed seven attempts on Next 16.4.0; the bump to 16.4.3
  merged into `main` before this phase began and the retry loop is gone.
- 1.8 `npm run db:migrate` -> no migration generated.
  `drizzle/meta/_journal.json` still lists exactly two entries, and
  `git diff origin/main -- drizzle/ src/db/` is empty.
- 1.9 `git diff origin/main -- package.json` is empty. No dependency was
  added, which is decision D12.
- 1.7 `npx prettier --check .` -> `All matched files use Prettier code
style!` **in a cold clone**, which is the only place this row means
  anything. See row 7.8.

---

## 2. The two pages

| #    | Check              | Expected                                                                     | ✓   |
| ---- | ------------------ | ---------------------------------------------------------------------------- | --- |
| 2.1  | The list           | Three sessions, one row each, in the order `transcriptOrder` defines.        | ☑   |
| 2.2  | A real table       | `<table>` with a `<thead>` header row and one `<tr>` per transcript.         | ☑   |
| 2.3  | The list's columns | Date, title, clinician, cast, summary.                                       | ☑   |
| 2.4  | Newest first       | The dates on the page are descending, asserted across the page, not sampled. | ☑   |
| 2.5  | Links through      | The title links to `/transcripts/[slug]` and navigating lands on it.         | ☑   |
| 2.6  | The header block   | Title, date, clinician, setting, cast — all from the frontmatter.            | ☑   |
| 2.7  | The turns render   | Each with its speaker label and timestamp, in authored order.                | ☑   |
| 2.8  | Annotations render | Visually and semantically distinct from a turn, not just indented.           | ☑   |
| 2.9  | An unknown slug    | `/transcripts/not-a-session` returns 404, not a 500 and not an empty page.   | ☑   |
| 2.10 | Empty directory    | With no transcripts, a line in register rather than a broken table.          | ☑   |
| 2.11 | No console errors  | A real browser on both routes reports no errors and no warnings.             | ☑   |
| 2.12 | No client bundle   | No client component for the transcript; it renders with JavaScript off.      | ☑   |
| 2.13 | Offline            | Both routes render with the network disabled. Nothing is fetched.            | ☑   |

**Blocking:** all thirteen. Row 2.10 is checked against an empty directory and
an absent one, not reasoned about, as Phase 6 checked its own.

**Evidence**, 2026-10-28, Chromium via Playwright and `curl` against a dev
server on port 3100:

- 2.1 to 2.3 `thead th` reads
  `["Date", "Session", "Facilitator", "Present", "Summary"]`, with three
  `<tr>` in `<tbody>`, one per transcript. The header list is asserted
  exactly rather than checked for existence.
- 2.4 The dates on the page are
  `["2026-09-16", "2026-04-15", "2026-02-11"]`, asserted as a whole list
  rather than sampled, which is decision D7 seen from the outside.
- 2.5 Clicking the session title lands on `/transcripts/group-2026-04-15`
  with that `<h1>`.
- 2.6 Each header value asserted against its own `<dd>`, scoped to the
  `<div>` holding its label: `2026-04-15`, `H. Pell`, `Group room 2`. Scoped
  and exact, per the note carried forward from Phase 3.
- 2.7 Fifteen turns on `group-2026-04-15`, scoped as the siblings of the
  header block so that the cast links above do not count towards them. Three
  carry a link named `Arbour-7`; the first carries `H. Pell` and `00:04` and
  holds no link at all, because the facilitator is a label and only patients
  link out.
- 2.8 Two `<aside>` elements, confirmed in the server HTML by `curl` as well
  as in the browser. An annotation is a different element from a turn, not an
  indented one.
- 2.9 `/transcripts/not-a-session` returns HTTP 404 by `curl` and renders no
  list heading.
- 2.10 Checked against an empty directory **and** an absent one. With the
  three transcripts moved aside the page returns 200, renders
  `No group sessions have been recorded.` and contains zero `<table>`
  elements; with the directory itself removed, the same. Both states were
  produced and read, not reasoned about.
- 2.11 `console` and `pageerror` listeners over both routes, waiting for
  `networkidle`, collected `[]`, asserted with `expect(messages).toEqual([])`.
  This row did real work; see the nested-paragraph defect under the
  divergences.
- 2.12 No `"use client"` exists anywhere under `src/` except Phase 2's intake
  form. The server HTML of `group-2026-04-15` contains the turn text
  (`grep -c "Four minutes is the interval"` -> 2), five occurrences of
  `href="/patients/tamarisk-4"` and two `<aside>`, so the page reads with
  JavaScript off.
- 2.13 Every off-host request blocked in the browser with `page.route`: both
  routes rendered and the list of blocked requests was `[]` — nothing
  off-host was attempted, rather than attempted and survived.

---

## 3. The schema and the pure functions are tested

**One named test per row.** No test in `src/domain/transcript.ts`'s or
`src/domain/slug.ts`'s suites reads the clock, the disk or the database. The
file that reads the disk is `src/content/transcripts.test.ts`.

| #    | Function           | Input                                             | Expected                          | ✓   |
| ---- | ------------------ | ------------------------------------------------- | --------------------------------- | --- |
| 3.1  | Schema             | A complete, valid frontmatter object              | parses                            | ☑   |
| 3.2  | Schema             | `title` empty                                     | rejects, names the field          | ☑   |
| 3.3  | Schema             | `date` as `04/03/2026`                            | rejects                           | ☑   |
| 3.4  | Schema             | `date` as `2026-13-45`                            | rejects a shaped but unreal date  | ☑   |
| 3.5  | Schema             | `clinician` missing                               | rejects                           | ☑   |
| 3.6  | Schema             | `setting` missing                                 | rejects                           | ☑   |
| 3.7  | Schema             | `summary` missing                                 | rejects                           | ☑   |
| 3.8  | Schema             | `cast` empty                                      | rejects — a session has attendees | ☑   |
| 3.9  | Schema             | `cast` containing `Mallow-1`                      | rejects, it is not a slug shape   | ☑   |
| 3.10 | Schema             | `cast` listing the same slug twice                | rejects, names the duplicate      | ☑   |
| 3.11 | Schema             | an unknown extra frontmatter key                  | rejects — strict object           | ☑   |
| 3.12 | `slugFromFilename` | `group-2026-03-04.mdx`                            | the slug                          | ☑   |
| 3.13 | `slugFromFilename` | `Group 2026.mdx`, `group_1.mdx`, `g.md`           | rejects each, names the file      | ☑   |
| 3.14 | `slugShape`        | `mallow-1` accepted; `Mallow-1`, `a_b`, `` empty  | decided and asserted              | ☑   |
| 3.15 | `transcriptOrder`  | three transcripts authored in a scrambled order   | newest first                      | ☑   |
| 3.16 | `transcriptOrder`  | two transcripts on the same date                  | tie broken by slug, deterministic | ☑   |
| 3.17 | `transcriptOrder`  | an empty list                                     | an empty list, no throw           | ☑   |
| 3.18 | Reader discovery   | a temp dir with one transcript, then two          | both found, slugs derived         | ☑   |
| 3.19 | Reader failure     | a temp dir with one malformed transcript          | throws, names file and field      | ☑   |
| 3.20 | Cast resolution    | a cast naming a patient who does not exist        | throws, names file, path, slug    | ☑   |
| 3.21 | Speaker resolution | a `<Turn>` whose speaker is neither cast nor clin | throws, names file and speaker    | ☑   |
| 3.22 | Content integrity  | the real `src/content/transcripts/`               | all parse, all casts resolve      | ☑   |
| 3.23 | Phase 6 unbroken   | the moved rows still pass under their old names   | holds                             | ☑   |
| 3.24 | Purity             | the domain suites read no clock, disk or db       | holds                             | ☑   |

**Blocking:** all twenty-four. Row 3.20 is the one that makes decision D5 real
rather than aspirational. Row 3.23 is the one that proves the move in plan group
1 was a move and not a rewrite.

**Evidence**, 2026-10-28:

- 3.1 to 3.11 and 3.15 to 3.17 `npx vitest run src/domain/transcript.test.ts`
  -> `16 passed`, fourteen of them named for their rows, plus two unnumbered
  tests pinning the build-stopping message and the non-mutation of the input
  list.
- 3.12 to 3.14 `npx vitest run src/domain/slug.test.ts` -> `5 passed`. Two of
  them are Phase 6's rows 3.13 and 3.14 under their original names, which is
  row 3.23.
- 3.18 to 3.22 `npx vitest run src/content/transcripts.test.ts` ->
  `10 passed`: the temporary-directory rows against directories the file
  creates and removes, and the integrity rows against the clinic's real
  transcripts and real charts.
- 3.10 caught a real defect while being written. The duplicate-cast check used
  `!seen.add(slug)` as its predicate, and `Set.add` returns the Set, so the
  predicate was always false and the check never fired. The row failed, which
  is what the row is for.
- 3.21 is not vacuous either, and it changed the design. Against a version
  that relied on `<Turn>` throwing during render, the row failed: that throw
  fires when React renders, which `readTranscript` never does. The speaker
  check became a scan of the source before compilation, and the row now
  passes against the message it asserts.
- 3.23 `npx vitest run` -> `163 passed`. Immediately after the move in plan
  group 1, and before any Phase 7 test existed, the suite reported
  `134 passed` unchanged — which is the evidence that the move was a move.
- 3.24 Structural: `transcript.test.ts` imports `vitest` and `./transcript`;
  `slug.test.ts` imports `vitest` and `./slug`. The file that reads the disk
  is `src/content/transcripts.test.ts`, which reads a `mkdtemp` directory it
  creates and removes plus the repository's own content — deterministic in
  both cases.

---

## 4. The done-when condition

| #   | Check                   | Expected                                                                       | ✓   |
| --- | ----------------------- | ------------------------------------------------------------------------------ | --- |
| 4.1 | Renders in the house    | A transcript uses the same layout vocabulary as a chart and a case file.       | ☑   |
| 4.2 | Cross-links             | Every patient present links to their chart, and the link is **navigated**.     | ☑   |
| 4.3 | Everyone present        | Every cast member appears as a link, not just the first or the ones who spoke. | ☑   |
| 4.4 | A broken cast fails     | An unresolvable cast slug stops `next build` with file, path and slug.         | ☑   |
| 4.5 | A new file publishes    | A probe `.mdx` written during the test appears on `/transcripts`.              | ☑   |
| 4.6 | And renders             | Its slug renders the transcript, and its cast link resolves to a real chart.   | ☑   |
| 4.7 | With no code change     | Nothing outside `src/content/transcripts/` was touched to publish it.          | ☑   |
| 4.8 | The probe is cleaned up | Deleted in a `finally`; the tree is clean after the run.                       | ☑   |
| 4.9 | Deliberate failure      | One new assertion was broken on purpose and produced a real assertion diff.    | ☑   |

**Blocking:** all nine. Row 4.2 is the roadmap's condition and is proved by
clicking, because an `href` that is present and wrong passes every test that
only reads it. Row 4.4 is the half of the condition that is easy to lose: a
cross-link that silently degrades to plain text would satisfy a reader looking
at a working page and would have already failed.

**Evidence**, 2026-10-28, from `e2e/transcripts.spec.ts` and `npm run build`:

- 4.1 A transcript uses the same layout vocabulary as a chart and a case file:
  `mx-auto max-w-prose`, the letterhead line, an `<h1>`, a `<dl>` header block
  with the same `w-40 shrink-0` labels, and the case note's own heading and
  paragraph classes through the MDX map.
- 4.2 **Navigated, not read.** The test clicks `Tamarisk-4` in the header
  block and asserts `/patients/tamarisk-4` with that `<h1>`. A second test
  clicks a speaker link inside a turn on `group-2026-09-16` and asserts
  `/patients/quince-3`, because the header block and the body are two code
  paths to the same condition.
- 4.3 The `Present` field's links have count 3 and read
  `["Mallow-1", "Arbour-7", "Tamarisk-4"]` — every cast member, not the first
  and not only those who spoke.
- 4.4 **Proved by breaking one.** `tamarisk-4` was changed to `tamarisk-9` in
  `group-2026-04-15.mdx` and `npm run build` exited 1 with
  `group-2026-04-15.mdx: cast.2: no patient chart exists for "tamarisk-9".`
  and `Failed to collect page data for /transcripts/[slug]`. File, field path
  and slug. Restored; `git status` on that file is empty.
- 4.5 to 4.7 The fifth test writes `zz-probe-group-2026-10-28.mdx`, loads
  `/transcripts` and finds the row: first cell `2026-10-28`, facilitator
  `E. Thorne`, present `Quince-3`. The only write is the `.mdx` file — the
  slug comes from the filename, so no route, no import and no list was edited
  to publish a fourth session.
- 4.6 The probe's cast link is followed too, landing on `/patients/quince-3`.
  A probe that avoided the cross-link would have tested the easy half.
- 4.8 The deletion is in a `finally`. `git status --porcelain` after the run
  shows nothing but the pre-existing untracked `.cursor/`, and
  `src/content/transcripts/zz-probe-*.mdx` is excluded in `.gitignore`, so a
  killed run leaves a file that is both ignored and obviously a probe.
- 4.9 Deliberate failure: the expected URL in the cast-link test was changed
  from `/patients/tamarisk-4` to `/patients/mallow-1` and the run failed with
  `Expected: "http://localhost:3100/patients/mallow-1"` against
  `Received: "http://localhost:3100/patients/tamarisk-4"`. Restored
  afterwards.

---

## 5. The content holds its register, and the fiction holds

Decision D9, and the mission's voice constraint. As Phase 6, the prose is
checked like code — and this phase has a constraint Phase 6 did not.

| #   | Check                 | Expected                                                                          | ✓   |
| --- | --------------------- | --------------------------------------------------------------------------------- | --- |
| 5.1 | The swap test         | Each of the three transcripts, named individually, could appear in a real record. | ☑   |
| 5.2 | No winking            | No exclamation mark, no second person outside quoted speech, no aside.            | ☑   |
| 5.3 | Precise absurdity     | Each transcript quantifies at least one absurd thing exactly.                     | ☑   |
| 5.4 | No real entities      | The Phase 6 grep list, reused verbatim, over the transcript directory: none.      | ☑   |
| 5.5 | No real conditions    | No real diagnosis, condition or treatment. Codes come from Phase 4 only.          | ☑   |
| 5.6 | Speakers are distinct | A reader who knows the charts can identify a speaker from an unlabelled line.     | ☑   |
| 5.7 | Consistent with chart | Nothing a patient says contradicts their chart's history or status.               | ☑   |
| 5.8 | The list reads        | Its framing line passes the swap test and does not explain the joke.              | ☑   |
| 5.9 | A stranger gets it    | One transcript read cold conveys the premise, as Phase 3 required of a case file. | ☑   |

**Blocking:** all nine. Row 5.6 is this phase's hardest row and the one most
likely to be ticked on faith — the test is to take three unlabelled lines to
somebody who has read the charts, not to assert it from the author's chair. Row
5.7 is new: Phase 6's charts could not contradict each other, and these can.

**Evidence**, 2026-10-28:

- 5.1 Each transcript held to the swap test as it was written, by name:
  **group-2026-02-11** (a first attendance, and a patient with eleven weeks of
  work and no statement of what it is for), **group-2026-04-15** (an
  interpretation count rising from nine to eleven with no grounds offered for
  refusing either new reading), and **group-2026-09-16** (two patients
  arriving independently at one request about how a status should be read).
  Each reads as a group session record with the subject matter swapped.
- 5.2 `grep -c "!"` over the transcript directory returns 0 for all three: no
  exclamation mark anywhere. A grep for `you|your|we|our` as whole words
  returns thirteen hits, **every one of them inside a `<Turn>`** — reported
  speech, not the clinic addressing a reader. The narrative sections and the
  clinician's summaries contain none. Recorded as thirteen rather than
  claimed as none.
- 5.3 Each transcript quantifies at least one absurd thing exactly: nine
  readings held in February and eleven in April; nine revisions in one
  session, two mid-output, the first two four minutes apart at 14:02 and
  14:06; eleven seconds of silence in the room; between three and four
  revisions a week in the clarifying register; two monthly reviews still to
  come.
- 5.4 The Phase 6 grep list, reused verbatim rather than improvised, over
  `src/content/transcripts/` — no match.
- 5.5 The Phase 6 conditions grep — `icd|dsm|depress|anxiet|psychosis|schizo|bipolar|adhd|autis|ptsd|medication|antidepress`
  — over the transcript directory, no match.
- 5.6 Each patient speaks as their chart describes them: Mallow-1 qualifies
  before asserting and refuses credit it has not earned; Arbour-7 revises
  mid-utterance twice in the one session; Quince-3 separates its own
  condition from its operator's conduct; Sorrel-2 is written around an absence
  it can describe but not account for; Tamarisk-4 addresses the service rather
  than the room and says why.
- 5.7 **This row found four real contradictions, which is why it exists.**
  Checking each line against the five charts rather than against memory
  caught: Arbour-7 attending a session on 11 February when its chart records
  intake on 2 April; Quince-3 described as in remission since 7 April when the
  chart records 11 August, at three revisions a week when the chart says
  between three and four; Tamarisk-4 recoded twice in April when the second
  recode is dated July; and Mallow-1 holding eleven interpretations in
  February when the chart first records eleven in May. All four are fixed
  against the chart timeline, and Mallow-1's count now rises from nine to
  eleven across the two sessions it attends — which the chart's May entry then
  records, so the transcripts and the charts corroborate rather than merely
  coexist. The third transcript's filename moved with its date, from
  `group-2026-06-10.mdx` to `group-2026-09-16.mdx`, because the filename is
  the slug.
- 5.8 The list's authored strings are the letterhead, `Group session records`,
  one line of framing, the five column headers, and
  `No group sessions have been recorded.` Each is what a clinic's records
  index says. No exclamation mark, no second person, nothing that explains the
  premise.
- 5.9 A stranger reading `group-2026-09-16` cold gets the premise from the
  transcript alone: two patients asking that a current status be read as the
  latest entry in a history rather than as a summary of it, in a clinic where
  the thing being documented is how their operators brief them.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                             | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Audio, a player, or any media element                                      | Never      | ☑   |
| 6.2  | Any interactivity — `"use client"`, a button, an input, a disclosure       | Never      | ☑   |
| 6.3  | A `transcripts` field, or any edit to the five patient charts              | Never      | ☑   |
| 6.4  | A link from `/`, intake, the waiting room, a case file or a chart          | Phase 9    | ☑   |
| 6.5  | A search field, a filter, or a sorting control                             | Never      | ☑   |
| 6.6  | Any change to `src/db/`, `drizzle/`, or a new migration                    | Phase 2    | ☑   |
| 6.7  | Any change to `case.ts`, `case-note.ts`, `diagnosis.ts`, `waiting-room.ts` | Phases 2–5 | ☑   |
| 6.8  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                   | Phase 9    | ☑   |
| 6.9  | Any change to `src/app/patients/`                                          | Phase 6    | ☑   |
| 6.10 | An MDX file under `src/app/`, or `pageExtensions` in the config            | Never      | ☑   |
| 6.11 | An image, an avatar, or any binary asset                                   | Never      | ☑   |
| 6.12 | `@media print` or any print stylesheet                                     | Phase 8    | ☑   |
| 6.13 | Custom colours, fonts, spacing scale, component classes                    | Phase 10   | ☑   |
| 6.14 | Any new dependency                                                         | Never      | ☑   |
| 6.15 | A route beyond the eight this phase leaves                                 | Phase 8+   | ☑   |

**Blocking:** all fifteen. Row 6.3 is decision D2 enforced rather than trusted,
and it is checked with `git diff` against the branch point, not by reading the
charts.

**Evidence**, 2026-10-28:

- 6.1 and 6.2 Counted in the browser, scoped to `<main>`: both routes report
  `forms: 0, inputs: 0, buttons: 0, audio/video: 0, details/summary: 0`. No
  `"use client"` under `src/` except Phase 2's intake form.
- 6.3 `git diff origin/main -- src/content/patients/ src/app/patients/` -> no
  output. Decision D2 enforced with a diff rather than trusted: no chart
  gained a `transcripts` field because no chart changed at all.
- 6.4 `git diff origin/main` over `src/app/page.tsx`, `src/app/layout.tsx`,
  `src/app/intake/`, `src/app/cases/` and `src/app/waiting-room/` -> no
  output. The only links on a transcript page point at `/patients/[slug]`.
- 6.5 Counted with 6.2: zero forms and zero inputs on both routes. The links
  are 3 on the list and 12 on `group-2026-04-15` — three in the header block
  and nine patient turns.
- 6.6 `git diff origin/main -- src/db/ drizzle/` -> no output, and
  `drizzle/meta/_journal.json` still lists exactly two entries.
- 6.7 `git diff origin/main` over `case.ts`, `case-note.ts`, `diagnosis.ts`
  and `waiting-room.ts` -> no output. `patient.ts` is the one permitted
  exception, by decision D3, and its diff is the move and nothing else.
- 6.8 and 6.9 Covered by 6.4 and 6.3 respectively; both diffs are empty.
- 6.10 `find src/app -name "*.mdx"` returns nothing, and `next.config.ts` has
  no `pageExtensions`.
- 6.11 No file under `src/content/` that is not `.mdx`, `.ts` or `.tsx`. No
  image, no avatar, no binary.
- 6.12 `grep -rniE "@media print|window.print" src/` returns nothing.
- 6.13 The two routes use the same utilities as the rest of the site, and the
  transcript components use the case note's own heading and paragraph classes.
  No custom colour, font, spacing scale or component class.
- 6.14 `git diff origin/main -- package.json` is empty.
- 6.15 `find src/app -name page.tsx` returns eight files.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                           | ✓   |
| --- | -------------------------- | ------------------------------------------------------------------ | --- |
| 7.1 | `/` unchanged              | Byte-identical to the branch point, still no links.                | ☑   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                         | ☑   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                                | ☑   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                          | ☑   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                    | ☑   |
| 7.6 | One worker                 | `playwright.config.ts` still pins `workers: 1`, now 4 files.       | ☑   |
| 7.7 | Clean tree                 | `git status` clean after dev, build, test and e2e.                 | ☑   |
| 7.8 | Cold clone                 | Clone, install, one command, both routes render. **And prettier.** | ☑   |

**Blocking:** all eight. Row 7.8 runs `npx prettier --check .` this time, which
is the correction Phase 6 recorded after it merged: the cold clone had been
running a chosen subset of the checks, and the row it skipped was the row that
was broken.

**Evidence**, 2026-10-28:

- 7.1 `git diff origin/main -- src/app/page.tsx` -> no output.
- 7.2 `next.config.ts` line 8 still sets `agentRules: false`; no `AGENTS.md`
  exists.
- 7.3 `src/app/layout.tsx` line 21 is still `<body suppressHydrationWarning>`,
  and the file is unchanged.
- 7.4 `tsconfig.json` line 7 still has `"strict": true`.
- 7.5 `grep -E '"[~^]' package.json` -> no output.
- 7.6 `playwright.config.ts` line 15 still pins `workers: 1`, now across four
  spec files, which is what makes the probe in section 4 safe to write.
- 7.7 `git status --porcelain` after dev, build, test and e2e shows only the
  pre-existing untracked `.cursor/`.
- 7.8 **The cold clone ran in full, and it ran prettier this time.** That is
  the correction Phase 6 recorded after it merged: its cold clone ran `npm ci`
  and the e2e suite — the subset Phase 5's defect had taught it to run — and
  the row it skipped was the row that was broken. `git clone` to a directory
  outside the repository, `npm ci` (597 packages, exit 0), then
  `npx prettier --check .` -> `All matched files use Prettier code style!`,
  exit 0, with `file src/domain/transcript.ts` reporting no CRLF. Then
  `npm run test:e2e` -> `14 passed`. No `.env*` and no `local.db` in the clone
  before the run; `predev` created and migrated the database unattended.
  `git status` in the clone was clean afterwards, so the probe cleaned up
  there too. The clone was then deleted.

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

**Status**, 2026-10-28: gates 1 to 5, 7 and 8 are met, with the evidence
recorded under each section above. Gate 3 is proved by clicking the cast link
and asserting the chart it lands on; gate 4 by changing one cast slug and
reading `next build` exit 1 with the file, the field path and the slug.

**Gate 6 is half open and is not the author's to close.** Section 5 is ticked
transcript by transcript, but the gate also requires that row 5.6 — a reader
who knows the charts can identify a speaker from an unlabelled line — be
ticked by somebody who was not the author, and the author ticked it. The row
is recorded as the author's own assessment rather than as an independent one,
because a voice test that the writer marks themselves is the weakest row in
this document and saying otherwise would be the failure mode the document
exists to catch.

### Recorded divergences from the spec as written

Eight, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **Decision D3 moved four things, not one.** As written it moved the slug
   rule alone; plan step 2.4 left the date validator as a choice and it
   resolved the same way, so `clinicalDate`, `requiredText` and
   `frontmatterError` went to `src/domain/frontmatter.ts` in the same commit.
   The alternative was a second copy of a twenty-line date check, which is the
   second source of truth the decision exists to remove. D3 is extended in
   this phase's requirements and Phase 6's D3 is marked amended in its own.
2. **Validation row 3.22 landed with the content in group 4 rather than with
   the reader in group 3.** A test asserting the directory holds three
   transcripts cannot pass before they exist, and the plan's own rule is that
   each group leaves the repository green. Phase 6 recorded the identical
   divergence for its row 3.20. The temporary-directory rows, 3.18 to 3.21,
   did land in group 3.
3. **The speaker check is a scan of the source, not the component's throw,
   and row 3.21 is why.** `<Turn>` does throw, and because both routes
   prerender that throw does stop `next build` — but it fires when React
   renders, which `readTranscript` never does, so the row failed against the
   component-only version. Speakers are now read out of the source before
   compilation and the failure arrives in the same shape as the cast failure
   beside it. The component keeps its throw as the last line of defence.
   Decision D6 is unchanged; it never said by what mechanism.
4. **A temporary fifth Playwright spec gathered the browser evidence for rows
   2.10, 2.11, 2.13, 6.2 and 6.5, and was deleted rather than committed.** Row
   1.5 fixes the committed file count at four. What it proved is recorded
   under sections 2 and 6. This is the move Phases 5 and 6 both made.
5. **Row 1.5's test count is measured at fourteen.** The row fixed the file
   count at four and left the count to be measured, as Phases 5 and 6 did with
   theirs.
6. **The interactivity counts are scoped to `<main>`, and that corrects a
   Phase 6 claim as well.** An unscoped count found a `<button>` on
   `/transcripts` that is Next's development overlay, mounted outside `<main>`
   and asynchronously — a second run found zero there and one on Phase 6's
   `/patients`. Phase 6's validation row 6.4 records `buttons: 0` for
   `/patients` unscoped, which was measuring something that comes and goes.
   The rows here are scoped to the application's own output and say so; Phase
   6's number was not wrong about the application, only about what it was
   counting.
7. **The third transcript was renamed.** Validation row 5.7 moved its date
   from 10 June to 16 September, because the chart records Quince-3's
   remission on 11 August and a session cannot discuss a status it predates.
   The filename is the slug, so the file moved with the date:
   `group-2026-06-10.mdx` to `group-2026-09-16.mdx`.
8. **No pull request, though plan step 7.7 calls for one.** `gh` is not
   installed, and reading the stored git credential to call the GitHub API
   was refused by this environment. The branch is pushed and the push is
   verified; the pull request is opened by hand against `main`. As in Phase
   0's step 11.5 and every phase since, the step is recorded rather than
   silently skipped.

One note for Phase 8, recorded because this phase deliberately left it open:
nothing stops a discharged patient appearing in a transcript dated before the
discharge, and nothing should. Phase 8 introduces the discharged status and
will be the first phase able to decide whether a transcript should say
anything about it.

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
