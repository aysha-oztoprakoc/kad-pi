# Contract Tests (Red Phase) - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Test Suite Inception
- **Test Files Created**:
  1. `tools/kad/test/graph-adapter.test.mjs`: Tests pure graph projection parsing, typed node/edge filtering, search, neighborhood extraction, and Cytoscape.js element generation.
  2. `tools/kad/test/dashboard-viewmodel.test.mjs`: Tests project summaries, workpackage completion rates, research corpus aggregations, ECharts options builders, and degraded state representations.

## 2. Observed Failure Output (TDD Red)
```text
✖ tools/kad/test/dashboard-viewmodel.test.mjs
  SyntaxError: The requested module '../../../dashboard/adapter.mjs' does not provide an export named 'buildProjectClassificationChartOptions'

✖ tools/kad/test/graph-adapter.test.mjs
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/amdy/Work/dashboard/graph-adapter.mjs'
```

## 3. Verified Invariants
- Graph adapter contract enforces `kad-canonical-graph-v1` schema compliance and 3-tier epistemic separation (`EXPLICIT_CANONICAL`, `DETERMINISTIC_DERIVED`, `HEURISTIC_SUGGESTION`).
- View-model transformations remain pure functions with zero UI framework dependency.
