# Paste-ready OMP prompt — Gemini builder, Frame 00 continuation

Select Gemini 3.8 Flash with high reasoning through the already authorized OMP interface before pasting. If that transport is unavailable, report it; do not silently switch models or change provider configuration. Gemini is the engineering builder transport only — no remote inference for dataset generation.

## Context to internalize first

Workspace root: `/home/amdy/Work`.

1. `PRIME_DIRECTIVE.md`; applicable accepted ADRs/evidence; existing executable gates — in that order.
2. `docs/gaya/dataset-generation/PROMPT-GEMINI-BUILDER.md` — master contract (already updated for the refactor).
3. `docs/gaya/dataset-generation/WORKPACKAGES.md` and `workpackages.json` — canonical refactored frames 00–09; the JSON is the frame source.
4. `docs/gaya/dataset-generation/ISA-GAYA-DATASET-G1-001.md` — target and all 11 blocking claims.
5. `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json` — plan-only refactor record, findings, and the integrity verifier description.
6. `evidence/WP-GAYA-DATASET-G1/00-preflight/preflight-report.md` and `.json` — dated read-only preflight (2026-09-08T22:21Z), historical.
7. `evidence/GAYA-DATASET-HANDOFF-001/source-manifest.json` and `validation.json` — historical handoff fingerprints. The four refactored plan files intentionally differ from the old deliverable fingerprints; classify that as `REFACTORED_BY_WP_REFACTOR_001`, not drift.

## State as of this prompt (re-observe, never assume)

- The 10-frame plan was reviewed and refactored. Frame IDs, titles, 11 claim IDs, `PROPOSED` statuses and `null` fixed points were retained. Frame 04 now depends on Frame 03 (resolved entity IDs); the complete frames are strictly sequential.
- Frame 00 preflight completed read-only. Mutation remains blocked: `kad-rpg` is `UNKNOWN`/agent-disabled in `.agents/workspace/projects.json`, no native tasks registered, no local LLM daemon observed (ports 11434/8080/5000/1234 closed), SillyTavern on port 8000 preserved.
- A kad-pi claim `WP-GAME-STACK-001` (tools/game-stack, evidence/WP-GAME-STACK-001) was active; it does not overlap Gaya evidence paths.
- The reported nested fixed point `0389137746b0e92a34013e7cf72abfbf0679c1e4` is historical evidence, not a fixed point for every frame.

## Your task: complete refactored Frame 00 (read-only) and prepare the authority decision

Execute in order. You are read-only throughout: no registry edits, no `.agents/work/` writes, no claims, no corpus/pipeline mutation, no commits, no spend, no service changes.

1. **Re-observe authority and environment** (fresh receipts with timestamps):
   - `node bin/workctl projects` and `node bin/workctl status` from `/home/amdy/Work`; record active claims and any project-registry change since the preflight. If `kad-rpg` enrollment now exists, do NOT apply or claim anything — report it and continue with steps 2–4.
   - `git -C kad-rpg rev-parse HEAD` and `git -C kad-rpg status --short`; also the workspace repository HEAD. Record both as dated observations.
   - `python3 --version`; availability of `pdftotext`/`soffice`/`tesseract`; TCP state of ports 8000/11434/8080/5000/1234 (report open/closed; never start or stop anything).
2. **Verify source stability.** Re-hash the 21 corpus/source files recorded in `evidence/GAYA-DATASET-HANDOFF-001/source-manifest.json` and confirm MATCH. For the 6 historical deliverable fingerprints, classify each as `UNCHANGED` or `REFACTORED_BY_WP_REFACTOR_001` (expected). Record actual hashes of the current plan files.
3. **Verify plan integrity** with a compact `node --input-type=module` check using `tools/kad/isa.mjs`: `workpackages.json` parses; 10 frames with canonical IDs; each `depends_on` references an earlier frame ID; every frame has `status: PROPOSED` and `fixed_point: null`; every rendered markdown frame section mirrors goal/steps/acceptance verbatim; every listed gate exists among the 11 ISA claims; ISA metadata remains `DRAFT_VALIDATOR_BINDING_PENDING` and `train_eligible: false`; the `gaya.dataset.*` validator names remain unregistered. The full assertion set is described in `evidence/GAYA-DATASET-WP-REFACTOR-001/review.json`.
4. **Produce the refactored Frame 00 acceptance deliverables** as NEW dated files under `evidence/WP-GAYA-DATASET-G1/00-preflight/` (never overwrite existing receipts):
   - **a. Current-state delta** — for each observed authority/capability item, mark `UNCHANGED_SINCE_PREFLIGHT` / `CHANGED` / `STALE` / `UNKNOWN`, with timestamps and exact command receipts.
   - **b. Prerequisite decision table** — one row per missing authority (kad-rpg enrollment; native task registration per project root; workspace evidence-ownership for frames 01–08 receipts; local LLM admission), naming affected frames, permitted read-only continuation, and the exact decision evidence required from the human lead.
   - **c. Proposed registration bundle** (read-only proposal for lead review; do NOT write into `.agents/work/`): for each frame, a native-contract draft mapping `depends_on` → `blocked_by`/`blocks` with `required_capabilities`, `trust_domain`, `authority_required`, `validation`, `scope`/`non_scope`, `evidence_target`, `priority`, and project-root-correct fixed-point markers. Record observed heads, mark fixed points `TO_RESOLVE_AT_REGISTRATION`. Include the frozen source inventory/disposition policy, split-family policy, and evidence-target layout already defined in the plan.
5. **If the lead has already resolved enrollment/registration**, report the precise observed change and STOP: do not claim tasks or mutate anything in this session. State exactly which next prompt (Frame 01) becomes actionable and what remains missing.

## Boundaries (non-negotiable)

- Do not edit `.agents/workspace/projects.json`, write into `.agents/work/`, run `bin/workctl claim`, execute or import `extract_and_ingest_gaya.py`, mutate the corpus or existing DBs, alter SillyTavern, install packages, download models, or commit.
- Native ISA lint/check will still fail on the 11 planned unregistered validator IDs; that is expected and unchanged. Do not weaken lint, register stubs, or borrow unrelated validators.
- No remote model inference for data generation. Gemini 3.8 Flash high is the engineering transport for this session.

## Required output (exactly)

1. Continuation artifact paths + SHA-256 for every file you wrote.
2. Current-state delta receipt (item, observation, timestamp, status versus preflight).
3. Prerequisite decision table.
4. Proposed native-contract bundle location + integrity summary (drafts only, not registered).
5. Plan integrity verification result (exit code + summary JSON).
6. Remaining blockers with affected frames and permitted continuation.
7. Top three next actions for the human lead.

State explicitly: no enrollment, registration, claims, inference, corpus mutation, spend or commits occurred in this session. Do not equate this read-only report with Frame 00 ACCEPTED or any gate PASS.
