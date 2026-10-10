# Phase 1 — Thinnest end-to-end slice: Requirements

**Branch:** `phase-1-slice`
**Roadmap phase:** [Phase 1 — Thinnest end-to-end slice](../roadmap.md)
**Date:** 2026-10-10

---

## Goal

A complaint can be submitted and comes back as a case number. One path, all
layers, nothing extra.

This is the first phase with behaviour. It exists to prove that every layer
named in [tech-stack.md](../tech-stack.md) is wired together and that a write
survives a round trip — database, migration, schema, Server Action,
validation, redirect, dynamic route. Every later phase builds out one of those
layers; none of them should have to discover that the wiring is broken.

**Ugly is correct here.** The roadmap says so explicitly. A reviewer who finds
this phase visually embarrassing has read it correctly.

---

## Scope

### In

1. **One table: `cases`** — `id`, `complaint`, `created_at`. Nothing else.
2. **libSQL + Drizzle**, with one generated migration and a local database
   file.
3. **`/intake`** — a form with one `<textarea>` and a submit button.
4. **One Server Action** that validates with Zod and inserts one row.
5. **`/cases/[id]`** — renders the stored complaint and its case number.
6. **One Playwright spec** that submits the form and asserts the case number
   appears on the resulting page.
7. **`src/domain/` and `src/db/`** created, because this phase finally has
   something to put in them.
8. **Exact pinned versions** for every package added, resolved at install
   time.

### Out — forbidden in this phase

- **Styling.** No Tailwind utilities beyond what makes the form usable, and no
  design decisions. Phase 10 owns the visual system. If a class exists to make
  something look considered rather than to make it function, delete it.
- **Diagnosis codes.** Phase 4.
- **Validation beyond non-empty.** No length caps, no profanity filter, no
  rate limiting. Phase 2 owns real field validation; Phase 11 owns abuse.
- **Every other route.** No `/waiting-room`, no `/patients`, no
  `/transcripts`, no case index. `/cases/[id]` is reachable only by its own
  URL or by the redirect.
- **Anonymisation.** Phase 11.
- **Links from `/`.** The home page stays as Phase 0 left it. Entry points are
  Phase 9's job, and adding one here would quietly start Phase 9 — see
  decision D9.
- **A chart-note layout for `/cases/[id]`.** Phase 3 owns that. This phase
  renders the complaint and the case number as plain text.
- **CI.** Phase 12.
- **Anything from the rejected list** in [tech-stack.md](../tech-stack.md).

---

## Decisions

### D1 — The database file is `local.db`, and no `.env` file is required

The libSQL client reads `DATABASE_URL` and falls back to `file:local.db` when
it is unset. `local.db` and its libSQL sidecar files are gitignored.

**Why:** [mission.md](../mission.md) makes booth demos first-class and states
that anything needing a credential or a manual step before `/` renders is a
bug. A required `.env` file would break that on a fresh clone. A default that
works with no configuration keeps `git clone && npm install && npm run dev`
true, and Phase 12 can set `DATABASE_URL` to a Turso URL without any code
change — which is the reason the tech stack chose libSQL over plain SQLite.

**Cost accepted:** a developer who wants a different database has to set an
environment variable rather than edit a file. That is the correct direction.

### D2 — Migrations run automatically before `dev`, `build`, and the e2e spec

A `predev` script runs the migrator, as do the build and e2e paths. The
developer never runs a migration by hand to get a working app.

**Why:** the mission's "clone, install, one command, running" constraint is
about the whole app, not just `/`. `/` is static and renders with no database
at all, so a hand-run migration would not technically violate the letter of
that rule — but `/intake` would 500 on a fresh clone until someone read the
README, and a booth demo that dies on the second click is worse than one that
dies on the first. Automatic migration costs one line and removes the entire
class of "did you run the migration?" failures.

**Cost accepted:** `npm run dev` does slightly more than start a server, and
the migrator runs on every start even when there is nothing to apply. Drizzle's
migrator is a no-op against an up-to-date database, so the cost is
milliseconds. A `db:migrate` script still exists for running it alone.

