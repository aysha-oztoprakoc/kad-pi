---
kad_id: kad-841db1a378d9c7ddbcc45812
title: KAD Research Workflow Implementation Roadmap 2026-08-29
type: roadmap
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: true
train_eligible: false
publish: false
temporal_status: CURRENT
legacy_source: wiki/KAD_Research_Workflow_Implementation_Roadmap_2026-08-29.md
---

# KAD Research Workflow Implementation Roadmap

## Verdict
**ROADMAP_READY**

Architecture and roadmap are sufficient for implementation. The four original tickets are preserved with minor staging revisions, and one new bounded ticket (Zotero Local API) has been added to Horizon B to satisfy the new architectural resolution.

## Repository Baseline
- `PRIME_DIRECTIVE.md` establishes deterministic execution, STC/PON boundaries, and degraded capability management.
- KAD `KnowledgePlane` handles synthetic corpus data today (JSON/JSONL catalogs); this roadmap will reuse those patterns for canonical research persistence.
- `workctl` coordinates work but MUST NOT assume authority over the research corpus itself.
- Derived state (OpenViking, summaries) must remain rebuildable and non-authoritative.

## Architecture Review
- **D1 (Literature Source Boundary)**: PRESERVED. Zotero owns the human-facing workspace; KAD owns canonical identifiers, hashes, and provenance.
- **D2 (Research Ingestion Contract)**: PRESERVED. Layered `ResearchCandidate` → `ResearchSource` → `ResearchDocument`.
- **D3 (OpenViking Boundary)**: PRESERVED. Derived L0/L1/L2 context mirrors with direct tracing to canonical KAD identity.
- **D4 (Deterministic Ingestion Surface)**: PRESERVED. Flat reusable API and a thin `kad-knowledge research ...` CLI namespace.
- **D5 (Provider Capability Model)**: PRESERVED. Independent capability states, economics isolated from availability observations.
- **D6 (Graceful Degradation)**: PRESERVED. Explicit fallbacks without implicit paid API escalation.
- **Contradictions found**: None that undermine D1-D6. Only implementation staging regarding Zotero required resolution (D7).

## New Wayfinder Decisions
- **D7 (Zotero Local Integration Boundary)**: AUTHOR_DECLARED. Staged read-only Zotero Local HTTP API adapter (`localhost:23119/api/`) will be built in Horizon B.2 after the canonical API and export/manifest flows (Horizon B.1) are GREEN. Standard CSV/RIS exports remain the permanent degraded baseline.

## Current Ticket Review

| Ticket | Verdict | Reason | Proposed action |
| --- | --- | --- | --- |
| **T1 Canonical API/Persistence** | **KEEP** | Establishes baseline deterministic identity, hashes, and files without coupling to external services. | Run as foundational WAVE 1. |
| **T2 Operator/Manifests** | **KEEP** | Standard exports (RIS/CSV) and local PDFs via CLI represent the essential free/manual baseline. | Run in WAVE 2 (Horizon B.1). |
| **T3 Capabilities/Degradation** | **KEEP** | Cohesive capability tracking is necessary for correct fallback and degradation behaviors in downstream components. | Run in WAVE 2 (Horizon B.1) alongside CLI. |
| **T4 OpenViking Context** | **KEEP** | Derived context adapter correctly relies on T1 for truth and T3 for degradation machinery. | Run in WAVE 4 (Horizon C) after free workflow is solid. |
| **T5 Zotero Local Adapter** | **NEW** | Resolves D7 decision for a read-only HTTP API sync without SQLite direct reads or writes. | Create new ticket to run as WAVE 3 (Horizon B.2). |

## Dependency Graph

```text
       T1 (Canonical API/Persistence)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 T2 (Operator/CLI)       T3 (Capabilities/Degradation)
         │                       │
         ├───────────────────────┤
         ▼                       ▼
 T5 (Zotero API)         T4 (OpenViking Context)
```

## Implementation Roadmap (Waves)

### WAVE 1: Canonical Corpus Foundation (Horizon A)
- **Ticket**: `WP-KAD-RESEARCH-API-001`
- **Goal**: Deterministic identity, normalization, hashes, duplicate rejection, and canonical JSON/JSONL persistence.
- **Acceptance Gate A**: Canonical authority GREEN. Idempotent import of a manual fixture succeeds without duplicates; invalid artifacts are deterministically rejected.

