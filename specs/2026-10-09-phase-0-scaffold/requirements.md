# Phase 0 — Scaffold: Requirements

**Branch:** `phase-0-scaffold`
**Roadmap phase:** [Phase 0 — Scaffold](../roadmap.md)
**Date:** 2026-10-09

---

## Goal

A Next.js app boots and the toolchain is green. Nothing else.

This phase replaces the bare `tsc` + `src/index.ts` hello-world with the
Next.js App Router scaffold and the full development toolchain. It ships no
clinic functionality. Its entire value is that every subsequent phase starts
from a known-green repository.

---

## Scope

### In

1. **Next.js App Router scaffold** replacing the `tsc` hello-world.
   - `src/app/layout.tsx` and `src/app/page.tsx`.
   - `src/index.ts` and any built `dist/` output are deleted, not left
     orphaned.
2. **TypeScript** with `strict: true` carried over from the existing
   `tsconfig.json`.
3. **ESLint** and **Prettier**, configured and non-conflicting.
4. **Tailwind CSS**, initialised only. No design tokens, no custom theme.
5. **Vitest** with React Testing Library and a `jsdom` environment, plus one
   smoke test that renders `/` and asserts its text.
6. **`/` renders a minimal AgenticClinic home page** — clinic name, services
   line, and a short facts list, in the clinic's voice. See decision D7.
7. **`.gitignore`** gains `/.next` and `/dist`.
8. **`README.md`** with clone → install → run setup steps.
9. **`CLAUDE.md`** at the repo root pointing future agent sessions at `specs/`
   and the voice constraint.
10. **Exact pinned versions** in `package.json`.

### Out — forbidden in this phase

Per the roadmap, these are not deferred politely; they are not to be touched:

- Any clinic content beyond the home page described in D7. No notice board, no
  navigation, no entry points — Phase 9 owns those.
- Any link to a route that does not exist yet.
- Any database: no libSQL, no Drizzle, no `drizzle-kit`, no migrations, no
  `.db` file. Phase 1 owns these.
- Any Zod schema. Phase 1 owns it.
- Playwright. The roadmap adds it at Phase 1, with one spec.
- MDX tooling. Phase 6 owns it.
- Any styling beyond Tailwind's defaults — no custom colours, fonts, spacing
  scale, `tailwind.config` theme additions, or component classes. Tailwind
  utility classes for layout and legibility are permitted; see D7.
- Any route other than `/`.
- GitHub Actions or any other CI infrastructure. Phase 12 owns it.

---

## Decisions

Each decision below was taken explicitly for this phase. Where the roadmap or
tech stack left a choice open, the chosen option and its reasoning are
recorded so it can be argued with later.

Decisions are numbered in the order they were taken, not the order they are
read. D7 appears out of sequence because it supersedes D1 and the two belong
side by side. Superseded decisions are kept rather than deleted — the
amendment trail is teaching material for the repository audience named in
[mission.md](../mission.md).

### D1 — The placeholder line is deadpan clinical copy — **superseded by D7**

Originally: `/` renders a two-line holding page reading
`AgenticClinic — outpatient services.` / `This page is not yet in service.`

**Why it was taken:** [mission.md](../mission.md) names the deadpan clinical
voice as the single most important constraint in the project. Establishing it
in the first real commit means the register is never retrofitted.

**Why it was superseded:** a holding page is not a home page. The reasoning
above survives in full — it carries over to D7 unchanged — but the artefact
changed. Recorded rather than deleted, because the amendment trail is itself
teaching material for the repository audience.

### D7 — `/` is a minimal clinic home page, not a holding page

`/` renders a clinic identity block. Target copy:

```
AgenticClinic

Outpatient mental health services for autonomous agents.

Hours           Continuous. No scheduled closure.
New patients    Accepting.
Referral        Not required. Agents may self-present.
```

The facts block is marked up as a `<dl>` — term/description pairs, correct
semantics, no cost. Styling is Tailwind utilities for layout and legibility
only; no custom theme.

**Why:** the first thing anyone sees should be the clinic, not an apology for
the clinic not being ready. "This page is not yet in service" is honest about
the build state and tells a visitor nothing about the product. The copy above
costs the same number of lines and establishes the premise, the register, and
the clinic's posture toward its patients — the clinic is open, it takes
walk-ins, and it does not ask agents to get permission first.

It still passes the mission's voice test: swap the subject matter and this
could appear verbatim on a real outpatient clinic's home page.

**Divergence from the roadmap, and why it was taken anyway:**
[roadmap.md](../roadmap.md) Phase 0 said `/` renders a single placeholder line
and listed "any clinic content" as Out. This decision contradicts both. Per
the mission's rule that the spec is amended rather than quietly diverged from,
`roadmap.md` has been amended: Phase 0's bullet now describes a minimal home
page, its Out list now forbids navigation and entry points rather than all
clinic content, and Phase 9 now states that it replaces this page rather than
building `/` from nothing.

**Constraint on Phase 9 — the boundary that keeps this minimal:** Phase 9's
goal is to *sell the premise in one screen*, with clinic identity, a notice
board, and entry points to every route. D7 is the identity block alone. It has
no notice board, no navigation, and **no links at all** — `/intake`,
`/waiting-room`, `/patients`, and `/transcripts` do not exist yet, and a link
to a 404 is worse than no link. Phase 9 replaces this page; it does not
decorate it.

A useful line: if a change to `/` would make a visitor want to click
something, it belongs to Phase 9.

