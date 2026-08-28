# WP-KAD-TOKENMAX-001 closure

VERDICT: PASS

BASELINE COMMIT: `f6a16706d1e7335060a80f3e5c1d47e92f075165`
FINAL COMMIT: recorded in the closure response after commit

ECONOMIC ROUTER:
- execution classes: 9 normalized classes from deterministic existing through human
- quota states: GREEN, YELLOW, RED, EXPIRING, UNKNOWN, STALE
- selected route: deterministic fixture → `tool`; free remote → `free`; useful queued expiring subscription → `expiring`; real swarm controller remains the approved semantic controller lane
- reason codes: `ELIGIBLE`, execution-class code, watermark code, `USE_IT_OR_LOSE_IT_QUOTA`, `QUOTA_UNKNOWN`
- PAYG exposure: disabled and rejected; no auto-topup or paid fallback

REAL SWARM:
- controller calls: 2 in the accepted run
- local calls: 1
- deterministic calls: 1
- repair count: 0 in accepted run; separate failure receipt proves one-repair bound
- accepted/degraded: accepted run accepted; malformed second attempt degraded

LATENCY:
- normalize: UNKNOWN for historical run
- route: measured control-plane fixture values 0.010–0.335ms
- controller decompose: UNKNOWN separately; included in 80596ms total
- packet compile: UNKNOWN separately
- local lifecycle start: UNKNOWN separately
- local worker: UNKNOWN separately in accepted run
- validation: UNKNOWN separately
- controller consume: UNKNOWN separately
- teardown: UNKNOWN separately
- total: 80596ms observed baseline

ECONOMICS:
- remote input: 1086
- remote output: 93
- local input: 1352
- local output: 161
- quota units: UNKNOWN live; synthetic fixture units are explicitly marked
- avoided model calls: 0 in accepted baseline; deterministic route avoids model lanes in fixture
- claims still UNKNOWN: live allowance/reset, generalized savings, cross-provider unit equivalence, GPU speedup

LOCAL PERFORMANCE:
- CPU: bounded Qwen observation 63217ms, 1313 input / 175 output; malformed output rejected
- GPU/Vulkan if tested: NOT RUN; external Stheno owns the GPU-bound WORLD lane and VRAM tooling was unavailable
- accepted configuration: CPU-only, context 2048, batch 128, four threads
- evidence: `local-performance-results.json`

TESTS:
- existing: KAD 78/78 and Librarian 11/11 passed
- new: economic matrix 21/21 passed
- regression: Prime, syntax, configuration, replay, authority, and spend gates passed

DISTILLATION:
- episode: `episode.json`, with route, quota watermark, raw dimensions, and provenance
- negative episode: `negative-episode.json`, bounded malformed-output degradation
- training eligibility: false

LIMITATIONS:

Live provider quota was unavailable and remains explicitly UNKNOWN. Quota fixtures prove the control plane, not current provider allowance. Stage timings were not separately exposed by the historical accepted swarm and remain null rather than fabricated. No GPU performance or token-savings claim is made.

NEXT SMALLEST EXPERIMENT:

Add one provider-owned quota adapter that emits normalized observations into this interface, without enabling PAYG or changing the routing policy.
