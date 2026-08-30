# KAD KnowledgePlane Seed Promotion

## Verdict

**PASS** for the deterministic claim-level authority and derived projection contract.

## Selected architecture

Claim-level canonical evidence records (Option B) are the smallest durable seam. Whole-document promotion loses epistemic precision; graph-first authority adds infrastructure without evidence of need.

## Authority boundary

`KAD KnowledgePlane` owns canonical promoted claims. `SOURCE_FACT` is authoritative only when primary-source support and audit verification are present. `DERIVED_SYNTHESIS` and `PROJECT_INFERENCE` remain explicitly derived. `UNKNOWN` is retained but never promoted as fact. Wiki and OpenViking are derived, rebuildable views with canonical backlinks.

## Seed

The seed is the audited five-paper ledger from WP-006-R1. The promotion manifest and claim traceability are in `evidence/WP-KAD-KNOWLEDGE-PLANE-SEED-PROMOTION-007/`. Invalid or unsupported entries are rejected closed; unknown entries are retained without authority.

## Projections and fallback

`projectClaims()` produces deterministic Markdown and structured records. The OpenViking adapter emits canonical IDs and source hashes when available; unavailable OpenViking returns `DEGRADED` without canonical mutation. Exact KnowledgePlane/Librarian retrieval remains the fallback.

## Future Needle boundary

Eligibility is metadata and cannot erase epistemic labels. Unknown claims are not eligible by default. No Needle training, fine-tuning, or distillation occurred.
