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

## 4. The placeholder page

4.1 `src/app/layout.tsx` — the root layout, with `lang="en"`, the Tailwind
    stylesheet imported, and page metadata (title, description) in clinical
    register.

4.2 `src/app/page.tsx` — renders exactly the two-line holding copy from
    decision D1:

    ```
    AgenticClinic — outpatient services.
    This page is not yet in service.
    ```

4.3 No styling beyond what Tailwind's init provides. No custom colours,
    fonts, or spacing. Readable is enough; Phase 10 owns design.

4.4 Confirm the em dash renders correctly — the file is UTF-8 and the
    character survives the build.

**Check:** `/` shows the holding copy and nothing else. No console errors.

---

## 5. Prettier alongside ESLint

5.1 Install `prettier` and `eslint-config-prettier` at pinned versions.

5.2 Add `.prettierrc` and `.prettierignore`. Keep the config minimal — defaults
    unless there is a reason.

5.3 Extend the scaffolded ESLint config with `eslint-config-prettier` so the
    two do not fight over formatting. Do not hand-write a flat config from
    scratch; extend what `create-next-app` produced.

5.4 Run Prettier across the repo once so the tree is already formatted.

**Check:** `npm run lint` passes clean. `npx prettier --check .` passes clean.

---

## 6. Vitest with a real smoke test

6.1 Install `vitest`, `@vitejs/plugin-react`, `jsdom`,
    `@testing-library/react`, and `@testing-library/jest-dom` at pinned
    versions.

6.2 Add `vitest.config.ts`: the React plugin, `environment: 'jsdom'`, a setup
    file importing the jest-dom matchers, and the same path aliases
    `tsconfig.json` uses.

6.3 Write `src/app/page.test.tsx` — render the page component, assert both
    lines of the holding copy are present.

6.4 Confirm the test fails for the right reason: change the asserted text,
    watch it fail, change it back. A test that has never failed proves
    nothing.

**Check:** `npm run test` reports 1 passing test, and the deliberate-failure
step above produced a real failure.

---

## 7. Scripts and ignores

7.1 `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `test`,
    and `verify` chaining lint → build → test (decision D3).

7.2 `.gitignore` gains `/.next` and `/dist`, keeping whatever it already had.

7.3 Confirm no `.db` file, `.env*`, or build output is tracked.

**Check:** `npm run verify` passes end to end. `git status` shows no build
artefacts.

---

## 8. README and CLAUDE.md

8.1 `README.md`: what AgenticClinic is in two sentences, then clone → install
    → `npm run dev`. Short enough to read standing up. Link `specs/`.

8.2 `CLAUDE.md`: point future sessions at `specs/mission.md`,
    `specs/tech-stack.md`, and `specs/roadmap.md`. Restate the deadpan
    clinical voice constraint and the rule that the spec is amended rather
    than quietly diverged from. Name the forbidden dependencies from the tech
    stack's rejected list.

8.3 Neither file explains the joke. The README describes the project as the
    clinic would not — it is developer documentation, not clinic copy — but it
    does not wink at the premise either.

**Check:** a reader who has never seen the repo can get from clone to a
running `/` using only the README.

---

## 9. Cold-clone verification

9.1 Clone the branch to a scratch directory outside the project.

9.2 With no `.env` file and no credentials, run `npm install` and then
    `npm run dev`.

9.3 Confirm `/` renders. Count the steps and the elapsed time; record both in
    [validation.md](./validation.md).

9.4 Confirm nothing in the run reaches a third-party service. `npm install` is
    the only permitted network access.

**Check:** the cold-clone row in `validation.md` is filled in with real
numbers, not estimates.

---

## 10. Review against the spec

10.1 Walk [validation.md](./validation.md) top to bottom and tick every row
     with evidence, not assertion.

10.2 Re-read the Out list in [requirements.md](./requirements.md) and confirm
     nothing forbidden crept in — no database package, no Zod, no Playwright,
     no second route, no custom styling.

10.3 If reality diverged from the spec anywhere, amend the spec in the same
     commit range. The spec staying accurate is a deliverable of this phase,
     not an afterthought.

10.4 Commit, push, open a PR against `main`.

**Check:** every row in `validation.md` is ticked and `npm run verify` passes
from a clean checkout.
