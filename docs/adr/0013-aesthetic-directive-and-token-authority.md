# ADR 0013: Canonical Aesthetic Directive, Two-Tier Stratification & Renderer-Neutral Token Authority

## Context
KAD-PI encompasses multiple heterogeneous rendering surfaces across workstation (AMDY dual-monitor Hyprland/Quickshell/Omarchy), server/homelab (TELL headless CLI/TUI), scientific visualization (Sofia v3), public web brief (`site/`), and technical documentation. Previously, visual design tokens were defined in web CSS (`interface/tokens.css`) without formal cross-surface governance, risk of lore leakage into production code, or deterministic validation.

## Decisions

1. **Occult Cyberpunk + Clinical Bureaucracy Core Identity**:
   - Refined toward a **Cyberpunk 2077 dataterm/terminal aesthetic**: dark crimson/oxblood background planes (`#1a080a`, `#2b0d12`), electric cyan text/data streams (`#68d5e8`), black structural framing (`#050608`), and restrained sanctity gold (`#e7ba72`) for canonical authority.
2. **Two-Tier Stratified Presentation**:
   - **Tier A (Internal / Personal)**: Rich diegetic cyberdeck presentation on workstation, Sofia cockpit, and shell HUDs.
   - **Tier B (Public / Scientific)**: Clean, authoritative scientific literature on public website, GitHub README, and formal research docs with identical semantic tokens and zero unexplained narrative jargon.
   - **Invariant**: Stratification modulates presentation intensity, NOT semantic meaning.
3. **Renderer-Neutral Canonical Token Contract**:
   - Canonical design tokens are governed by the Ideal State Artifact (`vault/00_Governance/ISA-KAD-AESTHETIC-001.md`).
   - Downstream CSS (`interface/tokens.css`), QML theme properties, and terminal color palettes are deterministic projections/adapters validated by `bin/kad-isa`.
4. **State-Driven Motion & Explicit `NO_AUDIO_UI`**:
   - Transitions occur strictly on state changes (150ms–200ms); ambient looping animations are prohibited; sound UI is explicitly disabled (`NO_AUDIO_UI`).
5. **Deterministic ISA Validation Architecture**:
   - Tooling (`tools/kad/isa.mjs` and `bin/kad-isa`) executes deterministic validators from an allowlisted registry, strictly prohibiting arbitrary shell execution from markdown.

## Consequences
- **Positive**: Coherent visual identity across all surfaces; local-first asset guarantees; WCAG AAA text contrast (>14:1); deterministic auditability via `bin/kad-isa`.
- **Negative / Trade-offs**: Custom renderers must adhere strictly to the canonical token matrix; no ad-hoc decorative hex colors or ambient animations permitted without formal ISA amendment.
