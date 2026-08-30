# KAD KnowledgePlane Seed Promotion

The KAD KnowledgePlane is the canonical authority for promoted claim records. A claim enters it only through deterministic validation of an audited source linkage, evidence location, verification status, and stable claim identifier.

## Epistemic classes

- `SOURCE_FACT`: directly supported by the cited primary source and audited as `SUPPORTED`; may be authoritative evidence.
- `DERIVED_SYNTHESIS`: project synthesis; remains visibly derived and never becomes a source fact.
- `PROJECT_INFERENCE`: KAD-specific interpretation; remains project-specific.
- `UNKNOWN`: retained uncertainty; cannot promote as fact.

Wiki and OpenViking outputs are reproducible projections. They carry canonical IDs, source references, hashes, and epistemic classes. They have no mutation authority over canonical records. OpenViking absence degrades only the projection and leaves exact KnowledgePlane retrieval available.

Training eligibility is metadata only. It cannot alter epistemic class; `UNKNOWN` remains ineligible by default. No Needle training, fine-tuning, or distillation is performed by the seed promotion workflow.

The audited five-paper input is `evidence/WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006-R1/claim-ledger.json`. The deterministic implementation is exported from `tools/kad/knowledge-plane.mjs`.
