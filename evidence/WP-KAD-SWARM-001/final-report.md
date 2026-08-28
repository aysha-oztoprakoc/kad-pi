# WP-KAD-SWARM-001 closure

## Verdict

**PASS** — one bounded real execution completed the required controller → packet compiler → Pi/Qwen worker → deterministic validator → accepted episode path. A second real attempt is retained as a bounded `DEGRADED` negative result after one repair.

## Swarm proven

`openai-codex/gpt-5.6-luna` (semantic controller lane selected from `.omp/controllers.json`) decomposed `SWARM-REAL-001`; KAD compiled a one-source, SHA-256-addressed packet; Pi 0.84.3 invoked the STC-owned `kad-local-qwen/qwen-local` worker; source/schema validation accepted one fact about `CapabilityRegistry.eligible`; the same controller consumed the validated result; and the accepted episode was recorded. No worker mutation or tool wandering was permitted.

The definitive accepted receipt is durable in `real-swarm-run.json`; an earlier accepted attempt and one bounded failure are retained in `real-swarm-observed-summary.json` and `real-swarm-failure-receipt.json`. No hidden reasoning is persisted.

## Acceptance gates

1. Semantic controller role: **PASS**
2. Provider below role policy: **PASS**
3. Real approved controller decomposition: **PASS**
4. Real Pi/Qwen worker: **PASS**
5. Bounded task packet: **PASS**
6. Qwen supported retrieval envelope: **PASS**
7. Stheno WORLD-only: **PASS**
8. Exact trust-domain isolation: **PASS**
9. Independent deterministic validation: **PASS**
10. Controller-to-worker result path: **PASS**
11. Failure safely degrades: **PASS**
12. Bounded repair: **PASS** (maximum one)
13. STC-owned lifecycle: **PASS**
14. External process preservation: **PASS**
15. Spend safety: **PASS**; PAYG authorization false, quota/price remain UNKNOWN
16. Economic telemetry: **PASS**
17. Distillation episode: **PASS**; runtime training eligibility false
18. Deterministic replay: **PASS**
19. Relevant regression: **PASS**
20. Adversarial review: **PASS**
21. Attributable commit: **PASS** — this evidence package is included in the attributable closure commit.

## Economic evidence

Definitive accepted attempt: 2 controller calls (decomposition + consumption), 1,086 remote input tokens, 93 remote output tokens, exposed cost `0.0003288`; 1 local call, 1 deterministic tool invocation, 2,076 packet bytes, 0 repairs, 80,596 ms. A separate observed attempt used 1 bounded repair, failed validation, and degraded: 2 local calls, 518/45 remote tokens, exposed cost `0.0001576`. No token-savings or cheaper-than-baseline claim is made. Missing quota is `UNKNOWN`.

## Distillation evidence

`episode.json` records task identity, source hash, packet bounds, route, resource/ownership, output, validator, trajectory, economics, and `training_eligibility.eligible=false`. It contains no hidden reasoning. `claim-ledger.jsonl` separates observed, unknown, rejected, and retained runtime-supervision claims.

## Lifecycle

Qwen PID 1459423 was spawned under the KAD manager, identity-verified, advertised as `OWNED`, and disposed; its receipt and endpoint were removed. External Stheno PID 1215627 on port 5001 remained healthy with identical model identity before and after teardown. Post-teardown preflight degraded only `local_retrieval`.

## Tests

- KAD tests: **78/78 passed**.
- Librarian tests: **11/11 passed**.
- Targeted swarm/lifecycle/multi-endpoint/preflight tests: **32/32 passed**.
- Prime validation, syntax/config validation, and canonical replay: **PASS**.

## Remaining limitations

Qwen output is not deterministic on every prompt: the retained second attempt produced malformed output and safely degraded. Qwen remains retrieval-only; no coding, security, architecture, governance, acceptance, automatic promotion, quota balance, or future token-savings claim is established.

## Files

Implementation: `tools/kad/swarm.mjs`, `tools/kad/run-swarm-experiment.mjs`, `tools/kad/local-inference-capability.mjs`, `tools/kad/omp-orchestration-preflight.mjs`, `tools/kad/pi/local-child.mjs`.

Evidence: `evidence/WP-KAD-SWARM-001/`.
