// Phase 7. The frontmatter field builders both content collections use,
// moved out of src/domain/patient.ts for the reason decision D3 moves the slug
// rule: there are two collections now, and a transcript schema importing a
// patient schema to learn how a date is written would be the wrong shape.
//
// Decision D3 as written covers the slug rule only. Extending the move to
// these is recorded as a divergence in this phase's validation, because the
// alternative was a second copy of a date validator — which is the second
// source of truth the move exists to prevent.
//
// Nothing in this module reads the clock, the filesystem or the database.

import { z } from "zod";

const datePattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

// A shaped date and a real date are different questions. 2026-13-45 passes the
// pattern and is not a day, and a record dated to a month that does not exist
// is the kind of error a schema is for. No clock is read: the components are
// compared against what UTC made of them.
export function isRealDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

export const clinicalDate = (field: string) =>
  z
    .string({ error: `${field} must be recorded as YYYY-MM-DD.` })
    .trim()
    .regex(datePattern, `${field} must be recorded as YYYY-MM-DD.`)
    .refine(isRealDate, `${field} must be a date that exists.`);

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
