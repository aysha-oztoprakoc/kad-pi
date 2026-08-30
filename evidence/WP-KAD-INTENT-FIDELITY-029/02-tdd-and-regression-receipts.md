# TDD Regression Receipts & Failure Fixtures (WP-029)

**Workpackage ID**: `WP-KAD-INTENT-FIDELITY-029`  
**Test Runner**: Node.js Test Runner (`node --test`)  
**Test File**: `tools/kad/test/intent-fidelity.test.mjs`  
**Date**: 2026-08-30  
**Verdict**: **`PASS (19/19 Tests Green, 100%)`**  

---

## 1. Regression Fixture Test Matrix (T01 - T18)

| Fixture ID | Invariant / Failure Mode Tested | Expected Behavior | Observed Result |
|---|---|---|---|
| **T01** | Valid `DEC_ID_01` event and normalization | `PASS` | `PASS` (1.09ms) |
| **T02** | Invalid decision ID format (`DEC-01`, `DEC_ID_1`, `dec_01`) | `FAIL` (Rejected by regex) | `PASS` (0.40ms) |
| **T03** | Raw option label modified during normalization | `FAIL` (Source immutable / Hash mismatch) | `PASS` (0.17ms) |
| **T04** | Raw human note modified in event payload | `FAIL` (Record hash mismatch) | `PASS` (0.18ms) |
| **T05** | Offered option omitted from captured event | `FAIL` (Options array required) | `PASS` (0.16ms) |
| **T06** | Option ordering changed in event payload | `FAIL` (Deterministic hash mismatch) | `PASS` (0.16ms) |
| **T07** | Recommended/default metadata lost | `FAIL` (Record hash mismatch) | `PASS` (0.16ms) |
| **T08** | Normalized model text tagged `AUTHOR_DECLARED` | `FAIL` (Forbidden epistemic class) | `PASS` (0.10ms) |
| **T09** | Valid `DERIVED_FROM_AUTHOR_DECLARED` normalization | `PASS` | `PASS` (0.14ms) |
| **T10** | Duplicate decision event without explicit supersession link | `FAIL` (Rejected by journal validator)| `PASS` (0.40ms) |
| **T11** | Missing source event hash in normalization | `FAIL` (Hash required) | `PASS` (0.10ms) |
| **T12** | Normalization references unknown event hash | `FAIL` (Referential integrity check) | `PASS` (0.10ms) |
| **T13** | `actor.project_lead` confused with `host.amdy.workstation` | `FAIL` (Namespace violation) | `PASS` (0.18ms) |
| **T14** | Previously accepted raw event silently rewritten | `FAIL` (Journal hash verification) | `PASS` (0.50ms) |
| **T15** | Generated report diverges from typed source | `FAIL` (Verifier detects drift) | `PASS` (0.37ms) |
| **T16** | Valid successor event explicitly superseding earlier decision | `PASS` (Supersession graph valid) | `PASS` (0.20ms) |
| **T17** | Missing raw source fields marked `UNKNOWN`/`RECONSTRUCTED` | `PASS` | `PASS` (0.14ms) |
| **T18** | Reconstructed data falsely labeled verbatim/raw | `FAIL` (Source consistency check) | `PASS` (0.12ms) |

---

## 2. Test Execution Output

```text
▶ WP-KAD-INTENT-FIDELITY-029: TDD Regression & Invariant Suite
  ✔ T01: valid DEC_ID_01 event and normalization -> PASS (1.094438ms)
  ✔ T02: invalid decision ID format -> FAIL (0.399757ms)
  ✔ T03: raw option label modified during normalization -> source remains unchanged / misuse FAIL (0.166218ms)
  ✔ T04: raw human note modified -> FAIL (hash verification) (0.180045ms)
  ✔ T05: offered option omitted from captured event -> FAIL when source proves complete set (0.160037ms)
  ✔ T06: option ordering changed -> FAIL (deterministic hash mismatch) (0.16144ms)
  ✔ T07: recommended/default metadata lost -> FAIL when present in source (0.155388ms)
  ✔ T08: normalized model text tagged AUTHOR_DECLARED -> FAIL (0.104521ms)
  ✔ T09: DERIVED_FROM_AUTHOR_DECLARED normalization -> PASS (0.138817ms)
  ✔ T10: duplicate decision event without explicit revision/supersession -> FAIL (0.404185ms)
  ✔ T11: missing source event hash in normalization -> FAIL (0.098519ms)
  ✔ T12: normalization references unknown event hash -> FAIL (0.099882ms)
  ✔ T13: actor.project_lead confused with host.amdy.workstation -> FAIL (0.179635ms)
  ✔ T14: previously accepted raw event silently rewritten -> FAIL (journal hash chain verification) (0.504768ms)
  ✔ T15: generated report diverges from typed source -> FAIL (verify report) (0.369639ms)
  ✔ T16: valid successor event explicitly superseding earlier decision -> PASS (0.195535ms)
  ✔ T17: missing raw source fields marked UNKNOWN/RECONSTRUCTED rather than fabricated -> PASS (0.144006ms)
  ✔ T18: reconstructed data falsely labeled verbatim/raw -> FAIL (0.122796ms)
✔ WP-KAD-INTENT-FIDELITY-029: TDD Regression & Invariant Suite (6.330128ms)
ℹ tests 19
ℹ pass 19
ℹ fail 0
```
