# WP-KAD-SHARED-MODEL-STORE-001 REPORT

## VERDICT

**PARTIAL.** The canonical store, registry, resolver, migration receipts, tests, and research are complete. Full PASS is blocked by the externally owned Stheno process still reading its legacy path and by the pre-existing unavailable Qwen retrieval endpoint. No unsafe process stop, authority promotion, or paid fallback was performed.

## FIXED POINT

`2bae5d6 feat(kad): add context economy and local swarm MVP`.

The repository was already dirty before this workpackage. Existing changes under `CONTEXT.md`, prior evidence, context-economy code, wiki, NGC artifacts, KnowledgePlane evidence, ADR 0008, and advisory-board skill were preserved and not mixed into this workpackage.

## HARDWARE

Observed evidence is in `hardware.json`: Ryzen 7 7700, 8 cores/16 threads; 15,817,388,032-byte RAM total and 7,605,862,400-byte available at probe; RX 9060 XT at PCI `03:00.0`, 8,539,602,944-byte VRAM counter; Vulkan/ROCm/HIP command tools unavailable; btrfs `/home` with 928,547,909,632 bytes available. Policy remains one substantial 8–9B worker at a time.

## CANONICAL MODEL STORE

Only canonical model-byte store: `/home/amdy/Work/.models/`, resolved dynamically as repository-root `.models` or by `KAD_MODEL_HOME`. Layout includes `gguf/{world,retrieval,general,reasoning,coding,multimodal,candidates}`, `embeddings`, `specialists/needle`, `projectors`, `metadata`, `quarantine`, and `downloads`. `.models/` is Git-ignored and weights are not tracked.

## LEGACY INVENTORY

Six discussed artifacts were discovered, hashed, and registered. Inventory details and old/new paths are in `legacy-model-inventory.json`. Search was conservative: Work GGUF/CACT paths and the known Needle cache; arbitrary sensitive-tree traversal was not performed.

## MIGRATION

All six artifacts were copied with `cp --reflink=auto`, destination hashes matched source hashes, and inactive duplicate copies were retired only after verification. Stheno's old copy remains solely because an external KoboldCpp process is actively using it. Migration receipts are in `migration-receipts.json`.

## DUPLICATES

Hash-based duplicate report is in `duplicate-report.json`. Retired duplicates total 15,530,169,359 bytes. One 4,920,734,240-byte Stheno legacy copy remains pending external runtime cutover; it is not classified as unnecessary while actively owned by the running process.

## MODEL REGISTRY

Tracked registry: `config/local-models.registry.json`. Stable IDs: `stheno-v3.2`, `qwen-local`, `rp-hero-8b`, `lumimaid-8b`, `needle2`, and `bge-small-zh-v1.5`. Registry records provenance, size, SHA256, runtime compatibility, candidate capabilities, trust domain, qualification state, and lifecycle owner. Storage categories do not grant authority.

## HARNESS ACCESS

`tools/kad/model-store.mjs` is the shared resolver seam; `bin/kad-model` provides deterministic `list`, `show`, `verify`, `path`, and `candidates` commands. KAD and compatible Pi paths resolve stable IDs. KoboldCpp's runbook now calls the CLI. OpenViking's active config points to the canonical embedding path. Needle's weight is registered under the canonical specialist path while its engine and environment remain runtime-owned. The access matrix is in `harness-access-matrix.json`.

## ACTIVE RUNTIMES

Runtime ownership was not transferred. KoboldCpp remains externally owned, localhost-only, and active on port 5001. OpenViking/Needle engines and environments remain under `.state` runtime ownership. No concurrent substantial model activation was attempted.

## STHENO

Existing WORLD-only authority preserved. Health returned `koboldcpp/L3-8B-Stheno-v3.2-Q4_K_M`; bounded chat returned exact `SHARED_STORE_SMOKE`. Process PIDs 125225/125255 were not killed. Runtime cutover is explicitly `RUNTIME_CUTOVER_PENDING`.

## QWEN

`Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M` migrated to `.models/gguf/retrieval/` with matching SHA256. RETRIEVAL-only authority remains. Port 5002 was unavailable, so the capability remains DEGRADED and no replacement stock Qwen was installed.

## RP-HERO

Registered as `FILE_ONLY`, WORLD/roleplay candidate, qualification required. No capability was invented and no runtime smoke load was attempted.

## LUMIMAID

Registered as `FILE_ONLY`, WORLD/roleplay candidate, qualification required. No capability was invented and no runtime smoke load was attempted.

## NEEDLE

