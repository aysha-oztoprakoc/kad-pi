# ADR 0009: Frontend, Graph, and Chart Visualization Technology Stack

* **Status**: ACCEPTED
* **Date**: 2026-08-30
* **Author**: KAD-PI Architecture & Implementation Team
* **Authority**: Wayfinder + KAD Human Decision Gate
* **Supercedes**: None
* **Related ADRs**: ADR 0004 (Model-Agnostic Control Plane), ADR 0008 (Unified Knowledge Plane)

---

## Context
KAD-PI requires a coherent visualization architecture across Sofia v3 (operational dashboard), the public website (`site/`), repository documentation (`docs/generated/`), and research tools. We evaluated full frontend SPA frameworks (Svelte, SolidJS, React), graph visualization engines (Cytoscape.js, Sigma.js + Graphology, custom SVG), and charting libraries (Apache ECharts, Vega-Lite, custom CSS/SVG).

## Decision

### 1. Frontend Runtime Architecture
* **Stack**: Native Vanilla ECMAScript Modules (ESM) + Web Standards + Shared CSS Design Tokens (`interface/kad.css`).
* **Invariants**:
  - Zero build step / zero bundler overhead for standard operational surfaces.
  - 100% portable across Sofia, public website, local file previews, and embedded webviews.
  - Fast cold-start, instant in-browser debuggability, zero framework churn.
  - Progressive enhancement: static JSON projection loading with fallback on network/runtime interruption.

### 2. Interactive Graph Engine
* **Primary Engine**: **Cytoscape.js**.
* **Layout Architecture**:
  - Built-in Core Layouts: `cose` (compound spring embedder), `grid`, `concentric`, `breadthfirst`, `circle`, `random`.
  - Extension Layouts (modularly imported when required): `dagre` (hierarchical DAG), `fcose` (fast compound), `elk`.
* **Scope & Boundaries**:
  - Interactive knowledge exploration, workpackage dependency graphs, agentic tool topology, and research citation graphs.
  - Canvas-based rendering with lightweight memory footprint (~100KB), zero WebGL requirements, high compatibility with Linux desktop environments (Omarchy/Hyprland).

### 3. Chart & Telemetry Visualization
* **Architecture**: **Hybrid Visualization Model**.
  - **Native HTML/CSS/SVG**: Simple operational indicators, status badges (`status--PASS`, `status--DEGRADED`), compact telemetry meters, progress bars, and high-frequency spark lines.
  - **Apache ECharts (Modular)**: Visualizations requiring coordinate axes, longitudinal time-series, telemetry zooming, multi-series aggregations, probability/counterfactual distributions, heatmaps, and deep interactive exploration.
  - **Vega-Lite (Experimental)**: Preserved strictly as a declarative, reproducible specification backend for scientific paper figures and static research artifact generation.
* **Invariants**:
  - Data contracts remain strictly independent of charting libraries. Telemetry feeds emit normalized `kad-telemetry-v1` and `kad-shadow-observation-v1` records; adapters translate them into view models.

## Consequences

### Positive
- Unified visual identity across all surfaces via `interface/kad.css`.
- Zero build complexity; zero Node/Vite build steps to view or run dashboards.
- Predictable performance on local hardware.
- Total freedom to run offline or in degraded modes.

### Negative / Trade-offs
- Manual DOM binding for complex reactive forms (mitigated by read-only visualization nature of Sofia v3).
- Layout extensions for Cytoscape must be explicitly bundled or loaded dynamically when hierarchical DAG layout is needed.
