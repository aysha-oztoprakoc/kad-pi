# Reconciled Workpackage Contracts (WP-016 .. WP-019)

## 1. WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016

- **ID**: `WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016`
- **Title**: Canonical Obsidian Bridge Plugin & Governed Visual Workspace Integration
- **Status**: `PROPOSED` (Unblocked / Ready for execution)
- **Priority**: 150
- **Mission**: Implement a project-owned, read-only Obsidian companion plugin (`kad-obsidian-bridge`) that renders compiled vault and compute ISA projections, custom Bases views, and local graph neighborhood exploration in Obsidian sidebars without gaining direct mutation authority over canonical vault state or derived projection files.
- **Previous Intent**: General visual workspace integration in Obsidian (initially provisionally numbered 015 in WP-012/013, then shifted to 016 in WP-015).
- **Scope**:
  - `tools/kad/obsidian-bridge/`: Plugin manifest and native ESM implementation.
  - Custom Bases views rendering compiled projection metadata (`projects.json`, `workpackages.json`, `isa-registry.json`, `isa-aesthetic.json`, `isa-compute-fabric.json`).
  - Interactive 1-hop and 2-hop local graph neighborhood view in Obsidian sidebar using canonical graph adapter.
  - Surface profile `surface.obsidian` compliance (Tier A/B theme tokens, WCAG AAA contrast >14:1, zero ambient looping motion, `NO_AUDIO_UI`).
  - Zero note mutation; zero network access; 100% offline local-first; graceful degradation on missing projections or disabled plugin.
- **Non-Scope**:
  - Direct uncontrolled mutation of vault markdown or derived JSON projections.
  - Installing untrusted community plugins.
  - Remote API calls or telemetry scraping.
  - Modifying production routing authority or executing un-sandboxed shell commands.
  - Paid API spend.
- **Owned Paths**:
  - `tools/kad/obsidian-bridge/`
  - `tools/kad/test/obsidian-bridge*.test.mjs`
  - `evidence/WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016/`
  - `.agents/work/WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016.json`
- **Dependencies**:
  - `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` (Graph and projection viewmodel schemas)
  - `WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014` (Design token foundation)
  - `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` (Aesthetic ISA tokens & `surface.obsidian`)
  - `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` (Multi-ISA projection discovery)
- **Authority Boundaries**:
  - *May Read*: `vault/90_Derived/Projections/`, `vault/00_Governance/`, `vault/` (markdown notes read-only)
  - *May Derive*: Local graph viewmodels, filtered Bases tables
  - *May Render*: Obsidian sidebar UI, Cytoscape graph neighborhood, Bases tables
  - *May Propose*: Formatted markdown links or human-reviewed edits
  - *May Mutate*: Plugin state / local Obsidian cache only
  - *Must Never Mutate*: Canonical vault notes directly, derived JSON projections, or runtime compute state.
- **Acceptance Criteria**:
  1. Project-owned read-only Obsidian bridge plugin implemented in ESM under `tools/kad/obsidian-bridge/`.
  2. Custom Bases views render compiled projection metadata (`projects.json`, `workpackages.json`, `isa-registry.json`, `isa-aesthetic.json`, `isa-compute-fabric.json`).
  3. Interactive 1-hop and 2-hop local graph neighborhood explorer rendered in Obsidian sidebar using canonical graph adapter.
  4. Strict `surface.obsidian` theme compliance with WCAG AAA contrast (>14:1), zero ambient looping motion, and `NO_AUDIO_UI`.
  5. Zero note mutation invariant verified: plugin operates as read-only observer of vault notes and derived projections.
  6. Zero network access and 100% offline local-first operation verified.
  7. Graceful degradation verified: missing projections or plugin disablement leaves raw Markdown editing 100% intact.
  8. Full test suite, ISA checks, and doctor diagnostics remain GREEN.

---

## 2. WP-KAD-AMDY-OMARCHY-CYBERDECK-THEME-017

