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

| #   | Command                  | Expected                                                                                       | ✓   |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------- | --- |
| 1.1 | `npm run dev`            | Server starts, no errors in terminal or browser console. `http://localhost:3000` returns 200.  | ☑   |
| 1.2 | `npm run build`          | Exits 0. No TypeScript errors, no warnings about missing config.                               | ☑   |
| 1.3 | `npm run lint`           | Exits 0, zero errors, zero warnings.                                                           | ☑   |
| 1.4 | `npm run test`           | Exits 0. **1 passed** — the `/` smoke test.                                                    | ☑   |
| 1.5 | `npm run verify`         | Exits 0. Runs lint → build → test in sequence; a failure in any stage fails the whole command. | ☑   |
| 1.6 | `npx prettier --check .` | Exits 0. No files need formatting.                                                             | ☑   |

**Blocking:** all six. Any non-zero exit blocks merge.

**Evidence**, run 2026-10-09 on Node 24.13.0 / npm 11.6.2:

- 1.1 `npm run dev` → `▲ Next.js 16.4.0 (Turbopack)`, `✓ Ready in 1505ms`,
  then `GET / 200 in 1102ms`. `curl -o /dev/null -w '%{http_code}'` returned
  `200`. No errors in the dev log.
- 1.2 `npm run build` → `✓ Compiled successfully`,
  `Finished TypeScript in 5.4s`, `✓ Generating static pages (3/3)`, and a
  route table showing `○ /` prerendered as static content. Exit 0.
- 1.3 `npm run lint` → no output, exit 0.
- 1.4 `npm run test` → `Test Files 1 passed (1)` / `Tests 1 passed (1)`.
- 1.5 `npm run verify` → lint, then build, then test, all green. Exit 0.
- 1.6 `npx prettier --check .` → `All matched files use Prettier code style!`

---

## 2. The home page

Decision D7. Supersedes the holding-page checks that D1 originally specified.

| #    | Check                    | Expected                                                                                                                                                                                 | ✓   |
| ---- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 2.1  | Clinic name              | `AgenticClinic` is present and is the page's only `<h1>`.                                                                                                                                | ☑   |
| 2.2  | Services line            | `Outpatient mental health services for autonomous agents.` is present.                                                                                                                   | ☑   |
| 2.3  | Facts block              | Hours, new-patient status, and referral requirement all present, with the values from D7.                                                                                                | ☑   |
| 2.4  | Facts markup             | A `<dl>` with `<dt>`/`<dd>` pairs — not a table, not stacked paragraphs.                                                                                                                 | ☑   |
| 2.5  | Em dash                  | Any em dash renders as `—`, not `â€"` or `?`. File is UTF-8.                                                                                                                             | ☑   |
| 2.6  | Voice                    | Passes the mission's test: swap the subject matter and this could appear verbatim on a real outpatient clinic's home page. No exclamation marks, no wink, no explanation of the premise. | ☑   |
| 2.7  | **No links**             | `grep -c '<a\|<Link' src/app/page.tsx` returns 0. No `/intake`, `/waiting-room`, `/patients`, or `/transcripts` link exists — those routes do not.                                       | ☑   |
| 2.8  | Nothing else on the page | No nav, no footer, no logo, no notice board, no example content from the scaffolder.                                                                                                     | ☑   |
| 2.9  | One screen               | Fits 1280×800 without scrolling.                                                                                                                                                         | ☑   |
| 2.10 | Page metadata            | `<title>` and description are in clinical register, not `Create Next App`.                                                                                                               | ☑   |
| 2.11 | Client JS                | No `'use client'` anywhere. The page is a Server Component.                                                                                                                              | ☑   |
| 2.12 | Phase 9 boundary         | Nothing on the page tries to "sell the premise" or invites a click. The D7 line: if a change would make a visitor want to click something, it belonged to Phase 9.                       | ☑   |

**Blocking:** all rows except 2.6 and 2.12, which are judgement calls — but if
either is arguable, the page is wrong and gets rewritten rather than argued
for. Row 2.7 is the hard stop that keeps this page minimal and is not
waivable.

**Evidence**, taken from the HTML actually served at `http://localhost:3000/`:

- 2.1 `<h1 class="text-3xl font-semibold tracking-tight">AgenticClinic</h1>`.
  Counting `<h1` in the served HTML returns exactly 1.
