# WP-KAD-TOKENMAX-003-R2 — final report

## Verdict

**DEGRADED** — the final boundary was live-proven, but Qwen did not produce a validator-compatible result. The single authorized local run stopped after one initial attempt and one bounded repair.

## Runtime and upstream

- Runtime commit: `bed5ce9cc9e3e3b97bd44054a586a3b93276b2e2`
- Frozen packet hash: `91e0384bf7e54a6cac0d83a9315ba4c802759db801b06b449a308689e72cbc5b`
- Source hashes: unchanged; request reference unchanged; controller decomposition unchanged.
- Controller was not executed or consumed. The frozen task was unchanged retrieval trust isolation with mutation forbidden.

## World and Qwen lifecycle

The WORLD-only candidate was deterministically rejected for the retrieval requirement before worker inference. Qwen identity was verified as `koboldcpp/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M`, ownership was `OWNED`, and capability was retrieval-bounded. The STC-owned process was disposed after the run, its activation receipt was removed, and external Stheno remained healthy and untouched.

## Attempts and validation

Attempt 1 (`initial`): 2,302 input / 192 output tokens, 40,930 ms, 737 bytes, hash `32bbc4...ea048e`; normalization `WHITESPACE`, normalization succeeded, validator failed.

Attempt 2 (`repair`): 2,346 input / 192 output tokens, 42,895 ms, 698 bytes, hash `5b0908...000eae`; normalization `MULTIPLE_JSON_VALUES`, validator failed. `model_repair_calls=1`; no third attempt.

Final validator: `schema-source-evidence-validator`, `FAIL`, accepted `false`, errors: non-object output, task ID mismatch, required arrays missing. Normalizer success did not confer acceptance.

## Economics

- Parent sunk remote cost: **709 tokens**
- R1 incremental remote cost: **0 tokens** (historical evidence preserved)
- R2 incremental remote calls: **0**
- R2 incremental input/output/tokens: **0 / 0 / 0**
- Cumulative lineage: **709 tokens**, aggregation replay including duplicate parent: **709**, never 1418.
- R2 local: **2 calls**, **1 repair**, 4,648 input, 384 output, 5,032 total, 83,827 ms.

## Provenance and forensic policy

Normalizer version: `kad-worker-normalizer-2`; validator version: `schema-source-evidence-validator-1`; normalizer and validator source hash: `5ed14a...f8bc5c7`; runtime commit recorded per attempt. Raw response policy is `HASH_ONLY`: raw bytes were not retained, only SHA-256 and byte length. Forensic metadata is not canonical episode content and is not training, distillation, or golden eligible.

## Hypothesis and comparison

The TOKENMAX hypothesis is **INCONCLUSIVE**: the episode did not establish a semantically valid result whose malformed envelope could be replaced by deterministic normalization. Compared with LIVE-001/R1, R2 has the same degraded two-call/one-repair outcome, while providing trustworthy attempt-level forensic and accounting evidence. No generalized model claim is made.

Distillation/shadow result: **CANDIDATE_NOT_CREATED / INSUFFICIENT_EVIDENCE**. No promotion or training occurred.

## Regression and limitation

Post-live gates: corrective/normalizer **32/32**, full KAD **209/209**, real Pi integration **7/7**, Librarian **11/11**, PRIME PASS, `make test` PASS, diff check PASS.

Remaining limitation: hash-only forensics cannot reconstruct exact raw output. The live result confirms the instrument counted and attributed the failure; it does not fix Qwen output reliability.

No further experiment is authorized here. The next smallest experiment is a future ticket to diagnose the observed Qwen output-contract failure; no additional R2 sampling is recommended.
