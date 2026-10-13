# Phase 2 — The real intake form: Plan

Task groups are numbered and ordered. Each group leaves the repo in a state
that can be committed. Do not start a group until the previous one's check
passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

The order puts the schema and its tests before the form, because the roadmap's
done-when condition is half unit tests and those are cheaper to get right
against a schema than against a rendered form. The e2e spec is updated in the
same group as the form, since the moment the fields become required the Phase 1
spec starts failing.

---

## 1. The domain schema and its tests

The validation rules come first. They are the half of the done-when condition
that does not need a browser.

1.1 Extend `src/domain/case.ts` to the six fields in decision D1. One rule per
field, each with a message in chart register (decision D6).

1.2 `duration` is a union of the five fixed options from D1. An unrecognised
value is rejected — a hand-crafted POST must not be able to store
`duration: "ages"`.

1.3 The two integer fields validate the string shape before converting
(decision D5). Reject `""`, `"abc"`, `"3.5"`, `"-1"`, `"1e3"`, `" "`.
Accept `"0"`.

1.4 Export the field list and the duration options from this file so the form,
the action and the tests all read them from one place rather than three
copies.

1.5 Write the unit tests. **One named test per branch in the table in
[validation.md](./validation.md) §3** — not one test per field. The
roadmap says every validation branch, so a passing count is the evidence.

1.6 Confirm a valid parse returns trimmed strings and real numbers, not
strings that look like numbers.

**Check:** `npm run test` passes, the branch table in validation §3 has a test
for every row, and no test touches the database.

---

## 2. The migration

2.1 Add the five columns to `src/db/schema.ts`, nullable, per decision D2.

2.2 Generate the migration with `npm run db:generate -- --name=add_intake_fields`.

2.3 **Read the generated SQL before committing it.** Confirm it is five
`ALTER TABLE ... ADD COLUMN` statements and that it does not recreate the
table — SQLite migrations that rebuild a table silently lose data, and this
one has no reason to.

2.4 Apply it against the existing `local.db`, which still holds Phase 1 rows.
Confirm those rows survive with nulls in the new columns rather than being
dropped or defaulted.

2.5 Confirm the migration is additive by running the migrator twice.

**Check:** the Phase 1 rows are still present and readable, the five columns
exist and permit null, and a second migrate run is a no-op.

---

## 3. The action

3.1 Rewrite `src/app/intake/actions.ts` to parse all six fields and return
`{ errors, values }` keyed by field (decision D3).

3.2 On success, insert all six and redirect. `redirect()` stays **outside**
any `try`/`catch` — the Phase 1 note that it signals control flow by
throwing still applies.

3.3 On failure, return the errors and the submitted values. Write no row.

3.4 Take the first message per field from Zod rather than the array
(decision D3).

**Check:** a valid submission inserts one row with all six values populated; an
invalid one writes nothing and returns a message for each offending field.

---

## 4. The form

4.1 Rewrite `src/app/intake/intake-form.tsx` for six fields. A real `<label>`
bound to every control, including the `<select>`.

4.2 Each field renders its own error next to it, from `state.errors`.

4.3 Every field repopulates from `state.values` so a failed submit does not
clear the form (decision D3). The `<select>` keeps its selection too — the
easiest field to forget.

4.4 Associate each message with its control for assistive technology
(`aria-describedby`, or an equivalent). Semantics are free; Phase 10 owns
the look, not the wiring.

4.5 Styling is whatever makes the form usable. No spacing system, no type
scale, no component classes.

**Check:** submitting an incomplete form shows a message against each missing
field and preserves every other answer, including the `<select>`.

---

## 5. `/cases/[id]` and the e2e specs

These move together: the page has to show the fields for the round trip to be
observable, and the specs have to fill them for anything to pass at all.

5.1 `/cases/[id]` renders the six fields as a `<dl>`, with a missing value
shown as "Not recorded." (decision D8). No section headings.

5.2 Update `e2e/intake.spec.ts` to fill all six fields (decision D7). Keep the
existing case-number assertion — it is the roadmap's Phase 1 done-when
condition and must keep passing.

5.3 Extend it to assert each submitted value appears on the resulting page.
This is the roadmap's "each field round-trips to the database", proved from
the outside.

5.4 Add a second spec for the failure path: omit one field, assert that
field's message appears, assert the other five keep their values, and assert
no row was written.

5.5 Use `p[role="alert"]` or a field-scoped locator, not `getByRole("alert")` —
Phase 1 recorded that the latter also matches Next's route announcer.

**Check:** `npm run test:e2e` passes both specs, and the deliberate-failure
step on at least one new assertion produces a real assertion diff.

---

## 6. Review against the spec

6.1 Walk [validation.md](./validation.md) top to bottom and tick every row with
evidence, not assertion.

6.2 Re-read the Out list in [requirements.md](./requirements.md). Confirm no
design work, no diagnosis logic, no chart-note sections, no derived fields,
no new route, no form library, and no link on `/`.

6.3 Confirm `/` and `src/app/layout.tsx` are byte-identical to
`phase-1-slice`.

6.4 Confirm [roadmap.md](../roadmap.md) Phase 2 still matches what was built,
and that Phase 3 and Phase 11 still own what this phase deferred — the
chart-note layout and derived fields, and the length caps restated in
decision D4.

6.5 Re-check the voice of all six labels and all validation messages against
the test in [mission.md](../mission.md). These are the phase's most visible
copy and the easiest place for UI register to creep in.

6.6 If reality diverged from the spec anywhere, amend the spec in the same
commit range.

6.7 Commit, push, open a PR against `main` — noting in the description that it
stacks on Phase 1 and that Phase 1 merges first.

**Check:** every row in `validation.md` is ticked, `npm run verify:all` passes,
and the stacking is stated in the PR.
