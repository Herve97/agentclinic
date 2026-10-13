# Phase 3 — The case file as a chart note: Validation

How to know Phase 3 succeeded and can be merged.

The roadmap's done-when condition is a judgement: **a stranger reading one case
file gets the premise with no other context.** Section 5 turns that into a test
with a stated failure condition. Sections 3 and 4 check the machinery that makes
it possible.

Every row needs evidence — a command's actual output, a file's actual contents,
a page's actual text. "Looks right" is not evidence.

**Carried forward:** a clean `curl` is not evidence about the browser console
(Phase 0); `getByRole("alert")` also matches Next's route announcer (Phase 1);
and a `"use server"` module may only export async functions (Phase 2).

---

## 1. The commands

| #   | Command                  | Expected                                                  | ✓   |
| --- | ------------------------ | --------------------------------------------------------- | --- |
| 1.1 | `npm run lint`           | Exits 0, zero errors, zero warnings.                      | ☐   |
| 1.2 | `npm run build`          | Exits 0. `/cases/[id]` still dynamic, still three routes. | ☐   |
| 1.3 | `npm run test`           | Exits 0. Every branch in §3 has a passing test.           | ☐   |
| 1.4 | `npm run verify`         | Exits 0.                                                  | ☐   |
| 1.5 | `npm run test:e2e`       | Exits 0. **2 passed** — still two specs, both updated.    | ☐   |
| 1.6 | `npm run verify:all`     | Exits 0.                                                  | ☐   |
| 1.7 | `npx prettier --check .` | Exits 0.                                                  | ☐   |
| 1.8 | `npm run db:migrate`     | No new migration. The journal still lists two entries.    | ☐   |

**Blocking:** all eight. Row 1.8 is the check that this phase only read.

---

## 2. The note has the six sections, in order

| #   | Check             | Expected                                                                                  | ✓   |
| --- | ----------------- | ----------------------------------------------------------------------------------------- | --- |
| 2.1 | Six sections      | Header block, presenting complaint, history, assessment, plan, follow-up.                 | ☐   |
| 2.2 | Order             | In the order of decision D1, top to bottom, in the DOM.                                   | ☐   |
| 2.3 | Real headings     | Each section has a heading element, not a styled `<div>`.                                 | ☐   |
| 2.4 | Heading hierarchy | One `<h1>`; sections are `<h2>`. No level skipped.                                        | ☐   |
| 2.5 | Header block      | States the case number, the intake date, the chronicity and the episode history.          | ☐   |
| 2.6 | Intake date       | Inside a `<time>` carrying the stored value. No locale formatting anywhere (decision D7). | ☐   |
| 2.7 | Said versus meant | Under history, as a reported-speech pair, with no heading framing them (decision D1).     | ☐   |
| 2.8 | No console errors | A real browser on `/cases/[id]` reports no errors and no warnings.                        | ☐   |

**Blocking:** all eight.

---

## 3. Every branch of every derived function has a unit test

**One named test per row.** A count of passing tests is the evidence.

