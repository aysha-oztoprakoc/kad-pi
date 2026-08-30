# KAD-PI Strategic Wayfinding — Current State

## Scope

Discussion/design only. No dashboard, website, routing, authority, model-download, migration, or orchestration implementation is authorized by this workpackage.

## Repository fixed point

- `HEAD`: `375df8b343f348d517bb73a7077f22558932aba1` (`feat(kad): consolidate shared local model store`)
- Working tree: dirty; pre-existing and current uncommitted paths include `CONTEXT.md`, context-economy code, wiki projections, model-store/runtime artifacts, ADR 0008, KnowledgePlane evidence, and advisory-board skill. These are preserved and are not treated as this workpackage's changes.
- Governing authority: `PRIME_DIRECTIVE.md`, `AGENTS.md` policy bridge, accepted ADRs, deterministic tests/gates, evidence receipts, and human-authored canonical artifacts.

## Confirmed / design-decided

- KAD owns authority, acceptance, trust domains, routing policy, lifecycle policy, and evidence.
- OMP owns volatile working context; compaction is not knowledge promotion.
- Durable source artifacts outrank indexes, embeddings, summaries, memories, wiki projections, retrieval results, and model inference.
- KnowledgePlane is a KAD-owned boundary. OpenViking is an experimental adapter, not an authority layer.
- The deterministic Librarian remains exact lookup, bootstrap import, integrity verification, and fallback retrieval.
- Needle output is syntax/routing evidence only; malformed or low-confidence output must escalate safely.
- No new paid spend, authority widening, or automatic self-promotion is allowed.

## Observed evidence

- KnowledgePlane substrate evidence is `PARTIAL / SAFE TO RESUME KNOWLEDGE-PLANE VERTICAL SLICE` (`evidence/WP-KAD-KNOWLEDGE-PLANE-001/REPORT-R1.md`). OpenViking health, exact reads, semantic retrieval, restart persistence, and raw-resource degradation were observed. Ollama VLM was unavailable.
- Needle 2 installed and performs constrained offline calls, but tuned-weight confidence is null and qualification is blocked; frozen upstream suite was `30/32` with no critical failures.
- Shared model store is `PARTIAL`; canonical model bytes are in `.models/`. Stheno remains on an externally owned legacy path pending controlled cutover; Qwen retrieval endpoint is unavailable; Needle and BGE are loadable but not fully integrated.
- Deterministic repository gates in the KnowledgePlane evidence passed: JSON evidence parsing, `make verify`, and 15 targeted Librarian/context-economy tests.
- Controller configuration has one approved subscription-backed semantic-role lane; quota is explicitly `UNKNOWN`, and no price claim is made.

## Inferred / decision-relevant

- A KAD-owned KnowledgePlane contract and tests are the highest-leverage unresolved seam named by the latest evidence; adapter integration should follow that seam, not precede it.
- Dashboard/API work appears dependent on stable status, provenance, capability, and evidence contracts; building a visual surface first risks an ornamental projection.
- Model qualification and runtime cutover are bounded, independently valuable tracks but do not currently establish a product bottleneck.
- The public website, GitHub redesign, dashboard, and aesthetic lineage are separate products/audiences, not one interface requirement.

## Unknown

- Human primary identity for KAD-PI in the near term.
- Daily interaction model and the capability that would create immediate utility.
- Whether research value, workstation utility, public presentation, or portfolio/academic value should dominate the next horizon.
- Which of the candidate directions is the human's accepted next priority.
- Desired ceiling and approval model for self-learning, routing adaptation, model training, and automatic tool/architecture changes.
- Required KnowledgePlane minimum valuable capability from the human's actual workflow.

## Superseded / historical

- `wiki/KAD_Implementation_Plan.md` is explicitly a historical baseline. The 2026-08-29 Context/Knowledge/Local-Specialist roadmap and ADR 0008 take precedence where sequencing or authority assumptions differ.
