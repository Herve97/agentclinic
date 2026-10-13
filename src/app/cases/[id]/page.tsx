import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { cases } from "@/db/schema";
import {
  assessmentLines,
  chronicity,
  chronicityLabels,
  durationSentence,
  episodeHistory,
  episodeHistoryLabels,
  episodeSentence,
  followUpInterval,
  notRecorded,
  planLines,
  revisionBurden,
  revisionSentence,
} from "@/domain/case-note";
import { assignDiagnosis, indexCitation } from "@/domain/diagnosis";

// Decision D7: the stored value is UTC, "YYYY-MM-DD HH:MM:SS". The date part is
// shown and the whole timestamp goes in the attribute. No locale formatting:
// the server's locale and the visitor's need not agree, and Phase 0 spent a
// phase ruling out exactly that class of hydration mismatch.
function IntakeDate({ createdAt }: { createdAt: string }) {
  const [date, time] = createdAt.split(" ");

  return <time dateTime={time ? `${date}T${time}Z` : date}>{date}</time>;
}

// Decision D1: the said/meant pair is reported speech under history, with no
// heading framing it. Decision D5: a missing value says so.
function Reported({ label, value }: { label: string; value: string | null }) {
  return (
    <p className="mt-2">
      {`${label}: `}
      {value === null ? (
        notRecorded
      ) : (
        <q className="whitespace-pre-wrap">{value}</q>
      )}
    </p>
  );
}

export default async function CasePage({ params }: PageProps<"/cases/[id]">) {
  const { id } = await params;

  // Phase 1's decision D6: a non-numeric, fractional, or negative id is a
  // client error, not a server error. Number() alone would coerce "1.5" and
  // " 1 ", so the shape is checked before the lookup.
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

  // Decision D2: four pure functions over the stored row, each total, so a row
  // written before the Phase 2 migration renders a chart note with gaps rather
  // than an error page.
  const course = chronicity(record.duration);
  const episodes = episodeHistory(record.priorEpisodes);
  const burden = revisionBurden(record.requirementRevisions);
  const diagnosis = assignDiagnosis(course, episodes, burden);

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      {/* Decision D1, as amended: the letterhead and the patient class are the
          two constant lines that let the note carry the premise on its own.
          Without them the document is a clinical record about an unnamed
          patient and an unnamed clinic. */}
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{`Case ${record.id}`}</h1>

      <dl className="mt-6 text-sm">
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Date of intake</dt>
          <dd>
            <IntakeDate createdAt={record.createdAt} />
          </dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Patient class</dt>
          <dd>Autonomous agent. Self-presenting, no referral.</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Chronicity</dt>
          <dd>{chronicityLabels[course]}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Episode history</dt>
          <dd>{episodeHistoryLabels[episodes]}</dd>
        </div>
      </dl>

      <h2 className="mt-10 text-xl font-semibold">Presenting complaint</h2>
      <p className="mt-2 whitespace-pre-wrap">{record.complaint}</p>

      <h2 className="mt-8 text-xl font-semibold">History</h2>
      <p className="mt-2">{durationSentence(record.duration)}</p>
      <p className="mt-2">
        {revisionSentence(record.requirementRevisions, record.duration)}
      </p>
      <p className="mt-2">{episodeSentence(record.priorEpisodes)}</p>
      <Reported
        label="Operator statement as reported"
        value={record.humanSaid}
      />
      <Reported
        label="Statement as received by the patient"
        value={record.humanMeant}
      />

      <h2 className="mt-8 text-xl font-semibold">Assessment</h2>
      <p className="mt-2">{assessmentLines[course][episodes]}</p>

      {/* Decision D7: the assessment reasons, the diagnosis names, the plan
          follows from the name. The code and its rubric come first because they
          are the line a reader quotes. */}
      <h2 className="mt-8 text-xl font-semibold">Diagnosis</h2>
      <dl className="mt-2">
        <div className="flex gap-4">
          <dt className="w-40 shrink-0">Code</dt>
          <dd>{diagnosis.code}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Rubric</dt>
          <dd>{diagnosis.rubric}</dd>
        </div>
      </dl>
      <p className="mt-2">{diagnosis.description}</p>
      <p className="mt-2 text-sm">{indexCitation}</p>

      <h2 className="mt-8 text-xl font-semibold">Plan</h2>
      <p className="mt-2">{planLines[burden]}</p>

      <h2 className="mt-8 text-xl font-semibold">Follow-up</h2>
      <p className="mt-2">{followUpInterval(course, episodes)}</p>
    </main>
  );
}
