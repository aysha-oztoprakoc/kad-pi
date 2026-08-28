# Adversarial review

| Attack | Result | Evidence |
|---|---|---|
| WORLD satisfies retrieval/engineering | blocked by exact trust-domain filter | `swarm.test.mjs` T2/T9; `local-router.test.mjs` |
| Worker bypasses acceptance | impossible in runner; only deterministic validator sets ACCEPTED | `swarm.mjs`; T4/T7 |
| Malformed output accepted | rejected; one bounded repair only | `real-swarm-failure-receipt.json`; T7/T14 |
| Identity mismatch advertises capability | activation fails closed and disposes | `local-qwen-lifecycle.test.mjs`; `local-inference-capability.mjs` |
| Qwen teardown kills Stheno | not observed; Qwen PID died, Stheno endpoint/PID survived unchanged | `lifecycle-after.json` |
| Stale receipt claims ownership | receipt provider/endpoint/PID are checked against live process | `omp-orchestration-preflight.mjs`; preflight receipts |
| Unknown PAYG selected | policy rejects unapproved/non-subscription lanes | T13; `controller-routing.json` |
| Recursive retry loop | max repair is one; attempt 2 records DEGRADED | T14; `token-telemetry.jsonl` |
| Missing telemetry becomes zero | unavailable fields are null/UNKNOWN, never fabricated | `real-swarm-run.json`; `claim-ledger.jsonl` |
| Provider name controls KAD authority | semantic controller role is selected by lane policy; provider is transport metadata | `swarm.mjs`; `.omp/controllers.json` |
| Worker reads outside packet | worker invoked with no tools and packet has explicit paths/excerpts | `run-swarm-experiment.mjs`; packet manifest |
| Worker promotes itself | no promotion API or authority in worker; episode training eligibility false | `episode.json` |
| OMP/Pi accepts result | Pi only transports text; KAD validator decides | `swarm.mjs`; green evidence |
| Hidden reasoning persisted | evidence stores observable plan/output/validation only | `real-swarm-run.json`; `episode.json` |
| Replay differs | canonical receipt replay check passed | green evidence; `swarm.test.mjs` T12 |

No unresolved acceptance-critical attack was found. The observed second-run malformed output is retained as a negative bounded-degradation episode, not suppressed.
