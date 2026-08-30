# Website Public Projection Adapter — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

## 1. Adapter Implementation
- **Module**: `site/adapter.mjs`
- **Compiler Function**: `compileWebsiteState` in `tools/kad/wiki/projection.mjs`
- **Target Output**: `site/generated/public-state.json`

## 2. Publication Gate Invariants
- `authority == 'CANONICAL_KNOWLEDGE'`
- `review_status == 'APPROVED'`
- `publish == true`
- `visibility == 'public'`
- `context_eligible == true` (for search projections)
- Strictly excludes non-canonical zones: `00_Governance/`, `10_Raw/`, `10_Inbox/`, `80_Review/`, `90_Derived/`, `99_Archive/`.
- Tested in `tools/kad/test/projection-compiler.test.mjs` (test case passes).