### WAVE 2: Operator Workflow & Degradation (Horizon B.1)
- **Tickets**: `WP-KAD-RESEARCH-CLI-002`, `WP-KAD-RESEARCH-CAPABILITIES-003`
- **Goal**: CLI namespace, offline manifests, static capability profiles, missing/stale degradation testing.
- **Acceptance Gate B.1**: End-to-end manifest and local CSV/RIS import GREEN without any provider credentials. 

### WAVE 3: Zotero Local API Sync (Horizon B.2)
- **Ticket**: `WP-KAD-RESEARCH-ZOTERO-005` (To be created)
- **Goal**: Read-only `localhost:23119/api/` integration.
- **Acceptance Gate B.2**: ResearchCandidate metadata and attachment references sync through the canonical API without corrupting existing IDs. Absence of Zotero falls back safely to export flows.

### WAVE 4: Context-Optimized Corpus (Horizon C)
- **Ticket**: `WP-KAD-RESEARCH-OPENVIKING-004`
- **Goal**: Derived OpenViking L0/L1/L2 bound to canonical source ID.
- **Acceptance Gate C**: Derived state completely rebuildable from canonical sources. Missing OpenViking index falls back to exact KAD Librarian lookup.

## Free-First End-to-End Path
```text
Manual CSV/RIS export OR Zotero local HTTP fetch
                        ↓
    kad-knowledge research import (CLI/Manifests)
                        ↓
     Canonical KAD API validation & deduplication
                        ↓
 ResearchCandidate → ResearchSource (hash) → ResearchDocument (ID)
                        ↓
    Deterministic JSON/JSONL KnowledgePlane persistence
```

## Scale-Up Path
Consensus Pro and Elicit Plus capabilities belong in Horizon F. They will be defined strictly via T3 Capability Manifests. When enabled, they emit standard `ResearchCandidate` objects that pass through the exact same canonical KAD API validator as free/manual flows. Scaling up affects throughput, context richness, and automation speed, but MUST NEVER alter architectural ownership or bypass identity validation.

## Acceptance Gates
- **Authority Gate**: Duplicate imports must return idempotently without mutating or duplicating the originally stored canonical artifact.
- **Context Gate**: OpenViking must be completely deletable and rebuildable from foundational canonical sources.
- **Degradation Gate**: Zotero API unavailability MUST fallback gracefully to accepting a standard export file without crashing or blocking ingestion.

## Parallelism Plan
- **Serial phase**: T1 must be completed first to establish data types and persistence.
- **Parallel phase**: T2 and T3 can be built independently once T1 is GREEN.
- **Follow-up phase**: T4 and T5 are unblocked by the completion of T2 and T3.

## Failure / Graceful Degradation Plan
- **Provider Stale/Offline**: Capability Profile state shifts to DEGRADED/OFFLINE. Fallback routing invokes manual/free CSV/RIS import.
- **OpenViking Unavailable**: Derived L0/L1/L2 access drops; retrieval queries use standard Librarian exact-match paths.

## Security / Privacy Gates
- Path validation MUST strictly bound local PDF acquisitions to prevent symlink escapes.
- Unverified provider metadata cannot bypass candidate validation into canonical Document records.
- Remote uploads of canonical source material are expressly blocked in Horizons A-C.

## TOKENMAXXING Review
The roadmap respects TOKENMAXXING by prioritizing local deterministic validation and free tools first. SLOPMAXXING risks—such as automatic LLM literature reviews, uncontrolled model scraping, and duplicate paper vector embeddings—are mitigated by grounding all retrieval in explicit, hashed `ResearchDocument` records before any L2 derivation or AI summarization is permitted.

## Research Fog
- **COMMITTED**: T1, T2, T3, T4 (From spec) + T5 (Zotero API).
- **PLANNED**: Free workflow integration across varied repositories (Horizon E).
- **DEFERRED**: Optional paid scale-up APIs like Consensus Pro / Elicit Plus (Horizon F).
- **UNKNOWN / FOG**: Needle extraction, contradiction graphs, context compilation, full distillation, and automated claims extraction (Horizon G).

## Proposed Workctl Changes
1. Retain T1-T4. Mark T1 (`WP-KAD-RESEARCH-API-001`) as READY. 
2. Create new ticket: `WP-KAD-RESEARCH-ZOTERO-005` (Blocked by T2, T3) for Horizon B.2.
*(No execution mutation has been performed in this session)*

## Evidence
- Architecture constraints D1-D6 established via `.scratch/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/spec.md`.
- D7 (Zotero Integration) resolution captured in `issues/08-zotero-local-integration.md` and indexed in the Wayfinder map.

## Recommended Next Bounded Execution
`WP-KAD-RESEARCH-API-001` (T1)
