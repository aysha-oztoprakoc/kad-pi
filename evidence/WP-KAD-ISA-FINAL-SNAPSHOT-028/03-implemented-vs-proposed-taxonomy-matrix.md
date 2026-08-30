# Implemented vs Proposed Taxonomy & Component Disposition Matrix (WP-028)

**Date**: 2026-08-30  
**Epistemic Rule**: Never describe Warren, Beads, GitHub automation, or other infrastructure as implemented without repository evidence.

---

## 1. Complete Component & Provider Classification Matrix

| Component / Subsystem | Category | Current Disposition | Epistemic Status | Justification & Verification Receipt |
|---|---|---|---|---|
| **`ISA-KAD-SKILL-ROLE-002`** | Architecture | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Frozen in `docs/architecture/` with SHA256 `dece6d5348...`. |
| **`KAD_WORKLOAD_V1`** | Contract | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Implemented in `tools/kad/workload-contract.mjs` & validated in `workload-contract.test.mjs`. |
| **`ROLE_CONTRACT_V2` (Offload Semantics)** | Contract | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | 15 roles updated in `config/roles/` & validated in `role-contract-safety.test.mjs`. |
| **Provider Taxonomy Registry** | Registry | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Codified in `config/external-providers.json` & `tools/kad/external-providers.mjs`. |
| **OMP Native Subagent Executor** | Workload Provider | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Primary interactive execution transport in active session. |
| **Pi Persistent Worker Runtime** | Workload Provider | `IMPLEMENTED` & `VALIDATED` | `OBSERVED` | Verified in `tools/kad/test/pi-real-persistent.integration.test.mjs`. |
| **Warren Factory-Floor Substrate** | Workload Provider | `CANARY_PLANNED` | `HYPOTHESIS` | Architecture positions and constraints codified; runtime installation deferred to future evidence-gated WP. |
| **Local Deterministic Process Runner** | Workload Provider | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Direct node/bash process execution for tests and linters. |
| **Sofia Cytoscape Interactive Graph** | Graph Projection | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/graph*.test.mjs` and `dashboard/`. |
| **Beads Intent Graph Projection** | Graph Projection | `SHADOW_CANARY` | `HYPOTHESIS` | Subordinate authority direction codified (`workctl -> Beads`); tool installation remains canary/mining only. |
| **Agentic Engineering Upstream** | Doctrine Source | `ADOPT_RESEARCH_UPSTREAM` | `PRACTITIONER_DERIVED` | Codified as non-primary research upstream; zero unreviewed source vendoring. |
| **DeepAPI Research Bridge** | Research Provider | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Global DeepAPI skill and tool bridge active. |
| **Zotero Local HTTP Bridge** | Research Provider | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/research-zotero.test.mjs`. |
| **OpenViking Vector Projection** | Research Provider | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Derived vector index projection with `authority: false`. |
| **Sofia v3 Dashboard** | Presentation | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/dashboard*.test.mjs`. |
| **Tell Headless ANSI Profile** | Presentation | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/tell-profile.test.mjs`. |
| **AMDY Omarchy Cyberdeck Theme** | Presentation | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/desktop-theme.test.mjs`. |
| **Obsidian Bridge Plugin** | Presentation | `IMPLEMENTED` & `VALIDATED` | `DESIGN_DECISION` | Verified in `tools/kad/test/obsidian-bridge.test.mjs`. |
| **Remote GitHub Branch Protection** | Remote Governance | `PROPOSED` / `CANARY_PLANNED` | `DESIGN_DECISION` | Awaiting Phase A successor workpackage; not touched in WP-028. |
| **Remote GitHub Actions Policies** | Remote Governance | `PROPOSED` / `CANARY_PLANNED` | `DESIGN_DECISION` | Awaiting Phase A successor workpackage; not touched in WP-028. |
| **Remote Git Push to Origin** | Git Operations | `DEFERRED` | `OPERATIONAL_GATE` | Scheduled for Phase B following Phase A GitHub readiness. |
| **Local Vault/Wiki Mutation** | Knowledge Plane | `DEFERRED` | `OPERATIONAL_GATE` | Scheduled for Phase C as derived projection of committed Git state. |
| **Autonomous Merge / Auto-PR Merge** | Workflow Feature | `REJECTED` | `CONSTITUTIONAL_INVARIANT`| Violates KAD sovereign human/workctl acceptance authority. |
| **Unbounded Autonomous Agent Loops** | Orchestration | `REJECTED` | `CONSTITUTIONAL_INVARIANT`| Violates bounded `KAD_GOAL_V1` and TOKENMAXXING invariants. |
| **Model Names in Work Ledger** | Ledger Design | `REJECTED` | `CONSTITUTIONAL_INVARIANT`| Violates model-neutral work definition invariant. |
| **Direct Shell Mutation from UI/TUI** | UI Architecture | `REJECTED` | `CONSTITUTIONAL_INVARIANT`| Violates presentation layer read-only boundary. |
