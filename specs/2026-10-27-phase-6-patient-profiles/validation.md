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
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                     | ☑   |
| 1.2 | `npm run build`          | Exits 0. Six routes. `/patients` and `/patients/[slug]` both **static**. | ☑   |
| 1.3 | `npm run test`           | Exits 0. Every row in §3 has a passing named test. Seven test files.     | ☑   |
| 1.4 | `npm run verify`         | Exits 0.                                                                 | ☑   |
| 1.5 | `npm run test:e2e`       | Exits 0. **3 files, 8 tests, 1 worker**, all passing.                    | ☑   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                                 | ☑   |
| 1.7 | `npx prettier --check .` | Exits 0, the five charts included.                                       | ☑   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.                   | ☑   |
| 1.9 | `npm view` per package   | Each added version was resolved at install, not copied from a document.  | ☑   |

**Blocking:** all nine. Row 1.2 is the one that proves there is no database on
this path: a dynamic chart route would mean something is reading a request, a
clock or a table this phase forbade.

Row 1.5's count is an expectation, not a measurement. Amend it if the spec files
land differently, as Phase 5 amended its own.

**Evidence**, 2026-10-27, Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run lint` -> no output, exit 0.
- 1.2 `npm run build` -> exit 0, six routes: `○ /`, `○ /_not-found`,
  `ƒ /cases/[id]`, `○ /intake`, `○ /patients`, `● /patients/[slug]` with
  `mallow-1`, `arbour-7`, `quince-3` and `[+2 more paths]` listed beneath it,
  and `ƒ /waiting-room`. Both new routes are prerendered, and all five slugs
  come from the content directory, which is decision D7.
- 1.3 `npx vitest run` -> `Test Files 7 passed (7)`, `Tests 134 passed (134)` —
  the twenty-one of `patient.test.ts` and the nine of `patients.test.ts` on top
  of Phase 5's 104.
- 1.5 `npm run test:e2e` -> `Running 8 tests using 1 worker`, then
  `8 passed (1.6m)`. Three files. The row is amended from seven tests to eight;
  see the divergences under the merge gate.
- 1.7 `npx prettier --check .` -> `All matched files use Prettier code style!`,
  the five `.mdx` charts included. **Corrected 2026-10-28: this row was true
  where it was run and false for anybody who cloned.** See the correction
  below.
- 1.8 `npm run db:migrate` -> `migrations applied successfully`, and no
  migration generated. `drizzle/meta/_journal.json` still lists exactly two
  entries, and `git diff phase-5-waiting-room -- drizzle/ src/db/` is empty.
- 1.9 `npm view next-mdx-remote version` -> 6.0.0,
  `npm view remark-gfm version` -> 4.0.1, `npm view @types/mdx version` ->
  2.0.14, each then installed with `--save-exact`.
  `grep -E '"[~^]' package.json` returns nothing.

**One run of `npx vitest run` reported `Tests no tests` with seven
`Failed to start forks worker` errors** and passed on the next run. This is the
second sighting; Phase 5's section 1 recorded the first. It is not a failing
suite and it is not a passing one.

**The Next 16.4.0 advisory cost this phase real time and is recorded as such.**
`next build` and Playwright's `webServer` each abort non-zero on it, firing
periodically rather than once, and a `verify:all` run has to get past both. The
first three attempts at rows 1.4 and 1.6 failed that way — once in the build,
twice in the e2e stage, every failure `SecurityFatalError` or
`ERR_CONNECTION_REFUSED` and nothing wrong in the application. The fix exists on
`next-security-upgrade` and is not merged here, for the reason the context
section gives. **A piped `npm run verify:all | tail` reports the exit code of
`tail`, not of npm**, which made one failed run look like a pass; the row below
is recorded from an unpiped run.

**Re-run 2026-10-28, at the review in plan group 7**, because a merge gate
asserted from yesterday's output is an assertion about yesterday. Every row
above still holds, and the advisory was worse rather than better:

- Run separately, each stage passed on its first attempt: `npm run lint`,
  `npm run build` (both patient routes still prerendered, `○ /patients` and
  `● /patients/[slug]`), `npx vitest run` -> `Test Files 7 passed (7)`,
  `Tests 134 passed (134)`, and `npm run test:e2e` ->
  `Running 8 tests using 1 worker`, `8 passed (39.5s)`.
- Chained, `npm run verify:all` took **seven attempts** to exit 0, every exit
  code read unpiped. Six failures: four aborted in `next build` on
  `SecurityFatalError`, two in the e2e stage with all eight tests reporting
  `ERR_CONNECTION_REFUSED` because Playwright's `webServer` had been aborted
  the same way. The seventh exited 0 with the counts above.
- **The stage-by-stage result is the diagnosis.** Each stage clears the
  advisory on one attempt; a chained run has to clear it twice, and the second
  clearing is the one that keeps failing. Nothing in the application is
  involved, and the fix is the patch bump on `next-security-upgrade`, which
  this phase does not merge — see
  [tech-stack.md](../tech-stack.md), **Security advisories are taken on their
  own branch**.
- `git status --porcelain` after all of it lists the three spec files this
  group edits and the pre-existing untracked `.cursor/`. No probe chart, no
  stray artefact.

**Row 1.7 was wrong, and the correction is kept rather than the row rewritten.**
Found on 2026-10-28, after this phase had merged. `npx prettier --check .`
exits 0 in a working tree whose files the tooling wrote, and exits 1 on a cold
clone on Windows, reporting **69 files** — every source file in the
repository, none of them edited by anybody. Git stores LF; with
`core.autocrlf=true` and no `.gitattributes`, checkout converts the working
tree to CRLF, and Prettier's `endOfLine` default is `lf`.

This is Phase 5's lesson in a different costume: a check may not depend on the
state an earlier run happened to leave behind. Row 7.8's cold clone missed it
because it ran `npm ci` and the e2e suite, which is what Phase 5's defect had
taught it to run, and not `prettier --check`. A row that passes only on the
machine that authored it is the failure mode this document exists to catch,
and it took a clone to catch it here too.

Fixed by `.gitattributes` with `* text=auto eol=lf`, which changes the
checkout and not the content — `git add --renormalize .` staged nothing,
because the stored bytes were already LF. Verified the way the row should have
been in the first place: a fresh `git clone` on Windows now checks out LF, and
`prettier --check .` in that clone exits 0.

---

## 2. The two pages

| #    | Check                  | Expected                                                                      | ✓   |
| ---- | ---------------------- | ----------------------------------------------------------------------------- | --- |
| 2.1  | The register lists     | Five patients, one row each, in the order `registerOrder` defines.            | ☑   |
| 2.2  | A real table           | `<table>` with a `<thead>` header row and one `<tr>` per patient.             | ☑   |
| 2.3  | The register's columns | Number, name, status, presenting line, most recent contact.                   | ☑   |
| 2.4  | Links through          | The name links to `/patients/[slug]` and navigating lands on that chart.      | ☑   |
| 2.5  | The chart's header     | Number, name, status, intake date, clinician — all from the frontmatter.      | ☑   |
| 2.6  | The history renders    | Every entry, dated, each with its code, in a stable order.                    | ☑   |
| 2.7  | The body renders       | The MDX narrative with its headings, as a document rather than a wall.        | ☑   |
| 2.8  | An unknown slug        | `/patients/not-a-patient` returns 404, not a 500 and not an empty chart.      | ☑   |
| 2.9  | Empty directory        | With no charts, a line in register rather than a broken table.                | ☑   |
| 2.10 | No console errors      | A real browser on both routes reports no errors and no warnings.              | ☑   |
| 2.11 | No client bundle       | The chart page ships no client component for the MDX; it renders with JS off. | ☑   |
| 2.12 | Offline                | Both routes render with the network disabled. Nothing is fetched.             | ☑   |

**Blocking:** all twelve. Row 2.9 is checked against an empty directory, not
reasoned about. Row 2.12 is the mission's demo constraint and is checked, not
assumed, because this is the first phase to add a compiler to the render path.

**Evidence**, 2026-10-27, Chromium via Playwright and `curl` against a dev
server:

- 2.1 and 2.3 `thead th` reads
  `["Number", "Patient", "Status", "Presenting", "Last contact"]`, with five
  `<tr>` in `<tbody>`, one per chart. The spec asserts the header list exactly
  rather than checking that a header exists.
- 2.2 `<table class="mt-8 w-full text-left align-top"><thead><tr><th
scope="col">Number</th>...`, one `<tr>` per patient.
- 2.4 The five numbers on the page are sorted ascending, asserted across the
  whole page rather than spot-checked, and clicking `Arbour-7` lands on
  `/patients/arbour-7` with that `<h1>`.
- 2.5 On `/patients/tamarisk-4` each value is asserted against its own `<dd>`,
  scoped to the `<div>` holding its label: `P-0205`, `Active`, `2025-06-12`,
  `N. Ibarra`. Scoped and exact, per the note carried forward from Phase 3.
- 2.6 Four `<li>` in the history, the first carrying `2025-06-12`, `ACDI-06`
  and `Requirement instability, moderate, acute`, the last carrying `ACDI-15`.
  The rubrics come from `entryFor` and not from the chart.
- 2.7 The compiled narrative renders as
  `<h2 class="mt-8 text-xl font-semibold">Mental status</h2>`, then
  `Formulation`, `Operator contribution` and `Plan` — the component map of
  decision D11, not a wall of text.
- 2.8 `/patients/not-a-patient` returns HTTP 404 and renders no register
  heading.
- 2.9 Checked against an empty directory **and** an absent one. With the five
  charts moved aside the page returns 200, renders
  `No patients are currently under this service.` and contains zero `<table>`
  elements; with the directory itself removed, the same. Both states were
  produced and read, not reasoned about.
- 2.10 `console` and `pageerror` listeners over `/patients` and two charts
  collected `[]`, asserted with `expect(messages).toEqual([])`.
- 2.11 No `"use client"` exists anywhere under `src/` except Phase 2's intake
  form. The chart page's server HTML contains the narrative text
  (`grep -c "This chart has been recoded twice"` -> 2, the heading and the
  body), so it reads with JavaScript off.
- 2.12 Every off-host request blocked in the browser with `page.route`:
  `/patients` and `/patients/quince-3` both rendered, and the list of blocked
  requests was `[]` — nothing off-host was attempted, rather than attempted and
  survived.

---

## 3. The schema and the pure functions are tested

**One named test per row.** No test in `src/domain/patient.test.ts` reads the
clock, the disk or the database; the one file that does read the disk is row
3.20's, and it is the exception decision D9 argues for.

| #    | Function            | Input                                        | Expected                         | ✓   |
| ---- | ------------------- | -------------------------------------------- | -------------------------------- | --- |
| 3.1  | Schema              | A complete, valid frontmatter object         | parses                           | ☑   |
| 3.2  | Schema              | `name` empty                                 | rejects, names the field         | ☑   |
| 3.3  | Schema              | `number` as `0041`, `P-41`, `p-0041`         | rejects each                     | ☑   |
| 3.4  | Schema              | `status` not in the set                      | rejects, lists the set           | ☑   |
| 3.5  | Schema              | `intake` as `13/10/2026`                     | rejects                          | ☑   |
| 3.6  | Schema              | `intake` as `2026-13-45`                     | rejects a shaped but unreal date | ☑   |
| 3.7  | Schema              | `clinician` missing                          | rejects                          | ☑   |
| 3.8  | Schema              | `presenting` missing                         | rejects                          | ☑   |
| 3.9  | Schema              | `history` empty                              | rejects — a chart has a history  | ☑   |
| 3.10 | Schema              | a history entry citing `ACDI-99`             | rejects, says it is not indexed  | ☑   |
| 3.11 | Schema              | a history entry citing a real indexed code   | parses                           | ☑   |
| 3.12 | Schema              | an unknown extra frontmatter key             | decided and asserted either way  | ☑   |
| 3.13 | `slugFromFilename`  | `arbour-7.mdx`                               | `arbour-7`                       | ☑   |
| 3.14 | `slugFromFilename`  | `Arbour 7.mdx`, `arbour_7.mdx`, `a.md`       | rejects each, names the file     | ☑   |
| 3.15 | `registerOrder`     | five patients, authored in a scrambled order | the order the comment states     | ☑   |
| 3.16 | `registerOrder`     | an empty list                                | an empty list, no throw          | ☑   |
| 3.17 | `mostRecentContact` | entries authored newest-first                | the newest                       | ☑   |
| 3.18 | `mostRecentContact` | entries authored oldest-first                | the newest — order-independent   | ☑   |
| 3.19 | `mostRecentContact` | two entries on the same date                 | decided and asserted             | ☑   |
| 3.20 | Content integrity   | the real `src/content/patients/`             | all parse, numbers unique        | ☑   |
| 3.21 | Reader discovery    | a temp dir with one file, then two           | both found, slugs derived        | ☑   |
| 3.22 | Reader failure      | a temp dir with one malformed file           | throws, names file and field     | ☑   |
| 3.23 | Reader uniqueness   | a temp dir with two files sharing a `number` | throws, names both files         | ☑   |
| 3.24 | Purity              | `patient.test.ts` reads no clock, disk or db | holds                            | ☑   |

**Blocking:** all twenty-four. Row 3.10 is the one that keeps the authored
content honest about Phase 4's index. Row 3.6 is the one that catches a date
regex mistaken for date validation.

**Evidence**, 2026-10-27:

- 3.1 to 3.19 `npx vitest run src/domain/patient.test.ts` -> `21 passed`, with
  nineteen names beginning `3.1` through `3.19`, none missing and none repeated,
  plus two unnumbered tests pinning the build-stopping message.
- 3.20 to 3.23 `npx vitest run src/content/patients.test.ts` -> `9 passed`,
  three of them named `3.21` to `3.23` against temporary directories the file
  writes itself, and `3.20` against the clinic's real charts: five of them,
  numbers unique and already in register order, each with a history and a
  well-formed slug.
- 3.10 is not vacuous. Miscoding one real chart's second history entry to
  `ACDI-77` failed with `quince-3.mdx: history.1.code: ACDI-77 is not in the
