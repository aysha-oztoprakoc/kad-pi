# Implementation Matrix & Gap Analysis: Compute Fabric Probe (WP-021 Phase 7)

## 1. Frozen Ideal State Reference
- **Markdown Digest**: `9f939606b4effaa3b9a7288890f861034b188f472121665356a1dfcb4e64ed90` (`docs/architecture/KAD_COMPUTE_FABRIC_IDEAL_STATE_V1.md`)
- **JSON Schema Digest**: `7311153ae9230f85786d22cf532298a81f8191a87938c5e30879ba1ea8ee37e6` (`docs/architecture/KAD_COMPUTE_FABRIC_IDEAL_STATE_V1.json`)

---

## 2. Requirement-to-Implementation Gap Matrix

| Requirement | Existing Mechanism | Status | Proposed Implementation | Test Coverage | Evidence |
|---|---|---|---|---|---|
| **9-Tuple Schema Representation** | ISA definition | `MATCH` | `tools/kad/compute/tuple.mjs`: `parseExperimentalTuple()`, `validateTuple()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **11-Metric Telemetry Normalization** | `tools/kad/telemetry/` | `MATCH` | `tools/kad/compute/metrics.mjs`: `normalizeProbeMetrics()`, `calculateScarceCost()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **Confounder & Thermal Baselining** | `amdgpu_top` toolchain | `MATCH` | `tools/kad/compute/confounder.mjs`: `captureEnvironmentBaseline()`, `isolateWarmup()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **Deterministic Probe Runner** | N/A (New Seam) | `MATCH` | `tools/kad/compute/probe-runner.mjs`: `runBenchmarkProbe()`, `executeProbeSession()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **OMP Plugin Admission Validator** | ADR 0011 / WP-021 Spec | `MATCH` | `tools/kad/compute/admission.mjs`: `validateExtensionAdmission()`, `verifyPrecedence()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **Evidence Receipt Serialization** | JSONL journals | `MATCH` | `tools/kad/compute/evidence-recorder.mjs`: `recordProbeReceipt()`, `verifyReceiptChain()` | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **Fail-Safe Degradation** | `tools/kad/economic-router.mjs` | `MATCH` | `tools/kad/compute/degradation.mjs`: `createDegradedProbeState()`, fail-closed fallback | `compute-probe.test.mjs` | `evidence/WP-KAD-COMPUTE-FABRIC-EXPERIMENTAL-PROBE-021/` |
| **Live Multi-Plugin Installation** | Candidate evaluations | `DEFERRED` | Deferred to follow-on bounded canary WPs per `D021-002` | N/A (Deferred) | `02-omp-capability-admission-evaluation.md` |
| **Multi-Node WAN Distributed RPC** | TELL host adapter | `DEFERRED` | Deferred to follow-on multi-host probe per `D021-001` / `D021-004` | N/A (Deferred) | `01-wayfinder-decision-map.md` |

---

## 3. Unexplained Deviations
- **Total Unexplained Deviations**: `0`
- All architectural choices are grounded in accepted decisions `D021-001`, `D021-002`, `D021-003`, and `D021-004`.