- **ID**: `WP-KAD-AMDY-OMARCHY-CYBERDECK-THEME-017`
- **Title**: AMDY Omarchy 4 Quattro & Quickshell KAD Cyberdeck Theme Implementation
- **Status**: `PROPOSED` (Unblocked / Ready for execution)
- **Priority**: 140
- **Mission**: Implement the canonical Tier A diegetic cyberdeck presentation layer on developer workstation `amdy` across Omarchy 4 Quattro (Hyprland, Quickshell, Waybar/LayerShell, Foot/Kitty, Alacritty) enforcing `ISA-KAD-AESTHETIC-001` without turning desktop shell components into compute fabric architectural dependencies or granting UI widgets mutation authority over canonical state.
- **Previous Intent**: Desktop theme implementation for AMDY workstation.
- **Scope**:
  - Quickshell / QML / Wayland LayerShell theme widgets embodying Cyberpunk 2077 dataterm + occult clinical bureaucracy visual identity (`surface.amdy.quickshell`).
  - Hyprland window decorations, borders, and 45-degree polygon chamfer geometry (`surface.amdy.hyprland`).
  - Terminal 24-bit TrueColor profile and color schemes (`surface.terminal.omarchy`).
  - 200Hz event-driven state transitions (150ms–200ms duration, zero infinite ambient looping animations).
  - WCAG AAA contrast ratio (>14:1) enforcement for cyan/bone on dark ink/oxblood surfaces.
  - Strict `NO_AUDIO_UI` enforcement across all desktop widgets.
  - Graceful degradation to 0ms static/software rendering when compositor effects or GPU acceleration are disabled.
- **Non-Scope**:
  - Granting desktop UI widgets authority to execute mutating shell commands or alter compute routing.
  - Coupling desktop shell lifecycle to remote compute nodes or requiring live SSE daemons for basic theming.
  - Modifying the frozen R1 baseline of `surface.data_workspace`.
  - Arbitrary un-sandboxed shell command execution.
  - Paid API spend.
- **Owned Paths**:
  - `interface/themes/omarchy/`
  - `tools/kad/test/desktop-theme*.test.mjs`
  - `evidence/WP-KAD-AMDY-OMARCHY-CYBERDECK-THEME-017/`
  - `.agents/work/WP-KAD-AMDY-OMARCHY-CYBERDECK-THEME-017.json`
- **Dependencies**:
  - `WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014` (Design token foundation)
  - `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` (Aesthetic ISA tokens & `surface.amdy.*`)
  - `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` (Heterogeneous host definitions)
- **Authority Boundaries**:
  - *May Read*: `vault/90_Derived/Projections/isa-aesthetic.json`, `interface/tokens.css`, local host state
  - *May Derive*: Desktop theme variables, QML bindings
  - *May Render*: Hyprland borders, Quickshell HUD overlays, Wayland layer shell panels, terminal color schemes
  - *May Propose*: Desktop state notifications / status displays
  - *May Mutate*: Local desktop theme configuration files (`~/.config/hypr/`, `~/.config/quickshell/` exports)
  - *Must Never Mutate*: Canonical vault state, compute routing policy, or execute un-sandboxed arbitrary shell commands.
- **Acceptance Criteria**:
  1. Quickshell / QML / LayerShell theme widgets implement Tier A diegetic cyberdeck aesthetic (`surface.amdy.quickshell`) based on `ISA-KAD-AESTHETIC-001` tokens.
  2. Hyprland window decoration, border styling, and 45-degree polygon chamfer geometry configured for AMDY workstation (`surface.amdy.hyprland`).
  3. Terminal 24-bit TrueColor profile and color scheme configured (`surface.terminal.omarchy`).
  4. Event-driven 200Hz state transitions implemented with 150ms–200ms duration and zero infinite ambient looping animations.
  5. WCAG AAA contrast (>14:1) verified for cyan/bone on dark ink/oxblood backgrounds.
  6. Strict `NO_AUDIO_UI` enforcement verified across all desktop widgets.
  7. Zero shell mutation authority invariant verified (desktop UI cannot directly execute mutating commands).
  8. Graceful degradation verified: compositor or GPU failure drops cleanly to 0ms monospace / static rendering.
  9. Full test suite, ISA checks, and doctor diagnostics remain GREEN.

