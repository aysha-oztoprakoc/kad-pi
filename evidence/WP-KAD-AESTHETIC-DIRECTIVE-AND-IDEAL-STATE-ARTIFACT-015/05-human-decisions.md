# Human Decisions Record - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Governance & Protocol Context
- **Date**: 2026-08-30
- **Protocol**: KAD / Wayfinder 5+1 Decision Protocol + `/ask-me`
- **Authority**: Human Project Lead / System Architect

---

## 2. Accepted Human Decisions

### DECISION 1: Core Aesthetic Identity
- **Accepted Model**: **Occult Cyberpunk + Clinical Bureaucracy**, refined toward a **Cyberpunk 2077 terminal aesthetic**.
- **Primary Expression**:
  - **Surfaces**: Dark red / oxblood / crimson background planes (`#1a080a`, `#2b0d12`, `#3d121a`, deep crimson) paired with black and deep shadow structural framing (`#050608`, `#0a0b0f`, `#10131a`).
  - **Text & Diagnostics**: Cyan / electric blue readable text and data streams (`#68d5e8`, `#38bdf8`, `#7dd3fc`) providing high contrast (>14:1) over dark crimson/ink surfaces.
  - **Hierarchy & Sanctity**: Restrained gold (`#e7ba72`, `#fbbf24`) used sparingly for hierarchy, sanctity, or "approved/canonical" emphasis.
  - **Motifs**: Subtle geometric and ritual motifs acting as functional status anchors.
  - **Tone**: Functional, technical, diegetic interface language prioritizing high readability over spectacle.

### DECISION 2: Presentation Stratification & Public Boundary
- **Accepted Model**: **Two-Tier Stratified Presentation**.
  - **Tier A (Internal / Personal / Workstation / Sofia)**: Rich diegetic cyberdeck presentation featuring Cyberpunk 2077 terminal influence, crimson/oxblood fields, cyan diagnostics, dense telemetry HUD, symbolic geometry, controlled KAD/occult motifs, and HUD framing.
  - **Tier B (Public / Scientific / GitHub / Literature)**: Restrained technical presentation sharing the exact same semantic colors, typography relationships, geometry, and status language, but with significantly lower ornamentation and zero unexplained fictional terminology.
- **Inviolable Invariant**: Stratification modulates presentation intensity, NOT semantic meaning. Statuses, epistemic tiers, or visual roles must never alter meaning across internal and public surfaces.

### DECISION 3: Token Authority & Cross-Surface Architecture
- **Accepted Model**: **Renderer-Neutral Canonical Token Contract (ISA-driven)**.
  - The canonical ISA defines semantic visual roles, tokens, and constraints.
  - A machine-readable canonical token specification (`vault/90_Derived/Projections/isa-aesthetic.json` and registry) represents these accepted semantics.
  - Renderer-specific artifacts are deterministic projections/adapters:
    - `interface/tokens.css` (Web / Sofia / Site)
    - Quickshell / QML theme tokens (AMDY Workstation)
    - Omarchy / Terminal color palettes (CLI / TUI)
    - Documentation / Diagram theme mappings (Mermaid / Markdown)
    - Future Obsidian adapter tokens (WP-016)
  - Renderer outputs MUST NOT become independent authorities.

### DECISION 4: Motion, Transition & Auditory Policy
- **Accepted Model**: **State-Driven Motion + Explicit NO_AUDIO_UI**.
  - **Event-Driven Motion**: Motion occurs strictly on state changes (panel open/close, focus shift, state transition, notification arrival, stale -> fresh telemetry, PASS/FAIL transition, graph selection).
  - **Prohibition**: Ambient looping animations are prohibited by default.
  - **Transition Timing Envelope**:
    - Micro interactions: `80ms`–`120ms`
    - Ordinary UI transitions: `150ms`–`200ms`
    - Substantial spatial transitions: `200ms`–`300ms`
  - **Reduced Motion**: Nonessential animations disabled; transitions become instantaneous (`0.01ms`); all state information remains 100% visible and accessible.
  - **Auditory Baseline**: **`NO_AUDIO_UI`** across all standard KAD surfaces. Audio feedback is strictly prohibited from being required to understand system state.
