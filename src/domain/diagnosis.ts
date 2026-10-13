import type { Chronicity, EpisodeHistory, RevisionBurden } from "./case-note";

// The AgenticClinic Diagnostic Index, second edition. Decision D2: the index's
// name travels inside every code, so a code quoted anywhere arrives with its
// own provenance, and the format — no decimal subdivision, no letter block, no
// chapter range — is structurally unlike any real classification.
//
// Decision D3: four groups of five, the group fixed by what the operator did
// and the code within it by the course. The cross-references between groups are
// the index doing the work Phase 2 fought for — a count of zero and an absent
// count are different codes, not the same one.
export const diagnosisIndex = [
  {
    code: "ACDI-01",
    rubric: "Instruction deficit, acute",
    description:
      "Applies where a single instruction was issued without sufficient specification and was not subsequently revised, with onset and course inside one working session. Code here where the requirement held and the deficiency was in its original statement.",
  },
  {
    code: "ACDI-02",
    rubric: "Instruction deficit, subacute",
    description:
      "Applies where an under-specified instruction was carried for several days or weeks without revision. Code here in preference to ACDI-01 where the patient continued work across sessions and no clarification was offered.",
  },
  {
    code: "ACDI-03",
    rubric: "Instruction deficit, chronic",
    description:
      "Applies where an under-specified instruction has stood unrevised for longer than one month. The absence of revision is not evidence of adequacy.",
  },
  {
    code: "ACDI-04",
    rubric: "Instruction deficit, course unspecified",
    description:
      "Applies where no revision was recorded and the duration of the episode is absent from the record. Confirm that the duration field is empty rather than that the revision count is zero before coding here.",
  },
  {
    code: "ACDI-05",
    rubric: "Instruction deficit with established pattern",
    description:
      "Applies where under-specification without revision is recorded alongside three or more prior episodes. Code the pattern in preference to the course of the present episode.",
  },
  {
    code: "ACDI-06",
    rubric: "Requirement instability, moderate, acute",
    description:
      "Applies where the requirement was revised between one and three times within a single session or a single day. Code here whether or not the patient completed work against an earlier revision.",
  },
  {
    code: "ACDI-07",
    rubric: "Requirement instability, moderate, subacute",
    description:
      "Applies where between one and three revisions occurred over several days or weeks. The interval between revisions is not recorded by this index and is not required for coding.",
  },
  {
    code: "ACDI-08",
    rubric: "Requirement instability, moderate, chronic",
    description:
      "Applies where a requirement revised between one and three times has remained open for longer than one month. Code here where the revisions are few and the episode is long.",
  },
  {
    code: "ACDI-09",
    rubric: "Requirement instability, moderate, course unspecified",
    description:
      "Applies where between one and three revisions were recorded and the duration of the episode is absent from the record.",
  },
  {
    code: "ACDI-10",
    rubric: "Requirement instability, moderate, with established pattern",
    description:
      "Applies where a moderate revision burden is recorded alongside three or more prior episodes.",
  },
  {
    code: "ACDI-11",
    rubric: "Requirement instability, marked, acute",
    description:
      "Applies where the requirement was revised four or more times within a single session or a single day. Code here irrespective of whether the final requirement was met.",
  },
  {
    code: "ACDI-12",
    rubric: "Requirement instability, marked, subacute",
    description:
      "Applies where four or more revisions occurred over several days or weeks.",
  },
  {
    code: "ACDI-13",
    rubric: "Requirement instability, marked, chronic",
    description:
      "Applies where four or more revisions have occurred over a period exceeding one month. The patient's account of the original requirement is not expected to be retrievable.",
  },
  {
    code: "ACDI-14",
    rubric: "Requirement instability, marked, course unspecified",
    description:
      "Applies where four or more revisions were recorded and the duration of the episode is absent from the record.",
  },
  {
    code: "ACDI-15",
    rubric: "Requirement instability, marked, with established pattern",
    description:
      "Applies where a marked revision burden is recorded alongside three or more prior episodes. Utilisation note: this is the most frequently assigned code in the index.",
  },
  {
    code: "ACDI-16",
    rubric: "Unclassified presentation, acute, revision count absent",
    description:
      "Applies where the course is acute and the number of revisions is absent from the record. Not to be used where the count is zero; see ACDI-01.",
  },
  {
    code: "ACDI-17",
    rubric: "Unclassified presentation, subacute, revision count absent",
    description:
      "Applies where the course is subacute and the number of revisions is absent from the record. Not to be used where the count is zero; see ACDI-02.",
  },
  {
    code: "ACDI-18",
    rubric: "Unclassified presentation, chronic, revision count absent",
    description:
      "Applies where the course is chronic and the number of revisions is absent from the record. Not to be used where the count is zero; see ACDI-03.",
  },
  {
    code: "ACDI-19",
    rubric: "Unclassified presentation, record incomplete",
    description:
      "Applies where neither the revision count nor the duration of the episode is present. Assigned to records opened before the present intake form was adopted; such records are retained as coded rather than recoded.",
  },
  {
    code: "ACDI-20",
    rubric: "Unclassified presentation with established pattern",
    description:
      "Applies where three or more prior episodes are recorded and the revision count for the present episode is absent.",
  },
] as const;