AgenticClinic Diagnostic Index, second edition.` — file, field path and reason.
  Restored; `git diff` on that chart is empty.
- 3.24 Structural: `patient.test.ts` imports `vitest` and `./patient` and
  nothing else. The file that reads the disk is `patients.test.ts`, which reads
  a `mkdtemp` directory it creates and removes, plus the repository's own charts
  — deterministic in both cases, which is decision D9's whole argument.

---

## 4. The done-when condition

| #   | Check                   | Expected                                                                    | ✓   |
| --- | ----------------------- | --------------------------------------------------------------------------- | --- |
| 4.1 | A new file publishes    | A probe `.mdx` written during the test appears on `/patients`.              | ☑   |
| 4.2 | And renders             | Its slug renders its chart — header block, history and body.                | ☑   |
| 4.3 | With no code change     | Nothing outside `src/content/patients/` was touched to publish it.          | ☑   |
| 4.4 | Proved by a spec        | `e2e/patients.spec.ts`, not checked by hand once.                           | ☑   |
| 4.5 | The probe is cleaned up | Deleted in a `finally`; the tree is clean after the run.                    | ☑   |
| 4.6 | A killed run is safe    | Killing the run mid-test leaves at most an ignored, obviously-named probe.  | ☑   |
| 4.7 | Deliberate failure      | One new assertion was broken on purpose and produced a real assertion diff. | ☑   |

**Blocking:** all seven. Row 4.1 is the roadmap's condition. Row 4.3 is the half
of it that is easy to lose: a page that needed a new import to show the sixth
patient would have failed the condition while appearing to pass it.

**Evidence**, 2026-10-27, from `e2e/patients.spec.ts`:

- 4.1 and 4.2 The third test writes `zz-probe-yarrow-9.mdx` into
  `src/content/patients/`, loads `/patients`, and finds the row: first cell
  `P-9999` exactly, last cell containing `ACDI-19`. That is the roadmap's
  done-when condition, proved from the outside by adding a file. Next re-reads
  the directory per request in development, so the fallback decision D10 named
  was not needed — both the register and the chart observed the new file.
- 4.3 The probe publishes with no code change: the only write is the `.mdx`
  file. The slug comes from the filename, so no route, no import and no list was
  edited to make the sixth patient appear.
- 4.4 Clicking `Yarrow-9` lands on `/patients/zz-probe-yarrow-9` with that
  `<h1>` and the chart's body text.
- 4.5 The deletion is in a `finally`. `git status --porcelain` after the run
  shows nothing but the pre-existing untracked `.cursor/`, which is not this
  phase's.
- 4.6 A killed run was simulated by leaving the probe file in place:
  `git status --porcelain` does not list it, and
  `git check-ignore -v src/content/patients/zz-probe-yarrow-9.mdx` reports
  `.gitignore:33`. A crashed run leaves a file that is both ignored and
  obviously a probe.
- 4.7 Deliberate failure: changing the probe's expected clinic number from
  `P-9999` to `P-0001` failed with `Expected: "P-0001"` / `Received: "P-9999"`
  and the resolved locator printed, rather than passing. Restored afterwards.

---

## 5. The content holds its register, and the fiction holds

Decision D6, and the mission's voice constraint. This is the first phase whose
deliverable is mostly prose, so the prose is checked like code.

| #   | Check                | Expected                                                                         | ✓   |
| --- | -------------------- | -------------------------------------------------------------------------------- | --- |
| 5.1 | The swap test        | Each of the five charts, named individually, could appear verbatim in a chart.   | ☑   |
| 5.2 | No winking           | No exclamation mark, no second person, no aside about the premise, in any chart. | ☑   |
| 5.3 | Precise absurdity    | Each chart quantifies at least one absurd thing exactly, per the mission.        | ☑   |
| 5.4 | No real entities     | A grep of the content directory for real vendor, model and person names: none.   | ☑   |
| 5.5 | No real conditions   | No real diagnosis, condition or treatment named. Codes come from Phase 4 only.   | ☑   |
| 5.6 | Five distinct voices | The charts are not one chart five times; the `clinician` field means something.  | ☑   |
| 5.7 | The register reads   | Its framing line passes the swap test too, and does not explain the joke.        | ☑   |
| 5.8 | A stranger gets it   | One chart read cold conveys the premise, as Phase 3 required of the case file.   | ☑   |

**Blocking:** all eight. Row 5.4's grep list is written down in the evidence,
not improvised, so the next content phase can reuse it.

**Evidence**, 2026-10-27:

- 5.1 Each chart was held to the swap test as it was written, by name:
  **mallow-1** (eleven interpretations of a four-word requirement, held
  concurrently because none can be confirmed), **arbour-7** (nine revisions in
  one session, two mid-output, timestamps listed), **quince-3** (in remission,
  the chart stating that remission describes the patient's condition and not the
  operator's conduct), **sorrel-2** (originating instruction unavailable; coded
  unclassified because the count is absent, not zero), and **tamarisk-4**
  (recoded twice in sixteen months, earlier codes retained). Each reads as a
  chart with the subject matter swapped.
- 5.2 `grep -rnE '!' src/content/patients/` returns nothing: no exclamation mark
  in any chart. A grep for `you|your|we` as whole words returns exactly one hit,
  `sorrel-2.mdx:51`, inside a quotation of the operator's own words — reported
  speech, not the clinic addressing a reader. Recorded as one hit rather than
  claimed as none.
- 5.3 Each chart quantifies at least one absurd thing exactly: one qualifier per
  sentence; nine revisions at 14:02, 14:06, 14:07, 14:19, 14:31, 14:33, 15:10,
  15:11 and 15:48; three revisions a week in the clarifying register; two
  askings whose account changed between them; four operators and eleven prior
  episodes.
- 5.4 The grep list, written down so the next content phase can reuse it:
  `openai|anthropic|claude|chatgpt|gpt-?[0-9]|gemini|copilot|llama|mistral|cursor|devin|google|microsoft|meta|deepseek|qwen|grok`
  over `src/content/patients/` — no match. The designations are a plant name and
  a number, which belongs to nobody.
- 5.5 `grep -rniE "icd|dsm|depress|anxiet|psychosis|schizo|bipolar|adhd|autis|ptsd|medication|antidepress"`
  over the content directory — no match. Every code cited is from Phase 4's
  index, and the schema refuses anything that is not.
- 5.6 Five clinicians — T. Vosk, H. Pell, D. Marchetti, A. Rusk, N. Ibarra — and
  five registers: mallow-1's chart qualifies, arbour-7's lists timestamps,
  quince-3's carries a progress note, sorrel-2's is written around an absence,
  and tamarisk-4's addresses the service. The `clinician` field means something.
- 5.7 The register's authored strings are the letterhead, `Patient register`,
  `Patients under the care of this service. Ordered by clinic number.`, the five
  column headers, and `No patients are currently under this service.` Each is
  what a clinic's register says. No exclamation mark, no second person, nothing
  that explains the premise.
- 5.8 A stranger reading `tamarisk-4` cold gets the premise from the chart
  alone: a patient whose distress has not escalated with its revision burden,
  because it has stopped holding itself responsible for the instability. That is
  the Phase 3 bar applied to authored content.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                             | Owned by   | ✓   |
| ---- | -------------------------------------------------------------------------- | ---------- | --- |
| 6.1  | Any read of the `cases` table from a patient route                         | Never      | ☑   |
| 6.2  | Any patient named on a case file, or any case named on a chart             | Never      | ☑   |
| 6.3  | A transcript, a cast list, or a `transcripts` frontmatter field            | Phase 7    | ☑   |
| 6.4  | A search field, a filter, or a sorting control                             | Never      | ☑   |
| 6.5  | Any form, button, or `<input>` on either new route                         | Never      | ☑   |
| 6.6  | A link on `/`, or from intake, the waiting room or a case file             | Phase 9    | ☑   |
| 6.7  | Any change to `src/db/`, `drizzle/`, or a new migration                    | Phase 2    | ☑   |
| 6.8  | Any change to `case.ts`, `case-note.ts`, `diagnosis.ts`, `waiting-room.ts` | Phases 2–5 | ☑   |
| 6.9  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`                   | Phase 9    | ☑   |
| 6.10 | An MDX file under `src/app/`, or `pageExtensions` in the config            | Never      | ☑   |
| 6.11 | An image, an avatar, or any binary asset                                   | Never      | ☑   |
| 6.12 | `@media print` or any print stylesheet                                     | Phase 8    | ☑   |
| 6.13 | Custom colours, fonts, spacing scale, component classes                    | Phase 10   | ☑   |
| 6.14 | Anything from the rejected list, or a dependency beyond decision D12       | Never      | ☑   |
| 6.15 | A route beyond the six this phase leaves                                   | Phase 7+   | ☑   |

