# Reverse Contradiction & Stress Review (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Date**: 2026-08-30  
**Target Specification**: `docs/architecture/KAD_PI_IDEAL_STATE_V2.md`  
**Question**: *If we started from this final architecture today, which earlier decisions would appear inconsistent, redundant, over-specified, or unexpectedly expensive?*  

---

## 1. 24-Decision Reverse Consistency Matrix

| Decision ID | Domain ID | Target Architecture Consistency | Classification | Deliberation & Tension Analysis |
|---|---|---|---|---|
| **`DEC_ID_01`** | `PROJECT_IDENTITY` | Fully aligned with Personal OS & Research Lab core | `CONSISTENT` | Eliminates ambiguity between personal OS and autonomous factory. |
| **`DEC_ID_02`** | `TARGET_STAKEHOLDER` | Fully aligned with single project lead + trusted ring | `CONSISTENT` | Prevents premature multi-tenancy engineering. |
| **`DEC_ID_03`** | `SOVEREIGN_HUMAN_ROLE` | Fully aligned with Strategic Governor position | `CONSISTENT` | Maintains human control over charter, policy, and doctrine. |
| **`DEC_ID_04`** | `FAILURE_CONDITION` | Fully aligned with cognitive leverage metric | `CONSISTENT` | Subordinates raw token velocity to epistemic integrity. |
| **`DEC_ID_05`** | `AUTONOMY_BOUNDARIES` | Fully aligned with Tier-Tiered Bounded Autonomy | `CONSISTENT` | Clarifies where agents may act and where gates are hard. |
| **`DEC_ID_06`** | `KNOWLEDGE_PROMOTION` | Fully aligned with Human Epistemic Sovereignty | `CONSISTENT` | Models propose; human/evidence authorizes. |
| **`DEC_ID_07`** | `ECONOMIC_FINOPS` | Fully aligned with Zero-Marginal Spend by default | `CONSISTENT` | Metered API spend requires explicit per-WP human lease. |
| **`DEC_ID_08`** | `SECURITY_DOMAINS` | Fully aligned with Multi-Domain Isolation | `CONSISTENT` | Credentials isolated behind capability broker. |
| **`DEC_ID_09`** | `EXECUTION_TOPOLOGY` | Tiered Substrate (OMP + Local + Warren offload) | `REQUIRES_EXPERIMENT` | Warren value is gated under `EXP-KAD-WARREN-ASYNC-002`. |
| **`DEC_ID_10`** | `LOCAL_FIRST_OFFLINE` | Full-Core Autonomous Offline Baseline | `REQUIRES_EXPERIMENT` | Full offline proof gated under `EXP-KAD-OFFLINE-SURVIVAL-001`. |
| **`DEC_ID_11`** | `LOCAL_COMPUTE_ROLES` | Asymmetric Workstation (AMDY) vs Compute (TELL) | `REQUIRES_EXPERIMENT` | Dual-node offload gated under `EXP-KAD-TELL-PERSISTENT-005`. |
| **`DEC_ID_12`** | `GITHUB_OPERATING_MODEL`| Local Git sovereign, GitHub downstream projection | `CONSISTENT` | Matches proven WP-028A publication architecture. |
| **`DEC_ID_13`** | `RESEARCH_LIFECYCLE` | Tiered Epistemic Research Pipeline (R0-R4) | `CONSISTENT` | Governs claim extraction and triangulation. |
| **`DEC_ID_14`** | `KNOWLEDGE_STORAGE` | Canonical Vault (Markdown Authority) + Projections | `CONSISTENT` | Vector/graph indices remain rebuildable projections. |
| **`DEC_ID_15`** | `DISTILLATION_PIPELINE` | Offline Distillation into Tools & Specialists | `REQUIRES_EXPERIMENT` | Distillation engine gated under `EXP-KAD-DISTILLATION-006`. |
| **`DEC_ID_16`** | `CONTRADICTION_MGMT` | Explicit Contradiction Journaling | `CONSISTENT` | Fail-closed invalidation preserves historical provenance. |
| **`DEC_ID_17`** | `NATIVE_PM_CORE` | Lean Deterministic PM Kernel in workctl | `CONSISTENT` | Rejects bureaucratic Jira/Agile overhead. |
| **`DEC_ID_18`** | `WORKPACKAGE_DECOMP` | Hierarchical Evidence-Governed Decomposition | `CONSISTENT` | Explicit acceptance contracts bound agent tasks. |
| **`DEC_ID_19`** | `QUALITY_GATES` | Verification Independence (MUTATOR != VERIFIER) | `CONSISTENT` | Invariant prevents agent self-certification. |
| **`DEC_ID_20`** | `SCARCE_RESOURCES` | Human Attention > Epistemic Integrity > Cost | `CONSISTENT` | Guides all FinOps and cognitive tradeoffs. |
| **`DEC_ID_21`** | `OPEN_SOURCE_DEST` | Private Personal OS + Staged Research Release | `CONSISTENT` | Staged extraction prevents premature framework churn. |
| **`DEC_ID_22`** | `THREE_MONTH_TARGET` | Single-Node Personal OS & Research Substrate | `CONSISTENT` | Anchors immediate 3-month roadmap. |
| **`DEC_ID_23`** | `SIX_MONTH_TARGET` | Asymmetric Dual-Node Compute Fabric (AMDY + TELL) | `CONSISTENT` | Anchors intermediate 6-month roadmap. |
| **`DEC_ID_24`** | `TWELVE_MONTH_TARGET` | Mature Self-Distilling Personal OS & Lab | `CONSISTENT` | Anchors ultimate 12-month destination. |

---

## 2. Inherent Architectural Tensions & Resolution

1. **Local-First Autonomy vs Frontier Model Capability**:
   * *Tension*: Local models have smaller parameter counts; complex synthesis may tempt cloud escalation.
   * *Resolution*: Strict zero-marginal spend baseline with explicit per-WP human lease for metered frontier models.
2. **Offline Completeness vs Broad Research Scope**:
   * *Tension*: Offline research is bounded by the locally downloaded corpus.
   * *Resolution*: Explicit distinction between connected ingestion and disconnected synthesis/reasoning.
3. **Zero Active Blockers or Contradictions**:
   * All 24 decisions harmonize into the unified Four-Plane Ideal State V2 architecture without logical contradiction.
