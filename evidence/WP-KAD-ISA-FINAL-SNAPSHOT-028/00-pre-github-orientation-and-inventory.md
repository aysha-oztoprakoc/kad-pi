# Pre-GitHub Baseline Orientation & Inventory (WP-028)

**Date**: 2026-08-30  
**Repository**: `kad-pi`  
**Fixed Point**: `0ea896b54d799ca98fa3b45fe45f519655135807`  
**Epistemic Precedence**: Repository evidence is authoritative. Research proposes. Deterministic policy authorizes.

---

## 1. Executive Summary

This inventory establishes the comprehensive pre-GitHub operational baseline of KAD-PI prior to remote GitHub governance setup, branch protection, and commit synchronization.

All evidence and artifacts have been verified locally using deterministic tools. Zero external un-gated mutations or remote pushes have been executed.

---

## 2. Repository Inventory at Snapshot Time

### 2.1 Git Status & Commit Ancestry
- **Current Branch**: `main`
- **Head Commit SHA**: `0ea896b54d799ca98fa3b45fe45f519655135807`
- **Commit Message**: `feat(kad-fabric): execute WP-KAD-SKILL-ROLE-FABRIC-024 unified skills & role ISA`
- **Working Tree State**: Governed local modifications under WP-028 (ISA-002, workload schema, provider registry, role contracts, validation tests).

### 2.2 Core Architectural Metrics
| Metric | Value | Epistemic Status | Validator |
|---|---|---|---|
| **ISA Version** | `ISA-KAD-SKILL-ROLE-002 / v1.1.0` | `CONFIRMED` | `docs/architecture/KAD_PI_UNIFIED_SKILL_ROLE_ISA.md` |
| **Canonical Skills** | `15` | `CONFIRMED` | `tools/kad/test/skill-routing-fixtures.test.mjs` |
| **Logical Roles** | `15` | `CONFIRMED` | `tools/kad/test/role-contract-safety.test.mjs` |
| **Provider Taxonomy Classes** | `5` | `CONFIRMED` | `tools/kad/test/external-provider-authority.test.mjs` |
| **Registered External Providers** | `16` | `CONFIRMED` | `config/external-providers.json` |
| **Active Test Suites** | `675 Tests (100% Pass)` | `CONFIRMED` | `npm test` |
| **Workctl Health** | `HEALTHY (0 Errors)` | `CONFIRMED` | `bin/workctl doctor` |
| **KAD Doctor Health** | `PASS` | `CONFIRMED` | `bin/kad doctor` |
| **ISA Governance Projections** | `2 Discovered / 22 Passed Claims` | `CONFIRMED` | `bin/kad-isa check all` |
| **Vault Notes Count** | `64 Registered Notes` | `CONFIRMED` | `bin/kad-wiki lint` |

---

## 3. Epistemic Classification of Core Components

- **`PRIME_DIRECTIVE.md`**: `CONFIRMED` — Normative project constitution.
- **`workctl` Lifecycle Authority**: `CONFIRMED` — Deterministic ledger ownership.
- **`ROLE_CONTRACT_V2`**: `CONFIRMED` — Schema-validated roles with offload semantics.
- **`KAD_WORKLOAD_V1`**: `CONFIRMED` — Typed transient workload contract.
- **Warren Execution Provider**: `CANARY_PLANNED` — Subordinate factory-floor candidate.
- **Beads Graph Projection**: `SHADOW_CANARY` — Subordinate read-only intent projection.
- **Agentic Engineering**: `ADOPT_RESEARCH_UPSTREAM` — External practitioner research upstream.
- **Obsidian Vault / KnowledgePlane**: `CONFIRMED` — Sole durable knowledge authority.
