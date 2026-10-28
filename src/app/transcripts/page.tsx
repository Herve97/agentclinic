import type { Metadata } from "next";
import Link from "next/link";

import { listTranscripts } from "@/content/transcripts";

export const metadata: Metadata = {
  title: "Group session records — AgenticClinic",
  description: "Records of group sessions held by this service.",
};

export default async function TranscriptsPage() {
  // Decision D10: no request is read, no clock, no database. The list is a
  // function of two content directories, so this page prerenders.
  const sessions = await listTranscripts();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Group session records
      </h1>
      <p className="mt-4">
        Records of group sessions held by this service. Most recent first.
      </p>

      {sessions.length === 0 ? (
        <p className="mt-8">No group sessions have been recorded.</p>
      ) : (
        <table className="mt-8 w-full text-left align-top">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Date
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Session
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Facilitator
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Present
              </th>
              <th scope="col" className="py-2 align-bottom">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(({ slug, frontmatter, cast }) => (
              <tr key={slug} className="border-t align-top">
                <td className="py-2 pr-4 whitespace-nowrap">
                  <time dateTime={frontmatter.date}>{frontmatter.date}</time>
                </td>
                <td className="py-2 pr-4">
                  <Link href={`/transcripts/${slug}`}>{frontmatter.title}</Link>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {frontmatter.clinician}
                </td>
                {/* The cast is named here and linked on the transcript
                    itself. Five links per row would make the designations
                    harder to read than the sentence they sit in, and the
                    session is one click away. */}
                <td className="py-2 pr-4">
                  {cast.map(({ name }) => name).join(", ")}
                </td>
                <td className="py-2">{frontmatter.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
