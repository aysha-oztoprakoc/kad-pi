# ADR 0010: Obsidian Knowledge Visualization and Plugin Governance

* **Status**: ACCEPTED
* **Date**: 2026-08-30
* **Author**: KAD-PI Architecture & Implementation Team
* **Authority**: Wayfinder + KAD Human Decision Gate
* **Supercedes**: None
* **Related ADRs**: ADR 0008 (Unified Knowledge Plane), ADR 0009 (Frontend & Visualization Stack)

---

## Context
The Obsidian vault (`vault/`) serves as the durable human-authored knowledge authority for the KAD ecosystem. We need to maximize visualization and navigation within Obsidian while preventing third-party plugins from mutating governed canonical frontmatter, introducing security risks, or creating proprietary metadata lock-in.

## Decision

### 1. Primary Knowledge & Visualization Hierarchy
* **Tier 1: Core Obsidian Features (Native First)**
  - Native **Properties** (frontmatter validation against `vault/00_Governance/PROPERTY_REGISTRY.md`).
  - Native **Bases** (`.base` views) for tabular, card, and list querying of frontmatter properties without JavaScript query lock-in.
  - Native **Mermaid** for deterministic, version-controlled architecture, sequence, and entity diagrams.
  - Native **Canvas** (`.canvas`) for freeform visual thinking and conceptual clustering.
  - Native **Graph View** and **Local Graph** for exploratory traversal.

### 2. Project-Owned Obsidian Integration Bridge (`kad-obsidian-bridge`)
* A small, project-owned Obsidian plugin designed to:
  - Operate **read-only** against governed canonical files (`00_Governance/`, `50_Projects/`, etc.).
  - Consume compiled JSON projections (`vault/90_Derived/Projections/`).
  - Render custom Bases views, telemetry sidecar panels, and typed graph neighborhood explorers.
  - Link projection records back to canonical Markdown notes without mutating source text.
  - Run with zero network permissions and zero shell execution privileges.

### 3. Curated Community Plugin Layer (Audited)
* **Approved for Evaluation & Canary Use**:
  - `Breadcrumbs`: Hierarchical (up/down/next/prev) and typed relationship navigation.
  - `Excalidraw`: Markdown-embeddable hand-drawn architectural sketching and visual planning.
  - `Mermaid Tools`: Enhanced visual editing for native Mermaid code blocks.
  - `Commander`: Status bar shortcuts and command palette customization.
* **Prohibited / High-Risk Plugins**:
  - Generic metadata mutators / form plugins that write unvalidated properties to notes.
  - Plugins requiring external cloud connectivity or telemetries.
  - Dataview / Templater as hard dependencies (Bases and native properties are the standard).

### 4. Graceful Degradation (GD) Invariant
* **Zero-Plugin Operational Guarantee**:
  - If **every community plugin is disabled or uninstalled**, the vault MUST remain 100% functional.
  - All notes remain valid standard Markdown with YAML frontmatter.
  - CLI linters (`bin/kad-wiki lint`), rebuilders (`bin/kad-wiki rebuild`), and tests execute without error.
  - Git history, search, and core navigation operate unhindered.

## Consequences

### Positive
- Prevents database lock-in or metadata corruption from unstable community plugins.
- Preserves complete portability of knowledge to any Markdown-compatible tool or Git host.
- Provides a clean path for project-owned custom UI without architectural debt.

### Negative / Trade-offs
- Advanced custom interactive widgets inside note bodies are constrained to project-owned bridge views rather than arbitrary community scripting.