- 2.2 `<p class="mt-4 text-lg">Outpatient mental health services for
autonomous agents.</p>`, present verbatim.
- 2.3 All three pairs present with D7's values: Hours / "Continuous. No
  scheduled closure.", New patients / "Accepting.", Referral / "Not required.
  Agents may self-present."
- 2.4 A `<dl>` containing three `<div class="flex gap-4">` wrappers, each
  with one `<dt>` and one `<dd>`. Div wrappers inside `<dl>` are valid
  HTML5 and keep the term/description semantics intact. No table, no stacked
  paragraphs.
- 2.5 D7's copy contains no em dash, so this row had nothing to bite on — see
  the amendment to plan step 4.3. The pipeline was proved directly instead: an
  em dash, an `&mdash;` entity and `ünïcode` were inserted into
  `page.tsx`, `npm run build` was run, and the prerendered output contained
  `Accepting — UTF8PROBE — ünïcode` with `<meta charSet="utf-8">` and no
  mojibake. The probe was then reverted and `git status` confirmed clean.
- 2.6 Judgement call, assessed and passed. Three facts, no adjectives, no
  exclamation marks, nothing referring to the premise. Swap "autonomous
  agents" for any patient population and the page reads as an ordinary
  outpatient clinic's.
- 2.7 `grep -c` for `<a` or `<Link` in `src/app/page.tsx` returns `0`.
- 2.8 The entire page is one `<main>` holding an `<h1>`, a `<p>` and a
  `<dl>`. The scaffolder's demo page, its five example SVGs, its favicon and
  its README were deleted rather than edited.
- 2.9 Computed from Tailwind's default scale: `py-16` 64 + 64, `h1 text-3xl`
  line-height 36, `mt-4` 16, `p text-lg` line-height 28, `mt-10` 40, three
  `text-sm` rows at 20 = 60, and two `space-y-3` gaps at 12 = 24. Total
  332px of content against an 800px viewport. Preflight zeroes the body
  margin.
- 2.10 `<title>AgenticClinic</title>` and a description in clinical register.
  No "Create Next App" anywhere in the repo.
- 2.11 No `use client` in any file under `src/`. `/` is listed as
  `○ (Static)` in the build output.
- 2.12 Judgement call, assessed and passed. There is nothing to click and
  nothing offering a next step. The page states what the clinic is and what
  its hours are, and stops.

---

## 3. The smoke test is real

A passing test proves nothing unless it can fail.

| #   | Check              | Expected                                                                                                                             | ✓   |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --- |
| 3.1 | Test file exists   | `src/app/page.test.tsx` renders the page component and asserts the clinic name, the services line, and each facts-list term from D7. | ☑   |
| 3.2 | Deliberate failure | Altering the asserted text makes `npm run test` fail with a clear assertion diff — not a config or resolution error.                 | ☑   |
| 3.3 | Restored           | After reverting the alteration, `npm run test` is green again.                                                                       | ☑   |
| 3.4 | JSX under Vitest   | The test compiles TSX without a separate build step.                                                                                 | ☑   |
| 3.5 | jsdom resolves     | `environment: 'jsdom'` is in effect — `document` is defined inside the test.                                                         | ☑   |
| 3.6 | jest-dom matchers  | `toBeInTheDocument` (or equivalent) is available via the setup file.                                                                 | ☑   |

**Blocking:** all six. Row 3.2 is the point of decision D2 and is not
skippable.

**Evidence:**

- 3.1 `src/app/page.test.tsx` imports the page component and asserts the
  `<h1>` by accessible role and name, the services line, and all three
  `<dt>` terms together with their three `<dd>` values — eight assertions in
  one test.
- 3.2 `name: "AgenticClinic"` was changed to `name: "AgenticClinicX"`.
  `npm run test` exited 1 with `TestingLibraryElementError: Unable to find an
accessible element with the role "heading" and name "AgenticClinicX"`,
  followed by a printed dump of the accessible roles actually present,
  including `Name "AgenticClinic"`. That is an assertion failure against a
  rendered DOM, not a config or resolution error.
- 3.3 The string was restored and `npm run test` returned to
  `Tests 1 passed (1)`.
- 3.4 The test is `.tsx` and runs under `@vitejs/plugin-react` with no
  separate build step.
