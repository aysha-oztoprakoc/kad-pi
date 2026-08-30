# Backlog & Experiment Discoveries (WP-029)

**Workpackage ID**: `WP-KAD-INTENT-FIDELITY-029`  
**Date**: 2026-08-30  
**Status**: `ROUTED_TO_BACKLOG_AND_EXPERIMENT_PLANE`  

---

## 1. Scope Firewall Invariant

During the implementation and verification of `WP-029`, several potential future enhancements were identified. In accordance with KAD scope isolation invariants, these items were **not implemented** in `WP-029` and are cataloged here for future roadmap scheduling.

---

## 2. Backlog Proposals (Future Architectural Workpackages)

1. **`BP-INTENT-INTERACTIVE-INGEST`**: Interactive hook for `ask_user` / `ask-me` tools in OMP to automatically append `INTENT_DECISION_EVENT_V1` records directly into `evidence/intent/events.jsonl` at the moment of human choice.
2. **`BP-INTENT-GRAPH-PROJECTION`**: Derived graph projection compiler mapping `INTENT_DECISION_EVENT_V1` and `INTENT_DECISION_NORMALIZATION_V1` into Obsidian Graph view under `vault/90_Derived/Projections/intent-graph.json`.
3. **`BP-INTENT-CONTRADICTION-LINKER`**: Automated linking between the intent ledger and the contradiction journal (`tools/kad/intent/contradictions.mjs`).

---

## 3. Immediate Successor Frontier

The immediate successor workpackage remains strictly:
# `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT`
* **Objective**: Use the validated intent event ledger (`evidence/intent/events.jsonl`), derived normalizations (`evidence/intent/normalizations.jsonl`), and compiled alignment report (`docs/architecture/KAD_PI_INTENTION_ALIGNMENT_REPORT_2026-08-30.md`) to produce the next major revision of the KAD-PI Ideal State Artifact with 100% human-intent fidelity.
