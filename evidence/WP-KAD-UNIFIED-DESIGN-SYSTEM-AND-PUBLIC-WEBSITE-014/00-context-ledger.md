# Context Ledger - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Governance & Authority
- **Primary Authority**: `PRIME_DIRECTIVE.md`, accepted ADRs 0009–0012, `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` evidence.
- **Engineering Invariants**: PON + STC + TDD + GD.
- **Epistemic Invariant**: Strict 3-tier separation (`EXPLICIT_CANONICAL`, `DETERMINISTIC_DERIVED`, `HEURISTIC_SUGGESTION`).
- **Read-Only / Privacy Invariant**: Public presentation is strictly a presentation layer. Publication filter remains fail-closed against unpublished/review/private/governance zones.

## 2. Baseline State
- **Base Commit**: `a0f631c588f57f8101c06d2ea2360b22af4935f8` (WP-013 PASS, clean tree, fully synchronized with `origin/main`).
- **Claim ID**: `3f869cf6-64af-4a26-a341-dc0060781a90`.
- **Status**: `IN_PROGRESS`.

## 3. Scope & Objectives
1. Extract reusable KAD design foundation from `interface/kad.css` (`tokens.css`, `foundation.css`, `components.css`, `kad.css`).
2. Preserve Sofia v3 behavior without regression (Cytoscape graph explorer, ECharts, telemetry snapshot).
3. Modernize public website (`site/`) with consistent information architecture, semantic landmarks, responsive layouts, and accessibility.
4. Keep static publication strictly projection-driven, static-first, and fail-closed.
5. Implement lightweight DOM-based public knowledge explorer with progressive enhancement.
6. Verify static deployment readiness and 6 graceful degradation failure modes.