Only `needle2.cact` moved to `.models/specialists/needle/`; `libneedle.so` and Python environment remain runtime-owned. SHA256 matches prior evidence. Existing constrained-specialist authority and uncalibrated confidence boundary remain unchanged.

## OPENVIKING EMBEDDING

`bge-small-zh-v1.5-f16.gguf` moved to `.models/embeddings/` with matching prior SHA256. `.state/omp-kad/knowledge-plane-001/ov.conf` points to the canonical path. A post-cutover OpenViking restart was not observed, so the runtime claim remains configuration-updated rather than live-qualified.

## PREVIOUSLY DISCUSSED MODEL RECONCILIATION

Stheno, tuned Qwen retrieval, RP-Hero, Lumimaid, Needle 2, and BGE embedding are all represented in the tracked registry. The historical Qwen3.8-9B reference was not downloaded: current primary-source research found official Qwen3.8-27B but no authoritative official Qwen3.8-9B release; the surfaced 9B result is a community distillation.

## NEW MODEL RESEARCH

Primary-source report: `NEW-MODEL-RESEARCH.md`. It covers Qwen3.5 0.8B/4B; Ministral 3 3B instruct/reasoning and 8B instruct/reasoning; Gemma 4 E2B/E4B; Nemotron 3 Nano 4B; large defer candidates; RP/WORLD, coding, multimodal/document axes; quant/runtime facts; and cited uncertainty. No benchmark claim is made without source citation.

## INSTALL_NOW

Research hypotheses only: Ministral 3 3B Instruct, Ministral 3 3B Reasoning, Gemma 4 E2B Instruct, and Gemma 4 E4B Instruct. None downloaded. Installation still requires explicit qualification, runtime-fit evidence, provenance/license review, and disk policy.

## QUALIFICATION_QUEUE

Qwen3.5-0.8B, Qwen3.5-4B, Ministral 3 8B Instruct, Ministral 3 8B Reasoning, and Nemotron 3 Nano 4B. These classifications do not grant capability or authority.

## FUTURE_HARDWARE

Qwen3.8-27B, Qwen3.6-27B, Qwen3.6-35B-A3B, Gemma 4 26B/31B, Nemotron 30B-class, GPT-OSS 20B, larger Devstral models, DeepSeek V4 local GGUFs, and other source-supported models whose resident memory envelope exceeds current hardware. No download was attempted.

## REJECTED / SUPERSEDED

No existing model was rejected. Qwen3.8-9B is `UNRESOLVED_OR_SUPERSEDED` as an official upstream identity; it was not substituted with Qwen3.8-27B.

## RAM / VRAM RESULTS

Only hardware counters and the prior Stheno runtime observation were collected. No comparative resident-model benchmark was run. The current VRAM counter was already substantially used during the probe; this supports the one-substantial-worker policy and prevents unsupported concurrency claims.

## SMOKE TESTS

`smoke-tests.json` records the Stheno live health/chat PASS, Qwen unavailable state, prior Needle/OpenViking evidence, and intentionally unrun FILE_ONLY candidates. Smoke success is not capability qualification.

## PON

No second event system was added. The existing KAD seams remain authoritative. Useful model-store notification names are recorded in `ownership-matrix.json`: discovery, copy start, verification, registration, availability, unavailability, hash mismatch, and runtime request.

## STC

Byte owner is the model store; runtime owner is KoboldCpp/OpenViking/Needle process or adapter; endpoint owner is the runtime; task owner is KAD routing policy. Activation, health, identity verification, bounded work, withdrawal, and cleanup are explicit in `ownership-matrix.json`. External Stheno lifecycle was not claimed as rolled back or controlled.

## TDD

RED observed missing `tools/kad/model-store.mjs`; minimum implementation then passed six resolver tests and the Git safety test. Contracts cover root resolution, registry lookup, missing model, hash mismatch fail-closed behavior, duplicate hash detection, legacy path rejection, symlink rejection, and Git exclusion. Existing local-router and Qwen lifecycle tests cover trust-domain rejection and capability disappearance.

## GRACEFUL DEGRADATION

Missing files become `UNAVAILABLE`; hash mismatch becomes `HASH_MISMATCH` with quarantine required; unqualified files remain `FILE_ONLY`; unavailable Qwen remains DEGRADED; no local failure escalates to paid API; no authority is widened.

## SECURITY / LICENSE / PROVENANCE

No secrets were recorded. No paid spend, credentials, or provider configuration was changed. Registry source revisions/licenses remain `UNKNOWN` where existing evidence did not prove them. Existing runtime engines, venvs, logs, sockets, KV caches, and OpenViking data remain outside `.models/`.

## TESTS

