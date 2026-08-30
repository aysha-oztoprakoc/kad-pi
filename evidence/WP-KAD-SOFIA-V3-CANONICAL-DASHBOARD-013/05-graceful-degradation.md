# Graceful Degradation Evidence - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Verified Failure Modes

### Case 1: Cytoscape Module Unavailable or Fails to Initialize
- **Observed Behavior**: Cytoscape import failure is trapped in `dashboard/dashboard.js` and `dashboard/graph-adapter.mjs`.
- **Degraded Presentation**: A degraded canvas message is rendered; the graph search, filter, and inspector panels remain fully functional in native tabular format.
- **Test Proof**: `tools/kad/test/graceful-degradation.test.mjs` (Case 1).

### Case 2: Apache ECharts Module Unavailable or Fails
- **Observed Behavior**: ECharts import failure is caught in `dashboard/charts.mjs`.
- **Degraded Presentation**: A fallback panel is shown; native HTML/CSS metrics, cards, and data tables continue rendering.
- **Test Proof**: `tools/kad/test/graceful-degradation.test.mjs` (Case 2).

### Case 3: Runtime-Status Endpoint Unavailable or Stale
- **Observed Behavior**: Probe failure sets runtime state to `UNAVAILABLE` or `STALE` via `applyStaleness`.
- **Degraded Presentation**: Metric cards display `UNAVAILABLE` or `STALE` without crashing; canonical vault state is preserved.
- **Test Proof**: `tools/kad/test/graceful-degradation.test.mjs` (Case 3).

### Case 4: Canonical Graph Projection Missing or Corrupted
- **Observed Behavior**: Graph parser throws structured error caught at bootstrap; creates degraded graph state.
- **Degraded Presentation**: Other dashboard views (Projects, Workpackages, Research, Telemetry) remain operational.
- **Test Proof**: `tools/kad/test/graceful-degradation.test.mjs` (Case 4).

### Case 5: Optional Projection Missing
- **Observed Behavior**: `Promise.all` in `bootstrap()` handles individual null projections safely without throwing.
- **Degraded Presentation**: Only the panel relying on that projection degrades; remainder of cockpit is unaffected.
- **Test Proof**: `tools/kad/test/graceful-degradation.test.mjs` (Case 5).
