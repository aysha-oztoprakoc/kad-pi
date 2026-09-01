# Skill Semantic & Disposition Analysis

**Authority**: `WP-KAD-OMP-METAHARNESS-REFACTOR-041` (analyze-and-recommend only)
**Invariant**: `*_CANDIDATE` dispositions authorize **no** mutation. Executable rationalization is a separate successor WP.

## Layered skill surface (reconciled)

| Layer | Count | Canonical? |
|---|---|---|
| KAD cognitive catalog (ISA-KAD-SKILL-ROLE-002) | 15 | yes |
| `skills-lock.json` pinned (mattpocock/skills + inkboard/system-atlas) | 39 | pinned upstream |
| `.agents/skills/` operational dirs | 49 | includes KAD-local + upstream |
| `LOCAL_DELTA` (expected local adaptation, not defect) | 16 | expected |

## Canonical KAD-local skills (KEEP_CANONICAL)

`workspace-orient`, `workspace-pick-work`, `workspace-finish`, `workspace-handoff`, `workspace-doctor`, `skill-governance`, `kad-wiki`, `kad-advisory-board`, `kad-evidence-gate`, `human-runbook`, `5-persona-advisory-board`, `system-atlas`, `wayfinder` (KAD overlay).

## Overlap clusters → disposition

| Cluster | Skills | Disposition |
|---|---|---|
| Handoff | `handoff`, `claude-handoff`, `workspace-handoff` | `MERGE_CANDIDATE` (workspace-handoff = canonical; others upstream mirrors) |
| Grilling | `grilling`, `grill-me`, `grill-with-docs` | `WRAPPER` / `ALIAS_CANDIDATE` around `grilling` |
| Router | `ask-matt`, `wayfinder`, `triage`, `to-spec`, `to-tickets` | `KEEP_CANONICAL` (distinct lifecycle roles); `ask-matt` = `EXTERNAL_REFERENCE` |
| Implement | `implement`, `implement-spec`, `codebase-design` | `KEEP_CANONICAL` (`implement`) + `KEEP_SPECIALIZED` |
| Review | `code-review`, `improve-codebase-architecture` | `KEEP_SPECIALIZED` (standards vs architecture axes) |
| Writing/teaching | `teach`, `writing-beats`, `writing-fragments`, `writing-shape`, `writing-for-agents` | `COMPOSE` (upstream family) |

## Deterministic-tooling migration candidates

Skills whose mechanics are better encoded as deterministic tools (per PRIME_DIRECTIVE "HOW EXACTLY → tools"): `to-tickets` (workctl import), `triage` (label classification), `to-spec` (schema generation), `skill-governance` (already `bin/workctl skills doctor`).

## Dual-lockfile finding

`skills-lock.json` (root, newer) vs `.agents/workspace/skills.lock.json` (referenced by skill-governance). **Recommendation**: root is canonical; reconcile workspace lockfile during successor WP. No mutation authorized here.

## Conformance (PON/STC/TDD/GD)

- **PON**: no typed notification bus (poll/read in `control-plane-runtime.mjs`) → routed to WP-019.
- **STC**: `role-contract.mjs` + `workload-contract.mjs` enforce scope/effect declaration → conforms.
- **TDD**: 70+ test files in `tools/kad/test/` → conforms.
- **GD**: OpenViking adapter fallback-to-exact on stale/unavailable; Qwen endpoint already DEGRADED → conforms; no consolidated degradation matrix (note for successor).

## Backlog for successor

`PROPOSE_SUCCESSOR_WP`: `WP-KAD-SKILL-RATIONALIZATION-*` (unallocated until namespace scan). Input = this analysis + semantic graph + dependency graph.
