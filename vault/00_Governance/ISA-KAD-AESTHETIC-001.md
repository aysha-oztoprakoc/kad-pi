---
kad_id: ISA-KAD-AESTHETIC-001
title: KAD Aesthetic Ideal State Artifact (ISA)
type: governance
version: 1.0.0
status: ACCEPTED
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: CURRENT
owner: Human Project Lead & KAD Architecture
date: 2026-08-30
supersedes: []
related_adrs:
  - docs/adr/0009-frontend-and-visualization-technology-stack.md
  - docs/adr/0010-obsidian-knowledge-visualization-and-plugin-governance.md
  - docs/adr/0013-aesthetic-directive-and-token-authority.md
affected_surfaces:
  - surface.amdy.quickshell
  - surface.amdy.hyprland
  - surface.terminal.omarchy
  - surface.tell.server
  - surface.web.sofia
  - surface.web.site
  - surface.docs.markdown
  - surface.data_workspace
  - surface.obsidian
---

# KAD Aesthetic Ideal State Artifact (ISA)

## 1. Identity
- **ISA ID**: `ISA-KAD-AESTHETIC-001`
- **Title**: Canonical Aesthetic Directive, Cross-Surface Semantic Vocabulary & Ideal State Specification
- **Scope**: Comprehensive aesthetic governance across workstation (AMDY), server (TELL), web (Sofia/Site), desktop shell (Omarchy/Quickshell), documentation, and future Obsidian integrations.
- **Version**: `1.0.0`
- **Status**: `ACCEPTED`
- **Authority**: `CANONICAL` (Subjective requirements approved by Human Project Lead via `/ask-me`; objective requirements validated deterministically).

---

## 2. Stated Goal
Establish a single, coherent, recognizably distinct KAD visual language that adapts gracefully across heterogeneous hosts (workstation vs headless server) and presentation tiers (diegetic internal cyberdeck vs restrained scientific literature) without creating brittle cross-renderer dependencies or granting visual decoration mutation authority over canonical state.

---

## 3. Ideal State Description

### Visual Identity
A refined **Occult Cyberpunk + Clinical Bureaucracy** aesthetic, channeled through the functional lens of a **Cyberpunk 2077 dataterm/terminal interface**:
- **Field & Structure**: Dark crimson, oxblood, and black background planes (`#1a080a`, `#2b0d12`, `#0a0b0f`) framed with deep shadow structural containers.
- **Data & Text**: High-contrast electric cyan and ice-blue data streams (`#68d5e8`, `#38bdf8`) or crisp bone-paper prose (`#e7e8e6`), guaranteeing WCAG AAA contrast (>14:1).
- **Hierarchy & Sanctity**: Restrained sanctity gold (`#e7ba72`, `#fbbf24`) used sparingly to denote canonical authority, immutability, and verified governance.
- **Atmosphere**: Cold, precise, biopolitical clinical record-keeping with subtle geometric and alchemical state anchors, strictly avoiding generic neon pink washes, ambient scanlines, or decorative hacker wallpaper.

### Emotional & Interaction Qualities
- Focused, dense, authoritative, and diegetically immersive without being distracting.
- The interface feels like a high-stakes local cyberdeck operating terminal, where every token conveys system state, provenance, and truth.

### Cross-Host & Surface Consistency
- **AMDY Workstation**: Fluid 200Hz HUD overlays, chamfered viewports, and multi-monitor responsive geometry.
- **TELL Server / CLI**: Pure 16-color ANSI / TrueColor monospace TUI with 0ms transition overhead and zero graphical dependencies.
- **Public & Documentation Surfaces**: Clean, authoritative scientific presentation sharing the exact same semantic palette and geometry, stripped of unexplained narrative jargon.

---

## 4. Design Principles

1. **Meaning Before Decoration (PON)**: Every color hue, border style, badge, glyph, or transition must map to a verifiable system state or epistemic tier. Decoration for its own sake is prohibited.
2. **Stratification Without Semantic Drift**: Stratification modulates presentation intensity between internal and public surfaces; it never alters the semantic meaning of tokens or status indicators.
3. **Local-First & Zero Remote Dependencies**: All fonts, icons, stylesheets, and assets must be local-first. Zero external CDN, Google Fonts, or cloud theme dependencies.
4. **State-Driven Motion**: Motion occurs strictly in response to user actions or system state transitions (150ms–200ms). Ambient looping animations are prohibited.
5. **Auditory Silence (`NO_AUDIO_UI`)**: The system operates with zero audio bloat; audio feedback is never required to understand system status.
6. **Graceful Degradation (GD)**: The user interface must remain 100% usable when GPU acceleration, CSS, JavaScript, or custom fonts are disabled.

