# Regression results

| Gate | Result |
|---|---:|
| accepted-work economics (`node --test tools/kad/test/accepted-work-economics.test.mjs`) | 25/25 pass |
| full KAD (`node --test tools/kad/test/*.test.mjs`) | 177/177 pass |
| real Pi integration | 7/7 pass |
| Librarian | 11/11 pass |
| PRIME directive | PASS; 1478 estimated tokens <= 1500 |
| `git diff --check` | PASS |
| changed-module syntax checks | PASS |

These gates were green before the canonical live call. No core implementation change was made for the live failure; the failure was deterministic local-worker output rejection after the accepted one-repair bound.
