# Phase 0 — Scaffold: Validation

How to know Phase 0 succeeded and can be merged.

The roadmap's done-when condition is: **`npm run dev` serves `/`, and `build`,
`lint`, and `test` all pass clean.** Everything below either checks that
condition or checks a decision recorded in
[requirements.md](./requirements.md).

Every row needs evidence — a command's actual output, a file's actual
contents. "Looks right" is not evidence.

---

## 1. The four commands

Run from a clean checkout of `phase-0-scaffold`.

| # | Command | Expected | ✓ |
| --- | --- | --- | --- |
| 1.1 | `npm run dev` | Server starts, no errors in terminal or browser console. `http://localhost:3000` returns 200. | ☐ |
| 1.2 | `npm run build` | Exits 0. No TypeScript errors, no warnings about missing config. | ☐ |
| 1.3 | `npm run lint` | Exits 0, zero errors, zero warnings. | ☐ |
| 1.4 | `npm run test` | Exits 0. **1 passed** — the `/` smoke test. | ☐ |
| 1.5 | `npm run verify` | Exits 0. Runs lint → build → test in sequence; a failure in any stage fails the whole command. | ☐ |
| 1.6 | `npx prettier --check .` | Exits 0. No files need formatting. | ☐ |

**Blocking:** all six. Any non-zero exit blocks merge.

---

## 2. The placeholder page

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 2.1 | `/` content | Renders exactly the two lines from decision D1: `AgenticClinic — outpatient services.` / `This page is not yet in service.` | ☐ |
| 2.2 | Em dash | Renders as `—`, not `â€"` or `?`. File is UTF-8. | ☐ |
| 2.3 | Voice | Passes the mission's test: this copy could appear verbatim on a real clinic's holding page. No exclamation marks, no wink, no explanation of the premise. | ☐ |
| 2.4 | Nothing else on the page | No nav, no footer, no logo, no example content from the scaffolder. | ☐ |
| 2.5 | Page metadata | `<title>` and description are in clinical register, not `Create Next App`. | ☐ |
| 2.6 | Client JS | No `'use client'` anywhere. The page is a Server Component. | ☐ |

**Blocking:** 2.1, 2.2, 2.4, 2.5. Row 2.3 is a judgement call; if it is
arguable, the copy is wrong and gets rewritten.

---

## 3. The smoke test is real

A passing test proves nothing unless it can fail.

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 3.1 | Test file exists | `src/app/page.test.tsx` renders the page component and asserts both copy lines. | ☐ |
| 3.2 | Deliberate failure | Altering the asserted text makes `npm run test` fail with a clear assertion diff — not a config or resolution error. | ☐ |
| 3.3 | Restored | After reverting the alteration, `npm run test` is green again. | ☐ |
| 3.4 | JSX under Vitest | The test compiles TSX without a separate build step. | ☐ |
| 3.5 | jsdom resolves | `environment: 'jsdom'` is in effect — `document` is defined inside the test. | ☐ |
| 3.6 | jest-dom matchers | `toBeInTheDocument` (or equivalent) is available via the setup file. | ☐ |

**Blocking:** all six. Row 3.2 is the point of decision D2 and is not
skippable.

---

## 4. Version pinning

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 4.1 | No ranges | `grep -E '"[~^]' package.json` returns nothing. | ☐ |
| 4.2 | Resolved, not remembered | Each version below was obtained from `npm view <pkg> version` during group 2 of the plan. | ☐ |
| 4.3 | Lockfile committed | `package-lock.json` is tracked and matches `package.json`. | ☐ |
| 4.4 | Table filled in | The table below has real numbers in every row. | ☐ |

### Resolved versions

Fill in during plan group 2. **Leave no row blank at merge time.**

| Package | Resolved version |
| --- | --- |
| `next` | |
| `react` | |
| `react-dom` | |
| `typescript` | |
| `tailwindcss` | |
| `eslint` | |
| `prettier` | |
| `eslint-config-prettier` | |
| `vitest` | |
| `@vitejs/plugin-react` | |
| `jsdom` | |
| `@testing-library/react` | |
| `@testing-library/jest-dom` | |

**If a resolved major version contradicted an assumption in
`requirements.md`:** note which, and confirm `requirements.md` was amended
rather than worked around.

Amendments made: _(none / list them)_

---

## 5. Carried-over constraints

