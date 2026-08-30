# Design & Publication Contract Tests (TDD Red Phase) - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Test Suites Created
1. `tools/kad/test/design-tokens.test.mjs`: Tests existence of `tokens.css`, `foundation.css`, `components.css`, `kad.css`, required semantic tokens, and aggregate imports.
2. `tools/kad/test/publication-privacy.test.mjs`: Tests fail-closed publication filtering and validation against leakage of private/review/governance notes or secret keys.
3. `tools/kad/test/site-static-contract.test.mjs`: Tests semantic HTML landmarks, skip links, DOCTYPE, viewport, description metadata, absence of external CDNs, and zero local daemon coupling across all 6 canonical site pages.

## 2. Initial Red Run Evidence
- **Status**: RED (Expected failures due to unextracted CSS modules and pre-modernized HTML landmarks).
- **Failures Captured**:
  - `interface/tokens.css` missing.
  - `interface/foundation.css` missing.
  - `interface/components.css` missing.
  - `interface/kad.css` missing aggregate imports.
  - `site/*.html` missing skip-link accessibility landmarks and semantic structure updates.
