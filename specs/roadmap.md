# Roadmap

Very small phases. Each one is independently shippable, leaves the repo green,
and is reviewable in a single sitting. If a phase starts to sprawl, split it
rather than finishing it.

Phase 1 is deliberately a **thin end-to-end slice**: one ugly path through
every layer, provable from the outside, before anything is built out.

Each phase below states its goal, its done-when condition, and what it must
not touch. "Out" items are not deferred politely — they are forbidden in that
phase.

---

## Phase 0 — Scaffold

**Goal:** A Next.js app boots and the toolchain is green.

- Replace the `tsc` hello-world with the Next.js App Router scaffold.
- TypeScript `strict: true`, ESLint, Prettier, Tailwind, Vitest.
- `/` renders a minimal clinic home page: name, services line, and a short
  facts list (hours, new-patient status, referral). Static copy, no links.
- `.gitignore` gains `/.next` and `/dist`.

**Done when:** `npm run dev` serves `/`, and `build`, `lint`, and `test` all
pass clean.
**Out:** any clinic _behaviour_ — no form, no database, no state. No
navigation, no entry points, no notice board, and no links at all, since no
other route exists yet. No styling beyond Tailwind's defaults.

Amended 2026-10-09: this phase originally rendered a single placeholder line
and listed all clinic content as out. A holding page told a visitor nothing
and cost the same number of lines as a home page, so the copy was brought
forward while the behaviour stayed out. See
[2026-10-09-phase-0-scaffold/requirements.md](./2026-10-09-phase-0-scaffold/requirements.md)
decision D7.

---

## Phase 1 — Thinnest end-to-end slice

**Goal:** A complaint can be submitted and comes back as a case number. One
path, all layers, nothing extra.

- One table: `cases` (`id`, `complaint`, `created_at`).
- libSQL + Drizzle wired, one migration, local `.db` file.
- `/intake` — a form with one `<textarea>` and a submit button.
- A Server Action validates with Zod and inserts one row.
- Redirects to `/cases/[id]`, which renders the stored complaint and its case
  number.

**Done when:** a Playwright spec submits the form and asserts the case number
appears on the resulting page.
**Out:** styling, diagnosis codes, validation beyond non-empty, every other
route, anonymisation, rate limiting. Ugly is correct here.

---

## Phase 2 — The real intake form

**Goal:** Intake collects what a clinic would actually ask for.

- Fields: presenting complaint, duration, frequency of requirement changes,
  prior episodes, what the human said, what the human meant.
- Zod schema per field with clinically-worded validation messages.
- Server-side errors render inline, form state survives a failed submit.

**Done when:** each field round-trips to the database and every validation
branch has a unit test.
**Out:** visual design, diagnosis logic.

---

## Phase 3 — The case file as a chart note

**Goal:** `/cases/[id]` reads as a genuine clinical document.

- Chart-note layout: header block, presenting complaint, history, assessment,
  plan, follow-up interval.
- Deadpan clinical copy throughout, per [mission.md](./mission.md).
- Derived fields (chronicity, episode count) computed in `src/domain/` as
  pure functions.

**Done when:** a stranger reading one case file gets the premise with no
other context.
**Out:** diagnosis codes, print stylesheet.

---

## Phase 4 — Diagnosis coding

**Goal:** Every case is assigned a code from a fictional coding system.

- A static, in-repo code table — invented scheme, visibly not ICD or DSM.
  Roughly 20 codes.
- Pure rule-based assignment from intake answers. No LLM.
- The code and its official description appear on the case file.

**Done when:** the assignment function is unit-tested across every code, and
the fictionality of the scheme is unmistakable on the page.
**Out:** multiple or differential diagnoses, severity scoring.

---

## Phase 5 — The waiting room

**Goal:** `/waiting-room` lists recent cases.

- Anonymised: case number, code, truncated complaint, time waiting.
- Newest first, paginated.
- Links through to each case file.

**Done when:** submitting a new case makes it appear at the top of the list.
**Out:** search, filtering, sorting controls.

---

## Phase 6 — Patient profiles

**Goal:** `/patients` and `/patients/[slug]` — authored, recurring patients.

- MDX in `src/content/patients/`, typed frontmatter.
- 4–6 patients to start, each with a chart history.

**Done when:** adding an MDX file publishes a patient with no code change.
**Out:** linking patients to submitted cases.

---

## Phase 7 — Group session transcripts

**Goal:** `/transcripts` and `/transcripts/[slug]`.

- MDX transcripts of group sessions, cast drawn from Phase 6 patients.
- Transcript layout: speaker labels, timestamps, clinician annotations.
- 2–3 transcripts to start.

**Done when:** transcripts render in the house layout and cross-link to the
patient profiles of everyone present.
**Out:** audio, any interactivity.

---

## Phase 8 — Discharge summaries

**Goal:** A case can be closed and produces a printable summary.

- `cases` gains a status; a case can move to discharged.
- `/cases/[id]/discharge` renders a discharge summary.
- Print stylesheet — it should look right on paper.

**Done when:** a discharge summary prints to one clean page with no browser
chrome.
**Out:** email, PDF generation, sharing.

---

## Phase 9 — Landing page

**Goal:** `/` sells the premise in one screen.

- Clinic identity: name, hours, "accepting new patients", notice board.
- Entry points to intake, waiting room, patients, transcripts.

Phase 0 left a minimal identity block at `/` with no links. This phase
**replaces** that page rather than decorating it — the notice board and the
entry points are the work here, and by now every route they point at exists.

**Done when:** the premise lands with no explanation, per success criterion 1
in [mission.md](./mission.md).
**Out:** marketing copy that explains the joke.

---

## Phase 10 — Design pass

**Goal:** The whole site reads as clinic paperwork.

- Typography, density, rules and tables; form controls that feel institutional.
- Consistent print stylesheet across case files, summaries, and transcripts.
- Accessibility: contrast, focus states, labelled fields, keyboard paths.

**Done when:** every route shares one visual system and passes an axe audit.
**Out:** animation, illustration.

---

## Phase 11 — Intake hardening

**Goal:** Public intake survives contact with the public.

- Rate limiting per IP.
- Length caps, a profanity and abuse filter, a moderation queue flag.
- Cases stay unlisted from the waiting room until cleared.

**Done when:** abuse-path tests pass and nothing unmoderated reaches a public
route.
**Out:** an admin UI; moderate via direct database access for now.

---

## Phase 12 — Production

**Goal:** It is live.

- Turso production database, migrations run in CI.
- Vercel deploy, environment variables, custom domain.
- Error tracking and basic analytics.

**Done when:** the Phase 1 Playwright spec passes against the production URL.
**Out:** scaling work nobody has asked for yet.

---

## Checkpoint

Revisit [tech-stack.md](./tech-stack.md) after Phase 8. If the database still
holds a single table by then, Astro was the better call and the migration is
worth pricing while the project is still small.
