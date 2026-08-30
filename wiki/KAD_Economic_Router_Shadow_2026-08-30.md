# KAD-PI Shadow Economic Evaluator Architecture (2026-08-30)

## Executive Summary

Workpackage **WP-KAD-ECONOMIC-ROUTER-SHADOW-003** implements a deterministic, pure shadow economic evaluator (`tools/kad/telemetry/economic-shadow.mjs`) that consumes normalized multi-window quota telemetry from OMP and evaluates quota-aware routing optimizations without having authority to mutate production decisions.

## Architecture

```text
                           Routing Request + Policy
                                      │
                 ┌────────────────────┴───────────────────┐
                 ▼                                        ▼
    Existing Economic Router                 Normalized Telemetry Stream
   (tools/kad/economic-router.mjs)           (tools/kad/telemetry/)
                 │                                        │
                 ▼                                        ▼
       PRODUCTION ROUTE ───► [Immutable] ───►  Shadow Economic Evaluator
     (Authoritative Exec)                     (tools/kad/telemetry/economic-shadow.mjs)
                                                          │
                                                          ▼
                                                SHADOW ADVISORY ARTIFACT
                                                • Recommended lane & class
                                                • Same / Different comparison
                                                • Binding quota windows
                                                • Reason codes & adjustments
                                                • Telemetry freshness & quality
```

## Security & Isolation Invariants

1. **Zero Production Mutation**: Shadow evaluator receives immutable input copies and has no write-back path into `routeEconomically`.
2. **Zero Paid Authority Escalation**: In the absence of explicit `paid_authorized=true`, paid lanes receive fatal rejection (`PAYG_NOT_AUTHORIZED`).
3. **Pure Local Execution**: Evaluation requires zero network I/O, no background daemon, and zero LLM calls.
4. **Replay Determinism**: Evaluator math uses explicit inspectable constants with deterministic tie-breaking.