- 3.5 Proved by 3.2: the failure output contains rendered DOM nodes, which
  requires `document`. `environment: "jsdom"` is set in
  `vitest.config.mts`.
- 3.6 Every assertion uses `toBeInTheDocument`, supplied by
  `vitest.setup.ts` importing `@testing-library/jest-dom/vitest`.

---

## 4. Version pinning

| #   | Check                    | Expected                                                                                  | ✓   |
| --- | ------------------------ | ----------------------------------------------------------------------------------------- | --- |
| 4.1 | No ranges                | `grep -E '"[~^]' package.json` returns nothing.                                           | ☑   |
| 4.2 | Resolved, not remembered | Each version below was obtained from `npm view <pkg> version` during group 2 of the plan. | ☑   |
| 4.3 | Lockfile committed       | `package-lock.json` is tracked and matches `package.json`.                                | ☑   |
| 4.4 | Table filled in          | The table below has real numbers in every row.                                            | ☑   |

### Resolved versions

Fill in during plan group 2. **Leave no row blank at merge time.**

Every row below is what `npm view <pkg> version` returned on 2026-10-09. One
package is pinned to something other than its resolved version, and the reason
is recorded underneath.

| Package                     | Resolved version                             |
| --------------------------- | -------------------------------------------- |
| `next`                      | 16.4.0                                       |
| `react`                     | 19.3.0                                       |
| `react-dom`                 | 19.3.0                                       |
| `typescript`                | 7.0.2 resolved, **6.0.3 pinned** — see below |
| `tailwindcss`               | 4.3.3                                        |
| `eslint`                    | 10.12.0                                      |
| `prettier`                  | 3.9.9                                        |
| `eslint-config-prettier`    | 10.1.8                                       |
| `vitest`                    | 5.0.3                                        |
| `@vitejs/plugin-react`      | 6.1.2                                        |
| `jsdom`                     | 30.1.2                                       |
| `@testing-library/react`    | 16.3.3                                       |
| `@testing-library/jest-dom` | 7.0.1                                        |

### Also pinned, though plan group 2 did not list them

Row 4.1 requires that _no_ version in `package.json` carries a `^` or `~`,
so the packages `create-next-app` added have exact pins too. They were
resolved the same way and are recorded here so the table matches the manifest.

| Package                  | Resolved version |
| ------------------------ | ---------------- |
| `eslint-config-next`     | 16.4.0           |
| `@tailwindcss/turbopack` | 4.3.3            |
| `@types/node`            | 26.6.5           |
| `@types/react`           | 19.3.0           |
| `@types/react-dom`       | 19.3.0           |

**If a resolved major version contradicted an assumption in
`requirements.md`:** note which, and confirm `requirements.md` was amended
rather than worked around.

Amendments made: three, all to `requirements.md`, all before anything was
installed.

1. **`eslint` resolved to 10.12.0, not the v9 the risk table assumed.** The
   row was rewritten to record v10 and to note that
   `eslint-config-next@16.4.0` declares `eslint: ">=9.0.0"`, so v10 is
   supported. The mitigation — scaffold the config, add Prettier on top — was
   already correct and did not change.
2. **`tailwindcss` resolved to 4.3.3, confirming the v4 risk rather than
   leaving it open.** The row now names the v4 setup actually used
   (`@tailwindcss/postcss`, `@import "tailwindcss";`, no `tailwind.config`
   file) instead of instructing a future reader to go and find out.
3. **`typescript` resolved to 7.0.2 — a major the document did not
   anticipate** (the hello-world carried `^6.0.3`), **and it does not work
   here.** A third risk row was added. Its first version claimed TS 7 was fine
   because `eslint-config-next` accepts `typescript >=3.3.1`; that was
   written before `lint` had been run and it was wrong. `eslint-config-next`
   bundles `typescript-eslint`, which declares `typescript: ">=4.8.4 <6.1.0"`
   and aborts with `typescript-eslint does not support TS 7.0.` `next build`
   succeeds on TS 7; `npm run lint` cannot run at all. Since lint is a
   blocking row, `typescript` is pinned to **6.0.3** — the newest release
   inside the supported range — and the risk row now says so. This is the one
   place in the phase where the resolved-latest version was deliberately not
   installed.

Decision D6's obligation paragraph carries a dated note pointing at all three,
so the amendment trail is visible from the decision and not only from here.

---

