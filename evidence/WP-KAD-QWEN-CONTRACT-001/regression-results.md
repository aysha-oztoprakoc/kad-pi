# Regression results

- `node --test tools/kad/test/resource-contract.test.mjs`: PASS, 16 tests.
- `node --test tools/kad/test/*.test.mjs`: PASS, 225 tests.
- `make test`: PASS.
- `git diff --check`: PASS.
- Changed-module syntax: `node -c tools/kad/resource-contract.mjs tools/kad/swarm.mjs tools/kad/test/resource-contract.test.mjs`: PASS.
- PRIME: `python3 validate_prime_directive.py`: PASS.
- Librarian: `node tools/librarian/librarian.mjs verify`: PASS.
- Real Pi integration included in KAD suite: PASS (`pi-real-persistent.integration.test.mjs`, simulated/no model inference).
- No live Qwen, Stheno, or remote controller inference was run. The only Pi model-path execution used a local OpenAI-compatible HTTP fixture returning SSE `READY`.
