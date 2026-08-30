# Security & Privacy Audit - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Privacy Audit & Invariants

- **Private / Governance Notes Exclusion**: Notes in `00_Governance/`, `10_Raw/`, `10_Inbox/`, `80_Review/`, `90_Derived/`, and `99_Archive/` are deterministically excluded by `tools/kad/wiki/projection.mjs`.
- **Visibility & Review Filter**: Only notes with `publish: true`, `visibility: 'public'`, and `review_status: 'APPROVED'` are compiled into `site/generated/public-state.json`.
- **Secret & Token Leakage**:
  - Rejection of secret keys (e.g. `sk-*`, bearer tokens, passwords) verified by `tools/kad/test/publication-privacy.test.mjs`.
  - Zero private filesystem paths exposed.
- **XSS & Injection Protection**:
  - All dynamic data rendered by `site/site.js` is sanitized via `escapeHtml()`.
- **Zero Third-Party Telemetry**:
  - Zero Google Analytics, trackers, external fonts, or CDN script tags.
