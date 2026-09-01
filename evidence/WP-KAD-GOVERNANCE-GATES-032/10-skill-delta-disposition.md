# WP-KAD-GOVERNANCE-GATES-032: 10 - Skill Delta Disposition

## 1. Investigation of `skills doctor` Status
`bin/workctl skills doctor` reports:
```json
{
  "status": "WARN",
  "errors": [],
  "warnings": [
    "5-persona-advisory-board: LOCAL_DELTA",
    "ask-matt: LOCAL_DELTA",
    "code-review: LOCAL_DELTA",
    "codebase-design: LOCAL_DELTA",
    "diagnosing-bugs: LOCAL_DELTA",
    "domain-modeling: LOCAL_DELTA",
    "grill-with-docs: LOCAL_DELTA",
    "implement: LOCAL_DELTA",
    "improve-codebase-architecture: LOCAL_DELTA",
    "prototype: LOCAL_DELTA",
    "research: LOCAL_DELTA",
    "tdd: LOCAL_DELTA",
    "to-spec: LOCAL_DELTA",
    "to-tickets: LOCAL_DELTA",
    "triage: LOCAL_DELTA",
    "wayfinder: LOCAL_DELTA"
  ],
  "counts": {
    "LOCAL_DELTA": 16,
    "CURRENT": 3
  }
}
```

## 2. Classification & Root Cause
- **Classification**: `EXPECTED_LOCAL_DELTA`
- **Root Cause**: The 16 skills located in `.agents/skills/` were deliberately adapted during WP-024 to include KAD-PI specific governance, STC lease bounds, and role authority contracts. Because they diverge from external vendor upstream snapshots, `skills.mjs` tracks them as `LOCAL_DELTA`.
- **Governance Safety Evaluation**:
  - `skills.mjs` explicitly prioritizes `.agents/skills` as the canonical authority root over legacy `agent/skills` views.
  - Zero syntax, structural, or lifecycle errors exist (`errors: []`).
  - Normal coordination deliberately defers auto-updating trusted instructions (`"status": "deferred", "reason": "normal coordination does not auto-update trusted instructions"`).
  - These local deltas preserve KAD invariants and do NOT invalidate deterministic governance policy resolution.
