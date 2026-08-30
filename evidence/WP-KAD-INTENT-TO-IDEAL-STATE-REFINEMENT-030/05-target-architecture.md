# Target Architecture Specification (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Target Specification**: `docs/architecture/KAD_PI_IDEAL_STATE_V2.md`  
**Governing Authority**: `PRIME_DIRECTIVE.md` & `INTENT_DECISION_EVENT_V1`  

---

## 1. System Architecture Decomposition

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ KAD-PI IDEAL STATE V2 ARCHITECTURE                                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. GOVERNANCE & SOVEREIGNTY PLANE                                                      │
│    • Human Strategic Governor (Sole Sovereign Authority)                              │
│    • Deterministic Policy Gates (Model Proposes -> Policy Authorizes)                  │
│    • Verification Independence (MUTATOR != VERIFIER != ACCEPTANCE)                     │
│    • Zero-Marginal Metered Spend FinOps Enforcement                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. PROJECT MANAGEMENT KERNEL (workctl)                                                 │
│    • WBS Decomposition & Hierarchical Task Contracts                                  │
│    • Acyclic Dependency DAG & Critical Path Engine                                    │
│    • STC Worktree Leases & Capability Sandboxing                                       │
│    • Decision, Risk, and Contradiction Registers                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. KNOWLEDGE & CONTEXT PLANE                                                           │
│    • Canonical Human-Readable Markdown Vault (Obsidian Authority)                      │
│    • Rebuildable Semantic/Graph Projections (Cytoscape, Vector Index)                  │
│    • Epistemic Status Gating & Contradiction Invalidation Journal                      │
│    • Capability-First Context Compiler (Vendor Agnostic)                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. SCIENTIFIC RESEARCH & DISTILLATION OPERATING SYSTEM                                 │
│    • Tiered Epistemic Research Pipeline (R0-R4 Classification)                         │
│    • Provenance-Verified Claim Extraction & Triangulation                              │
│    • Offline Distillation Engine (Validated Episodes -> Tools / Linters / Specialists) │
│    • Strict Decoupling: EXECUTION != LEARNING                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. ASYMMETRIC COMPUTE & EXECUTION FABRIC                                               │
│    • Workload Provider Abstraction (KAD_WORKLOAD_V1)                                   │
│    • Interactive Accelerated Node: AMDY Workstation (OMP Controller, Desktop GUI)      │
│    • Persistent Execution Node: TELL Server (Headless Batch, Eval Sweeps, Distill)     │
│    • Optional Evidence-Gated Detached Offload: Warren Canary                           │
│    • 100% Core Autonomous Offline Survival Baseline                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Invariant Boundary Rules

1. **Constitutional Abstraction**: Implementation technologies (e.g. Pure ESM, WireGuard, Cytoscape, NixOS) remain pluggable adapters rather than immutable constitutional requirements.
2. **Deterministic-First Routing**: Deterministic tools always outrank LLM reasoning for validation, linting, graph integrity, and lifecycle transitions.
3. **No Unbounded Memory Mutation**: Models never modify canonical knowledge or their own weights during live execution runs.
