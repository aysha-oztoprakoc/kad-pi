---
kad_id: kad-source-index
title: Canonical Source Index
type: governance
authority: CANONICAL_KNOWLEDGE
epistemic_class: PROJECT_INFERENCE
review_status: APPROVED
visibility: project
context_eligible: false
train_eligible: false
publish: false
temporal_status: CURRENT
---

# Canonical Source Index

This index categorizes all authoritative source types supporting the KAD knowledge system:

## Source Categories

1. **Human-Authored Canonical Notes**:
   - Location: `vault/00_Governance/`, `vault/00_Home/`, `vault/50_Projects/`
   - Authority: `CANONICAL_KNOWLEDGE`, `CANONICAL_PROJECT_DECISION`
   - Review Status: `APPROVED`

2. **Accepted Workpackage Evidence**:
   - Location: `evidence/WP-*/`
   - Authority: Verified runtime evidence, test outputs, and causal journals.

3. **Git Repository & Commit State**:
   - Local HEAD: `ca1f56a020a3416eeffa3d49f3c34f113b536902`
   - Remote Tracking: `origin/main` (`27ed3c6`)

4. **Scientific Primary Sources (5-Source Real Corpus)**:
   - Location: `corpus/research/`
   - Papers: Toolformer, Reflexion, Self-Refine, SWE-bench, Voyager
   - Epistemic Class: `SOURCE_FACT`

5. **Runtime Observations & Telemetry**:
   - Telemetry Ledger: `${XDG_STATE_HOME}/kad/telemetry-ledger.jsonl`
   - Counterfactual Observatory: `${XDG_STATE_HOME}/kad/counterfactual-journal.jsonl`
   - Epistemic Class: `OBSERVED`

6. **Historical Migration Manifests**:
   - Manifest: `/home/amdy/migration/manifest/migration-manifest.json` (`AMDY-003-R3`)
   - Predecessor HDD: `/run/media/amdy/amdy-HDD/data_rein`