---

## 3. WP-KAD-TELL-SERVER-ANSI-PROFILE-018

- **ID**: `WP-KAD-TELL-SERVER-ANSI-PROFILE-018`
- **Title**: TELL Server Monospace ANSI Profile, Headless TUI & Host Observability Baseline
- **Status**: `PROPOSED` (Unblocked / Ready for execution)
- **Priority**: 130
- **Mission**: Harden the headless server presentation layer on `tell` (NixOS homelab node) with pure 16-color ANSI / 24-bit TrueColor monospace TUI profiles (`surface.tell.server`, `KAD_PROFILE_SERVER`), zero latency (0ms), zero GUI/audio dependencies, and establish the minimal host capability adapter contract required for compute fabric node discovery without conflating presentation hardening with distributed benchmark execution.
- **Previous Intent**: TELL Server Monospace ANSI Profile & TUI Hardening.
- **Scope**:
  - Monospace ANSI 16-color and 24-bit TrueColor palettes for headless terminal/TUI on `tell`.
  - High-density terminal status meters and compact ASCII/ANSI views for system and telemetry state.
  - Host-specific capability adapter contract for `host.tell.server` mapping into canonical capability contracts without leaking NixOS package managers or system paths into cognition policy.
  - Instant 0ms animation overhead and strict `NO_AUDIO_UI` enforcement.
  - Deterministic contrast validation on standard ANSI black/dark backgrounds exceeding 14:1.
  - Headless SSH and multiplexer (tmux/zellij) compatibility with zero X11/Wayland dependencies.
- **Non-Scope**:
  - Distributed inference runtime implementation or dynamic model loading daemons.
  - Full heterogeneous compute benchmarking suite execution across tell hardware.
  - Live SSE telemetry streaming daemon implementation.
  - NixOS system reconfiguration or unmanaged daemon deployment.
  - Paid API spend.
- **Owned Paths**:
  - `interface/themes/tell/`
  - `tools/kad/test/tell-profile*.test.mjs`
  - `evidence/WP-KAD-TELL-SERVER-ANSI-PROFILE-018/`
  - `.agents/work/WP-KAD-TELL-SERVER-ANSI-PROFILE-018.json`
- **Dependencies**:
  - `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` (Aesthetic ISA server profile `KAD_PROFILE_SERVER`)
  - `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` (Heterogeneous host definitions in `ISA-KAD-COMPUTE-FABRIC-001`)
- **Authority Boundaries**:
  - *May Read*: `vault/90_Derived/Projections/`, local system terminal capabilities
  - *May Derive*: Monospace TUI layouts, ANSI color maps
  - *May Render*: Headless ANSI 16-color / 24-bit TrueColor TUI, status meters
  - *May Propose*: Host capability descriptor (`tell` CPU/RAM/accelerator profile)
  - *May Mutate*: Local terminal profile configuration and CLI display adapters
  - *Must Never Mutate*: Production routing policy, canonical vault artifacts, or remote machine OS state.
- **Acceptance Criteria**:
  1. Monospace ANSI 16-color and 24-bit TrueColor palettes implemented for headless server profile (`surface.tell.server`, `KAD_PROFILE_SERVER`).
  2. High-density terminal status meters and compact ASCII/ANSI views render telemetry without graphical or audio dependencies.
  3. Host-specific capability adapter contract defined for `host.tell.server` without leaking NixOS package managers or system paths into cognition policy.
  4. Instant 0ms animation overhead and strict `NO_AUDIO_UI` verified.
  5. Deterministic contrast validation on standard ANSI black/dark backgrounds exceeds 14:1.
  6. Zero graphical or X11/Wayland dependencies verified over headless SSH and PTY multiplexers.
  7. Zero mutation authority over production routing or canonical vault verified.
  8. Full test suite, ISA checks, and doctor diagnostics remain GREEN.

