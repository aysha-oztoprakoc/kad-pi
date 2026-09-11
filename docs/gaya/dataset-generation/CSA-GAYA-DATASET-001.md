# CSA-GAYA-DATASET-001 — Dataset-first current-state supplement

- Artifact type: current-state evidence supplement, not a replacement for the workspace CSA.
- Observation timestamp: 2026-09-09T00:51:23Z.
- Parent: `docs/state/CSA_KAD_PI_CURRENT.json` and `.md`, generated 2026-09-08T21:09:01Z.
- Parent evidence cutoff: `1a738b5d36276f5eb0f011bf83eac39a294a202d`; inherited historical cutoff, NOT a fresh HEAD observation or executable workpackage fixed point.
- Source fingerprint index: `evidence/GAYA-DATASET-HANDOFF-001/source-manifest.json`.
- Status: OBSERVED_BOUNDED; implementation readiness and release acceptance are NOT established.
- This artifact, the ISA, research map, builder prompt, and workpackage plan are engineering documents: `train_eligible=false`, `publish=false`.

## 1. Latest author-declared goal

The user's authoritative source collection is `/home/amdy/Work/kad-rpg/kad-gaya`. The research basis is `/home/amdy/Downloads/reports/plano de pesquisa`. Build a synthetic dataset from the source collection, using the existing extraction pipeline adapted with research-grounded methods. The dataset feeds the first generation of local adapted models AND the game. A completed game, 3D renderer, model training run, or Project Sid reproduction is NOT a prerequisite for this dataset release.

The request in this session is to create an Ideal State Artifact and an actionable OMP handoff for Gemini 3.8 Flash with high reasoning. It is not authorization to run bulk synthesis, train weights, change model routing, enroll projects, publish lore, or overwrite existing databases in this session.

## 2. Evidence ledger

| ID | Observation | Evidence and boundary |
|---|---|---|
| CSA-01 | The latest named workspace CSA records a dirty workspace, volatile local endpoints, unknown VRAM/ROCm, and approximately 14.7 GiB RAM. | `docs/state/CSA_KAD_PI_CURRENT.json:1-32,48-106`; historical observations, not live service/resource admission. The research snapshot's 32 GB assumption does not override measurement. |
| CSA-02 | The corpus directory contains original PDFs, DOCX, ODT, ODG, Markdown, JSON, PNG/JPEG/WebP, screenshots, and multiple document revisions, alongside code and generated outputs. | Directory inspection of `kad-rpg/kad-gaya`; no claim of exact corpus count or semantic completeness. A source inventory must exclude generated feedback while accounting for exclusions. |
| CSA-03 | The project already has ingestion, schemas, factual extraction, storage, and training export modules. | `ingestion/corpus_ingestor.py`, `pipeline/schemas.py`, `pipeline/deterministic.py`, `storage/`, `training/sharegpt_exporter.py`. Presence is not proof of end-to-end qualification. |
| CSA-04 | The ingestor scans only immediate files, hashes bytes, parses supported text/document formats, and marks images as MEDIA_ASSET. It does not perform visual interpretation. | `ingestion/corpus_ingestor.py:64-181`. PDF extraction calls `pdftotext -layout`; an empty result can still receive PARSED. Page/bbox preservation and OCR coverage are not established. |
| CSA-05 | A real DOCX parse returned 9,037 characters with no parser-error marker. | In-session Python probe invoked `GayaCorpusIngestor.parse_docx` on `O Códice de Gaya História e Cosmogo.docx` using a temporary staging directory. Beginning: “O Códice de Gaya: História e Cosmogonia” and “História conforme ensinada nos dias atuais”. This proves text extraction for one input, not factual completeness or objective truth of the narrator's account. |
| CSA-06 | The bulk script has hardcoded entity collections, top-level directory creation and projection writes, and deletes the existing SQLite database before rebuilding it. | `extract_and_ingest_gaya.py:44-58,104-688,690-891,979-1069,1250-1346`. It was NOT executed. Do not import it as a harmless library. |
| CSA-07 | Existing correction requirements explicitly demand source spans, candidates versus canon, absten­tion, negation/direction preservation, review boundaries, and training export separation. | `docs/PLANO_CORRECAO_GAYA_PARA_GEMINI.md:77-169` inside the corpus project. These are requirements/historical findings, not evidence that every defect still exists or has been fixed. Do not re-execute its unrelated configuration recovery steps. |
| CSA-08 | A scripted simulation replay matched both state and ledger hashes. | `node bin/gaya --replay`, exit 0. Final state: `1f59ccd46655bddac4b03cfd8185191b02a09b559d5f678025931667898917b9`; ledger: `2fd1145cfa3fa2b7252a786643c904252460e141ec5a1cfea690b0248e4baf1e`. This does not qualify stochastic model generation or all PIANO claims. |
| CSA-09 | The PIANO module test asserts module presence; its awareness test checks a temporary block; its determinism test compares final state hashes, ledger length and statistics. | `tools/gaya/test/piano-playground.test.mjs:11-99`. These do not prove asynchronous concurrency, <=10ms arbitration, full cognition replay, or emergence. |
| CSA-10 | Academic ingestion/RAG/dataset entrypoints already exist. | `tools/kad/research-elicit-pipeline.mjs`, `research-rag-query.mjs`, `research-dataset-compiler.mjs`. Reuse compatible seams; do not mix research-domain instructions into Gaya roleplay training. |
| CSA-11 | The project registry currently lists `kad-rpg-unknown` as UNKNOWN and agent-disabled. | `.agents/workspace/projects.json:68-79`. `tools/workspace/workctl.mjs:196-219` fails closed on nonclaimable projects, stale fixed points and ownership conflicts. Future mutation requires legitimate enrollment/ownership resolution; claiming the parent solely to bypass this restriction is prohibited. |
| CSA-12 | Native ISA lint requires registered validator IDs; no Gaya dataset validator is currently bound in this handoff. | `tools/kad/isa.mjs:523-603`. Draft planned validator IDs must fail lint until genuinely implemented and registered. Do not substitute unrelated passing validators. |
| CSA-13 | A separate game-stack qualification reports a browser build blocker. | `evidence/WP-GAME-STACK-001/qualification.json:1-5,37-41`. It is not a blocker for offline dataset generation, and does not authorize a new engine choice. |
| CSA-14 | The current ShareGPT eligibility function checks only provenance presence, SOURCE_DERIVED and non-session-log category; it does not check an independent approval/rights/split receipt. It emits L0/L1 template answers. | `training/sharegpt_exporter.py:28-41,63-100`. Its header's “approved” claim is stronger than the inspected predicate. Extend this seam; do not assume it is already release-safe. |
| CSA-15 | The academic dataset compiler substitutes generic formal models/invariants when missing, constructs a fixed chosen/rejected answer pattern, and defaults absent invariant audit to OK. | `tools/kad/research-dataset-compiler.mjs:83-109,116-139,147-178`. These patterns are not evidence-backed Gaya generation and must not be copied. Reuse only genuinely compatible safe primitives; do not run its default vault-wide export. |

