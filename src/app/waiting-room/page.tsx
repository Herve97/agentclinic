import { desc, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { db } from "@/db/client";
import { cases } from "@/db/schema";
import { chronicity, episodeHistory, revisionBurden } from "@/domain/case-note";
import { assignDiagnosis } from "@/domain/diagnosis";
import {
  pageSize,
  paginate,
  truncateComplaint,
  waitedFor,
} from "@/domain/waiting-room";

export const metadata: Metadata = {
  title: "Waiting room — AgenticClinic",
  description: "Cases awaiting review, most recent first.",
};

export default async function WaitingRoomPage({
  searchParams,
}: PageProps<"/waiting-room">) {
  const { page: requested } = await searchParams;

  const [counted] = await db
    .select({ total: sql<number>`count(*)` })
    .from(cases);
  const { page, pageCount, offset } = paginate({
    total: Number(counted.total),
    requested,
  });

  // Decision D4: only the columns the list shows, plus the three the code is
  // derived from. The reported-speech fields are not read at all.
  const rows = await db
    .select({
      id: cases.id,
      complaint: cases.complaint,
      duration: cases.duration,
      requirementRevisions: cases.requirementRevisions,
      priorEpisodes: cases.priorEpisodes,
      createdAt: cases.createdAt,
    })
    .from(cases)
    // Decision D1: id, not created_at. current_timestamp has one-second
    // granularity, and "appears at the top" has to hold for two cases
    // submitted in the same second.
    .orderBy(desc(cases.id))
    .limit(pageSize)
    .offset(offset);

  // One instant for the whole render, so no two rows are measured against
  // different clocks (decision D3).
  const now = new Date();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Waiting room
      </h1>
      <p className="mt-4">Cases awaiting review. Most recent first.</p>

      {rows.length === 0 ? (
        <p className="mt-8">No cases are awaiting review.</p>
      ) : (
        <table className="mt-8 w-full text-left align-top">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Case
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Code
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Presenting complaint
              </th>
              <th scope="col" className="py-2 align-bottom">
                Time waiting
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const diagnosis = assignDiagnosis(
                chronicity(row.duration),
                episodeHistory(row.priorEpisodes),
                revisionBurden(row.requirementRevisions),
              );

              return (
                <tr key={row.id} className="border-t align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <Link href={`/cases/${row.id}`}>{`Case ${row.id}`}</Link>
                  </td>
                  {/* Decision D7: the code is institutionally correct and
                      completely opaque; the rubric is the part that reads
                      without context. Both, one cell, four columns. */}
                  <td className="py-2 pr-4">
                    {diagnosis.code}
                    <span className="block text-sm">{diagnosis.rubric}</span>
                  </td>
                  <td className="py-2 pr-4">
                    {truncateComplaint(row.complaint)}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {waitedFor(row.createdAt, now)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="mt-8 text-sm">{`Page ${page} of ${pageCount}.`}</p>
      <div className="mt-2 flex gap-4">
        {/* A link that would point outside the range is omitted rather than
            rendered disabled. There is nothing to click that does nothing. */}
        {page > 1 ? (
          <Link href={`/waiting-room?page=${page - 1}`}>Previous page</Link>
        ) : null}
        {page < pageCount ? (
          <Link href={`/waiting-room?page=${page + 1}`}>Next page</Link>
        ) : null}
      </div>
    </main>
  );
}
