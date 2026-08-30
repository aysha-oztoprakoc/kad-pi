# KAD-PI Shadow Economic Evaluator

## Overview

The **Shadow Economic Evaluator** (`tools/kad/telemetry/economic-shadow.mjs`) is a pure, side-effect-free evaluator that analyzes quota-aware economic routing opportunities without possessing authority to mutate production routes or authorize spend.

## Prime Invariants

1. **Telemetry advises; policy authorizes**: Telemetry records and reset windows advise routing preference; production `routeEconomically()` remains the sole operational execution authority.
2. **Paid Authorization Barrier**: If `policy.spend.payg_authorized` is `false`, the shadow evaluator will **NEVER** recommend a paid route.
3. **Epistemic Honesty**: Unknown limits remain `UNKNOWN` and receive zero synthetic bonuses.
4. **Scope Isolation**: Quota windows are strictly scoped by provider, model, and account. Model-specific quotas never constrain unrelated models.
5. **Deterministic Replay**: Given identical requirement, lanes, telemetry, and frozen timestamp, evaluation produces byte-equivalent output.

## Quota Semantics

* `remaining_fraction`: $\text{remaining} / \text{limit} \in [0.0, 1.0]$ (1.0 = full, 0.0 = exhausted).
* `used_fraction`: $\text{used} / \text{limit} \in [0.0, 1.0]$ (1.0 = fully consumed).
* `quota_pressure`: $1.0 - \text{remaining\_fraction}$.
* `time_until_reset_ms`: $\max(0, \text{reset\_at} - \text{now})$.
* `expiry_fraction`: $\text{time\_until\_reset\_ms} / \text{window\_duration\_ms}$.
* `reset_urgency`: $1.0 - \text{expiry\_fraction}$.

## Advisory Signals

* **`SUBSCRIPTION_EXPIRING_OPPORTUNITY`** ("Use-it-or-lose-it"): When a subscription lane has abundant remaining quota ($\ge 50\%$) and its reset window is expiring soon ($\ge 75\%$ through window) during queued batch work, its shadow rank is elevated ahead of remote free.
* **`PRESERVE_SCARCE_QUOTA`**: When a quota is scarce ($< 25\%$) with a distant reset window, its preference is demoted to preserve quota for interactive requests.
* **`STALE_TELEMETRY_DEMOTION`**: Telemetry older than TTL is demoted and cannot outrank fresh authoritative data.
* **`UNKNOWN_QUOTA_NEUTRAL`**: Telemetry with unknown capacity/remaining is evaluated neutrally with zero bonus.

## CLI & Operator Interface

Inspect shadow evaluation alongside production routing:
```bash
# Human readable
bin/kad budget

# Machine readable JSON
bin/kad budget --json
```
