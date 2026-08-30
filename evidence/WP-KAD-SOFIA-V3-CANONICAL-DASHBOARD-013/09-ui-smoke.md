# UI Smoke & Navigation Record - WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013

## 1. Interface Server Smoke Procedure
- **Launch Command**: `node tools/kad/interface-server.mjs`
- **Port**: Default 4173 (`http://127.0.0.1:4173/dashboard/index.html`)

## 2. Navigational Views Verified
1. **Overview View (`#overview`)**:
   - Status metric cards render active projects (3/4), completion rate, knowledge topology count, and live telemetry status.
   - Attention items list surfaces pending review workpackages.
   - Recent workpackages table renders with status badges.
2. **Graph Explorer View (`#graph`)**:
   - Cytoscape canvas initializes and renders 30 nodes and 22 edges.
   - Node styling correctly distinguishes node types (Project: cyan, Workpackage: gold, Decision: purple, Research: green) and epistemic tiers (Solid vs. Dashed borders).
   - Search input filters nodes in real time.
   - Node tap populates Inspector panel with metadata and clickable neighbor links.
   - Fit View and Reset controls operate smoothly.
3. **Projects View (`#projects`)**:
   - Classification breakdown ECharts bar chart renders without errors.
   - Full projects table lists role, status, and repository paths.
4. **Workpackages View (`#workpackages`)**:
   - Status breakdown ECharts donut chart renders with custom palette.
   - Workpackages table lists status, verdicts, and commits.
5. **Research View (`#research`)**:
   - Bibliographic cards render for all 5 audited papers with arXiv/DOI links.
6. **Telemetry HUD (`#telemetry`)**:
   - Manual snapshot refresh button triggers immediate `/api/runtime-status` fetch.
   - Observation timestamps and transition states update.
7. **System View (`#system`)**:
   - Canonical vault revision and generation timestamps display.
   - Technology Registry table lists classified decisions (`KEEP`, `ADOPT`, `AUGMENT`, `EXPERIMENTAL`, `RETIRE`).
