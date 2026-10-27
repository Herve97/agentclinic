import { notFound } from "next/navigation";

import { listPatients, readPatient } from "@/content/patients";
import {
  entryFor,
  indexCitation,
  type DiagnosisCode,
} from "@/domain/diagnosis";

// Decision D7: the slugs come from the content directory, so adding a chart
// publishes a page without a code change and both routes prerender.
export async function generateStaticParams() {
  const register = await listPatients();

  return register.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/patients/[slug]">) {
  const { slug } = await params;
  const patient = await readPatient(slug);

  if (!patient) {
    return { title: "Patient not found — AgenticClinic" };
  }

  return {
    title: `${patient.frontmatter.name} — AgenticClinic`,
    description: patient.frontmatter.presenting,
  };
}

export default async function PatientPage({
  params,
}: PageProps<"/patients/[slug]">) {
  const { slug } = await params;
  const patient = await readPatient(slug);

  // Decision D8, as Phase 1's decision D6 had it for /cases/[id]: a path
  // segment names a resource, and a resource that does not exist is absent.
  if (!patient) {
    notFound();
  }

  const { frontmatter, body } = patient;

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {frontmatter.name}
      </h1>

      <dl className="mt-6 text-sm">
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Clinic number</dt>
          <dd>{frontmatter.number}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Status</dt>
          <dd>{frontmatter.status}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Date of intake</dt>
          <dd>
            <time dateTime={frontmatter.intake}>{frontmatter.intake}</time>
          </dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Clinician</dt>
          <dd>{frontmatter.clinician}</dd>
        </div>
        <div className="mt-2 flex gap-4">
          <dt className="w-40 shrink-0">Presenting</dt>
          <dd>{frontmatter.presenting}</dd>
        </div>
      </dl>

      {/* Decision D5: the dated entries are data, in the order they were
          authored, each carrying the rubric from Phase 4's index rather than
          from the chart. A chart does not get to describe its own code. */}
      <h2 className="mt-10 text-xl font-semibold">Chart history</h2>
      <ol className="mt-2">
        {frontmatter.history.map((entry, index) => {
          const indexed = entryFor(entry.code as DiagnosisCode);

          return (
            <li key={`${entry.date}-${index}`} className="mt-4">
              <p>
                <time dateTime={entry.date}>{entry.date}</time>
                {` — ${indexed.code}`}
                <span className="block text-sm">{indexed.rubric}</span>
              </p>
              <p className="mt-1">{entry.note}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm">{indexCitation}</p>

      {/* The authored narrative. Decision D11 gives it the same utilities the
          case note uses and nothing else. */}
      {body}
    </main>
  );
}
