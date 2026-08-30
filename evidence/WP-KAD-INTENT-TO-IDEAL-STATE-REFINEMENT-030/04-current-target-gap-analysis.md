# Current-to-Target Gap Analysis Matrix (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Total Analyzed Domains**: 16 Architectural Domains  
**Status**: `COMPLETE & EVIDENCE-GROUNDED`  

---

## 1. Domain-by-Domain Gap Matrix

| Domain ID | Current State (Repository Evidence) | Target State (Normalized Intent) | Identified Gap | Risk Level | Target Horizon | Remediation Path |
|---|---|---|---|---|---|---|
| **`PROJECT_IDENTITY`** | Personal repo with emerging research (`PRIME_DIRECTIVE.md`) | Rigid Personal Engineering OS & Research Lab core (`REQ-KAD-ID-001`) | Occasional multi-user/SaaS scaffolding | `MEDIUM` | `NOW` | `WP-030` (Prune & Scope) |
| **`TARGET_STAKEHOLDER`** | AMDY single-user workstation (`.agents/workspace/`) | Sole lead + 2-5 collaborator isolation (`REQ-KAD-ID-002`) | Export & packaging for trusted ring | `LOW` | `3_MONTH` | `WP-KAD-COLLABORATOR-PACKAGING-035` |
| **`SOVEREIGN_HUMAN_ROLE`** | Human triggers workctl and answers ask-me | Adaptive engagement with strict human gates (`REQ-KAD-COG-001`) | Automated gating on sensitive merges | `HIGH` | `3_MONTH` | `WP-KAD-GOVERNANCE-GATES-032` |
| **`FAILURE_CONDITION`** | Failure defined qualitatively in doctrine | Automated cognitive friction telemetry (`REQ-KAD-COG-002`) | Quantitative human intervention metrics | `MEDIUM` | `3_MONTH` | `WP-KAD-COGNITIVE-TELEMETRY-031` |
| **`AUTONOMY_BOUNDARIES`** | STC lease in workctl partially advisory | Strict capability-enforced sandbox (`REQ-KAD-AUTH-001`) | Subagent out-of-scope edit containment | `HIGH` | `3_MONTH` | `WP-KAD-STC-SANDBOX-HARDENING-033` |
| **`KNOWLEDGE_PROMOTION`** | Librarian role guards vault (`bin/kad-wiki`) | Multi-stage evidence gating pipeline (`REQ-KAD-AUTH-002`) | Formal state machine for candidate promotion | `HIGH` | `3_MONTH` | `WP-KAD-KNOWLEDGE-LIFECYCLE-034` |
| **`ECONOMIC_FINOPS`** | Zero-spend policy active (`economic-router.mjs`) | Workpackage-scoped paid spend lease (`REQ-KAD-FIN-001`) | Programmatic budget cap enforcement | `MEDIUM` | `3_MONTH` | `WP-KAD-FINOPS-LEASE-036` |
| **`SECURITY_DOMAINS`** | Local env vars + gitleaks/trivy (`kad doctor`) | Capability broker with zero prompt tokens (`REQ-KAD-SEC-001`) | Raw credential isolation from subagents | `CRITICAL` | `3_MONTH` | `WP-KAD-CAPABILITY-BROKER-037` |
| **`EXECUTION_TOPOLOGY`** | OMP interactive + Pi runner (`workload-contract.mjs`)| Tiered substrate + Warren offload (`REQ-KAD-EXEC-001`) | Empirical qualification of Warren canary | `MEDIUM` | `6_MONTH` | `EXP-KAD-WARREN-ASYNC-002` |
| **`LOCAL_FIRST_OFFLINE`** | Core tools run locally on Linux workstation | Formally verified 100% offline baseline (`REQ-KAD-OFFLINE-001`)| Empirical WAN fault-injection proof | `HIGH` | `3_MONTH` | `EXP-KAD-OFFLINE-SURVIVAL-001` |
| **`LOCAL_COMPUTE_ROLES`** | AMDY active, TELL server profile tested (WP-018) | Asymmetric dual-node batch offload (`REQ-KAD-COMP-001`) | Headless asynchronous daemon on TELL | `MEDIUM` | `6_MONTH` | `EXP-KAD-TELL-PERSISTENT-005` |
| **`GITHUB_OPERATING_MODEL`**| Git is sovereign, GitHub is downstream (WP-028A) | Automated PR/Issue import gateway (`REQ-KAD-GIT-001`) | Bidirectional sync without local mutation | `MEDIUM` | `6_MONTH` | `WP-KAD-GITHUB-PROJECTION-038` |
| **`RESEARCH_LIFECYCLE`** | Zotero adapter & real corpus eval (WP-005, WP-006) | R0-R4 claim triangulation pipeline (`REQ-KAD-RES-001`) | Automated claim extraction & triangulation | `HIGH` | `3_MONTH` | `WP-KAD-RESEARCH-WORKFLOW-039` |
| **`KNOWLEDGE_STORAGE`** | Markdown Vault canonical in vault/ (WP-010) | Unified KnowledgePlane + projections (`REQ-KAD-KNOW-001`) | Search acceleration layer integration | `LOW` | `NOW` | `WP-KAD-KNOWLEDGE-LIFECYCLE-034` |
| **`DISTILLATION_PIPELINE`** | Observatory records causal journals (WP-002, WP-021)| Offline trajectory analyzer & tool compiler (`REQ-KAD-DIST-001`)| Automated trajectory pattern extraction | `HIGH` | `6_MONTH` | `EXP-KAD-DISTILLATION-006` |
| **`CONTRADICTION_MGMT`** | Epistemic status tags in vault metadata | Structured contradiction journal & gate (`REQ-KAD-KNOW-002`) | Fail-closed invalidation on contested paths | `HIGH` | `3_MONTH` | `WP-KAD-CONTRADICTION-JOURNAL-040` |
