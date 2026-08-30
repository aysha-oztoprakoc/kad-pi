# Implementation Map - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Modified & Created Artifacts

| Path | Role | Description |
|---|---|---|
| `dashboard/index.html` | Entrypoint | Sofia v3 HTML cockpit with native importmap and semantic navigation |
| `dashboard/dashboard.js` | UI Controller | Sofia v3 router, Cytoscape graph explorer, ECharts binding, runtime probe |
| `dashboard/adapter.mjs` | View-Model | Pure projection-to-view-model transforms and ECharts options specs |
| `dashboard/graph-adapter.mjs` | Graph View-Model | Renderer-independent graph parser, filters, search, neighborhood traversal, Cytoscape adapter |
| `dashboard/charts.mjs` | Presentation | Modular ECharts manager, responsive resizing, cleanup, degraded fallbacks |
| `interface/kad.css` | Styling | Cyberdeck styles for graph canvas, filter bars, node inspector, and charts |
| `tools/kad/interface-server.mjs` | Static Server | Static allowlist serving vendor ESM libraries and projections |
| `package.json` | Dependencies | Pinned `cytoscape: "3.30.4"` and `echarts: "5.6.0"` |
| `tools/kad/test/graph-adapter.test.mjs` | Test Suite | TDD contract tests for graph parser and Cytoscape converter |
| `tools/kad/test/dashboard-viewmodel.test.mjs` | Test Suite | TDD contract tests for dashboard summaries and ECharts options |
| `tools/kad/test/dashboard-integration.test.mjs` | Test Suite | Integration tests against real KAD projection fixtures |
| `tools/kad/test/graph-scale.test.mjs` | Test Suite | Deterministic scale benchmarks (100, 1k, 5k nodes) |
| `tools/kad/test/graceful-degradation.test.mjs` | Test Suite | Verification of all 5 graceful degradation failure cases |
| `tools/kad/test/interface-server.test.mjs` | Test Suite | Tests for vendor ESM and projection static file serving |
| `evidence/WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013/*` | Evidence Package | 12 complete evidence files and final report |