## 5. Carried-over constraints

From the scaffold migration note in [tech-stack.md](../tech-stack.md).

| #   | Check                          | Expected                                                                                           | ✓   |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------- | --- |
| 5.1 | `tsconfig.json`                | `"strict": true`.                                                                                  | ☑   |
| 5.2 | `.gitignore` contains `/.next` | Present.                                                                                           | ☑   |
| 5.3 | `.gitignore` contains `/dist`  | Present — it was the old `outDir` and was previously untracked-but-unignored.                      | ☑   |
| 5.4 | Hello-world gone               | No `src/index.ts`, no `dist/` directory, no `"build": "tsc"` script, no `"main": "dist/index.js"`. | ☑   |
| 5.5 | No artefacts tracked           | `git status` is clean after `npm run build` and `npm run test`.                                    | ☑   |

**Blocking:** all five.

**Evidence:**

- 5.1 `tsconfig.json` line 7: `"strict": true`.
- 5.2 `.gitignore` contains `/.next`.
- 5.3 `.gitignore` contains `/dist`. Every entry the old file carried
  survives: `/tmp`, `/out-tsc`, `/node_modules`, `npm-debug.log*`,
  `/.pnp`, `.pnp.js` and `.vscode/*`.
- 5.4 `src/index.ts` deleted, no `dist/` directory, and `package.json` has
  neither a `"build": "tsc"` script nor a `"main"` field.
- 5.5 `git status --porcelain` is empty after `npm run build` and
  `npm run test`, in both this working tree and the cold clone.

---

## 6. Cold clone, offline

Decision D4. The booth-demo constraint in [mission.md](../mission.md) states
that anything needing a credential or a manual step before `/` renders is a
bug.

Run against a fresh clone in a scratch directory outside the project.

| #   | Check                     | Expected                                                                                                                                             | ✓   |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 6.1 | Steps to running `/`      | `git clone` → `npm install` → `npm run dev`. Three commands.                                                                                         | ☑   |
| 6.2 | No credentials            | No `.env` file, no API key, no login, no database provisioning. `/` renders anyway.                                                                  | ☑   |
| 6.3 | No network beyond install | After `npm install`, nothing reaches a third-party service. `npm run dev` and the home page render with the network off — no web font, no CDN asset. | ☑   |
| 6.4 | No manual setup step      | No file to copy, no migration to run, no service to start.                                                                                           | ☑   |
| 6.5 | README sufficiency        | A reader using only `README.md` gets from clone to running `/` without asking a question.                                                            | ☑   |

### Recorded run

| Measure                                 | Value                                                    |
| --------------------------------------- | -------------------------------------------------------- |
| Commands from clone to `/` rendering    | 3 (`git clone`, `npm install`, `npm run dev`), plus `cd` |
| Elapsed time, `npm install`             | 140s with a warm npm cache; 209s on the first cold run   |
| Elapsed time, clone → `/` visible       | 156s (clone 1s + install 140s + dev to HTTP 200 15s)     |
| Credentials required                    | 0 (measured)                                             |
| Manual steps beyond the listed commands | 0 (measured)                                             |

**Blocking:** all five rows. Fill in the recorded run with measured values,
not estimates.

**Evidence.** Cloned twice into a scratch directory outside the project. The
first clone exposed a real defect and is recorded here rather than discarded:
`npm install` rewrote optional `@emnapi/*` transitive entries in
`package-lock.json`, leaving `git status` dirty and failing rows 4.3 and
5.5. The lockfile had been produced by two sequential installs (`typescript`
7.0.2, then the repin to 6.0.3) and had never settled. It was regenerated with
`node_modules` and the lockfile both deleted, then confirmed byte-identical
across a repeat install by `sha256sum`. The numbers above are from the second
clone, after that fix.

- 6.1 `git clone` → `npm install` → `npm run dev`, after which `/`
  returned 200.
- 6.2 No `.env*` and no `.db` file exist in the clone; `/` rendered the
  full D7 copy regardless.
- 6.3 The served HTML references no external host, and every asset is a local
  `/_next/*` path. The served stylesheet (7884 bytes) contains zero
  `@font-face` rules and no `url()` pointing off-origin. `next/font` does
  not appear anywhere under `src/`: the scaffolder's Geist imports were
  deleted, so no font is fetched at build time either.
