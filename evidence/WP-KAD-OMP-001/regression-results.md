# Regression results

| Command | Result |
|---|---|
| `python3 validate_prime_directive.py` | PASS |
| `node --test tools/kad/test/local-router.test.mjs` | PASS, 7/7 |
| `node --test tools/kad/test/kad-evidence-gate-skill.test.mjs` | PASS, 1/1 |
| `node --test tools/kad/test/*.test.mjs` | PASS, 46/46 |
| `make test` | PASS |
| `make -C kad-lab test` | PASS, 14/14 |
| `pi --version` | `0.84.3` |
| `bin/omp-kad --version` | `omp/18.0.9` |

The full repository gate was not run because the pre-existing dirty worktree contains unrelated untracked implementation and this WP did not alter those files. The listed repository-appropriate baseline gates were run without staging or reverting pre-existing work.
