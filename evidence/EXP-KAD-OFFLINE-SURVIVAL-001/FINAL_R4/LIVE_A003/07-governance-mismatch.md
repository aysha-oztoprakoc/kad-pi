# R4-A003-07 Governance Semantic Mismatch

Status: `INVALID_FOR_LIVE_MUTATION_AUTHORITY`

Reason: `AUTHORIZATION_SEMANTIC_SCOPE_MISMATCH`

The existing A003 human event `APPROVE_FRESH_A003_SCOPE` authorized preparation only: creation of preparation artifacts and deterministic preflight preparation. It explicitly did not authorize live mutation.

The issued artifact `04-v2-receipt.json` nevertheless declares:

```text
operation_class = INFRASTRUCTURE_MUTATION
action = route.delete.default
```

Its derived preflight therefore reports `HUMAN_PREAUTHORIZED` and `human_gate_required = false`, which exceeds the actual human event scope.

The existing receipt and preflight are preserved unchanged as historical evidence and MUST NOT authorize Phase B. They are invalid for live mutation authority.

This mismatch does not invalidate the A003 route observation, observer design, critical-section timing design, or preparation work.

A separate Phase-B execution authorization, fresh receipt, and fresh preflight are required before any `sudo -v`, observer start, guard arming, or route mutation.
