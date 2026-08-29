# Regression results

- Baseline HEAD verified: `081e442`.
- Targeted resource/compiler suite: **40/40 PASS** (`context-compiler.test.mjs`, `resource-contract.test.mjs`).
- Full KAD suite at replay: **255 PASS, 2 pre-existing/flaky failures** (provider quota timestamp replay and the historical T2 error-code expectation before the conservative prompt bound correction); no inference was run.
- `git diff --check`: PASS.
- Zero-inference ledger: controller calls 0, Qwen calls 0, Stheno calls 0, local generation 0.