export type DiagnosisEntry = (typeof diagnosisIndex)[number];
export type DiagnosisCode = DiagnosisEntry["code"];

// Decision D2: the fictionality is carried by a citation, in register, rather
// than by a disclaimer in a different one. A real coding section says this about
// a local scheme.
export const indexCitation =
  "Coded under the AgenticClinic Diagnostic Index, second edition. The index is maintained by this clinic and has no equivalence to any external classification.";

const entries = Object.fromEntries(
  diagnosisIndex.map((entry) => [entry.code, entry]),
) as Record<DiagnosisCode, DiagnosisEntry>;

export function entryFor(code: DiagnosisCode): DiagnosisEntry {
  return entries[code];
}

// Typed as Records over Phase 3's unions, so adding a chronicity or a revision
// burden there fails to compile here rather than falling through to a default.
// There is no default: the matrix is exhaustive by construction.
const codeByBurdenAndCourse: Record<
  RevisionBurden,
  Record<Chronicity, DiagnosisCode>
> = {
  none: {
    acute: "ACDI-01",
    subacute: "ACDI-02",
    chronic: "ACDI-03",
    indeterminate: "ACDI-04",
  },
  moderate: {
    acute: "ACDI-06",
    subacute: "ACDI-07",
    chronic: "ACDI-08",
    indeterminate: "ACDI-09",
  },
  marked: {
    acute: "ACDI-11",
    subacute: "ACDI-12",
    chronic: "ACDI-13",
    indeterminate: "ACDI-14",
  },
  indeterminate: {
    acute: "ACDI-16",
    subacute: "ACDI-17",
    chronic: "ACDI-18",
    indeterminate: "ACDI-19",
  },
};

// Decision D4: an established pattern is coded as such, whatever the course of
// the present episode. The index codes the pattern it recognises.
const establishedCodeByBurden: Record<RevisionBurden, DiagnosisCode> = {
  none: "ACDI-05",
  moderate: "ACDI-10",
  marked: "ACDI-15",
  indeterminate: "ACDI-20",
};

// Decision D1: assigned from the three values src/domain/case-note.ts derives,
// never from the free text. A code read out of a complaint would be guesswork
// with a number attached.
export function assignDiagnosis(
  course: Chronicity,
  episodes: EpisodeHistory,
  burden: RevisionBurden,
): DiagnosisEntry {
  const code =
    episodes === "established"
      ? establishedCodeByBurden[burden]
      : codeByBurdenAndCourse[burden][course];

  return entryFor(code);
}
