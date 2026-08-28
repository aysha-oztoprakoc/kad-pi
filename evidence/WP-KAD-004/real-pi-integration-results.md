# WP-KAD-004 Real Pi Integration Test Results

**Date:** 2026-08-28  
**SDK Package:** `@earendil-works/pi-coding-agent` v0.84.3  
**Reality Level:** `INTEGRATION`  
**Test Command:** `KAD_PI_SDK_ROOT=/tmp/wp-kad-001-sdk/runtime node --test tools/kad/test/pi-real-persistent.integration.test.mjs`  

---

## 1. Test Execution Summary

```text
▶ WP-KAD-004 Real Pi Harness Persistent World Runtime (INTEGRATION)
  ✔ 1. Provenance & Fail-Closed Provider Isolation Verification (411.21ms)
  ✔ 2. Sequential Real Pi Steer Multi-Turn Persistent State Continuity (38.47ms)
  ✔ 3. Real Failure Test PI-F1: Irrelevant SDK Event Rejected Early (21.21ms)
  ✔ 4. Real Failure Test PI-F2: Deterministic Rejection Through Real Pi Steer (26.96ms)
  ✔ 5. Real Failure Test PI-F3: PON Rule Failure Handled Without Session Disruption (19.15ms)
  ✔ 6. Real Failure Test PI-F4: Journal Commit Failure Prevents State Advance (NO JOURNAL -> NO COMMIT) (26.89ms)
✔ WP-KAD-004 Real Pi Harness Persistent World Runtime (INTEGRATION) (545.30ms)
ℹ tests 7 | pass 7 | fail 0
```

---

## 2. Quantitative Verification Metrics

| Metric | Target | Observed Value | Status |
|---|---|---|---|
| SDK Package Identity | `@earendil-works/pi-coding-agent` | `@earendil-works/pi-coding-agent` | **PASS** |
| SDK Version | `0.84.3` | `0.84.3` | **PASS** |
| Provider / Network Invocations | `0` | `0` | **PASS** |
| Agent Stream Provider Calls | `0` | `0` | **PASS** |
| Multi-turn Steer Commands | `>= 3` | `3` (`acquire key`, `move room_b`, `move room_a`) | **PASS** |
| State Continuity | `Turn N after == Turn N+1 before` | Verified on all turns | **PASS** |
| PON Affected Rule Evaluation | `>= 1` | `1` (`rule-keycard-alarm`) | **PASS** |
| PON Unaffected Rule Evaluation | `0` | `0` (`rule-crate-sensor` skipped) | **PASS** |
| Real SDK Unsubscribe Calls | `1` | `1` | **PASS** |
| Post-Dispose Turn Invocations | `0` | `0` | **PASS** |
| Transaction Policy (PI-F4) | `NO JOURNAL -> NO COMMIT` | Verified: world state did NOT advance | **PASS** |
