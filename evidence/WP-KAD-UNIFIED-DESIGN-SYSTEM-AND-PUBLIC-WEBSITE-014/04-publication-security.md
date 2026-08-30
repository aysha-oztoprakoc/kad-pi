# Publication Security & Privacy Verification - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Fail-Closed Publication Boundary

The public website operates strictly via projection data compiled to `site/generated/public-state.json`.

```text
Canonical Vault (vault/)
        ↓
Projection Compiler (tools/kad/wiki/projection.mjs)
        ↓
Fail-Closed Filter:
  • authority == 'CANONICAL_KNOWLEDGE'
  • review_status == 'APPROVED'
  • publish == true
  • visibility == 'public'
  • Zone Exclusion (00_Governance, 10_Raw, 10_Inbox, 80_Review, 90_Derived, 99_Archive)
        ↓
Publication Sanitizer & Validator (tools/kad/publication.mjs)
  • Rejects private/secret-shaped keys (tokens, passwords, local paths, bearer headers)
  • Enforces SAFE_RECORD_FIELDS allowlist
        ↓
Public Projection (site/generated/public-state.json)
        ↓
Public Website Adapter (site/adapter.mjs)
```

## 2. Invariants Verified
- **Zero Raw Vault Access**: Browser never queries internal filesystem or unreviewed markdown files.
- **Zero Secret Leaks**: Verified by `tools/kad/test/publication-privacy.test.mjs`.
- **Zero Daemon Coupling**: Public site functions purely with static files.