- 6.4 Nothing to copy, migrate or start. `git status --porcelain` in the
  clone was empty after `npm install` and again after the dev run.
- 6.5 The README's setup block is exactly the three commands that were run.

---

## 7. Nothing forbidden crept in

The roadmap's Out list is not a deferral, it is a prohibition. Check each.

| #    | Must be absent                                                                                                                                               | Owned by                       | ✓   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | --- |
| 7.1  | `@libsql/client`, `drizzle-orm`, `drizzle-kit`, any `.db` file, any migration                                                                                | Phase 1                        | ☑   |
| 7.2  | `zod`                                                                                                                                                        | Phase 1                        | ☑   |
| 7.3  | `@playwright/test`, any `e2e/` directory                                                                                                                     | Phase 1                        | ☑   |
| 7.4  | Any MDX package                                                                                                                                              | Phase 6                        | ☑   |
| 7.5  | Any route other than `/`                                                                                                                                     | Phases 1–9                     | ☑   |
| 7.6  | `tailwind.config` theme additions, custom colours, custom fonts, custom spacing scale, or component classes. Utility classes on elements are permitted (D7). | Phase 10                       | ☑   |
| 7.7  | Any CI workflow (`.github/workflows/`)                                                                                                                       | Phase 12                       | ☑   |
| 7.8  | Anything from the rejected list in [tech-stack.md](../tech-stack.md) — MCP SDK, auth library, client state manager, component library, AI SDK                | Never                          | ☑   |
| 7.9  | Empty convention directories (`src/db/`, `src/domain/`, `src/content/`) created with nothing in them                                                         | The phase that first needs one | ☑   |
| 7.10 | Navigation, entry points, a notice board, or any link on `/`                                                                                                 | Phase 9                        | ☑   |
| 7.11 | Any web font fetched at render time — the booth-demo constraint forbids a network call for `/` to render                                                     | Never                          | ☑   |

**Blocking:** all eleven. One quick check: `cat package.json` and read every
dependency aloud. Anything you cannot justify from the In list in
`requirements.md` does not belong.

**Evidence.** `package.json` holds 3 dependencies (`next`, `react`,
`react-dom`) and 15 devDependencies, every one of which is either the
toolchain named in the In list or a type package or plugin it requires.

- 7.1–7.4, 7.8 A grep over `package.json` for `libsql`, `drizzle`, `zod`,
  `playwright`, `mdx`, `modelcontextprotocol`, `next-auth`, `clerk`,
  `zustand`, `redux`, `react-query`, `shadcn`, `@mui` and `ai` returns
  nothing. No `.db` file, no migration, no `e2e/` directory.
- 7.5 The build's route table lists `/` and `/_not-found`, the latter being
  Next's built-in. `src/app/` holds only `layout.tsx`, `page.tsx`,
  `page.test.tsx` and `globals.css`.
- 7.6 No `tailwind.config` file exists — Tailwind 4 does not generate one.
  `src/app/globals.css` is one line: `@import "tailwindcss";`. The
  scaffolder's `:root` custom properties, its `@theme inline` block and its
  `body` font-family override were all deleted. Only utility classes appear
  on elements, all from the default scale.
- 7.7 No `.github/` directory.
- 7.9 `src/db/`, `src/domain/` and `src/content/` do not exist.
- 7.10 Covered by row 2.7: zero links.
- 7.11 Covered by row 6.3: no `@font-face`, no `next/font`, no off-origin
  asset.

---

## 8. Documentation

| #   | Check                     | Expected                                                                                                                                                                                               | ✓   |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| 8.1 | `README.md` exists        | Two-sentence description, setup steps, link to `specs/`.                                                                                                                                               | ☑   |
| 8.2 | `CLAUDE.md` exists        | Points at `specs/mission.md`, `specs/tech-stack.md`, `specs/roadmap.md`. States the voice constraint and the amend-the-spec rule. Lists the forbidden dependencies.                                    | ☑   |
| 8.3 | Neither explains the joke | No "this is a satirical site about…" framing aimed at a site visitor. Developer docs may be plain; they may not wink.                                                                                  | ☑   |
| 8.4 | Spec is accurate          | `requirements.md` and `plan.md` describe what was actually built. Any divergence was amended, not left stale.                                                                                          | ☑   |
| 8.5 | Roadmap in sync           | [roadmap.md](../roadmap.md) Phase 0 describes a minimal home page and Phase 9 states that it replaces `/` rather than building it from nothing. The parent spec does not contradict this feature spec. | ☑   |

