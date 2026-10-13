# Phase 3 — The case file as a chart note: Plan

Task groups are numbered and ordered. Each leaves the repo in a committable
state. Do not start a group until the previous one's check passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The order puts the derived functions and their tests first, because they are
the only logic in the phase and they are cheaper to get right against a test
than against a page. The copy comes second, on its own, so it is written and
read as copy rather than typed into JSX while thinking about markup. The page
and the e2e specs move together, as in Phase 2.

---

## 1. The derived functions and their tests

1.1 Create `src/domain/case-note.ts` with the four functions in decision D2.
Each takes the stored shape (`string | null`, `number | null`) and returns a
value for every input.

1.2 `chronicity` maps the five duration options from `case.ts` — import them,
do not retype them. An unrecognised string is "not determinable", the same as
`null`: the column is nullable text and nothing stops a hand-written row.

1.3 `episodeHistory` and `revisionBurden` take a count. Negative and
non-integer inputs cannot come from the schema but can come from the database,
so decide what they return and test it.

1.4 `followUpInterval` takes the two derived values, not the raw row. A
function over derived values cannot be made inconsistent with them.

1.5 Write the unit tests: one named test per branch in the table in
[validation.md](./validation.md) §3, plus the totality tests. **No test may
import the database or a React renderer.**

1.6 Confirm every function is total by exhausting its input space in a test —
the five durations plus `null` plus an unknown string; the counts
`0, 1, 2, 3, 4, 10` plus `null` plus `-1` plus `1.5`.

**Check:** `npm run test` passes, every row of validation §3 has a named test,
and `grep` finds no `db`, `drizzle` or `@testing-library` import in
`src/domain/case-note.test.ts`.

---

## 2. The copy

2.1 Author the assessment lines: one per chronicity × episode-history pair,
sixteen in all, in a record in `src/domain/case-note.ts`.

2.2 Author the plan lines: one per revision burden, four in all, and the
sixteen follow-up intervals, in the same file. The split is decision D3.

2.3 Author the follow-up intervals, the history sentences of decision D4, and
the "Not recorded." / "cannot be determined" lines of decision D5.

2.4 Read every line against the test in [mission.md](../mission.md): could it
appear verbatim in a real chart with the subject matter swapped? Cut any line
that signals it knows it is funny.

2.5 Count the exclamation marks, the second-person pronouns and the words
"just", "simply" and "actually". The target for each is zero.

**Check:** validation §5 can be ticked line by line, and no line needs an
argument made for it.

---

## 3. The page

3.1 Rewrite `src/app/cases/[id]/page.tsx` as the six sections of decision D1,
in that order, with a real heading per section.

3.2 The header block states the case number, the intake date per decision D7,
the chronicity and the episode history.

3.3 The history restates the quantities as sentences, per decision D4, and the
said/meant pair as reported speech.

3.4 A null renders per decision D5 — the value as "Not recorded.", the derived
line as not determinable. The page must render `/cases/1` with five nulls.

3.5 Keep the id guard and the `notFound()` path exactly as they are. They are
Phase 1's decision D6 and are not this phase's to revisit.

3.6 Styling is document structure only: headings, margins, a fixed label
column if the history needs one. No colour, no font, no spacing scale.

**Check:** `/cases/[id]` renders all six sections for a complete row and for a
Phase 1 row, and `npm run build` still lists `/cases/[id]` as dynamic.

---

## 4. The e2e specs

4.1 Update the round trip in `e2e/intake.spec.ts` per decision D6: keep the
case-number assertion, keep an assertion for every submitted value, and move
the locators onto the chart note's structure.

4.2 Assert the six section headings are present, by name.

4.3 Assert one derived value — the chronicity for the duration the spec
submits. One is enough; §3 owns the rules.

4.4 Leave the failure-path test alone. It never reaches a case file, and a
change to it would mean this phase had touched intake.

4.5 Break one new assertion deliberately and confirm it produces a real
assertion diff rather than passing vacuously.

**Check:** `npm run test:e2e` passes both specs, and the deliberate failure
produced a diff.

---

## 5. Review against the spec

5.1 Walk [validation.md](./validation.md) top to bottom and tick every row with
evidence, not assertion.

5.2 Re-read the Out list in [requirements.md](./requirements.md). Confirm no
diagnosis code, no severity, no score, no print stylesheet, no design system,
no new route, no change to intake, and nothing from the rejected list.

5.3 Confirm `/`, `src/app/layout.tsx`, `src/app/intake/` and `src/db/` are
byte-identical to `phase-2-intake-form`.

5.4 Read one complete case file as a stranger would, with the rest of the site
hidden, and record whether the premise lands without explanation. This is the
roadmap's done-when condition and the only row that cannot be automated.

5.5 Confirm [roadmap.md](../roadmap.md) Phase 3 still matches what was built,
and that Phase 4, Phase 8 and Phase 10 still own what this phase deferred —
the codes, the print stylesheet, and the design pass.

5.6 If reality diverged from the spec anywhere, amend the spec in the same
commit range.

5.7 Commit, push, open a pull request against `main` — noting that it stacks on
Phase 2, which stacks on Phase 1, and that they merge in that order.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the stacking is stated.
