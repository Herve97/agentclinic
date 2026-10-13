# Phase 4 — Diagnosis coding: Plan

Task groups are numbered and ordered. Each leaves the repo in a committable
state. Do not start a group until the previous one's check passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The table comes before the function, because the table is the content and the
function is twelve lines. Writing the function first would mean authoring twenty
rubrics while thinking about control flow.

---

## 1. The code table

1.1 Create `src/domain/diagnosis.ts` with the twenty codes of decision D3, each
holding its code, its rubric, and the index's own description.

1.2 Author the rubrics. A rubric is the index's short title for the category, in
the register of a coding manual: a noun phrase with qualifiers, not a sentence.

1.3 Author the descriptions. A description is the index's own definition of what
the code covers — what a real manual calls an inclusion note. One or two
sentences, written to the coder, not to the patient.

1.4 Author the citation line of decision D2, which names the index and its
edition and states that it is maintained by this clinic.

1.5 Read all twenty rubrics and all twenty descriptions against
[mission.md](../mission.md). Check specifically that none describes a real
condition, names a real classification, or reads as a severity scale
(decision D5).

**Check:** twenty entries, each with a unique code, rubric and description, and
nothing in the file that a reader could mistake for a real code.

---

## 2. The assignment function

2.1 Add `assignCode(chronicity, episodeHistory, revisionBurden)` to
`src/domain/diagnosis.ts`, typed over Phase 3's exported union types so an
added branch there fails to compile here.

2.2 Implement decision D4: an established episode history selects the group's
established-pattern code; otherwise the course selects within the group.

2.3 The function is total. Every combination of the three unions returns a code
— there is no fallback branch, because the types make the matrix exhaustive.

2.4 Export a lookup from code to entry, so the page renders the rubric and
description without a second table.

**Check:** `assignCode` returns a code for all sixty-four combinations of the
three unions, and every one of the twenty codes is returned by at least one
combination.

---

## 3. The tests

3.1 One named test per row of the table in [validation.md](./validation.md) §3 —
one per code, naming the combination that produces it.

3.2 A test that walks all sixty-four combinations and asserts a code is always
returned, never `undefined`.

3.3 A test that the twenty codes returned across the matrix are exactly the
twenty codes in the table — no code unreachable, no code returned that is not
in the table.

3.4 A test that every entry's code, rubric and description are non-empty and
that the codes are unique.

3.5 No test may import the database or a renderer.

**Check:** `npm run test` passes, §3 has a named test per code, and the
reachability test would fail if a code were orphaned.

---

## 4. The case file and the e2e spec

4.1 Add the `Diagnosis` section to `src/app/cases/[id]/page.tsx`, between
`Assessment` and `Plan` per decision D7.

4.2 Render the code, the rubric, the description and the citation. The code and
its rubric are the line a reader will screenshot, so they come first.

4.3 Update the heading assertion in `e2e/intake.spec.ts` to seven headings.

4.4 Assert the assigned code for the combination the spec submits, scoped and
exact — Phase 3 recorded that an unscoped `toContainText` passes against the
label beside the value.

4.5 Break one new assertion deliberately and confirm it produces a real
assertion diff.

4.6 Confirm a Phase 1 row — five nulls — renders a code from the
`ACDI-16` to `20` group rather than an empty section.

**Check:** `npm run test:e2e` passes both specs, and the deliberate failure
produced a diff.

---

## 5. Review against the spec

5.1 Walk [validation.md](./validation.md) top to bottom and tick every row with
evidence.

5.2 Re-read the Out list. Confirm one code per case, no severity, no stored
code, no new route, no change to intake, no print stylesheet, no design work,
and nothing from the rejected list.

5.3 Confirm `/`, `src/app/layout.tsx`, `src/app/intake/`, `src/db/` and
`src/domain/case.ts` are byte-identical to `phase-3-chart-note`.

5.4 Amend Phase 3's decision D1 to record that the section list is now seven,
and amend Phase 3's open question to record that this phase answered it.

5.5 Confirm [roadmap.md](../roadmap.md) Phase 4 still matches what was built,
and that Phase 5 and Phase 8 still own what decision D6 deferred.

5.6 If reality diverged from the spec anywhere, amend the spec in the same
commit range.

5.7 Commit, push, open a pull request against `main`, stating the Phase 1 to
Phase 4 merge order.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the stacking is stated.
