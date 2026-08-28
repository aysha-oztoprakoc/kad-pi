# WP-KAD-OMP-002 Experimental Contract

## Hypotheses

- H1: `@local_retrieval` can bind a separately declared local Qwen transport without changing KAD trust or lifecycle authority.
- H2: a thin `kad-local-extractor` adapter can perform bounded factual retrieval only.
- H3: recurring harness-readiness discovery can be replaced by a deterministic receipt.
- H4: the workflow degrades safely when the Qwen resource is unavailable or externally controlled.

## Frozen seams

- `tools/kad/omp-orchestration-preflight.mjs`: deterministic inspection and JSON receipt.
- `tools/kad/test/omp-orchestration-preflight.test.mjs`: fixture-level T1–T7 behavior.
- `.omp/agents/kad-local-extractor.md`: project OMP adapter.

## Acceptance boundary

Local output is accepted only after schema, path, and fact validation. The local worker cannot mutate, spawn, promote, declare PASS, or replace the final reviewer. A model identity mismatch is `CAPABILITY_MISMATCH`, not successful delegation.

## Safe degradation

At baseline, port 5001 serves externally controlled Stheno. The WorkPackage does not stop or replace it. Qwen activation and the live local recon are therefore blocked by ownership/resource conflict; deterministic preflight implementation proceeds as an independent safe phase.
