# Visualization Bake-Off Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Graph Visualization Bake-Off
- **Winner**: **Cytoscape.js**.
- **Rationale**: Canvas-based, lightweight (~110 KB), rich core layouts (`cose`, `grid`, `concentric`, `breadthfirst`) plus extension layouts (`dagre`, `fcose`), typed edge styling, zero WebGL requirement, 100% compatibility with Omarchy/Linux setups.
- **Alternatives**:
  - *Sigma.js + Graphology*: WebGL-based; reserved as EXPERIMENTAL for 10k+ node graphs.
  - *Custom SVG / D3*: High maintenance for complex interactive multi-hop graphs.

## 2. Chart & Telemetry Bake-Off
- **Winner**: **Hybrid Architecture**.
  - *Native CSS Tokens / SVG*: Status badges, compact meters, sparklines (0 KB overhead, <1ms updates).
  - *Apache ECharts (Modular)*: Time-series telemetry, zooming, aggregations, probability/counterfactual distributions, heatmaps.
  - *Vega-Lite*: Preserved as EXPERIMENTAL for reproducible scientific figures.
