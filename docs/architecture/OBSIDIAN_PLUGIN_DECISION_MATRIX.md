# Obsidian Plugin Decision Matrix & Governance Guide

## 1. Governance Policy
Third-party Obsidian plugins are **view/editor enhancements only**. They must never acquire canonical mutation authority over governed frontmatter or create proprietary lock-in. The vault must remain 100% operational with **all plugins disabled**.

---

## 2. Comprehensive Candidate Scoring Matrix

| Plugin | Category | Maintenance | Security / Permissions | Metadata Safety | Lock-in Risk | GD Score | Decision | Justification |
|---|---|---|---|---|---|---|---|---|
| **Native Bases (`.base`)** | Core Feature | Active (Obsidian Team) | Sandbox (Internal) | High (Standard YAML) | None (Pure JSON/YAML) | **10/10** | **APPROVED** | Core Obsidian feature; provides declarative database views without JavaScript runtime lock-in. |
| **Native Properties** | Core Feature | Active (Obsidian Team) | Sandbox (Internal) | High (Type validation) | None | **10/10** | **APPROVED** | Primary property schema validator for all canonical notes. |
| **Native Mermaid** | Core Feature | Active (Obsidian Team) | Sandbox (Internal) | High (Text-based) | None (Standard Mermaid) | **10/10** | **APPROVED** | Preferred standard for version-controlled architecture & sequence diagrams. |
| **Native Canvas** | Core Feature | Active (Obsidian Team) | Sandbox (Internal) | High (Pure JSON canvas) | Low (Standard JSON) | **10/10** | **APPROVED** | Freeform visual clustering and spatial thinking. |
| **`kad-obsidian-bridge`** | Project Plugin | Maintained by KAD | Zero network / No shell | High (Strictly Read-Only) | None (Open projection) | **10/10** | **APPROVED (Build)** | Project-owned small plugin providing custom Bases views and projection navigation. |
| **Breadcrumbs** | Community (Curated) | Active (v3.10+) | Local only; no network | Medium (Reads links/props) | Low (Standard hierarchy) | **8/10** | **CANARY_EVAL** | Provides visual hierarchical navigation; reads standard frontmatter keys (`parent`, `up`, `down`). |
| **Excalidraw** | Community (Curated) | Very Active (Zsolt) | Local storage; high fidelity | High (Separate .excalidraw files) | Low (Standard format) | **9/10** | **CANARY_EVAL** | Hand-drawn diagramming; renders inline without altering note markdown bodies. |
| **Mermaid Tools** | Community (Curated) | Active | Local visual editor | High (Emits standard Mermaid) | None | **9/10** | **CANARY_EVAL** | Visual GUI helper for writing standard Mermaid blocks. |
| **Commander** | Community (Curated) | Active | Customizes UI buttons/hotkeys | High (No note mutation) | None | **9/10** | **APPROVED** | Non-invasive UI customization for quick commands and status bar links. |
| **Dataview** | Community (Conditional) | Maintenance mode | In-memory JS eval | Medium (Encourages JS in notes) | High (Dataview query syntax) | **5/10** | **AVOID / CONDITIONAL** | Heavy query engine; unnecessary given native Bases; risks syntax lock-in. |
| **Templater** | Community (Conditional) | Active | Arbitrary JS execution | Low (Unchecked note mutation) | High (Custom template tags) | **4/10** | **REJECT (Security)** | Arbitrary Node/Electron execution poses unacceptable security/sandbox risk. |
| **Meta Bind** | Community (Conditional) | Active | Direct frontmatter mutation | Low (Unbounded form edits) | High | **4/10** | **REJECT (Mutation)** | Interactive input forms risk writing unvalidated metadata into canonical notes. |

---

## 3. Graceful Degradation (GD) Audit

To prove full graceful degradation:
1. **Disable All Plugins**: Turn off all community plugins via Obsidian settings.
2. **Observe**:
   - Every note is readable standard Markdown.
   - Frontmatter remains compliant with `PROPERTY_REGISTRY.md`.
   - `.base` files continue rendering in Obsidian v1.8+.
   - Mermaid diagrams render natively.
   - `./bin/kad-wiki lint` and `./bin/kad-wiki rebuild` execute cleanly from CLI.
3. **Verdict**: **PASS** (Zero dependency on third-party runtime state).
