# Regression results

- Runtime inspection tests: `node --test tools/kad/test/runtime-resource-inspection.test.mjs` — PASS, 10 tests.
- Resource-contract + runtime + accounting/normalizer subset: PASS, 72 tests.
- Full KAD: `node --test tools/kad/test/*.test.mjs` — PASS, 235 tests.
- `make test` — PASS.
- PRIME: `python3 validate_prime_directive.py` — PASS.
- Librarian: `node tools/librarian/librarian.mjs verify` — PASS, 25 documents / 24 cards / 16 concepts.
- Real Pi integration: included in full KAD, PASS.
- `git diff --check` — PASS.
- Syntax: `node -c tools/kad/runtime-resource-inspection.mjs` and test file — PASS.

No Qwen/Stheno/controller inference was run.
