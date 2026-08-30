# Phase 6: Before & After Architecture Map

* **Workpackage**: `WP-KAD-SKILL-ROLE-FABRIC-024`
* **Topic**: Architecture Transformation Summary

---

## 1. High-Level Substrate Comparison

| Subsystem Dimension | Before (Pre-WP-024) | After (WP-024 Reconciled) | Architectural Impact |
|---|---|---|---|
| **Skill Surface** | 46 individual untyped skills in `.agents/skills/`. Frequent overlapping triggers and cognitive prompt bloat. | 15 canonical skills with typed classes (`PROCESS_DISCIPLINE`, `WORKFLOW`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `PRESENTATION`). | Clear cognitive routing, zero prompt collision, strict separation of concerns. |
| **Role Architecture** | Loose string roles in `.omp/config.yml` without schemas, mutation boundaries, or recursion limits. | `ROLE_CONTRACT_V1` schema with 15 typed role contracts in `config/roles/` and deterministic validation in `role-contract.mjs`. | Guaranteed authority isolation, max spawn depth of 2, verifier independence. |
| **Mutation Control** | Ad-hoc file writes bounded only by prompt instructions. | Exclusive mutating authority restricted to `kad-builder` holding an active `workctl` claim and `fusion_writer_lease`. All other roles `NONE`. | Zero accidental or unauthorized repository corruption. |
| **Workspace Leases** | Basic file locks. | STC Workspace Lease Manager (`stc-lease.mjs`) with path collision rejection and LIFO lifecycle. | Safe multi-task and parallel work isolation. |
| **Goal Iteration** | Unbounded prompt loops. | Bounded `KAD_GOAL_V1` engine (`goal-engine.mjs`) with strict iteration caps (default 5, max 10) subordinate to PON. | Guaranteed loop termination, zero infinite token burn. |
| **Wayfinder Engine** | Decision map generation only. | Wayfinder V2 with explicit PREFLIGHT formulation, INFLIGHT 5+1 human protocol, and POSTFLIGHT verification. | Complete end-to-end architectural lifecycle. |
| **Test Verification** | 646 unit/integration tests. | 679 unit/integration tests (+33 new tests for routing fixtures, role safety, STC leases, goal engine). | 100% test coverage over new structural contracts. |

---

## 2. Structural Topology Diagram

```text
BEFORE (Fragmented):
[46 Untyped Skills] ──> [Loose OMP Roles] ──> [Direct File Mutation (Unbounded)]

AFTER (Governed Unified Fabric):
[Human (5+1 ask-me)] ──> [Wayfinder V2] ──> [Planning Compiler] ──> [workctl Ledger]
                                                                          │ (Mutating Claim + Lease)
                                                                          ▼
[15 Canonical Skills] ──> [ROLE_CONTRACT_V1 (15 Roles)] ──> [kad-builder (Exclusive Mutation)]
                                                                          │ (TDD Red-Green Seam)
                                                                          ▼
                                                            [Independent Verifier (@verifier)]
                                                                          │ (Deterministic Evidence)
                                                                          ▼
                                                            [KAD KnowledgePlane / Vault]
```
