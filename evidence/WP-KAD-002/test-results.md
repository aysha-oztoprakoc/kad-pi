# WP-KAD-002 Test Results

**Date:** 2026-08-28  
**Test Suite:** [`tools/kad/test/world-turn.test.mjs`](file:///home/amdy/Work/tools/kad/test/world-turn.test.mjs)  

---

## 1. Test Summary

```text
▶ WP-KAD-002 End-to-End World Transition Vertical Slice
  ✔ T1 — Accepted Command: natural language translates to CandidateIntent, Accepted, and mutates state (4.30ms)
  ✔ T2 — Unsupported Action: safely rejected and leaves GameState strictly invariant (2.41ms)
  ✔ T3 — Authority Leak Attempt: smuggled properties are rejected by Validator (3.70ms)
  ✔ T4 — Malformed CandidateIntent: missing verbs and multi-targets are rejected (3.59ms)
  ✔ T5 — Deterministic Replay & Injectable Identifiers: identical state/intent produces identical resolutions (3.79ms)
  ✔ T6 — Journal Completeness: all required causal fields and hashes are preserved on disk (6.74ms)
  ✔ T7 — Domain Invariant & Unsuccessful Attempt Semantics (3.43ms)
  ✔ FI-1 — Failure Injection: Engine Executor Failure Before Commit (0.34ms)
  ✔ FI-2 — Failure Injection: Journal Append Failure Prevents External State Commit (NO JOURNAL -> NO COMMIT) (1.92ms)
  ✔ T8 — Pi Session Adapter Contract Simulation & Teardown Silence (SIMULATED) (1.98ms)
✔ WP-KAD-002 End-to-End World Transition Vertical Slice (33.71ms)
ℹ tests 11 | pass 11 | fail 0
```

---

## 2. Regression Summary

| Regression Suite | Commands | Results | Status |
|---|---|---|---|
| Prime Directive Constitution Check | `python3 validate_prime_directive.py` | 1478 <= 1500 tokens | **PASS** |
| Librarian Knowledge Base Verifier | `node tools/librarian/librarian.mjs verify` | 23 docs, 22 cards, 16 concepts | **PASS** |
| Librarian Test Suite | `node --test tools/librarian/test/librarian.test.mjs` | 11/11 passed | **PASS** |
| Capability Contract Tests | `node --test .agents/capabilities/ask_user/contract_test.mjs` | 1/1 passed (T1-T6) | **PASS** |
| C++20 Simulation Core Tests | `cd kad-lab && make test` | 14/14 evidence cases | **PASS** |
| WP-KAD-002 E2E Suite | `node --test tools/kad/test/world-turn.test.mjs` | 11/11 passed | **PASS** |
