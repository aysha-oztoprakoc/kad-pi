# WP-KAD-GOVERNANCE-GATES-032: 07 - Readiness Gate Analysis

## 1. Investigation of `UNKNOWN_DOMINATED` Readiness State
In `bin/kad doctor` and `bin/kad readiness`, the longitudinal promotion readiness gate currently reports:
```text
Global Status:      UNKNOWN_DOMINATED
Reason Codes:       UNKNOWN_DOMINATED
Observations:       12 examined (comparable: 0)
Divergence Rate:    0.0%
Integrity Gate:     PASS
Policy Drift Gate:  PASS
Quality Gate:       UNKNOWN-DOMINATED (unknown rate: 100.0%)
```

### Analysis of Why It Is Unknown-Dominated:
1. The counterfactual shadow observatory was established in WP-004/005 to compare actual vs shadow model routing under live workloads.
2. In the current single-node developer workstation environment, remote shadow probe calls have not generated the minimum required sample of comparable observations across opportunity classes (`FAST_LOCAL_OPPORTUNITY`, `EXPEDITION_OPPORTUNITY`, etc.).
3. The readiness evaluator correctly enforces the invariant that **unobserved longitudinal data remains UNKNOWN**, preventing premature autonomous route promotion (`canary_authorized = false`).

## 2. Risk-Sensitive Unknown Handling in Governance Gates
The governance preflight evaluator distinguishes between:
- **Relevant High-Impact Unknowns (`G18`)**: An unknown trust factor or unknown security boundary during a high-risk operation (`TIER_3_HIGH`, `TIER_4_CONSTITUTIONAL`) blocks autonomous execution with `UNKNOWN_HIGH_IMPACT_STATE` or `REQUIRE_HUMAN`.
- **Irrelevant Low-Impact Unknowns (`G19`)**: An unknown economic quota metric or unknown shadow divergence metric does NOT block an autonomous local file read or unit test execution (`ALLOW` with `READ_LOCAL_AUTONOMOUS`).
