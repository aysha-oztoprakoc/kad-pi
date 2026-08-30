# Phase 3: Deterministic Gap Matrix & Reconciliation Plan

* **Workpackage**: `WP-KAD-SKILL-ROLE-FABRIC-024`
* **Target**: Alignment with Frozen ISA `ISA-KAD-SKILL-ROLE-001` (`116a25ab111968283dca39a64be38fd6e673621f31801c56bb59c97edf01435b`)
* **Methodology**: Deterministic Gap Matrix (`Requirement | Current State | Evidence | Deviation | Action | Risk | Validation`)

---

## 1. Deterministic Gap Matrix

| ISA Requirement | Current State | Evidence | Deviation | Action | Risk | Validation |
|---|---|---|---|---|---|---|
| **1. Consolidated Canonical Skill Surface (15 concepts)** | 46 individual skill directories in `.agents/skills/` with loose metadata. | `.agents/workspace/skills.lock.json`, `.agents/skills/*` | `DEVIATION_SURFACE_OVERSIZED` (46 vs 15 target). | Consolidate into 15 canonical skill definitions with typed classes; map all legacy skills into explicit dispositions. | Low (legacy patterns preserved via merge/absorption). | `bin/workctl skills doctor`, routing tests. |
| **2. Typed Skill Classes** | Untyped skill markdown without class taxonomy. | `.agents/skills/*/SKILL.md` | `DEVIATION_UNTYPED_SKILLS` | Add `class` metadata (`PROCESS_DISCIPLINE`, `WORKFLOW`, `POLICY_FRONTEND`, `CAPABILITY_FRONTEND`, `HARNESS_ADAPTER`, `PRESENTATION`) to frontmatter. | None. | Skill linter / doctor. |
| **3. Wayfinder V2 (PREFLIGHT / INFLIGHT / POSTFLIGHT)** | Wayfinder focuses on decision map generation without explicit POSTFLIGHT verification mode. | `.agents/skills/wayfinder/SKILL.md` | `DEVIATION_WAYFINDER_PARTIAL` | Implement Wayfinder V2 with explicit PREFLIGHT (formulation), INFLIGHT (5+1), and POSTFLIGHT (invariant/spec check) modes. | Low. | Wayfinder routing fixtures. |
| **4. Human Runbook Generator (`human-runbook`)** | Separate `wizard` and manual setup files. | `.agents/skills/wizard/SKILL.md` | `DEVIATION_FRAGMENTED_RUNBOOK` | Unify `wizard` into `human-runbook` with interactive bash wizard generation. | Low. | Runbook generator test fixture. |
| **5. Implementation Discipline (`implement`)** | Separate `implement` and `implement-spec`. | `.agents/skills/implement/`, `implement-spec/` | `DEVIATION_DUPLICATE_IMPLEMENT` | Absorb `implement-spec` into canonical `implement`, binding to `fusion_writer_lease` and `workctl` claim. | Low. | Claim enforcement tests. |
| **6. Canonical 5-Lens Advisory Board (`kad-advisory-board`)** | Parallel `5-persona-advisory-board` and `kad-advisory-board`. | `.agents/skills/5-persona-advisory-board/`, `kad-advisory-board/` | `DEVIATION_DUPLICATE_ADVISORY` | Merge into single canonical 5-lens KAD advisory board (Architecture, Security, Economics, Verification, Epistemic Risk). | Low. | Advisory board fixture test. |
| **7. Role Fabric (`ROLE_CONTRACT_V1`)** | Loose string roles in `.omp/config.yml` without typed schemas or mutation constraints. | `.omp/config.yml` | `DEVIATION_UNTYPED_ROLES` | Define `ROLE_CONTRACT_V1` schema, implement 15 role definitions in `config/roles/`, and create `tools/kad/role-contract.mjs`. | Medium (must not break existing role bindings). | Role contract unit tests. |
| **8. Max Spawn Depth Enforcement (2)** | OMP `task` allows arbitrary subagent nesting. | OMP runtime default | `DEVIATION_UNBOUNDED_SPAWN` | Implement spawn depth tracking and validation in role contract engine (max depth: 2). | Low. | Spawn depth limit tests. |
| **9. Verifier Independence** | Reviewers can theoretically be spawned with the same model as builder. | `.omp/config.yml` | `DEVIATION_VERIFIER_COUPLING` | Add verifier independence rule in role router: `kad-reviewer` and advisors must use `@verifier` / independent family. | Low. | Independence validation test. |
| **10. Capability-First Resource Routing** | 8-tier hierarchy defined in ISA; router has 5 classes. | `tools/kad/local-first-router.mjs`, `economic-router.mjs` | `DEVIATION_ROUTING_HIERARCHY` | Expand and align resource router with the 8 capability tiers. | Low. | Resource routing tests. |
| **11. STC Worktree Lease Adapter** | Basic filesystem lock files. | `tools/workspace/workctl.mjs` | `DEVIATION_BASIC_LEASES` | Implement `tools/workspace/stc-lease.mjs` for bounded workspace and worktree leases. | Low. | STC lease lifecycle test. |
| **12. Bounded `KAD_GOAL_V1` Engine** | No goal iteration engine; ad-hoc looping prohibited. | N/A | `DEVIATION_NO_GOAL_ENGINE` | Implement `tools/kad/goal-engine.mjs` subordinate to PON and `workctl`. | Low. | Bounded goal execution test. |
| **13. Deterministic Skill Governance Tooling** | `skills.lock.json` validated via basic SHA256. | `tools/workspace/skill-governance.mjs` | `DEVIATION_GOVERNANCE_CHECKS` | Upgrade `tools/workspace/skill-governance.mjs` with full ISA compliance, class checks, and doctor validation. | Low. | `bin/workctl skills doctor`. |

