# WP-KAD-OMP-002 Regression Results

- `python3 validate_prime_directive.py` — PASS (1478-token budget check).
- `node --test tools/kad/test/*.test.mjs` — PASS, 53 tests.
- `node --test tools/kad/test/omp-orchestration-preflight.test.mjs` — PASS, 7 tests (T1–T7).
- `make -C kad-lab test` — PASS, 14/14 evidence cases.
- `node tools/librarian/librarian.mjs verify` — PASS, 25 documents / 24 cards / 16 concepts.
- `node --test tools/librarian/test/librarian.test.mjs` — PASS, 11 tests.
- `pi --version` — `0.84.3`.
- `./bin/omp-kad --version` — `omp/18.0.9`.
- `node --check tools/kad/omp-orchestration-preflight.mjs` — PASS.
- `git diff --check` — PASS.

The live preflight receipt is `DEGRADED`, solely because Qwen is not the loaded model and the active Stheno process is external. No lifecycle mutation was performed.
