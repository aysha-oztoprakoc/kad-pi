# KAD-PI

## Governed local AI research, with receipts

KAD-PI is a local-first experimental platform for agent harnesses, deterministic
knowledge, and bounded AI capability. Models can propose. Evidence, policy, and
validation decide what becomes trusted state.

> **Build from scratch, not from zero.**
> **Real data, not dashboard theater.**
> **Public is a sanitized projection, not an internal mirror.**

`NOTIFY, DON'T POLL.` · `DECLARE, DON'T REACH.` · `TEST, DON'T CLAIM.`
`DEGRADE, DON'T ESCALATE AUTHORITY.` · `RECORD, DON'T GUESS.`

## Current state

The current governed projection is **PARTIAL**. KnowledgePlane exact retrieval
is available; OpenViking is **DEGRADED**, Needle is **BLOCKED**, and local model
qualification remains mixed. These are evidence-derived states, not manually
maintained badges.

Query the projection:

```bash
bin/kad-knowledge health
bin/kad-knowledge status
bin/kad-knowledge ask "What owns authority in KAD-PI?"
bin/kad-knowledge list MODELS
bin/kad-knowledge show model:qwen-local
```

## Architecture

```text
canonical sources + evidence
            ↓
       KnowledgePlane
            ↓
 deterministic projections
            ↓
 PON / STC orchestration and policy
            ↓
 local + remote capabilities
            ↓
 GitHub · public brief · local dashboard
```

The interface layer displays governed state; it does not create authority.
Probabilistic model output remains a proposal until a deterministic boundary
accepts it. Derived indexes, summaries, and wiki projections are rebuildable
and never replace canonical artifacts.

## Three interfaces, three audiences

- **[GitHub landing](README.md)** — agent and developer navigation into authority,
  current state, architecture, evidence, and runnable checks.
- **[Public explanatory site](site/index.html)** — a static, sanitized human
  explanation of KAD-PI, its research, and its current boundaries.
- **[Local operational dashboard](dashboard/index.html)** — a read-only view of
  generated project state plus one bounded live runtime observation. It has no
  mutation controls and no invented telemetry.

Serve the public static site with any static server:

```bash
python3 -m http.server 4173
# public site:  http://127.0.0.1:4173/site/
# static dashboard: http://127.0.0.1:4173/dashboard/
```

Serve the dashboard with its localhost-only live status API:

```bash
bin/kad-interface-server
# dashboard: http://127.0.0.1:4173/dashboard/
```

The live API observes the approved Stheno WORLD runtime using `GET /v1/models`.
It is read-only, bounded, and independent from the public site.

Rebuild the public projection after rebuilding canonical wiki state:

```bash
bin/kad-knowledge rebuild
bin/kad-publication build
```

The public site receives `site/generated/public-state.json`, a fail-closed
projection. It does not read `wiki/generated/kad-canonical/project-state.json`
directly. Internal, sensitive, unknown, and unapproved candidate records are
excluded.

## Canonical navigation

Start with these sources; generated state is derived:

- [PRIME_DIRECTIVE.md](PRIME_DIRECTIVE.md) — normative constitution and
  PON/STC/TDD/graceful-degradation rules.
- [CONTEXT.md](CONTEXT.md) — project domain language.
- [Accepted ADRs](docs/adr/) — architecture decisions.
- [Generated canonical wiki](wiki/generated/kad-canonical/index.md) — cited,
  provenance-bearing navigation and machine-readable projections.
- [Project-state contract](docs/contracts/project-state-projection.md) —
  stable consumer boundary.
- [Evidence](evidence/) — receipts, reports, hashes, and validation results.
- [Local model registry](config/local-models.registry.json) — declared model
  identities and qualification states.
- [.agents/agents](.agents/agents/) and [.agents/skills](.agents/skills/) —
  bounded role and skill declarations.
- [Roadmap](wiki/KAD_Context_Knowledge_Plane_Roadmap_2026-08-29.md) — current
  sequencing and unresolved work.

## Repository map

```text
PRIME_DIRECTIVE.md          normative authority
CONTEXT.md                  ubiquitous language
docs/adr/                   accepted design decisions
tools/kad/                  KnowledgePlane, projections, and tests
bin/kad-*                   deterministic operator commands
wiki/generated/             rebuildable governed projections
site/                       public static explanatory surface
dashboard/                  private/local read-only surface
interface/                  shared KAD design tokens and UI utilities
evidence/                   durable workpackage receipts
kad-lab/                    deterministic simulation experiments
.agents/                    agent, capability, and skill declarations
```

## Doctrines

### PON — notification-oriented causality

Relevant state changes produce bounded notifications. Causal relationships
remain explicit; notification does not imply nondeterministic execution.

### STC — spatiotemporal composability

Components declare coeffects and capabilities. Managed effects register
inverses, and lifecycle teardown follows tracked ownership.

### TDD — executable evidence

The default loop is RED → minimum GREEN → REFACTOR → VERIFY. Tests prove
observable behavior at seams rather than implementation details.

### Graceful degradation

Failure reduces only the affected capability and preserves the safest useful
path. It never widens authority, trust, permissions, provider access, or spend.

## Quickstart and verification

```bash
# Verify the Librarian's deterministic source catalog
node tools/librarian/librarian.mjs verify

# Build the sanitized public projection
bin/kad-publication build

# Run the repository gate and tests
make verify
make test
```

The dashboard keeps the governed projection static and adds one localhost-only
read-only runtime status endpoint. The endpoint cannot mutate KAD authority,
control the runtime, execute commands, or expose data to the public site.

## What is not claimed

KAD-PI is not presented as autonomous AGI, a self-learning authority, a
production swarm, or a finished semantic platform. OpenViking and Needle are
optional experimental adapters. Unknown stays unknown; experimental stays
experimental.

## Contributing

Read the directive, context, accepted ADRs, and relevant evidence before
mutation. Keep workpackages bounded. Preserve unrelated worktree changes.
Record consequential observations under `evidence/`, and run the applicable
deterministic verifier before claiming completion.
