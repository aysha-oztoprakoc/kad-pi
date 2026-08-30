# Context Ledger - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Authoritative Inputs & Governance
- **Prime Directive**: Scientific reconstructability, evidence before claims, zero unapproved paid spend, deterministic authority outranks model judgment.
- **WP-012 Architecture**: ADR 0009 (Frontend/Visualization Stack), ADR 0010 (Obsidian Governance), ADR 0011 (OMP Toolchain), ADR 0012 (Agentic Graph Engineering).
- **Workpackage Contract**: `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` claimed at `6881352d96933a32c59fbb494fc339e8a38ac434`.

## 2. Relevant Scope & Paths
- `dashboard/index.html`: Sofia v3 entry point.
- `dashboard/dashboard.js`: Sofia UI controller.
- `dashboard/adapter.mjs`: Projection adapter and view-model mapping.
- `dashboard/graph-adapter.mjs`: Renderer-independent graph view-model and Cytoscape adapter.
- `dashboard/charts.mjs`: Modular ECharts options builders and chart managers.
- `interface/kad.css`: Canonical cyberdeck design tokens and styling.
- `interface/kad-ui.js`: DOM utility primitives.
- `tools/interface/server.mjs`: Interface server providing static assets and `/api/runtime-status`.
- `tools/kad/test/dashboard*.test.mjs`, `tools/kad/test/graph*.test.mjs`: TDD test suites.

## 3. Discovered Invariants & Accepted Contracts
- **Vanilla Native ESM**: Zero build step; browser imports native ESM or local vendor paths directly.
- **Cytoscape.js**: Interactive semantic graph explorer; zero canonical authority; isolated behind pure view-model transformations.
- **Modular Apache ECharts**: Used only for structured distribution and telemetry charts; native UI owns simple status badges and counters.
- **Snapshot Telemetry**: Sofia polls or requests `/api/runtime-status` snapshots with explicit refresh; does not invent SSE/WebSockets (reserved for WP-016).
- **Graceful Degradation (GD)**: Failure of Cytoscape, ECharts, or runtime-status degrades gracefully to tabular/textual/static data without crashing Sofia.
- **Read-Only Invariant**: Sofia has zero write routes to the canonical vault or workspace.

## 4. Implementation Phases & Status
- [x] Phase 1: Preflight, Workctl Claim & Context Ledger
- [ ] Phase 2: Reconnaissance & Contract Tests (TDD Red)
- [ ] Phase 3: Dependency Integration (Cytoscape.js & Modular ECharts)
- [ ] Phase 4: Graph View-Model & Cytoscape Explorer UI
- [ ] Phase 5: Dashboard Panels, Native Status Meters & ECharts Charts
- [ ] Phase 6: Scale Benchmarks, Graceful Degradation & Full Validation

## 5. Next Deterministic Action
- Inspect existing `dashboard/`, `interface/`, and `tools/interface/server.mjs`.
- Write failing unit/contract tests for graph view-model parser, filters, selectors, Cytoscape element converters, and dashboard view-models.
