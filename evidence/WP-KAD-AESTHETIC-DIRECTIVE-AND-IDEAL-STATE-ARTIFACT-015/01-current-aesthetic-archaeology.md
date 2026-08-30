# Current Aesthetic Archaeology - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Executive Summary
This archaeological inspection surveys all active, experimental, and historical presentation assets across the KAD ecosystem, including:
1. Web & Visualization (`interface/`, `dashboard/`, `site/`)
2. Desktop & Shell (`~/.config/omarchy/`, Quickshell, `technopagan-netrunner/`, `data_workspace/`)
3. Worldbuilding & Lore Corpus (`kad-rpg/`, `CURRENT_THEME_AUDIT.md`, `KAD_AESTHETIC_MAP.md`)
4. Workstation & Host Realities (AMDY dual-monitor hardware, TELL server profile)

---

## 2. KAD Presentation Foundation (Web / Sofia / Site)
- **`interface/tokens.css`**: Defines CSS variables for dark ink surfaces (`--ink`, `--ink-raised`, `--ink-panel`, `--ink-canvas`), borders (`--line`, `--line-hot`, `--line-faint`), high-contrast paper text (`--paper`, `--muted`), cyberdeck accents (`--red`, `--red-deep`, `--gold`, `--cyan`, `--green`, `--amber`, `--blue`, `--purple`), monotonic typography scale, and semantic status mappings.
- **`interface/foundation.css`**: Box-sizing reset, cyberpunk radial/grid texture, typography hierarchy (`h1`–`h4`), visible `:focus-visible` ring (`--focus-ring: 3px solid var(--gold)`), accessible skip links, and `@media (prefers-reduced-motion)` override.
- **`interface/components.css`**: Modular layout panels (`.panel`, `.panel--accent`, `.panel--gold`, `.panel--cyan`), shell containers (`.shell`), buttons, data tables, status badges/chips, and flow visualizers.
- **`dashboard/` (Sofia v3)**: Cytoscape.js semantic graph explorer, Apache ECharts distribution charts, and real-time telemetry HUD snapshot.
- **`site/` (Public Brief)**: 6 static semantic pages (`index.html`, `architecture.html`, `research.html`, `knowledge.html`, `local-ai.html`, `roadmap.html`) consuming fail-closed public projections.

---

## 3. Desktop, Shell & QML Archaeology
- **Omarchy 4.0.1 on Arch Linux**: Running under Hyprland with Quickshell 0.3.1.
- **Active Theme**: Technopagan theme (`~/.config/omarchy/themes/technopagan`, `~/.config/omarchy/plugins/technopagan.*`).
- **Historical QML Components (`technopagan-netrunner/`)**:
  - `SummoningCircle.qml`: Radial agent launcher with keyboard/mouse navigation.
  - `DemiurgeMonitor.qml` / `DialecticalLedger.qml`: Dense left-panel inspector for system state and contradiction metrics.
  - `technopagan.core`: Single state authority with atomic `${XDG_RUNTIME_DIR}/technopagan/state.json` snapshot pattern.
  - `technopagan.bar`: Custom status bar with popouts, tooltips, and monitor variants.
- **`data_workspace` R1 Baseline**:
  - Independent 12-physical control device-scoped adapter (`04d9:fc4d USB_Gaming_Mouse` / Redragon M908).
  - 12 deterministic action hooks (`data.invoke.01` through `data.invoke.12`).
  - Frozen R1 baseline preserved without regression.

---

## 4. Worldbuilding Corpus & Aesthetic Anchors (`kad-rpg/`)
Extracted from `KAD_AESTHETIC_MAP.md` (DW-002 discovery artifact):
1. **Three-Force Polarity**:
   - **KHAYN**: Negative energy, condensed matter, brutalist-modern density, steel/concrete weight, restrained emergency blood-red (`#f05252` / `#a72b35`).
   - **ABHEL**: Positive energy, Sofia spark, spiritual/knowledge force, solarpunk/gnostic illumination, ordered symmetry, deliberate whitespace, aged gold (`#e7ba72`).
   - **DYSKORDYA**: Entropic force dissolving rigid structures, exposed connections, digital anarchy, diagnostic cold cyan (`#68d5e8`) and transient glitch/interference only on state change/fault.
2. **Clinical Bureaucracy & Biopolitical Precision**:
   - "South Fabricated" cold detached records, explicit KAT access tiers (0–11), timestamps, provenance IDs, and compact evidence rows.
   - Plain text and structured data are primary; decoration is strictly subordinate.
3. **Meaningful Blank Space**:
   - Unfilled space signals unverified or unknown state; no false completeness.
4. **Symbolic Discipline**:
   - Glyphs (alchemical, astrological, geometric) act as semantic state anchors, never as decorative wallpaper.

---

## 5. Engineering Lessons & Non-Negotiable Invariants
1. **Authority Separation**: Visual and shell decoration MUST NOT own system state or canonical mutation authority.
2. **No Lore Leakage**: Narrative worldbuilding concepts must not masquerade as technical system truth.
3. **No Brittle Universal Theme**: Semantic consistency across surfaces outranks pixel-identical renderer coupling.
4. **Graceful Degradation**: Disabling visual styling or GPU acceleration must leave tools fully functional.
