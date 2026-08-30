# Backlog Proposals & Open Decisions (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Date**: 2026-08-30  
**Status**: `NO ACTIVE ARCHITECTURAL BLOCKERS`  

---

## 1. Backlog Proposals (Future Architectural Workpackages)

1. **`BP-KAD-COLLABORATOR-REPLICATION-PKG`**: Standalone replication package allowing trusted peers (2-5 collaborators) to run isolated KAD verification suites without full repository clones.
2. **`BP-KAD-OFFLINE-LLM-BENCHMARK-HARNESS`**: Automated benchmark suite evaluating local GGUF models on AMD Ryzen 7 7700 and Radeon RX 9060 XT (ROCm / Vulkan) for offline task execution.
3. **`BP-KAD-PROMPT-CACHE-TELEMETRY-BRIDGE`**: Granular tracking of prompt cache hit rates and context reuse efficiency in the observatory plane.

---

## 2. Open Decisions Register

* **Status**: **`ZERO ACTIVE BLOCKERS`**
* All 24 canonical alignment decisions were authoritatively resolved by the project lead in the alignment session (`DEC_ID_01` to `DEC_ID_24`).
* Zero contradictory requirements detected during reverse contradiction review.
* Gated candidate architectures (Warren, Beads, OpenViking, TELL Persistent Worker) are properly isolated in the **`EXPERIMENT PLANE`** with explicit empirical qualification thresholds.

---

## 3. Successor Frontier Handoff

The immediate next workpackage frontier is unblocked:
# `WP-KAD-COGNITIVE-TELEMETRY-031` & `WP-KAD-GOVERNANCE-GATES-032`
* Establish empirical human cognitive attention baseline and harden deterministic governance gates.
