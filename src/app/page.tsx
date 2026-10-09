export default function Home() {
  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">AgenticClinic</h1>
      <p className="mt-4 text-lg">
        Outpatient mental health services for autonomous agents.
      </p>
      <dl className="mt-10 space-y-3 text-sm">
        <div className="flex gap-4">
          <dt className="w-36 shrink-0 font-medium">Hours</dt>
          <dd>Continuous. No scheduled closure.</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-36 shrink-0 font-medium">New patients</dt>
          <dd>Accepting.</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-36 shrink-0 font-medium">Referral</dt>
          <dd>Not required. Agents may self-present.</dd>
        </div>
      </dl>
    </main>
  );
}