From the scaffold migration note in [tech-stack.md](../tech-stack.md).

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 5.1 | `tsconfig.json` | `"strict": true`. | ☐ |
| 5.2 | `.gitignore` contains `/.next` | Present. | ☐ |
| 5.3 | `.gitignore` contains `/dist` | Present — it was the old `outDir` and was previously untracked-but-unignored. | ☐ |
| 5.4 | Hello-world gone | No `src/index.ts`, no `dist/` directory, no `"build": "tsc"` script, no `"main": "dist/index.js"`. | ☐ |
| 5.5 | No artefacts tracked | `git status` is clean after `npm run build` and `npm run test`. | ☐ |

**Blocking:** all five.

---

## 6. Cold clone, offline

Decision D4. The booth-demo constraint in [mission.md](../mission.md) states
that anything needing a credential or a manual step before `/` renders is a
bug.

Run against a fresh clone in a scratch directory outside the project.

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 6.1 | Steps to running `/` | `git clone` → `npm install` → `npm run dev`. Three commands. | ☐ |
| 6.2 | No credentials | No `.env` file, no API key, no login, no database provisioning. `/` renders anyway. | ☐ |
| 6.3 | No network beyond install | After `npm install`, nothing reaches a third-party service. `npm run dev` and `/` work with the network off. | ☐ |
| 6.4 | No manual setup step | No file to copy, no migration to run, no service to start. | ☐ |
| 6.5 | README sufficiency | A reader using only `README.md` gets from clone to running `/` without asking a question. | ☐ |

### Recorded run

| Measure | Value |
| --- | --- |
| Commands from clone to `/` rendering | |
| Elapsed time, `npm install` | |
| Elapsed time, clone → `/` visible | |
| Credentials required | 0 (expected) |
| Manual steps beyond the listed commands | 0 (expected) |

**Blocking:** all five rows. Fill in the recorded run with measured values,
not estimates.

---

## 7. Nothing forbidden crept in

The roadmap's Out list is not a deferral, it is a prohibition. Check each.

| # | Must be absent | Owned by | ✓ |
| --- | --- | --- | --- |
| 7.1 | `@libsql/client`, `drizzle-orm`, `drizzle-kit`, any `.db` file, any migration | Phase 1 | ☐ |
| 7.2 | `zod` | Phase 1 | ☐ |
| 7.3 | `@playwright/test`, any `e2e/` directory | Phase 1 | ☐ |
| 7.4 | Any MDX package | Phase 6 | ☐ |
| 7.5 | Any route other than `/` | Phases 1–9 | ☐ |
| 7.6 | Custom Tailwind theme, custom colours, fonts, or spacing scale | Phase 10 | ☐ |
| 7.7 | Any CI workflow (`.github/workflows/`) | Phase 12 | ☐ |
| 7.8 | Anything from the rejected list in [tech-stack.md](../tech-stack.md) — MCP SDK, auth library, client state manager, component library, AI SDK | Never | ☐ |
| 7.9 | Empty convention directories (`src/db/`, `src/domain/`, `src/content/`) created with nothing in them | The phase that first needs one | ☐ |

**Blocking:** all nine. One quick check: `cat package.json` and read every
dependency aloud. Anything you cannot justify from the In list in
`requirements.md` does not belong.

---

## 8. Documentation

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| 8.1 | `README.md` exists | Two-sentence description, setup steps, link to `specs/`. | ☐ |
| 8.2 | `CLAUDE.md` exists | Points at `specs/mission.md`, `specs/tech-stack.md`, `specs/roadmap.md`. States the voice constraint and the amend-the-spec rule. Lists the forbidden dependencies. | ☐ |
| 8.3 | Neither explains the joke | No "this is a satirical site about…" framing aimed at a site visitor. Developer docs may be plain; they may not wink. | ☐ |
| 8.4 | Spec is accurate | `requirements.md` and `plan.md` describe what was actually built. Any divergence was amended, not left stale. | ☐ |

**Blocking:** 8.1, 8.2, 8.4. Row 8.3 is a judgement call.

---

## Merge gate

Phase 0 can merge when:

1. Every blocking row above is ticked with evidence.
2. The resolved-versions table in section 4 has no blank rows.
3. The recorded-run table in section 6 has measured values.
4. `npm run verify` passes from a clean checkout of the branch.
5. Section 7 is fully ticked — nothing from a later phase is present.

## Explicitly not validated here

These are not Phase 0's job and their absence is not a failure:

- Any clinic behaviour, since there is none.
- Visual design or print layout — Phase 10.
- Accessibility beyond what semantic HTML gives for free — Phase 10 runs the
  axe audit.
- Any database round-trip — Phase 1.
- Any Playwright spec — Phase 1 adds the first one.
