# Cross-Project Reuse Architecture & Primitives

## 1. Architectural Principle: Shared Contracts + Thin Adapters

Rather than creating a bloated monorepo or heavy component framework, KAD adopts a **shared contract and thin adapter** architecture. Reusable primitives are extracted only where demonstrated reuse exists.

```
+-------------------------------------------------------------------------+
|                       CANONICAL OBSIDIAN VAULT                          |
|                  (Durable Human-Authored Ground Truth)                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  UNIFIED PROJECTION COMPILER PIPELINE                   |
|                   (tools/kad/wiki/projection.mjs)                       |
+-------------------------------------------------------------------------+
         |                       |                       |
         v                       v                       v
+-----------------+     +-----------------+     +-----------------+
|  Sofia Adapter  |     | Website Adapter |     |  Docs Manifest  |
| dashboard/      |     | site/           |     | docs/generated/ |
| adapter.mjs     |     | adapter.mjs     |     | manifest.json   |
+-----------------+     +-----------------+     +-----------------+
```

---

## 2. Reusable Primitives Matrix

### A. Design Tokens & Typography (`interface/kad.css`)
- **Color Variables**:
  - Base Inks: `--ink: #0a0b0f`, `--ink-raised: #10131a`, `--ink-panel: #151923`, `--ink-lift: #1b202b`
  - Border Lines: `--line: #303746`, `--line-hot: #515d70`
  - Foregrounds: `--paper: #e7e8e6`, `--muted: #9da5b2`, `--faint: #a9b1bf`
  - Accents: `--red: #a72b35`, `--gold: #e7ba72`, `--cyan: #68d5e8`, `--green: #79d69a`, `--amber: #f0c36d`, `--blue: #9aaef4`
- **Component Primitives**:
  - Status Badges: `.status--PASS`, `.status--PARTIAL`, `.status--BLOCKED`, `.status--UNKNOWN`
  - Panels: `.panel`, `.panel--accent`, `.panel--gold`, `.panel--cyan`, `.panel--green`
  - Grids: `.grid-2`, `.grid-3`, `.grid-4`, responsive shell
- **Consumers**:
  - Sofia v3 (`dashboard/index.html`)
  - Public Website (`site/index.html`, etc.)
  - Obsidian Snippet (`vault/.obsidian/snippets/kad-theme.css`)
  - Standalone report pages

### B. Projection Interchange Schemas
- **`kad-canonical-graph-v1`**: Shared by Sofia graph explorer, Obsidian bridge plugin, and OMP graph queries.
- **`kad-project-status-v1`**: Shared by Sofia overview, public website status cards, and CLI health summaries.
- **`kad-workpackage-export-v1`**: Shared by Sofia execution register and repository documentation.
- **`kad-research-corpus-v1`**: Shared by Sofia research bibliography and public research brief.
- **`kad-sofia-projection-v1`**: Complete typed projection feed for the operational dashboard.

### C. UI Helper Primitives (`interface/kad-ui.js`)
- `escapeHtml(string)`: XSS-safe text rendering.
- `statusBadge(status)`: Standardized status badge markup.
- `displayDate(isoString)`: Consistent date formatting.
- `loadJson(path)`: Robust JSON fetch with error handling.

### D. Telemetry & Runtime Contracts (`tools/kad/telemetry/`)
- `kad-telemetry-v1`: Unified provider/hardware/agent telemetry record.
- `kad-shadow-observation-v1`: Tamper-evident counterfactual observation record.
- `runtime-status.mjs`: Live state transition and staleness calculation (`applyStaleness`).
