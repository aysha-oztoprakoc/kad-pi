# Presentation Inventory & Archaeology - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Inventory of Styling Constructs

| Construct / Selector | Current Location | Classification | Usage / Role | Target Extraction Location |
|---|---|---|---|---|
| `:root` variables (`--ink`, `--paper`, `--red-deep`, etc.) | `interface/kad.css:1-23` | `TOKEN` | Color palette, font definitions, box shadows, max width | `interface/tokens.css` |
| `*`, `html`, `body`, `body::before` | `interface/kad.css:25-28` | `FOUNDATION` | Global resets, theme background, cyberpunk grid texture | `interface/foundation.css` |
| `a`, `a:hover`, `button`, `:focus-visible` | `interface/kad.css:29-32` | `FOUNDATION` | Base link and focus styles, accessibility outlines | `interface/foundation.css` |
| `h1`, `h2`, `h3`, `p`, `.lede`, `.mono` | `interface/kad.css:46-51,67` | `FOUNDATION` | Typography foundation and scale | `interface/foundation.css` |
| `@media (prefers-reduced-motion)` | `interface/kad.css:185-187` | `FOUNDATION` | Accessibility reduced motion override | `interface/foundation.css` |
| `.shell`, `.site-header`, `.header-inner`, `.brand`, `.nav` | `interface/kad.css:34-43` | `SHARED_COMPONENT` | Layout shell and top navigation bar | `interface/components.css` |
| `.panel`, `.panel--*`, `.grid`, `.grid-*` | `interface/kad.css:55-65` | `SHARED_COMPONENT` | Cyberdeck angled cards, borders, grid layouts | `interface/components.css` |
| `.eyebrow`, `.kicker`, `.rule`, `.list`, `.cta-row` | `interface/kad.css:45,66,68-72` | `SHARED_COMPONENT` | Text ornaments, dividers, lists, call-to-action rows | `interface/components.css` |
| `.button`, `.button--hot` | `interface/kad.css:73-75` | `SHARED_COMPONENT` | Action buttons with hover effects | `interface/components.css` |
| `.status`, `.status--*`, `.notice`, `.chip`, `.chip-row` | `interface/kad.css:77-83,126-127`| `SHARED_COMPONENT` | Semantic status badges, notices, metadata chips | `interface/components.css` |
| `.data-table`, `.table-wrap` | `interface/kad.css:112-118` | `SHARED_COMPONENT` | Tabular data presentation | `interface/components.css` |
| `.flow`, `.flow-step` | `interface/kad.css:84-88` | `SHARED_COMPONENT` | Multi-step process/pipeline visualization | `interface/components.css` |
| `.footer`, `.footer-inner` | `interface/kad.css:97-98` | `SHARED_COMPONENT` | Page footer and metadata provenance | `interface/components.css` |
| `.loading`, `.empty`, `.error` | `interface/kad.css:124-125` | `SHARED_COMPONENT` | Degraded/asynchronous status containers | `interface/components.css` |
| `.hero`, `.hero-grid`, `.hero-aside`, `.signal`, `.signal-row` | `interface/kad.css:90-96` | `SITE_SPECIFIC` | Public landing hero section and telemetry signal panel | `site/site.css` / `interface/kad.css` |
| `.dashboard-shell`, `.side-nav`, `.dashboard-content`, `.dashboard-title` | `interface/kad.css:102-108` | `SOFIA_SPECIFIC` | Sofia v3 sidebar and cockpit shell | `interface/kad.css` |
| `.graph-layout`, `.graph-canvas-container`, `#cy-container`, `.graph-controls`, `.graph-inspector`, `.tier-badge` | `interface/kad.css:131-150` | `SOFIA_SPECIFIC` | Sofia v3 Cytoscape.js interactive graph explorer | `interface/kad.css` |
| `.chart-grid`, `.chart-panel`, `.chart-box`, `.degraded-chart-fallback`, `.hud-refresh-btn` | `interface/kad.css:153-158` | `SOFIA_SPECIFIC` | Sofia v3 ECharts and Telemetry HUD controls | `interface/kad.css` |

## 2. Extraction & Hierarchy Strategy

```text
interface/tokens.css       (Semantic variables: colors, typography, spacing, borders, focus)
         ↓
interface/foundation.css   (Reset, body texture, typography hierarchy, links, reduced motion)
         ↓
interface/components.css   (Shared UI: shell, header, nav, buttons, cards, status pills, tables, grids)
         ↓
interface/kad.css          (Aggregator + Sofia v3 cockpit & graph explorer specific styles)
```