---

## 5. Surface Profiles

| Surface Identifier | Host Profile | Primary Renderer | Presentation Intensity | Motion Profile |
|---|---|---|---|---|
| `surface.amdy.quickshell` | `KAD_PROFILE_FULL` | QML / Wayland LayerShell | Tier A (Diegetic Cyberdeck) | 200Hz Event-Driven |
| `surface.amdy.hyprland` | `KAD_PROFILE_FULL` | Hyprland Config | Tier A (Industrial Framing) | Fast Sliding (150ms) |
| `surface.terminal.omarchy` | `KAD_PROFILE_FULL` / `SERVER` | 24-bit TrueColor Terminal | Tier A/B (Clinical Monospace) | 0ms Cursor Only |
| `surface.tell.server` | `KAD_PROFILE_SERVER` | ANSI 16-color TUI | Tier B (Headless Minimalist) | 0ms Instantaneous |
| `surface.web.sofia` | `KAD_PROFILE_FULL` / `STANDARD` | Cytoscape.js + ECharts + DOM | Tier A (Interactive Cockpit) | Smooth Physics Layout |
| `surface.web.site` | `KAD_PROFILE_STANDARD` | Semantic HTML5 + Vanilla CSS | Tier B (Scientific Public Brief) | CSS Transition (150ms) |
| `surface.docs.markdown` | `KAD_PROFILE_MINIMAL` | GitHub Markdown + Mermaid | Tier B (Technical Literature) | Static (0ms) |
| `surface.data_workspace` | `KAD_PROFILE_FULL` | QML / Physical M908 Adapter | Tier A (Physical Controller HUD) | Responsive Trigger |
| `surface.obsidian` | `KAD_PROFILE_FULL` | Obsidian CSS Bridge (WP-016) | Tier A/B (Governed Vault) | Editor Default |

---

## 6. Semantic Visual Vocabulary

### Color Roles
- `surface.canvas`: `#07090e` / `#050608` (Deepest structural framing)
- `surface.panel`: `#151923` / `#10131a` (Standard panel background)
- `surface.crimson`: `#2b0d12` / `#1a080a` (Active viewport & oxblood backdrop)
- `surface.lift`: `#1b202b` / `#24141a` (Elevated card & popout container)
- `text.primary`: `#68d5e8` (Cyan data text) / `#e7e8e6` (Bone paper prose)
- `text.secondary`: `#9da5b2` (Muted gray-blue secondary text)
- `text.faint`: `#515d70` (De-emphasized timestamps and lines)
- `semantic.canonical`: `#e7ba72` / `#fbbf24` (Sanctity Gold — Immutable Authority)
- `semantic.derived`: `#68d5e8` / `#38bdf8` (Diagnostic Cyan — Verifiable Synthesis)
- `semantic.heuristic`: `#f0c36d` / `#f59e0b` (Advisory Amber — Probabilistic Suggestion)
- `semantic.pass`: `#79d69a` / `#4ade80` (Verified Green — Healthy / Qualified)
- `semantic.fail`: `#f05252` / `#ef4444` (Emergency Red — Blocked / Error / Cost)
- `semantic.historical`: `#c084fc` / `#a855f7` (Abyssal Purple — Archived / Precedent)

### Typography
- **Monospace / UI**: `ui-monospace, SFMono-Regular, JetBrains Mono, Menlo, Liberation Mono, monospace`
- **Reading / Prose**: `Inter, ui-sans-serif, system-ui, -apple-system, Roboto, sans-serif`
- **Scale**: Monotonic clamp scale (`0.68rem` 2xs up to `2.5rem`–`4.5rem` hero display).

### Geometry & Texture
- **Borders**: Sharp 1px–2px structural lines (`#303746` base, `#68d5e8` hot).
- **Corners**: Brutalist 2px radius (`--radius: 2px`) or 45-degree cyberdeck polygon chamfers.
- **Texture**: Subtle background dot-matrix / grid overlays. Scanlines and glitch distortion are strictly transient error indicators.

