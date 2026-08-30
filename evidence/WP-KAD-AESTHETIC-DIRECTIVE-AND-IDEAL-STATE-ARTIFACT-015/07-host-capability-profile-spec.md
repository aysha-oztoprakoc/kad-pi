# Host Capability Profile Specification - WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015

## 1. Purpose
Defines the 4 standardized host capability profiles that modulate visual and interaction density across heterogeneous hardware without fracturing the single canonical semantic visual language.

---

## 2. Profile Definitions

### Profile 1: `KAD_PROFILE_FULL`
- **Target Surface**: AMDY Primary Display (`HDMI-A-1` 1920x1080 @ 200Hz, AMD Radeon RX 9060 XT / Navi 44 GPU).
- **Environment**: Hyprland + Quickshell 0.3.1 + Omarchy 4.0.1.
- **Visual Features**:
  - Full diegetic cyberdeck HUD with dark crimson background planes and electric cyan data streams.
  - 200Hz fluid UI transitions (150ms–200ms duration).
  - Multi-window radial launcher overlays (`SummoningCircle.qml`), dense dialectical ledgers, and interactive Cytoscape graph rendering.
  - Subtle dot-matrix grid textures, chamfered corner clipping, and hardware-accelerated status indicators.
- **Constraints**: Motion must remain event-driven (zero looping ambient distraction); reduced-motion drops animation time to 0.01ms.

### Profile 2: `KAD_PROFILE_STANDARD`
- **Target Surface**: AMDY Secondary Display (`DP-1` 1366x768 @ 60Hz) & Standard Laptops.
- **Environment**: Hyprland + Standard Browser / Secondary Quickshell variant.
- **Visual Features**:
  - Compact single-column inspector panels and streamlined status bars.
  - Standard 60Hz CSS/QML transitions (120ms–150ms).
  - High information density adapted to 768p vertical height without horizontal scrolling.
  - Heavy GPU blur and multi-layer particle effects disabled to conserve frame budget.

### Profile 3: `KAD_PROFILE_SERVER`
- **Target Surface**: TELL (Homelab / Server), Remote SSH, Headless Containers.
- **Environment**: Headless Linux / TUI / Terminal (`bin/kad`, `bin/workctl`, `journalctl`).
- **Visual Features**:
  - Pure 16-color ANSI / 24-bit TrueColor monospace presentation.
  - 0ms transition duration (instantaneous text rendering).
  - High-contrast ASCII/Unicode status glyphs (`[✓] PASS`, `[!] DEGRADED`, `[✗] FAIL`, `[?] UNKNOWN`).
  - Zero graphical, GPU, Wayland, or browser dependencies.

### Profile 4: `KAD_PROFILE_MINIMAL`
- **Target Surface**: Emergency TTY, degraded text terminals, screen readers, automated CI runners.
- **Environment**: Plain POSIX terminal / raw stdout.
- **Visual Features**:
  - Plain unstyled monochrome ASCII text with standard exit codes and explicit status strings.
  - Zero escape sequences or styling if `NO_COLOR=1` is set.
