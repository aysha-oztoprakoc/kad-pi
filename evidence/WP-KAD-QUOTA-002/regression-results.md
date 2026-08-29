# WP-KAD-QUOTA-002 regression results

| Gate | Command | Result |
|---|---|---:|
| Multi-window/provider tests | `node --test tools/kad/test/quota-windows.test.mjs` | 22/22 pass |
| Prior quota/economic tests | `node --test tools/kad/test/provider-quota-adapter.test.mjs tools/kad/test/economic-router.test.mjs` | 38/38 pass |
| Full KAD suite | `node --test tools/kad/test/*.test.mjs` | 152/152 pass |
| Real Pi integration | `node --test tools/kad/test/pi-real-persistent.integration.test.mjs` | 7/7 pass |
| Librarian | `node --test tools/librarian/test/librarian.test.mjs` | 11/11 pass |
| PRIME directive | `python3 validate_prime_directive.py` | pass; 1,478 estimated tokens <= 1,500 |
| Diff hygiene | `git diff --check` | pass |
| Changed-module syntax | `node --check` on changed `.mjs` files | pass |

The full suite and real integration commands were run without masking failures. PI-F3's intentionally injected PON error remains expected negative evidence; its test passed.
