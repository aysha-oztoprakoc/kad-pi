# Dependency Integration Record - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Integrated Dependencies
- **`cytoscape`**: `3.30.4` (Exact pinned version in `package.json`).
  - *Purpose*: Interactive semantic graph explorer (Canvas-based rendering, typed node/edge layouts).
  - *Footprint*: ~372 KB minified browser ESM (`cytoscape.esm.min.mjs`).
  - *Authority*: Pure presentation / adapter tier; zero canonical mutation authority.
- **`echarts`**: `5.6.0` (Exact pinned version in `package.json`).
  - *Purpose*: Modular telemetry and distribution visualization (workpackage breakdown, project classifications).
  - *Footprint*: Browser ESM distribution (`echarts.esm.min.mjs`).
  - *Authority*: Presentation only; data contracts strictly independent.

## 2. Browser Delivery Mechanism
- **Native Browser ESM & Import Map**:
  - `tools/kad/interface-server.mjs` exposes `/vendor/cytoscape.esm.min.mjs` and `/vendor/echarts.esm.min.mjs` with `text/javascript; charset=utf-8`.
  - `dashboard/index.html` registers an `<script type="importmap">` mapping `"cytoscape"` and `"echarts"` to local `/vendor/*` paths.
  - Zero bundler (Webpack, Vite, Rollup) required. Zero runtime CDN dependencies. 100% offline and reproducible.

## 3. Verification & Server Tests
- Verified via `tools/kad/test/interface-server.test.mjs` (all 5 tests pass).