---

## 7. Testable Claims

```yaml
claims:
  - id: ISA-KAD-AESTHETIC-001
    statement: "All public, dashboard, and documentation assets must be 100% locally hosted with zero remote CDN or Google Font dependencies."
    class: DETERMINISTIC
    validator: aesthetic.assets.local_only
    surfaces: [surface.web.site, surface.web.sofia, surface.docs.markdown]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/test/site-static-contract.test.mjs"

  - id: ISA-KAD-AESTHETIC-002
    statement: "All color styling in governed stylesheets must use registered semantic tokens without unmapped raw hex literals."
    class: DETERMINISTIC
    validator: aesthetic.tokens.no_unregistered_hex
    surfaces: [surface.web.site, surface.web.sofia]
    severity: HIGH
    status: PASS
    evidence: "tools/kad/test/design-tokens.test.mjs"

  - id: ISA-KAD-AESTHETIC-003
    statement: "Primary paper and cyan text on dark ink and crimson surfaces must exceed WCAG AAA contrast ratio (14:1)."
    class: DETERMINISTIC
    validator: aesthetic.contrast.text_readability
    surfaces: [surface.web.site, surface.web.sofia, surface.terminal.omarchy]
    severity: BLOCKER
    status: PASS
    evidence: "evidence/WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015/08-cross-surface-token-contract.md"

  - id: ISA-KAD-AESTHETIC-004
    statement: "Core stylesheets and UI presentation must not contain infinite looping ambient animations."
    class: DETERMINISTIC
    validator: aesthetic.motion.no_ambient_loop
    surfaces: [surface.web.site, surface.web.sofia, surface.amdy.quickshell]
    severity: HIGH
    status: PASS
    evidence: "interface/foundation.css"

  - id: ISA-KAD-AESTHETIC-005
    statement: "Canonical KAD baseline enforces explicit NO_AUDIO_UI with zero audio element or API dependencies."
    class: DETERMINISTIC
    validator: aesthetic.sound.no_audio_ui
    surfaces: [surface.web.site, surface.web.sofia, surface.tell.server]
    severity: HIGH
    status: PASS
    evidence: "tools/kad/test/interface-platform.test.mjs"

  - id: ISA-KAD-AESTHETIC-006
    statement: "All web and dashboard surfaces must provide accessible skip links and high-contrast visible focus rings."
    class: DETERMINISTIC
    validator: aesthetic.accessibility.skip_link_and_focus
    surfaces: [surface.web.site, surface.web.sofia]
    severity: BLOCKER
    status: PASS
    evidence: "interface/foundation.css"

  - id: ISA-KAD-AESTHETIC-007
    statement: "Desktop shell and UI presentation layers have zero authority to directly execute mutating canonical commands."
    class: DETERMINISTIC
    validator: aesthetic.governance.zero_shell_mutation
    surfaces: [surface.amdy.quickshell, surface.data_workspace]
    severity: BLOCKER
    status: PASS
    evidence: "tools/kad/test/authority.test.mjs"

  - id: ISA-KAD-AESTHETIC-008
    statement: "Internal workstation and Sofia cockpit embody the Cyberpunk 2077 terminal + Occult clinical bureaucracy aesthetic."
    class: HUMAN_REVIEW
    validator: aesthetic.identity.cyberpunk_2077_terminal
    surfaces: [surface.amdy.quickshell, surface.web.sofia]
    severity: HIGH
    status: PASS
    evidence: "evidence/WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015/05-human-decisions.md (Decision 1)"

  - id: ISA-KAD-AESTHETIC-009
    statement: "Public literature, website, and GitHub README maintain clean scientific presentation free of unexplained fictional lore."
    class: HUMAN_REVIEW
    validator: aesthetic.stratification.two_tier_balance
    surfaces: [surface.web.site, surface.docs.markdown]
    severity: HIGH
    status: PASS
    evidence: "evidence/WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015/05-human-decisions.md (Decision 2)"

  - id: ISA-KAD-AESTHETIC-010
    statement: "All epistemic tiers and health states use 4-way redundant visual encoding (Color + Border + Badge + Shape)."
    class: HYBRID
    validator: aesthetic.visualization.multi_redundant_encoding
    surfaces: [surface.web.sofia, surface.docs.markdown]
    severity: HIGH
    status: PASS
    evidence: "evidence/WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015/10-visualization-semantic-contract.md"
```

