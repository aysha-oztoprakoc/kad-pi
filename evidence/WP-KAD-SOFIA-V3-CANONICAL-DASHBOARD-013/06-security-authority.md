# Security & Authority Verification - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Authority & Read-Only Invariant
- **Zero Vault Mutation Authority**: Sofia v3 is strictly a presentation and observation surface. Neither `dashboard/dashboard.js`, `dashboard/adapter.mjs`, nor `tools/kad/interface-server.mjs` contain any POST, PUT, DELETE, or file-write endpoints to the vault or workspace.
- **Fail-Closed Static Whitelist**: `tools/kad/interface-server.mjs` rejects all non-GET requests (HTTP 405) and only serves an explicit allowlist of static files (`/dashboard/*`, `/interface/*`, `/vendor/*`, `/vault/90_Derived/Projections/*`). Directory traversal attempts (`/../*`, `/%2e%2e/*`) return 404.

## 2. Privacy & Secret Protection
- **Zero CDN Dependencies**: All JavaScript dependencies (`cytoscape`, `echarts`) are installed locally in `node_modules` and served via native ESM import maps from `/vendor/`.
- **No Secret Leakage**: Gitleaks and Trivy toolchains pass cleanly with zero secrets or unapproved tokens found.
- **XSS Protection**: All user-controlled text strings from projections and runtime telemetry are escaped via `escapeHtml()` before insertion into the DOM.