### D3 — `cases.id` is an integer, and the case number is that integer

`id` is `integer primary key autoincrement`. `/cases/[id]` renders it as the
case number with no formatting.

**Why:** the roadmap asks for a case number and says ugly is correct.
An integer is the least machinery that satisfies it, and SQLite gives it for
free. A formatted number like `AC-2026-0001` is a presentation concern that
belongs with the chart-note layout in Phase 3, and a random or ULID id is a
Phase 11 concern — see the note below.

**Known consequence, deliberately accepted and deferred:** sequential ids are
enumerable. Anyone can read case 1, 2, 3 by editing the URL. That is a real
problem for a site taking public submissions, and it is **Phase 11's**, whose
goal is that nothing unmoderated reaches a public route. Phase 11 will need to
either switch to unguessable ids or gate `/cases/[id]` on a cleared flag.
Recording it here so that Phase 11 inherits a known decision rather than
discovering a hole.

### D4 — One Zod schema in `src/domain/`, used by the action

`src/domain/case.ts` exports the schema and the inferred types. The Server
Action imports it; the database layer imports the table from `src/db/`.

**Why:** [tech-stack.md](../tech-stack.md) states one Zod schema per entity,
exported from `src/domain/`, used by both the form and the database layer, and
that pure logic stays out of components so it can be unit-tested without a
renderer. Phase 2 adds six more fields to this schema and Phase 2's done-when
condition is a unit test per validation branch. Putting the schema in the
right place now means Phase 2 adds fields rather than moving files.

### D5 — Validation is non-empty after trimming, and nothing else

The schema trims the complaint and requires at least one character. No maximum
length, no content rules.

**Why:** the roadmap's Out list says "validation beyond non-empty" explicitly.
Trimming is included because `"   "` is empty in every sense a clinic cares
about, and treating it as valid would store a blank row that `/cases/[id]`
renders as nothing.

**Deliberately absent:** a maximum length. An unbounded `<textarea>` is a real
denial-of-service surface, and it is named in Phase 11 ("length caps"). This
phase runs on a local database on a developer's machine, so the exposure is
zero until Phase 12 deploys. Flagged rather than fixed, because fixing it here
means writing Phase 11's length-cap tests here.

### D6 — A bad id on `/cases/[id]` returns 404 via `notFound()`

A non-numeric id, a negative id, and an id with no row all call `notFound()`.

**Why:** the alternatives are worse. Throwing gives a 500 for what is a
client error. Rendering an empty page gives a 200 for a case that does not
exist, which is a lie the rest of the site would have to work around. 404 is
what the status code is for, and Next's built-in not-found page is adequate
until Phase 10.

### D7 — Playwright is installed, but `verify` does not run it

`npm run test:e2e` runs the Playwright spec. `npm run verify` keeps its Phase 0
meaning — lint, build, unit tests — and a new `verify:all` chains `verify` and
`test:e2e`.

**Why:** `npx playwright install` downloads browser binaries, which is a
several-hundred-megabyte network fetch. Folding that into `verify` would mean
the one command every phase must leave green cannot run on a fresh clone
without a large download, which undercuts the Phase 0 cold-clone guarantee.
Keeping them separate means `verify` stays fast and offline-capable, while the
roadmap's done-when condition is still a real command.

**Obligation:** the README documents the one-time `playwright install` step and
says plainly that it is only needed for the e2e spec, not for running the app.

### D8 — The Server Action redirects on success and re-renders on failure

On a valid submission the action inserts and calls `redirect()`. On an invalid
one it returns an error that `/intake` renders inline.

**Why:** `redirect()` works by throwing a control-flow exception, so it must be
called outside any `try`/`catch` that would swallow it — a mistake worth
recording because it is invisible until it breaks. Returning a value for the
failure path rather than throwing is what lets Phase 2 build "form state
survives a failed submit" on top without restructuring the action.

### D9 — `/` is not touched, and `/intake` is reachable only by typing its URL

No link is added to the home page.

