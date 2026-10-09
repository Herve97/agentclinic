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

`http://localhost:3000` serves the clinic home page. No `.env` file, no
credentials, and no database are needed — nothing beyond `npm install` touches
the network.

## Scripts

| Command          | Does                                                      |
| ---------------- | --------------------------------------------------------- |
| `npm run dev`    | Development server on port 3000                           |
| `npm run build`  | Production build                                          |
| `npm start`      | Serve a production build                                  |
| `npm run lint`   | ESLint                                                    |
| `npm run format` | Prettier, writing in place                                |
| `npm run test`   | Vitest, single run                                        |
| `npm run verify` | `lint` → `build` → `test`; the gate every phase must pass |

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
