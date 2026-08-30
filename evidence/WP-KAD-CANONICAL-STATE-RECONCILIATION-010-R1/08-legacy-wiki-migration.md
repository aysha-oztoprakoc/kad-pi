# Legacy Wiki Migration & Reconciliation Report

## 1. Migration Inventory & Disposition Summary

The 75 legacy artifacts discovered in `wiki/` have been physically processed and classified:

- **Total legacy artifacts**: 75
- **MIGRATE_CANONICAL**: 8 (physically migrated to `vault/50_Projects/KAD-PI/Workpackages/`)
- **REVIEW_REQUIRED**: 11 (human-review records generated under `vault/80_Review/Pending/`)
- **ARCHIVE**: 12 (archived under `vault/99_Archive/LegacyWiki/synthetic/`)
- **DERIVED_ONLY**: 44 (copied under `vault/90_Derived/LegacyWiki/generated/`)
- **Unresolved Count**: 0

---

## 2. Physically Migrated Canonical Records (8 items)

| Legacy Path | Canonical Destination | Canonical ID | Status |
|---|---|---|---|
| `wiki/KAD_Counterfactual_Observatory_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Counterfactual_Observatory_2026-08-30.md` | `kad-6ce9170fbc7d4d5940dee47f` | MIGRATED |
| `wiki/KAD_Counterfactual_Promotion_Readiness_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Counterfactual_Promotion_Readiness_2026-08-30.md` | `kad-fa1e2eade887444402d4f67e` | MIGRATED |
| `wiki/KAD_Economic_Router_Shadow_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Economic_Router_Shadow_2026-08-30.md` | `kad-7b6cfdcb43554a02fdede3e0` | MIGRATED |
| `wiki/KAD_Knowledge_Plane_Seed_Promotion_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Knowledge_Plane_Seed_Promotion_2026-08-30.md` | `kad-f147e92c50de78c6b941a4f0` | MIGRATED |
| `wiki/KAD_Operator_Control_Plane_2026-08-29.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Operator_Control_Plane_2026-08-29.md` | `kad-9a8fabf777cac7f99276ed02` | MIGRATED |
| `wiki/KAD_Research_Real_Corpus_Evaluation_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Research_Real_Corpus_Evaluation_2026-08-30.md` | `kad-721d25aaed5cf16bd64167b5` | MIGRATED |
| `wiki/KAD_Research_Workflow_Implementation_Roadmap_2026-08-29.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Research_Workflow_Implementation_Roadmap_2026-08-29.md` | `kad-841db1a378d9c7ddbcc45812` | MIGRATED |
| `wiki/KAD_Usage_Bridge_2026-08-30.md` | `vault/50_Projects/KAD-PI/Workpackages/KAD_Usage_Bridge_2026-08-30.md` | `kad-63517e1567e1d643bfa2f23a` | MIGRATED |

---

## 3. Human Review Records Created (11 items)

| Legacy Path | Review Target in Vault | Review Status |
|---|---|---|
| `wiki/CLI_SUBSCRIPTION_QUOTA_ECONOMICS_HANDOFF.md` | `vault/80_Review/Pending/legacy-cli_subscription_quota_economics_handoff.md.md` | PENDING (GATED) |
| `wiki/DEEPHAR_DREAM_OS_SAFE_PLUGIN_LAB_HANDOFF.md` | `vault/80_Review/Pending/legacy-deephar_dream_os_safe_plugin_lab_handoff.md.md` | PENDING (GATED) |
| `wiki/DSH_PON_CORDIS_HANDOFF_2026-08-25.md` | `vault/80_Review/Pending/legacy-dsh_pon_cordis_handoff_2026-08-25.md.md` | PENDING (GATED) |
| `wiki/HANDOFF — Omarchy QuickShell Aesthetic Design via OpenCode Harness.md` | `vault/80_Review/Pending/legacy-handoff-omarchy-quickshell-aesthetic-design-via-opencode-harness.md.md` | PENDING (GATED) |
| `wiki/KAD_Context_Knowledge_Plane_Roadmap_2026-08-29.md` | `vault/80_Review/Pending/legacy-kad_context_knowledge_plane_roadmap_2026-08-29.md.md` | PENDING (GATED) |
| `wiki/KAD_Implementation_Plan.md` | `vault/80_Review/Pending/legacy-kad_implementation_plan.md.md` | PENDING (GATED) |
| `wiki/KAD_PI_AGY_HANDOFF_2026-08-28.md` | `vault/80_Review/Pending/legacy-kad_pi_agy_handoff_2026-08-28.md.md` | PENDING (GATED) |
| `wiki/OFFICIAL_SOL_REVIEWER_HANDOFF_DREAM_SETUP_R2.md` | `vault/80_Review/Pending/legacy-official_sol_reviewer_handoff_dream_setup_r2.md.md` | PENDING (GATED) |
| `wiki/OPENCODE_GO_ECONOMIC_MODEL_MATRIX_HANDOFF.md` | `vault/80_Review/Pending/legacy-opencode_go_economic_model_matrix_handoff.md.md` | PENDING (GATED) |
| `wiki/index.md` | `vault/80_Review/Pending/legacy-index.md.md` | PENDING (GATED) |
| `wiki/research/CATALOG.json` | `vault/80_Review/Pending/legacy-research-catalog.json.md` | PENDING (GATED) |

---

## 4. Legacy `wiki/` End-State Role
`wiki/ = GENERATED_COMPATIBILITY_ONLY`

- `vault/` is now the single canonical human-editable knowledge repository.
- `wiki/` is retained strictly as a regenerable compatibility projection. No direct edits in `wiki/` carry canonical authority.