## 3. Contradictions and stale assumptions

1. The repository research snapshot and Downloads snapshot are proposals. Their VERIFIED labels are not imported as CURRENT_CONFIRMED claims.
2. The snapshot's pantry-to-commons connection conflicts with `tools/gaya/content/rooms.mjs:35-52`. Resolve source authority; do not invent geometry to reconcile it.
3. `docs/gaya/atlas/` is a software system atlas, not geographic ground truth for Gaya.
4. Existing vault notes and DB/projections are derived candidates for reconciliation, not substitutes for the author's original collection.
5. The workspace CSA reports autolearning/fallback settings. Reporting a setting does not authorize it: active KAD restrictions and current policy prevail. This work must not change these settings or mutate memory.
6. A fixed random seed does not guarantee bit-identical fresh GPU/model inference. Frozen response tapes plus deterministic compilation are the release replay contract.
7. File recency and words such as “Atualizado” do not by themselves establish source precedence, ownership rights, or canon approval.

## 4. Unknowns requiring the first builder frame

- Current enrolled ownership of the nested project, active writer leases and actual fixed point.
- Full source census, duplicate/revision groups, image associations, rights and training permissions.
- Source-specific review/approval records and actual coverage of factual extraction.
- OCR/layout and local vision capabilities qualified under current STC admission.
- Local structured generation availability, model identity, runtime, tokenizer, context and resource limits.
- Actual consumer schema for first-generation training; no weights training is authorized by this handoff.
- Corpus-supported coverage and sample count: measure before setting a volume budget; do not invent a 10k/100k-row requirement.
- Native ISA semantic validators and independent review receipts for the new dataset domain.

## 5. Scope of this handoff's evidence

No bulk ingestion, local/remote generation, model training, UI modification, project enrollment or canonical publication occurred. The two runtime observations above are bounded probes from this conversation. File-level findings must be refreshed if source fingerprints change. The builder must append new evidence, never rewrite historical evidence to remove failures.
