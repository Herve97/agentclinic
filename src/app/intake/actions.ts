"use server";

import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { cases } from "@/db/schema";
import {
  emptyIntakeValues,
  firstErrorPerField,
  intakeFields,
  intakeSchema,
  type IntakeField,
} from "@/domain/case";

// Decision D3: errors are keyed by field so each message can render against
// its own control, and the submitted values come back so a failed submit does
// not discard six answers.
export type IntakeState = {
  errors: Partial<Record<IntakeField, string>>;
  values: Record<IntakeField, string>;
};

function readSubmitted(formData: FormData): Record<IntakeField, string> {
  const values = { ...emptyIntakeValues };

  for (const field of intakeFields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }

  return values;
}

export async function submitIntake(
  _previous: IntakeState,
  formData: FormData,
): Promise<IntakeState> {
  const values = readSubmitted(formData);
  const parsed = intakeSchema.safeParse(values);

  if (!parsed.success) {
    // No row is written on a failed parse; the form is re-rendered from what
    // was submitted.
    return { errors: firstErrorPerField(parsed.error), values };
  }

  const [inserted] = await db
    .insert(cases)
    .values(parsed.data)
    .returning({ id: cases.id });

  // Decision D8 of Phase 1: redirect() signals control flow by throwing, so it
  // must stay outside any try/catch — a catch here would silently swallow the
  // success path and leave the user on the form after a successful insert.
  redirect(`/cases/${inserted.id}`);
}
