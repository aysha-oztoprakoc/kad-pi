# KAD CONTEXT ECONOMY + LOCAL SWARM REPORT

## Verdict

**PARTIAL.** The project policy is local-first and the control plane is implemented and tested. The installed OMP runtime selected `snapcompact` without an LLM call in the controlled probe, but refused to rewrite the deliberately small history (`SKIPPED_TOO_SMALL`). The two-worker swarm passed with controlled fixture transports, not live Qwen/Stheno inference. The deterministic preflight is `DEGRADED` because the Qwen retrieval endpoint at `127.0.0.1:5002` is unavailable.

## Compaction before / after

Before this change, the installed OMP v18.0.10 default method order was `remote -> snapcompact -> handoff -> shake -> soft`; the reported prior run was `remote-compacted ~237K -> ~54K`. The project effective policy is now:

- `contextPromotion.enabled: false`
- `compaction.enabled: true`
- `compaction.methodOrder: [snapcompact]`
- `thresholdPercent: 70`
- `thresholdTokens: -1` (legacy reserve disabled)
- `midTurnEnabled: true`
- `keepRecentTokens: 20000`
- `autoContinue: true`

OMP v18.0.10 does not expose the requested `compaction.strategy` or `compaction.remoteEnabled` keys in its installed schema. Excluding `remote` from `methodOrder` is therefore the supported equivalent. Automatic compaction cannot use remote compaction under this project policy; an explicitly requested manual remote command remains an OMP host capability.

## Context-rot defense

`.omp/extensions/kad-context-economy.js` injects a bounded deterministic checkpoint during `session.compacting` and appends the exact checkpoint plus SHA-256 to the local archive `.state/omp-kad/runtime/context-checkpoints.jsonl` before the runtime method runs. `tools/kad/context-economy.mjs` reconstructs repository HEAD/dirty paths, authority-file hashes, work state, local resource ownership, swarm completed/pending state, and epistemic/economic rules from filesystem and git state. It never reads a prior checkpoint, so repeated compaction is non-recursive. `preserveData.kad_context_checkpoint` carries schema and SHA-256 metadata. JSONL compaction receipts normalize unavailable token counts to `null` and preserve strategy, automatic/manual status, HEAD, and outcome. If the runtime cannot reduce context, it safely retains the full context; no remote summarizer is invoked.

The `kad-context` command is observational only: it reads context/receipt/state and does not invoke a model.

## Token economy

The compaction path itself emitted no summarizer model call in the OMP RPC probe. The probe's normal prompt turns did call the selected provider; those calls are not counted as compaction work. No savings estimate is claimed. The controlled swarm used two local fixture calls, `remote_orchestration_tokens: null`, no premium oracle, and no PAYG fallback.

## Swarm architecture

The model-agnostic control plane is in `tools/kad/swarm-control-plane.mjs`; qualified adapters are isolated in `tools/kad/swarm-workers.mjs`:

1. `createTaskContract` requires task id, requested capability, trust domain, input reference, output schema, runtime bound, resource policy, and evidence requirements.
2. `ResourceRegistry` composes the existing `CapabilityRegistry` and routes only exact qualified capability/trust pairs.
3. Workers return `ResultEnvelope`; the envelope has no worker-controlled `accepted` field.
4. `AcceptanceGate` validates identity, trust domain, runtime status, required output fields, and non-empty evidence.
5. `SwarmCoordinator` schedules sequentially (`TIME_MULTIPLEXED`), persists recoverable state, emits lifecycle events, and releases resources in `finally`.

6. Admission proves `compiled_prompt_tokens + required_output_reserve <= effective_context_window` and `required_output_reserve <= effective_max_output_tokens` before worker invocation; failures defer as infrastructure contract failures.
7. `telemetryPath` records task acceptance, route status/reason, runtime status, resource id, and timestamp in `swarm-telemetry.jsonl`.

Qualified capabilities are `repository-fact-finding`, `structured-extraction`, and `world-simulation`. Unknown capabilities fail closed.

## Active local workers and ownership

- `kad-local-qwen` / `@local_retrieval`: retrieval trust domain, `repository-fact-finding` and `structured-extraction`, OWNED lifecycle `activate -> identity check -> bounded invoke -> release`. The live endpoint is currently unavailable; preflight reports `INACTIVE/UNAVAILABLE` and no activation mutation was attempted.
- `kad-local-world` / `@world`: world trust domain, `world-simulation`, EXTERNAL lifecycle. The wrapper invokes the already-running external Stheno resource and never restarts, kills, or disposes it.

RP-Hero and Lumimaid remain `CANDIDATE` / `QUALIFICATION_REQUIRED`; no unqualified model is registered.

## First swarm experiment

`node tools/kad/run-local-swarm-mvp.mjs` passed deterministically: one retrieval task and one world task were both accepted, trust domains remained separate, and aggregation used no model vote. This is a control-plane fixture experiment, not evidence of live Qwen/Stheno transport. State recovery was exercised by `SwarmCoordinator.recover` and the compaction checkpoint test.

## Failure matrix

The tested matrix covers wrong trust domain, unknown capability, incomplete contract, malformed output, identity mismatch, unavailable resource, timeout, and forbidden worker self-acceptance. All fail closed or defer as specified. See `failure-matrix.json`.

## Readiness answers

1. **Local-first automatic context maintenance?** Yes: project method order contains only `snapcompact`; context promotion is disabled.
2. **Actual snapcompact render?** Not yet proven: the runtime selected the method but the small controlled history was a safe no-op (`SKIPPED_TOO_SMALL`). Model catalogs for `@default`, `@plan`, and `@slow` report image input.
3. **Authoritative KAD state loss?** Durable authority files, work state, swarm state, receipts, and checkpoint hashes are preserved; a large live compaction recovery remains unverified.
4. **Recursive checkpoint drift?** The checkpoint is rebuilt from current filesystem/git state and excludes generated checkpoint input; deterministic test passes.
5. **Deterministic Qwen lifecycle?** Wrapper and lifecycle tests pass; live Qwen is unavailable.
6. **Stheno without leakage?** External ownership and exact world routing are enforced by tests and existing preflight evidence.
7. **Two local workers in one workflow?** Yes in controlled fixture; live two-worker run is blocked by Qwen availability.
8. **Scheduling/resource conflict?** Sequential time multiplexing prevents simultaneous local resource use; unavailable routes defer.
9. **Survive compaction?** Durable coordinator state and checkpoint reconstruction pass tests; live large-session proof remains open.
10. **Worker reaches oracle?** No worker or scheduler oracle path exists; automatic premium/PAYG fallback is disabled.
11. **New paid spend?** No automatic paid route is configured or attempted.
12. **Is amdy a valid single-node host?** Partially: the world resource is available and the control plane passes; Qwen availability and a live end-to-end two-worker receipt are still required.

## Smallest evidence needed from `/tell`

Provide transport, endpoint, runtime, exact model identity, capability declaration, trust domain, resource ownership, and health/readiness evidence for the retrieval worker (and any candidate replacement). The minimum successful live swarm receipt must show both task ids, distinct trust domains, exact model identities, bounded runtime, evidence references, acceptance-gate decision, resource release events, and no paid fallback.
