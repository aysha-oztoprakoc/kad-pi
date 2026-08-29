# Regression results

- New microtask router tests: **40/40 PASS**.
- Full KAD test suite (`node --test tools/kad/test/*.test.mjs`): **299/299 PASS**.
- Root `make test`: PASS (PRIME validation, Librarian verify/tests 11/11, ask_user contract, kad-lab 14/14, world-turn 11/11, multi-turn PON 8/8, local-router 7/7).
- `python3 validate_prime_directive.py`: PASS.
- Librarian verification: PASS (25 documents, 24 cards, 16 concepts).
- `git diff --check`: PASS; changed-module syntax checks: PASS.
- Prior context compiler/resource tests were green before this package: **40/40 PASS**.
- No Qwen inference, no Stheno inference, no controller/remote inference, no PAYG call.
- `make test-pi-integration` was not run because its real-world lane would violate this package's zero-inference contract; the real Pi integration tests included in the full KAD suite passed.
