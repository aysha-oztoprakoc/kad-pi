# Regression results

| Gate | Command | Result |
|---|---|---:|
| Resolver TDD | `node --test tools/kad/test/sdk-resolver.test.mjs` | 14/14 pass |
| Real Pi integration | `node --test tools/kad/test/pi-real-persistent.integration.test.mjs` | 7/7 pass |
| Full KAD suite | `node --test tools/kad/test/*.test.mjs` | 130/130 pass |
| Syntax | `node --check` on resolver, loader, bootstrapper | pass |
| Bootstrap repeat | `node tools/kad/pi/bootstrap-sdk.mjs --offline` | identical `already-verified` receipt |

The full KAD suite was executed without masking failures. The expected injected PON failure message in PI-F3 was observed, and its test passed.

Existing deterministic economic, quota, swarm, replay, spend-safety, lifecycle, PRIME, and Librarian regressions were included in the full suite and remained green. No PAYG, auto-topup, provider, credential, Stheno, or unrelated-work changes were made.
