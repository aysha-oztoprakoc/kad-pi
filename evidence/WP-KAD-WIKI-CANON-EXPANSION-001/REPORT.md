# WP-KAD-WIKI-CANON-EXPANSION-001 Report

## Verdict

**PASS / CURATED GOVERNED WIKI AND PROJECT-STATE PROJECTION**

## Fixed point

- `0f6063fee324c4ade0a84daac6a70f767157ed37` — `feat(kad): add governed knowledge plane vertical slice`
- Pre-existing dirty paths were preserved and not staged by this workpackage.

## Implemented

- `tools/kad/wiki-projection.mjs` adds an explicit 40-source curated allowlist, source census, source SHA-256 provenance, 15 populated namespaces, typed derived records, status resolution, ADR/evidence indexes, deterministic exact cited queries, stale detection, optional-source quarantine, selective-impact reporting, and link validation.
- `bin/kad-knowledge` now exposes `rebuild`, `health`, `ask`, `status`, `list`, and `show` over the same projection contract. OpenViking and Needle are not imported or required.
- `wiki/generated/kad-canonical/` contains human navigation and machine-readable projection files.
- `docs/contracts/project-state-projection.md` defines the future typed consumer boundary without implementing a backend or UI.

## Deterministic evidence

- 40 canonical sources available in the current worktree; 56 governed records projected.
- Populated namespaces: `PROJECT`, `ARCHITECTURE`, `DECISIONS`, `RESEARCH`, `TECHNOLOGIES`, `EXPERIMENTS`, `MODELS`, `PROVIDERS`, `AGENTS`, `CAPABILITIES`, `SKILLS`, `EVIDENCE`, `FAILURES`, `GLOSSARY`, `ROADMAP`.
- All 56 records carry `source_ref` and a 64-character SHA-256 `source_hash`.
- 42 generated files were byte-identical across two unchanged rebuilds.
- Current projection is `CURRENT`; generated links pass validation.
- `make verify` passed; targeted KnowledgePlane and wiki tests passed 15/15.
- Current status projection is `PARTIAL` with observed `OpenViking=DEGRADED`, `Needle=BLOCKED`, and Qwen local retrieval `DEGRADED`; these states were not flattened to done/not-done.

## Boundaries

Canonical inputs remain authoritative. Generated files are rebuildable derived state. Unknown sources and unauthorized trust domains fail closed. Derived records have no acceptance mutation path. Missing optional inputs are quarantined; required missing inputs produce bounded partial output. No dashboard, backend, public site, new model download, paid spend, authority widening, OpenViking dependency, or Needle authority was introduced.

See the sibling JSON receipts for census, manifests, indexes, status, stale detection, selective rebuild, degradation, trust, CLI, idempotence, and validation evidence.