---

## 2. Step-by-Step Implementation Sequence (Phase 4)

1. **Step 1: Role Contract Engine & Schema (`ROLE_CONTRACT_V1`)**:
   - Create `config/roles/schema.json` and 15 role definitions (`config/roles/*.json`).
   - Create `tools/kad/role-contract.mjs` for deterministic validation, spawn depth checks, mutation right verification, and verifier independence.
2. **Step 2: STC Workspace Lease & Bounded Goal Engine**:
   - Create `tools/workspace/stc-lease.mjs` (LIFO workspace lease manager).
   - Create `tools/kad/goal-engine.mjs` (`KAD_GOAL_V1` bounded goal iterations).
3. **Step 3: Capability-First Resource Router Alignment**:
   - Enhance `tools/kad/local-first-router.mjs` with 8-tier capability routing and role contract bindings.
4. **Step 4: Consolidated Canonical Skill Surface (15 Skills)**:
   - Update canonical skills in `.agents/skills/`:
     - `ask-matt`
     - `wayfinder` (incorporating PREFLIGHT, INFLIGHT 5+1, POSTFLIGHT)
     - `implement` (absorbing `implement-spec`, enforcing claim & lease)
     - `research` (unifying high-trust research fabric)
     - `human-runbook` (unifying `wizard` + `setup-help`)
     - `handoff` (unifying continuation and Claude Code adapter)
     - `tdd` (Red-Green-Refactor)
     - `diagnosing-bugs` (DAP + repro loop)
     - `code-review` (Standards + Spec + skeptical analyzer)
     - `codebase-design` (deep modules, dependency rules)
     - `domain-modeling` (vocabulary, bounded contexts, questionnaires)
     - `grilling` (Socratic plan attack)
     - `prototype` (disposable experimental probes)
     - `kad-advisory-board` (5-lens advisory review)
     - `skill-governance` (skills lockfile, schema, doctor, validation)
5. **Step 5: Skill Governance & Lockfile Reconciliation**:
   - Update `tools/workspace/skill-governance.mjs` to support ISA validation and typed classes.
   - Reconcile `.agents/workspace/skills.lock.json`.
6. **Step 6: OMP Harness Configuration & Projection**:
   - Update `.omp/config.yml` agent descriptions and role mappings.
