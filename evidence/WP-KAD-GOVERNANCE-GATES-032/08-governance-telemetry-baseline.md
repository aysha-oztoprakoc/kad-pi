# WP-KAD-GOVERNANCE-GATES-032: 08 - Governance Telemetry Baseline

## 1. Governance Evaluation Telemetry
Governance preflights emit structured, local-first telemetry records into `.agents/telemetry/governance/decisions.jsonl` to measure governance overhead, friction points, and decision latency.

### Emitted Telemetry Record Schema
```json
{
  "schema_version": "KAD_GOVERNANCE_TELEMETRY_RECORD_V1",
  "decision_hash": "sha256:...",
  "decision": "ALLOW",
  "reason_codes": [
    "AUTHORIZED_WITHIN_LEASE"
  ],
  "authority_level": "AUTONOMOUS_WITHIN_LEASE",
  "human_gate_required": false,
  "operation_class": "WORKSPACE_MUTATION",
  "workpackage_id": "WP-KAD-GOVERNANCE-GATES-032",
  "latency_ms": 1.2,
  "timestamp": "2026-08-30T22:15:00.000Z"
}
```

## 2. Invariant: Telemetry Observes $\neq$ Telemetry Authorizes
- Governance decisions emit telemetry as historical evidence.
- Telemetry trends (e.g. 100 consecutive successful preflights) **never** automatically grant elevated authority, widen scopes, remove human gates, or modify economic routing.
- Authority remains derived exclusively from deterministic governance policy and verifiable human authorization receipts.
