# Workpackage Reconciliation Matrix

This matrix reconciles every discovered KAD workpackage across `workctl` state, `evidence/` directories, Git commits, and canonical vault notes:

| WP ID | Title | Status | Baseline HEAD | Commit | Evidence Path | Canonical Vault Record |
|---|---|---|---|---|---|---|
| `WP-WORKSPACE-AGENT-SUBSTRATE-001` | Portable workspace agent substrate | `ACCEPTED` | `7f24158` | `cad814f` | `evidence/WP-WORKSPACE-AGENT-SUBSTRATE-001/` | Registered in `workctl` & `projects.json` |
| `WP-KAD-RESEARCH-API-001` | Canonical Research API and Persistence | `ACCEPTED` | `4ef704b` | `b057ffc` | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | Ingested into research engine |
| `WP-KAD-RESEARCH-CLI-002` | Research Operator Namespace & Manifests | `ACCEPTED` | `cad814f` | `b057ffc` | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | `bin/kad-knowledge` |
| `WP-KAD-RESEARCH-CAPABILITIES-003` | Provider Capability Profiles & Degradation | `ACCEPTED` | `33b0128` | `ea324af` | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | `config/research-capabilities/` |
| `WP-KAD-RESEARCH-OPENVIKING-004` | OpenViking Derived Research Context | `ACCEPTED` | `178ba6e` | `ea324af` | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | `tools/kad/research-openviking.mjs` |
| `WP-KAD-RESEARCH-ZOTERO-005` | Read-Only Zotero Local API Integration | `ACCEPTED` | `b057ffc` | `ea324af` | `evidence/WP-KAD-RESEARCH-WORKFLOW-SCAFFOLD-001/` | `tools/kad/research-zotero.mjs` |
| `WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006` | Evidence-Gated Real-Corpus Evaluation | `ACCEPTED` | `9342702` | `0ba74b9` | `evidence/WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006/` | `50_Projects/.../KAD_Research_Real_Corpus...` |
| `WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006-R1`| Epistemic Claim Audit & Source Fidelity | `ACCEPTED` | `0ba74b9` | `ccafcc7` | `evidence/WP-KAD-RESEARCH-REAL-CORPUS-EVALUATION-006-R1/` | `corpus/research/` & `claim-ledger.json` |
| `WP-KAD-OPERATOR-CONTROL-PLANE-001` | Operator Control Plane & Security Toolchain | `ACCEPTED` | `cb59d84` | `cb59d84` | `evidence/WP-KAD-OPERATOR-CONTROL-PLANE-001/` | `50_Projects/.../KAD_Operator_Control_Plane...` |
| `WP-KAD-USAGE-BRIDGE-002` | OMP-Native Usage -> KAD Telemetry Bridge | `ACCEPTED` | `ea324af` | `8774f8d` | `evidence/WP-KAD-USAGE-BRIDGE-002/` | `50_Projects/.../KAD_Usage_Bridge...` |
| `WP-KAD-ECONOMIC-ROUTER-SHADOW-003` | Deterministic Shadow Economic Evaluator | `ACCEPTED` | `cb59d84` | `8774f8d` | `evidence/WP-KAD-ECONOMIC-ROUTER-SHADOW-003/` | `50_Projects/.../KAD_Economic_Router_Shadow...`|
| `WP-KAD-COUNTERFACTUAL-OBSERVATORY-004` | Counterfactual Observatory & Journal | `ACCEPTED` | `5f2a615` | `9342702` | `evidence/WP-KAD-COUNTERFACTUAL-OBSERVATORY-004/` | `50_Projects/.../KAD_Counterfactual_Observatory...`|
| `WP-KAD-COUNTERFACTUAL-PROMOTION-READINESS-005`| Deterministic Promotion Readiness Gate | `ACCEPTED` | `8774f8d` | `9342702` | `evidence/WP-KAD-COUNTERFACTUAL-PROMOTION-READINESS-005/` | `50_Projects/.../KAD_Counterfactual_Promotion...`|
| `WP-KAD-KNOWLEDGE-PLANE-SEED-PROMOTION-007` | Governed Evidence Promotion & Derived Index | `ACCEPTED` | `ccafcc7` | `2d368db` | `evidence/WP-KAD-KNOWLEDGE-PLANE-SEED-PROMOTION-007/` | `50_Projects/.../KAD_Knowledge_Plane_Seed...` |
| `WP-KAD-FUSION-OMP-ADAPTATION-007A` | Pinned Fusion Harness under OMP | `ACCEPTED` | `2d368db` | `2d5ef8b` | `evidence/WP-KAD-FUSION-OMP-ADAPTATION-007A/` | `tools/kad/fusion/` & `bin/kad-fusion` |
| `WP-KAD-CANONICAL-OBSIDIAN-LIBRARIAN-008` | Canonical Obsidian Agentic Librarian | `ACCEPTED` | `2d368db` | `2d5ef8b` | `evidence/WP-KAD-CANONICAL-OBSIDIAN-LIBRARIAN-008/` | `vault/`, `bin/kad-wiki`, `tools/kad/wiki/` |
| `WP-KAD-LOCAL-WIKI-CONTEXT-LIBRARY-009` | Local Wiki Context Library | `ACCEPTED` | `2d368db` | `2d5ef8b` | `evidence/WP-KAD-LOCAL-WIKI-CONTEXT-LIBRARY-009/` | `tools/kad/wiki-library/` |
| `WP-KAD-VAULT-WIKI-UNIFICATION-010` | Canonical Vault & Legacy Wiki Unification | `REVIEW` | `2d5ef8b` | `ca1f56a` | `evidence/WP-KAD-VAULT-WIKI-UNIFICATION-010/` | Physical migration completed in WP-010-R1 |
| `WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1` | Full `/Work` Reconciliation & Sync | `IN_PROGRESS` | `ca1f56a` | Active | `evidence/WP-KAD-CANONICAL-STATE-RECONCILIATION-010-R1/` | Full canonical baseline established |
