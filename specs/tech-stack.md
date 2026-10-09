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

## Scaffold migration note

The repo currently holds a bare `tsc` + `src/index.ts` hello-world. Phase 0
replaces it with the Next.js scaffold. Two carry-overs: keep `strict: true`,
and add `/dist` and `/.next` to `.gitignore` (`/dist` is the `outDir` today
and is **not** currently ignored).