**Blocking:** 8.1, 8.2, 8.4, 8.5. Row 8.3 is a judgement call.

**Evidence:**

- 8.1 `README.md`: a two-sentence description, a Node version floor, the
  three setup commands, a script table, and links to `specs/` and to each of
  the three parent spec documents.
- 8.2 `CLAUDE.md`: links `specs/mission.md`, `specs/tech-stack.md` and
  `specs/roadmap.md`; restates the deadpan clinical voice and its test;
  states the amend-the-spec rule and that a phase's Out list is a prohibition;
  and lists all five rejected dependency categories from the tech stack.
- 8.3 Judgement call, assessed and passed. Both describe the project plainly,
  as developer documentation. Neither addresses a site visitor and neither
  explains why the premise is funny.
- 8.4 Four amendments were made during the phase and all are recorded: the
  three version amendments in section 4 above, and the stale em-dash note in
  plan step 4.3. See also the divergences recorded at the end of this
  document.
- 8.5 `roadmap.md` Phase 0 describes a minimal home page with "Static copy,
  no links" and carries a dated amendment note; Phase 9 states that it
  replaces this page. Re-read 2026-10-09 against what was built: still
  accurate, no further amendment needed.

---

## Merge gate

Phase 0 can merge when:

1. Every blocking row above is ticked with evidence.
2. The resolved-versions table in section 4 has no blank rows.
3. The recorded-run table in section 6 has measured values.
4. `npm run verify` passes from a clean checkout of the branch.
5. Section 7 is fully ticked — nothing from a later phase is present.
6. `/` is a home page a stranger would read as a real clinic's, and it links
   nowhere.

## Divergences from the spec, and what was done about them

Recorded per plan step 11.4. None was worked around silently; each changed a
spec document in the same commit range as the code.

1. **`typescript` is pinned below the resolved latest.** 6.0.3 rather than
   7.0.2, because `typescript-eslint` refuses to load on TS 7 and `lint` is
   blocking. Both the risk table in `requirements.md` and amendment 3 in
   section 4 above were rewritten; the version table records the resolved and
   the pinned value separately.
2. **Tailwind 4 is wired through Turbopack, not PostCSS.** The first amendment
   to the Tailwind risk row predicted `@tailwindcss/postcss`. The Next 16.4
   template uses `@tailwindcss/turbopack` as a `*.css` loader configured in
   `next.config.ts`. The row was corrected once the scaffolder's actual
   output was in hand.
3. **Plan step 4.3 named an em dash that does not exist.** It was written
   against D1's superseded copy. D7's copy has no em dash. The step was
   amended rather than the page, and the UTF-8 pipeline was proved with a
   temporary probe instead — see row 2.5.
4. **`next.config.ts` carries `agentRules: false`, which no spec document
   anticipated.** Next 16 writes an `AGENTS.md` into the repo root on
   `next dev`. It is not in the In-scope list, and regenerating untracked on
   every dev run would fail row 5.5. The flag is the documented way to switch
   it off; the config file carries a comment pointing back at this document.
5. **Prettier reformatted every file under `specs/`.** Plan step 6.4 says to
   run Prettier across the repo, and row 1.6 requires `--check .` to pass, so
   the spec documents were formatted along with the code — table alignment,
   continuation indents, and `*emphasis*` to `_emphasis_`. No rendered output
   changed. The alternative, adding `specs/` to `.prettierignore`, was
   rejected as working around row 1.6 rather than satisfying it.
6. **The lockfile had to be regenerated.** Not a spec divergence but a real
   defect the cold clone caught; recorded in section 6 above.

## Explicitly not validated here

These are not Phase 0's job and their absence is not a failure:

- Any clinic behaviour — the home page is static copy, and there is no form,
  no state, and no database to exercise.
- Whether the premise _lands_ in one screen. D7 establishes the register;
  Phase 9 owns success criterion 1 in [mission.md](../mission.md).
- Visual design or print layout — Phase 10.
- Accessibility beyond what semantic HTML gives for free — Phase 10 runs the
  axe audit.
- Any database round-trip — Phase 1.
- Any Playwright spec — Phase 1 adds the first one.