**Why:** Phase 0's decision D7 states that `/` has no links at all, and that a
change making a visitor want to click something belongs to Phase 9. Adding
"Submit an intake form" to `/` would be the single most tempting line of this
phase and it would be Phase 9 work done four phases early. The Playwright spec
navigates directly to `/intake`, which is what a test should do anyway.

**Consequence:** the app has a working write path that no visitor can find.
That is correct for a phase whose purpose is proving the wiring, and Phase 9 is
where it becomes reachable.

### D10 — Versions are pinned exactly, resolved at install time

As Phase 0's D6. Every package added here is recorded as an exact version with
no `^` or `~`, resolved with `npm view <pkg> version` at install time rather
than copied from this document.

**Why:** [tech-stack.md](../tech-stack.md) says version numbers written in
prose are not to be trusted, here or anywhere in `specs/`. Phase 0 proved the
point the hard way: `typescript` resolved to a major that the lint toolchain
refused to load, which is only discoverable by resolving and then running the
toolchain.

---

## Context

### What Phase 0 left

`npm run verify` is green, `/` is a static home page with no links, and the
toolchain is pinned. `src/db/`, `src/domain/` and `src/content/` were
deliberately **not** created empty; this phase creates the first two because it
has something to put in them. `src/content/` stays absent until Phase 6.

`next.config.ts` carries `agentRules: false` and `<body>` carries
`suppressHydrationWarning`; both are explained in Phase 0's spec and neither
should be removed here.

### Directory conventions this phase establishes

- `src/db/schema.ts` — the Drizzle table definition.
- `src/db/client.ts` — the libSQL client and Drizzle instance.
- `src/db/migrate.ts` — the migration runner invoked by the npm scripts.
- `drizzle/` — generated migration SQL, committed.
- `src/domain/case.ts` — the Zod schema and inferred types.
- `e2e/` — Playwright specs.

### Why the write path is deliberately unreachable

See D9. This phase is judged on whether the layers connect, not on whether a
visitor can find the form. Resisting the one-line link is the discipline the
phase is actually teaching.

---

## Risks and open questions

| Risk                                                                                                                            | Mitigation                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@libsql/client` ships native bindings and this is a Windows machine; native modules are the most common install failure there. | Resolve and install first, before any code is written, and confirm a trivial query runs. If the native path fails, the fallback is `better-sqlite3` behind the same Drizzle dialect — but that would be a tech-stack amendment, not a quiet substitution. |
| `drizzle-kit` and `drizzle-orm` version pairs have historically been coupled; a mismatched pair fails at generate time.         | Resolve both, generate the migration immediately, and treat a generate failure as a version problem before anything else.                                                                                                                                 |
| Next may try to prerender `/cases/[id]` at build time and hit the database.                                                     | The route has no `generateStaticParams`, so it renders on demand. Confirm the build output lists it as dynamic rather than static, and treat a static listing as a defect.                                                                                |
| `redirect()` inside a `try`/`catch` is swallowed and the success path silently does nothing.                                    | D8 records it. The action keeps `redirect()` outside any `try`.                                                                                                                                                                                           |
| Playwright's browser download is large and may fail on a constrained network.                                                   | D7 keeps it out of `verify`, so a failed download blocks only the e2e spec, not the phase's other checks.                                                                                                                                                 |
| The unit test suite now needs a database, making unit tests slow and order-dependent.                                           | Unit tests cover the Zod schema only — pure functions, no database. The database round trip is the Playwright spec's job. This is why D4 puts the schema in `src/domain/`.                                                                                |
| Sequential ids let anyone enumerate every case.                                                                                 | Accepted and deferred to Phase 11; recorded in D3 so it is inherited rather than rediscovered.                                                                                                                                                            |
| The phase grows a case index, a nicer form, or a link from `/`.                                                                 | All three are in the Out list. D9 is the hard stop on the link, and validation §6 fails the phase if a second route appears.                                                                                                                              |

**Open question for Phase 2, not this one:** whether the Server Action returns
errors as a plain object or via `useActionState`. Phase 1 has one field and one
error, so the simplest thing that works is correct; Phase 2's "form state
survives a failed submit" is what forces the answer.
