# WP-KAD-TOKENMAX-002 regression results

| Gate | Command | Result |
|---|---|---:|
| Accepted-work economics | `node --test tools/kad/test/accepted-work-economics.test.mjs` | 25/25 pass |
| Full KAD suite | `node --test tools/kad/test/*.test.mjs` | 177/177 pass |
| Real Pi integration | `node --test tools/kad/test/pi-real-persistent.integration.test.mjs` | 7/7 pass |
| Librarian | `node --test tools/librarian/test/librarian.test.mjs` | 11/11 pass |
| PRIME directive | `python3 validate_prime_directive.py` | pass; 1,478 estimated tokens <= 1,500 |
| Diff hygiene | `git diff --check` | pass |
| Syntax | `node --check` on changed modules | pass |
| Secret scan | evidence and probe output scan | no matches; exit 1 as expected |

Full KAD and real Pi invocations were run without masking failures. Existing swarm, quota, deterministic, authority, replay, and spend-safety regressions remained green.
