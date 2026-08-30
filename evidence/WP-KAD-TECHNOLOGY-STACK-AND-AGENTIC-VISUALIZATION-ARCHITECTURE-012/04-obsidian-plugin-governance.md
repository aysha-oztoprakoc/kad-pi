# Obsidian Plugin Governance Record — WP-KAD-TECHNOLOGY-STACK-AND-AGENTIC-VISUALIZATION-ARCHITECTURE-012

## 1. Governance Policy
- **Native-First**: Core Bases (`.base`), native Properties, native Mermaid, Canvas, and Graph view form the primary visualization tier.
- **Project Bridge Plugin**: Small, project-owned `kad-obsidian-bridge` operates strictly **read-only** over compiled JSON projections (`vault/90_Derived/Projections/`).
- **Curated Community Layer**:
  - `Breadcrumbs`: Approved for canary evaluation (hierarchical navigation).
  - `Excalidraw`: Approved for canary evaluation (hand-drawn sketching).
  - `Mermaid Tools`: Approved for canary evaluation (Mermaid editor helper).
  - `Commander`: Approved (UI custom commands).
  - `Dataview` / `Templater` / `Meta Bind`: Prohibited/Avoided due to security and mutation risks.
- **Graceful Degradation**: 100% operational guarantee with all plugins disabled.