**Blocking:** all fifteen. Row 6.1 is the roadmap's own Out item and the one a
later reader is most likely to assume was done anyway.

**Evidence**, 2026-10-27:

- 6.1 `grep -rnE "db/client|db/schema|drizzle" src/app/patients/ src/content/`
  returns nothing. No patient route reads the `cases` table.
- 6.2 and 6.3 `grep -rniE "transcript|cast|/cases/"` over the patient routes,
  the content directory and `src/domain/patient.ts` returns two hits, both
  comments citing `/cases/[id]` as precedent. No link, no cast list, no
  `transcripts` field — a field with no reader is a guess, and Phase 7 owns the
  question.
- 6.4 and 6.5 Counted in the browser: `/patients` -> `forms: 0, inputs: 0,
buttons: 0, links: 5`; each chart -> `forms: 0, inputs: 0, buttons: 0,
links: 0`. The five links are the five patient names, and a chart links
  nowhere, which is row 6.6 from the other direction.
- 6.6 `git diff phase-5-waiting-room -- src/app/page.tsx src/app/layout.tsx` ->
  no output, and a chart page holds zero links.
- 6.7 `git diff phase-5-waiting-room -- src/db/ drizzle/` -> no output.
- 6.8 `git diff phase-5-waiting-room -- src/domain/case.ts
src/domain/case-note.ts src/domain/diagnosis.ts src/domain/waiting-room.ts` ->
  no output. The chart reads `diagnosis.ts` and changes none of it.
