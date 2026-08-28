# Test results

- `node --test tools/kad/test/local-router.test.mjs`: PASS (3/3).
- `node tools/kad/pi/local-worker.mjs`: PASS; real Pi SDK session, localhost model, deterministic `READY` validation.
- `python3 validate_prime_directive.py`: PASS.
- `node tools/librarian/librarian.mjs verify`: PASS (25 documents, 24 cards, 16 concepts).
- Existing KAD/Librarian baseline tests: PASS (30 tests).

Reality labels: local worker is `INTEGRATION`; hardware/model inventory is `LIVE_OBSERVED`; TELL is unavailable.