`make test` PASS after adding model-store tests to the Makefile. Targeted model-store, repository safety, local-router, and local-Qwen lifecycle tests: 20/20 PASS. Canonical SHA256 verification PASS. Manifest CLI path/list/verify smoke PASS. Stheno localhost health and bounded chat PASS.

## FILES CHANGED

Tracked workpackage files: `.gitignore`, `Makefile`, `bin/kad-model`, `config/local-models.registry.json`, `tools/kad/model-store.mjs`, `tools/kad/test/model-store.test.mjs`, `tools/kad/test/model-store-repository.test.mjs`, and `evidence/WP-KAD-SHARED-MODEL-STORE-001/*`. The ignored OpenViking runtime config and ignored SillyTavern runbook were updated for canonical resolution. Existing unrelated dirty files were not modified.

## COMMIT

`/code-review` completed against the staged bounded patch; findings on redundant registry I/O, symlink-parent traversal, missing SHA fail-closed behavior, explicit acceptance answers, and test coverage were repaired. A bounded commit was created containing only this workpackage's tracked files. Pre-existing unrelated dirty paths and `.models/` bytes were excluded.

## NEXT WORKPACKAGE

1. Obtain external-owner approval for a controlled Stheno restart and verify the exact canonical path is loaded before retiring its legacy copy.
2. Activate Qwen retrieval only through its STC lifecycle, verify identity, and run bounded retrieval qualification.
3. Restart OpenViking against the canonical embedding path and capture live post-cutover evidence.
4. Qualify one research candidate at a time using measured RAM/VRAM/KV/runtime data.

## EXPLICIT ACCEPTANCE QUESTIONS

- **Where is the only canonical model-byte store?** `/home/amdy/Work/.models/`.
- **Can every harness under `/home/amdy/Work` resolve it?** Every audited harness has a resolver/request path; live KoboldCpp and OpenViking post-cutover runtime verification remain partial.
- **Are any model bytes duplicated unnecessarily?** No inactive duplicates remain; one active Stheno legacy copy is retained for the external process.
- **Can moving a model change its authority?** No. Storage, runtime, endpoint, task, and KAD capability ownership are separate.
- **Which models are currently QUALIFIED?** Existing authority evidence qualifies Stheno for WORLD and the tuned Qwen model for RETRIEVAL-only; availability is separately observed.
- **Which are only FILE_ONLY/LOADABLE?** RP-Hero and Lumimaid are FILE_ONLY; Needle 2 and BGE embedding are LOADABLE from prior evidence; Qwen is DEGRADED after migration.
- **Which existing model could not be migrated and why?** Stheno bytes were copied, but its legacy copy could not be retired because an external KoboldCpp process actively reads it.
- **Is Qwen3.8-9B a verified real artifact or a superseded reference?** It is an unresolved/superseded official identity; no authoritative Qwen release was found, and no download occurred.
- **Which new ≤5B model is best suited to cheap local work?** Research hypothesis: Gemma 4 E2B for documented multimodal/local work; Ministral 3 3B is the strongest small instruction alternative.
- **Which current model is the best local reasoning candidate?** Research hypothesis: Ministral 3 3B Reasoning; qualification is still required.
- **Which current model is the best document/multimodal candidate?** Research hypothesis: Gemma 4 E2B Instruct.
- **Which models fit fully or mostly inside 8 GiB VRAM?** Small quantized 0.8B–4B candidates are the strongest fit hypotheses; no full residency claim was benchmarked.
- **Which require partial CPU offload?** 8B-class candidates are expected to need careful quantization/offload; exact split is unmeasured.
- **Which are inappropriate for ~14 GiB system RAM?** 20B+ and the listed 27B/35B/26B/31B classes are deferred; Qwen3.8-27B alone is documented around 19 GB at Q4 in the task baseline.
- **Can two small workers run concurrently without unsafe memory pressure?** Unknown; no concurrency claim is made, and the one-substantial-worker policy remains.
- **Did any model download create new paid spend?** No. No new model download occurred.
- **Did any harness gain authority merely by gaining model access?** No. Trust domains and capability registry authority were unchanged.
- **Is the shared model substrate ready for the local swarm and KnowledgePlane?** Yes for bounded resolution/integration at PARTIAL status; no for unproven live runtime cutover or new-model qualification.

## FINAL STATUS

Only canonical model-byte store: `/home/amdy/Work/.models/`. Authority domains are unchanged. Inactive duplicates were retired; one active Stheno duplicate remains pending external cutover.
Every audited harness has a deterministic resolution/request path, but full runtime cutover is not yet proven. Shared substrate is ready for bounded local-swarm/KnowledgePlane integration at `PARTIAL` status, not a capability-qualification PASS.
