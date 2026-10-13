import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { cases, type CaseRow } from "@/db/schema";
import { intakeFieldLabels, intakeFields } from "@/domain/case";

// Decision D2: reads can return null where a row predates the Phase 2
// migration. A legitimate zero is not a missing value, so the check is against
// null rather than falsiness.
function recorded(value: CaseRow[keyof CaseRow]): string {
  return value === null ? "Not recorded." : String(value);
}

export default async function CasePage({ params }: PageProps<"/cases/[id]">) {
  const { id } = await params;

  // Decision D6: a non-numeric, fractional, or negative id is a client error,
  // not a server error. Number() alone would coerce "1.5" and " 1 ", so the
  // shape is checked before the lookup.
  if (!/^[1-9][0-9]*$/.test(id)) {
    notFound();
  }

  const [record] = await db
    .select()
    .from(cases)
    .where(eq(cases.id, Number(id)))
    .limit(1);

  if (!record) {
    notFound();
  }

  // Decision D8: labelled term/description pairs and nothing else. The chart
  // note — header block, history, assessment, plan, follow-up interval — is
  // Phase 3.
  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{`Case ${record.id}`}</h1>
      <dl className="mt-8">
        {intakeFields.map((field) => (
          <div key={field} className="mt-4">
            <dt>{intakeFieldLabels[field]}</dt>
            <dd className="whitespace-pre-wrap">{recorded(record[field])}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
