# CLAUDE.md

Guidance for agent sessions working in this repository.

## Read the specs first

`specs/` is the source of truth. Read these before changing anything:

- [`specs/mission.md`](./specs/mission.md) — what the project is, its two
  audiences, the non-goals, and the voice constraint.
- [`specs/tech-stack.md`](./specs/tech-stack.md) — the stack, the reasoning
  behind each choice, and the rejected list.
- [`specs/roadmap.md`](./specs/roadmap.md) — the phases in order. Each states
  a goal, a done-when condition, and an Out list.

Per-phase specs live in dated directories such as
`specs/2026-10-09-phase-0-scaffold/`, each holding `requirements.md` (scope and
numbered decisions), `plan.md` (ordered task groups), and `validation.md`
(how to know the phase is done).

## The voice constraint

Every piece of site copy is deadpan clinical. Write as a clinician writing for
a chart, not for a reader. Clinical register throughout; quantify absurd things
precisely. Never wink — no exclamation marks, no self-aware asides, no jokes
about the joke. The clinic takes its patients seriously and is sincerely on
their side; sympathy is expressed through thoroughness, not warmth.

The test: could this text appear verbatim in a real chart if the subject matter
were swapped? If not, rewrite it. `specs/mission.md` has the full statement.

## Amend the spec, do not diverge from it

If reality differs from the spec, change the spec in the same commit range as
the code, and record why. Superseded decisions are kept and marked superseded
rather than deleted — the amendment trail is teaching material for the course
students named in `specs/mission.md`. Quietly building something the spec does
not describe is the one failure mode this repository exists to demonstrate
against.

A phase's Out list is a prohibition, not a deferral. Do not pull later phases
forward because they would be convenient now.

## Forbidden dependencies

From the rejected list in `specs/tech-stack.md`. These are not "not yet" —
they are decisions already taken:

- **No MCP server or agent-callable API.** No `@modelcontextprotocol/sdk`.
  Agents are the subject matter, not the users.
- **No auth libraries.** Intake is anonymous. No NextAuth, no Clerk.
- **No client state managers.** Server Components plus form state cover it. No
  Redux, Zustand, or React Query.
- **No component libraries.** The clinical aesthetic is plain, dense, and
  form-driven. Hand-written components on Tailwind; no shadcn/ui, no MUI.
- **No LLM at runtime.** Content is authored, not generated. No AI SDK.

Adding one of these requires amending `specs/tech-stack.md` first, with
reasoning, as an explicit decision.

## Constraints that outlive any one phase

- **Demos must run offline.** Nothing may require a live third-party API, a
  hosted database, or a network call to work locally. No web font fetched at
  render time.
- **Setup must be short.** Clone, install, one command, running. Anything that
  needs a credential or a manual step before `/` renders is a bug.
- **Every screen must be safe to project.** Nothing unreviewed reaches a
  public route.

## Verification

`npm run verify` chains `lint` → `build` → `test`. Every phase leaves it
passing. Pin dependency versions exactly — no `^` or `~` — and resolve each
with `npm view <pkg> version` rather than from any document, including this
one.
