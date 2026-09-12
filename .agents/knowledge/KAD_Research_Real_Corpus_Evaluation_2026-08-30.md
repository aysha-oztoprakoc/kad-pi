# KAD-PI Real-Corpus Research Workflow Evaluation (2026-08-30)

## Executive Summary

Workpackage **WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006** evaluates the end-to-end KAD research pipeline on a real academic literature corpus covering **Deterministic vs. Probabilistic Agent Control in Software Engineering Systems**.

## Tested Capabilities & Invariants

The evaluation verified all 10 core research workflow capabilities without requiring premature knowledge platform expansion:

1. **Acquisition / Ingestion**: Validated deterministic manifest parsing (`kad-research-manifest-v1`), security path confinement, and symlink protection.
2. **Canonical Normalization**: Standardized DOI (`10.48550/arxiv.*`) and arXiv identifiers into stable `ResearchDocument` records.
3. **Provenance Integrity**: Retained complete origin, actor, timestamps, and SHA-256 source content hashes.
4. **Idempotency & Deduplication**: Re-importing existing documents returned `IDEMPOTENT_EXISTING` without mutating canonical records.
5. **Document Retrieval**: Exercised filtering by identifier, title, and year through `kad-knowledge research list/inspect`.
6. **Evidence Extraction**: Retrieved factual empirical excerpts and benchmark numbers from local source artifacts.
7. **Citation Traceability**: Verified 100% of generated claims link to canonical published sources without fabricated citations.
8. **Structured Synthesis**: Categorized claims into `[SOURCE_FACT]`, `[DERIVED_SYNTHESIS]`, `[PROJECT_INFERENCE]`, and `[UNKNOWN]`.
9. **Context Handoff**: Verified seamless integration with KAD Librarian without context bloat.
10. **Graceful Degradation**: Proved full local operation with Zotero unconfigured, OpenViking offline, and zero paid API expenditure.

## Real Corpus Composition

The bounded evaluation corpus comprises 5 real, published peer-reviewed papers and preprints:
* **ReAct** (*Yao et al., ICLR 2023*) - `10.48550/arxiv.2210.03629`
* **SWE-bench** (*Jimenez et al., ICLR 2024*) - `10.48550/arxiv.2310.06770`
* **Toolformer** (*Schick et al., NeurIPS 2023*) - `10.48550/arxiv.2302.04761`
* **Reflexion** (*Shinn et al., NeurIPS 2023*) - `10.48550/arxiv.2303.11366`
* **Self-Refine** (*Madaan et al., NeurIPS 2023*) - `10.48550/arxiv.2303.17651`

## Observatory Integration

In accordance with KAD doctrine, the Counterfactual Observatory remained completely passive. No synthetic traffic or forced routing diversions were generated to influence promotion readiness metrics.
