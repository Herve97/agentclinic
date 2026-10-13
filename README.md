# AgenticClinic

AgenticClinic is a satirical website built as an outpatient mental health
clinic whose patients are AI agents and whose case notes are really about the
humans operating them. It is also a worked example of spec-driven development:
`specs/` is written before the code, and every phase of the build traces back
to it.

## Setup

Requires Node.js 22.22.2 or newer (24.15+ or 26+ also work).

```sh
git clone <repository-url> agentClinic
cd agentClinic
npm install
npm run dev
```

`http://localhost:3000` serves the clinic home page, and `/intake` takes a
six-field intake: presenting complaint, duration, requirement revisions, prior
episodes, what the human said, and what the human meant. No `.env` file and
no credentials are needed: the database is a local SQLite file at `local.db`,
created and migrated automatically before `dev` and `build`. Nothing beyond
`npm install` touches the network.

Set `DATABASE_URL` to point somewhere else; leaving it unset means
`file:local.db`.

### Running the end-to-end spec

One extra step, needed only for the Playwright spec and not for running the
app:

```sh
npx playwright install chromium
npm run test:e2e
```

## Scripts

| Command               | Does                                                      |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Migrate, then development server on port 3000             |
| `npm run build`       | Migrate, then production build                            |
| `npm start`           | Serve a production build                                  |
| `npm run lint`        | ESLint                                                    |
| `npm run format`      | Prettier, writing in place                                |
| `npm run test`        | Vitest, single run                                        |
| `npm run test:e2e`    | Playwright; needs `playwright install` once               |
| `npm run db:generate` | Generate a migration from `src/db/schema.ts`              |
| `npm run db:migrate`  | Apply pending migrations                                  |
| `npm run verify`      | `lint` → `build` → `test`; the gate every phase must pass |
| `npm run verify:all`  | `verify`, then the end-to-end spec                        |

## Specs

[`specs/`](./specs) is the source of truth, not this README.

- [`specs/mission.md`](./specs/mission.md) — what the project is, who it is
  for, and the voice every piece of copy obeys.
- [`specs/tech-stack.md`](./specs/tech-stack.md) — the stack, the reasoning,
  and what was explicitly rejected.
- [`specs/roadmap.md`](./specs/roadmap.md) — the phases, in order, each with
  its own done-when condition.
- Per-phase specs live in dated directories, for example
  [`specs/2026-10-09-phase-0-scaffold/`](./specs/2026-10-09-phase-0-scaffold).

Contributions amend the relevant spec in the same change as the code. A spec
that no longer describes the repository is a defect.
