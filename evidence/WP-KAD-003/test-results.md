# WP-KAD-003 Test Results

**Date:** 2026-08-28  
**Test Suite:** [`tools/kad/test/multi-turn-pon.test.mjs`](file:///home/amdy/Work/tools/kad/test/multi-turn-pon.test.mjs)  

---

## 1. Test Summary

```text
▶ WP-KAD-003 Persistent Multi-Turn World + PON Causal Reaction Graph
  ✔ Lane A & B — Multi-turn persistent state continuity (turn N state_after == turn N+1 state_before) (10.22ms)
  ✔ Lane C — PON Selective Premise Evaluation (Evaluates affected premises ONLY; never scans all rules) (0.20ms)
  ✔ Lane D — STC Lifecycle Ownership & Reverse Order Teardown (LIFO) (0.51ms)
  ✔ Lane E — Deterministic Multi-Turn Journal Replay (14.23ms)
  ✔ Lane F — Evidence Dataset Generation (5.34ms)
  ✔ Lane G — Pi SDK Session Persistent Adapter & Teardown Silence (SIMULATED) (6.34ms)
  ✔ Lane H — Adversarial Attacks & Resilience (0.65ms)
✔ WP-KAD-003 Persistent Multi-Turn World + PON Causal Reaction Graph (39.06ms)
ℹ tests 8 | pass 8 | fail 0
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
| WP-KAD-003 Multi-Turn PON Suite | `node --test tools/kad/test/multi-turn-pon.test.mjs` | 8/8 passed | **PASS** |
