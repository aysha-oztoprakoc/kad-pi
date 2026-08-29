# KAD-PI Project-State Projection Contract

This contract describes the deterministic, derived boundary for future docs, a typed backend, a public site, or an operational dashboard. It is not an authority layer and does not authorize a frontend or backend implementation.

## Inputs and refresh

`CuratedKnowledgeProjection` reads only the explicit `CURATED_SOURCE_ALLOWLIST` in `tools/kad/wiki-projection.mjs`. Every accepted input is a canonical repository artifact with a `source_ref`, SHA-256 `source_hash`, source class, trust domain, acceptance state, and privacy classification. `kad-knowledge rebuild` deterministically regenerates the projection. Unchanged inputs produce byte-identical output. An unrelated path does not trigger a rebuild; an input hash change makes the existing projection `STALE` until rebuilt.

Missing optional inputs are `QUARANTINED` and leave the remaining records usable. Missing required inputs produce `PARTIAL` output. The projection never mutates canonical inputs.

## Stable machine projections

The generated directory `wiki/generated/kad-canonical/` exposes:

- `project-state.json`: complete bounded state, records, populated namespaces, source census, and quarantine list.
- `project.json`: compact project identity, counts, status, and source hashes.
- `status.json`: component state, evidence reference, source hash, blocker, and degraded capability fields.
- `adr-index.json`: decision id, title, status, path, date, and supersession relationships.
- `evidence-index.json`: workpackage, verdict, report path, commit when observed, and remaining blockers.
- `source-census.json`, `source-allowlist.json`, `source-hashes.json`: explicit input governance and integrity material.
- `namespace-manifest.json`: populated namespace-to-record identity map.
- `namespaces/<namespace>.json` and `namespaces/<namespace>.md`: typed records and human navigation for each populated namespace.

Consumers MUST treat all fields as derived. A record is displayable only when it carries both `source_ref` and `source_hash`. Consumers MUST NOT infer authority, acceptance, privacy, or status from missing fields.

## Status semantics

`ACCEPTED` describes accepted source state; `PASS` describes an observed successful capability or projection; `PARTIAL` describes bounded incomplete coverage; `DEGRADED` describes a reduced capability; `BLOCKED` describes an evidence or qualification gate; `EXPERIMENTAL` describes a tested hypothesis or experiment; `FILE_ONLY` describes a declared artifact without runtime qualification; `LOADABLE` describes a loadable registry resource; `QUALIFIED` describes an explicitly qualified capability; `SUPERSEDED` describes historical state; `UNKNOWN` means no deterministic evidence supports a stronger claim; `STALE` means source hashes no longer match the projection; `QUARANTINED` means an unavailable optional source was excluded.

Status is derived from explicit report verdicts, structured registry qualification state, or curated component evidence. Prose optimism is not a status source.

## Degradation and trust

Exact deterministic retrieval and projection do not require OpenViking or Needle. Optional semantic or specialist adapters may provide proposals only. Backend failure reduces capability to exact deterministic behavior; it cannot widen trust or acceptance authority. Trust-domain mismatches and unknown sources fail closed through the existing KnowledgePlane contract.

`INTERNAL` is the default privacy boundary. `PUBLIC_CANDIDATE` is not assigned automatically. `SENSITIVE` and `UNKNOWN` must not be published without a separate policy and evidence gate.

## Consumer boundary

Future software should consume these JSON projections or an equivalent typed adapter. It should not parse arbitrary repository Markdown, generated wiki prose, semantic indexes, or model output to invent project state. Canonical sources remain the source of truth; this directory is a rebuildable navigation and state cache.
