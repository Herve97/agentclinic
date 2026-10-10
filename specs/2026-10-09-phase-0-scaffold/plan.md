# Phase 0 — Scaffold: Plan

Task groups are numbered and ordered. Each group leaves the repo in a state
that can be committed. Do not start a group until the previous one's check
passes.

Scope and decisions are in [requirements.md](./requirements.md). Done-when
conditions are in [validation.md](./validation.md).

---

## 1. Clear the ground

Remove the hello-world before scaffolding over it, so nothing orphaned
survives into the Next.js tree.

1.1 Confirm the working tree is clean and the branch is `phase-0-scaffold`.

1.2 Record the current contents of `tsconfig.json` and `.gitignore` before
replacing them — `strict: true` and any existing ignore entries must
survive, per the scaffold migration note in
[tech-stack.md](../tech-stack.md).

1.3 Delete `src/index.ts` and any `dist/` directory.

1.4 Note the current `package.json` fields worth keeping: `name`, `private`.
`main: "dist/index.js"` and `build: "tsc"` are removed, not migrated.

**Check:** `src/` is empty or gone, no `dist/`, `git status` shows only
deletions.

---

## 2. Resolve and pin versions

Nothing is installed from a remembered version number.

2.1 For each package below, run `npm view <pkg> version` and record the exact
result:

    next  react  react-dom  typescript  tailwindcss  eslint  prettier
    vitest  @vitejs/plugin-react  jsdom  @testing-library/react
    @testing-library/jest-dom

2.2 Write the resolved versions into the version table in
[validation.md](./validation.md).

2.3 If any resolved major version contradicts an assumption in
[requirements.md](./requirements.md) — Tailwind's PostCSS integration and
ESLint's flat config are the two named risks — stop and amend
`requirements.md` before installing. The spec stays ahead of the code.

**Check:** every package has a concrete resolved version written down, and no
version in any file carries a `^` or `~`.

---

## 3. Scaffold Next.js

3.1 Run `create-next-app` targeting this directory, with TypeScript, Tailwind,
ESLint, the App Router, and a `src/` directory.

3.2 Prune its output to the In-scope list in
[requirements.md](./requirements.md). Delete example assets, any API
route, any demo page, and any generated marketing copy. The scaffolder's
output is a starting point, not the deliverable.

3.3 Restore `strict: true` in `tsconfig.json` if the scaffolder did not set
it.

3.4 Rewrite `package.json` dependency versions to the exact pins from group 2.
Reinstall so the lockfile matches.

**Check:** `npm run dev` serves something at `/`. `npm run build` completes.

---

## 4. The root route and layout

Plumbing only. This group proves the route renders; group 5 writes what is on
it.

4.1 `src/app/layout.tsx` — the root layout, with `lang="en"`, the Tailwind
stylesheet imported, and page metadata (title, description) in clinical
register.

4.2 `src/app/page.tsx` — a Server Component rendering the clinic name and
nothing more. Content arrives in group 5.

4.3 Confirm the file is UTF-8 and non-ASCII characters survive the build.

    Amended 2026-10-09: this step said "the em dash in the group 5 copy is the
    case that matters". It was written against D1's superseded copy
    (`AgenticClinic — outpatient services.`). D7's copy contains no em dash,
    so the check had nothing to bite on. Rather than add punctuation to the
    page to satisfy a stale note, the pipeline was proved directly: an em
    dash, an `&mdash;` entity, and `ünïcode` were inserted into
    `page.tsx`, `npm run build` was run, the prerendered output was
    confirmed to contain `Accepting — UTF8PROBE — ünïcode` with
    `charSet="utf-8"` and no mojibake, and the probe was reverted.

4.4 No `'use client'`. No custom colours, fonts, or spacing scale.

**Check:** `/` returns 200 and renders the clinic name. No console errors.

---

## 5. The minimal home page

Decision D7. A home page, not a holding page — but a minimal one, and not a
draft of Phase 9's landing page.

5.1 `src/app/page.tsx` renders the clinic identity block: name, one-line
description of services, and a small facts list. Target copy is in
decision D7 of [requirements.md](./requirements.md).

5.2 Mark up the facts as a `<dl>`, not a table or a list of paragraphs. Hours,
new-patient status, and referral requirement are term/description pairs
and the semantics are free.

5.3 Styling is Tailwind utilities for legibility and layout only — measure,
spacing, and type scale from Tailwind's defaults. No custom theme, no
`tailwind.config` additions, no component classes. Phase 10 owns design.

5.4 **No links.** `/intake`, `/waiting-room`, `/patients`, and `/transcripts`
do not exist yet. A link to a 404 is worse than no link. Phase 9 adds the
entry points.

5.5 Check the copy against the voice test in [mission.md](../mission.md):
could this appear verbatim on a real clinic's home page with the subject
matter swapped? No exclamation marks, no wink, nothing that explains the
premise.

