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
6. **`/` renders a single placeholder line**, in the clinic's voice.
7. **`.gitignore`** gains `/.next` and `/dist`.
8. **`README.md`** with clone → install → run setup steps.
9. **`CLAUDE.md`** at the repo root pointing future agent sessions at `specs/`
   and the voice constraint.
10. **Exact pinned versions** in `package.json`.

### Out — forbidden in this phase

Per the roadmap, these are not deferred politely; they are not to be touched:

- Any clinic content beyond the one placeholder line.
- Any database: no libSQL, no Drizzle, no `drizzle-kit`, no migrations, no
  `.db` file. Phase 1 owns these.
- Any Zod schema. Phase 1 owns it.
- Playwright. The roadmap adds it at Phase 1, with one spec.
- MDX tooling. Phase 6 owns it.
- Any styling beyond Tailwind's init — no custom colours, fonts, spacing
  scale, or component classes.
- Any route other than `/`.
- GitHub Actions or any other CI infrastructure. Phase 12 owns it.

---

## Decisions

Each decision below was taken explicitly for this phase. Where the roadmap or
tech stack left a choice open, the chosen option and its reasoning are
recorded so it can be argued with later.

### D1 — The placeholder line is deadpan clinical copy

`/` renders:

```
AgenticClinic — outpatient services.
This page is not yet in service.
```

**Why:** [mission.md](../mission.md) names the deadpan clinical voice as the
single most important constraint in the project. Establishing it in the first
real commit means the register is never retrofitted. The line passes the
mission's own test — it could appear verbatim on a real clinic's holding page.
It does not wink, does not explain the premise, and does not pre-empt Phase 9,
which owns the landing page proper.

**Constraint on Phase 9:** this copy is a holding line, not a draft of the
landing page. Phase 9 replaces it outright.

### D2 — Full toolchain, with one smoke test

Vitest is installed with React Testing Library and a `jsdom` environment, and
one test renders `/` and asserts the placeholder text.

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

### Why this phase has no clinic content

The roadmap's framing is that Phase 1 is the thin end-to-end slice. Phase 0
exists so that Phase 1 can be about the slice and not about toolchain
yak-shaving. Any clinic functionality added here makes Phase 1 harder to read
as a worked example, which is the repository audience's whole reason for
existing.

---

## Risks and open questions

| Risk | Mitigation |
| --- | --- |
| Tailwind v4 changed its PostCSS integration; v3 instructions will not work. | Resolve the actual installed version first and follow that version's documented setup. Do not follow remembered instructions. |
| ESLint v9 flat config and Next.js's ESLint plugin have had compatibility churn. | Take whatever `create-next-app` scaffolds for ESLint, then add Prettier on top rather than hand-writing a flat config. |
| Prettier and ESLint can fight over formatting rules. | `eslint-config-prettier` disables the conflicting rules. Formatting is Prettier's job; lint is ESLint's. |
| `create-next-app` may scaffold files this phase does not want (an API route, example assets, a marketing page). | Treat its output as a starting point to prune, not as the deliverable. Anything it adds that is not in the In-scope list above is deleted. |

**Open question for a later phase, not this one:** `create-next-app` defaults
to a `src/app` layout only if asked. The tech stack's conventions assume
`src/`, so that answer is already fixed — but if the scaffolder's defaults
have changed, follow `specs/tech-stack.md`, not the scaffolder.
