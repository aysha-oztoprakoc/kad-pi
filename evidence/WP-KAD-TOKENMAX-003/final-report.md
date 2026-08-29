# WP-KAD-TOKENMAX-003 final report

## Verdict

**PARTIAL**. The live KAD path routed and executed, but the local Qwen result remained malformed after the accepted one-repair bound. Therefore no new accepted economic episode was produced and the acceptance gates requiring a live accepted result are not met.

## Baseline

Started from `f21f130bee833af9f89af307b15d255f3c558d79`, with the accepted previous SWARM evidence hash recorded in `baseline.json`. Pre-existing dirty/untracked work was preserved.

## Experiment

`TOKENMAX-LIVE-001`: read-only repository trust-isolation regression audit. The request asked for current evidence of the exact trust-domain eligibility rule, Qwen's retrieval boundary, Stheno's WORLD boundary, and whether WORLD can satisfy RETRIEVAL.

The packet contained only:

- `tools/kad/local-router.mjs`
- `tools/kad/pi/local-models.json`
- `.omp/models.yml`

with deterministic hashes and bounded excerpts.

## Route and execution

The economic route selected the existing `approved-remote-controller` (`openai-codex/gpt-5.6-luna`), approved, subscription-backed, non-PAYG. The local worker was STC-owned Qwen on port 5002, identity-verified. WORLD/Stheno was registered as external WORLD-only and deterministically excluded before worker execution; it was not called.

A first live attempt exposed a one-off harness post-processing bug before persistence. No values from it are claimed. The canonical bounded execution was then persisted automatically through `executeSwarm`; it failed local output validation after one repair.

## Quota snapshot

Snapshot `b830f3e556cc100c02f839ab869b4e3536dc94ab00345b61f9628f0f74c2cf70` was captured immediately before controller routing using the existing bounded QUOTA-002 probe. Codex allowance was `PARSE_UNSUPPORTED`; normalized capacity and remaining stayed `UNKNOWN/null`. OpenRouter usage was observed as `0`, but its heterogeneous USD capacities and remaining values also stayed unknown.

The snapshot hash is attached to the runtime `kad-economic-1` receipt.

## Acceptance

`schema-source-evidence-validator` independently rejected the worker output as non-JSON, with task ID and required-array errors, after one bounded repair. Final status: `DEGRADED`; accepted: `false`. No model or controller self-accepted the result.

## Economic receipt

The automatically attached rejected receipt records:

| Field | Value |
|---|---:|
| remote input | 550 |
| cached input | UNKNOWN/null |
| remote output | 159 |
| total remote | 709 |
| controller calls | 1 |
| local calls | 2 |
| deterministic calls | 1 |
| repairs | 1 |
| escalations | 0 |
| latency | 208910 ms |
| compiled context | 4105 bytes |
| provider cost | UNKNOWN/null |

The receipt preserves subscription billing and does not convert runtime cost metadata into actual dollars.

## Historical comparison

`NOT_COMPARABLE`. Trust domain, required capability, acceptance authority, and local topology align, but this four-point repository-invariant audit is not the same task scope/cognitive operation as historical `SWARM-REAL-001`'s single-rule fact-finding request.

## Pareto result

`INCOMPARABLE`. No dominance or token-savings claim is valid because the live work was rejected and task scope differs.

## Shadow recommendation

`INSUFFICIENT_EVIDENCE`. Production routing was not mutated.

## Distillation

`NO_CANDIDATE`. The canonical result was rejected, and the live audit was not substantially the same cognitive operation as the historical episode. No promotion or training occurred.

## Lifecycle

Qwen activation reached `ACTIVE` with verified identity and `OWNED` PID 136590, then reached `DISPOSED`; its activation receipt was removed and port 5002 was inactive afterward. External Stheno remained healthy with identity `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M` and PID 125225. Stheno was never invoked by the audit.

## Validation and tests

- accepted-work economics: **25/25**
- full KAD: **177/177**
- real Pi integration: **7/7**
- Librarian: **11/11**
- PRIME: **PASS**
- diff hygiene: **PASS**

## Evidence

`evidence/WP-KAD-TOKENMAX-003/`

Key files: `live-run-receipt.json`, `live-economic-episode.json`, `quota-snapshot.json`, `task-packet.json`, `acceptance-receipt.json`, `comparability-receipt.json`, `pareto-analysis.json`, `shadow-routing-receipt.json`, `distillation-receipt.json`, `lifecycle-receipt.json`, and `causal-trace.jsonl`.

## Remaining limitation

The local Qwen runtime did not produce validator-compatible JSON, so the required new accepted episode and valid TOKENMAX Pareto comparison were not obtained.

## Next smallest experiment

After fixing only the Qwen output-contract/runtime issue, repeat this same declared audit once through the existing path; do not add a provider, benchmark, or manufacture another task.
