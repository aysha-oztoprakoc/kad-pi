# Code review

Fixed point: `0f6063f`.

## Standards

The review found and the controller repaired: `project.json` was colliding with the PROJECT namespace file; ask retrieval now filters every record by trust domain; projection read reuses one deterministic KnowledgePlane instance; evidence commit extraction now requires an explicit commit/fixed-point label. Path and hash handling remains bounded and canonical.

## Spec

The review found and the controller repaired: required missing sources remain stable `PARTIAL` rather than falsely `STALE`; optional missing sources are quarantined without making the remaining projection partial; unknown `ask` and `show` CLI operations return nonzero; every status component includes `degraded_capabilities`.

## Remaining judgement

The curated allowlist intentionally includes a small, explicit set of accepted ADRs, reports, registries, agents, capability, skills, architecture, research, experiment, roadmap, and failure artifacts. It excludes generated projections and unrelated application trees. Optional current-worktree sources are explicitly marked optional and are quarantined when unavailable.

Review status: PASS after repairs; no authority inversion, semantic-backend dependency, public-surface implementation, or source mutation observed.
