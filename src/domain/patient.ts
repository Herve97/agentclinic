import { z } from "zod";

import { diagnosisIndex, type DiagnosisCode } from "./diagnosis";

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

// Decision D3: the slug is the filename, so the filename carries the URL's
// shape. Lowercase, digits, single internal hyphens, then .mdx.
const filenamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/;

const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

// A shaped date and a real date are different questions. 2026-13-45 passes the
// pattern and is not a day, and a chart dated to a month that does not exist is
// the kind of error a schema is for. No clock is read: the components are
// compared against what UTC made of them.
function isRealDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

const clinicalDate = (field: string) =>
  z
    .string({ error: `${field} must be recorded as YYYY-MM-DD.` })
    .trim()
    .regex(datePattern, `${field} must be recorded as YYYY-MM-DD.`)
    .refine(isRealDate, `${field} must be a date that exists.`);

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

// Decision D3: a filename that cannot be a slug is rejected with its own name
// in the message, rather than published at a URL that needs escaping.
export function slugFromFilename(filename: string): string {
  if (!filenamePattern.test(filename)) {
    throw new Error(
      `${filename}: a chart filename is lowercase letters, digits and single hyphens, ending in .mdx.`,
    );
  }

  return filename.slice(0, -".mdx".length);
}

// The message a reader of the build output needs: which file, which field,
// what is wrong with it. Zod reports every issue; the first one is enough to
// send somebody to the right line, and the count says whether to expect more.
export function frontmatterError(
  filename: string,
  error: z.ZodError<unknown>,
): Error {
  const [issue] = error.issues;
  const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
  const remaining =
    error.issues.length > 1
      ? ` (${error.issues.length - 1} further issue${error.issues.length > 2 ? "s" : ""} in this file)`
      : "";

  return new Error(`${filename}: ${path}${issue.message}${remaining}`);
}

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
