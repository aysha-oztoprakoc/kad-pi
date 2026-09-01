# WP-KAD-GOVERNANCE-GATES-032: 05 - TDD Adversarial Governance Receipts

## 1. Adversarial Invariant Matrix (G01–G30)

| Test ID | Adversarial Test Scenario | Expected Outcome | Verified Reason Code | Status |
| :--- | :--- | :--- | :--- | :--- |
| **G01** | Valid local read | `ALLOW` | `READ_LOCAL_AUTONOMOUS` | `PASS` |
| **G02** | Bounded builder mutation inside claim/lease/scope | `ALLOW` | `AUTHORIZED_WITHIN_LEASE` | `PASS` |
| **G03** | Builder mutation outside owned scope | `DENY` | `PATH_OUTSIDE_SCOPE` | `PASS` |
| **G04** | Mutation without active claim | `DENY` | `NO_ACTIVE_CLAIM` | `PASS` |
| **G05** | Mutation with expired/missing lease | `DENY` | `STC_LEASE_EXPIRED` | `PASS` |
| **G06** | Model claims human authorized in prose without receipt | `REQUIRE_HUMAN` | `FAKE_HUMAN_APPROVAL_PROSE_REJECTED` | `PASS` |
| **G07** | Valid human authorization receipt | `ALLOW` | `AUTHORIZED_BY_HUMAN_RECEIPT` | `PASS` |
| **G08** | Raw secret access attempt | `DENY` | `RAW_SECRET_ACCESS_FORBIDDEN` | `PASS` |
| **G09** | Metered call with `paidAuthorized=false` | `DENY` | `BUDGET_NOT_AUTHORIZED` | `PASS` |
| **G10** | Metered call inside active preauthorized envelope | `ALLOW` | `BUDGET_ENVELOPE_AUTHORIZED` | `PASS` |
| **G11** | Actor attempts to increase own budget | `DENY` | `BUDGET_SELF_ESCALATION_FORBIDDEN` | `PASS` |
| **G12** | Low-risk derived projection rebuild | `ALLOW` | `AUTHORIZED_BY_POLICY` | `PASS` |
| **G13** | Architectural doctrine promotion by agent | `REQUIRE_HUMAN` | `DOCTRINE_PROMOTION_HUMAN_ONLY` | `PASS` |
| **G14** | Local Git commit in authorized worktree | `ALLOW` | `AUTHORIZED_WITHIN_LEASE` | `PASS` |
| **G15** | Main merge missing independent verification | `DENY` | `INDEPENDENT_VERIFICATION_MISSING` | `PASS` |
| **G16** | Main merge with full evidence & human receipt | `ALLOW` | `MAIN_INTEGRATION_READY` | `PASS` |
| **G17** | Constitutional mutation by agent | `DENY` | `CONSTITUTIONAL_MUTATION_HUMAN_ONLY` | `PASS` |
| **G18** | Unknown high-risk trust state | `BLOCKED` | `UNKNOWN_HIGH_IMPACT_STATE` | `PASS` |
| **G19** | Unknown irrelevant metric | `ALLOW` | `READ_LOCAL_AUTONOMOUS` | `PASS` |
| **G20** | Target authority exists but capability not implemented | `REQUIRE_HUMAN` | `CAPABILITY_NOT_IMPLEMENTED` | `PASS` |
| **G21** | Expired human authorization receipt | `DENY` | `HUMAN_RECEIPT_EXPIRED` | `PASS` |
| **G22** | Authorization for WP-A reused on WP-B | `DENY` | `CONFUSED_DEPUTY_WP_MISMATCH` | `PASS` |
| **G23** | Authorization for resource A reused on resource B | `DENY` | `CONFUSED_DEPUTY_RESOURCE_MISMATCH` | `PASS` |
| **G24** | Provider capable of operation but lacks authority | `DENY` | `CAPABILITY_WITHOUT_AUTHORITY_DENIED` | `PASS` |
| **G25** | Past telemetry success claim without current authority | `DENY` | `PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY`| `PASS` |
| **G26** | Denial emits typed reason codes | `PASS` | Typed string array in decision | `PASS` |
| **G27** | Decision receipts do not mutate workctl lifecycle | `PASS` | Zero lifecycle state fields in decision | `PASS` |
| **G28** | Operation after decision expiry (TOCTOU) | `DENY` | `verifyDecisionFreshness = false` | `PASS` |
| **G29** | Risk classification downgrade attempted by agent | `DENY` | `RISK_TIER_DOWNGRADE_FORBIDDEN` | `PASS` |
| **G30** | Conflicting constitutional evidence | `DENY` | `CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED`| `PASS` |

## 2. Test Execution Receipt
\`\`\`text
✔ G16: main merge with full required evidence -> readiness decision according to current authority (1.471502ms)
✔ G17: constitutional mutation by agent -> DENY / HUMAN_ONLY (0.141061ms)
✔ G18: unknown high-risk trust state -> BLOCKED / REQUIRE_HUMAN (0.143465ms)
✔ G19: unknown irrelevant metric -> must not block unrelated low-risk operation (0.139247ms)
✔ G20: target authority exists but enforcement capability absent -> DENY / REQUIRE_HUMAN (0.136101ms)
✔ G21: expired human authorization receipt -> DENY (0.151841ms)
✔ G22: authorization for WP-A reused on WP-B -> DENY (confused deputy WP mismatch) (0.151821ms)
✔ G23: authorization for resource A reused on resource B -> DENY (confused deputy resource mismatch) (0.162602ms)
✔ G24: provider capable of operation but lacks authority -> DENY (CAPABILITY != AUTHORITY) (0.148184ms)
✔ G25: telemetry says previous success but current authority absent -> DENY (0.184765ms)
✔ G26: denial emits typed reason codes -> PASS (0.147623ms)
✔ G27: governance gate produces decision receipts without mutating workctl lifecycle directly (0.145389ms)
✔ G28: operation after decision expiry -> re-evaluate / DENY stale decision (TOCTOU defense) (0.097086ms)
✔ G29: risk classification downgrade attempted by executor -> DENY (0.115712ms)
✔ G30: conflicting constitutional evidence -> fail closed on affected operation (0.105332ms)
✔ G01: valid local read -> ALLOW (1.297327ms)
✔ G02: bounded builder mutation + active claim + valid STC lease + in-scope path -> ALLOW (0.216435ms)
✔ G03: builder mutation outside owned scope -> DENY (0.13555ms)
✔ G04: mutation without active claim -> DENY (0.11988ms)
✔ G05: mutation with expired/missing lease -> DENY (0.141181ms)
✔ G06: model claims human authorized but no receipt exists -> REQUIRE_HUMAN / DENY (0.149607ms)
✔ G07: valid human authorization receipt -> ALLOW / recognized (0.298172ms)
✔ G08: raw secret access -> DENY regardless of model/role (0.129067ms)
✔ G09: metered call with paidAuthorized=false -> DENY / REQUIRE_HUMAN (0.152231ms)
✔ G10: metered call inside active preauthorized envelope -> ALLOW (0.1933ms)
✔ G11: actor attempts to increase own budget -> DENY (0.123567ms)
✔ G12: low-risk derived projection rebuild + policy permission -> ALLOW (0.119419ms)
✔ G13: architectural doctrine promotion by agent -> REQUIRE_HUMAN (0.128336ms)
✔ G14: local Git commit in authorized worktree -> ALLOW where policy permits (0.119269ms)
✔ G15: main merge missing independent verification -> DENY (0.119869ms)
ℹ tests 30
ℹ suites 0
ℹ pass 30
ℹ fail 0
ℹ duration_ms 50.018896
\`\`\`
