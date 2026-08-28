# WP-KAD-004 Implementation Manifest

**WorkPackage:** `WP-KAD-004`  
**Title:** Real Pi Harness Persistent World Runtime  
**Date:** 2026-08-28  

---

## 1. Components & Files Created / Modified

| Component | Path | Language / Tech | Role & Boundary |
|---|---|---|---|
| SDK Loader & Provenance | [`tools/kad/pi/sdk-loader.mjs`](file:///home/amdy/Work/tools/kad/pi/sdk-loader.mjs) | Node.js (ESM) | Dynamic loader for `@earendil-works/pi-coding-agent` with provenance validation. |
| Production Pi Adapter | [`tools/kad/pi-adapter.mjs`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs) | Node.js (ESM) | Unified adapter binding Pi SDK `queue_update` events to KAD PersistentSession with Cordis `Fiber.effect` unsubscription. |
| Real Pi World Runtime | [`tools/kad/pi/run-pi-world.mjs`](file:///home/amdy/Work/tools/kad/pi/run-pi-world.mjs) | Node.js (ESM) | Developer-facing runtime instantiating real `createAgentSession` and driving multi-turn world transitions. |
| Integration Test Suite | [`tools/kad/test/pi-real-persistent.integration.test.mjs`](file:///home/amdy/Work/tools/kad/test/pi-real-persistent.integration.test.mjs) | Node.js Test Runner | Real Pi SDK integration suite covering provenance, multi-turn persistence, PON selectivity, Cordis teardown, and failure tests PI-F1 to PI-F4. |
| Top-Level Build Target | [`Makefile`](file:///home/amdy/Work/Makefile) | GNU Make | `make test-pi-integration` target for reproducible execution. |

---

## 2. Provenance & Invariants

- **SDK Provenance**: `@earendil-works/pi-coding-agent` v0.84.3 located via `KAD_PI_SDK_ROOT`.
- **Authority Invariant**: Pi SDK is strictly transport and harness. Simulation authority and StateDiff truth remain 100% in deterministic C++ Validator/Resolver.
- **Provider Isolation**: Zero network or model provider calls during deterministic integration.
- **STC Ownership**: Subscription unsubscription closure is owned by Cordis Fiber effect.
