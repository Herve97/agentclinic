import Link from "next/link";
import { notFound } from "next/navigation";

import { listTranscripts, readTranscript } from "@/content/transcripts";

// Decision D10: the slugs come from the content directory, so adding a
// transcript publishes a page without a code change and both routes
// prerender.
export async function generateStaticParams() {
  const sessions = await listTranscripts();

  return sessions.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/transcripts/[slug]">) {
  const { slug } = await params;
  const session = await readTranscript(slug);

  if (!session) {
    return { title: "Session not found — AgenticClinic" };
  }

  return {
    title: `${session.frontmatter.title} — AgenticClinic`,
    description: session.frontmatter.summary,
  };
}

export default async function TranscriptPage({
  params,
}: PageProps<"/transcripts/[slug]">) {
  const { slug } = await params;
  const session = await readTranscript(slug);

  // Decision D8 of Phase 6, as /patients/[slug] and /cases/[id] have it: a
  // path segment names a resource, and a resource that does not exist is
  // absent.
  if (!session) {
    notFound();
  }

  const { frontmatter, cast, body } = session;

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {frontmatter.title}
      </h1>

      <dl className="mt-6 text-sm">
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Date of session</dt>
          <dd>
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
          </dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Facilitator</dt>
          <dd>{frontmatter.clinician}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Setting</dt>
          <dd>{frontmatter.setting}</dd>
        </div>
        {/* Decision D2, and the roadmap's cross-link condition: everyone
            present links to their chart. Every slug here resolved against the
            patient collection before this page was rendered, so none of these
            links can point at nothing. */}
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Present</dt>
          <dd>
            {cast.map(({ slug: patient, name }, at) => (
              <span key={patient}>
                {at > 0 ? ", " : null}
                <Link href={`/patients/${patient}`}>{name}</Link>
              </span>
            ))}
          </dd>
        </div>
      </dl>

      {/* The authored session. Decision D11 of Phase 6 gives it the same
          utilities the case note and the chart use, and decision D6 adds the
          two elements a transcript needs. */}
      {body}
    </main>
  );
}
