# Tech stack

Server-side TypeScript throughout. The framework choice was delegated; the
recommendation and its reasoning are recorded below so it can be argued with
later.

## Recommendation: Next.js (App Router)

| Concern       | Choice                                  |
| ------------- | --------------------------------------- |
| Language      | TypeScript, `strict: true`              |
| Runtime       | Node.js (current LTS)                   |
| Framework     | **Next.js, App Router**                 |
| Rendering     | Server Components by default            |
| Mutations     | Server Actions (intake form POST)       |
| Styling       | Tailwind CSS                            |
| Content       | MDX files in-repo for authored content  |
| Database      | SQLite via libSQL (`@libsql/client`)    |
| Query layer   | Drizzle ORM + `drizzle-kit` migrations  |
| Validation    | Zod (shared form + DB schema)           |
| Unit tests    | Vitest                                  |
| E2E tests     | Playwright (added at Phase 1, one spec) |
| Lint / format | ESLint + Prettier                       |
| Hosting       | Vercel                                  |
| Prod database | Turso (hosted libSQL)                   |

Pin versions at install time rather than from this document — resolve each
with `npm view <pkg> version` and record what actually landed in
`package.json`. Do not trust version numbers written in prose, here or
anywhere else in `specs/`.

### Why Next.js

- The product is a **content site with one write path**. Server Components
  render authored clinical documents with no client JS; a single Server Action
  handles intake. That is the shape Next.js is best at.
- **Server-side TypeScript end to end** — the Zod schema that validates the
  intake form is the same one the database layer uses, in the same process,
  with no API boundary to keep in sync.
- Print-quality case files and discharge summaries need real control over
  server-rendered HTML and CSS. Server Components give that directly.
- It is the least surprising choice for anyone who joins the project.

### Why libSQL/Turso rather than plain SQLite or Postgres

Vercel's filesystem is ephemeral, so a `.db` file on disk will not survive in
production. libSQL keeps the SQLite ergonomics and the same client for both
environments: a local file in development, a hosted Turso database in
production, one driver, one dialect, no code difference. Postgres would work
but is more operational weight than a satirical content site with one table
needs.

### Runner-up: Astro

Astro was the close second and is the right call if the project drifts toward
being almost entirely authored content with no database. Its content
collections map beautifully onto patient profiles and session transcripts, and
it ships even less client JS. We chose Next.js because intake writes to a
database in Phase 1 and the dynamic surface (cases, waiting room, discharge)
is expected to grow. **If by Phase 8 the database still holds one table, this
decision is worth revisiting.**

### Explicitly rejected

- **MCP server / agent-callable API** — ruled out by
  [mission.md](./mission.md) non-goals. No `@modelcontextprotocol/sdk`.
- **Auth libraries** — intake is anonymous. No NextAuth, no Clerk.
- **Client state managers** — Server Components plus form state cover it. No
  Redux, Zustand, or React Query.
- **Component libraries** — the clinical aesthetic is plain, dense, and
  form-driven. Hand-written components on Tailwind; no shadcn/ui, no MUI.
- **An LLM at runtime** — content is authored, not generated. No AI SDK.

## Conventions

- `src/app/` routes, `src/content/` MDX, `src/db/` schema and client,
  `src/domain/` types and pure logic.
- Pure logic stays out of components so it can be unit-tested without a
  renderer.
- One Zod schema per entity, exported from `src/domain/`, used by both the
  form and the database layer.
- No secrets in the repo. `.env.local` for development; Vercel environment
  variables in production.

### Security advisories are taken on their own branch

Added 2026-10-28 by Phase 6, which lost time to one. A published advisory
against a pinned dependency is a version bump, not phase work, and a phase that
absorbs one stops being reviewable as the thing it set out to be: its diff
carries a lockfile churn nobody asked it to review, and the bump cannot be
merged ahead of the phase that happens to contain it.

So the bump is taken on a branch of its own, named for the advisory rather than
for a phase, holding the version change and nothing else, and it merges on its
own schedule. The phase in progress records the advisory in its validation
section — what it cost, which commands it aborted — and keeps the old pin.

`next-security-upgrade` is the first of these: Next 16.4.0 to 16.4.3, one
commit, branched from `main` once Phase 6 had merged. It was first cut from
`phase-5-waiting-room` and re-cut from `main` rather than merged into a phase
in progress, which is the convention above working as intended.

Next 16.4.0's advisory aborts both `next build` and Playwright's `webServer`
non-zero, periodically rather than once, after the work they were asked to do
has already succeeded. A `verify:all` run on the old pin therefore needs
retrying — Phase 6's review took seven attempts — and its exit code has to be
read unpiped, because a pipeline reports the last command's status and not
npm's. On 16.4.3, `npm run verify:all` exits 0 on the first attempt with no
`SecurityFatalError` in the output, which is what this branch is for. The
advisories it closes are three: unauthenticated remote code execution in the
image optimization API, denial of service in the App Router's Server Actions,
and unauthenticated remote code execution in `use cache`.

### How the MDX line is implemented

Added 2026-10-27 by Phase 6, which was the first phase to need it. The table
above says "MDX files in-repo" without saying how one becomes a page, and the
next person to add a content type should not have to re-derive this.

Authored content lives in `src/content/<collection>/` as `.mdx` files and is
read by one impure module per collection, which compiles each file with
**`next-mdx-remote`** (its React Server Components entry point) and
**`remark-gfm`**, and validates the frontmatter against a Zod schema in
`src/domain/`. Compilation happens at build time from files in the repository,
so nothing is fetched and the offline constraint in
[mission.md](./mission.md) holds.

**`@next/mdx` with `pageExtensions` was rejected.** It makes each `.mdx` file a
route by putting it in `src/app/`, which contradicts the `src/content/`
convention in the list above, leaves an index page with no list of files to enumerate, and
makes frontmatter a module export rather than data — so a typo in it is a
missing heading on a published page rather than a failed build. `@mdx-js/mdx`
plus `gray-matter` directly was also rejected: that is what `next-mdx-remote`
already is, with the RSC plumbing written.

See decision D2 of
[2026-10-27-phase-6-patient-profiles/requirements.md](./2026-10-27-phase-6-patient-profiles/requirements.md).

## Scaffold migration note

The repo currently holds a bare `tsc` + `src/index.ts` hello-world. Phase 0
replaces it with the Next.js scaffold. Two carry-overs: keep `strict: true`,
and add `/dist` and `/.next` to `.gitignore` (`/dist` is the `outDir` today
and is **not** currently ignored).
