# Orientation & Authority Baseline (WP-030)

**Workpackage ID**: `WP-KAD-INTENT-TO-IDEAL-STATE-REFINEMENT-030`  
**Title**: Typed-Intent -> Successor Ideal State, Requirement Traceability, Gap Model & Evidence-Gated Roadmap  
**Date**: 2026-08-30  
**Status**: `CONFIRMED`  
**Git HEAD**: `17f91ac49b4430ea04b7b933b204d6645ffbd3f3` (`origin/main`)  

---

## 1. Authority Hierarchy Invariant

```text
HIGHEST AUTHORITY:
  evidence/intent/events.jsonl (24 INTENT_DECISION_EVENT_V1 records) -> AUTHOR_DECLARED

DERIVED INTERPRETATION:
  evidence/intent/normalizations.jsonl (24 INTENT_DECISION_NORMALIZATION_V1) -> DERIVED_FROM_AUTHOR_DECLARED

GENERATED PROJECTION:
  docs/architecture/KAD_PI_INTENTION_ALIGNMENT_REPORT_2026-08-30.md

HISTORICAL CONSTITUTIONAL BASELINE:
  PRIME_DIRECTIVE.md
  ISA-KAD-SKILL-ROLE-002 v1.1 (Preserved Invariant, NEVER overwritten in place)

SUCCESSOR IDEAL STATE:
  docs/architecture/KAD_PI_IDEAL_STATE_V2.md (and .json companion)
```

## 2. Four-Plane Epistemic Model

Every assertion in this workpackage is tagged into one of four orthogonal planes:
1. **`INTENT PLANE`**: Authoritative human intent (`AUTHOR_DECLARED`).
2. **`CURRENT PLANE`**: Repository-confirmed facts and empirical observations (`REPOSITORY_CONFIRMED`, `EMPIRICALLY_OBSERVED`).
3. **`TARGET PLANE`**: Derived normative architectural requirements (`DERIVED_FROM_AUTHOR_DECLARED`).
4. **`EXPERIMENT PLANE`**: Unproven hypotheses requiring empirical qualification (`HYPOTHESIS`).
