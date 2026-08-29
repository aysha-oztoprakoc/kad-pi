# Regression results

| Gate | Result |
|---|---:|
| output normalizer/recovery tests | 21/21 pass |
| full KAD suite | 198/198 pass |
| real Pi integration | 7/7 pass |
| Librarian | 11/11 pass |
| PRIME directive | PASS; 1478 estimated tokens <= 1500 |
| `git diff --check` | PASS |
| changed-module syntax checks | PASS |

The mandatory pre-live gates were green before the single R1 live recovery. The final post-change suite remained green after the allowlist hardening test was added.
