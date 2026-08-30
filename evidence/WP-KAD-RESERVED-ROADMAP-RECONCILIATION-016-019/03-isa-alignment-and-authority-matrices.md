# ISA Alignment & Authority Matrices

## 1. ISA Invariant Alignment Matrix

| Invariant | WP-016 (Obsidian) | WP-017 (AMDY Omarchy) | WP-018 (TELL Server) | WP-019 (Live SSE) | WP-021 (Empirical Probe) | Rationale & Architectural Rule |
|---|---|---|---|---|---|---|
| **PON (Notification-Oriented Paradigm)** | `RELEVANT` | `RELEVANT` | `RELEVANT` | `REQUIRED` | `REQUIRED` | WP-019 is the core transport broadcasting typed PON notifications (`NODE_AVAILABLE`, `MODEL_READY`, `CAPABILITY_REMOVED`, `ROUTE_STALE`, `QUOTA_REFRESHED`). WP-021 measures notification overhead. Others react punctually to state changes without polling. |
| **STC Spatial Composability** | `RELEVANT` | `RELEVANT` | `REQUIRED` | `RELEVANT` | `REQUIRED` | WP-018 establishes the `host.tell.server` capability contract without leaking NixOS into cognition policy. WP-021 exercises local hardware capability limits. WP-016/017 adapt to host profiles without machine identity coupling. |
| **STC Temporal Composability** | `RELEVANT` | `RELEVANT` | `RELEVANT` | `REQUIRED` | `REQUIRED` | WP-019 manages client subscription lifecycles with explicit teardown and zero leak. WP-021 enforces strict LIFO teardown for models, VRAM allocations, and benchmark worker processes. |
| **TDD Directives** | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | All packages require automated deterministic contract tests and doctor diagnostics before promotion. |
| **Graceful Degradation** | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | WP-016 degrades to raw Markdown editing; WP-017 drops to 0ms monospace / static rendering; WP-018 falls back to pure 16-color ANSI; WP-019 falls back to static snapshot polling; WP-021 fails closed on GPU/runtime probe failure. |
| **TOKENMAXXING Objective** | `RELEVANT` | `RELEVANT` | `RELEVANT` | `REQUIRED` | `REQUIRED` | WP-019 pushes real-time diffs, eliminating repeated polling overhead. WP-021 measures objective $\frac{\text{accepted useful work}}{\text{scarce resources used}}$. |
| **Authority Separation** | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | Presentation and transport layers have zero authority to mutate canonical vault state or production compute routing. |
| **Local-First & Offline** | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | All 5 packages operate 100% offline with zero external cloud or CDN dependencies. |
| **Renderer Neutrality** | `RELEVANT` | `RELEVANT` | `RELEVANT` | `RELEVANT` | `NOT_APPLICABLE` | Design tokens in `ISA-KAD-AESTHETIC-001` project into CSS, QML, and ANSI without semantic drift. |
| **Epistemic Honesty** | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | `REQUIRED` | 3-tier epistemic styling and 4-way redundant visual encoding (Color + Border + Badge + Shape) strictly enforced. |

---

## 2. Authority Matrix

| Workpackage | May Read | May Derive | May Render | May Propose | May Mutate | Must Never Mutate |
|---|---|---|---|---|---|---|
| **WP-016** (Obsidian Bridge) | `vault/90_Derived/Projections/`, `vault/00_Governance/`, `vault/*.md` | Local graph viewmodels, filtered Bases tables | Obsidian sidebar, Bases views, local Cytoscape graph | Markdown link suggestions, frontmatter patches | Plugin local cache / settings | Canonical vault notes directly, derived JSON projections, routing state |
| **WP-017** (AMDY Omarchy) | `vault/90_Derived/Projections/isa-aesthetic.json`, `interface/tokens.css` | Desktop theme variables, QML bindings | Hyprland borders, Quickshell HUD, terminal styling | Desktop state notifications | Local desktop theme files (`~/.config/` exports) | Canonical vault, compute routing policy, execute raw shell commands |
| **WP-018** (TELL Server) | `vault/90_Derived/Projections/`, terminal capabilities | Monospace TUI layouts, ANSI color maps | Headless ANSI/TrueColor TUI, status meters | Host capability descriptor (`tell`) | Local terminal profile configuration | Production routing policy, canonical vault, remote machine OS state |
| **WP-019** (Live SSE Stream) | `tools/kad/telemetry/`, PON notification bus, `vault/90_Derived/Projections/` | SSE event frames (`text/event-stream`) | Real-time outbound data stream | Real-time status updates to clients | Ephemeral connection registry in memory | Canonical vault, production routing authority, grant inbound write control |
| **WP-021** (Empirical Probe) | `tools/kad/`, GPU metrics (`amdgpu_top`), model store | 9-tuple experimental benchmarks, telemetry metrics | Benchmark progress bars, tabular receipts | Route promotion recommendations | Append-only evidence receipts under `evidence/` | Production routing policy, canonical vault, execute unverified routes |

---

## 3. Ideal State Target Claims Advanced

| Workpackage | ISA Document | Claims Advanced | Target State Classification |
|---|---|---|---|
| **WP-016** | `ISA-KAD-AESTHETIC-001` | `ISA-KAD-AESTHETIC-001`, `002`, `003`, `007`, `010` (Surface `surface.obsidian`) | `CANONICAL_TARGET` → `CURRENT_CONFIRMED` upon implementation |
| **WP-016** | `ISA-KAD-COMPUTE-FABRIC-001` | `ISA-KAD-COMPUTE-011` (Presentation mutation isolation) | `CURRENT_CONFIRMED` |
| **WP-017** | `ISA-KAD-AESTHETIC-001` | `ISA-KAD-AESTHETIC-001` through `010` (Surface `surface.amdy.*`) | `CANONICAL_TARGET` → `CURRENT_CONFIRMED` upon implementation |
| **WP-017** | `ISA-KAD-COMPUTE-FABRIC-001` | `ISA-KAD-COMPUTE-007` (AMDY host profile), `ISA-KAD-COMPUTE-011` | `CANONICAL_TARGET` (Section 5) |
| **WP-018** | `ISA-KAD-AESTHETIC-001` | `ISA-KAD-AESTHETIC-003`, `005`, `007` (Surface `surface.tell.server`) | `CANONICAL_TARGET` → `CURRENT_CONFIRMED` upon implementation |
| **WP-018** | `ISA-KAD-COMPUTE-FABRIC-001` | `ISA-KAD-COMPUTE-007` (TELL server adapter boundary), `ISA-KAD-COMPUTE-011` | `CANONICAL_TARGET` (Section 5) |
| **WP-019** | `ISA-KAD-COMPUTE-FABRIC-001` | `ISA-KAD-COMPUTE-001` (PON typed notifications), `ISA-KAD-COMPUTE-006` (TOKENMAXXING), `ISA-KAD-COMPUTE-011` | `CANONICAL_TARGET` → `CURRENT_CONFIRMED` upon implementation |
| **WP-021** | `ISA-KAD-COMPUTE-FABRIC-001` | `ISA-KAD-COMPUTE-004` (Empirical route promotion), `ISA-KAD-COMPUTE-006`, `ISA-KAD-COMPUTE-009` (9-tuple schema) | `CANONICAL_TARGET` → `CURRENT_CONFIRMED` upon implementation |
