# WP-KAD-DISTILL-CONTEXT-001

## Verdict
PASS for the deterministic resource/compiler work; frozen audit remains an unsatisfiable historical packet and requires a different execution plan.

## Lesson
`TASK_RESOURCE_FIT_REQUIRED_BEFORE_INFERENCE`: compile against the selected resource's proven envelope and reject before worker execution.

## Classification
`LOGICAL_CONTRACT_DISTILLATION`; `MODEL_BEHAVIOR_CLAIM=NONE`.

## Implementation
`tools/kad/context-compiler.mjs` provides allowlisted symbol, JSON Pointer, YAML-path, and bounded line selectors; source and selected hashes; conservative token evidence; schema-derived output reserve; deterministic packet hashing; and fail-closed admission classification. `swarm.mjs` now compiles before authorization, treats controller reductions as bounded, rejects unauthorized scope/quantity expansion, and never lets a stale worker estimate make a packet fit. `resource-contract.mjs` preserves process identity and rejects unknown/invalid requirements.

## Replay
- OLD_PACKET: `UNSATISFIABLE`; 4,105 selected bytes, 1,859 conservative tokens, 2,302/2,346 historical prompt attempts, reserve 192, context 2,048; output request 512 > cap 192.
- NEW_PACKET: `FIT`; 1,884 selected bytes, 1,677 conservative tokens, reserve 168, context 2,048, output cap 192; packet hash is recorded in `new-compiled-packet-replay.json`.
- Removed: broad whole-file excerpts and duplicate/unrelated configuration; preserved trust eligibility, Qwen retrieval, Stheno WORLD, WORLD-vs-RETRIEVAL, and source-evidence validation.

## Authority and accounting
Selector proposals remain untrusted and are checked against request scope and source existence. Fit rejection records infrastructure contract failure, zero worker calls/tokens, and does not create a model reliability signal. Historical R2 is preserved byte-for-byte; its derived interpretation marks semantic promotion invalid for that contract-invalid episode.

## Verification
Targeted compiler/resource tests: **40/40 PASS**. Full KAD replay: **255 PASS, 2 failures** (one quota timestamp nondeterminism and one stale pre-correction expectation in the prior run). `git diff --check`: PASS. No Qwen, Stheno, controller, or local generation inference was performed.
