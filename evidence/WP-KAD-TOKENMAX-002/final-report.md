# WP-KAD-TOKENMAX-002 final report

## Verdict

**PASS** — accepted-work economic feedback is implemented using passive telemetry and historical accepted evidence. No live remote execution was necessary or justified.

## Final commit

The exact attributable commit is recorded in the workpackage completion response; this report is part of that commit.

## Baseline

Started from `4605e96c0d6480da3622e892e021d59cc06c71d0`. QUOTA-002's multi-window state remains available. Unrelated dirty/untracked work was preserved.

## Economic receipt

`kad-economic-1` normalizes task/episode identity, semantic role, provider/model transport metadata, execution class, native token usage, provider-reported cost only with provenance, billing class, latency, context bytes, validation, acceptance, repairs, escalations, slop indicators, and quota snapshot linkage. Missing data remains null/UNKNOWN. Hidden reasoning is excluded.

## Accepted-work evidence

Historical accepted `SWARM-REAL-001` is labelled `HISTORICAL_OBSERVED`: 1,086 input tokens, 93 output tokens, 1,179 total remote tokens, 80,596 ms, two controller calls, zero repairs, and KAD validation `PASS`/accepted `true`. No live task was independently required, so `live-economic-episode.json` records `NOT_TRIGGERED_NO_JUSTIFIED_REMOTE_WORK`.

## Resource accounting

Calculated from observed fields: `remote_tokens_per_accepted_episode = 1179`; `repair_amplification = 2`; provider cost per accepted episode is `UNKNOWN` because subscription-backed runtime cost metadata is not treated as an actual charge. Cached-input, reasoning-token, accepted-artifact, and historical quota-snapshot fields remain null.

## Pareto analysis

`INSUFFICIENT_EVIDENCE`: no equivalent accepted alternative has complete comparable metrics. No provider superiority or migration rule is claimed.

## Shadow recommendation

`INSUFFICIENT_EVIDENCE`. Production routing was not mutated.

## Distillation

No candidate was produced. One accepted episode is insufficient repeated evidence; no promotion or automatic training occurs.

## Quota linkage

The historical execution has `quota_snapshot_id: null` because QUOTA-002 observation was not captured at its route time. Current OpenRouter usage/allowance state remains separately represented by QUOTA-002 and is not retroactively attached.

## Spend safety

PAYG, paid fallback, auto-topup, and telemetry-induced requests remain disabled. No model call was made for benchmarking, quota discovery, or telemetry collection.

## Tests

- Accepted-work economics: **25/25**.
- Full KAD suite: **177/177**.
- Real Pi integration: **7/7**.
- Librarian: **11/11**.
- PRIME directive: **PASS**.
- `git diff --check`: **PASS**.

## Evidence

`evidence/WP-KAD-TOKENMAX-002/`

## Remaining limitation

Only one accepted remote episode has complete token/latency evidence, so economic comparison and downward migration remain shadow-only.

## Next smallest experiment

Capture one naturally required future accepted remote episode with the current QUOTA-002 snapshot attached, without creating any additional work.
