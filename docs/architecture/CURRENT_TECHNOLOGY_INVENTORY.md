# Current Technology Inventory — KAD Ecosystem

## 1. Project-by-Project Inventory

### A. KAD-PI (Core Platform)
- **Path**: `/home/amdy/Work`
- **Role**: Sovereign Local-First AI & Agent Governance Platform
- **Languages**: JavaScript (Node.js ESM `.mjs`), Bash, Markdown, YAML, JSON
- **Runtime**: Node.js v26.7.0 (Strict ESM)
- **Framework**: Zero runtime framework (Vanilla ESM + Web Standards)
- **Package Manager**: None (Dependency-free core)
- **Build Tooling**: None required (Direct execution via Node ESM)
- **CSS / Theme**: `interface/kad.css` (Pure CSS variables, dark industrial palette)
- **Storage / Knowledge**: Canonical Obsidian Markdown Vault (`vault/`), Flat Frontmatter Properties, Git History
- **Projections**: `tools/kad/wiki/projection.mjs` -> `vault/90_Derived/Projections/`
- **APIs / IPC**: Local HTTP via `tools/kad/interface-server.mjs`, CLI via `bin/kad`, `bin/workctl`, `bin/kad-wiki`, `bin/kad-knowledge`
- **Telemetry**: `tools/kad/telemetry/` (append-only JSONL journal under XDG state)
- **Testing**: Native `node --test tools/kad/test/*.test.mjs tools/workspace/workctl.test.mjs` (564+ tests)
- **Linting & Verification**: `bin/kad-wiki lint`, `bin/workctl doctor`, `bin/kad doctor`, `git diff --check`
- **Status Classification**: `KEEP` (Core foundation)

### B. Sofia v3 (Operational Dashboard)
- **Path**: `dashboard/`, `interface/`
- **Role**: Client-side visualization and live telemetry observation dashboard
- **Languages**: Vanilla JavaScript (ESM), HTML5, CSS3
- **Runtime**: Browser / Webview (Chromium, Firefox, Omarchy Webview)
- **Framework**: Vanilla ESM (`dashboard/dashboard.js`, `dashboard/adapter.mjs`)
- **CSS / Theme**: `interface/kad.css`, `interface/kad-ui.js`
- **State Management**: In-memory projection store loaded from `vault/90_Derived/Projections/sofia-projection.json`
- **APIs / Telemetry**: Read-only fetch `/api/runtime-status` with 30s staleness detection
- **Testing**: `tools/kad/test/projection-compiler.test.mjs`
- **Status Classification**: `AUGMENT` (Upgrade to consume unified projection feeds + Cytoscape graph in WP-013)

### C. KAD Public Website
- **Path**: `site/`
- **Role**: Public explanatory surface and research brief
- **Languages**: HTML5, Vanilla JavaScript (ESM), CSS3
- **Runtime**: Static Web (GitHub Pages / Cloudflare Pages ready)
- **Framework**: Vanilla ESM (`site/site.js`, `site/adapter.mjs`)
- **CSS / Theme**: `interface/kad.css`
- **Data Source**: `site/generated/public-state.json` (compiled via `compileWebsiteState`)
- **Deployment**: Static HTML file serving
- **Status Classification**: `KEEP` (Data layer augmented in WP-011; full UI refresh scheduled in WP-014)

### D. data_workspace
- **Path**: `data_workspace/`
- **Role**: Quickshell sibling desktop data integration (M900 input mapping & hardware sensor adapter)
- **Languages**: JavaScript (Node.js ESM)
- **Runtime**: Node.js ESM
- **Package Manager**: npm (`package.json`)
- **Testing**: `node --test tests/*.test.mjs`, `node --check`
- **Relation to KAD**: Side project / desktop shell data provider
- **Status Classification**: `KEEP` (Stable side project; clean isolation)

### E. technopagan-netrunner
- **Path**: `technopagan-netrunner/`
- **Role**: Cyberdeck desktop interface (Quickshell, Hyprland, Omarchy UI kit)
- **Languages**: QML / Quickshell, Bash, tmux, Starship TOML
- **Relation to KAD**: Reference implementation for cyberdeck terminal and desktop aesthetics
- **Status Classification**: `REFERENCE` / `KEEP`

### F. DATA_REIN (Historical)
- **Path**: `/run/media/amdy/amdy-hdd/DATA_REIN/` (Archived external)
- **Role**: Predecessor research, monolithic wiki, early architecture notes
- **Status Classification**: `RETIRE` (Superseded by KAD-PI canonical vault and projection engine; canonical dossier preserved in `vault/50_Projects/Legacy/DATA-REIN-Dossier.md`)

---

## 2. Technology Classification Matrix

| Technology | Project(s) | Current Role | Target Classification | Justification |
|---|---|---|---|---|
| **Node.js Native ESM** | KAD-PI, data_workspace | Core backend & tooling runtime | **KEEP** | Zero build step, blazing fast, native test runner, strict module scoping. |
| **Vanilla JS (ESM)** | Sofia, Site, Tools | Frontend script runtime | **KEEP** | Standard web APIs, instant debugging, zero bundling complexity. |
| **`interface/kad.css`** | Sofia, Site | Design tokens & layout system | **AUGMENT** | Clean, dark, cyberdeck aesthetic; extract reusable tokens for Obsidian/web. |
| **Obsidian Core (.base, Properties)** | KAD-PI Vault | Durable knowledge management | **KEEP** | Pure Markdown, property validation, local-first, zero plugin lock-in. |
| **Cytoscape.js** | Sofia, Visualizations | Interactive graph engine | **AUGMENT (Adopt)** | Proven canvas graph library with rich layout algorithms and typed edge styling. |
| **Apache ECharts (Modular)** | Sofia, Telemetry | Complex time-series & metrics | **AUGMENT (Adopt)** | High-performance charting for deep telemetry and counterfactual distributions. |
| **Vega-Lite** | Research Visualizations | Declarative figures | **EXPERIMENTAL** | Preserved for reproducible scientific paper artifacts. |
| **Quickshell / QML** | technopagan-netrunner | Desktop HUD / status bar | **REFERENCE** | Maintained independently for Omarchy desktop integration. |
| **Monolithic Legacy Wiki** | DATA_REIN | Predecessor knowledge base | **RETIRE** | Fully superseded by unified canonical vault and projection engine. |
