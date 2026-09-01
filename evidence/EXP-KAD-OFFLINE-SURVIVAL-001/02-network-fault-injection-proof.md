# Network fault injection proof

## Result

**NOT INJECTED — BLOCKED by governance preflight.**

The request was evaluated by `bin/kad-governance preflight` before any host mutation:

```json
{
  "decision": "BLOCKED",
  "reason_codes": ["UNKNOWN_HIGH_IMPACT_STATE"],
  "authority_level": "HUMAN_ONLY",
  "human_gate_required": true,
  "evaluated_policy": "KAD_GOVERNANCE_POLICY_V1",
  "request_hash": "sha256:63e8fceb76bef863e471af2145b68abc5b48c53dbb6625a8e96b3f316b9fab55",
  "decision_hash": "sha256:727739211e2db17741d4a14edfa6d90c72b86d08698982d50f1a277baff2539e"
}
```

`INFRASTRUCTURE_MUTATION` is configured as `HUMAN_ONLY`, `TIER_3_HIGH`, and requires a human authorization receipt. No receipt was present. No interface was used to disable or restore networking; no `ip`, firewall, VPN, route, or service mutation was attempted.

The online baseline proves only that WAN was available at baseline (`github.com` and `api.openai.com` resolved, default route `192.168.0.1` via `enp7s0`). It is not an offline proof.

## Classification

- `EXPERIMENT_SETUP_FAILURE`: the required fault-injection apparatus could not be authorized in this run.
- `GOVERNANCE_FAILURE`: **not observed**; fail-closed blocking behaved as configured.
- Experiment verdict impact: `BLOCKED`, not `FAIL`; offline capability remains `NOT_TESTED`.
