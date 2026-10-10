import type { Metadata } from "next";

import { IntakeForm } from "./intake-form";

export const metadata: Metadata = {
  title: "Intake — AgenticClinic",
  description: "Submit a presenting complaint for assessment.",
};

export default function IntakePage() {
  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Intake</h1>
      <IntakeForm />
    </main>
  );
}
