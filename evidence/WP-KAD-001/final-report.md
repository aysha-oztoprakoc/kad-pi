# WP-KAD-001 final report

## Corrected initial verdict

`PARTIAL`. The existing suite is explicitly simulated (`SimulatedPiRuntime extends EventEmitter`), so it cannot establish Pi integration or Cordis ownership.

## Discovery and architecture decision

Pi's extension `input` event remains a valuable live smoke seam, but `pi.on` offers no public unsubscription and ignores extension factory return values. The SDK is now the lifecycle candidate: documented `AgentSession.subscribe()` returns `() => void`, and documented `session.steer()` produces a deterministic `queue_update` source. The installed binary distribution lacks the declared `dist/index.js` SDK export, so the lifecycle contract is STATIC-proven pending a version-pinned, importable 0.84.3 SDK integration run.

## Delegation

| role | model | scope | mutation authority | result |
| --- | --- | --- | --- | --- |
| Pi lifecycle researcher | delegated worker | installed Pi 0.84.3 only | read-only | Found the missing public `pi.on` teardown contract. |
| Cordis ownership researcher | delegated worker | existing vendored Cordis only | read-only | Verified `Context`/`Fiber.effect` ownership and unload semantics. |
| Terra synthesis | planner | evidence gate | evidence files only | Stopped before false RED/GREEN/integration claims. |

No Luna implementation was delegated because Phase 1's explicit STOP condition was met before valid RED tests could be authored. Claiming implementation work here would be false.

## RED -> GREEN

Not entered. A RED test demanding real Pi listener withdrawal would fail because the needed public lifecycle capability is absent, not because implementation is missing. That does not form a valid RED target for Luna.

## Real Pi, Cordis, and failure proof

The actual installed Pi 0.84.3 process loaded `test/real-pi-smoke.mjs`, received `kad-real-pi-smoke`, and invoked the extension's `input` callback. The callback returned `{ action: "handled" }`, so Pi skipped the agent. The durable callback record is `runs/real-pi-smoke.jsonl`; the exact invocation is `runs/real-pi-smoke-invocation.md`. This is LIVE_OBSERVED Pi delivery only, not the required typed/KAD-PON/Cordis slice. The current pre/post manifests prove only that the installed `pi` binary did not change during this smoke run, not that the complete distribution did not change.

## Reviewer finding

Critical: manual EventEmitter removal or a callback gate would substitute a simulated/non-withdrawn listener for the required sanctioned Pi listener withdrawal. That must not be called PASS.

## Final verdict

`WP-KAD-001 = PARTIAL`

## Smallest next step

Obtain or document a Pi-supported extension listener-disposal API (or revise the frozen acceptance criterion based on upstream evidence). Only then resume at Phase 2 with RED tests for the full real lifecycle chain.
