# KAD-PI Counterfactual Observatory & Longitudinal Divergence Journal

## Overview

The **Counterfactual Observatory** (`tools/kad/telemetry/observatory.mjs`) is an append-only, tamper-evident longitudinal measurement layer. It tracks, hashes, and compares actual production routing against shadow economic evaluation recommendations over time without granting the shadow evaluator execution authority and without making unexecuted counterfactual claims.

## Epistemic Integrity

The observatory strictly enforces epistemic classification:

* **`OBSERVED`**: Factual measurements of what actually occurred (production route, token usage, latency, actual outcome).
* **`COUNTERFACTUAL`**: The shadow recommendation that was explicitly **NOT** executed.
* **`DERIVED`**: Pure mathematical calculations computed strictly from observed data (divergence rate, agreement count, cache hit rate).
* **`ESTIMATED_COUNTERFACTUAL`**: Hypothetical opportunity classifications (e.g. expiring subscription opportunities).
* **`UNKNOWN`**: Explicit marker for unobserved or unexecuted claims (e.g., empirical savings or quality differences without an active intervention).

> **Core Doctrine**: *No causal claims without intervention. The shadow route was not executed and cannot claim empirical savings.*

## Storage & Tamper Evidence

* **Runtime Journal Path**: `$XDG_STATE_HOME/kad-pi/shadow-observatory/observations.jsonl` (defaults to `~/.local/state/kad-pi/shadow-observatory/observations.jsonl`).
* **Hash Chaining**: Each event carries `previous_hash` + canonical event JSON $\rightarrow$ SHA-256 `event_hash`.
* **Bounded Retention**: Automatically enforces bounded event retention while preserving valid chain structure.
* **Malformed-Tail Recovery**: Isolates incomplete or corrupted trailing writes on restart without losing valid historical prefix records.

## Policy & Evaluator Fingerprinting

Every observation record embeds:
* `shadow_policy_fingerprint`: SHA-256 digest of frozen parameters, scope rules, and binding window logic (`kad-shadow-policy-frozen-v1`).
* `evaluator_version`: `kad-economic-shadow-v1`.

Any change to evaluation rules produces a new fingerprint, guaranteeing experiment separation.

## CLI & Operator Interface

Inspect longitudinal observatory metrics:
```bash
# Human readable summary
bin/kad observatory

# Machine readable JSON
bin/kad observatory --json
```
