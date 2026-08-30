# Dependency DAG & Execution Frontier

## 1. Complete Dependency Graph

```text
                  WP-012 (Tech Stack & Vis Architecture) [ACCEPTED]
                        │                          │
                        ▼                          ▼
                  WP-013 (Sofia v3)         WP-014 (Design System)
                   [REVIEW/ACCEPTED]              [ACCEPTED]
                        │                          │
                        │                          ▼
                        │                   WP-015 (Aesthetic ISA)
                        │                     [REVIEW/ACCEPTED]
                        │                          │
                        ▼                          ▼
                  WP-020 (Generalized ISA & Compute Fabric ISA)
                               [REVIEW/ACCEPTED]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┬──────────────────────────────┐
        │                              │                              │                              │
     [HARD]                         [HARD]                         [HARD]                         [HARD]
        ▼                              ▼                              ▼                              ▼
     WP-016                         WP-017                         WP-018                         WP-019
(Obsidian Bridge)             (AMDY Cyberdeck)               (TELL Server ANSI)             (Live SSE Stream)
 [PROPOSED/READY]               [PROPOSED/READY]               [PROPOSED/READY]               [PROPOSED/READY]
        │                              │                              │                              │
        └──────────────────────────────┴──────────────┬───────────────┴──────────────────────────────┘
                                                      │
                                                PARALLEL_SAFE
                                                      │
                                                      ▼
                                                   WP-021
                                            (Empirical Benchmark)
                                              [PROPOSED/READY]
```

---

## 2. Dependency Classification

| Target Package | Upstream Dependency | Dependency Type | Rationale |
|---|---|---|---|
| **WP-016** | `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` | HARD | Consumes graph viewmodel and Bases projection schemas. |
| **WP-016** | `WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014` | HARD | Consumes shared CSS token and theme foundation. |
| **WP-016** | `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` | HARD | Governed by `surface.obsidian` aesthetic profile and tokens. |
| **WP-016** | `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` | HARD | Consumes multi-ISA projection discovery (`isa-registry.json`). |
| **WP-017** | `WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014` | HARD | Consumes shared design token definitions in `interface/tokens.css`. |
| **WP-017** | `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` | HARD | Governed by `surface.amdy.*` Tier A diegetic cyberdeck profile. |
| **WP-017** | `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` | HARD | Implements `host.amdy.workstation` profile in `ISA-KAD-COMPUTE-FABRIC-001`. |
| **WP-017** | `WP-KAD-LIVE-TELEMETRY-STREAM-019` | SOFT / OPTIONAL | Desktop widgets may consume live SSE telemetry when available, but basic theming does not require a running SSE daemon. |
| **WP-018** | `WP-KAD-AESTHETIC-DIRECTIVE-AND-IDEAL-STATE-ARTIFACT-015` | HARD | Governed by `surface.tell.server` / `KAD_PROFILE_SERVER` ANSI profile. |
| **WP-018** | `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` | HARD | Implements `host.tell.server` profile in `ISA-KAD-COMPUTE-FABRIC-001`. |
| **WP-019** | `WP-KAD-USAGE-BRIDGE-002` | HARD | Consumes normalized `kad-telemetry-v1` schema and provider adapters. |
| **WP-019** | `WP-KAD-COUNTERFACTUAL-OBSERVATORY-004` | HARD | Consumes append-only telemetry journal events and divergence metrics. |
| **WP-019** | `WP-KAD-SOFIA-V3-CANONICAL-DASHBOARD-013` | HARD | Extends `tools/kad/interface-server.mjs` runtime server foundation. |
| **WP-019** | `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` | HARD | Broadcasts typed PON compute state notifications (`ISA-KAD-COMPUTE-001`). |
| **WP-021** | `WP-KAD-GENERALIZED-IDEAL-STATE-ARTIFACT-020` | HARD | Implements empirical 9-tuple benchmark schema and 11 telemetry metrics. |

---

## 3. Execution Frontier Analysis

### Execution State Summary:
- **`CAN_EXECUTE_NOW`**:
  - `WP-KAD-OBSIDIAN-BRIDGE-PLUGIN-016`: Ready for pickup.
  - `WP-KAD-AMDY-OMARCHY-CYBERDECK-THEME-017`: Ready for pickup.
  - `WP-KAD-TELL-SERVER-ANSI-PROFILE-018`: Ready for pickup.
  - `WP-KAD-LIVE-TELEMETRY-STREAM-019`: Ready for pickup.
  - `WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021`: Ready for pickup.

- **`PARALLEL_SAFE`**:
  - The set `{WP-016, WP-017, WP-018, WP-019, WP-021}` is 100% parallel-safe.
  - No package in this set owns paths overlapping with another.
  - No package in this set creates a mandatory blocking prerequisite for another in the set.

- **`BLOCKED`**:
  - Zero packages in the 016..019 set are blocked on each other.