5.6 Re-read the Phase 9 boundary in decision D7. If this page starts acquiring
a notice board, navigation, or anything that "sells the premise", stop —
that is Phase 9 and it is being done early.

**Check:** `/` reads as a real clinic's home page, fits one screen with no
scrolling at 1280×800, and links nowhere.

---

## 6. Prettier alongside ESLint

6.1 Install `prettier` and `eslint-config-prettier` at pinned versions.

6.2 Add `.prettierrc` and `.prettierignore`. Keep the config minimal — defaults
unless there is a reason.

6.3 Extend the scaffolded ESLint config with `eslint-config-prettier` so the
two do not fight over formatting. Do not hand-write a flat config from
scratch; extend what `create-next-app` produced.

6.4 Run Prettier across the repo once so the tree is already formatted.

**Check:** `npm run lint` passes clean. `npx prettier --check .` passes clean.

---

## 7. Vitest with a real smoke test

7.1 Install `vitest`, `@vitejs/plugin-react`, `jsdom`,
`@testing-library/react`, and `@testing-library/jest-dom` at pinned
versions.

7.2 Add `vitest.config.ts`: the React plugin, `environment: 'jsdom'`, a setup
file importing the jest-dom matchers, and the same path aliases
`tsconfig.json` uses.

7.3 Write `src/app/page.test.tsx` — render the page component and assert the
clinic name, the services line, and each facts-list term from group 5 are
present.

7.4 Confirm the test fails for the right reason: change one asserted string,
watch it fail, change it back. A test that has never failed proves
nothing.

**Check:** `npm run test` reports 1 passing test, and the deliberate-failure
step above produced a real failure with an assertion diff.

---

## 8. Scripts and ignores

8.1 `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `test`,
and `verify` chaining lint → build → test (decision D3).

8.2 `.gitignore` gains `/.next` and `/dist`, keeping whatever it already had.

8.3 Confirm no `.db` file, `.env*`, or build output is tracked.

**Check:** `npm run verify` passes end to end. `git status` shows no build
artefacts.

---

## 9. README and CLAUDE.md

9.1 `README.md`: what AgenticClinic is in two sentences, then clone → install
→ `npm run dev`. Short enough to read standing up. Link `specs/`.

9.2 `CLAUDE.md`: point future sessions at `specs/mission.md`,
`specs/tech-stack.md`, and `specs/roadmap.md`. Restate the deadpan
clinical voice constraint and the rule that the spec is amended rather
than quietly diverged from. Name the forbidden dependencies from the tech
stack's rejected list.

9.3 Neither file explains the joke. The README describes the project as the
clinic would not — it is developer documentation, not clinic copy — but it
does not wink at the premise either.

**Check:** a reader who has never seen the repo can get from clone to a
running `/` using only the README.

---

## 10. Cold-clone verification

10.1 Clone the branch to a scratch directory outside the project.

10.2 With no `.env` file and no credentials, run `npm install` and then
`npm run dev`.

10.3 Confirm `/` renders the home page. Count the steps and the elapsed time;
record both in [validation.md](./validation.md).

10.4 Confirm nothing in the run reaches a third-party service. `npm install`
is the only permitted network access. In particular, no web font is
fetched at render time — the booth-demo constraint in
[mission.md](../mission.md) forbids it and group 5 uses Tailwind's
default stack.

**Check:** the recorded-run table in `validation.md` is filled in with real
numbers, not estimates.

---

## 11. Review against the spec

11.1 Walk [validation.md](./validation.md) top to bottom and tick every row
with evidence, not assertion.

11.2 Re-read the Out list in [requirements.md](./requirements.md) and confirm
nothing forbidden crept in — no database package, no Zod, no Playwright,
no second route, no custom theme, no links to unbuilt routes.

11.3 Confirm [roadmap.md](../roadmap.md) Phase 0 and Phase 9 still match what
was built. The home page was an amendment to the roadmap, not a quiet
divergence from it; if the page grew past what D7 describes, the roadmap
is now wrong and gets amended again.

11.4 If reality diverged from the spec anywhere, amend the spec in the same
commit range. The spec staying accurate is a deliverable of this phase,
not an afterthought.

11.5 Commit, push, open a PR against `main`.

    Amended 2026-10-10: committed and pushed, no PR. The phase was built on
    `phase-0-scaffold`, but that branch was renamed to `main` before the
    push, so the three Phase 0 commits became `main`'s own history on the
    remote (`github.com/Herve97/agentclinic`, `main` at `3eb1178`). There
    is no base branch to open a PR against — a PR needs two refs and there is
    only one. Nothing was worked around: the review this step exists to
    provoke was done as step 11.1, against `validation.md`, before the push.

    For later phases, keep the feature branch and open the PR from it. This
    step assumed that shape and it is the right one; Phase 0 is the exception
    because its branch became the trunk.

**Check:** every row in `validation.md` is ticked and `npm run verify` passes
from a clean checkout.
