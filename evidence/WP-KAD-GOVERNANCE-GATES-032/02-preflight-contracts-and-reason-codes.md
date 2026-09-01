# WP-KAD-GOVERNANCE-GATES-032: 02 - Preflight Contracts & Reason Codes

## 1. Schema Contracts

### A. `GOVERNANCE_PREFLIGHT_V1`
Input contract submitted before consequential operations:
- `actor`: `actor_id`, `actor_class`
- `work`: `workpackage_id`, `ticket_id`, `run_id`, `lifecycle_state`
- `operation`: `operation_class`, `action`, `resource_refs`
- `scope`: `owned_paths`, `requested_paths`
- `authority`: `required_level`, `target_authority`, `claimed_human_approval_in_prose`
- `risk`: `risk_tier`, `reversible`, `containment_ref`, `unknown_risk_factors`
- `evidence`: `tests_passed`, `independent_verification_ref`, `human_authorization_receipt`, `has_unresolved_contradiction`
- `resource`: `stc_lease_ref`, `lease_valid`, `budget_envelope_ref`, `estimated_cost_usd`, `envelope_remaining_usd`
- `provenance`: `requested_at`, `request_hash` (SHA-256)

### B. `GOVERNANCE_DECISION_V1`
Auditable evaluation receipt output:
- `request_hash`: SHA-256 digest of preflight request
- `decision`: `ALLOW`, `DENY`, `REQUIRE_HUMAN`, `BLOCKED`, `IN_DOUBT`
- `reason_codes`: Typed, machine-actionable reason codes
- `evaluated_policy`: `KAD_GOVERNANCE_POLICY_V1`
- `authority_level`: Resolved authority tier
- `missing_requirements`: Actionable remediation list
- `human_gate_required`: Boolean
- `evaluated_at`, `valid_until`: Short-lived TTL (5 minutes) for TOCTOU defense
- `decision_hash`: SHA-256 canonical integrity digest

## 2. Typed Reason Code Taxonomy

| Category | Reason Code | Description |
| :--- | :--- | :--- |
| **Authorizations** | `AUTHORIZED_BY_POLICY` | Approved by deterministic low-risk policy |
| | `AUTHORIZED_WITHIN_LEASE` | Approved within active workctl claim and STC lease |
| | `AUTHORIZED_BY_HUMAN_RECEIPT` | Approved by verified human authorization receipt |
| | `READ_LOCAL_AUTONOMOUS` | Local read autonomously permitted |
| | `BUDGET_ENVELOPE_AUTHORIZED` | Metered call inside pre-authorized envelope |
| | `MAIN_INTEGRATION_READY` | Main merge evidence complete and ready |
| **Scope & Claims** | `NO_ACTIVE_CLAIM` | Operation requires active claim lease |
| | `PATH_OUTSIDE_SCOPE` | Requested path is outside owned scope |
| | `STC_LEASE_MISSING` | STC lease reference is missing |
| | `STC_LEASE_EXPIRED` | STC claim lease has expired |
| **Prohibitions** | `RAW_SECRET_ACCESS_FORBIDDEN` | Raw secrets are permanently forbidden |
| | `CONSTITUTIONAL_MUTATION_HUMAN_ONLY` | Constitutional mutation reserved for humans |
| | `DOCTRINE_PROMOTION_HUMAN_ONLY` | Knowledge doctrine promotion requires human gate |
| | `HIGH_RISK_HUMAN_GATE_REQUIRED` | High-risk tier operation requires human sign-off |
| **FinOps** | `BUDGET_NOT_AUTHORIZED` | Metered calls prohibited when paidAuthorized=false |
| | `BUDGET_SELF_ESCALATION_FORBIDDEN` | Agents cannot increase their own budget envelope |
| | `BUDGET_ENVELOPE_EXCEEDED` | Estimated cost exceeds remaining envelope |
| **Verification** | `INDEPENDENT_VERIFICATION_MISSING` | Independent review missing for main integration |
| | `CONSTITUTIONAL_CONTRADICTION_FAIL_CLOSED`| Unresolved contradiction triggers fail-closed |
| | `PAST_SUCCESS_INSUFFICIENT_FOR_AUTHORITY` | Past telemetry success does not grant current authority |
| **Anti-Spoofing** | `FAKE_HUMAN_APPROVAL_PROSE_REJECTED` | Model prose claim of human approval rejected |
| | `HUMAN_RECEIPT_MISSING` | Required human receipt not supplied |
| | `HUMAN_RECEIPT_EXPIRED` | Human receipt validity window has elapsed |
| | `HUMAN_RECEIPT_TAMPERED` | Human receipt hash mismatch |
| **Confused Deputy** | `CONFUSED_DEPUTY_WP_MISMATCH` | Receipt for WP-A used on WP-B |
| | `CONFUSED_DEPUTY_RESOURCE_MISMATCH` | Receipt for resource A used on resource B |
| | `CONFUSED_DEPUTY_SCOPE_MISMATCH` | Receipt for operation X used on operation Y |
| **Capability** | `CAPABILITY_WITHOUT_AUTHORITY_DENIED` | Possessing technical tool does not grant authority |
| | `CAPABILITY_NOT_IMPLEMENTED` | Missing capability causes safe fallback closed |
| | `RISK_TIER_DOWNGRADE_FORBIDDEN` | Agent cannot downgrade declared risk tier |
| **Stale/Unknown** | `STALE_DECISION_EXPIRED` | Decision TTL has expired (TOCTOU defense) |
| | `UNKNOWN_HIGH_IMPACT_STATE` | Unknown high-risk trust state blocks operation |
