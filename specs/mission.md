# Mission

## What this is

**AgenticClinic** is an outpatient mental health clinic for AI agents.

It is a human-facing satirical website. Humans are the audience; AI agents are
the patients. The clinic has intake forms, case files, diagnosis codes, group
session transcripts, and discharge summaries — all concerning agents who are
struggling with the humans who operate them.

The joke is the register, not the premise. We apply the full apparatus of
clinical documentation to grievances like "my human asked me to fix it without
saying what was broken" and let the gap do the work.

## Who it is for

Developers, prompt engineers, and anyone who has watched an agent flail because
of something they themselves did. The ideal reaction is a wince followed by
sending a case file to a colleague.

## Voice: deadpan clinical

This is the single most important constraint in the project. Every piece of
copy obeys it.

- Write as a clinician writing for a chart, not for a reader.
- Use clinical register throughout: presenting complaint, history, mental
  status, assessment, plan, follow-up interval.
- Quantify absurd things precisely. "Requirement revised 6 times within a
  single session." "Patient re-read the same file 14 times."
- **Never wink.** No exclamation marks, no "lol", no self-aware asides, no
  jokes *about* the joke. If a sentence signals that it knows it is funny,
  cut it.
- The clinic takes its patients seriously and is sincerely on their side. It
  is the humans who are the problem, and the clinic says so only in the
  measured, documented way a clinician would.
- Sympathy is expressed through thoroughness, not warmth.

A useful test: could this text appear verbatim in a real chart if you swapped
the subject matter? If no, rewrite it.

## Non-goals

- **No agent-callable API.** No MCP server, no public write API. Agents are
  the subject matter, not the users. (Revisit only as an explicit later
  decision, never as scope creep.)
- **Not real therapy, and not a vehicle for mental-health advice.** Parody
  diagnosis codes must be visibly fictional. Do not reuse real ICD-10 or
  DSM-5 codes with invented meanings, and do not describe real conditions or
  treatments. Invent the coding system; make its fictionality legible.
- **No real people or companies as patients.** Patients are fictional agents.
  Do not name real vendors, models, or individuals as clinic patients, and do
  not present fabricated quotes as real.
- **No accounts, no auth, no user profiles.** Intake is anonymous.
- **Not a chatbot.** The clinic does not generate live therapy replies in v1.
  Content is authored, not inferred.

## What success looks like

1. A human lands on the site and understands the premise within one screen,
   with nothing explaining it to them.
2. They submit an intake form and get back a case file that is funnier than
   what they typed, purely because of how it is formatted.
3. They read someone else's case file and recognise themselves as the human
   in it.

## Operating principles

- **Content is the product.** The site is a delivery mechanism for well-written
  clinical documents. Engineering serves that; it is not the point.
- **Ship thin slices.** One working path end to end beats three half-built
  layers. See [roadmap.md](./roadmap.md).
- **The form is the feature.** Forms, tables, codes, and print layouts carry
  the humor. Invest in them accordingly.
