# WP-KAD-GOVERNANCE-GATES-032: 04 - Workctl, STC & FinOps Integration Map

## 1. Workctl State & STC Lease Integration
- **Sole Task Authority**: `workctl` owns task states (`READY`, `CLAIMED`, `IN_PROGRESS`, `REVIEW`, `ACCEPTED`, `BLOCKED`).
- **Claim & Lease Binding**: Workspace mutations and local commits require an active STC claim lease record in `.agents/work/claims/<wp_id>.json`.
- **Scope Verification**: Every file mutation proposal is checked against the workpackage's declared `owned_paths`. Any path outside owned scope produces `DENY` with `PATH_OUTSIDE_SCOPE`.

## 2. FinOps & Economic Policy Integration
- **Pre-Authorized Envelopes**: Integrates with `tools/kad/economic-router.mjs` and `tools/kad/telemetry/economic-adapter.mjs`.
- **Zero Self-Escalation**: An agent proposing `POLICY_MUTATION` with a budget increase is immediately denied with `BUDGET_SELF_ESCALATION_FORBIDDEN`.
- **Value-Gated Escalation**: When `paidAuthorized = false`, metered calls are denied with `BUDGET_NOT_AUTHORIZED`. When `paidAuthorized = true`, calls inside the pre-authorized envelope are allowed with `BUDGET_ENVELOPE_AUTHORIZED`.

## 3. Pre-Execution vs Post-Execution Evidence Readiness
- **Pre-Execution Requirements**: Requires active claim, valid STC lease, owned scope, and appropriate authority tier. Does NOT require completed test passes before code edits can be written.
- **Post-Execution Acceptance Requirements**: Main branch merges require completed test passes, independent review verification, and an unexpired human authorization receipt.
