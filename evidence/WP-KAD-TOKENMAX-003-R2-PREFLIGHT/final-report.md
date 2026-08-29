# WP-KAD-TOKENMAX-003-R2-PREFLIGHT

## Verdict

`ACCOUNTING_BOUNDARY = GREEN`
`FORENSIC_BOUNDARY = GREEN`
`FINAL_NORMALIZER_OFFLINE_GATE = GREEN`
`LIVE_PROOF = NOT_RUN`

Baseline: `7bf0ed9 fix(kad): recover bounded local JSON output`. R1 remains PARTIAL and its failed evidence is unchanged.

## Experimental contract and red evidence

This was deterministic-only. No local/remote model inference, controller call, Qwen, Stheno, or quota probe was run. The corrective tests encode the discovered defects: repair telemetry retained only the first observation; resumed telemetry copied inherited remote usage into a new receipt; raw output had no forensic envelope; provenance and wrapper pairing were implicit.

## Accounting contracts

- Every local invocation is an element of `telemetry.local_attempts` with attempt number, kind, input/output tokens, and latency.
- Complete local totals are sums only when every corresponding attempt is numeric; otherwise the total is `null` (UNKNOWN), never zero or a partial total.
- Resumed episodes use `usage_scope: INCREMENTAL_ATTEMPT`, with incremental remote input/output and token totals zero. Parent usage is reachable through `inherited_parent` and is not copied into the new execution total.
- `aggregateLineageRemoteTokens` deduplicates receipt/episode IDs. Fixture replay: parent 709 + recovery 0 = **709**, including repeated parent receipt; never 1418.

## Forensic and provenance contracts

Each normalization result records SHA-256 and byte length before parsing, classification, and an explicit forensic-only envelope. Raw bytes are not retained; no raw reasoning is copied into episodes, training, or distillation exports. Forensics are marked `FOR_FORENSICS_ONLY: true`, `TRAINING_ELIGIBLE: false`, and `DISTILLATION_ELIGIBLE: false`.

Future normalization history and receipts include normalizer version/source hash, validator version/hash, and runtime commit. No final hash was assigned retroactively to R1.

Reasoning wrappers require one structurally paired `<think>` or `<analysis>` envelope. Mismatches, unclosed, nested/ambiguous wrappers, and multiple JSON candidates fail closed. Normalization remains syntax-only; schema and semantic validation remain external.

## Resume acceptance semantics

The explicit default is `KAD_VALIDATOR_SUFFICIENT`: `skip_consumption` does not silently alter KAD acceptance. A caller may set `CONTROLLER_CONSUMPTION_REQUIRED`; a skipped consumption then yields `DEGRADED` with `CONTROLLER_CONSUMPTION_REQUIRED`. No controller was called in this workpackage.

## Adversarial review and claim ledger

Checked: repair usage visibility; inherited-vs-incremental separation; UNKNOWN preservation; duplicate receipt replay; raw reasoning exclusion; code provenance; mismatched tags; and skip-consumption semantics. These checks are represented by `tools/kad/test/tokenmax-r2-preflight.test.mjs` (T1–T16).

Claims are limited to deterministic fixture behavior. This does not claim Qwen reliability or R1 acceptance.

## Regression results

Corrective + normalizer tests: **32 passed, 0 failed**. Economic receipt tests: **25 passed, 0 failed**. Syntax checks passed. Full repository regression: `make test` PASS; PRIME validation and Librarian verification PASS. All KAD tests (`node --test tools/kad/test/*.test.mjs`) passed: **209 passed, 0 failed**, including the real Pi integration suite (6 tests).

Remaining limitation: raw bytes are hash-only, so exact replay of the original output is impossible; the next experiment must rely on the hash and sanitized envelope.

Authorized next recommendation: run exactly one local-only `TOKENMAX-LIVE-001-R2` recovery using frozen upstream artifacts, final committed instrumentation, raw-output hashing enabled, and zero new remote controller calls.
