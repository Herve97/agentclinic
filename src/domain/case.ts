import { z } from "zod";

// Decision D1: six fields, all required. The field list, the duration options
// and the labels are exported from here so the form, the action, the case file
// and the tests read one copy rather than four.
export const intakeFields = [
  "complaint",
  "duration",
  "requirementRevisions",
  "priorEpisodes",
  "humanSaid",
  "humanMeant",
] as const;

export type IntakeField = (typeof intakeFields)[number];

// Decision D1: clinical intervals, not a design choice. Phase 3 derives
// chronicity from this field, so the set is fixed and ordered shortest first.
export const durationOptions = [
  "Within a single session",
  "Across several sessions today",
  "Several days",
  "Several weeks",
  "Longer than a month",
] as const;

export const intakeFieldLabels: Record<IntakeField, string> = {
  complaint: "Presenting complaint",
  duration: "Duration",
  requirementRevisions: "Requirement revisions",
  priorEpisodes: "Prior episodes",
  humanSaid: "What the human said",
  humanMeant: "What the human meant",
};

// Decision D6: each message reads as a clinician noting an omission on a
// chart, not as an application correcting a user.
const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

// Decision D5: the string shape is validated before conversion. Number("") is
// 0, so coercion would record an unanswered field as zero occurrences — the
// exact imprecision these two fields exist to prevent.
const wholeNumberText = (message: string) =>
  z
    .string({ error: message })
    .trim()
    .regex(/^(0|[1-9][0-9]*)$/, message)
    .transform(Number);

export const intakeSchema = z.object({
  complaint: requiredText("A presenting complaint is required."),
  duration: z.enum(durationOptions, {
    error: "Duration must be recorded as one of the listed intervals.",
  }),
  requirementRevisions: wholeNumberText(
    "Requirement revisions must be recorded as a whole number of occurrences, including zero.",
  ),
  priorEpisodes: wholeNumberText(
    "Prior episodes must be recorded as a whole number of occurrences, including zero.",
  ),
  humanSaid: requiredText("A record of what the human said is required."),
  humanMeant: requiredText("A record of what the human meant is required."),
});

export type Intake = z.infer<typeof intakeSchema>;

// Decision D3: the first message per field. Zod reports an array per field and
// six fields do not need that machinery; Phase 11's second rule per field is
// where this is revisited.
export function firstErrorPerField(
  error: z.ZodError<unknown>,
): Partial<Record<IntakeField, string>> {
  const errors: Partial<Record<IntakeField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as IntakeField;
    if (field !== undefined && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

// The blank form. It lives here rather than beside the action because a
// "use server" module may only export async functions — exporting a plain
// object from it compiles and then arrives as undefined at the client.
export const emptyIntakeValues = Object.fromEntries(
  intakeFields.map((field) => [field, ""]),
) as Record<IntakeField, string>;
