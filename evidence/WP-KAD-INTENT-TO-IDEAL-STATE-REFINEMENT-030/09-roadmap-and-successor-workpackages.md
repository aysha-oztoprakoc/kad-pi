# Roadmap & Bounded Successor Workpackages (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Date**: 2026-08-30  
**Source**: `docs/architecture/KAD_PI_IDEAL_STATE_V2.json`  

---

## 1. Strategic Roadmaps (3 / 6 / 12 Months)

### 1. 3-Month Destination: Robust Single-Node Personal Engineering OS & Empirical Research Substrate
* **Strategic Focus**: Boring reliability, single-node stabilization, knowledge hygiene, full offline proof, baseline telemetry, and security boundaries.
* **Key Milestones**:
  - `M1`: Full Offline Operational Baseline (`EXP-KAD-OFFLINE-SURVIVAL-001` PASS)
  - `M2`: Lean Deterministic PM Kernel & WBS/DAG Validation in `workctl`
  - `M3`: Strict Multi-Domain Security Sandbox & Capability Broker Prototype
  - `M4`: KnowledgePlane Contradiction Journal & Lifecycle State Machine
  - `M5`: Human Cognitive Attention & Intervention Telemetry Baseline

### 2. 6-Month Destination: Asymmetric Dual-Node Compute Fabric & Governed Asynchronous Pipelines
* **Strategic Focus**: Headless TELL offload, downward distillation engine, Warren async offload canary, semantic retrieval qualification.
* **Key Milestones**:
  - `M6`: Asymmetric Dual-Node Compute Fabric Operational (AMDY interactive + TELL batch)
  - `M7`: Downward Distillation Pipeline Eliminating Repeated Execution Errors
  - `M8`: Warren Detached Asynchronous Workload Canary Qualification
  - `M9`: ContextPlane Semantic Retrieval Benchmarking & Projection Integration
  - `M10`: Staged Open Research & Specification Publishing Framework

### 3. 12-Month Destination: Mature Self-Distilling Personal OS & Publishable Scientific Laboratory
* **Strategic Focus**: High-throughput human-AI co-design, publishable academic artifacts, reproducible benchmarks, and trusted collaborator replication.
* **Key Milestones**:
  - `M11`: Fully Self-Distilling Engineering & Research Operating System
  - `M12`: Submission-Ready Academic Research Artifacts & Reproducible ISAs
  - `M13`: Trusted-Ring Multi-Node Portability & Replication Package
  - `M14`: Formal Evaluation of Long-Term Open Source Framework Staging

---

## 2. Immediate Successor Workpackage Portfolio (WP-031+)

```text
WP-030 (Ideal State V2)
   ├── WP-KAD-COGNITIVE-TELEMETRY-031
   ├── WP-KAD-GOVERNANCE-GATES-032
   │      ├── WP-KAD-STC-SANDBOX-HARDENING-033
   │      └── WP-KAD-CAPABILITY-BROKER-037
   ├── WP-KAD-KNOWLEDGE-LIFECYCLE-034
   │      └── WP-KAD-CONTRADICTION-JOURNAL-040
   ├── EXP-KAD-OFFLINE-SURVIVAL-001
   └── EXP-KAD-WARREN-ASYNC-002
```

### Detailed Successor Specifications:

#### `WP-KAD-COGNITIVE-TELEMETRY-031`
* **Title**: Human Cognitive Attention, Intervention Friction & Outcome Cost Telemetry Baseline
* **Objective**: Measure human intervention count, friction events, rework, and cognitive fatigue.
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `tools/kad/telemetry/`, `tools/kad/observatory/`, `tools/kad/test/telemetry*.test.mjs`
* **Risk**: `MEDIUM` | **Resource**: `LOCAL_DETERMINISTIC`

#### `WP-KAD-GOVERNANCE-GATES-032`
* **Title**: Deterministic Governance Gates, Human Signature Verification & Main Merge Protection
* **Objective**: Implement hard fail-closed gates preventing unauthorized merges or policy changes.
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `bin/workctl`, `tools/workspace/governance-gates.mjs`
* **Risk**: `HIGH` | **Resource**: `LOCAL_DETERMINISTIC`

#### `WP-KAD-STC-SANDBOX-HARDENING-033`
* **Title**: STC Worktree Sandboxing, Subagent Isolation & Capability Lease Enforcement
* **Objective**: Prevent subagent authority leakage and out-of-scope filesystem mutations.
* **Dependencies**: `WP-KAD-GOVERNANCE-GATES-032`
* **Scope**: `tools/workspace/stc-lease.mjs`
* **Risk**: `HIGH` | **Resource**: `LOCAL_DETERMINISTIC`

#### `WP-KAD-KNOWLEDGE-LIFECYCLE-034`
* **Title**: KnowledgePlane State Machine, Epistemic Gating & Rebuildable Projection Pipeline
* **Objective**: Formalize the candidate -> verified -> promoted knowledge state machine.
* **Dependencies**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`
* **Scope**: `tools/kad/wiki/`, `bin/kad-wiki`, `vault/00_Governance/`
* **Risk**: `HIGH` | **Resource**: `LOCAL_DETERMINISTIC`

#### `WP-KAD-CAPABILITY-BROKER-037`
* **Title**: Multi-Domain Isolation & Capability-Scoped Credential Broker
* **Objective**: Eliminate raw ambient credentials from agent prompt contexts.
* **Dependencies**: `WP-KAD-GOVERNANCE-GATES-032`
* **Scope**: `tools/kad/security/`, `bin/kad-broker`
* **Risk**: `CRITICAL` | **Resource**: `LOCAL_DETERMINISTIC`

#### `WP-KAD-CONTRADICTION-JOURNAL-040`
* **Title**: Structured Contradiction Journal, Epistemic Conflict Invalidation & Fail-Closed Gating
* **Objective**: Prevent conflicting or invalidated claims from silently propagating into code.
* **Dependencies**: `WP-KAD-KNOWLEDGE-LIFECYCLE-034`
* **Scope**: `tools/kad/wiki/contradictions.mjs`, `vault/00_Governance/`
* **Risk**: `HIGH` | **Resource**: `LOCAL_DETERMINISTIC`