---

## 4. WP-KAD-LIVE-TELEMETRY-STREAM-019

- **ID**: `WP-KAD-LIVE-TELEMETRY-STREAM-019`
- **Title**: Live PON/SSE Telemetry Streaming Transport & Read-Only Observer Projection
- **Status**: `PROPOSED` (Unblocked / Ready for execution)
- **Priority**: 120
- **Mission**: Implement lightweight Server-Sent Events (SSE) streaming transport in `tools/kad/interface-server.mjs` (`/api/telemetry/stream`), publishing typed PON state transition notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `QUOTA_REFRESHED`) and normalized `kad-telemetry-v1` records to read-only observers with strict authority boundary enforcement (zero direct write/control mutation over SSE transport).
- **Previous Intent**: Live SSE Telemetry Stream & Real-Time Control Plane (conflated telemetry streaming with runtime control authority).
- **Scope**:
  - Lightweight SSE streaming endpoint at `/api/telemetry/stream` in `tools/kad/interface-server.mjs`.
  - Event producer publishing typed PON state transition notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `QUOTA_REFRESHED`) and normalized `kad-telemetry-v1` records.
  - Monotonically increasing sequence IDs, event typing, and keep-alive heartbeats.
  - Client subscription handlers with automatic reconnect, backpressure handling, and graceful fallback to static `/api/runtime-status` polling.
  - Strict read-only outbound invariant: zero write routes or incoming control mutation over SSE transport.
  - Fail-safe client isolation: slow or disconnected clients are cleaned up cleanly without leaking server resources.
- **Non-Scope**:
  - Bidirectional WebSocket control plane or unauthenticated write routes.
  - Granting UI clients direct execution or routing mutation authority.
  - Synthetic workload generation or automated benchmarking daemon.
  - External cloud streaming brokers or third-party message queues (Redis, Kafka).
  - Paid API spend.
- **Owned Paths**:
  - `tools/kad/interface-server.mjs`
  - `tools/kad/telemetry/stream-adapter.mjs`
  - `tools/kad/test/interface-server-stream.test.mjs`
  - `evidence/WP-KAD-LIVE-TELEMETRY-STREAM-019/`
  - `.agents/work/WP-KAD-LIVE-TELEMETRY-STREAM-019.json`
- **Dependencies**:
  - `WP-KAD-USAGE-BRIDGE-002` (Telemetry normalization & provider adapters)
  - `WP-KAD-COUNTERFACTUAL-OBSERVATORY-004` (Journal & divergence telemetry)
  - `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` (Interface server foundation)
  - `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` (Compute fabric PON notification architecture)
- **Authority Boundaries**:
  - *May Read*: `tools/kad/telemetry/`, PON notification bus, `vault/90_Derived/Projections/`
  - *May Derive*: SSE event frames (`text/event-stream`)
  - *May Render / Transport*: Real-time outbound data stream
  - *May Propose*: Real-time status updates to clients
  - *May Mutate*: Ephemeral connection registry in memory
  - *Must Never Mutate*: Canonical vault artifacts, production routing authority, grant inbound write control.
- **Acceptance Criteria**:
  1. Lightweight Server-Sent Events (SSE) streaming endpoint implemented at `/api/telemetry/stream` in `tools/kad/interface-server.mjs`.
  2. Event producer publishes typed PON state transition notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `QUOTA_REFRESHED`) and `kad-telemetry-v1` records.
  3. Broadcast frames carry monotonically increasing sequence numbers, event types, and keep-alive heartbeats.
  4. Client subscription handlers support automatic reconnect, backpressure handling, and graceful fallback to static `/api/runtime-status` polling.
  5. Strict read-only outbound invariant verified: zero write routes or incoming control mutation over SSE transport.
  6. Fail-safe client isolation: slow or disconnected clients are cleaned up cleanly without leaking server resources.
  7. Full test suite, ISA checks, and doctor diagnostics remain GREEN.
