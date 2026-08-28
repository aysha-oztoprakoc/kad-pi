# WP-KAD-002 Implementation Manifest

**WorkPackage:** `WP-KAD-002`  
**Title:** End-to-End World Transition Vertical Slice  
**Date:** 2026-08-28  

---

## 1. Components & Files Created / Modified

| Component | Path | Language / Tech | Role & Boundary |
|---|---|---|---|
| C++ Authority CLI | [`kad-lab/src/kad/cli_main.cpp`](file:///home/amdy/Work/kad-lab/src/kad/cli_main.cpp) | C++20 | Deterministic CLI wrapper invoking `Validator::validate` and `Resolver::resolve`. Outputs single-line JSON. |
| Build System | [`kad-lab/Makefile`](file:///home/amdy/Work/kad-lab/Makefile) | GNU Make | Builds `build/test_experiment001` and `build/kad_engine_cli`. |
| Interpretation Layer | [`tools/kad/interpreter.mjs`](file:///home/amdy/Work/tools/kad/interpreter.mjs) | Node.js (ESM) | Untrusted text-to-`CandidateIntent` parser. Preserves smuggled fields in properties for rejection. |
| C++ Engine Bridge | [`tools/kad/bridge.mjs`](file:///home/amdy/Work/tools/kad/bridge.mjs) | Node.js (ESM) | Serializes line protocol, spawns C++ engine binary, parses validation/resolution JSON. |
| State Primitives | [`tools/kad/state.mjs`](file:///home/amdy/Work/tools/kad/state.mjs) | Node.js (ESM) | Canonical state initialization, deep equality, and SHA-256 state hashing. |
| Causal Journal | [`tools/kad/journal.mjs`](file:///home/amdy/Work/tools/kad/journal.mjs) | Node.js (ESM) | Append-only JSONL logger recording turns with monotonic IDs, hashes, and provenance. |
| Orchestrator | [`tools/kad/orchestrator.mjs`](file:///home/amdy/Work/tools/kad/orchestrator.mjs) | Node.js (ESM) | Single-turn execution pipeline tying interpreter, C++ bridge, state invariants, and journal together. |
| Turn CLI | [`tools/kad/run-turn.mjs`](file:///home/amdy/Work/tools/kad/run-turn.mjs) | Node.js (ESM) | Developer-facing entry point (`node tools/kad/run-turn.mjs --input "<text>"`). |
| Pi Session Adapter | [`tools/kad/pi-adapter.mjs`](file:///home/amdy/Work/tools/kad/pi-adapter.mjs) | Node.js (ESM) | Binds Pi SDK `createAgentSession` / `session.subscribe()` to world turn pipeline with clean teardown. |
| Public Barrel | [`tools/kad/index.mjs`](file:///home/amdy/Work/tools/kad/index.mjs) | Node.js (ESM) | Public exports. |
| Integration Tests | [`tools/kad/test/world-turn.test.mjs`](file:///home/amdy/Work/tools/kad/test/world-turn.test.mjs) | Node.js Test Runner | Complete T1-T8 test suite and failure injection. |

---

## 2. Invariant Verification

- `ROLE != MODEL` and `ROLE != PROVIDER`: No model names or provider tokens embedded in domain logic.
- `CandidateIntent` is untrusted data: Cannot mutate state or bypass C++ `Validator`.
- Rejection leaves `GameState` byte-for-byte invariant: Verified via SHA-256 hash comparison.
