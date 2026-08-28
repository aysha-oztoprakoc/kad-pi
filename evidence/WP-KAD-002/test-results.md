# WP-KAD-002 Test Results

**Date:** 2026-08-28  
**Test Suite:** [`tools/kad/test/world-turn.test.mjs`](file:///home/amdy/Work/tools/kad/test/world-turn.test.mjs)  

---

## 1. Test Summary

```text
▶ WP-KAD-002 End-to-End World Transition Vertical Slice
  ✔ T1 — Accepted Command: natural language translates to CandidateIntent, Accepted, and mutates state (4.12ms)
  ✔ T2 — Unsupported Action: safely rejected and leaves GameState strictly invariant (2.55ms)
  ✔ T3 — Authority Leak Attempt: smuggled properties are rejected by Validator (3.82ms)
  ✔ T4 — Malformed CandidateIntent: missing verbs and multi-targets are rejected (3.51ms)
  ✔ T5 — Deterministic Replay: identical state and intent produce bit-for-bit identical resolutions (3.64ms)
  ✔ T6 — Journal Completeness: all required causal fields and hashes are preserved on disk (4.01ms)
  ✔ T7 — Post-Failure State Integrity: failure injection maintains state invariance (3.40ms)
  ✔ T8 — Pi Session Adapter Integration & Teardown Silence (1.73ms)
✔ WP-KAD-002 End-to-End World Transition Vertical Slice (28.17ms)
ℹ tests 9 | pass 9 | fail 0
```

---

## 2. Regression Summary

| Regression Suite | Commands | Results | Status |
|---|---|---|---|
| Prime Directive Constitution Check | `python3 validate_prime_directive.py` | 1478 <= 1500 tokens | **PASS** |
| Librarian Knowledge Base Verifier | `node tools/librarian/librarian.mjs verify` | 22 docs, 21 cards, 16 concepts | **PASS** |
| Librarian Test Suite | `node --test tools/librarian/test/librarian.test.mjs` | 11/11 passed | **PASS** |
| Capability Contract Tests | `node --test .agents/capabilities/ask_user/contract_test.mjs` | 1/1 passed (T1-T6) | **PASS** |
| C++20 Simulation Core Tests | `cd kad-lab && make test` | 14/14 evidence cases | **PASS** |
| WP-KAD-002 E2E Suite | `node --test tools/kad/test/world-turn.test.mjs` | 9/9 passed | **PASS** |
