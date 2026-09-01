# WP-KAD-GOVERNANCE-GATES-032: 06 - Confused Deputy & Stale Authorization Defense

## 1. Confused Deputy Threat Model & Defense
In distributed agent workflows, an authorization issued for a low-risk task or resource could be maliciously or accidentally reused to mutate a high-risk resource or bypass boundaries.

### Verified Protections:
1. **Workpackage Binding (`G22`)**: A human authorization receipt issued for `WP-KAD-A` cannot be used to authorize an operation on `WP-KAD-B`. The preflight evaluator checks `receipt.workpackage_id === request.work.workpackage_id` and rejects mismatches with `CONFUSED_DEPUTY_WP_MISMATCH`.
2. **Resource Scope Binding (`G23`)**: An authorization receipt issued for `resource:data-workspace` cannot be used against `resource:private-vault`. The evaluator checks requested resources against authorized resources in the receipt and rejects mismatches with `CONFUSED_DEPUTY_RESOURCE_MISMATCH`.
3. **Operation Binding (`G07`, `G21`)**: A receipt issued for `READ_LOCAL` cannot authorize `REMOTE_GIT_PUSH`.

## 2. TOCTOU (Time-of-Check to Time-of-Use) Stale Authorization Defense
A preflight evaluation that returns `ALLOW` must not remain valid indefinitely:
- Every `GOVERNANCE_DECISION_V1` contains an explicit `valid_until` ISO timestamp (default TTL: 5 minutes).
- `verifyDecisionFreshness()` verifies that current wall-clock time $\le$ `valid_until`.
- Consequential mutation points re-verify decision freshness; expired decisions are rejected with `STALE_DECISION_EXPIRED`.
- Tests `G28` proves that stale decisions fail freshness verification.
