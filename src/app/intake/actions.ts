"use server";

import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { cases } from "@/db/schema";
import { intakeSchema } from "@/domain/case";

export type IntakeState = { error: string | null };

export async function submitIntake(
  _previous: IntakeState,
  formData: FormData,
): Promise<IntakeState> {
  const parsed = intakeSchema.safeParse({
    complaint: formData.get("complaint"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [inserted] = await db
    .insert(cases)
    .values({ complaint: parsed.data.complaint })
    .returning({ id: cases.id });

  // Decision D8: redirect() signals control flow by throwing, so it must stay
  // outside any try/catch — a catch here would silently swallow the success
  // path and leave the user on the form after a successful insert.
  redirect(`/cases/${inserted.id}`);
}
