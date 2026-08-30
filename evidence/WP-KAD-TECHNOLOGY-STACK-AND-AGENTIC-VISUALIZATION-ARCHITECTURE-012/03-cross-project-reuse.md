# Cross-Project Reuse Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Reusable Contracts & Primitives
- **Shared Design Tokens**: `interface/kad.css` establishes the dark cyberdeck theme (`--ink`, `--paper`, `--red`, `--gold`, `--cyan`), status badge styles, and grid systems used across Sofia, website, and Obsidian snippets.
- **Shared Projection Feeds**:
  - `kad-canonical-graph-v1` (`graph.json`)
  - `kad-project-status-v1` (`projects.json`)
  - `kad-workpackage-export-v1` (`workpackages.json`)
  - `kad-research-corpus-v1` (`research.json`)
  - `kad-sofia-projection-v1` (`sofia-projection.json`)
  - `kad-technology-registry-v1` (`technology-registry.json`)
- **Shared UI Helpers**: `interface/kad-ui.js` provides XSS-safe text rendering (`escapeHtml`), status badges, and date formatting.
- **Shared Runtime Contract**: `tools/kad/runtime-status.mjs` provides live status transitions and staleness detection (`applyStaleness`).
