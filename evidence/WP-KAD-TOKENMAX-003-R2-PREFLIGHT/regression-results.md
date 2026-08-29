# Regression results

- `node --test tools/kad/test/tokenmax-r2-preflight.test.mjs tools/kad/test/qwen-output-normalizer.test.mjs`: 32 passed, 0 failed
- `node --test tools/kad/test/accepted-work-economics.test.mjs`: 25 passed, 0 failed
- `node --check tools/kad/swarm.mjs`: PASS
- `node --check tools/kad/test/tokenmax-r2-preflight.test.mjs`: PASS
- Live inference: NOT RUN
- `make test`: PASS (PRIME and Librarian included)
- `node --test tools/kad/test/*.test.mjs`: 209 passed, 0 failed (real Pi integration included)
- `git diff --check`: PASS
