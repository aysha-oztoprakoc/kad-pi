# Canonical vault schema

Markdown with optional YAML frontmatter. Required fields are conditional: knowledge and decisions require `kad_id`, `authority`, `epistemic_class`, `review_status`, `context_eligible`; `SOURCE_FACT` additionally requires `sources` and `source_hashes`. Raw evidence requires `source_id` and `source_hash`.

Supported values: authority `RAW_EVIDENCE`, `CANONICAL_KNOWLEDGE`, `CANONICAL_PROJECT_DECISION`, `PROPOSAL_UNREVIEWED`, `DERIVED`, `ARCHIVED`, `UNKNOWN`; epistemic class `SOURCE_FACT`, `DERIVED_SYNTHESIS`, `PROJECT_INFERENCE`, `UNKNOWN`.

`context_eligible: true` is valid only for approved canonical knowledge/decisions and never UNKNOWN. `train_eligible: true` requires approved non-UNKNOWN content with provenance.

Hashes are SHA-256 of exact file bytes/content as documented by the producer.