| #    | Function           | Input                                         | Expected                  | ✓   |
| ---- | ------------------ | --------------------------------------------- | ------------------------- | --- |
| 3.1  | `chronicity`       | "Within a single session"                     | acute                     | ☐   |
| 3.2  | `chronicity`       | "Across several sessions today"               | acute                     | ☐   |
| 3.3  | `chronicity`       | "Several days"                                | subacute                  | ☐   |
| 3.4  | `chronicity`       | "Several weeks"                               | subacute                  | ☐   |
| 3.5  | `chronicity`       | "Longer than a month"                         | chronic                   | ☐   |
| 3.6  | `chronicity`       | `null`                                        | not determinable          | ☐   |
| 3.7  | `chronicity`       | an unrecognised string                        | not determinable          | ☐   |
| 3.8  | `chronicity`       | every option in `durationOptions`             | never not determinable    | ☐   |
| 3.9  | `episodeHistory`   | `0`                                           | first presentation        | ☐   |
| 3.10 | `episodeHistory`   | `1`                                           | recurrent                 | ☐   |
| 3.11 | `episodeHistory`   | `2`                                           | recurrent                 | ☐   |
| 3.12 | `episodeHistory`   | `3`                                           | established               | ☐   |
| 3.13 | `episodeHistory`   | `10`                                          | established               | ☐   |
| 3.14 | `episodeHistory`   | `null`                                        | not determinable          | ☐   |
| 3.15 | `episodeHistory`   | `-1`                                          | not determinable          | ☐   |
| 3.16 | `episodeHistory`   | `1.5`                                         | not determinable          | ☐   |
| 3.17 | `revisionBurden`   | `0`                                           | none                      | ☐   |
| 3.18 | `revisionBurden`   | `1`                                           | moderate                  | ☐   |
| 3.19 | `revisionBurden`   | `3`                                           | moderate                  | ☐   |
| 3.20 | `revisionBurden`   | `4`                                           | marked                    | ☐   |
| 3.21 | `revisionBurden`   | `14`                                          | marked                    | ☐   |
| 3.22 | `revisionBurden`   | `null`                                        | not determinable          | ☐   |
| 3.23 | `revisionBurden`   | `-1`                                          | not determinable          | ☐   |
| 3.24 | `revisionBurden`   | `2.5`                                         | not determinable          | ☐   |
| 3.25 | `followUpInterval` | every chronicity × episode-history pair       | a non-empty interval      | ☐   |
| 3.26 | `followUpInterval` | either value not determinable                 | states no interval is set | ☐   |
| 3.27 | Assessment copy    | every chronicity × episode-history pair       | an authored line exists   | ☐   |
| 3.28 | Plan copy          | every revision burden                         | an authored line exists   | ☐   |
| 3.29 | Totality           | no function returns `undefined` for any input | holds across the matrix   | ☐   |
| 3.30 | Purity             | no test imports the database or a renderer    | holds                     | ☐   |

**Blocking:** all thirty. Rows 3.8 and 3.29 are the ones that fail if a branch
set is extended later without extending the copy.

---

## 4. A chart note renders, including for an incomplete row

| #   | Check               | Expected                                                                                        | ✓   |
| --- | ------------------- | ----------------------------------------------------------------------------------------------- | --- |
| 4.1 | A complete row      | All six submitted values appear in the note.                                                    | ☐   |
| 4.2 | Quantities restated | The revision count and the episode count appear inside sentences, not as labelled numbers.      | ☐   |
| 4.3 | A zero survives     | `0` revisions reads as none recorded, not as blank and not as "Not recorded."                   | ☐   |
| 4.4 | A Phase 1 row       | `/cases/1` renders all six sections, with "Not recorded." and not-determinable lines. No error. | ☐   |
| 4.5 | Derived values      | Chronicity, episode history, revision burden and the interval all appear.                       | ☐   |
| 4.6 | Nothing invented    | No value appears that was not submitted or derived by a tested function.                        | ☐   |
| 4.7 | Still dynamic       | `npm run build` lists `/cases/[id]` as `ƒ`.                                                     | ☐   |
| 4.8 | A missing case      | An unknown or malformed id still 404s, exactly as Phase 1 left it.                              | ☐   |

**Blocking:** all eight. Row 4.4 is the consequence of Phase 2's decision D2 and
the reason decision D5 exists.

---

## 5. The premise lands, and the voice holds

The roadmap's done-when condition. This section is a judgement, so it is written
down as a test with a failure condition rather than left to taste.

| #   | Check                 | Expected                                                                                                            | ✓   |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | --- |
| 5.1 | The stranger test     | One complete case file, read with every other route hidden, conveys the premise with no explanation.                | ☐   |
| 5.2 | Nothing explains      | No line on the page explains the joke, addresses the reader, or describes the clinic's own concept.                 | ☐   |
| 5.3 | Swap test             | Every authored line could appear verbatim in a real chart with the subject matter swapped.                          | ☐   |
| 5.4 | No winking            | Zero exclamation marks. No "lol", no scare quotes, no aside, no sentence that signals it knows it is funny.         | ☐   |
| 5.5 | No second person      | No "you" or "your" in any authored line. A chart does not address its subject.                                      | ☐   |
| 5.6 | On the patient's side | The note treats the patient's complaint as legitimate and the human as the variable. Sympathy through thoroughness. | ☐   |
| 5.7 | Every line read       | All forty-two authored lines were read individually, not skimmed as a block.                                        | ☐   |

