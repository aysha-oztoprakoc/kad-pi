# Canonical Authority Matrix & Lifecycle Invariants (WP-028)

**Date**: 2026-08-30  
**Epistemic Precedence**: Deterministic policy authorizes. Model proposes.

---

## 1. Exhaustive Authority Matrix

| Authority Domain | Canonical Owner | Subordinate Entities | Invariants & Enforcement Mechanism |
|---|---|---|---|
| **Human Intent** | Human Project Lead (AMDY) | All automated agents | Wayfinder 5+1 protocol; human `AUTHOR_DECLARED` gating. |
| **Work Lifecycle** | `bin/workctl` | Execution providers, OMP, Warren, Beads | Single ledger authority in `.agents/work/`; strict state machine. |
| **Worktree Mutation** | STC Lease Manager (`stc-lease.mjs`) | Builder workers | `fusion_writer_lease` required; single concurrent writer per worktree. |
| **Durable Truth** | KnowledgePlane (`vault/`) | Derived wiki, site, Sofia, OpenViking | Flat property registry; `kad-wiki lint`; anti-poisoning filter. |
| **Cognitive Guidance** | 15 Canonical Skills | Agents executing turns | Guidance only; zero mutation authority over ledger or claims. |
| **Role Boundaries** | Role Contracts (`config/roles/`) | Dispatched agents | Schema validation; max spawn depth 2; verifier independence. |
| **Execution Runs** | Workload Providers (OMP, Pi, Warren) | Subagent processes | Owns run lifecycle only; generates receipts; cannot mutate work state. |
| **Graph Queries** | Intent Projections (Sofia, Beads) | Analytics viewmodels | Direction `workctl -> Beads` ONLY; read-only DAG projections. |
| **External Doctrine** | Research Upstream (Agentic Eng.) | Hypothesis generators | Epistemic class `PRACTITIONER_DERIVED`; evidence required for promotion. |
| **Literature Search** | Research Providers (DeepAPI, Zotero) | Research adapters | Epistemic provenance retention; zero synthetic citations. |
| **Presentation/TUI** | Presentation Providers (Sofia, Tell, Omarchy) | UI widgets | Zero shell mutation authority; fail-safe static fallbacks. |

---

## 2. Invariants Check Matrix

- [x] **Invariant 1**: `WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE` (Enforced in `tools/kad/workload-contract.mjs` & `workload-contract.test.mjs`).
- [x] **Invariant 2**: Model/provider neutrality in workload contracts (Enforced in `tools/kad/workload-contract.mjs`).
- [x] **Invariant 3**: Warren cannot autonomously merge or mutate work claims (Enforced in `tools/kad/external-providers.mjs` & `external-provider-authority.test.mjs`).
- [x] **Invariant 4**: Beads authority direction is strictly `workctl -> Beads` (Enforced in `tools/kad/external-providers.mjs`).
- [x] **Invariant 5**: `EXECUTION != LEARNING` (Enforced in `tools/kad/external-providers.mjs`).
- [x] **Invariant 6**: Interactive control roles cannot be offloaded (Enforced in `tools/kad/test/role-contract-safety.test.mjs`).
- [x] **Invariant 7**: Verifier independence between builder and reviewer (Enforced in `tools/kad/role-contract.mjs`).
- [x] **Invariant 8**: Zero shell mutation authority for presentation layers (Enforced in `tools/kad/external-providers.mjs` & `ISA-KAD-AESTHETIC-001`).
