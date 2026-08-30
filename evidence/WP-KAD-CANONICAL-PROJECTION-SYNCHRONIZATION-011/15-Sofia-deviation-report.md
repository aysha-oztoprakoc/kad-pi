# Sofia v3 Architecture Deviation Report — WP-KAD-CANONICAL-PROJECTION-SYNCHRONIZATION-011

Generated via `sofiaDeviationReport` in `tools/kad/wiki/projection.mjs`:

| Subsystem | Current State | Target State | Classification | Risk / Notes |
|---|---|---|---|---|
| **Knowledge Model** | Reads static namespaces from `wiki/generated/` | Consume canonical `VaultRecord` projection via `compileSofiaAdapter` | `DIRECT_COMPAT` | Adapter consumes normalized JSON feed with zero schema conflicts. |
| **Storage & Persistence** | File-based mock state and browser localStorage | Read-only adapter over `vault/90_Derived/Projections/` and live SSE runtime endpoint | `ADAPTER_REQUIRED` | Needs thin HTTP API or static JSON projection feed. |
| **Authority Boundaries** | Dashboard UI does not mutate backend state | Strict read-only presentation layer with explicit telemetry timestamps | `DIRECT_COMPAT` | Sofia retains zero mutation authority over vault or routing. |
| **Live Telemetry Integration** | Polls `/api/runtime-status` with 30s staleness threshold | Direct integration with KAD control-plane runtime status | `ADAPTER_REQUIRED` | Existing `runtime-status.mjs` is compatible with control plane view models. |
