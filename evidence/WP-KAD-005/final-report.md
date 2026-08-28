# WP-KAD-005 / PI-NATIVE-001 Milestone Report

## 1. Verdict
**PARTIAL.** The first real local capability is green. The broader swarm, RAG experiment, TELL activation, comparative backends, and recursive improvement remain incomplete and are explicitly not claimed.

## 2. DATA-ARQUIMEDES v2
Created `DATA-ARQUIMEDES-v2-amendment-candidate.md` as an AMBER candidate: make it work, fast, safe/private, learn; TOKENMAXXING is not SLOPMAXXING. The root constitution and accepted ADRs were preserved.

## 3–4. Hardware and models
AMDY: Arch Linux kernel 7.1.9-arch1-2, Ryzen 7 7700 (8c/16t), 14 GiB RAM, RX 9060 XT Navi 44 observed by `lspci`. TELL inventory is blocked by SSH authentication and was not retried or mutated. Four GGUF models already existed; no downloads occurred. See `hardware-atlas.json` and `installed-model-inventory.jsonl`.

## 5–7. Pi provider and local worker
KoboldCpp 1.119 served Stheno Q4_K_M on `127.0.0.1:5001`, Vulkan device 0, with OpenAI-compatible API. Pi SDK 0.84.3 loaded a project-scoped `kad-local` model configuration and executed a real bounded classification prompt. Output was exactly `READY`; deterministic validator accepted it in 567 ms. No remote inference was used.

## 8. Routing and trust
`tools/kad/local-router.mjs` implements explainable capability filtering, exact trust-domain matching, local preference, availability teardown, and observations. Tests prove TELL disappearance reroutes to AMDY without authority escalation. Model capability remains narrow/unknown outside the tested task.

## 9. Performance
One non-comparative observation: direct short request measured approximately 22 generation tok/s and 349 prompt tok/s; Pi worker latency 567 ms. Vulkan worked. ROCm/HIP comparison, context regimes, concurrency, quantization, and VRAM telemetry were not completed.

## 10. PON/STC/RAG/context
Existing KAD code and ADRs preserve distinct PON and STC graphs. The three-condition deterministic fixture experiment ran. FULL injected 28 tokens; STANDARD 19; PON+STC 19, all with correctness 1.0. RAG-2 recorded one invalidation, one affected-rule evaluation, zero unrelated evaluations, and no stale-context error. This is a small observation, not a general improvement claim. A continuation trail packet and reproducible context runner are present.

## 11. Testing
Prime validation, Librarian verification, 30 existing baseline tests, and 3 new router/validator tests pass. The local worker is integration evidence, not a mock.

## 12. Degradation and limitations
Local endpoint failure handling is represented by capability removal and tested at router level. TELL is `TELL_UNAVAILABLE`. No remote escalation was justified. Qwen3.5-9B challenger testing promoted only structured extraction, repository fact finding, instruction following, and schema adherence; five-word summary compression failed. No embedding, reranking, training, or synthetic-canon claims were made.

## 13. Review and next work package
Two independent fresh Pi reviews returned PARTIAL. The first findings were repaired by making swarm evidence durable, correcting RAG comparability, updating test counts, and adding a reproducible context runner. The second still correctly identifies limits: the swarm used remote child models, the RAG corpus is tiny, and lifecycle/liveness coverage is bounded. TELL remains deferred and ROCm remains unavailable. This R1 therefore remains PARTIAL rather than falsely claiming closure.