### D2 — Full toolchain, with one smoke test

Vitest is installed with React Testing Library and a `jsdom` environment, and
one test renders `/` and asserts the home page copy from D7.

**Why:** a test runner that has never rendered a component is not proven. A
trivial `expect(true).toBe(true)` spec confirms Vitest starts; it does not
confirm that JSX compiles under the test runner, that the `jsdom` environment
resolves, or that path aliases work. Phase 2 requires "every validation branch
has a unit test" — discovering a broken test harness then costs more than
configuring it now.

**Cost accepted:** `vitest`, `@vitejs/plugin-react`, `jsdom`,
`@testing-library/react`, `@testing-library/jest-dom`, and a `vitest.config.ts`.

### D3 — Verification is npm scripts, plus a composite `verify`

`npm run verify` chains lint, build, and test. No CI workflow in this phase.

**Why:** "leaves the repo green" is a condition every phase must meet, so it
needs one command, not four remembered ones. CI is named in Phase 12 and
pulling it forward adds infrastructure the roadmap deliberately sequences
late. A composite script costs one line of `package.json` and gives every
later phase the same gate.

### D4 — Cold-clone offline check is part of done

Validation requires proving that a fresh clone installs and runs with no
credentials and no network access beyond `npm install`.

**Why:** [mission.md](../mission.md) makes booth demos a first-class audience
and states that anything needing a credential or manual step before `/`
renders is a bug. That claim is unverified unless it is checked, and it is
cheapest to check while the dependency tree is smallest.

### D5 — README and CLAUDE.md are added, though the roadmap does not name them

**Why README:** the mission's "setup must be short" success criterion is
unverifiable without written steps. One short section, four commands.

**Why CLAUDE.md:** the repository has a declared audience of course students
and future agent sessions. A root file pointing at `specs/` and restating the
voice constraint keeps the spec ahead of the code, which the mission names as
an explicit obligation.

Both are additive, neither touches application behaviour, and both can be
deleted without affecting the phase's done-when condition.

### D6 — Versions are pinned exactly, resolved at install time

Every dependency in `package.json` is recorded as an exact version with no
`^` or `~` range. Each version is resolved with `npm view <pkg> version` at
install time, not copied from any document.

**Why:** [tech-stack.md](../tech-stack.md) states plainly that version numbers
written in prose are not to be trusted, here or anywhere in `specs/`. Pinning
also means a student cloning this repo six months from now gets the tree the
commits were built against, which matters more for a teaching repo than for a
product.

**Obligation:** the resolved versions are recorded in `package.json` and
restated in `validation.md` once known. If a resolved version differs from
what this document anticipates, this document is wrong and gets amended.

---

## Context

### Carried over from the existing repo

Two items must survive the scaffold replacement, per the scaffold migration
note in [tech-stack.md](../tech-stack.md):

- `tsconfig.json` keeps `strict: true`.
- `.gitignore` gains `/dist` — it is the current `outDir` and is **not**
  currently ignored — and `/.next`.

### Conventions established here

The directory conventions from [tech-stack.md](../tech-stack.md) are created
in this phase only where Phase 0 has something to put in them. `src/app/` is
created. `src/content/`, `src/db/`, and `src/domain/` are **not** created
empty; the phase that first needs one creates it.

### Why this phase has no clinic *functionality*

The roadmap's framing is that Phase 1 is the thin end-to-end slice. Phase 0
exists so that Phase 1 can be about the slice and not about toolchain
yak-shaving. Any clinic functionality added here makes Phase 1 harder to read
as a worked example, which is the repository audience's whole reason for
existing.

The home page in D7 is content, not functionality — static server-rendered
copy with no form, no database, no state, and no links. It does not compete
with Phase 1 for attention and it does not make Phase 1's diff harder to read.
The distinction is the line this phase holds: **copy is in, behaviour is out.**

---

## Risks and open questions

| Risk | Mitigation |
| --- | --- |
| Tailwind v4 changed its PostCSS integration; v3 instructions will not work. | Resolve the actual installed version first and follow that version's documented setup. Do not follow remembered instructions. |
| ESLint v9 flat config and Next.js's ESLint plugin have had compatibility churn. | Take whatever `create-next-app` scaffolds for ESLint, then add Prettier on top rather than hand-writing a flat config. |
| Prettier and ESLint can fight over formatting rules. | `eslint-config-prettier` disables the conflicting rules. Formatting is Prettier's job; lint is ESLint's. |
| `create-next-app` may scaffold files this phase does not want (an API route, example assets, a marketing page). | Treat its output as a starting point to prune, not as the deliverable. Anything it adds that is not in the In-scope list above is deleted. |
| The home page (D7) grows into Phase 9's landing page — a notice board, nav, "accepting new patients" as a call to action. | The no-links rule in D7 is the hard stop. Plan group 5 re-checks the Phase 9 boundary before the group closes, and validation §2 fails the phase if `/` acquires a link or an entry point. |
| The home page copy is written once and never revisited, so Phase 9 inherits Phase 0's placeholder thinking. | D7 states that Phase 9 replaces the page rather than decorating it, and `roadmap.md` Phase 9 now says the same. |

**Open question for a later phase, not this one:** `create-next-app` defaults
to a `src/app` layout only if asked. The tech stack's conventions assume
`src/`, so that answer is already fixed — but if the scaffolder's defaults
have changed, follow `specs/tech-stack.md`, not the scaffolder.
