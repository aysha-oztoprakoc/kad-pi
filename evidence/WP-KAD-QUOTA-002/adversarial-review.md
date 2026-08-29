# Adversarial review

- **Auth readiness mistaken for quota:** rejected; `ready` auth checks normalize to UNKNOWN.
- **OpenRouter null limit treated as unlimited:** rejected; observed USD usage is retained, capacity/remaining/reset stay null.
- **OpenRouter OAuth leaked:** rejected; token was process-memory-only and absent from sanitized output/evidence.
- **401/403 treated as exhaustion:** rejected; permission failures normalize to AUTH_INSUFFICIENT + UNKNOWN.
- **GitHub billing permission:** existing scopes were `gist`, `read:org`, `repo`, `workflow`; no `Plan: read`, so no PAT or scope change was attempted.
- **Codex status:** installed/authenticated, but bounded PTY `/status` produced no machine-readable allowance; no model task was sent.
- **OpenCode policy:** $12/$30/$60 is represented as DECLARED capacity with UNKNOWN usage/remaining.
- **Heterogeneous units:** USD, requests, credits, percent, and tokens remain native and cannot be compared as one scalar.
- **Multi-window bottleneck:** known exhausted applicable windows block routing; UNKNOWN windows do not become GREEN.
- **Stale data:** freshness is evaluated independently per window.
- **Expiring work:** preference changes only when useful queued work is true.
- **Provider-specific router logic:** parsers remain in `remote-quota-observation.mjs`; economic-router has no provider parser branch.
- **Spend escalation:** quota/credit observations do not change PAYG, fallback, auto-topup, or cost limits.
- **Inference discovery:** no model inference was used to discover quota.
- **Polling:** bounded cache is covered by T21; no daemon or loop was introduced.