**Blocking:** all seven. 5.1 is the roadmap's condition. If any of 5.2 to 5.6 is
arguable, the line is wrong and gets rewritten rather than defended.

---

## 6. Nothing forbidden crept in

| #    | Must be absent                                                      | Owned by | ✓   |
| ---- | ------------------------------------------------------------------- | -------- | --- |
| 6.1  | Any diagnosis code, code table, or code-shaped string               | Phase 4  | ☐   |
| 6.2  | Any severity, score, or numeric rating of the patient               | Phase 4  | ☐   |
| 6.3  | `@media print` or any print stylesheet                              | Phase 8  | ☐   |
| 6.4  | Custom colours, fonts, spacing scale, type scale, component classes | Phase 10 | ☐   |
| 6.5  | Any route beyond `/`, `/intake`, `/cases/[id]`                      | Phase 5+ | ☐   |
| 6.6  | Any change to `src/app/page.tsx` or `src/app/layout.tsx`            | Phase 9  | ☐   |
| 6.7  | Any change to `src/app/intake/`, `src/domain/case.ts`, `src/db/`    | Phase 2  | ☐   |
| 6.8  | A new migration or a schema change                                  | Phase 8  | ☐   |
| 6.9  | Anonymisation, truncation, or a moderation flag                     | Phase 11 | ☐   |
| 6.10 | A new dependency, or anything from the rejected list                | Never    | ☐   |
| 6.11 | An LLM call, or copy that was generated rather than authored        | Never    | ☐   |
| 6.12 | `src/content/` created empty                                        | Phase 6  | ☐   |

**Blocking:** all twelve. Rows 6.6 and 6.7 are checked with
`git diff phase-2-intake-form -- <paths>` returning nothing.

---

## 7. Carried-over constraints

| #   | Check                      | Expected                                                         | ✓   |
| --- | -------------------------- | ---------------------------------------------------------------- | --- |
| 7.1 | `/` unchanged              | Byte-identical to `phase-2-intake-form`, still no links.         | ☐   |
| 7.2 | `agentRules: false`        | Still set; no `AGENTS.md`.                                       | ☐   |
| 7.3 | `suppressHydrationWarning` | Still on `<body>` with its comment.                              | ☐   |
| 7.4 | `strict: true`             | Still in `tsconfig.json`.                                        | ☐   |
| 7.5 | No ranges                  | `grep -E '"[~^]' package.json` returns nothing.                  | ☐   |
| 7.6 | Clean tree                 | `git status` clean after dev, build, test and e2e.               | ☐   |
| 7.7 | Cold clone                 | Clone, install, one command, a case file renders. No credential. | ☐   |

**Blocking:** all seven.

---

## Merge gate

Phase 3 can merge when:

1. Every blocking row above is ticked with evidence.
2. Section 3 has a passing named test for all thirty rows.
3. Section 4 shows a complete row and a Phase 1 row both rendering.
4. Section 5 records the stranger test, with the actual judgement, not a tick
   added because the code works.
5. `npm run verify:all` passes.
6. `/` and the whole write path are byte-identical to `phase-2-intake-form`.
7. **Phases 1 and 2 have merged**, or this pull request is explicitly marked as
   stacked on them, in that order.

## Explicitly not validated here

- Whether the case file carries a diagnosis — Phase 4.
- Whether it prints cleanly — Phase 8 adds the stylesheet, Phase 10 unifies it.
- Visual design and the axe audit — Phase 10.
- Whether a case is listed anywhere — Phase 5.
- Abuse, anonymisation and the enumerable-id problem — Phase 11.
- Anything about production — Phase 12.
