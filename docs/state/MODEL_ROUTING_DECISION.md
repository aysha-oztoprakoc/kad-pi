# Model-Routing Decision & Builder Provenance

**Authority**: capability-role routing (ROLE ≠ MODEL ≠ PROVIDER), accepted for WP-041 second corrective pass.

## Invariant
Roles are stable capability contracts. Model/provider bindings are runtime routing decisions, not architectural identities. Bindings derive from availability, authorization, empirical Role×Model benchmarks, quota scarcity, latency, and accepted-result reliability.

## Routing decision (bootstrap/canary — not canonical identity)
```yaml
ROUTING_DECISION:
  role: kad-builder
  resolved_model: opencode-go/deepseek-v4-flash
  reason: bootstrap/canary
  authority: empirical-router
  expires_on: benchmark/reconfiguration
```
`deepseek-v4-flash` is available through the OpenCode Go subscription but is not currently wired into the OMP role-routing surface; the builder role is a capability contract, not a fixed model.

## Builder provenance (actual, observed)
- **First corrective pass** (`13002b9`): builders were 2 `task` workers. The OMP `@task` role resolves to `openai-codex/gpt-5.4-mini` — **not** DeepSeek V4 Flash. This provenance is corrected here; the earlier "DeepSeek V4 Flash = builder" wording was inaccurate.
- **Second corrective pass** (schema extraction + matrix rebuild): performed **deterministically** via static-schema-extraction scripts, not an LLM builder (per Deterministic First — counting settings, parsing the schema, and merging values are deterministic questions). No LLM builder model was involved in the artifact mutation.

## Role contract (canonical direction)
```
role.kad-builder:
    requires: { coding: high, tool_use: high, schema_adherence: high, mutation: true }
    prefers: { latency: low, quota_cost: low }
    forbids: { unverified_tool_mutation: true }
```
Seven logical roles: SCOUT, ANALYST, STRATEGIST, BUILDER, GUARDIAN, VERIFIER, OBSERVER. GUARDIAN and VERIFIER are deterministic-first; LLM use is advisory for semantic/security review only.
