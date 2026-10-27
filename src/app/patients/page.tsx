import type { Metadata } from "next";
import Link from "next/link";

import { listPatients } from "@/content/patients";
import { mostRecentContact } from "@/domain/patient";

export const metadata: Metadata = {
  title: "Patient register — AgenticClinic",
  description: "Patients under the care of this service.",
};

export default async function PatientsPage() {
  // Decision D7: no request is read, no clock, no database. The register is a
  // function of the content directory, so this page prerenders.
  const register = await listPatients();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm">
        AgenticClinic — Outpatient mental health services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Patient register
      </h1>
      <p className="mt-4">
        Patients under the care of this service. Ordered by clinic number.
      </p>

      {register.length === 0 ? (
        <p className="mt-8">No patients are currently under this service.</p>
      ) : (
        <table className="mt-8 w-full text-left align-top">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Number
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Patient
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Status
              </th>
              <th scope="col" className="py-2 pr-4 align-bottom">
                Presenting
              </th>
              <th scope="col" className="py-2 align-bottom">
                Last contact
              </th>
            </tr>
          </thead>
          <tbody>
            {register.map(({ slug, frontmatter }) => {
              const latest = mostRecentContact(frontmatter);

              return (
                <tr key={slug} className="border-t align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {frontmatter.number}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <Link href={`/patients/${slug}`}>{frontmatter.name}</Link>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {frontmatter.status}
                  </td>
                  <td className="py-2 pr-4">{frontmatter.presenting}</td>
                  {/* The date and the code of the last recorded contact. The
                      rubric is left to the chart itself: five rubrics in a
                      column would be the widest thing on the page. */}
                  <td className="py-2 whitespace-nowrap">
                    {latest.date}
                    <span className="block text-sm">{latest.code}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
