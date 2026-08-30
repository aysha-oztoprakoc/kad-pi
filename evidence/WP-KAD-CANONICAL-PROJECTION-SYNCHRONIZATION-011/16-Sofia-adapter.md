# Sofia v3 Canonical Adapter Specification — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Adapter Contract (`dashboard/adapter.mjs`)
The Sofia adapter translates compiled canonical vault records (`kad-sofia-projection-v1`) into structured models for visualization components.

### Schema Fields Preserved
- `kad_id`: Stable alphanumeric identifier
- `title`: Canonical note title
- `canonical_path`: Path relative to `vault/`
- `canonical_hash`: SHA-256 of vault Markdown content
- `vault_revision`: Global vault revision hash
- `authority`: `CANONICAL_KNOWLEDGE`, `CANONICAL_PROJECT_DECISION`, etc.
- `epistemic_class`: `SOURCE_FACT`, `PROJECT_INFERENCE`, `DERIVED_SYNTHESIS`
- `temporal_status`: `CURRENT`, `HISTORICAL`, `SUPERSEDED`
- `review_status`: `APPROVED`, `PENDING`, `REJECTED`
- `context_eligible`: Boolean flag
- `body_excerpt`: Sanitized text snippet

## 2. Invariants
- `dashboard/` code cannot issue mutating writes to `vault/`.
- Revision staleness is explicitly detectable (`isProjectionFresh`).
