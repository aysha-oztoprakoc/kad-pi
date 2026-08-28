# Regression results

| Gate | Result |
|---|---|
| `node --test tools/kad/test/*.test.mjs` | PASS — 78/78 |
| `node --test tools/librarian/test/librarian.test.mjs` | PASS — 11/11 |
| `python3 validate_prime_directive.py` | PASS — 1478 estimated tokens / 1500 budget |
| Changed JavaScript `node --check` set | PASS |
| OMP catalog resolution for `kad-local-qwen/qwen-local` | PASS |
| Canonical swarm receipt replay | PASS |
| Live preflight during worker run | READY |
| Live preflight after owned-worker teardown | DEGRADED only for disposed retrieval; WORLD remains available |

The post-teardown preflight exit code is 2 by design for DEGRADED state, not a regression failure.