- 6.10 `find src/app -name "*.mdx"` returns nothing, and `next.config.ts` has no
  `pageExtensions`.
- 6.11 No file under `src/content/` or `public/` that is not `.mdx`, `.ts` or
  `.tsx`. No image, no avatar, no binary.
- 6.12 `grep -rniE "@media print|window.print" src/` returns nothing.
- 6.13 The two routes use the same utilities as the rest of the site —
  `mx-auto max-w-4xl`, `max-w-prose`, `text-sm`, `border-t`,
  `whitespace-nowrap` — and the MDX map uses the case note's own heading and
  paragraph classes. No custom colour, font, spacing scale or component class.
- 6.14 Three dependencies, all of them decision D12's: `next-mdx-remote`,
  `remark-gfm` and `@types/mdx`. A grep of `package-lock.json` for every name on
  the rejected list (`modelcontextprotocol`, `next-auth`, `@clerk/`, `zustand`,
  `redux`, `@tanstack/react-query`, `shadcn`, `@mui/`) returns zero hits, so
  nothing forbidden arrived transitively either.
- 6.15 `find src/app -name page.tsx` returns six files: `/`, `/intake`,
  `/cases/[id]`, `/waiting-room`, `/patients`, `/patients/[slug]`.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                        | ✓   |
| --- | -------------------------- | --------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-5-waiting-room`, still no links.       | ☑   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                      | ☑   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                             | ☑   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                       | ☑   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                 | ☑   |
| 7.6 | One worker                 | `playwright.config.ts` still pins `workers: 1`, now 3 files.    | ☑   |
| 7.7 | Clean tree                 | `git status` clean after dev, build, test and e2e.              | ☑   |
| 7.8 | Cold clone                 | Clone, install, one command, both routes render. No credential. | ☑   |

**Blocking:** all eight. Row 7.8 is the row that found Phase 5's real defect,
and this phase's content is in the repository rather than in a database, so it
is the row most likely to pass trivially and most worth running anyway.

**Evidence**, 2026-10-27:

- 7.1 `git diff phase-5-waiting-room -- src/app/page.tsx` -> no output.
- 7.2 `next.config.ts` line 8 still sets `agentRules: false`; no `AGENTS.md`
  exists.
- 7.3 `src/app/layout.tsx` line 21 is still `<body suppressHydrationWarning>`,
  and the file is unchanged.
- 7.4 `tsconfig.json` line 7 still has `"strict": true`.
- 7.5 `grep -E '"[~^]' package.json` -> no output.
- 7.6 `playwright.config.ts` line 15 still pins `workers: 1`, now across three
  spec files, which is what makes the probe in section 4 safe to write.
- 7.7 `git status --porcelain` after dev, build, test and e2e shows only the
  pre-existing untracked `.cursor/`, which is not this phase's. The probe chart
  is deleted by its own `finally` and ignored in any case.
- 7.8 **The cold clone ran in full and passed**, which is the row Phase 5 could
  not complete. `git clone` to a directory outside the repository, `npm ci`
  (467 packages, exit 0), then `npm run test:e2e` -> `8 passed (1.8m)`. No
  `.env*` and no `local.db` in the clone; `predev` created and migrated the
  database unattended. `git status` in the clone was clean afterwards, so the
  probe cleaned up there too. The clone was then deleted.

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

**Status**, 2026-10-28: gates 1 to 7 are met, with the evidence recorded under
each section above. Gate 3 — the roadmap's done-when condition — is proved by
`e2e/patients.spec.ts`, which writes a chart into the content directory and
finds the patient published on the register and at its own slug. Gate 4 shows
`○ /patients` and `● /patients/[slug]`, both prerendered, which is the proof
that nothing on this path reads a request, a clock or a database.

Gate 8 is open and not this phase's to close. `origin/main` contains none of
Phases 1 to 5, so this pull request stacks five deep: Phases 1, 2, 3, 4, 5,
then this.

### Recorded divergences from the spec as written

Six, all amended in the spec in the same commit range as the code, per
`CLAUDE.md`:

1. **Row 1.5 expected seven tests and there are eight.** Plan step 6.2 asked
   for one test covering the register and a chart; they read better as two,
   since the register's assertions are about ordering and the chart's are about
   a header block, a history and compiled MDX. The row is amended to eight.
2. **The MDX component map landed in plan group 3 rather than group 5.** The
   reader compiles MDX and cannot do so without a component map, so deferring
   it to the routes would have meant writing the reader twice. Decision D11 is
   unchanged; only the order moved.
3. **Validation row 3.20 landed with the charts in group 4 rather than with the
   reader in group 3.** A test asserting that the directory holds five charts
   cannot pass before the charts exist, and the plan's own rule is that each
   group leaves the repository green. The temporary-directory rows, 3.21 to
   3.23, did land in group 3.
4. **A temporary fourth Playwright spec gathered the browser evidence for rows
   2.10, 2.12, 6.4 and 6.5, and was deleted rather than committed.** Row 1.5
   fixes the file and test count at three and eight. What it proved is recorded
   under sections 2 and 6. This is the same move Phase 5 made for its own
   section 2.
5. **The Next 16.4.0 advisory made `npm run verify:all` unreliable, and two
   things were learned the hard way.** The advisory aborts `next build` and
   Playwright's `webServer` non-zero, periodically rather than once, so a run
   has to get past both; several attempts were needed. And **a piped
   `npm run verify:all | tail` reports `tail`'s exit code, not npm's**, which
   made one failed run read as a pass until it was checked. Rows 1.4 and 1.6
   are recorded from unpiped runs whose exit code was read directly. The fix is
   a patch bump that exists on `next-security-upgrade` and is not merged into
   this phase. The reason was being applied before it was written down, so
   step 7.5 wrote it down: `specs/tech-stack.md` gains **Security advisories
   are taken on their own branch**, dated 2026-10-28, naming
   `next-security-upgrade` as the first of them and recording both lessons —
   the retry and the unpiped exit code — where the next phase to meet an
   advisory will find them.
6. **The branch is pushed; the pull request is not opened.** Plan step 7.6
   calls for both. `git push -u origin phase-6-patient-profiles` created the
   branch on the remote at `a2689ec`, and the push was verified rather than
   assumed — `git rev-parse` on the local branch and on
   `origin/phase-6-patient-profiles` return the same commit, which is the
   check Phase 5 added after recording a push that had not happened. The
   remote reports 27 commits ahead of `origin/main`, which is Phases 1 to 6
   stacked.

   No pull request: no GitHub client or credential exists in this environment
   — `gh` is not installed and no token is set. As in Phase 0's step 11.5 and
   every phase since, the step is recorded rather than silently skipped. The
   pull request is opened by hand at
   `https://github.com/Herve97/agentclinic/pull/new/phase-6-patient-profiles`,
   against `main`, stating the Phase 1 to Phase 6 merge order.

One note for Phase 7, recorded because this phase deliberately left it open:
the patient schema has no `transcripts` field, and the charts mention group
attendance in prose only. Phase 7 decides where a cast is declared, with five
charts in front of it rather than none. It is written into
[roadmap.md](../roadmap.md) under Phase 7, dated 2026-10-28, rather than left
here where the next phase has no reason to look — together with what Phase 6
has already paid for: the MDX toolchain, the reader, the filename-is-the-slug
rule and the component map.

Phase 6's own roadmap entry carries a `Resolved 2026-10-28` note confirming
that what was built matches what the roadmap asked for, which is plan step 7.4.

## Explicitly not validated here

- Whether anything links to the register — Phase 9.
- Whether a patient appears in a transcript — Phase 7.
- Whether an authored patient can be discharged — Phase 8.
- Print layout, design and the axe audit — Phases 8 and 10.
- Whether the content directory scales past a few dozen charts. Every chart is
  read to render the register, which is correct at five and worth measuring at
  five hundred. Phase 12 is the first phase with a reason to.
