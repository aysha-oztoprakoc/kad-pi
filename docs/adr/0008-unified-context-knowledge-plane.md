# 0008. Unified Context and Knowledge Plane

## Status

Accepted

## Date

2026-08-29

## Epistemic class

`DESIGN_DECISION`

## Context

KAD-PI currently has a deterministic Librarian and durable wiki artifacts, while OMP owns volatile conversational context. The roadmap now requires a unified project knowledge plane without allowing retrieval, summaries, embeddings, or memories to become an authority layer. It also requires bounded local specialists and explicit context-economy controls.

## Decision

1. Define a KAD-owned `KnowledgePlane` boundary. OpenViking is an experimental adapter substrate behind that boundary, not the KAD control plane.
2. Keep repository artifacts, PRIME_DIRECTIVE, accepted ADRs/specifications, tests, evidence receipts, and human-authored canonical material as durable sources of truth.
3. Treat indexes, embeddings, L0/L1/L2 summaries, retrieval caches, context packets, memory candidates, and wiki projections as rebuildable derived state. Rebuilding or losing derived state must not mutate or destroy canonical sources.
4. Preserve the deterministic Librarian as exact lookup, bootstrap import, integrity verification, and fallback retrieval. Semantic retrieval is optional and must degrade to deterministic paths.
5. Separate OMP volatile working memory from KAD durable semantic knowledge. Compaction, snapcompact, handoff, and live context maintenance must not promote memory into accepted knowledge.
6. Classify extracted memories as proposed or inferred until KAD validation and corroboration accepts or rejects them. No component may self-promote an inference.
7. Add Needle 2 as an experimental tiny-specialist tier for bounded classification, extraction, routing, and schema mapping. Grammar validity and confidence are routing evidence, never epistemic authority; malformed or low-confidence output escalates to a qualified fallback.
8. Compile agent context through identity, role, capability, trust-domain, task, authority, and resource-budget policy filters. Agents do not receive the entire knowledge database by default.
9. Use notifications for bounded reactions where existing seams do not already provide equivalent behavior. Every long-lived service or job must have an explicit STC owner, lifecycle, cancellation, cleanup, and recovery path.
10. Treat OpenViking, Needle 2, and the five-persona advisory board as direct experimental dependencies. Lumina, NVIDIA Switchyard, and TLDR Radio remain inspiration/reference only and do not enter the KAD control path.

## Consequences

### Positive

- Semantic retrieval can improve context efficiency without becoming authoritative.
- Exact source recovery remains available when indexes, embeddings, or services fail.
- Agent context is bounded and policy-filtered by construction.
- Tiny specialist experiments can be evaluated independently of general local models.
- Wiki and memory projections can be rebuilt from durable artifacts.

### Costs and constraints

- Every derived representation needs provenance, source hashes or references, and a rebuild path.
- OpenViking integration requires an adapter contract and failure-injection gates before adoption.
- Memory acceptance, trust-domain filtering, and context compilation require explicit deterministic tests.
- No roadmap item may claim OpenViking, Needle, or advisory-board runtime success before a live, reproducible observation exists.

## Non-decisions

- OpenViking is not the source of truth and does not own KAD authority.
- Auto-memory is not accepted knowledge.
- Needle does not replace general local models or make semantic decisions authoritative.
- OMP compaction is not a promotion mechanism.
- The advisory board produces advisory output only; it cannot accept evidence, grant authority, or change routing policy.
- Failure does not enable PAYG, an oracle, new permissions, a broader trust domain, or an unqualified model.

## Verification gates

The next work packages must begin RED and prove at least:

- retrieval cannot cross trust domains;
- derived memory cannot self-promote;
- stale or unavailable semantic indexes fall back to exact retrieval;
- reindexing does not mutate canonical sources;
- malformed or low-confidence Needle output escalates safely;
- wiki projections preserve provenance;
- compaction does not promote memory;
- context compilation returns only authorized bounded context;
- all failed capabilities reduce or remove capability without widening authority.

This ADR records architecture, not implementation or runtime evidence. Acceptance of any future integration requires separate evidence receipts.
