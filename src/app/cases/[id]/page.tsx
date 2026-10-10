import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { cases } from "@/db/schema";

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

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{`Case ${record.id}`}</h1>
      <p className="mt-4 whitespace-pre-wrap">{record.complaint}</p>
    </main>
  );
}
