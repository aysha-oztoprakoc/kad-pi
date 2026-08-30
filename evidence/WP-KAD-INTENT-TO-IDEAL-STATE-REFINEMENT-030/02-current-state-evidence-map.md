# Current-State Evidence & Repository Inventory (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Date**: 2026-08-30  
**Status**: `REPOSITORY_CONFIRMED & EMPIRICALLY_OBSERVED`  

---

## 1. Concrete Repository Facts & State Verification

| Subsystem / Domain | Implemented Artifacts & Tools | Evidence & Test Receipts | Epistemic Status |
|---|---|---|---|
| **Constitutional Precedence** | `PRIME_DIRECTIVE.md`, `AGENTS.md` | `workctl doctor`, `make verify` | `REPOSITORY_CONFIRMED` |
| **Unified Skills & Roles** | `.agents/skills/` (15 skills), `KAD_PI_UNIFIED_SKILL_ROLE_ISA.md` | `WP-KAD-SKILL-ROLE-FABRIC-024` | `REPOSITORY_CONFIRMED` |
| **Work Lifecycle Authority** | `bin/workctl`, `tools/workspace/` | `workctl.test.mjs`, `workctl doctor` | `EMPIRICALLY_OBSERVED` |
| **Knowledge Vault & Wiki** | `vault/`, `bin/kad-wiki`, `tools/kad/wiki/` | `wiki*.test.mjs`, `bin/kad-wiki lint` | `EMPIRICALLY_OBSERVED` |
| **Intent Fidelity Substrate** | `bin/kad-intent`, `tools/kad/intent/` | `intent-fidelity.test.mjs` (19 tests PASS) | `EMPIRICALLY_OBSERVED` |
| **Compute Fabric Profile** | `interface/themes/tell/`, `tools/kad/compute/` | `tell-profile.test.mjs`, `compute-probe.test.mjs` | `EMPIRICALLY_OBSERVED` |
| **Economic FinOps Router** | `tools/kad/economic-router.mjs` | `economic-router.test.mjs`, `bin/kad doctor` | `EMPIRICALLY_OBSERVED` |
| **Observatory & Causal Journal** | `tools/kad/observatory/`, `causal-journal.jsonl` | `observatory.test.mjs` | `EMPIRICALLY_OBSERVED` |
| **GitHub Publication Baseline**| `.github/workflows/ci.yml`, `origin/main:17f91ac` | `WP-KAD-BASELINE-PUBLICATION-028A` | `REPOSITORY_CONFIRMED` |
| **Desktop / TUI Surfaces** | `interface/themes/omarchy/`, `interface/themes/tell/` | `desktop-theme.test.mjs` | `EMPIRICALLY_OBSERVED` |

---

## 2. Frozen Invariants

1. `ISA-KAD-SKILL-ROLE-002 v1.1` (Commit `1c8c9df`) remains the immutable historical baseline.
2. `WORK_LIFECYCLE != EXECUTION_RUN_LIFECYCLE`: `workctl` is sole work authority; OMP/Pi/Warren are execution providers.
3. `EXECUTION != LEARNING`: Distillation operates offline on validated trajectories.
4. Model proposals are non-normative until authorized by deterministic policy or human review.
