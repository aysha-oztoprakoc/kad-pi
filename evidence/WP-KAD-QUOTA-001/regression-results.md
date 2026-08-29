# Regression results

- New provider quota adapter tests: **17/17 PASS**.
- Existing relevant KAD test suite excluding the unavailable provenance fixture: **109/109 PASS**.
- Prior accepted WP-KAD-SWARM-001 integration evidence: **7/7 PASS**; current rerun was not possible because `/tmp/wp-kad-001-sdk/runtime` is absent, and no SDK was downloaded or fabricated.
- Librarian tests: **11/11 PASS**.
- `python3 validate_prime_directive.py`: **PASS**, 1478 estimated tokens within 1500.
- JavaScript syntax checks: **PASS**.
- JSON/config parsing: **PASS**.
- Economic routing and normalized-observation replay: **PASS**.
- Secret-redaction receipt: **PASS**.
- Full `node --test tools/kad/test/*.test.mjs` invocation was attempted and failed only in the 7 existing WP-KAD-004 tests due the missing external provenance SDK fixture; this is recorded as an environment limitation, not masked.
