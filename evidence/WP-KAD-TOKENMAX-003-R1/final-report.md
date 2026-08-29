# WP-KAD-TOKENMAX-003-R1 final report

## Verdict

**PARTIAL**. The deterministic recovery boundary was implemented and the single live resume was executed, but Qwen still failed strict acceptance after the one allowed repair. Two post-run syntax-boundary tests were added afterward; no further live attempt was made.

## Root cause

The parent raw Qwen outputs were not archived, so their exact serialization shape cannot be classified without inference. Parent validator evidence records only `output is not a JSON object`, task mismatch, and missing arrays.

In the canonical R1 run, the first local output had a uniquely recoverable JSON envelope (`UNIQUE_WRAPPED_JSON`), but did not produce final validator acceptance. The one repair output contained multiple JSON candidates (`MULTIPLE_JSON_VALUES`) and was rejected closed. No raw content or hidden reasoning was retained.

## Deterministic recovery

Added `normalizeWorkerOutput` at the existing swarm/validator boundary. It only permits:

- surrounding whitespace removal;
- one allowlisted ` ``` `/` ```json ` fence;
- exactly one complete parseable outer JSON object in harmless wrapper text;
- separation of paired visible `<think>`/`<analysis>` wrappers without retaining their contents.

It never renames keys, invents fields, changes values or citations, chooses multiple candidates, changes IDs/trust claims, or grants acceptance.

## Archived replay

`archived-attempt-replay.json` records `ACTUAL_RAW_REPLAY_UNAVAILABLE`: TOKENMAX-LIVE-001 retained no raw assistant bytes or raw hashes. Representative deterministic fixtures pass the offline contract tests but are not claimed as archived output.

## Resume decision

`UPSTREAM_REUSED`. The original request, controller decomposition, packet hash `91e0384bf7e54a6cac0d83a9315ba4c802759db801b06b449a308689e72cbc5b`, source hashes, and quota snapshot were verified unchanged. The controller was not called again.

## Live recovery

`TOKENMAX-LIVE-001-R1` reused the frozen upstream plan and ran Qwen once with the existing maximum-one repair policy. Final result: `DEGRADED`, deterministic validation `FAIL`, accepted `false`.

## Acceptance

Validator: `schema-source-evidence-validator`.

The normalized first output was syntactically recoverable, but the final repaired output had multiple JSON candidates and failed closed. KAD acceptance remained independent of both model outputs.

## Incremental economics

| Metric | Recovery |
|---|---:|
| new remote controller calls | 0 |
| new remote tokens | 0 |
| new local calls | 2 |
| new model repairs | 1 |
| deterministic normalization attempts | 2 |
| deterministic normalization successes | 1 |
| latency | 203548 ms |
| provider cost | UNKNOWN/null |

The parent's 709 remote tokens remain sunk and are not recharged.

## Cumulative lineage economics

- parent remote: 709 tokens, 1 controller call;
- recovery remote increment: 0 tokens, 0 controller calls;
- cumulative remote: 709 tokens;
- parent local calls: 2;
- recovery local calls: 2;
- cumulative local calls: 4;
- cumulative repairs: 2;
- quota snapshot remains linked by `b830f3e556cc100c02f839ab869b4e3536dc94ab00345b61f9628f0f74c2cf70`.

## Comparability / Pareto

- Recovery versus rejected parent: `NOT_COMPARABLE` / `INSUFFICIENT_EVIDENCE` because the parent was not accepted.
- Recovery versus `SWARM-REAL-001`: `NOT_COMPARABLE` because the audit scope differs from historical single-rule fact finding.
- Pareto result: `INCOMPARABLE`.

No savings, dominance, or provider-superiority claim is made.

## Shadow recommendation

`INSUFFICIENT_EVIDENCE`. Production routing was unchanged.

## Distillation

`NO_CANDIDATE`. One recovery observation is insufficient repeated classified evidence, and the parent raw output is unavailable. The deterministic normalizer is an unpromoted implementation candidate only.

## Lifecycle

Qwen reached `OWNED` with verified identity, then `DISPOSED`; its activation receipt was removed. External Stheno remained healthy and WORLD-only. Stheno was not called.

## Tests

- output normalizer/recovery tests: **21/21**
- full KAD: **198/198**
- real Pi integration: **7/7**
- Librarian: **11/11**
- PRIME: **PASS**
- `git diff --check`: **PASS**

## Evidence

`evidence/WP-KAD-TOKENMAX-003-R1/`

Key files include `failure-forensics.json`, `archived-attempt-replay.json`, `resume-decision.json`, `recovery-run-receipt.json`, `recovery-economic-episode.json`, `acceptance-receipt.json`, `lifecycle-receipt.json`, `replay-receipt.json`, and `causal-trace.jsonl`.

## Remaining limitation

Qwen's output contract remains unreliable for this task, and the parent raw outputs cannot be replayed exactly.

## Next smallest experiment

Make the Qwen runtime emit a validator-compatible structured response without another remote call, then schedule a separate future live experiment only after preserving raw local output bytes and hashes.
