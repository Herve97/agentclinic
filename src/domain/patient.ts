import { z } from "zod";

import { diagnosisIndex, type DiagnosisCode } from "./diagnosis";
import { clinicalDate, frontmatterError, requiredText } from "./frontmatter";

// Phase 6, decision D4. The frontmatter of a chart is a schema, not a
// convention: the roadmap's done-when condition is that adding a file publishes
// a patient with no code change, and a typo that publishes a chart with a blank
// status would make that property a liability rather than a feature.
//
// Nothing in this module reads the clock, the filesystem or the database. The
// one module that reads the filesystem is src/content/patients.ts.

// A chart's state, in the clinic's own words. Fixed, because the register has a
// column for it and a column with free text in it is not a column.
export const patientStatuses = [
  "Active",
  "In remission",
  "Lapsed",
  "Discharged",
] as const;

export type PatientStatus = (typeof patientStatuses)[number];

const indexedCodes = new Set<string>(diagnosisIndex.map((entry) => entry.code));

// Decision D6: the designation pattern. P- and four digits, clinic-assigned.
const numberPattern = /^P-[0-9]{4}$/;

// Decision D3, amended by Phase 7: the slug is the filename, and the rule that
// says so now lives in ./slug.ts because two collections share it. The date and
// text builders moved to ./frontmatter.ts for the same reason.

// Decision D4: the cited code is checked against Phase 4's own index rather
// than against a second list of codes kept here. A chart citing ACDI-21 would
// quietly contradict the index's twenty entries, and the only thing worse than
// an uncoded chart is a chart coded to nothing.
const diagnosisCode = z
  .string({ error: "A history entry requires a diagnosis code." })
  .trim()
  .refine((value): value is DiagnosisCode => indexedCodes.has(value), {
    error: (issue) =>
      `${String(issue.input)} is not in the AgenticClinic Diagnostic Index, second edition.`,
  });

// Decision D5: dated entries are data, because the register reads the most
// recent contact and the current code out of every chart. The narrative stays
// in the body, where prose belongs.
export const historyEntrySchema = z.strictObject({
  date: clinicalDate("A history entry's date"),
  code: diagnosisCode,
  note: requiredText("A history entry requires a note."),
});

// Decision D4, and the reason this is strict rather than permissive: an
// unrecognised key in frontmatter is almost always a misspelling of a
// recognised one — `clinicians` for `clinician` — and a misspelling that
// publishes is the failure this schema exists to prevent.
export const patientFrontmatterSchema = z.strictObject({
  name: requiredText("A patient designation is required."),
  number: z
    .string({ error: "A clinic number is required." })
    .trim()
    .regex(
      numberPattern,
      "A clinic number is recorded as P- followed by four digits.",
    ),
  status: z.enum(patientStatuses, {
    error: `Status must be recorded as one of: ${patientStatuses.join(", ")}.`,
  }),
  intake: clinicalDate("The intake date"),
  clinician: requiredText("The clinician holding the chart is required."),
  presenting: requiredText("A presenting line is required."),
  history: z
    .array(historyEntrySchema)
    .min(1, "A chart records at least one contact."),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type PatientFrontmatter = z.infer<typeof patientFrontmatterSchema>;

export type PatientRecord = {
  slug: string;
  frontmatter: PatientFrontmatter;
};

export function parsePatientFrontmatter(
  filename: string,
  data: unknown,
): PatientFrontmatter {
  const result = patientFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw frontmatterError(filename, result.error);
  }

  return result.data;
}

// Decision D5, and the one ordering choice in this phase a reader would
// otherwise assume was arbitrary: the register is ordered by clinic number,
// ascending, because that is what a register is. Phase 5's waiting room is
// newest-first because a queue is read from the front; a roster is read from
// the top, and a chart number never changes. Ordering by most recent contact
// would reshuffle the page every time somebody edited a chart.
export function registerOrder(patients: PatientRecord[]): PatientRecord[] {
  return [...patients].sort((a, b) =>
    a.frontmatter.number.localeCompare(b.frontmatter.number),
  );
}

// The register's last column. Authored order is not relied on: a chart written
// newest-first and a chart written oldest-first must agree. Where two entries
// share the newest date, the last one in the file wins — within a single day
// the author writes contacts in the order they happened.
export function mostRecentContact(frontmatter: PatientFrontmatter) {
  return frontmatter.history.reduce((latest, entry) =>
    entry.date >= latest.date ? entry : latest,
  );
}

// Phase 7, decision D3: these moved to ./slug.ts and ./frontmatter.ts. They are
// re-exported here so that nothing which imported them from this module had to
// be edited — a move that forces its callers to change is a rewrite.
export { slugFromFilename } from "./slug";
export { frontmatterError } from "./frontmatter";
