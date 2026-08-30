# Surface and Host Matrix - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Host Capability Model

| Host | Role | Primary Hardware / Display | GPU & Rendering | Capability Profile | Primary Interfaces |
|---|---|---|---|---|---|
| **AMDY** | Primary Workstation | Dual-monitor: `HDMI-A-1` (1920x1080 @ 200Hz) + `DP-1` (1366x768 @ 60Hz) | AMD Navi 44 [Radeon RX 9060 XT] (Vulkan / ROCm) | `KAD_PROFILE_FULL` / `KAD_PROFILE_STANDARD` | Hyprland, Omarchy 4.0.1, Quickshell 0.3.1, Alacritty, Ghostty, Chrome/Brave, M908 Mouse |
| **TELL** | Homelab / Server | Headless / Remote SSH / Terminal | CPU / Integrated / Server GPU (No compositor dependency) | `KAD_PROFILE_SERVER` | Headless CLI, TUI (`bin/kad`, `bin/workctl`), SSH sessions, Systemd logs, Static Web |

---

## 2. Surface Matrix & Rendering Adapters

| Surface Identifier | Target Host(s) | Primary Renderer | Visual Tone & Density | Semantic Color Mapping | Motion & Effects | Implementation Readiness |
|---|---|---|---|---|---|---|
| **`surface.amdy.quickshell`** | AMDY | QML / Wayland LayerShell | Diegetic Cyberpunk + Occult Precision (High Density HUD) | Full Palette (Ink, Bone, Gold, Cyan, Red, Green, Amber, Purple) | Smooth 200Hz animations, radial modals, focus transitions | CANDIDATE (Spec Ready, Adapter Pending) |
| **`surface.amdy.hyprland`** | AMDY | Hyprland / Wayland | Industrial Brutalism (Thin borders, clean gaps) | Active Border: Gold/Cyan; Inactive: Ink/Line; Warning: Red | Window focus animations, workspace sliding | CANDIDATE (Spec Ready, Config Pending) |
| **`surface.terminal.omarchy`** | AMDY / TELL | ANSI / 24-bit TrueColor Terminal | Monospace Clinical Bureaucracy | Base 16 Theme: 00-07 Dark Inks, 08-15 Paper/Accents | Static / TUI cursor only | CANDIDATE (Spec Ready, Theme Pending) |
| **`surface.tell.server`** | TELL | Headless CLI / Systemd | Pure Monospace Minimalist | High contrast 16-color ANSI, zero decorative assets | None (0ms) | CANDIDATE (Spec Ready) |
| **`surface.web.sofia`** | AMDY / Remote | Cytoscape.js + Apache ECharts + DOM | Cyberdeck Cockpit & Scientific Explorer | Full Semantic Palette (Epistemic tiers: Gold/Cyan/Amber) | Graph physics layout, chart transitions | DIRECTIVE READY (v3 Implemented) |
| **`surface.web.site`** | Public Web / GitHub | Semantic HTML5 + Vanilla CSS | Academic & Governance Brief | Restrained Palette (High contrast Ink, Paper, Gold, Cyan) | CSS transition on focus/hover (0.15s) | DIRECTIVE READY (Modernized) |
| **`surface.docs.markdown`** | Repo / GitHub | Markdown + Mermaid.js | Clear Technical Literature | Clean high-contrast typography, semantic diagram nodes | None | DIRECTIVE READY (Standardized) |
| **`surface.data_workspace`** | AMDY | QML / Device Adapter | Industrial Physical Controller HUD | Status LEDs, 12 numbered action triggers | Responsive popup transitions on trigger | DIRECTIVE READY (R1 Frozen Baseline) |
| **`surface.obsidian`** | Future Workstation | Obsidian CSS / Bridge Plugin | Governed Knowledge Vault | Ink/Paper base, Canvas nodes, Graph view accents | None / Default editor transitions | PLANNED (WP-016 Target) |

---

## 3. Heterogeneous Output Strategy for AMDY
1. **Primary Screen (`HDMI-A-1` 1080p @ 200Hz)**:
   - Capable of full HUD overlays, 200Hz fluid motion, particle/radial launchers, and dense multivariant bar widgets.
2. **Secondary Screen (`DP-1` 1366x768 @ 60Hz)**:
   - Compact status bar, single-column inspector panels, zero horizontal overflow, 60Hz standard motion, zero heavy GPU blurs.
3. **Graceful Degradation Guarantee**:
   - Layouts must be responsive and adapt automatically to 768p viewport without clipping critical controls or text.