---

## 8. Operational Constraints
- **Renderer Independence**: Design tokens are canonical in the ISA; downstream CSS, QML, and ANSI files are projections.
- **Authority Boundaries**: Presentation layers are strictly read-only observers of canonical state.
- **Privacy & Fail-Closed Publication**: Public presentation surfaces consume only verified, approved public projections (`site/generated/public-state.json`).

---

## 9. Anti-Patterns
1. **Neon Wash Proliferation**: Adding generic neon pink/purple gradients or synthwave glows without semantic justification.
2. **Low-Contrast Glow Text**: Unreadable glowing text that violates WCAG contrast guidelines.
3. **Lore Leakage into Engineering**: Surfacing fictional terms (*Demiurge*, *Gnosis*, *Khayn*) in technical schemas or production CLI logs.
4. **Shell Mutation Authority**: Letting a UI button directly write to the canonical vault without passing through workctl/evidence gates.
5. **Remote Asset Leaks**: Linking external fonts (`fonts.googleapis.com`) or CDN scripts.
6. **Auditory Bloat**: Introducing unsolicited audio chimes or ambient soundscapes.

---

## 10. Graceful Degradation
- **No GPU / Software Rendering**: Drops to standard 60Hz or 0ms monospace rendering; chamfers and blurs become crisp 1px borders.
- **No JavaScript**: Static HTML and Markdown remain 100% readable with semantic hierarchies intact.
- **Reduced Motion**: All animations and transitions resolve instantaneously (`0.01ms`).
- **No Color (`NO_COLOR=1`)**: Text badges (`[CANONICAL]`, `[PASS]`, `[FAIL]`) and geometric shapes preserve 100% of state meaning.

---

## 11. Acceptance Matrix

| Claim ID | Class | Severity | Automated Validator | Target Surfaces | State |
|---|---|---|---|---|---|
| `ISA-KAD-AESTHETIC-001` | `DETERMINISTIC` | BLOCKER | `aesthetic.assets.local_only` | Web / Docs | `PASS` |
| `ISA-KAD-AESTHETIC-002` | `DETERMINISTIC` | HIGH | `aesthetic.tokens.no_unregistered_hex` | Web / CSS | `PASS` |
| `ISA-KAD-AESTHETIC-003` | `DETERMINISTIC` | BLOCKER | `aesthetic.contrast.text_readability` | Web / Terminal | `PASS` |
| `ISA-KAD-AESTHETIC-004` | `DETERMINISTIC` | HIGH | `aesthetic.motion.no_ambient_loop` | Web / Shell | `PASS` |
| `ISA-KAD-AESTHETIC-005` | `DETERMINISTIC` | HIGH | `aesthetic.sound.no_audio_ui` | All | `PASS` |
| `ISA-KAD-AESTHETIC-006` | `DETERMINISTIC` | BLOCKER | `aesthetic.accessibility.skip_link_and_focus` | Web / Cockpit | `PASS` |
| `ISA-KAD-AESTHETIC-007` | `DETERMINISTIC` | BLOCKER | `aesthetic.governance.zero_shell_mutation` | Shell / Device | `PASS` |
| `ISA-KAD-AESTHETIC-008` | `HUMAN_REVIEW` | HIGH | `aesthetic.identity.cyberpunk_2077_terminal` | Workstation | `PASS` |
| `ISA-KAD-AESTHETIC-009` | `HUMAN_REVIEW` | HIGH | `aesthetic.stratification.two_tier_balance` | Public / Docs | `PASS` |
| `ISA-KAD-AESTHETIC-010` | `HYBRID` | HIGH | `aesthetic.visualization.multi_redundant_encoding` | Visualization | `PASS` |

---

## 12. Change Log
- **2026-08-30 (v1.0.0)**: Initial establishment of the canonical KAD Aesthetic Ideal State Artifact (ISA) following WP-015 discovery, Wayfinder decision mapping, Grill adversarial review, and `/ask-me` human approval.
