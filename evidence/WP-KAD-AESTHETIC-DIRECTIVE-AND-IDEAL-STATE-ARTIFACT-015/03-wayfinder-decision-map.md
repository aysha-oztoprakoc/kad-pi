# Wayfinder Decision Map - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Decision Map Overview
This decision map decomposes aesthetic uncertainty across 12 bounded clusters to establish the canonical KAD Aesthetic Directive and Ideal State Artifact (ISA).

---

## 2. Decision Clusters & Options

### Cluster 1: Core Visual Identity & Diegetic Tension
- **D01.1 (Occult Cyberpunk with Clinical Bureaucracy)**: High-density dark ink field, monospace alignment, three-force polarity (KHAYN brutalist weight, ABHEL ordered gold illumination, DYSKORDYA diagnostic cyan entropy), restrained occult sigils as semantic anchors, strict clinical tone in engineering tools. *(Recommended)*
- **D01.2 (Strict Minimalist Terminal)**: Flat ANSI-only monochrome terminal aesthetics across all surfaces; strip all diegetic KAD lore, geometry, and polarities.
- **D01.3 (Maximalist Anime/Synthwave Cyberpunk)**: Neon glows, scanlines, glassmorphism, heavy animations, full fantasy lore integration everywhere.

### Cluster 2: Semantic Palette & Epistemic Color Mapping
- **D02.1 (Epistemic-Anchored 8-Token Cyberdeck Palette)**: Base Inks (`--ink` `#0a0b0f`, `--ink-panel` `#151923`), Paper text (`--paper` `#e7e8e6`, `--muted` `#9da5b2`), Canonical/Authority Gold (`--gold` `#e7ba72`), Derived/Diagnostic Cyan (`--cyan` `#68d5e8`), Verified/Pass Green (`--green` `#79d69a`), Warning/Degraded Amber (`--amber` `#f0c36d`), Error/Cost Red (`--red` `#f05252`), Deep/Historical Purple (`--purple` `#c084fc`). *(Recommended)*
- **D02.2 (Standard Web Palette)**: Generic Tailwind/Bootstrap blue/gray palette.

### Cluster 3: Typography & Local-First Font Chain
- **D03.1 (Local System & Monospace Precedence)**: High-legibility sans-serif (`Inter`, system-ui) for prose/body; high-density tabular monospace (`ui-monospace`, `JetBrains Mono`, `Liberation Mono`, `Menlo`) for code, HUDs, and data; zero external network webfonts. *(Recommended)*
- **D03.2 (Bundled Custom Display Fonts)**: Vendored occult/futuristic display font for headers.

### Cluster 4: Geometry, Borders & Chamfers
- **D04.1 (Industrial Brutalism with Sharp 2px Corners & Cyberdeck Chamfers)**: Sharp borders (`1px`–`2px` solid `--line`), subtle 45-degree chamfer cuts on prominent headers/panels, high panel density, zero bubbly rounded corners (`--radius: 2px`). *(Recommended)*
- **D04.2 (Soft Rounded UI)**: Standard 8px–16px border-radius, soft shadows.

### Cluster 5: Motion, Animation & Sound Policy
- **D05.1 (State-Driven Motion + Explicit NO_AUDIO_UI)**: Transitions occur only on state change (0.15s–0.2s); zero constant breathing/pulsing noise; reduced-motion mode drops duration to 0.01ms; sound UI is explicitly disabled (`NO_AUDIO_UI`). *(Recommended)*
- **D05.2 (Atmospheric Ambient Motion & Sci-Fi Chimes)**: Constant background aura animations and audio feedback on clicks.

### Cluster 6: Texture, Materials & Glitch Protocol
- **D06.1 (Opaque Inks + Subtle Dot Grid + Transient Glitch Only on Fault)**: Opaque/low-transparency dark panels for high contrast (>14:1); subtle background dot/grid texture; scanlines/glitch effects permitted strictly as transient indicators during error/degradation states, never ambient. *(Recommended)*
- **D06.2 (Heavy Glassmorphism & CRT Overlays)**: High blur, translucent backdrops, permanent CRT scanlines.

### Cluster 7: Iconography & Semantic Glyphs
- **D07.1 (Dual-Redundant Semantic Glyphs & Unicode)**: Small curated set of geometric, alchemical, and status glyphs (`[✓]`, `[!]`, `[✗]`, `[?]`, `⬡`, `◈`, `▲`); icons MUST always accompany or contain accessible text labels, never replace them. *(Recommended)*
- **D07.2 (Icon-Only Minimalist Controls)**: Icon-only buttons without text labels.

### Cluster 8: Professional / Public Boundary
- **D08.1 (Two-Tier Presentation Stratification)**:
  - *Tier 1 (Internal/Workstation/Sofia)*: Richer diegetic HUD, cyberdeck framing, dense operational metrics, three-force polarities.
  - *Tier 2 (Public Site/GitHub/Academic Papers)*: Clean, authoritative, evidence-backed scientific presentation with restrained cyberdeck accents and zero fictional lore jargon. *(Recommended)*
- **D08.2 (Uniform Diegetic Depth Everywhere)**: Same full occult cyberpunk theme applied to public academic papers and GitHub READMEs.

### Cluster 9: Token Authority & Cross-Surface Architecture
- **D09.1 (Renderer-Neutral Canonical Token Contract)**: The ISA defines the canonical semantic token vocabulary; a machine-readable JSON registry generates or validates adapters for CSS (`interface/tokens.css`), Quickshell/QML, and Terminal/Omarchy. *(Recommended)*
- **D09.2 (CSS-First Authority)**: Web CSS tokens remain the sole authority; other renderers scrape or hardcode values.

### Cluster 10: Host Capability Profiles
- **D10.1 (Four Explicit Capability Profiles)**:
  - `KAD_PROFILE_FULL` (AMDY 1080p @ 200Hz): Fluid transitions, full HUD density, radial launchers.
  - `KAD_PROFILE_STANDARD` (AMDY 768p @ 60Hz): Compact layout, single-column inspector, 60Hz motion.
  - `KAD_PROFILE_SERVER` (TELL CLI/Headless): Pure 16-color ANSI TUI, 0ms motion, zero GPU dependency.
  - `KAD_PROFILE_MINIMAL` (Degraded/TTY): Plain unstyled text. *(Recommended)*
- **D10.2 (Single Universal Profile)**: Force identical rendering regardless of hardware capability.

### Cluster 11: Multi-Redundant Visualization Semantics
- **D11.1 (Color + Border + Badge + Shape Epistemic Encoding)**:
  - *Canonical Authority*: Solid border, `--gold` accent, `[CANONICAL]` pill, circle/solid node.
  - *Derived Synthesis*: Dashed border, `--cyan` accent, `[DERIVED]` pill, diamond/dashed node.
  - *Heuristic Suggestion*: Dotted border, `--amber` accent, `[HEURISTIC]` pill, hexagon node.
  - *Unknown / Unverified*: Muted border, `--muted` accent, `[UNKNOWN]` pill, hollow square. *(Recommended)*
- **D11.2 (Color-Only Encoding)**: Encode authority and state solely by hue.

### Cluster 12: Anti-Patterns & Operational Invariants
- **D12.1 (Strict Governance Invariants)**:
  - Zero presentation-layer authority over canonical state.
  - Zero remote font, CDN, or cloud telemetry dependencies.
  - Zero unannounced sound or audio bloat.
  - Zero unreadable low-contrast glow text.
  - Zero ungrounded lore jargon in engineering diagnostics. *(Recommended)*
